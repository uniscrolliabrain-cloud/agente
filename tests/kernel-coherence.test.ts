// KERNEL_COHERENCE_V1 - pruebas de los cruces que rompian la coherencia
// kernel/bus/tenant:
//   - el tenant del contexto manda en open/append/close;
//   - dos tenants con la misma dedupeKey no se suprimen;
//   - el bus resuelve el tenant real del owner;
//   - los consumidores reciben por tenant, no por una lista fija de owners;
//   - el subscriber del kernel construye un KernelContext valido (actorId).

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  InMemoryAuditStore,
  InMemoryTurnStore,
  Kernel,
  kernelContextSchema,
  type KernelContext,
} from "../apps/server/src/kernel/index.ts";
import { EventBus } from "../apps/server/src/engine/events/bus.ts";
import { globalSubscribers } from "../apps/server/src/engine/events/subscriber.ts";
import { startKernelEventSubscriber } from "../apps/server/src/kernel/subscribers/events.ts";
import { runCognitionCycle } from "../apps/server/src/kernel/cognition/cycle.ts";

function makeCtx(tenantId: string, owner = "u1"): KernelContext {
  return kernelContextSchema.parse({
    tenantId,
    owner,
    role: "user",
    requestId: `req-${owner}-${tenantId}`,
    actorId: owner,
  });
}

function makeKernel(
  store: InMemoryTurnStore,
  resolve: () => Promise<string> = async () => "t1",
  audit: InMemoryAuditStore = new InMemoryAuditStore(),
): Kernel {
  return new Kernel({
    store,
    tenants: { resolve },
    audit,
    config: { resolve: async () => ({ maxThoughtsPerTurn: 100 }) },
  } as never);
}

function attention(primary = "entity:acme") {
  return {
    id: `att-${Math.random().toString(36).slice(2)}`,
    author: "system" as const,
    primary,
    secondary: [] as string[],
    query: "consulta",
    matched: [
      { node: primary, weight: 1, reason: "explicit_reference" as const, metadata: {} },
    ],
    ignored: [] as Array<{ node: string; reason: string; metadata: Record<string, unknown> }>,
    intent: "observe",
    confidence: 1,
    scope: "turn" as const,
    timestamp: new Date().toISOString(),
    metadata: {},
  };
}

class MemoryStore {
  private readonly rows = new Map<string, Map<string, unknown>>();

  private bucket(owner: string, kind: string): Map<string, unknown> {
    const key = `${owner}\u0000${kind}`;
    let bucket = this.rows.get(key);
    if (!bucket) {
      bucket = new Map();
      this.rows.set(key, bucket);
    }
    return bucket;
  }

  async insertIfAbsent<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T | null> {
    const bucket = this.bucket(owner, kind);
    if (bucket.has(value.id)) return null;
    bucket.set(value.id, JSON.parse(JSON.stringify(value)));
    return value;
  }

  async get<T>(owner: string, kind: string, id: string): Promise<T | null> {
    return (this.bucket(owner, kind).get(id) as T) ?? null;
  }

  async put<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T> {
    this.bucket(owner, kind).set(value.id, JSON.parse(JSON.stringify(value)));
    return value;
  }

  async compareAndSwap<T>(
    owner: string,
    kind: string,
    id: string,
    expected: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<T | null> {
    const bucket = this.bucket(owner, kind);
    const current = bucket.get(id) as Record<string, unknown> | undefined;
    if (!current) return null;
    for (const [key, value] of Object.entries(expected)) {
      if (JSON.stringify(current[key]) !== JSON.stringify(value)) return null;
    }
    const next = { ...current, ...patch };
    bucket.set(id, next);
    return next as T;
  }

  async list<T>(owner: string, kind: string): Promise<T[]> {
    return [...this.bucket(owner, kind).values()] as T[];
  }

  async scanByPrefix<T>(
    kind: string,
    tenantId: string,
    limit = 200,
  ): Promise<Array<{ owner: string; value: T }>> {
    const out: Array<{ owner: string; value: T }> = [];
    for (const [key, bucket] of this.rows) {
      const [owner, bucketKind] = key.split("\u0000");
      if (bucketKind !== kind) continue;
      for (const value of bucket.values()) {
        if ((value as { tenantId?: string }).tenantId === tenantId) {
          out.push({ owner, value: value as T });
        }
      }
    }
    return out.slice(0, limit);
  }
}

async function waitFor<T>(probe: () => Promise<T | undefined>, timeoutMs = 3_000): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = await probe();
    if (value !== undefined) return value;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error("waitFor: condicion no alcanzada");
}

test("el tenant del contexto manda aunque el resolver cambie entre operaciones", async () => {
  const store = new InMemoryTurnStore();
  let resolved = "t1";
  const kernel = makeKernel(store, async () => resolved);
  const ctx = makeCtx("t1");

  const turn = await kernel.openTurn(ctx, "chat");
  resolved = "t2";
  const thought = await kernel.appendThought(ctx, {
    turnId: turn.id,
    role: "observation",
    content: "hecho",
    attention: attention(),
    actor: { kind: "system", id: "test" },
    context: { entities: [], policies: [], skills: [], priorThoughts: [] },
    edges: [],
  });
  await kernel.closeTurn(ctx, turn.id, "response", "user");

  assert.deepEqual(await kernel.thoughtsOf(ctx, turn.id), [thought]);
  assert.equal((await store.getTurn("t1", turn.id))?.status, "closed");
});

