// C01_V1_MIGRATION_V2: explicit conservative migration; never widen sharing.
import { cognitionCardSchema, type CognitionCard } from "../../../../../../packages/domain/src/cognition-card.ts";
import { cognitiveRecordSchema, type CognitiveIdentity } from "../../../../../../packages/domain/src/cognition-v2.ts";
export function migrateLegacyCard(raw: CognitionCard, identity: CognitiveIdentity) {
  const card = cognitionCardSchema.parse(raw);
  if (card.tenantId !== identity.tenantId || card.owner !== identity.owner) throw Error("MIGRATION_SCOPE_MISMATCH");
  return cognitiveRecordSchema.parse({ schemaVersion: "2.0", id: `legacy:${card.id}`, tenantId: card.tenantId,
    revision: card.version, kind: "card", title: card.title, body: card.body, epistemic: "reported_fact",
    evidence: card.evidence.thoughtIds.map((id) => ({ tenantId: card.tenantId, kind: "thought", id, revision: 1 })),
    sourceEventId: card.thoughtId, sourceRevision: card.version,
    visibility: { tenantId: card.tenantId, ownerActorId: identity.actorId, scope: "private", allowedActorIds: [], policyRevision: identity.policyRevision },
    signals: { relevance: 0, confidence: card.confidence, novelty: 0, urgency: 0, contradiction: 0 },
    lifecycle: card.status === "expired" ? "expired" : card.status === "superseded" ? "superseded" : "active",
    createdAt: card.provenance.createdAt, ...(card.provenance.expiresAt ? { expiresAt: card.provenance.expiresAt } : {}) });
}
