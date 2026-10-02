// PLAN_V1 - plan versionado de ejecucion.

import { z } from "zod";

export const planStatusSchema = z.enum([
  "draft",
  "approved",
  "executing",
  "paused",
  "completed",
  "failed",
  "cancelled",
]);

export const planStepStatusSchema = z.enum([
  "pending",
  "ready",
  "running",
  "succeeded",
  "failed",
  "skipped",
  "compensated",
]);

export const planStepSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(300),
  capabilityId: z.string().max(200).optional(),
  inputs: z.record(z.string(), z.unknown()).default({}),
  dependsOn: z.array(z.string().max(100)).max(50).default([]),
  expectedOutcome: z.string().max(2000).optional(),
  status: planStepStatusSchema.default("pending"),
  retry: z.object({
    maxAttempts: z.number().int().min(1).max(10).default(1),
    strategy: z.enum(["fixed", "linear", "exponential"]).default("exponential"),
    baseMs: z.number().int().min(100).max(60000).default(1000),
  }).optional(),
  compensation: z.object({
    capabilityId: z.string().min(1).max(200),
    inputs: z.record(z.string(), z.unknown()).default({}),
  }).optional(),
});

export const planSchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  goalId: z.string().min(1).max(100),
  runtimeId: z.string().max(200).optional(),
  version: z.number().int().positive().default(1),
  status: planStatusSchema.default("draft"),
  steps: z.array(planStepSchema).max(200).default([]),
  reason: z.string().max(4000).optional(),
  previousPlanId: z.string().max(100).optional(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

export type PlanStatus = z.infer<typeof planStatusSchema>;
export type PlanStepStatus = z.infer<typeof planStepStatusSchema>;
export type PlanStep = z.infer<typeof planStepSchema>;
export type Plan = z.infer<typeof planSchema>;