// AUDIT_TRAIL_V1 — escribe en StoreAuditStore cuando withRead detecta campo restricted/secret denegado.
import type { StoreAuditStore } from "../../kernel/audit/store-store.ts";

export interface AuditTrailEntry {
  actorId: string;
  /** AUDIT_TRAIL_TENANT_V1 — tenant del actor; sin el, la entrada cae al
   *  tenant por defecto en vez de inventarse uno. */
  tenantId?: string;
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
      tenantId: entry.tenantId ?? "default", // FALLBACK_TENANT_V1
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
