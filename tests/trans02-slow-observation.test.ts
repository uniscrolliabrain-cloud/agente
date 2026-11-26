import assert from "node:assert/strict";
import { test } from "node:test";
import { SlowObservationBridge } from "../apps/server/src/engine/cognition/v2/slow-observation.ts";
import type { CognitiveIdentity, CognitiveRecord } from "../packages/domain/src/cognition-v2.ts";

const identity: CognitiveIdentity = { tenantId: "tenant-a", actorId: "alice", owner: "alice", purpose: "chat", policyRevision: "p1" };
const source = { id: "card-1", tenantId: "tenant-a", kind: "card", revision: 3, epistemic: "reported_fact", lifecycle: "active", visibility: { tenantId: "tenant-a", ownerActorId: "alice" } } as CognitiveRecord;

test("C06 observation enqueues durable slow work with an exact authorized revision and stable key", async () => {
  const enqueued: { input: { evidence?: unknown }; key: string }[] = [];
  const bridge = new SlowObservationBridge({
    async assertAuthorized(i: CognitiveIdentity) { assert.equal(i, identity); },
    async resolve(_i: CognitiveIdentity, id: string, revision?: number) { assert.equal(id, source.id); assert.equal(revision, 3); return source; },
  }, {
    async enqueue(input, key) { enqueued.push({ input, key }); return { id: "job-1", state: "queued" }; },
  }, async () => true);
  const request = { identity, sourceId: "card-1", sourceRevision: 3, operationId: "receipt-1", prompt: "Examina este resultado empresarial." };
  assert.deepEqual(await bridge.observe(request), { id: "job-1", state: "queued" });
  await bridge.observe(request);
  assert.deepEqual(enqueued[0], enqueued[1]);
  const makeKey = async (changedIdentity: CognitiveIdentity) => {
    const scopedBridge = new SlowObservationBridge({
      async assertAuthorized() {},
      async resolve() { return source; },
    }, {
      async enqueue(_input, key) { return { id: key, state: "queued" }; },
    }, async () => true);
    return (await scopedBridge.observe({ ...request, identity: changedIdentity })).id;
  };
  assert.notEqual(await makeKey({ ...identity, purpose: "task" }), enqueued[0]?.key);
  assert.notEqual(await makeKey({ ...identity, policyRevision: "p2" }), enqueued[0]?.key);
  assert.deepEqual(enqueued[0]?.input.evidence, [{ tenantId: "tenant-a", kind: "card", id: "card-1", revision: 3 }]);
});

test("C06 observation rejects missing, speculative, contradicted or foreign evidence without enqueue", async () => {
  let called = 0;
  let record: CognitiveRecord | null = null;
  const bridge = new SlowObservationBridge({
    async assertAuthorized() {},
    async resolve() { return record; },
  }, { async enqueue() { called++; return { id: "job", state: "queued" }; } }, async () => true);
  const request = { identity, sourceId: "card-1", sourceRevision: 3, operationId: "receipt-1", prompt: "Examina el resultado." };
  for (record of [null, { ...source, tenantId: "tenant-b" }, { ...source, epistemic: "hypothesis" }, { ...source, epistemic: "unknown" }, { ...source, epistemic: "contradicted" }] as (CognitiveRecord | null)[]) {
    await assert.rejects(bridge.observe(request), /SLOW_OBSERVATION_EVIDENCE_DENIED/);
  }
  await assert.rejects(bridge.observe({ ...request, sourceRevision: 0 }), /SLOW_OBSERVATION_INVALID/);
  assert.equal(called, 0);
});

test("C06 observation refuses forged resolved revision, identity, source and empty prompt", async () => {
  let enqueues = 0;
  let resolved: CognitiveRecord = source;
  const bridge = new SlowObservationBridge({
    async assertAuthorized() {},
    async resolve() { return resolved; },
  }, { async enqueue() { enqueues++; return { id: "job", state: "queued" }; } }, async () => true);
  const request = { identity, sourceId: "card-1", sourceRevision: 3, operationId: "receipt-1", prompt: "Analiza evidencia" };
  for (resolved of [
    { ...source, id: "card-2" }, { ...source, revision: 2 },
    { ...source, lifecycle: "revoked" }, { ...source, visibility: { tenantId: "tenant-b" } },
  ] as CognitiveRecord[]) {
    await assert.rejects(bridge.observe(request), /SLOW_OBSERVATION_EVIDENCE_DENIED/);
  }
  resolved = source;
  for (const invalid of [
    { ...request, prompt: "   " }, { ...request, sourceId: "x".repeat(201) },
    { ...request, operationId: " " }, { ...request, identity: { ...identity, owner: "mallory" } },
  ]) await assert.rejects(bridge.observe(invalid), /SLOW_OBSERVATION_INVALID/);
  assert.equal(enqueues, 0);
});

test("C06 observation propagates queue conflict without changing identity or retrying", async () => {
  let attempts = 0;
  const bridge = new SlowObservationBridge({
    async assertAuthorized() {},
    async resolve() { return source; },
  }, { async enqueue() { attempts++; throw Error("IDEMPOTENCY_CONFLICT"); } }, async () => true);
  await assert.rejects(bridge.observe({
    identity, sourceId: "card-1", sourceRevision: 3, operationId: "receipt-1", prompt: "Analiza",
  }), /IDEMPOTENCY_CONFLICT/);
  assert.equal(attempts, 1);
});

test("observation is dormant without a receipt verifier and excludes derived and foreign-owner records", async () => {
  let resolved = source;
  const context = {
    async assertAuthorized() {},
    async resolve() { return resolved; },
  };
  const queue = { async enqueue(): Promise<never> { throw Error("UNEXPECTED_ENQUEUE"); } };
  const request = { identity, sourceId: source.id, sourceRevision: 3, operationId: "receipt-1", prompt: "Analiza evidencia" };
  await assert.rejects(new SlowObservationBridge(context, queue).observe(request), /SLOW_OBSERVATION_RECEIPT_DENIED/);
  const bridge = new SlowObservationBridge(context, queue, async () => { throw Error("UNEXPECTED_VERIFICATION"); });
  resolved = { ...source, id: "slow:1" };
  await assert.rejects(bridge.observe({ ...request, sourceId: resolved.id }), /SLOW_OBSERVATION_EVIDENCE_DENIED/);
  resolved = { ...source, visibility: { ...source.visibility, ownerActorId: "bob" } };
  await assert.rejects(bridge.observe(request), /SLOW_OBSERVATION_EVIDENCE_DENIED/);
});
