import assert from "node:assert/strict";
import { test } from "node:test";
import { EventType, type BaseEvent } from "@ag-ui/core";
import { CopilotInferenceProvider } from "../apps/server/src/engine/cognition/v2/provider.ts";
import { EnvTenantConfigResolver } from "../apps/server/src/kernel/config/env-resolver.ts";
import { agentConfigured } from "../apps/server/src/agent.ts";
import { testConfig } from "./helpers/config.ts";
import { providerSpecSchema } from "../apps/server/src/kernel/config/provider-spec.ts";

test("Meta Muse Contributor Fast uses its own direct endpoint and the real SDK's public streaming contract", async () => {
  const names = [
    "MUSE_API_KEY",
    "FAST_LLM_PROVIDER",
    "FAST_LLM_MODEL",
    "FAST_LLM_API_KEY",
    "FAST_LLM_BASE_URL",
    "OPEN_ROUTER_API_KEY",
    "OPENROUTER_API_KEY",
    "GEMINI_API_KEY",
    "GOOGLE_API_KEY",
    "EMBEDDINGS_LLM_API_KEY",
  ];
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const original = globalThis.fetch;
  let calls = 0;
  try {
    for (const name of names) delete process.env[name];
    Object.assign(process.env, {
      MUSE_API_KEY: "meta-fixture",
      OPEN_ROUTER_API_KEY: "slow-fixture",
      OPENROUTER_API_KEY: "jev-fixture",
    });
    globalThis.fetch = async (url, options) => {
      calls++;
      assert.equal(String(url), "https://api.meta.ai/v1/chat/completions");
      assert.equal(new Headers(options?.headers).get("authorization"), "Bearer meta-fixture");
      const body = JSON.parse(String(options?.body));
      assert.equal(body.model, "muse-spark-1.3-contributor");
      assert.equal(body.stream, true);
      assert.ok(!("contributor" in body));
      assert.ok(!("data_collection" in body));
      assert.ok(!body.tools || body.tools.length === 0);
      const base = { id: "synthetic", object: "chat.completion.chunk", created: 1, model: body.model };
      const chunks = [
        {
          ...base,
          choices: [
            {
              index: 0,
              delta: { role: "assistant", content: "Visible Meta answer", reasoning_content: "PRIVATE" },
              finish_reason: null,
            },
          ],
        },
        {
          ...base,
          choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        },
      ];
      const separator = String.fromCharCode(10, 10);
      return new Response(
        chunks
          .map((chunk) => `data: ${JSON.stringify(chunk)}`)
          .concat("data: [DONE]", "")
          .join(separator),
        { headers: { "content-type": "text/event-stream" } },
      );
    };
    assert.equal(agentConfigured(testConfig({ agentBackend: "model", model: undefined })), true);
    const config = await new EnvTenantConfigResolver().resolve("synthetic");
    assert.equal(config.fast.provider, "meta");
    assert.equal(config.fast.apiKey, "meta-fixture");
    assert.equal(providerSpecSchema.safeParse(config.fast).success, true);
    assert.equal(config.slow.apiKey, "slow-fixture");
    assert.equal(config.embeddings?.apiKey, "");
    const events: BaseEvent[] = [];
    const text = await new CopilotInferenceProvider().stream(
      {
        threadId: "t",
        runId: "r",
        state: {},
        messages: [{ id: "m", role: "user", content: "Synthetic input" }],
        context: [],
        tools: [],
        forwardedProps: {},
      },
      "Synthetic prompt",
      "fast",
      new AbortController().signal,
      (event) => {
        events.push(event);
      },
    );
    assert.equal(calls, 1);
    assert.equal(text, "Visible Meta answer");
    assert.deepEqual(
      events.map((event) => event.type),
      [EventType.TEXT_MESSAGE_START, EventType.TEXT_MESSAGE_CONTENT, EventType.TEXT_MESSAGE_END],
    );
    for (const privateValue of ["PRIVATE", "meta-fixture", "slow-fixture", "jev-fixture"])
      assert.ok(!JSON.stringify(events).includes(privateValue));
  } finally {
    globalThis.fetch = original;
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
