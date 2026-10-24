// POLICY_MODEL_V1 - modelo ABAC declarativo con effect explicito.
// Fail-closed. Deny-overrides. Solo recursos reales del codigo.
import { z } from "zod";

export const policyActionSchema = z.enum([
  "read", "create", "update", "delete", "approve", "export", "assign", "escalate", "execute",
]);

export const policyResourceSchema = z.enum([
  "task", "goal", "monitor", "memory", "artifact", "sop", "role",
  "action", "computer", "file", "rag", "audit", "presence", "lock",
  "notification", "thread", "project",
]);

export const policySubjectSchema = z.object({
  actorId: z.string().min(1).max(200).optional(),
  role: z.enum(["owner", "manager", "employee", "hr", "compliance", "agent"]).optional(),
  kind: z.enum(["human", "agent"]).optional(),
});

export const policyConditionSchema = z.object({
  kind: z.enum(["ownedBy", "inTaskScope", "assignedBy", "hasClassification"]),
  value: z.string().min(1).max(200).optional(),
});

export const policyEffectSchema = z.enum(["allow", "deny"]);

export const policySchema = z.object({
  id: z.string().min(1).max(200),
  subject: policySubjectSchema,
  action: policyActionSchema,
  resource: policyResourceSchema,
  effect: policyEffectSchema,
  field: z.string().min(1).max(200).optional(),
  condition: policyConditionSchema.optional(),
  tenantId: z.string().min(1).max(100).optional(),
});

export const policyDecisionSchema = z.enum(["allow", "deny"]);

export type PolicyAction = z.infer<typeof policyActionSchema>;
export type PolicyResource = z.infer<typeof policyResourceSchema>;
export type PolicySubject = z.infer<typeof policySubjectSchema>;
export type PolicyCondition = z.infer<typeof policyConditionSchema>;
export type PolicyEffect = z.infer<typeof policyEffectSchema>;
export type Policy = z.infer<typeof policySchema>;
export type PolicyDecision = z.infer<typeof policyDecisionSchema>;