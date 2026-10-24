// ENTITY_RESOLUTION_V1 - resolucion de entidades duplicadas.

import { z } from "zod";

export const matchReasonSchema = z.enum([
  "same_id",
  "same_email",
  "same_cif",
  "same_phone",
  "normalized_name",
  "fuzzy_name",
  "same_domain",
  "manual_confirmation",
]);

export const entityCandidateSchema = z.object({
  id: z.string().max(200).optional(),
  type: z.string().min(1).max(100),
  name: z.string().max(300).optional(),
  email: z.string().max(300).optional(),
  cif: z.string().max(50).optional(),
  phone: z.string().max(50).optional(),
  domain: z.string().max(200).optional(),
  properties: z.record(z.string(), z.unknown()).default({}),
});

export const entityMatchSchema = z.object({
  candidateId: z.string().min(1).max(200),
  existingId: z.string().min(1).max(200),
  confidence: z.number().min(0).max(1),
  reasons: z.array(matchReasonSchema).min(1).max(20),
  decision: z.enum(["auto_merge", "propose_merge", "create_new"]).default("propose_merge"),
});

export type MatchReason = z.infer<typeof matchReasonSchema>;
export type EntityCandidate = z.infer<typeof entityCandidateSchema>;
export type EntityMatch = z.infer<typeof entityMatchSchema>;