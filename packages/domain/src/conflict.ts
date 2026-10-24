// CONFLICT_MODEL_V1 - tipos de conflicto para CAS y diff por campo.
import { z } from "zod";

export const conflictDiffSchema = z.record(
  z.string().min(1).max(200),
  z.object({ before: z.unknown(), after: z.unknown() }),
);

export const conflictVersionSchema = z.object({
  current: z.number().int().positive(),
  expected: z.number().int().positive(),
  actorId: z.string().min(1).max(200).optional(),
  at: z.string().optional(),
});

export const conflictResolutionSchema = z.object({
  kind: z.enum(["client-retry", "server-merge", "human-review", "discard"]),
  resolvedBy: z.string().min(1).max(200).optional(),
  resolvedAt: z.string().optional(),
  note: z.string().max(2000).optional(),
});

export type ConflictDiff = z.infer<typeof conflictDiffSchema>;
export type ConflictVersion = z.infer<typeof conflictVersionSchema>;
export type ConflictResolution = z.infer<typeof conflictResolutionSchema>;
