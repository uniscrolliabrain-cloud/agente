// MESSAGING_V1 - mensajeria entre roles y aprobaciones primitivas.

import { z } from "zod";

export const agentMessageIntentSchema = z.enum([
  "request",
  "handoff",
  "approval",
  "result",
  "notification",
]);

export const agentMessageSchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  fromRoleId: z.string().min(1).max(200),
  toRoleId: z.string().min(1).max(200),
  goalId: z.string().max(200).optional(),
  taskId: z.string().max(200).optional(),
  runtimeId: z.string().max(200).optional(),
  intent: agentMessageIntentSchema,
  payload: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.iso.datetime({ offset: true }),
  readAt: z.iso.datetime({ offset: true }).optional(),
});

export const handoffSchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  fromRoleId: z.string().min(1).max(200),
  toRoleId: z.string().min(1).max(200),
  goalId: z.string().max(200).optional(),
  taskId: z.string().max(200).optional(),
  contextSummary: z.string().max(4000).optional(),
  requiredOutcome: z.string().max(2000).optional(),
  createdAt: z.iso.datetime({ offset: true }),
  acceptedAt: z.iso.datetime({ offset: true }).optional(),
});

export const approvalStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "expired",
]);

export const approvalRequestSchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  runtimeId: z.string().max(200).optional(),
  goalId: z.string().max(200).optional(),
  taskId: z.string().max(200).optional(),
  capabilityId: z.string().min(1).max(200),
  reason: z.string().min(1).max(2000),
  risk: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  status: approvalStatusSchema.default("pending"),
  payload: z.record(z.string(), z.unknown()).default({}),
  requestedAt: z.iso.datetime({ offset: true }),
  expiresAt: z.iso.datetime({ offset: true }),
  decidedAt: z.iso.datetime({ offset: true }).optional(),
  decidedBy: z.string().max(200).optional(),
});

export type AgentMessageIntent = z.infer<typeof agentMessageIntentSchema>;
export type AgentMessage = z.infer<typeof agentMessageSchema>;
export type Handoff = z.infer<typeof handoffSchema>;
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
export type ApprovalRequest = z.infer<typeof approvalRequestSchema>;