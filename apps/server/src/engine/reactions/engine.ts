// REACTION_ENGINE_V1 - lee del bus y ejecuta ReactionRules.

import type { Store } from "../../db.ts";
import type { TenantScopedStore } from "../../db-tenant.ts";
import type { EventBus } from "../events/index.ts";
import type { ReactionDefinition } from "../../../../../packages/domain/src/reaction.ts";

export class ReactionEngine {
  private readonly rules = new Map<string, ReactionDefinition[]>();

  constructor(
    private readonly db: Store | TenantScopedStore,
    private readonly bus?: EventBus,
    private readonly executor?: (
      ctx: import("../../../../../packages/domain/src/index.ts").ExecutionContext,
      actions: Array<{ kind: string; params: Record<string, unknown> }>,
    ) => Promise<void>,
  ) {}

  // REACTION_LOAD_V1 - carga las rules del tenant desde la DB.
  async load(tenantId: string): Promise<void> {
    const stored = await this.db.list<ReactionDefinition>(tenantId, "reactions");
    this.rules.set(tenantId, stored);
  }

  async register(tenantId: string, rule: ReactionDefinition): Promise<void> {
    const list = this.rules.get(tenantId) ?? [];
    list.push(rule);
    this.rules.set(tenantId, list);
    await this.db.put(tenantId, "reactions", rule);
  }

  // REACTION_EVAL_EXEC_V1 - evalua condition y ejecuta actions.
  async evaluate(tenantId: string, eventType: string, payload: Record<string, unknown>): Promise<void> {
    const list = this.rules.get(tenantId) ?? [];
    for (const rule of list) {
      if (!rule.enabled) continue;
      if (rule.trigger.eventType !== eventType) continue;
      if (rule.condition && !this.matches(rule.condition, payload)) continue;
      if (!this.executor || rule.actions.length === 0) continue;
      const ctx = {
        tenantId,
        owner: tenantId,
        role: "system" as const,
        requestId: "reaction:" + rule.id,
      };
      await this.executor(ctx, rule.actions).catch(() => {});
    }
  }

  // REACTION_EVAL_EXEC_V1 - matcher minimo para condition.
  private matches(condition: string, payload: Record<string, unknown>): boolean {
    const trimmed = condition.trim();
    if (trimmed === "" || trimmed === "always") return true;
    if (trimmed === "never") return false;
    const m = trimmed.match(/^(\\w+)\\s*==\\s*['"]?(.+?)['"]?$/);
    if (!m) return false;
    return String(payload[m[1]]) === m[2];
  }
}
// REACTION_BUS_SUBSCRIBE_V1 - el engine escucha cada evento del bus y
// dispara las reglas que matcheen.
export interface EventLike {
  type: string;
  owner: string;
  tenantId?: string;
  payload?: Record<string, unknown>;
}

export async function subscribeToBus(
  bus: { list: (owner: string, filter: Record<string, unknown>) => Promise<EventLike[]> },
  engine: { evaluate: (tenantId: string, eventType: string, payload: Record<string, unknown>) => Promise<void> },
  getActiveTenants: () => Promise<string[]>,
): Promise<void> {
  const tick = async () => {
    const tenants = await getActiveTenants();
    for (const tenantId of tenants) {
      const events = await bus.list(tenantId, { limit: 200 }).catch(() => []);
      for (const e of events) {
        await engine.evaluate(tenantId, e.type, e.payload ?? {}).catch(() => {});
      }
    }
  };
  setInterval(() => { void tick().catch(() => {}); }, 60000);
  void tick().catch(() => {});
}