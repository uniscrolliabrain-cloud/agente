import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../apps/server/src/db.ts";
import { installCognitionV2, CognitiveProjectionStore, DurableEventSink } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { ContextServingFacade } from "../apps/server/src/engine/cognition/v2/context.ts";
import { InferenceLane } from "../apps/server/src/engine/cognition/v2/inference.ts";
import { SlowCognitionQueue } from "../apps/server/src/engine/cognition/v2/slow.ts";
import { EventBus, type EmitResult } from "../apps/server/src/engine/events/bus.ts";
import { globalSubscribers } from "../apps/server/src/engine/events/subscriber.ts";
import { record } from "./fixtures/cognition-v2/record.ts";
const identity = { tenantId: "A", actorId: "alice", owner: "alice", policyRevision: "1", purpose: "chat" as const };
test("C15 late replay cannot recreate a revoked dependency chain; public context hides Thought content", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db); const store = new CognitiveProjectionStore(db);
    await store.revoke("A", "document");
    await store.apply({ ...record("A", "alice", "parent"), evidence: [{ tenantId: "A", kind: "document", id: "document", revision: 1 }] }, "1");
    await store.apply({ ...record("A", "alice", "child"), evidence: [{ tenantId: "A", kind: "card", id: "parent", revision: 1 }] }, "2");
    const context = new ContextServingFacade(store, { authorize: async () => true });
    assert.equal(await context.resolve(identity, "child"), null);
    await store.apply({ ...record("A", "alice", "thought"), kind: "thought_ref", body: "Internal private reasoning" }, "3");
    assert.equal(await context.resolve(identity, "thought"), null);
    // A superseded source cannot make an older revision reappear.
    await store.apply(record("A", "alice", "revised"), "4");
    await store.apply({ ...record("A", "alice", "revised"), revision: 2, sourceEventId: "new-source" }, "5");
    await store.revoke("A", "new-source");
    assert.ok(!(await context.getSnapshot(identity, { query: "", maxTokens: 4000, maxRefs: 10 })).refs.some((r) => r.id === "revised"));
  } finally { await db.close(); }
});
test("C15 cancellation aborts active Slow provider; exhausted restart emits factual failed receipt", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db); const store = new CognitiveProjectionStore(db); await store.apply(record(), "1");
    const context = new ContextServingFacade(store, { authorize: async () => true }), sink = new DurableEventSink(db, db, new Set(["A"]));
    let started!: () => void, aborted = false;
    const ready = new Promise<void>((r) => { started = r; });
    const queue = new SlowCognitionQueue(db, sink, context, { infer: async (_input, signal) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => { aborted = true; reject(Error("aborted")); }, { once: true }); started();
    }) });
    const input = { identity, prompt: "Hypothesis", evidence: [{ tenantId: "A", kind: "card" as const, id: "card-1", revision: 1 }] };
    const job = await queue.enqueue(input, "cancel-running"), running = queue.tick("A"); await ready;
    await queue.cancel(identity, job.id); await running; assert.equal(aborted, true);
    const exhausted = await queue.enqueue(input, "exhausted");
    await db.rawQuery("UPDATE cognition_v2_slow_jobs SET attempts=5,state='running',lease_until='2020-01-01' WHERE tenant='A' AND id=$1", [exhausted.id]);
    await queue.tick("A");
    const failed = await db.rawQuery("SELECT event_id FROM cognition_v2_events WHERE tenant='A' AND event->'payload'->>'jobId'=$1 AND event->'payload'->>'state'='failed'", [exhausted.id]);
    assert.equal(failed.length, 1);
    const fast = new InferenceLane(db, "fast", 1, 1000, 20);
    for (let i = 0; i < 6; i++) await assert.rejects(fast.run("A", async () => "no", AbortSignal.abort()));
    assert.equal(await fast.run("B", async () => "healthy"), "healthy");
  } finally { await db.close(); }
});
test("C02 nested emit is pending until outer commit; rollback never publishes or confirms", async () => {
  const db = await createStore(); let received = 0;
  const subscriber = globalSubscribers.subscribe("nested-cognition-test", () => { received++; });
  try {
    const bus = new EventBus(db); let rolled: EmitResult | undefined;
    await assert.rejects(db.transaction(async () => {
      rolled = await bus.emit("nested-cognition-test", "system.maintenance", { kind: "system", id: "test" }, { tasks: 0, monitors: 0 }, { tenantId: "A" });
      assert.equal(rolled.pendingCommit, true); assert.equal(rolled.persisted, false); assert.equal(received, 0);
      throw Error("rollback");
    }), /rollback/);
    assert.equal(rolled!.persisted, false); assert.equal(received, 0);
    const committed = await db.transaction(async () => {
      const r = await bus.emit("nested-cognition-test", "system.maintenance", { kind: "system", id: "test" }, { tasks: 0, monitors: 0 }, { tenantId: "A" });
      assert.equal(r.persisted, false); assert.equal(received, 0); return r;
    });
    assert.equal(committed.persisted, true); assert.equal(committed.pendingCommit, false); assert.equal(received, 1);
    assert.equal((await db.list("nested-cognition-test", "system-events")).length, 1);
  } finally { subscriber.unsubscribe(); await db.close(); }
});
