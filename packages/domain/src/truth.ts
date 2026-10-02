// TRUTH_V1 - resolucion de verdad entre fuentes.

import { z } from "zod";

export const knowledgeKindSchema = z.enum(["fact", "inference", "user_assertion"]);

export const truthCandidateSchema = z.object({
  field: z.string().min(1).max(200),
  value: z.unknown(),
  source: z.string().min(1).max(200),
  observedAt: z.iso.datetime({ offset: true }),
  reliability: z.number().min(0).max(1).default(0.8),
  confidence: z.number().min(0).max(1).default(0.8),
  kind: knowledgeKindSchema.default("fact"),
});

export const truthResolutionSchema = z.object({
  field: z.string().min(1).max(200),
  value: z.unknown(),
  source: z.string().max(200),
  confidence: z.number().min(0).max(1),
  kind: knowledgeKindSchema,
  resolvedAt: z.iso.datetime({ offset: true }),
  conflicts: z.array(truthCandidateSchema).default([]),
  wasConflict: z.boolean().default(false),
});

export type KnowledgeKind = z.infer<typeof knowledgeKindSchema>;
export type TruthCandidate = z.infer<typeof truthCandidateSchema>;
export type TruthResolution = z.infer<typeof truthResolutionSchema>;