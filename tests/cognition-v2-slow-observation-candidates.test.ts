import assert from "node:assert/strict";
import { test } from "node:test";
import type { SystemEvent } from "../apps/server/src/engine/events/types.ts";
import { selectSlowObservationCandidate } from "../apps/server/src/engine/cognition/v2/slow-observation-candidates.ts";

const event = {
  id: "event-1", tenantId: "tenant-a", owner: "alice",
  type: "cognition.v2.record.proposed", schemaVersion: "1.0",
  emittedAt: "2026-11-23T10:00:00.000Z",
  source: { kind: "agent", id: "business-projection" },
  payload: { record: {
    schemaVersion: "2.0", id: "card-business", tenantId: "tenant-a",
    revision: 1, kind: "card", title: "Nueva venta", body: "Venta reportada",
    epistemic: "reported_fact", evidence: [{ tenantId: "tenant-a", kind: "event", id: "business-event-1", revision: 1 }],
    sourceEventId: "business-event-1", sourceRevision: 1,
    visibility: { tenantId: "tenant-a", ownerActorId: "alice", scope: "private", allowedActorIds: [], policyRevision: "policy-1" },
    signals: { relevance: 0.5, confidence: 0.5, novelty: 0.5, urgency: 0, contradiction: 0 },
    lifecycle: "active", createdAt: "2026-11-23T10:00:00.000Z",
  } },
} as unknown as SystemEvent;

test("C06.P03b admits only bounded business-originated cognitive card candidates", () => {
  assert.deepEqual(selectSlowObservationCandidate(event), {
    tenantId: "tenant-a", actorId: "alice", operationId: "event-1",
    sourceId: "card-business", sourceRevision: 1, epistemic: "reported_fact",
  });
});

test("C06.P03b excludes slow outputs, terminal receipts and self-referential events", () => {
  const base = event as any;
  for (const mutated of [
    { ...base, source: { kind: "system", id: "slow-v2" } },
    { ...base, type: "cognition.v2.slow.status" },
    { ...base, payload: { record: { ...base.payload.record, id: "slow:job" } } },
    { ...base, payload: { record: { ...base.payload.record, id: "hint:job" } } },
    { ...base, payload: { record: { ...base.payload.record, epistemic: "hypothesis" } } },
    { ...base, payload: { record: { ...base.payload.record, lifecycle: "revoked" } } },
    { ...base, payload: { record: { ...base.payload.record, tenantId: "tenant-b" } } },
    { ...base, payload: { record: { ...base.payload.record, visibility: { ...base.payload.record.visibility, ownerActorId: "bob" } } } },
  ]) assert.equal(selectSlowObservationCandidate(mutated), null);
});
