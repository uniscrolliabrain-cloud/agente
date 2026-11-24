import { cognitiveRecordSchema, type CognitiveRecord } from "../../../../../../packages/domain/src/cognition-v2.ts";
import type { SystemEvent } from "../../events/types.ts";

/**
 * C06.P03b: fail-closed event admission. This module is intentionally not
 * subscribed to the bus. A durable worker must independently verify the
 * original event, its owner, authorization, quotas and projected revision.
 */
export type SlowObservationCandidate = {
  tenantId: string;
  actorId: string;
  operationId: string;
  sourceId: string;
  sourceRevision: number;
  epistemic: CognitiveRecord["epistemic"];
};

const acceptedEpistemics = new Set<CognitiveRecord["epistemic"]>([
  "verified_fact", "reported_fact", "inference",
]);

/**
 * Only admit human/business-originated, projected cognitive records.
 * Slow-generated cards, terminal receipts and meta-hints must never feed back.
 * Admission does not confer execution authority or verify receipt ownership.
 */
export function selectSlowObservationCandidate(event: SystemEvent): SlowObservationCandidate | null {
  if (event.type !== "cognition.v2.record.proposed" ||
      event.source.kind === "system" ||
      event.source.id === "slow-v2" ||
      !event.id || !event.owner || !event.tenantId) return null;
  const parsed = cognitiveRecordSchema.safeParse(event.payload.record);
  if (!parsed.success) return null;
  const record = parsed.data;
  if ((record.kind !== "card" && record.kind !== "memory") ||
      !acceptedEpistemics.has(record.epistemic) ||
      record.lifecycle !== "active" || record.runtimeOutcome ||
      record.tenantId !== event.tenantId ||
      record.visibility.tenantId !== event.tenantId ||
      record.visibility.ownerActorId !== event.owner ||
      record.id.startsWith("slow:") || record.id.startsWith("outcome:") ||
      record.id.startsWith("hint:")) return null;
  return {
    tenantId: event.tenantId,
    actorId: event.owner,
    operationId: event.id,
    sourceId: record.id,
    sourceRevision: record.revision,
    epistemic: record.epistemic,
  };
}
