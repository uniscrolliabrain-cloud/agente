// KERNEL_AUDIT_ENTRY_V1 — audit trail inmutable.
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
  payload: z.record(z.string(), z.unknown()),
  previousHash: z.string().length(64).optional(),
  hash: z.string().length(64),
  timestamp: z.iso.datetime({ offset: true }),
  signature: z.string().max(200).optional(),
});

export type AuditAction = z.infer<typeof auditActionSchema>;
export type AuditEntry = z.infer<typeof auditEntrySchema>;