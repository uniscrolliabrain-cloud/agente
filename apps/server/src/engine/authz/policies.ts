// POLICIES_DEFAULT_V1 - traduce AgentRole a Policy con effect: allow.
// Anade politicas por defecto con effect: deny donde el owner no debe ser root.
import type { AgentRole } from "../../../../../packages/domain/src/agent.ts";
import type { Policy, PolicyAction, PolicyResource } from "../../../../../packages/domain/src/policy.ts";

const RESOURCE_MAP: Record<string, PolicyResource> = {
  task: "task", goal: "goal", monitor: "monitor", memory: "memory",
  artifact: "artifact", sop: "sop", role: "role", action: "action",
  computer: "computer", file: "file", rag: "rag", audit: "audit",
  presence: "presence", lock: "lock", notification: "notification",
  thread: "thread", project: "project",
};

export function buildPoliciesFromAgentRole(tenantId: string, role: AgentRole): Policy[] {
  const out: Policy[] = [];
  for (const perm of role.permissions ?? []) {
    const resource = RESOURCE_MAP[perm.resource] ?? (perm.resource as PolicyResource);
    for (const action of perm.actions as PolicyAction[]) {
      out.push({ id: `${tenantId}:${role.id}:${resource}:${action}`, subject: { role: "agent", kind: "agent" }, action, resource, effect: "allow", tenantId });
    }
  }
  for (const tool of role.allowedTools ?? []) {
    out.push({ id: `${tenantId}:${role.id}:tool:${tool}`, subject: { role: "agent", kind: "agent" }, action: "execute", resource: "action", effect: "allow", tenantId });
  }
  return out;
}

export function defaultPolicies(): Policy[] {
  return [
    { id: "default:deny:secret:read", subject: { kind: "human" }, action: "read", resource: "task", effect: "deny", field: "outcome", condition: { kind: "hasClassification", value: "secret" } },
  ];
}