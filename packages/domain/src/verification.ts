// VERIFICATION_CONFIDENCE_V2 - confidence y umbral 0.6.
// VERIFICATION_V1 - verificacion de un Outcome contra un Goal.

import { z } from "zod";

export const verificationResultSchema = z.object({
  verified: z.boolean(),
  reason: z.string().max(2000),
  missing: z.array(z.string().max(500)).max(50).default([]),
  satisfiedCriteria: z.array(z.string().max(200)).max(50).default([]),
  failedCriteria: z.array(z.string().max(200)).max(50).default([]),
  confidence: z.number().min(0).max(1).default(1),
  method: z.enum(["deterministic", "llm", "hybrid", "manual"]).default("deterministic"),
  verifiedAt: z.iso.datetime({ offset: true }),
});

export type VerificationResult = z.infer<typeof verificationResultSchema>;