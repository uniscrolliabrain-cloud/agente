// C14_COGNITIVE_PROJECTION_V2: minimize child receipts into the existing
// authoritative source log; never copy findings, credentials or raw evidence.
import type { CognitiveIdentity } from "../../../../../packages/domain/src/cognition-v2.ts";
import { cognitiveRecordSchema } from "../../../../../packages/domain/src/cognition-v2.ts";
import type { CognitionV2Runtime } from "../cognition/v2/runtime.ts";
import { digest } from "../cognition/v2/storage.ts";
import type { SecurityEventProjection } from "./contracts.ts";
import type { Store } from "../../db.ts";
export function cognitiveSecurityProjector(runtime: CognitionV2Runtime, identity: CognitiveIdentity) {
  return async (projection: SecurityEventProjection, transaction: Store): Promise<void> => {
    if (transaction !== runtime.db || !transaction.inTransaction) throw Error("SECURITY_PROJECTION_REQUIRES_LOCAL_TRANSACTION");
    if (projection.tenantId !== identity.tenantId) throw Error("SECURITY_PROJECTION_TENANT_MISMATCH");
    await runtime.context.assertAuthorized(identity);
    const record = cognitiveRecordSchema.parse({ schemaVersion: "2.0", id: `cyber:${digest([projection.tenantId, projection.sourceObjectId])}`,
      tenantId: identity.tenantId, revision: projection.sourceSequence, kind: "card",
      title: "Operación de ciberseguridad registrada",
      body: JSON.stringify({ objectId: projection.sourceObjectId, state: projection.state, coverage: projection.coverage,
        securityGuarantee: false, interpretation: projection.interpretation }),
      epistemic: "reported_fact", evidence: [{ tenantId: identity.tenantId, kind: "receipt", id: projection.sourceEventId, revision: projection.sourceSequence }],
      sourceEventId: projection.sourceEventId, sourceRevision: projection.sourceSequence,
      visibility: { tenantId: identity.tenantId, ownerActorId: identity.actorId, scope: "private", allowedActorIds: [], policyRevision: identity.policyRevision },
      signals: { relevance: .5, confidence: 0, novelty: 1, urgency: projection.state === "failed" ? .5 : 0, contradiction: 0 },
      lifecycle: "active", createdAt: projection.observedAt });
    await runtime.sink.write({ id: digest([projection.tenantId, projection.sourceEventId, "cyber-cognition-v2"]),
      tenantId: identity.tenantId, owner: identity.actorId, schemaVersion: "1.0", type: "cognition.v2.record.proposed",
      emittedAt: projection.observedAt, source: { kind: "system", id: "security-bridge-v2" }, payload: { record } });
  };
}
