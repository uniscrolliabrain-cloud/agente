import { cognitiveIdentitySchema, type CognitiveIdentity, type CognitiveRecord } from "../../../../../../packages/domain/src/cognition-v2.ts";
import type { ContextServingFacade } from "./context.ts";
import type { SlowCognitionQueue } from "./slow.ts";
import { digest } from "./storage.ts";

/**
 * C06.P03: a narrow, auditable handoff from an authorized projected card/memory
 * to a durable slow job. Never puts the slow model on the chat/fast request path.
 *
 * Producers must supply a stable operationId derived from an authoritative
 * event/receipt. This port does not accept raw event text as verified evidence.
 */
type VerifyObservation = (
  identity: CognitiveIdentity,
  operationId: string,
  record: CognitiveRecord,
) => Promise<boolean>;

export class SlowObservationBridge {
  constructor(
    private readonly context: Pick<ContextServingFacade, "assertAuthorized" | "resolve">,
    private readonly slow: Pick<SlowCognitionQueue, "enqueue">,
    private readonly verifyObservation: VerifyObservation = async () => false,
  ) {}

  async observe(input: {
    identity: CognitiveIdentity;
    sourceId: string;
    sourceRevision: number;
    operationId: string;
    prompt: string;
  }): Promise<{ id: string; state: string }> {
    if (!input || typeof input !== "object") throw Error("SLOW_OBSERVATION_INVALID");
    const { identity, sourceId, sourceRevision, operationId, prompt } = input;
    if (!cognitiveIdentitySchema.safeParse(identity).success || identity.actorId !== identity.owner ||
        typeof operationId !== "string" || !operationId.trim() || operationId.length > 200 ||
        typeof sourceId !== "string" || !sourceId.trim() || sourceId.length > 200 ||
        !Number.isSafeInteger(sourceRevision) || sourceRevision < 1 ||
        typeof prompt !== "string" || !prompt.trim() || prompt.length > 4000) throw Error("SLOW_OBSERVATION_INVALID");
    await this.context.assertAuthorized(identity);
    const record = await this.context.resolve(identity, sourceId, sourceRevision);
    if (!record || record.tenantId !== identity.tenantId || record.id !== sourceId || record.revision !== sourceRevision ||
        record.visibility?.tenantId !== identity.tenantId ||
        record.visibility.ownerActorId !== identity.actorId || record.lifecycle !== "active" ||
        record.runtimeOutcome || ["slow:", "outcome:", "hint:"].some(prefix => record.id.startsWith(prefix)) ||
        (record.kind !== "card" && record.kind !== "memory") ||
        record.epistemic === "hypothesis" || record.epistemic === "unknown" || record.epistemic === "contradicted") {
      throw Error("SLOW_OBSERVATION_EVIDENCE_DENIED");
    }
    if (!await this.verifyObservation(identity, operationId, record)) {
      throw Error("SLOW_OBSERVATION_RECEIPT_DENIED");
    }
    // Key includes identity and immutable source revision to avoid cross-actor
    // collisions and accidental reuse of a different source with the same op.
    const key = digest(["slow-observation-v1", identity.tenantId, identity.actorId,
      identity.purpose, identity.policyRevision, operationId, sourceId, sourceRevision]);
    return this.slow.enqueue({
      identity,
      prompt,
      evidence: [{ tenantId: identity.tenantId, kind: record.kind, id: record.id, revision: record.revision }],
    }, key);
  }
}
