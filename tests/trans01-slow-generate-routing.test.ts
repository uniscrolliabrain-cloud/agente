import assert from "node:assert/strict";
import { test } from "node:test";
import { generateText } from "../apps/server/src/engine/model.ts";
import { EnvTenantConfigResolver } from "../apps/server/src/kernel/config/env-resolver.ts";
import { testConfig } from "./helpers/config.ts";

test("Slow text generation uses the lane endpoint before an unrelated global model", async () => {
  const names = [
    "SLOW_LLM_PROVIDER",
    "SLOW_LLM_MODEL",
    "SLOW_LLM_API_KEY",
    "SLOW_LLM_BASE_URL",
    "OPENAI_API_KEY",
    "OPENAI_BASE_URL",
  ];
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const original = globalThis.fetch;
  let calls = 0;
  try {
    Object.assign(process.env, {
      SLOW_LLM_PROVIDER: "openrouter",
      SLOW_LLM_MODEL: "deepseek/deepseek-v3.2",
      SLOW_LLM_API_KEY: "slow-fixture",
      SLOW_LLM_BASE_URL: "https://slow.invalid.example/v1",
      OPENAI_API_KEY: "unrelated-native-key",
      OPENAI_BASE_URL: "https://native.invalid.example/v1",
    });
    globalThis.fetch = async (url, options) => {
      calls++;
      assert.equal(String(url), "https://slow.invalid.example/v1/chat/completions");
      assert.equal(new Headers(options?.headers).get("authorization"), "Bearer slow-fixture");
      const body = JSON.parse(String(options?.body));
      assert.equal(body.model, "deepseek/deepseek-v3.2");
      const data = [
        {
          id: "synthetic",
          object: "chat.completion.chunk",
          created: 1,
          model: body.model,
          choices: [{ index: 0, delta: { role: "assistant", content: "synthetic answer" }, finish_reason: null }],
        },
        {
          id: "synthetic",
          object: "chat.completion.chunk",
          created: 1,
          model: body.model,
          choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        },
      ];
      return new Response(data.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") + "data: [DONE]\n\n", {
        headers: { "content-type": "text/event-stream" },
      });
    };
    for (const tenant of [undefined, await new EnvTenantConfigResolver().resolve("synthetic")])
      assert.equal(
        await generateText(testConfig({ model: "openai/unrelated-global" }), "Synthetic request", undefined, {
          tenant,
        }),
        "synthetic answer",
      );
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = original;
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
