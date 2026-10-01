// KERNEL_TENANT_CONFIG_V1 — configuracion LLM por tenant.
//
// El kernel necesita dos velocidades: fast (habla con el usuario) y slow
// (razona en background). Cada una con su API key. Dos cuentas de Google
// para cuotas separadas, mismo modelo gemini-3.6-flash.
//
// Hoy: EnvTenantConfigResolver lee de .env.
// Manana: DatabaseTenantConfigResolver lee de records, descifra con vault.

import { z } from "zod";

export const providerSpecSchema = z.object({
  provider: z.enum(["google", "anthropic", "openai", "openrouter"]),
  model: z.string().min(1).max(200),
  apiKey: z.string().max(2000),
  baseUrl: z.string().max(2000).optional(),
});

export type ProviderSpec = z.infer<typeof providerSpecSchema>;

export interface TenantConfig {
  tenantId: string;
  fast: ProviderSpec;
  slow: ProviderSpec;
  embeddings?: ProviderSpec;
}

export interface TenantConfigResolver {
  resolve(tenantId: string): Promise<TenantConfig>;
}