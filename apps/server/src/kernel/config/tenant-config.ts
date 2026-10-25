// KERNEL_TENANT_CONFIG_V3 â€” config por tenant: LLM + capabilities + tiempos.
//
// Fusion de las dos versiones que circularon por el repo:
//   - ProviderSpec (fast, slow, embeddings) â€” el LLM del tenant. Vive en
//     provider-spec.ts y se importa aqui.
//   - TenantCapabilities â€” que partes del kernel estan activas. Idea valida
//     que aporto la otra IA: cada tenant puede tener caps distintas.
//   - tiempos â€” quiescenceMs, fastIdleMs, slowLongMs, maxThoughtsPerTurn.
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
  // FIX_6A_TENANT_ROLES_V1 - modelo por rol. Opcional: si un rol no tiene
  // entrada, se usa la cadena fast/slow normal.
  roles: z.record(z.string().max(80), providerSpecSchema).optional(),
  capabilities: tenantCapabilitiesSchema,
  quiescenceMs: z.number().int().min(0).max(600_000).default(10_000),
  fastIdleMs: z.number().int().min(0).max(60_000).default(1_000),
  slowLongMs: z.number().int().min(0).max(300_000).default(30_000),
  maxThoughtsPerTurn: z.number().int().min(1).max(5_000).default(500),
  // TENANT_CONFIG_MAX_STEPS_V1 - max steps por tenant.
  maxSteps: z.number().int().min(1).max(100).default(6),
});

export type TenantCapabilities = z.infer<typeof tenantCapabilitiesSchema>;
export type TenantConfig = z.infer<typeof tenantConfigSchema>;

export interface TenantConfigResolver {
  resolve(tenantId: string): Promise<TenantConfig>;
}

// Reexport del tipo para que quien importe de tenant-config.ts tenga
// ProviderSpec a mano sin tener que saltar a provider-spec.ts.
export type { ProviderSpec };