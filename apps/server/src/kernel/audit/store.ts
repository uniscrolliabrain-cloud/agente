// KERNEL_AUDIT_STORE_V1 — contrato del audit trail.
//
// La interfaz es append-only por diseno. No hay update ni delete: el
// audit trail es inmutable. La anonimizacion para el derecho al olvido
// se implementa como un append de una entrada "anonymized" que apunta a
// la original, no como un update.

import type { AuditAction, AuditEntry } from "./entry.ts";

export interface AuditAppendInput {
  tenantId: string;
  owner: string;
  action: AuditAction;
  actor: { kind: string; id: string };
  payload: Record<string, unknown>;
}

export interface AuditStore {
  append(input: AuditAppendInput): Promise<AuditEntry>;
  lastHash(tenantId: string): Promise<string | undefined>;
  list(tenantId: string, limit: number): Promise<AuditEntry[]>;
  verify(tenantId: string): Promise<boolean>;
}