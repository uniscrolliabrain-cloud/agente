// GOAL_V1 - objetivo empresarial con estado deseado y criterios de exito.

import { z } from "zod";

export const goalStatusSchema = z.enum([
  "draft",
  "active",
  "waiting",
  "achieved",
  "partial",
  "blocked",
  "failed",
  "cancelled",
]);

export const goalPrioritySchema = z.enum(["low", "medium", "high", "critical"]);

export const successCriterionSchema = z.object({
  id: z.string().min(1).max(100),
  kind: z.enum(["metric", "boolean", "count", "state"]),
  key: z.string().min(1).max(200),
  operator: z.enum([">=", "<=", "==", "!=", ">", "<"]),
  value: z.unknown(),
  description: z.string().max(500).optional(),
});

export const goalConstraintSchema = z.object({
  id: z.string().min(1).max(100),
  kind: z.enum(["budget", "deadline", "policy", "custom"]),
  value: z.unknown(),
  description: z.string().max(500).optional(),
});

export const goalSchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  roleId: z.string().max(200).optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(4000).default(""),
  desiredState: z.record(z.string(), z.unknown()).default({}),
  successCriteria: z.array(successCriterionSchema).max(50).default([]),
  constraints: z.array(goalConstraintSchema).max(50).default([]),
  priority: goalPrioritySchema.default("medium"),
  deadline: z.iso.datetime({ offset: true }).optional(),
  status: goalStatusSchema.default("draft"),
  parentGoalId: z.string().max(100).optional(),
  entityId: z.string().max(200).optional(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
  achievedAt: z.iso.datetime({ offset: true }).optional(),
});

export type GoalStatus = z.infer<typeof goalStatusSchema>;
export type GoalPriority = z.infer<typeof goalPrioritySchema>;
export type SuccessCriterion = z.infer<typeof successCriterionSchema>;
export type GoalConstraint = z.infer<typeof goalConstraintSchema>;
export type Goal = z.infer<typeof goalSchema>;