test("reconcileOpenTurns cierra turnos abiertos que superaron el TTL", async () => {
  const store = new InMemoryTurnStore();
  const kernel = makeKernel(store);
  const ctx = makeCtx("t1");
  const turn = await kernel.openTurn(ctx, "stale");

  const internals = store as unknown as { turns: Map<string, { startedAt: string }> };
  const stored = internals.turns.get(turn.id);
  assert.ok(stored);
  stored.startedAt = new Date(Date.now() - 3_600_000).toISOString();

  const report = await kernel.reconcileOpenTurns(ctx, 60_000);
  assert.equal(report.closed, 1);
  assert.equal((await store.getTurn("t1", turn.id))?.status, "closed");
});

test("dos owners con la misma dedupeKey no se suprimen entre si", async () => {
  const store = new MemoryStore();
  const bus = new EventBus(store as never);
  const first = await bus.emit(
    "u1",
    "task.completed",
    { kind: "task", id: "task-1" },
    { taskId: "task-1", title: "Primera" },
    { tenantId: "t1", dedupeKey: "task:1" },
  );
  const second = await bus.emit(
    "u2",
    "task.completed",
    { kind: "task", id: "task-2" },
    { taskId: "task-2", title: "Segunda" },
    { tenantId: "t2", dedupeKey: "task:1" },
  );

  assert.equal(first.persisted, true);
  assert.equal(second.persisted, true);
  assert.equal((await store.list("u1", "system-events")).length, 1);
  assert.equal((await store.list("u2", "system-events")).length, 1);

  const duplicate = await bus.emit(
    "u1",
    "task.completed",
    { kind: "task", id: "task-1" },
    { taskId: "task-1", title: "Otra vez" },
    { tenantId: "t1", dedupeKey: "task:1" },
  );
  assert.equal(duplicate.duplicate, true);
  assert.equal((await store.list("u1", "system-events")).length, 1);
});

test("el bus resuelve el tenant real del owner cuando no hay scope", async () => {
  const store = new MemoryStore();
  const bus = new EventBus(store as never, undefined, undefined, {
    tenantForOwner: async (owner) => (owner === "u3" ? "t3" : "default"),
  });
  const result = await bus.emit(
    "u3",
    "system.startup",
    { kind: "system", id: "boot" },
    { mode: "sample" },
  );
  assert.equal(result.tenantId, "t3");
  const events = await store.list<{ tenantId: string }>("u3", "system-events");
  assert.equal(events[0]?.tenantId, "t3");
});

test("los suscriptores por tenant reciben solo su tenant", async () => {
  globalSubscribers.clear();
  const seen: string[] = [];
  const handle = globalSubscribers.subscribeTenant("t1", (event) => {
    seen.push(event.tenantId);
  });
  const bus = new EventBus(new MemoryStore() as never);
  await bus.emit("u9", "system.startup", { kind: "system", id: "boot" }, { mode: "sample" }, { tenantId: "t1" });
  await bus.emit("u9", "system.startup", { kind: "system", id: "boot" }, { mode: "sample" }, { tenantId: "t2" });
  assert.deepEqual(seen, ["t1"]);
  handle.unsubscribe();
  globalSubscribers.clear();
});

test("el subscriber del kernel crea un contexto valido y cierra el turno", async () => {
  globalSubscribers.clear();
  const store = new InMemoryTurnStore();
  const kernel = makeKernel(store);
  const bus = new EventBus(new MemoryStore() as never, undefined, undefined, {
    tenantForOwner: async () => "t1",
  });
  const subscription = startKernelEventSubscriber(kernel, globalSubscribers);
  try {
    await bus.emit(
      "u1",
      "task.completed",
      { kind: "task", id: "task-9" },
      { taskId: "task-9", title: "Hecho" },
      { tenantId: "t1" },
    );
    const ctx = makeCtx("t1");
    const turn = await waitFor(async () => {
      const turns = await kernel.listTurns(ctx, 20);
      return turns.find((candidate) => candidate.status === "closed");
    });
    const thoughts = await kernel.thoughtsOf(ctx, turn.id);
    assert.equal(thoughts.length, 1);
    assert.equal(thoughts[0]?.role, "reflection");
    assert.equal(turn.tenantId, "t1");
  } finally {
    subscription.stop();
    globalSubscribers.clear();
  }
});

test("replayTenant relee el log persistido del tenant en orden", async () => {
  const store = new MemoryStore();
  const bus = new EventBus(store as never);
  await bus.emit(
    "u1",
    "system.startup",
    { kind: "system", id: "boot" },
    { mode: "sample" },
    { tenantId: "t1" },
  );
  await bus.emit(
    "u1",
    "context.assembled",
    { kind: "context", id: "role-1" },
    { roleId: "role-1", entityCount: 0, relationCount: 0, knowledgeCount: 0, policyCount: 0 },
    { tenantId: "t1" },
  );

  const seen: string[] = [];
  const replayed = await bus.replayTenant("t1", { limit: 10 }, (event) => {
    seen.push(event.type);
  });
  assert.equal(replayed, 2);
  assert.deepEqual(seen, ["system.startup", "context.assembled"]);
});

test("runCognitionCycle respeta el orden de fases y consolida", async () => {
  const store = new InMemoryTurnStore();
  const kernel = makeKernel(store);
  const ctx = makeCtx("t1");
  const result = await runCognitionCycle(kernel, {
    ctx,
    trigger: "cycle:test",
    observation: {
      role: "observation",
      content: { kind: "test" },
      attention: attention(),
    },
    close: { reason: "response", closedBy: "user" },
  });

  assert.equal(result.closed, true);
  assert.deepEqual(
    result.phases.map((phase) => phase.phase),
    ["perceive", "attend", "decide", "reflect", "consolidate"],
  );
  assert.equal((await kernel.thoughtsOf(ctx, result.turnId)).length, 1);
});
