import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../apps/server/src/db.ts";
import { installCognitionV2, CognitiveProjectionStore, DurableEventSink } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { ContextServingFacade } from "../apps/server/src/engine/cognition/v2/context.ts";
import { SlowCognitionQueue } from "../apps/server/src/engine/cognition/v2/slow.ts";
import { InferenceLane, fastOnlyModel } from "../apps/server/src/engine/cognition/v2/inference.ts";
import { CognitiveProjector } from "../apps/server/src/engine/cognition/v2/projector.ts";
import { persistentKernel } from "./fixtures/cognition-v2/kernel.ts";
import { record } from "./fixtures/cognition-v2/record.ts";
const identity = { tenantId: "A", actorId: "alice", owner: "alice", policyRevision: "1", purpose: "chat" as const };
test("C07/C08 Slow is durable, validates output/evidence and publishes a reusable private card", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db); const store = new CognitiveProjectionStore(db);
    await store.apply(record(), "1");
    const context = new ContextServingFacade(store, { authorize: async () => true });
    const sink = new DurableEventSink(db, db, new Set(["A"]));
    let calls = 0;
    const input = { identity, prompt: "Analizar riesgo", evidence: [{ tenantId: "A", kind: "card" as const, id: "card-1", revision: 1 }] };
    const queue = new SlowCognitionQueue(db, sink, context, { infer: async () => {
      calls++; return { title: "Análisis", body: "Riesgo hipotético", epistemic: "hypothesis", evidence: input.evidence };
    } }, { classify: async () => ({ allowed: true, epistemic: "verified_fact" }) });
    const kernel = persistentKernel(db);
    queue.capture = (identity, input) => kernel.captureAsyncResult({ tenantId: identity.tenantId, owner: identity.owner, actorId: identity.actorId, role: "system", requestId: input.operationId }, input);
    const accepted = await queue.enqueue(input, "key");
    assert.deepEqual(await queue.enqueue(input, "key"), accepted);
    await assert.rejects(queue.enqueue({ ...input, prompt: "Otro" }, "key"), /IDEMPOTENCY_CONFLICT/);
    // New queue instance recovers the accepted job; no UI timer is involved.
    const restarted = new SlowCognitionQueue(db, sink, context, queue.provider, queue.classifier);
    restarted.capture = queue.capture;
    assert.equal(await restarted.tick("A"), true);
    assert.equal(await restarted.tick("A"), false); assert.equal(calls, 1);
    const projector = new CognitiveProjector(store);
    await projector.tick("A");
    const card = await context.resolve(identity, `slow:${accepted.id}`);
    assert.ok(card?.evidence.some((e) => e.kind === "thought"));
    const turns = await kernel.deps.store.listTurns("A", 100);
    assert.equal(turns.length, 1); assert.equal(turns[0].status, "closed");
    assert.equal((await kernel.deps.store.thoughtsOf("A", turns[0].id)).length, 1);
    assert.equal(card?.epistemic, "hypothesis"); assert.equal(card?.visibility.scope, "private");
    const cancelled = await queue.enqueue(input, "cancel"); assert.equal(await queue.cancel(identity, cancelled.id), true);
    assert.equal(await queue.tick("A"), false);
  } finally { await db.close(); }
});
test("C11 saturated Slow and Slow failures never occupy Fast lane; timeout retains its uncertain lease until expiry", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const slow = new InferenceLane(db, "slow", 1, 1000, 10), fast = new InferenceLane(db, "fast", 1, 1000, 10);
    let release!: () => void, entered!: () => void;
    const ready = new Promise<void>((r) => { entered = r; });
    const waiting = slow.run("A", async () => { entered(); await new Promise<void>((r) => { release = r; }); return "slow"; });
    await ready;
    await assert.rejects(slow.run("A", async () => "over capacity"), /LANE_SATURATED/);
    assert.equal(await fast.run("A", async () => "fast"), "fast");
    release(); assert.equal(await waiting, "slow");
    const short = new InferenceLane(db, "slow", 1, 20, 10);
    await assert.rejects(short.run("A", async () => new Promise(() => {})), /INFERENCE_TIMEOUT/);
    await assert.rejects(short.run("A", async () => "premature"), /LANE_SATURATED/);
    await db.rawQuery("UPDATE cognition_v2_lane_slots SET expires_at=now()-interval '1 second' WHERE tenant='A' AND lane='slow'");
    assert.equal(await short.run("A", async () => "recovered"), "recovered");
    assert.throws(() => fastOnlyModel({ SLOW_LLM_MODEL: "reasoner", SLOW_LLM_API_KEY: "key" }), /FAST_PROFILE_UNCONFIGURED/);
  } finally { await db.close(); }
});
