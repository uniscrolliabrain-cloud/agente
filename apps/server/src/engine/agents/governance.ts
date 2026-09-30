import type { AgentRole } from "../../../../../packages/domain/src/agent.ts";
import type { EventBus } from "../events/index.ts";
import type { PolicyEngine, PolicyAction } from "../policy/engine.ts";

// AGENT_GOVERNANCE_V1 — capa de gobierno sobre PolicyEngine. Decide si un rol
// puede ejecutar una accion concreta. Audita el resultado al bus.

export interface GovernanceDecision {
  allowed: boolean;
  reason?: string;
}

export class AgentGovernance {
  constructor(
    private readonly policy: PolicyEngine,
    private readonly bus?: EventBus,
  ) {}

  async canExecuteTool(
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
    // Regla 2: PolicyEngine decide sobre resource "tool:<tool>".
    const decision = await this.policy.can(owner, role, `tool:${tool}`, "execute");
    return decision;
  }

  async canExecuteAction(
    owner: string,
    role: AgentRole,
    action: string,
    policyAction: PolicyAction,
  ): Promise<GovernanceDecision> {
    return this.policy.can(owner, role, `action:${action}`, policyAction);
  }
}
