// C01_V1_MIGRATION_V2: explicit conservative migration; never widen sharing.
import { createHash } from "node:crypto";
import { cognitionCardSchema, type CognitionCard } from "../../../../../../packages/domain/src/cognition-card.ts";
import { cognitiveIdentitySchema, cognitiveRecordSchema, type CognitiveIdentity } from "../../../../../../packages/domain/src/cognition-v2.ts";
export function migrateLegacyCard(raw: CognitionCard, identity: CognitiveIdentity) {
  const card = cognitionCardSchema.parse(raw);
  cognitiveIdentitySchema.parse(identity);
  if (card.tenantId !== identity.tenantId || card.owner !== identity.owner || identity.actorId !== identity.owner) throw Error("MIGRATION_SCOPE_MISMATCH");
  // Both schemas allow 200-character IDs; adding a prefix to the legacy ID
  // would reject valid legacy rows. Hash the full scoped key deterministically.
  const id = `legacy:${createHash("sha256").update(JSON.stringify([card.tenantId, card.id])).digest("hex")}`;
  return cognitiveRecordSchema.parse({ schemaVersion: "2.0", id, tenantId: card.tenantId,
    // Legacy cards have no epistemic verification receipt. Model confidence
    // must never promote generated text into a reported or verified fact.
    revision: card.version, kind: "card", title: card.title, body: card.body, epistemic: "unknown",
    evidence: card.evidence.thoughtIds.map((id) => ({ tenantId: card.tenantId, kind: "thought", id, revision: 1 })),
    sourceEventId: card.thoughtId, sourceRevision: card.version,
    visibility: { tenantId: card.tenantId, ownerActorId: identity.actorId, scope: "private", allowedActorIds: [], policyRevision: identity.policyRevision },
    signals: { relevance: 0, confidence: card.confidence, novelty: 0, urgency: 0, contradiction: 0 },
    lifecycle: card.status === "expired" ? "expired" : card.status === "superseded" ? "superseded" : "active",
    createdAt: card.provenance.createdAt, ...(card.provenance.expiresAt ? { expiresAt: card.provenance.expiresAt } : {}) });
}
