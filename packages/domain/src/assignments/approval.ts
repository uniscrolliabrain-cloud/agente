// ASSIGNMENT_IMPL_V1 - ActionProposal como Assignment (kind approval).
// 2.1: sin z.any(). Tipos reales del dominio.
import { z } from "zod";
import { assignmentSchema } from "../assignment.ts";

export const approvalSignerAssignmentSchema = z.object({
  userId: z.string().min(1).max(200),
  signedAt: z.string(),
});

export const approvalAssignmentSchema = assignmentSchema.extend({
  kind: z.literal("approval"),
  hash: z.string().min(1).max(200),
  signers: z.array(approvalSignerAssignmentSchema).max(10).default([]),
  needed: z.number().int().min(1).max(10).default(1),
  executeAt: z.string().nullable().optional(),
  result: z.string().max(4000).nullable().optional(),
  error: z.string().max(4000).nullable().optional(),
  errorKind: z.enum(["business", "infra", "outcome_unknown"]).optional(),
});

export type ApprovalAssignment = z.infer<typeof approvalAssignmentSchema>;
