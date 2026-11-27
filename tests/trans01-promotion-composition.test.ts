import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { AgentService } from "../apps/server/src/engine/service.ts";
import { RagService } from "../apps/server/src/engine/rag.ts";
import { MemoryService } from "../apps/server/src/engine/memory.ts";
import { thoughtSchema } from "../apps/server/src/kernel/graph/thought.ts";

const ctx = { tenantId: "a", owner: "owner", actorId: "actor", role: "user" as const, requestId: "fixture-request" };
const thought = thoughtSchema.parse({
  id: "thought-1",
  tenantId: "a",
  owner: "owner",
  turnId: "turn",
  role: "observation",
  actor: { kind: "worker", id: "worker" },
  content: "Synthetic observation",
  attention: {
    id: "att",
    author: "worker",
    primary: "entity:a",
    secondary: [],
    query: "a",
    matched: [],
    ignored: [],
    intent: "observe",
    confidence: 0.5,
    scope: "turn",
    timestamp: "2026-11-26T00:00:00Z",
    metadata: {},
  },
  provenance: { source: "fixture", timestamp: "2026-11-26T00:00:00Z" },
});

test("promotion memory receipt and curated memory commit together and replay once", async () => {
  const db = await createStore();
  try {
    let writes = 0,
      graphWrites = 0;
    const memory = new MemoryService(db, new RagService(db));
    const remember = memory.remember.bind(memory);
    memory.remember = async (...args) => {
      writes++;
      return remember(...args);
    };
    const service = {
      db,
      memory,
      kernel: { thoughtsOf: async () => [thought] },
      graph: {
        createEntity: async () => {
          graphWrites++;
        },
      },
    } as unknown as AgentService;
    const persist = () =>
      AgentService.prototype.persistPromotionDestinations.call(
        service,
        "owner",
        ctx,
        "turn",
        { memory: [thought.id, thought.id], businessGraph: [thought.id] },
        "fixture",
      );
    await Promise.all([persist(), persist()]);
    assert.equal(writes, 1);
    assert.equal(graphWrites, 0);
    assert.equal((await db.list("owner", "memories")).length, 1);
    assert.equal((await db.get("owner", "kernel-promotion-receipts", thought.id))?.state, "memory_stored");
  } finally {
    await db.close();
  }
});

test("failed memory publication rolls back its receipt and permits a safe retry", async () => {
  const db = await createStore();
  try {
    let fail = true;
    const memory = new MemoryService(db, new RagService(db));
    const remember = memory.remember.bind(memory);
    memory.remember = async (...args) => {
      if (fail) throw Error("synthetic failure");
      return remember(...args);
    };
    const service = { db, memory, kernel: { thoughtsOf: async () => [thought] } } as unknown as AgentService;
    const persist = () =>
      AgentService.prototype.persistPromotionDestinations.call(
        service,
        "owner",
        ctx,
        "turn",
        { memory: [thought.id] },
        "fixture",
      );
    await persist();
    assert.equal(await db.get("owner", "kernel-promotion-receipts", thought.id), null);
    fail = false;
    await persist();
    assert.equal((await db.list("owner", "memories")).length, 1);
  } finally {
    await db.close();
  }
});

test("oversize and wrong-scope thoughts cannot publish a truncated or foreign memory", async () => {
  const db = await createStore();
  try {
    let writes = 0;
    const rows = [
      { ...thought, content: "x".repeat(501) },
      { ...thought, id: "foreign", tenantId: "b" },
    ];
    const service = {
      db,
      memory: {
        remember: async () => {
          writes++;
        },
      },
      kernel: { thoughtsOf: async () => rows },
    } as unknown as AgentService;
    await AgentService.prototype.persistPromotionDestinations.call(
      service,
      "owner",
      ctx,
      "turn",
      { memory: rows.map((row) => row.id) },
      "fixture",
    );
    assert.equal(writes, 0);
    assert.equal((await db.get("owner", "kernel-promotion-receipts", thought.id))?.state, "deferred_oversize");
    assert.equal(await db.get("owner", "kernel-promotion-receipts", "foreign"), null);
  } finally {
    await db.close();
  }
});
