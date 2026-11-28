import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import {
  CognitiveProjectionStore,
  DurableEventSink,
  installCognitionV2,
} from "../apps/server/src/engine/cognition/v2/storage.ts";
import { ContextServingFacade } from "../apps/server/src/engine/cognition/v2/context.ts";
import { FiveMemories } from "../apps/server/src/engine/cognition/v2/memory.ts";
import { InferenceLane } from "../apps/server/src/engine/cognition/v2/inference.ts";
import { record } from "./fixtures/cognition-v2/record.ts";
const identity = { tenantId: "A", owner: "alice", actorId: "alice", purpose: "chat" as const, policyRevision: "1" };

test("direct projection writes invalidate prepared context and larger budgets receive a fresh snapshot", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const store = new CognitiveProjectionStore(db),
      context = new ContextServingFacade(store, { authorize: async () => true });
    await store.apply(record("A", "alice", "alpha"), "1");
    const first = await context.prepared(identity, "", 4000, 10);
    await store.apply(record("A", "alice", "beta"), "2");
    const next = await context.prepared(identity, "", 4000, 10);
    assert.notEqual(first.id, next.id);
    assert.equal(next.refs.length, 2);
    const small = await context.prepared(identity, "budget", 64, 1);
    const large = await context.prepared(identity, "budget", 4000, 10);
    assert.equal(small.refs.length, 0);
    assert.equal(large.refs.length, 2);
    assert.notEqual(small.id, large.id);
    const latest = store.latest.bind(store);
    store.latest = async (...args) => {
      const rows = await latest(...args);
      await store.apply(record("A", "alice", "gamma"), "3");
      return rows;
    };
    await assert.rejects(
      () => context.getSnapshot(identity, { query: "", maxTokens: 4000, maxRefs: 10 }),
      /CONTEXT_CHANGED_RETRY/,
    );
  } finally {
    await db.close();
  }
});

test("autobiographical revision changes generate a distinct id while replay stays idempotent", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const store = new CognitiveProjectionStore(db),
      context = new ContextServingFacade(store, { authorize: async () => true });
    const memory = new FiveMemories(context, new DurableEventSink(db, db, new Set(["A"])));
    const item = { ...record(), kind: "memory" as const, memoryKind: "episodic" as const };
    await store.apply(item, "1");
    const first = await memory.autobiographical(identity, [item.id]);
    assert.deepEqual(await memory.autobiographical(identity, [item.id]), first);
    await store.apply({ ...item, revision: 2, body: "Corrected" }, "2");
    assert.notEqual((await memory.autobiographical(identity, [item.id])).id, first.id);
  } finally {
    await db.close();
  }
});

test("an open circuit spends no additional inference quota and cancellation stays neutral", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const lane = new InferenceLane(db, "fast", 4, 1000, 20);
    let calls = 0;
    const fail = async () => {
      calls++;
      throw Error("offline");
    };
    for (let i = 0; i < 4; i++) await assert.rejects(() => lane.run("A", fail), /offline/);
    const cancellation = new AbortController();
    await assert.rejects(
      () =>
        lane.run(
          "A",
          async () => {
            queueMicrotask(() => cancellation.abort());
            return new Promise(() => {});
          },
          cancellation.signal,
        ),
      /INFERENCE_CANCELLED/,
    );
    await assert.rejects(() => lane.run("A", fail), /offline/);
    for (let i = 0; i < 3; i++) await assert.rejects(() => lane.run("A", fail), { code: "circuit_open" });
    const [usage] = await db.rawQuery<{ calls: number }>("SELECT calls FROM cognition_v2_lane_usage WHERE tenant='A'");
    assert.equal(Number(usage.calls), 6);
    assert.equal(calls, 5);
    const disabled = new InferenceLane(db, "slow", 1, 1000, 0);
    await assert.rejects(
      () =>
        disabled.run("A", async () => {
          calls++;
        }),
      /LANE_BUDGET_EXHAUSTED/,
    );
    assert.equal(calls, 5);
  } finally {
    await db.close();
  }
});

test("snapshot reads reject forged rendered content even with a recomputed digest", async () => {
  const { digest } = await import("../apps/server/src/engine/cognition/v2/storage.ts");
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const store = new CognitiveProjectionStore(db),
      context = new ContextServingFacade(store, { authorize: async () => true });
    await store.apply(record(), "1");
    const snapshot = await context.getSnapshot(identity, { query: "", maxTokens: 4000, maxRefs: 10 });
    assert.ok(await context.readSnapshot(identity, snapshot.id));
    snapshot.segments[0].text = "forged";
    snapshot.segments[0].tokens = 6;
    snapshot.usedTokens = 6;
    const { id, schemaVersion, createdAt, expiresAt, truncated, digest: oldDigest, ...content } = snapshot;
    snapshot.digest = digest(content);
    await db.rawQuery("UPDATE cognition_v2_snapshots SET data=$3::jsonb WHERE tenant=$1 AND id=$2", [
      identity.tenantId,
      snapshot.id,
      JSON.stringify(snapshot),
    ]);
    assert.equal(await context.readSnapshot(identity, snapshot.id), null);
  } finally {
    await db.close();
  }
});

test("query matches are selected before the candidate limit", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const store = new CognitiveProjectionStore(db),
      context = new ContextServingFacade(store, { authorize: async () => true });
    for (let i = 0; i < 12; i++) await store.apply(record("A", "alice", `a-${i}`), String(i + 1));
    await store.apply({ ...record("A", "alice", "z-anchor"), body: "conciliación aprobada" }, "13");
    const snapshot = await context.getSnapshot(identity, { query: "conciliación", maxTokens: 4000, maxRefs: 1 });
    assert.equal(snapshot.refs[0].id, "z-anchor");
  } finally {
    await db.close();
  }
});

test("graph traversal emits unique current-revision edges", async () => {
  const { CognitiveProjector } = await import("../apps/server/src/engine/cognition/v2/projector.ts");
  const { CognitiveGraphQuery } = await import("../apps/server/src/engine/cognition/v2/graph.ts");
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const store = new CognitiveProjectionStore(db),
      context = new ContextServingFacade(store, { authorize: async () => true });
    const projector = new CognitiveProjector(store),
      graph = new CognitiveGraphQuery(context);
    let sequence = 0;
    async function publish(id: string, revision: number, parent?: string) {
      const item = { ...record("A", "alice", id), revision };
      if (parent) item.evidence = [{ tenantId: "A", kind: "card", id: parent, revision: 1 }];
      await projector.apply(
        {
          id: `event-${++sequence}`,
          schemaVersion: "1.0",
          type: "cognition.v2.record.proposed",
          tenantId: "A",
          owner: "alice",
          source: { kind: "system", id: "test" },
          emittedAt: item.createdAt,
          payload: { record: item },
        },
        String(sequence),
      );
    }
    await publish("alpha", 1);
    await publish("beta", 1);
    await publish("root", 1, "alpha");
    assert.equal((await graph.neighbors(identity, "root", 2))?.edges.length, 1);
    await publish("root", 2, "beta");
    assert.deepEqual((await graph.neighbors(identity, "root", 1))?.nodes.map((n) => n.id).sort(), ["beta", "root"]);
  } finally {
    await db.close();
  }
});
