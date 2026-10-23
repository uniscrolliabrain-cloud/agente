// KERNEL_AUDIT_ENTRY_V1 â€” audit trail inmutable.
//
// SOC-2 exige trazabilidad completa: cada operacion del kernel escribe
// una AuditEntry. La cadena de hashes (previousHash -> hash) hace que
// borrar o modificar una entrada rompa la cadena y sea detectable.
//
// El audit trail no se borra: se anonimiza. El derecho al olvido (SOC-2
// Privacy) se cumple reemplazando owner/content por hashes, no eliminando
// la fila.

import { z } from "zod";

export const auditActionSchema = z.enum([
  "turn.opened",
  "turn.closed",
  "turn.promoted",
  "thought.appended",
  "thought.promoted",
  "thought.discarded",
  "cromo.created",
  "cromo.updated",
  "cromo.deleted",
  "field.recalculated",
  "promotion.executed",
  // KERNEL_AUDIT_ACTION_THOUGHT_PROMOTED_V1
  "thought.promoted",
  // KERNEL_AUDIT_ACTION_THOUGHT_DISCARDED_V1
  "thought.discarded",
  // KERNEL_AUDIT_ACTION_BUILD_APPLIED_V1
  "build.applied",
  // KERNEL_AUDIT_ACTION_STATE_CHANGED_V1
  "state.changed",
]);

export const auditEntrySchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  action: auditActionSchema,
  actor: z.object({
    kind: z.string().min(1).max(50),
    id: z.string().min(1).max(200),
  }),
  // AUDIT_STORE_CLASSIFICATION_V1 - payload acepta field/classification/allowed
  payload: z.record(z.string(), z.unknown()).superRefine((val, ctx) => {
    if ("field" in val && val.field !== null && typeof val.field !== "string") ctx.addIssue({ code: "custom", message: "field must be string or null" });
    if ("classification" in val && val.classification !== null && !["public", "internal", "confidential", "restricted", "secret"].includes(val.classification as string)) ctx.addIssue({ code: "custom", message: "invalid classification" });
    if ("allowed" in val && typeof val.allowed !== "boolean") ctx.addIssue({ code: "custom", message: "allowed must be boolean" });
  }),
  previousHash: z.string().length(64).optional(),
  hash: z.string().length(64),
  timestamp: z.iso.datetime({ offset: true }),
  signature: z.string().max(200).optional(),
});

export type AuditAction = z.infer<typeof auditActionSchema>;
export type AuditEntry = z.infer<typeof auditEntrySchema>;