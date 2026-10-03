// HANDOFF_ACCEPT_V2 - accept y list por rol.
// HANDOFF_SERVICE_V1 - pasa trabajo entre roles.

import type { Store } from "../../db.ts";
import type { TenantScopedStore } from "../../db-tenant.ts";
import type { Handoff } from "../../../../../packages/domain/src/messaging.ts";

export class HandoffService {
  constructor(private readonly db: Store | TenantScopedStore) {}

  async create(handoff: Handoff): Promise<Handoff> {
    await this.db.put(handoff.tenantId, "handoffs", handoff);
    return handoff;
  }

  async accept(tenantId: string, handoffId: string): Promise<Handoff | null> {
    const existing = await this.db.get<Handoff>(tenantId, "handoffs", handoffId);
    if (!existing) return null;
    const updated: Handoff = { ...existing, acceptedAt: new Date().toISOString() };
    await this.db.put(tenantId, "handoffs", updated);
    return updated;
  }

  async listForRole(tenantId: string, roleId: string): Promise<Handoff[]> {
    const all = await this.db.list<Handoff>(tenantId, "handoffs");
    return all.filter((h) => h.toRoleId === roleId && !h.acceptedAt);
  }
}