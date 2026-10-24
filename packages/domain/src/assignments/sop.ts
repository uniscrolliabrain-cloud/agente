// ASSIGNMENT_IMPL_V1 - SOP como Assignment (kind sop).
// 2.1: sin z.any(). Tipos reales del dominio.
import { z } from "zod";
import { assignmentSchema } from "../assignment.ts";

export const sopStepAssignmentSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  prompt: z.string().max(12000).optional(),
  allowedTools: z.array(z.string().max(200)).max(100).default([]),
});

export const sopAssignmentSchema = assignmentSchema.extend({
  kind: z.literal("sop"),
  steps: z.array(sopStepAssignmentSchema).max(200).default([]),
  allowedTools: z.array(z.string().max(200)).max(100).default([]),
  trigger: z.string().max(200).optional(),
  skillId: z.string().max(200).optional(),
  active: z.boolean().default(true),
});

export type SopAssignment = z.infer<typeof sopAssignmentSchema>;
