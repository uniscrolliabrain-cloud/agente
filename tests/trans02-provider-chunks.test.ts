import assert from "node:assert/strict";
import { test } from "node:test";
import { EventType, type BaseEvent } from "@ag-ui/core";
import { CopilotInferenceProvider } from "../apps/server/src/engine/cognition/v2/provider.ts";
import { PublicTextStream } from "../apps/server/src/engine/cognition/v2/public-text-event.ts";

test("compact provider chunks become minimal public text events without private metadata", () => {
  const stream = new PublicTextStream();
  const result = [
    ...stream.push({
      type: EventType.TEXT_MESSAGE_CHUNK,
      messageId: "m",
      role: "assistant",
      delta: "Visible",
      rawEvent: { reasoning: "PRIVATE" },
    } as BaseEvent),
    ...stream.push({ type: EventType.TEXT_MESSAGE_CHUNK, delta: " answer" } as BaseEvent),
    ...stream.finish(),
  ];
  assert.deepEqual(result, [
    { type: EventType.TEXT_MESSAGE_START, messageId: "m", role: "assistant" },
    { type: EventType.TEXT_MESSAGE_CONTENT, messageId: "m", delta: "Visible" },
    { type: EventType.TEXT_MESSAGE_CONTENT, messageId: "m", delta: " answer" },
    { type: EventType.TEXT_MESSAGE_END, messageId: "m" },
  ]);
  assert.ok(!JSON.stringify(result).includes("PRIVATE"));
  assert.deepEqual(stream.finish(), []);
  for (const invalid of [
    { type: EventType.TEXT_MESSAGE_CHUNK, delta: "unbound" },
    { type: EventType.TEXT_MESSAGE_CHUNK, messageId: "x", role: "system", delta: "private" },
    { type: EventType.TEXT_MESSAGE_CHUNK, messageId: "x", delta: 42 },
  ])
    assert.throws(() => new PublicTextStream().push(invalid as BaseEvent), /INVALID_PUBLIC_TEXT_EVENT/);
  assert.deepEqual(
    new PublicTextStream().push({ type: EventType.REASONING_MESSAGE_CONTENT, delta: "PRIVATE" } as BaseEvent),
    [],
  );
});

test("real CopilotKit SDK streaming returns visible Slow text instead of an empty response", async () => {
  const names = ["SLOW_LLM_PROVIDER", "SLOW_LLM_MODEL", "SLOW_LLM_API_KEY", "SLOW_LLM_BASE_URL", "OPEN_ROUTER_API_KEY"];
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const original = globalThis.fetch;
  let calls = 0,
    empty = false;
  try {
    for (const name of names) delete process.env[name];
    process.env.OPEN_ROUTER_API_KEY = "slow-synthetic";
    globalThis.fetch = async (url, options) => {
      calls++;
      assert.equal(String(url), "https://openrouter.ai/api/v1/chat/completions");
      assert.equal(new Headers(options?.headers).get("authorization"), "Bearer slow-synthetic");
      const body = JSON.parse(String(options?.body));
      assert.equal(body.model, "deepseek/deepseek-v3.2");
      const base = { id: "synthetic", object: "chat.completion.chunk", created: 1, model: body.model };
      const chunks = [
        {
          ...base,
          choices: [
            {
              index: 0,
              delta: { role: "assistant", content: empty ? undefined : "Visible answer", reasoning_content: "PRIVATE" },
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
      return new Response(chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") + "data: [DONE]\n\n", {
        headers: { "content-type": "text/event-stream" },
      });
    };
    const events: BaseEvent[] = [];
    const text = await new CopilotInferenceProvider().stream(
      {
        threadId: "t",
        runId: "r",
        state: {},
        messages: [{ id: "m", role: "user", content: "fixture" }],
        context: [],
        tools: [],
        forwardedProps: {},
      },
      "Synthetic prompt",
      "slow",
      new AbortController().signal,
      (event) => {
        events.push(event);
      },
    );
    assert.equal(text, "Visible answer");
    assert.equal(calls, 1);
    assert.deepEqual(
      events.map((event) => event.type),
      [EventType.TEXT_MESSAGE_START, EventType.TEXT_MESSAGE_CONTENT, EventType.TEXT_MESSAGE_END],
    );
    assert.ok(!JSON.stringify(events).includes("PRIVATE"));
    empty = true;
    await assert.rejects(
      new CopilotInferenceProvider().stream(
        {
          threadId: "t",
          runId: "empty",
          state: {},
          messages: [{ id: "m", role: "user", content: "fixture" }],
          context: [],
          tools: [],
          forwardedProps: {},
        },
        "Synthetic prompt",
        "slow",
        new AbortController().signal,
        () => {
          throw Error("UNEXPECTED_EMPTY_TEXT");
        },
      ),
      /PROVIDER_EMPTY_RESPONSE/,
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
