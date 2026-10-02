// KERNEL_TENANT_CONFIG_V3 — config por tenant: LLM + capabilities + tiempos.
//
// Fusion de las dos versiones que circularon por el repo:
//   - ProviderSpec (fast, slow, embeddings) — el LLM del tenant. Vive en
//     provider-spec.ts y se importa aqui.
//   - TenantCapabilities — que partes del kernel estan activas. Idea valida
//     que aporto la otra IA: cada tenant puede tener caps distintas.
//   - tiempos — quiescenceMs, fastIdleMs, slowLongMs, maxThoughtsPerTurn.
//
// SOC-2: cada tenant puede tener sus propias keys, sus propios modelos y sus
// propias capacidades. Nada se asume global.

import { z } from "zod";
import { providerSpecSchema, type ProviderSpec } from "./provider-spec.ts";

export const tenantCapabilitiesSchema = z.object({
  fastChain: z.boolean().default(true),
  slowChain: z.boolean().default(true),
  rag: z.boolean().default(false),
  businessGraph: z.boolean().default(false),
  memory: z.boolean().default(false),
  policy: z.boolean().default(false),
  views: z.boolean().default(true),
  progress: z.boolean().default(true),
  meta: z.boolean().default(true),
  cromos: z.boolean().default(false),
});

export const tenantConfigSchema = z.object({
  tenantId: z.string().min(1).max(100),
  fast: providerSpecSchema,
  slow: providerSpecSchema,
  embeddings: providerSpecSchema.optional(),
  capabilities: tenantCapabilitiesSchema,
  quiescenceMs: z.number().int().min(0).max(600_000).default(10_000),
  fastIdleMs: z.number().int().min(0).max(60_000).default(1_000),
  slowLongMs: z.number().int().min(0).max(300_000).default(30_000),
  maxThoughtsPerTurn: z.number().int().min(1).max(5_000).default(500),
});

export type TenantCapabilities = z.infer<typeof tenantCapabilitiesSchema>;
export type TenantConfig = z.infer<typeof tenantConfigSchema>;

export interface TenantConfigResolver {
  resolve(tenantId: string): Promise<TenantConfig>;
}

// Reexport del tipo para que quien importe de tenant-config.ts tenga
// ProviderSpec a mano sin tener que saltar a provider-spec.ts.
export type { ProviderSpec };