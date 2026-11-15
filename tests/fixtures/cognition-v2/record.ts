import { cognitiveRecordSchema } from "../../../packages/domain/src/cognition-v2.ts";
export function record(tenantId = "A", actorId = "alice", id = "card-1") {
  return cognitiveRecordSchema.parse({ schemaVersion: "2.0", id, tenantId, revision: 1,
    kind: "card", title: "Resultado", body: "Dato no verificado", epistemic: "hypothesis",
    evidence: [{ tenantId, kind: "event", id: "source", revision: 1 }],
    sourceEventId: "source", sourceRevision: 1,
    visibility: { tenantId, ownerActorId: actorId, scope: "private", allowedActorIds: [], policyRevision: "1" },
    signals: { relevance: .5, confidence: .5, novelty: .5, urgency: 0, contradiction: 0 },
    lifecycle: "active", createdAt: "2026-11-15T00:00:00Z" });
}
