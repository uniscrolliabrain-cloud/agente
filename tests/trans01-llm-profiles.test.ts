import assert from "node:assert/strict";
import { test } from "node:test";
import { laneEnvironment, requireLaneProfile } from "../apps/server/src/llm-config.ts";
import { languageModelForProfile, configuredModelForSpec } from "../apps/server/src/engine/language-model.ts";
import { EnvTenantConfigResolver } from "../apps/server/src/kernel/config/env-resolver.ts";

test("Slow selects DeepSeek on the old OpenRouter account and never takes JEV's key", () => {
  assert.deepEqual(requireLaneProfile("slow", { OPEN_ROUTER_API_KEY: "slow-only", OPENROUTER_API_KEY: "jev-only" }), {
    provider: "openrouter",
    model: "deepseek/deepseek-v3.2",
    apiKey: "slow-only",
    baseUrl: "https://openrouter.ai/api/v1",
  });
  assert.throws(() => requireLaneProfile("slow", { OPENROUTER_API_KEY: "jev-only" }), /UNCONFIGURED/);
  assert.equal(
    requireLaneProfile("slow", {
      SLOW_LLM_PROVIDER: "openrouter",
      SLOW_LLM_MODEL: "deepseek/explicit",
      SLOW_LLM_API_KEY: "explicit",
      OPEN_ROUTER_API_KEY: "old",
    }).apiKey,
    "explicit",
  );
});

test("Muse presence alone cannot send its key to an unrelated provider or guessed endpoint", () => {
  assert.throws(() => requireLaneProfile("fast", { MUSE_API_KEY: "meta-private" }), /UNCONFIGURED/);
  assert.equal(
    laneEnvironment("fast", { FAST_LLM_PROVIDER: "google", FAST_LLM_MODEL: "fixture", MUSE_API_KEY: "meta-private" })
      .apiKey,
    undefined,
  );
  assert.equal(
    requireLaneProfile("fast", {
      FAST_LLM_PROVIDER: "openai",
      FAST_LLM_MODEL: "fixture-muse",
      FAST_LLM_BASE_URL: "https://muse.invalid.example/v1",
      MUSE_API_KEY: "meta-private",
    }).apiKey,
    "meta-private",
  );
});

test("concurrent compatible endpoints use separate clients, credentials and model IDs", async () => {
  const calls: { url: string; key: string; model: string }[] = [];
  const transport: typeof fetch = async (url, options) => {
    const payload = JSON.parse(String(options?.body));
    calls.push({ url: String(url), key: new Headers(options?.headers).get("authorization")!, model: payload.model });
    return Response.json({
      id: "synthetic",
      object: "chat.completion",
      created: 1,
      model: payload.model,
      choices: [{ index: 0, message: { role: "assistant", content: "fixture" }, finish_reason: "stop" }],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    });
  };
  const globalsBefore = [process.env.OPENAI_API_KEY, process.env.OPENAI_BASE_URL];
  const slow = languageModelForProfile(requireLaneProfile("slow", { OPEN_ROUTER_API_KEY: "slow-only" }), transport);
  const fast = languageModelForProfile(
    requireLaneProfile("fast", {
      FAST_LLM_PROVIDER: "openai",
      FAST_LLM_MODEL: "explicit-fast",
      FAST_LLM_BASE_URL: "https://muse.invalid.example/v1",
      MUSE_API_KEY: "fast-only",
    }),
    transport,
  );
  await Promise.all(
    [slow, fast].map((model) =>
      model.doGenerate({ prompt: [{ role: "user", content: [{ type: "text", text: "synthetic" }] }] }),
    ),
  );
  assert.deepEqual(
    calls.sort((a, b) => a.key.localeCompare(b.key)),
    [
      { url: "https://muse.invalid.example/v1/chat/completions", key: "Bearer fast-only", model: "explicit-fast" },
      {
        url: "https://openrouter.ai/api/v1/chat/completions",
        key: "Bearer slow-only",
        model: "deepseek/deepseek-v3.2",
      },
    ],
  );
  assert.deepEqual([process.env.OPENAI_API_KEY, process.env.OPENAI_BASE_URL], globalsBefore);
});

test("legacy normalized model selection preserves the matched provider endpoint", () => {
  const profile = { provider: "openrouter" as const, model: "deepseek/deepseek-v3.2", apiKey: "slow-only" };
  const model = configuredModelForSpec("openai/deepseek/deepseek-v3.2", [profile]);
  assert.ok(model);
  assert.equal(model.modelId, "deepseek/deepseek-v3.2");
  assert.equal(configuredModelForSpec("openai/other", [profile]), undefined);
});

test("legacy embeddings never inherit a Slow OpenRouter key under a Google profile", async () => {
  const names = [
    "OPEN_ROUTER_API_KEY",
    "OPENROUTER_API_KEY",
    "MUSE_API_KEY",
    "FAST_LLM_API_KEY",
    "FAST_LLM_PROVIDER",
    "FAST_LLM_MODEL",
    "FAST_LLM_BASE_URL",
    "SLOW_LLM_API_KEY",
    "SLOW_LLM_PROVIDER",
    "SLOW_LLM_MODEL",
    "SLOW_LLM_BASE_URL",
    "EMBEDDINGS_LLM_API_KEY",
    "EMBEDDINGS_LLM_PROVIDER",
    "EMBEDDINGS_LLM_BASE_URL",
    "GEMINI_API_KEY",
    "GOOGLE_API_KEY",
  ];
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    for (const name of names) delete process.env[name];
    process.env.OPEN_ROUTER_API_KEY = "slow-only";
    process.env.OPENROUTER_API_KEY = "jev-only";
    const config = await new EnvTenantConfigResolver().resolve("synthetic");
    assert.equal(config.slow.apiKey, "slow-only");
    assert.equal(config.slow.provider, "openrouter");
    assert.equal(config.embeddings?.apiKey, "");
    assert.equal(config.fast.apiKey, "");
  } finally {
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
