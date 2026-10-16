// KERNEL_ENV_RESOLVER_V3 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â TenantConfig completo desde .env.
//
// Lee:
//   - FAST_LLM_PROVIDER, FAST_LLM_MODEL, FAST_LLM_API_KEY
//   - SLOW_LLM_PROVIDER, SLOW_LLM_MODEL, SLOW_LLM_API_KEY
//   - EMBEDDINGS_LLM_PROVIDER, EMBEDDINGS_LLM_MODEL, EMBEDDINGS_LLM_API_KEY
//   - FAST_CHAIN, SLOW_CHAIN, RAG, BUSINESS_GRAPH, MEMORY, POLICY, VIEWS,
//     PROGRESS, META, CROMOS
//   - QUIESCENCE_MS, FAST_IDLE_MS, SLOW_LONG_MS, MAX_THOUGHTS_PER_TURN
//
// Fallback de keys: si FAST_LLM_API_KEY esta vacio, cae a SLOW_LLM_API_KEY.
// Si ambas estan vacias, queda vacio y el kernel no llamara al LLM (los
// autores fallan honestos). Sin default silencioso: si no hay key, no hay key.

import type {
  TenantCapabilities,
  TenantConfig,
  TenantConfigResolver,
} from "./tenant-config.ts";

type Provider = "google" | "anthropic" | "openai" | "openrouter";

function boolEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return raw === "1" || raw.toLowerCase() === "true";
}

function numEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function providerEnv(name: string, fallback: Provider): Provider {
  const raw = process.env[name]?.trim().toLowerCase();
  if (raw === "google" || raw === "anthropic" || raw === "openai" || raw === "openrouter") {
    return raw;
  }
  return fallback;
}

// ENV_RESOLVER_VALIDATE_V1 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â parsea con tenantConfigSchema antes de
  // devolver. Antes, un valor raro caÃƒÆ’Ã‚Â­a silenciosamente al default.
  // Ver: auditorÃƒÆ’Ã‚Â­a profunda 09.
  import { tenantConfigSchema } from "./tenant-config.ts";

  // CONFIG_CACHE_V1 - cache de TenantConfig por tenant (TTL 5 min).
// FIX_3_CACHE_TENANT_CONFIG_V1 - cache de TenantConfig por tenant (TTL configurable).
export class EnvTenantConfigResolver implements TenantConfigResolver {
  private readonly cache = new Map<string, { config: TenantConfig; expiresAt: number }>();
  private readonly ttlMs = Number(process.env.TENANT_CONFIG_TTL_MS ?? "300000") || 300000;
  async resolve(tenantId: string): Promise<TenantConfig> {
    // FIX_3_CACHE_TENANT_CONFIG_V1 - cache hit antes de leer envs.
    const now = Date.now();
    const cached = this.cache.get(tenantId);
    if (cached && cached.expiresAt > now) return cached.config;
    const fastKey = process.env.FAST_LLM_API_KEY?.trim() ?? "";
    const slowKey = process.env.SLOW_LLM_API_KEY?.trim() ?? "";
    // FIX_2_VALIDATE_KEYS_V1 - warn si las API keys estan vacias.
    if (!fastKey) {
      console.warn(`[kernel/env-resolver] tenant ${tenantId}: FAST_LLM_API_KEY vacia. Chat usara chain global.`);
    }
    if (!slowKey) {
      console.warn(`[kernel/env-resolver] tenant ${tenantId}: SLOW_LLM_API_KEY vacia. Tareas usaran chain global.`);
    }
    const embeddingsKey =
      process.env.EMBEDDINGS_LLM_API_KEY?.trim() ?? fastKey ?? "";

    const capabilities: TenantCapabilities = {
      fastChain: boolEnv("FAST_CHAIN", true),
      slowChain: boolEnv("SLOW_CHAIN", true),
      rag: boolEnv("RAG", false),
      businessGraph: boolEnv("BUSINESS_GRAPH", false),
      memory: boolEnv("MEMORY", false),
      policy: boolEnv("POLICY", false),
      views: boolEnv("VIEWS", true),
      progress: boolEnv("PROGRESS", true),
      meta: boolEnv("META", true),
      cromos: boolEnv("CROMOS", false),
    };

    const candidate = {
      tenantId,
      fast: {
        provider: providerEnv("FAST_LLM_PROVIDER", "google"),
        model: process.env.FAST_LLM_MODEL?.trim() ?? "gemini-3.6-flash",
        apiKey: fastKey,
        ...(process.env.FAST_LLM_BASE_URL?.trim() ? { baseUrl: process.env.FAST_LLM_BASE_URL.trim() } : {}), // FIX_7_BASEURL_TENANT_V1
      },
      slow: {
        provider: providerEnv("SLOW_LLM_PROVIDER", "google"),
        model: process.env.SLOW_LLM_MODEL?.trim() ?? "gemini-3.6-flash",
        apiKey: slowKey,
        ...(process.env.SLOW_LLM_BASE_URL?.trim() ? { baseUrl: process.env.SLOW_LLM_BASE_URL.trim() } : {}), // FIX_7_BASEURL_TENANT_V1
      },
      embeddings: {
        provider: providerEnv("EMBEDDINGS_LLM_PROVIDER", "google"),
        model: process.env.EMBEDDINGS_LLM_MODEL?.trim() ?? "text-embedding-004",
        apiKey: embeddingsKey,
        ...(process.env.EMBEDDINGS_LLM_BASE_URL?.trim() ? { baseUrl: process.env.EMBEDDINGS_LLM_BASE_URL.trim() } : {}), // FIX_7_BASEURL_TENANT_V1
      },
      capabilities,
      quiescenceMs: numEnv("QUIESCENCE_MS", 10_000),
      fastIdleMs: numEnv("FAST_IDLE_MS", 1_000),
      slowLongMs: numEnv("SLOW_LONG_MS", 30_000),
      maxThoughtsPerTurn: numEnv("MAX_THOUGHTS_PER_TURN", 500),
    };
    // ENV_RESOLVER_VALIDATE_V1 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â parse; si falla, log y fallback.
    const parsed = tenantConfigSchema.safeParse(candidate);
    if (parsed.success) {
      this.cache.set(tenantId, { config: parsed.data, expiresAt: now + this.ttlMs });
      return parsed.data;
    }
    console.warn(
      `[kernel/env-resolver] tenant ${tenantId} config invÃƒÆ’Ã‚Â¡lido: ${parsed.error.issues[0]?.message ?? "unknown"}`,
    );
    const fallback = candidate as unknown as TenantConfig;
    this.cache.set(tenantId, { config: fallback, expiresAt: now + this.ttlMs });
    return fallback;
  }
}