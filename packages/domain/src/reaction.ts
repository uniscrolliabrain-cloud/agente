// REACTION_V1 - motor de reacciones a eventos.

import { z } from "zod";

export const reactionTriggerSchema = z.object({
  eventType: z.string().min(1).max(200),
  filter: z.record(z.string(), z.unknown()).default({}),
});

export const reactionTargetSchema = z.object({
  kind: z.enum(["role", "user", "entity", "goal"]),
  id: z.string().min(1).max(200),
});

export const reactionDefinitionSchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  enabled: z.boolean().default(true),
  trigger: reactionTriggerSchema,
  condition: z.string().max(1000).optional(),
  actions: z.array(z.object({
    kind: z.enum(["create_goal", "create_task", "notify", "handoff", "run_sop", "call_capability"]),
    params: z.record(z.string(), z.unknown()).default({}),
  })).min(1).max(20),
  targets: z.array(reactionTargetSchema).max(20).default([]),
  createdAt: z.iso.datetime({ offset: true }),
});

export type ReactionTrigger = z.infer<typeof reactionTriggerSchema>;
export type ReactionTarget = z.infer<typeof reactionTargetSchema>;
export type ReactionDefinition = z.infer<typeof reactionDefinitionSchema>;