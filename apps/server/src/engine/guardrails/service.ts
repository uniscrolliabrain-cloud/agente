// GUARDRAILS_V1 - limites duros por tenant, ejecucion y capability.

import type { Store } from "../../db.ts";
import type { TenantScopedStore } from "../../db-tenant.ts";
import { AppError } from "../../errors.ts";

export interface TenantQuota {
  tokensPerDay: number;
  tasksActive: number;
  tasksPerHour: number;
  eventsPerDay: number;
  turnsActive: number;
  costEurPerDay: number;
}

const DEFAULT_QUOTA: TenantQuota = {
  tokensPerDay: 1_000_000,
  tasksActive: 10_000,
  tasksPerHour: 500,
  eventsPerDay: 100_000,
  turnsActive: 100,
  costEurPerDay: 50,
};

export class GuardrailService {
  constructor(private readonly db: Store | TenantScopedStore) {}

  async quotaFor(tenantId: string): Promise<TenantQuota> {
    const row = await this.db
      .get<{ quota: TenantQuota }>(tenantId, "guardrail-quotas", "default")
      .catch(() => null);
    return row?.quota ?? DEFAULT_QUOTA;
  }

  async checkTaskCreation(tenantId: string, currentActiveTasks: number): Promise<void> {
    const q = await this.quotaFor(tenantId);
    if (currentActiveTasks >= q.tasksActive) {
      throw new AppError(
        `El tenant ha alcanzado el limite de ${q.tasksActive} tareas activas`,
        429,
      );
    }
  }

  async checkTokens(tenantId: string, tokensUsedToday: number): Promise<void> {
    const q = await this.quotaFor(tenantId);
    if (tokensUsedToday >= q.tokensPerDay) {
      throw new AppError(
        `El tenant ha alcanzado el limite de ${q.tokensPerDay} tokens/dia`,
        429,
      );
    }
  }

  async checkCost(tenantId: string, costToday: number): Promise<void> {
    const q = await this.quotaFor(tenantId);
    if (costToday >= q.costEurPerDay) {
      throw new AppError(
        `El tenant ha alcanzado el limite de ${q.costEurPerDay} EUR/dia`,
        429,
      );
    }
  }

  /** GUARDRAILS_SET_V1 - admin puede actualizar la cuota de un tenant. */
  async setQuota(tenantId: string, quota: TenantQuota): Promise<void> {
    await this.db.put(tenantId, "guardrail-quotas", { id: "default", quota });
  }
}