// LEARNING_V1 - aprendizaje real: hechos, patrones, fallos, procedural.

import { z } from "zod";

export const learningFactSchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  text: z.string().min(1).max(2000),
  source: z.string().min(1).max(200),
  confidence: z.number().min(0).max(1).default(0.7),
  evidenceIds: z.array(z.string().max(100)).max(50).default([]),
  timesUsed: z.number().int().nonnegative().default(0),
  successRate: z.number().min(0).max(1).default(1),
  lastVerifiedAt: z.iso.datetime({ offset: true }).optional(),
  createdAt: z.iso.datetime({ offset: true }),
});

export const learningPatternSchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  goalKind: z.string().min(1).max(200),
  planSignature: z.string().min(1).max(500),
  successCount: z.number().int().nonnegative().default(0),
  failureCount: z.number().int().nonnegative().default(0),
  avgDurationMs: z.number().nonnegative().default(0),
  proposedAsSop: z.boolean().default(false),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

export const failureLessonSchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  errorSignature: z.string().min(1).max(500),
  cause: z.string().max(2000),
  correction: z.string().max(2000),
  preventionRule: z.string().max(2000).optional(),
  occurrences: z.number().int().nonnegative().default(1),
  createdAt: z.iso.datetime({ offset: true }),
  lastSeenAt: z.iso.datetime({ offset: true }),
});

export const proceduralLearningSchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  sourcePatternId: z.string().min(1).max(100),
  proposedSop: z.record(z.string(), z.unknown()).default({}),
  status: z.enum(["proposed", "approved", "rejected", "active"]).default("proposed"),
  createdAt: z.iso.datetime({ offset: true }),
});

export type LearningFact = z.infer<typeof learningFactSchema>;
export type LearningPattern = z.infer<typeof learningPatternSchema>;
export type FailureLesson = z.infer<typeof failureLessonSchema>;
export type ProceduralLearning = z.infer<typeof proceduralLearningSchema>;