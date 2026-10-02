import { z } from "zod";
import type { EventBus } from "../events/index.ts";

// POLICY_ENGINE_V1 — permisos declarativos por rol. Un rol sin `permissions`
// definidos se comporta como hoy (todo permitido dentro de sus sops). Un rol
// con `permissions` es una allowlist adicional.

export const policyActionSchema = z.enum([
  "read",
  "create",
  "update",
  "delete",
  "execute",
  "approve",
]);

export const permissionSchema = z.object({
  resource: z.string().min(1).max(200),
  actions: z.array(policyActionSchema).min(1).max(20),
});

export type PolicyAction = z.infer<typeof policyActionSchema>;
export type Permission = z.infer<typeof permissionSchema>;

export interface PolicyRoleInput {
  id: string;
  permissions?: Permission[];
}

export interface PolicyDecision {
  allowed: boolean;
  reason?: string;
}

export class PolicyEngine {
  constructor(private readonly bus?: EventBus) {}

  /**
   * POLICY_CONTEXT_METHOD_V1 - evalua con contexto rico. Hoy delega en `can`
   * con los campos del contexto. Cuando se implementen condiciones contextuales,
   * se amplia esta firma.
   */
  async canWithContext(
    ctx: import("../../../../../packages/domain/src/policy-context.ts").PolicyContext,
    role: PolicyRoleInput,
  ): Promise<PolicyDecision> {
    return this.can(ctx.tenantId, role, ctx.resource, ctx.action);
  }

  async can(
    owner: string,
    role: PolicyRoleInput,
    resource: string,
    action: PolicyAction,
  ): Promise<PolicyDecision> {
    // Sin permisos declarados: allowlist no activa. Comportamiento actual.
    if (!role.permissions || role.permissions.length === 0) {
      await this.bus?.emit(owner, "policy.evaluated", { kind: "policy", id: `${role.id}:${resource}:${action}` }, {
        roleId: role.id,
        policyId: role.id,
        action,
        decision: "allow",
      });
      return { allowed: true };
    }
    const permission = role.permissions.find((item) => item.resource === resource);
    const allowed = Boolean(permission?.actions.includes(action));
    await this.bus?.emit(owner, "policy.evaluated", { kind: "policy", id: `${role.id}:${resource}:${action}` }, {
      roleId: role.id,
      policyId: role.id,
      action,
      decision: allowed ? "allow" : "deny",
    });
    if (!allowed) {
      const reason = `Role ${role.id} cannot ${action} on ${resource}`;
      await this.bus?.emit(owner, "policy.denied", { kind: "policy", id: `${role.id}:${resource}:${action}` }, {
        roleId: role.id,
        policyId: role.id,
        action,
        reason,
      });
      return { allowed: false, reason };
    }
    return { allowed: true };
  }
}
