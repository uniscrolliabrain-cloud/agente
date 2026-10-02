// REACTION_ENGINE_V1 - lee del bus y ejecuta ReactionRules.

import type { Store } from "../../db.ts";
import type { EventBus } from "../events/index.ts";
import type { ReactionDefinition } from "../../../../../packages/domain/src/reaction.ts";

export class ReactionEngine {
  private readonly rules = new Map<string, ReactionDefinition[]>();

  constructor(
    private readonly db: Store,
    private readonly bus?: EventBus,
  ) {}

  async register(tenantId: string, rule: ReactionDefinition): Promise<void> {
    const list = this.rules.get(tenantId) ?? [];
    list.push(rule);
    this.rules.set(tenantId, list);
    await this.db.put(tenantId, "reactions", rule);
  }

  async evaluate(tenantId: string, eventType: string, payload: Record<string, unknown>): Promise<void> {
    const list = this.rules.get(tenantId) ?? [];
    for (const rule of list) {
      if (!rule.enabled) continue;
      if (rule.trigger.eventType !== eventType) continue;
      // TODO: evaluar condition y ejecutar actions. Por ahora solo logueamos.
      void payload;
      void this.bus;
    }
  }
}