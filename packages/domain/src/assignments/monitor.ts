// ASSIGNMENT_IMPL_V1 - Monitor como Assignment (kind monitor).
// 2.1: sin z.any(). Tipos reales del dominio.
import { z } from "zod";
import { assignmentSchema } from "../assignment.ts";

export const monitorAssignmentSchema = assignmentSchema.extend({
  kind: z.literal("monitor"),
  url: z.string().max(4096),
  condition: z.enum(["change", "contains", "price_below"]),
  value: z.string().max(300),
  intervalMinutes: z.number().int().min(1).max(10080),
  nextCheckAt: z.string(),
  lastCheckedAt: z.string().optional(),
  lastValue: z.string().max(1000).optional(),
  lastHash: z.string().max(200).optional(),
  checks: z.number().int().min(0).default(0),
});

export type MonitorAssignment = z.infer<typeof monitorAssignmentSchema>;
