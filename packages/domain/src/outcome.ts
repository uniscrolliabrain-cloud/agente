// OUTCOME_V1 - resultado estructurado de una ejecucion.

import { z } from "zod";

export const outcomeStatusSchema = z.enum([
  "achieved",
  "partial",
  "blocked",
  "failed",
  "unknown",
]);

export const outcomeEvidenceSchema = z.object({
  id: z.string().min(1).max(100),
  kind: z.enum(["fact", "inference", "user_assertion", "observation"]),
  source: z.string().min(1).max(300),
  excerpt: z.string().max(4000).optional(),
  url: z.string().max(2000).optional(),
  timestamp: z.iso.datetime({ offset: true }),
  confidence: z.number().min(0).max(1).optional(),
});

export const outcomeMetricSchema = z.object({
  key: z.string().min(1).max(200),
  value: z.number(),
  unit: z.string().max(50).optional(),
});

export const outcomeSchema = z.object({
  status: outcomeStatusSchema,
  summary: z.string().max(8000),
  evidence: z.array(outcomeEvidenceSchema).max(200).default([]),
  metrics: z.array(outcomeMetricSchema).max(200).default([]),
  verified: z.boolean().default(false),
  verifiedAt: z.iso.datetime({ offset: true }).optional(),
  verificationNote: z.string().max(2000).optional(),
});

export type OutcomeStatus = z.infer<typeof outcomeStatusSchema>;
export type OutcomeEvidence = z.infer<typeof outcomeEvidenceSchema>;
export type OutcomeMetric = z.infer<typeof outcomeMetricSchema>;
export type Outcome = z.infer<typeof outcomeSchema>;