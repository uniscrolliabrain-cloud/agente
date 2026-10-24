// ASSIGNMENT_IMPL_V1 - Goal (goal.ts, Zod) como Assignment (kind goal).
// 2.1: sin z.any(). Tipos reales del dominio.
import { z } from "zod";
import { assignmentSchema } from "../assignment.ts";

const goalMilestoneAssignmentSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  done: z.boolean(),
});

export const goalAssignmentSchema = assignmentSchema.extend({
  kind: z.literal("goal"),
  category: z.string().min(1).max(80).optional(),
  milestones: z.array(goalMilestoneAssignmentSchema).max(100).default([]),
});

export type GoalAssignment = z.infer<typeof goalAssignmentSchema>;
