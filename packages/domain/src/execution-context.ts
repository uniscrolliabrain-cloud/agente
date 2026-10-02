// EXECUTION_CONTEXT_V1 - contexto unificado que viaja por todas las APIs internas.

import { z } from "zod";

export const executionRoleSchema = z.enum(["admin", "user", "agent", "system"]);

export const executionContextSchema = z.object({
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  role: executionRoleSchema,
  roleId: z.string().max(200).optional(),
  requestId: z.string().min(1).max(100),
  correlationId: z.string().max(200).optional(),
  runtimeId: z.string().max(200).optional(),
  goalId: z.string().max(200).optional(),
  taskId: z.string().max(200).optional(),
  threadId: z.string().max(200).optional(),
  turnId: z.string().max(200).optional(),
});

export type ExecutionRole = z.infer<typeof executionRoleSchema>;
export type ExecutionContext = z.infer<typeof executionContextSchema>;