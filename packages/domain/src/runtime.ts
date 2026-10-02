// RUNTIME_V1 - runtime efimero de un agente durante una ejecucion.

import { z } from "zod";

export const runtimePhaseSchema = z.enum([
  "created",
  "planning",
  "executing",
  "waiting",
  "verifying",
  "completed",
  "failed",
  "cancelled",
]);

export const agentRuntimeSchema = z.object({
  runtimeId: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  roleId: z.string().max(200).optional(),
  goalId: z.string().max(200).optional(),
  taskId: z.string().max(200).optional(),
  phase: runtimePhaseSchema,
  startedAt: z.iso.datetime({ offset: true }),
  finishedAt: z.iso.datetime({ offset: true }).optional(),
  planId: z.string().max(100).optional(),
  stepIndex: z.number().int().nonnegative().optional(),
  observations: z.array(z.record(z.string(), z.unknown())).max(500).default([]),
  errors: z.array(z.object({
    phase: z.string().max(100),
    message: z.string().max(2000),
    timestamp: z.iso.datetime({ offset: true }),
  })).max(100).default([]),
});

export const runtimeCheckpointSchema = z.object({
  runtimeId: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  phase: runtimePhaseSchema,
  planId: z.string().max(100).optional(),
  stepIndex: z.number().int().nonnegative().optional(),
  state: z.record(z.string(), z.unknown()).default({}),
  updatedAt: z.iso.datetime({ offset: true }),
});

export type RuntimePhase = z.infer<typeof runtimePhaseSchema>;
export type AgentRuntime = z.infer<typeof agentRuntimeSchema>;
export type RuntimeCheckpoint = z.infer<typeof runtimeCheckpointSchema>;