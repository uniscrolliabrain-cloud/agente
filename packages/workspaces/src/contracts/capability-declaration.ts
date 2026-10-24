// CAPABILITY_DECLARATION_V1 — declaracion tipada de las capacidades que
// un workspace aporta al CapabilityRegistry del runtime. El contract real
// es CapabilityContract (packages/domain/src/capability.ts). Este sobre
// vive dentro del modulo y el adapter lo traduce al contract del registry.

import { z } from "zod";

export const capabilityDeclarationSchema = z.object({
  id: z.string().min(1).max(150),
  title: z.string().min(1).max(300),
  description: z.string().max(1000).default(""),
  kind: z.enum(["query", "action", "composite"]),
  risk: z.enum(["low", "medium", "high"]),
  sideEffects: z.boolean(),
  requiresApproval: z.boolean(),
  inputs: z.record(z.string(), z.unknown()).default({}),
  outputs: z.record(z.string(), z.unknown()).default({}),
});

export type CapabilityDeclaration = z.infer<
  typeof capabilityDeclarationSchema
>;