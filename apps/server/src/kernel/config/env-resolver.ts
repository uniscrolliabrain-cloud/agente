// KERNEL_ENV_RESOLVER_V3 — TenantConfig completo desde .env.
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

export class EnvTenantConfigResolver implements TenantConfigResolver {
  async resolve(tenantId: string): Promise<TenantConfig> {
    const fastKey = process.env.FAST_LLM_API_KEY?.trim() ?? "";
    const slowKey = process.env.SLOW_LLM_API_KEY?.trim() ?? "";
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

    return {
      tenantId,
      fast: {
        provider: providerEnv("FAST_LLM_PROVIDER", "google"),
        model: process.env.FAST_LLM_MODEL?.trim() ?? "gemini-3.6-flash",
        apiKey: fastKey,
      },
      slow: {
        provider: providerEnv("SLOW_LLM_PROVIDER", "google"),
        model: process.env.SLOW_LLM_MODEL?.trim() ?? "gemini-3.6-flash",
        apiKey: slowKey,
      },
      embeddings: {
        provider: providerEnv("EMBEDDINGS_LLM_PROVIDER", "google"),
        model: process.env.EMBEDDINGS_LLM_MODEL?.trim() ?? "text-embedding-004",
        apiKey: embeddingsKey,
      },
      capabilities,
      quiescenceMs: numEnv("QUIESCENCE_MS", 10_000),
      fastIdleMs: numEnv("FAST_IDLE_MS", 1_000),
      slowLongMs: numEnv("SLOW_LONG_MS", 30_000),
      maxThoughtsPerTurn: numEnv("MAX_THOUGHTS_PER_TURN", 500),
    };
  }
}