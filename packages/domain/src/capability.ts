// CAPABILITY_V1 - capacidad ejecutable del sistema (tool, skill, SOP).

import { z } from "zod";

export const capabilityRiskSchema = z.enum(["low", "medium", "high", "critical"]);

export const capabilitySideEffectSchema = z.object({
  kind: z.enum(["read", "write", "external_write", "notification"]),
  target: z.string().min(1).max(200),
  reversible: z.boolean(),
  description: z.string().max(500).optional(),
});

export const capabilityCostSchema = z.object({
  timeMs: z.number().int().nonnegative().optional(),
  tokens: z.number().int().nonnegative().optional(),
  currencyEur: z.number().nonnegative().optional(),
});

export const capabilityContractSchema = z.object({
  id: z.string().min(1).max(200),
  version: z.string().min(1).max(50).default("1.0.0"),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).default(""),
  kind: z.enum(["tool", "skill", "sop", "composite"]),
  inputs: z.record(z.string(), z.unknown()).default({}),
  outputs: z.record(z.string(), z.unknown()).default({}),
  preconditions: z.array(z.string().max(500)).max(50).default([]),
  sideEffects: z.array(capabilitySideEffectSchema).max(50).default([]),
  permissions: z.array(z.string().max(200)).max(50).default([]),
  risk: capabilityRiskSchema.default("low"),
  cost: capabilityCostSchema.default({}),
  idempotency: z.enum(["idempotent", "at-most-once", "at-least-once"]).default("idempotent"),
  retryable: z.boolean().default(false),
  compensatable: z.boolean().default(false),
  compensationId: z.string().max(200).optional(),
  requiresApproval: z.boolean().default(false),
  tags: z.array(z.string().max(100)).max(50).default([]),
});

export type CapabilityRisk = z.infer<typeof capabilityRiskSchema>;
export type CapabilitySideEffect = z.infer<typeof capabilitySideEffectSchema>;
export type CapabilityCost = z.infer<typeof capabilityCostSchema>;
export type CapabilityContract = z.infer<typeof capabilityContractSchema>;