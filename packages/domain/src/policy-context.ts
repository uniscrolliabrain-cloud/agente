// POLICY_CONTEXT_V1 - contexto rico para evaluacion de politicas.

import { z } from "zod";

export const policyActionSchema = z.enum([
  "read",
  "create",
  "update",
  "delete",
  "execute",
  "approve",
]);

export const policyContextSchema = z.object({
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  roleId: z.string().max(200).optional(),
  resource: z.string().min(1).max(200),
  action: policyActionSchema,
  entityId: z.string().max(200).optional(),
  entityType: z.string().max(100).optional(),
  entityState: z.string().max(100).optional(),
  tool: z.string().max(200).optional(),
  toolArgs: z.record(z.string(), z.unknown()).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const fieldPolicySchema = z.object({
  id: z.string().min(1).max(100),
  resource: z.string().min(1).max(200),
  readable: z.array(z.string().max(100)).max(200).default([]),
  writable: z.array(z.string().max(100)).max(200).default([]),
});

export const reactionConditionSchema = z.object({
  kind: z.enum(["expression", "always", "never"]),
  expression: z.string().max(500).optional(),
});

export const reactionActionSchema = z.object({
  kind: z.enum(["create_task", "create_goal", "notify", "emit_event", "run_sop", "handoff"]),
  params: z.record(z.string(), z.unknown()).default({}),
});

export const reactionRuleSchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  eventType: z.string().min(1).max(200),
  condition: reactionConditionSchema.optional(),
  actions: z.array(reactionActionSchema).min(1).max(20),
  enabled: z.boolean().default(true),
  createdAt: z.iso.datetime({ offset: true }),
});

export type PolicyActionV2 = z.infer<typeof policyActionSchema>;
export type PolicyContext = z.infer<typeof policyContextSchema>;
export type FieldPolicy = z.infer<typeof fieldPolicySchema>;
export type ReactionCondition = z.infer<typeof reactionConditionSchema>;
export type ReactionAction = z.infer<typeof reactionActionSchema>;
export type ReactionRule = z.infer<typeof reactionRuleSchema>;