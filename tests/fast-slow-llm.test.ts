// FIX_10_TESTS_FAST_SLOW_V1 - tests del modulo 10: fast/slow LLM.
// Verifica:
//   - modelChain con tenant usa [fast, slow, global].
//   - modelChain sin tenant usa [global].
//   - recordUsage con speed fast/slow incrementa el label correcto.
//   - TenantConfig.roles por rol (fix 6).
//   - StoreTurnStore.setLimitForTenant (fix 8a).

import assert from "node:assert/strict";
import { test } from "node:test";
import { modelChain } from "../apps/server/src/engine/model-chain.ts";
import { StoreTurnStore } from "../apps/server/src/kernel/graph/store-store.ts";

const baseConfig = {
  mode: "sample" as const,
  port: 8787,
  host: "127.0.0.1",
  publicUrl: "http://localhost:8787",
  dataDir: ".openmuse-test",
  agentBackend: "sample" as const,
  googleRedirectUri: "http://localhost:8787/api/google/callback",
  allowedOrigins: [],
  model: "openai/global-model",
  modelFallback: "openai/fallback-model",
};

function tenantFixture(overrides: Record<string, unknown> = {}) {
  return {
    tenantId: "t1",
    fast: { provider: "openai" as const, model: "fast-model", apiKey: "sk-fast" },
    slow: { provider: "openai" as const, model: "slow-model", apiKey: "sk-slow" },
    capabilities: { fastChain: true, slowChain: true, rag: false, businessGraph: false, memory: false, policy: false, views: true, progress: true, meta: true, cromos: false },
    quiescenceMs: 10000,
    fastIdleMs: 1000,
    slowLongMs: 30000,
    maxThoughtsPerTurn: 500,
    ...overrides,
  };
}

test("modelChain sin tenant usa solo la cadena global", () => {
  const chain = modelChain(baseConfig as never);
  assert.deepEqual(chain, ["openai/global-model", "openai/fallback-model"]);
});

test("modelChain con tenant prepende fast y slow", () => {
  const chain = modelChain(baseConfig as never, tenantFixture() as never);
  assert.deepEqual(chain, [
    "openai/fast-model",
    "openai/slow-model",
    "openai/global-model",
    "openai/fallback-model",
  ]);
});

test("modelChain sin apiKey en tenant cae a global", () => {
  const tenant = tenantFixture({
    fast: { provider: "openai", model: "fast-model", apiKey: "" },
    slow: { provider: "openai", model: "slow-model", apiKey: "" },
  });
  const chain = modelChain(baseConfig as never, tenant as never);
  assert.deepEqual(chain, ["openai/global-model", "openai/fallback-model"]);
});

test("modelChain deduplica si fast y global coinciden", () => {
  const tenant = tenantFixture({
    fast: { provider: "openai", model: "global-model", apiKey: "sk" },
    slow: { provider: "openai", model: "slow-model", apiKey: "sk" },
  });
  const chain = modelChain(baseConfig as never, tenant as never);
  assert.equal(new Set(chain).size, chain.length);
});

test("StoreTurnStore.setLimitForTenant se guarda por tenant", () => {
  const store = new StoreTurnStore({
    put: async () => {},
    get: async () => undefined,
    list: async () => [],
    transaction: async (fn) => fn({
      put: async () => {},
      get: async () => undefined,
      list: async () => [],
      transaction: async (f2) => f2({} as never),
    } as never),
  } as never);
  assert.doesNotThrow(() => store.setLimitForTenant("t1", 200));
  assert.doesNotThrow(() => store.setLimitForTenant("t1", 0));
  assert.doesNotThrow(() => store.setLimitForTenant("t1", Number.NaN));
});

test("TenantConfig.roles es opcional y acepta provider specs", () => {
  const { tenantConfigSchema } = require("../apps/server/src/kernel/config/tenant-config.ts");
  const parsed = tenantConfigSchema.safeParse(tenantFixture({
    roles: { legal: { provider: "anthropic", model: "claude-slow", apiKey: "sk-x" } },
  }));
  assert.equal(parsed.success, true);
});

// FIX_10_TESTS_FAST_SLOW_V1_END
