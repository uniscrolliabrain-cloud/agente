import type { AgentRole } from "../../../../../packages/domain/src/agent.ts";
import type { EventBus } from "../events/index.ts";
import type { PolicyEngine, PolicyAction } from "../policy/engine.ts";
import type { PolicyDecisionPoint, PolicyContext } from "../authz/pdp.ts";

// AGENT_GOVERNANCE_V1 Ã¢â‚¬â€ capa de gobierno sobre PolicyEngine. Decide si un rol
// puede ejecutar una accion concreta. Audita el resultado al bus.

export interface GovernanceDecision {
  allowed: boolean;
  reason?: string;
}

export class AgentGovernance {
  constructor(
    private readonly policy: PolicyEngine,
    private readonly bus?: EventBus,
    private readonly pdp?: PolicyDecisionPoint,
  ) {}

  // AGENT_GOVERNANCE_ACTOR_V1 - B4: actorId separado de owner.
  async canExecuteTool(
    actor: import("../../../../../packages/domain/src/actor.ts").Actor,
    owner: string,
    role: AgentRole,
    tool: string,
  ): Promise<GovernanceDecision> {
    // Regla 1: si el rol declara allowedTools explicitos, la tool debe estar.
    if (role.allowedTools && role.allowedTools.length > 0 && !role.allowedTools.includes(tool)) {
      await this.bus?.emit(owner, "policy.denied", { kind: "policy", id: `${role.id}:tool:${tool}` }, {
        roleId: role.id,
        policyId: role.id,
        action: "execute",
        reason: `Tool ${tool} not allowed by role ${role.id}`,
      });
      return { allowed: false, reason: `Tool ${tool} not allowed by role ${role.id}` };
    }
    // AGENT_GOVERNANCE_PDP_V1 - Regla 2 con PDP si esta inyectado; fallback a PolicyEngine.can.`n    if (this.pdp) {`n      const policyCtx: PolicyContext = { tenantId: actor.tenantId, actor };`n      const target = { ownerId: owner };`n      const decision = await this.pdp.can(policyCtx, "execute", "action", undefined, target);`n      if (decision === "deny") return { allowed: false, reason: `"PDP denied tool ${tool}`" };`n      return { allowed: true };`n    }`n    const decision = await this.policy.can(owner, role, `tool:${tool}`, "execute");`n    return decision;
  }

  async canExecuteAction(
    actor: import("../../../../../packages/domain/src/actor.ts").Actor,
    owner: string,
    role: AgentRole,
    action: string,
    policyAction: PolicyAction,
  ): Promise<GovernanceDecision> {
    // AGENT_GOVERNANCE_PDP_V1 - canExecuteAction con PDP si esta inyectado; fallback a PolicyEngine.can.`n    if (this.pdp) {`n      const policyCtx: PolicyContext = { tenantId: actor.tenantId, actor };`n      const target = { ownerId: owner };`n      const decision = await this.pdp.can(policyCtx, policyAction, "action", undefined, target);`n      if (decision === "deny") return { allowed: false, reason: `"PDP denied action ${action}`" };`n      return { allowed: true };`n    }`n    return this.policy.can(owner, role, `action:${action}`, policyAction);
  }
}
