// ASSIGNMENT_IMPL_V1 - AgentTask como Assignment (kind task).
// 2.1: sin z.any(). Tipos reales del dominio, declarados localmente
//      porque TaskStep y Evidence son interface, no schema Zod.
import { z } from "zod";
import { assignmentSchema } from "../assignment.ts";

const taskStepAssignmentSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  status: z.enum(["pending", "running", "succeeded", "failed", "waiting"]),
  detail: z.string().max(2000).optional(),
  durationMs: z.number().int().nonnegative().optional(),
});

const evidenceAssignmentSchema = z.object({
  id: z.string().min(1).max(200),
  kind: z.enum(["mail", "file", "web", "user"]),
  title: z.string().min(1).max(300),
  excerpt: z.string().max(4000),
  url: z.string().max(4096).optional(),
});

const outcomeAssignmentSchema = z.object({
  status: z.enum(["achieved", "partial", "blocked", "failed", "unknown"]),
  summary: z.string().max(8000),
  evidence: z.array(evidenceAssignmentSchema).max(200).default([]),
  metrics: z.array(z.object({
    key: z.string().min(1).max(200),
    value: z.number(),
    unit: z.string().max(50).optional(),
  })).max(200).default([]),
  verified: z.boolean().default(false),
  verifiedAt: z.string().optional(),
  verificationNote: z.string().max(2000).optional(),
});

export const agentTaskAssignmentSchema = assignmentSchema.extend({
  kind: z.literal("task"),
  plan: z.array(taskStepAssignmentSchema).max(200).optional(),
  evidence: z.array(evidenceAssignmentSchema).max(50).default([]),
  outcome: outcomeAssignmentSchema.optional(),
  attempts: z.number().int().min(0).default(0),
  actionId: z.string().max(200).nullable().optional(),
  leaseId: z.string().nullable().optional(),
  leaseUntil: z.string().nullable().optional(),
});

export type AgentTaskAssignment = z.infer<typeof agentTaskAssignmentSchema>;
