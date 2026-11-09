// REACTION_ENGINE_V1 - lee del bus y ejecuta ReactionRules.

import type { Store } from "../../db.ts";
import type { TenantScopedStore } from "../../db-tenant.ts";
import type { EventBus } from "../events/index.ts";
import type { ExecutionRole } from "../../../../../packages/domain/src/execution-context.ts";
import {
  reactionRuleSchema,
  type ReactionAction,
  type ReactionCondition,
  type ReactionRule,
} from "../../../../../packages/domain/src/policy-context.ts";
import type {
  ReactionDefinition,
  ReactionTarget,
  ReactionTrigger,
} from "../../../../../packages/domain/src/reaction.ts";

// REACTION_TRIGGER_WIRE_V1 - un trigger del dominio filtra por eventType y por
// los campos declarados en `filter`. Antes el filtro se ignoraba y la regla
// disparaba con cualquier payload del mismo tipo.
export function matchesTrigger(
  trigger: ReactionTrigger,
  eventType: string,
  payload: Record<string, unknown>,
): boolean {
  if (trigger.eventType !== eventType) return false;
  return Object.entries(trigger.filter).every(
    ([key, expected]) => JSON.stringify(payload[key]) === JSON.stringify(expected),
  );
}

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
    const rules = [...stored];
    // REACTION_POLICY_RULES_V1 - el formato ReactionRule (policy-context) se
    // normaliza al motor; antes solo se leia el formato ReactionDefinition.
    const policyRows = await this.db
      .list<ReactionRule>(tenantId, "reaction-rules")
      .catch(() => [] as ReactionRule[]);
    for (const row of policyRows) {
      const parsed = reactionRuleSchema.safeParse(row);
      if (parsed.success) rules.push(this.fromPolicyRule(parsed.data));
    }
    this.rules.set(tenantId, rules);
  }

  private fromPolicyRule(rule: ReactionRule): ReactionDefinition {
    const condition: ReactionCondition | undefined = rule.condition;
    const actions: ReactionAction[] = rule.actions;
    return {
      id: rule.id,
      tenantId: rule.tenantId,
      name: rule.id,
      enabled: rule.enabled,
      trigger: { eventType: rule.eventType, filter: {} },
      ...(condition
        ? { condition: condition.kind === "expression" ? condition.expression ?? "" : condition.kind }
        : {}),
      actions: actions.map((action) => ({
        kind: action.kind === "emit_event" ? "notify" : action.kind,
        params: action.params,
      })),
      targets: [],
      createdAt: rule.createdAt,
    };
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
      if (!matchesTrigger(rule.trigger, eventType, payload)) continue;
      if (rule.condition && !this.matches(rule.condition, payload)) continue;
      if (!this.executor || rule.actions.length === 0) continue;
      const role: ExecutionRole = "system";
      const ctx = {
        tenantId,
        owner: tenantId,
        role,
        requestId: "reaction:" + rule.id,
        // KERNEL_ACTOR_PORT_V1 - el motor de reacciones actua como sistema.
        actorId: "system",
      };
      await this.executor(ctx, rule.actions).catch(() => {});
      await this.deliverToTargets(tenantId, rule);
    }
  }

  // REACTION_TARGET_WIRE_V1 - los destinos declarados por la regla se
  // materializan: antes `targets` se validaba en el schema y se ignoraba.
  private async deliverToTargets(tenantId: string, rule: ReactionDefinition): Promise<void> {
    for (const target of rule.targets as ReactionTarget[]) {
      const delivery = {
        id: `reaction-${rule.id}-${target.kind}-${target.id}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        tenantId,
        ruleId: rule.id,
        kind: target.kind,
        targetId: target.id,
        createdAt: new Date().toISOString(),
      };
      await this.db.put(tenantId, "reaction-deliveries", delivery).catch(() => {});
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