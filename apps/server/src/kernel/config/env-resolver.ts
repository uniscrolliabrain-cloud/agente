// KERNEL_ENV_CONFIG_RESOLVER_V1 — config desde .env.
//
// Hoy todo el deployment es un tenant. Este resolver lee de .env y
// devuelve la config del tenant "default".
//
// TODO(KERNEL_CONFIG_DB_V1): cuando haya multi-tenant real,
// DatabaseTenantConfigResolver leera de records kind "tenant-config"
// y descifrara los apiKey con packages/integrations/src/vault.ts.
// La interfaz TenantConfigResolver no cambia.

import { type ProviderSpec, type TenantConfig, type TenantConfigResolver } from "./tenant-config.ts";

export class EnvTenantConfigResolver implements TenantConfigResolver {
  constructor(private readonly tenantId: string = "default") {}

  async resolve(tenantId: string): Promise<TenantConfig> {
    const fast: ProviderSpec = {
      provider: "google",
      model: process.env.FAST_LLM_MODEL ?? "gemini-3.6-flash",
      apiKey: process.env.FAST_LLM_API_KEY ?? "",
    };
    const slow: ProviderSpec = {
      provider: "google",
      model: process.env.SLOW_LLM_MODEL ?? "gemini-3.6-flash",
      apiKey: process.env.SLOW_LLM_API_KEY ?? "",
    };
    const embeddings: ProviderSpec = {
      provider: "google",
      model: process.env.EMBEDDINGS_LLM_MODEL ?? "text-embedding-004",
      apiKey:
        process.env.EMBEDDINGS_LLM_API_KEY ??
        process.env.FAST_LLM_API_KEY ??
        "",
    };
    return { tenantId: tenantId || this.tenantId, fast, slow, embeddings };
  }
}