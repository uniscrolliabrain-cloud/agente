// AUDIT_TRAIL_V1 — escribe en StoreAuditStore cuando withRead detecta campo restricted/secret denegado.
import type { StoreAuditStore } from "../../kernel/audit/store-store.ts";

export interface AuditTrailEntry {
  actorId: string;
  action: string;
  resource: string;
  field: string;
  classification: "public" | "internal" | "confidential" | "restricted" | "secret";
  allowed: false;
  timestamp: string;
}

export class AuditTrail {
  constructor(private readonly audit: StoreAuditStore) {}

  async recordDenied(entry: AuditTrailEntry): Promise<void> {
    await this.audit.append({
      tenantId: "default",
      owner: entry.actorId,
      action: "audit.read.denied",
      actor: { kind: "user", id: entry.actorId },
      payload: {
        resource: entry.resource,
        field: entry.field,
        classification: entry.classification,
        allowed: false,
        timestamp: entry.timestamp,
      },
    });
  }
}
