// HANDOFF_ACCEPT_V2 - accept y list por rol.
// HANDOFF_SERVICE_V1 - pasa trabajo entre roles.

import type { Store } from "../../db.ts";
import type { TenantScopedStore } from "../../db-tenant.ts";
import type {
  AgentMessage,
  AgentMessageIntent,
  Handoff,
} from "../../../../../packages/domain/src/messaging.ts";

export class HandoffService {
  constructor(private readonly db: Store | TenantScopedStore) {}

  // HANDOFF_CREATE_V1
  async create(handoff: Handoff): Promise<Handoff> {
    await this.db.put(handoff.tenantId, "handoffs", handoff);
    // MESSAGING_CONTRACT_WIRE_V1 - el handoff tambien se publica como
    // AgentMessage (intent handoff) para que la bandeja del rol lo vea sin
    // reimplementar la forma.
    const intent: AgentMessageIntent = "handoff";
    const message: AgentMessage = {
      id: `msg-${handoff.id}`,
      tenantId: handoff.tenantId,
      fromRoleId: handoff.fromRoleId,
      toRoleId: handoff.toRoleId,
      ...(handoff.goalId ? { goalId: handoff.goalId } : {}),
      ...(handoff.taskId ? { taskId: handoff.taskId } : {}),
      intent,
      payload: {
        handoffId: handoff.id,
        ...(handoff.contextSummary ? { contextSummary: handoff.contextSummary } : {}),
        ...(handoff.requiredOutcome ? { requiredOutcome: handoff.requiredOutcome } : {}),
      },
      createdAt: handoff.createdAt,
    };
    await this.db.put(handoff.tenantId, "agent-messages", message);
    return handoff;
  }

  // HANDOFF_ACCEPT_V1
  async accept(tenantId: string, handoffId: string): Promise<Handoff | null> {
    const existing = await this.db.get<Handoff>(tenantId, "handoffs", handoffId);
    if (!existing) return null;
    const updated: Handoff = { ...existing, acceptedAt: new Date().toISOString() };
    await this.db.put(tenantId, "handoffs", updated);
    return updated;
  }

  // MESSAGING_INBOX_V1 - bandeja del rol con el contrato AgentMessage.
  async messages(tenantId: string, roleId: string): Promise<AgentMessage[]> {
    const all = await this.db.list<AgentMessage>(tenantId, "agent-messages");
    return all.filter((m) => m.toRoleId === roleId);
  }

  async listForRole(tenantId: string, roleId: string): Promise<Handoff[]> {
    const all = await this.db.list<Handoff>(tenantId, "handoffs");
    return all.filter((h) => h.toRoleId === roleId && !h.acceptedAt);
  }
}