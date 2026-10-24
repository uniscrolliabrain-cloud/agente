// POLICY_DECISION_POINT_V1 - ABAC fail-closed con deny-overrides y tenant.
// El PDP resuelve el AgentRole real, no construye role = { id }.
import type {
  Policy, PolicyAction, PolicyCondition, PolicyDecision, PolicyEffect, PolicyResource, PolicySubject,
} from "../../../../../packages/domain/src/policy.ts";
import type { Actor } from "../../../../../packages/domain/src/actor.ts";
import type { AgentRole } from "../../../../../packages/domain/src/agent.ts";

export interface PolicyContext {
  tenantId: string;
  actor: Actor;
  sessionId?: string;
  requestId?: string;
}

export interface PolicyTarget {
  ownerId?: string;
  taskScope?: string;
  assignedBy?: string;
  classification?: "public" | "internal" | "confidential" | "restricted" | "secret";
}

export interface PolicyDeps {
  engine?: { can: (owner: string, role: { id: string; permissions?: Array<{ resource: string; actions: string[] }> }, resource: string, action: string) => Promise<{ allowed: boolean; reason?: string }> };
  getAgentRole?: (tenantId: string, roleId: string) => Promise<AgentRole | null>;
}

export class PolicyDecisionPoint {
  constructor(
    private readonly policies: Policy[],
    private readonly deps: PolicyDeps = {},
  ) {}

  async can(
    ctx: PolicyContext,
    action: PolicyAction,
    resource: PolicyResource,
    field: string | undefined,
    target: PolicyTarget,
  ): Promise<PolicyDecision> {
    const applicable = this.policies.filter((p) =>
      p.resource === resource
      && p.action === action
      && (p.tenantId === undefined || p.tenantId === ctx.tenantId)
      && this.subjectMatches(p.subject, ctx.actor)
      && this.fieldMatches(p.field, field)
    );
    let sawAllow = false;
    for (const p of applicable) {
      const decision = this.decide(p, ctx, target);
      if (decision === "deny") return "deny";
      if (decision === "allow") sawAllow = true;
    }
    if (ctx.actor.kind === "agent" && "roleId" in ctx.actor) {
      const roleId = (ctx.actor as { roleId: string }).roleId;
      if (!this.deps.getAgentRole) return "deny";
      const role = await this.deps.getAgentRole(ctx.tenantId, roleId);
      if (!role) return "deny";
      const verdict = await this.deps.engine?.can(ctx.actor.id, role, resource, action);
      if (verdict && !verdict.allowed) return "deny";
    }
    return sawAllow ? "allow" : "deny";
  }

  private decide(p: Policy, ctx: PolicyContext, target: PolicyTarget): PolicyEffect {
    if (!p.condition) return p.effect;
    const allowed = this.evaluateCondition(p.condition, ctx, target);
    return allowed ? p.effect : (p.effect === "allow" ? "deny" : "allow");
  }

  private subjectMatches(subject: PolicySubject, actor: Actor): boolean {
    if (subject.actorId && subject.actorId !== actor.id) return false;
    if (subject.kind && subject.kind !== actor.kind) return false;
    if (subject.role && !actor.roles.includes(subject.role)) return false;
    return true;
  }

  private fieldMatches(policyField: string | undefined, field: string | undefined): boolean {
    if (!policyField) return true;
    if (!field) return false;
    return policyField === field || policyField === "*";
  }

  private evaluateCondition(condition: PolicyCondition, ctx: PolicyContext, target: PolicyTarget): boolean {
    switch (condition.kind) {
      case "ownedBy":
        return target.ownerId === ctx.actor.id;
      case "inTaskScope":
        return target.taskScope === condition.value;
      case "assignedBy":
        return target.assignedBy === condition.value;
      case "hasClassification":
        return target.classification === condition.value;
      default:
        return false;
    }
  }
}