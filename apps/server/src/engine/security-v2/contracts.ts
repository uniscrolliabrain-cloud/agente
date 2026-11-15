// C14_SECURITY_CONTRACTS_V2: independent child service, never business authority.
import { z } from "zod";
const tenantId = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/);
const opaqueId = z.string().regex(/^[a-f0-9]{32}$/);
export const securityIdentitySchema = z.strictObject({
  tenantId, actorId: z.string().min(1).max(200), agentId: z.string().min(1).max(200),
  policyRevision: z.string().min(1).max(200),
});
export type SecurityIdentity = z.infer<typeof securityIdentitySchema>;
export const securityReadSchema = z.strictObject({ capability: z.enum(["assets.read", "findings.read", "jobs.read"]) });
export type SecurityReadCapability = z.infer<typeof securityReadSchema>["capability"];
export const securityJobStateSchema = z.enum(["pending", "running", "completed", "partial", "failed", "cancelled", "blocked", "reconciliation_required"]);
export const childEventEnvelopeSchema = z.strictObject({
  schema_version: z.literal(1), id: opaqueId, tenant_id: tenantId,
  sequence: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
  type: z.enum(["cyber.job.completed", "cyber.job.partial", "cyber.job.failed", "cyber.job.blocked", "cyber.job.reconciliation_required",
    "cyber.budget.reserved", "cyber.budget.started", "cyber.budget.released", "cyber.budget.settled", "cyber.budget.overrun", "cyber.budget.reconciliation_required"]),
  occurred_at: z.iso.datetime({ offset: true }), correlation_id: z.string().min(1).max(200),
  source: z.literal("agntia-ciberseguridad"), object_id: z.string().min(1).max(200),
  interpretation: z.literal("recorded_operation_only"),
});
export type ChildEventEnvelope = z.infer<typeof childEventEnvelopeSchema>;
export const childOutboxSchema = z.strictObject({
  events: z.array(z.strictObject({ envelope: childEventEnvelopeSchema, content_hash: z.string().regex(/^[a-f0-9]{64}$/) })).max(100),
  next_after: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).nullable(),
  delivery: z.literal("at_least_once"), consumer_id: tenantId,
});
export type ChildOutboxItem = z.infer<typeof childOutboxSchema>["events"][number];
export interface SecurityEventProjection {
  schemaVersion: "2.0"; tenantId: string; sourceEventId: string; sourceSequence: number;
  sourceDigest: string; sourceObjectId: string; eventType: ChildEventEnvelope["type"];
  state: "completed" | "partial" | "failed" | "blocked" | "reconciliation_required" | "recorded";
  observedAt: string; interpretation: "recorded_operation_only";
  coverage: "not_reported"; securityGuarantee: false;
}
export function minimizeChildEvent(item: ChildOutboxItem): SecurityEventProjection {
  const event = childEventEnvelopeSchema.parse(item.envelope);
  const jobState = event.type.startsWith("cyber.job.") ? event.type.slice("cyber.job.".length) : "recorded";
  return { schemaVersion: "2.0", tenantId: event.tenant_id, sourceEventId: event.id,
    sourceSequence: event.sequence, sourceDigest: item.content_hash, sourceObjectId: event.object_id,
    eventType: event.type, state: jobState as SecurityEventProjection["state"], observedAt: event.occurred_at,
    interpretation: "recorded_operation_only", coverage: "not_reported", securityGuarantee: false };
}
