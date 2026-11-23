import assert from "node:assert/strict";
import { test } from "node:test";
import { SlowObservationBridge } from "../apps/server/src/engine/cognition/v2/slow-observation.ts";
import type { CognitiveIdentity, CognitiveRecord } from "../packages/domain/src/cognition-v2.ts";

const identity: CognitiveIdentity = { tenantId: "tenant-a", actorId: "alice", owner: "alice", purpose: "chat", policyRevision: "p1" };
const source = { id: "card-1", tenantId: "tenant-a", kind: "card", revision: 3, epistemic: "reported_fact" } as CognitiveRecord;

test("C06 observation enqueues durable slow work with an exact authorized revision and stable key", async () => {
  const enqueued: unknown[] = [];
  const bridge = new SlowObservationBridge({
    async assertAuthorized(i: CognitiveIdentity) { assert.equal(i, identity); },
    async resolve(_i: CognitiveIdentity, id: string, revision?: number) { assert.equal(id, source.id); assert.equal(revision, 3); return source; },
  } as any, {
    async enqueue(input: unknown, key: string) { enqueued.push({ input, key }); return { id: "job-1", state: "queued" }; },
  } as any);
  const request = { identity, sourceId: "card-1", sourceRevision: 3, operationId: "receipt-1", prompt: "Examina este resultado empresarial." };
  assert.deepEqual(await bridge.observe(request), { id: "job-1", state: "queued" });
  await bridge.observe(request);
  assert.deepEqual(enqueued[0], enqueued[1]);
  assert.deepEqual((enqueued[0] as any).input.evidence, [{ tenantId: "tenant-a", kind: "card", id: "card-1", revision: 3 }]);
});

test("C06 observation rejects missing, speculative, contradicted or foreign evidence without enqueue", async () => {
  let called = 0;
  let record: CognitiveRecord | null = null;
  const bridge = new SlowObservationBridge({
    async assertAuthorized() {},
    async resolve() { return record; },
  } as any, { async enqueue() { called++; return { id: "job", state: "queued" }; } } as any);
  const request = { identity, sourceId: "card-1", sourceRevision: 3, operationId: "receipt-1", prompt: "Examina el resultado." };
  for (record of [null, { ...source, tenantId: "tenant-b" }, { ...source, epistemic: "hypothesis" }, { ...source, epistemic: "unknown" }, { ...source, epistemic: "contradicted" }] as (CognitiveRecord | null)[]) {
    await assert.rejects(bridge.observe(request), /SLOW_OBSERVATION_EVIDENCE_DENIED/);
  }
  await assert.rejects(bridge.observe({ ...request, sourceRevision: 0 }), /SLOW_OBSERVATION_INVALID/);
  assert.equal(called, 0);
});
