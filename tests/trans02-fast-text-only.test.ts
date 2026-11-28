// TRANS02_FAST_TEXT_ONLY_V1 - la lane Fast no recibe herramientas: se verifica en codigo, no en prompt.
import assert from "node:assert/strict";
import { test } from "node:test";
import { EventType, type BaseEvent, type RunAgentInput } from "@ag-ui/core";
import { CopilotInferenceProvider } from "../apps/server/src/engine/cognition/v2/provider.ts";

const LANE = ["FAST_LLM_PROVIDER", "FAST_LLM_MODEL", "FAST_LLM_API_KEY", "FAST_LLM_BASE_URL"];

async function withFastLane(
  chunks: unknown[],
  run: (seen: { body?: Record<string, unknown>; calls: number }) => Promise<void>,
) {
  const saved = Object.fromEntries(LANE.map((name) => [name, process.env[name]]));
  const original = globalThis.fetch;
  const seen: { body?: Record<string, unknown>; calls: number } = { calls: 0 };
  try {
    for (const name of LANE) delete process.env[name];
    process.env.FAST_LLM_PROVIDER = "openrouter";
    process.env.FAST_LLM_MODEL = "synthetic/fast";
    process.env.FAST_LLM_API_KEY = "fast-synthetic";
    globalThis.fetch = async (_url, options) => {
      seen.calls++;
      seen.body = JSON.parse(String(options?.body));
      return new Response(chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") + "data: [DONE]\n\n", {
        headers: { "content-type": "text/event-stream" },
      });
    };
    await run(seen);
  } finally {
    globalThis.fetch = original;
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

const chunk = (delta: Record<string, unknown>, finish: string | null = null) => ({
  id: "synthetic",
  object: "chat.completion.chunk",
  created: 1,
  model: "synthetic/fast",
  choices: [{ index: 0, delta, finish_reason: finish }],
});

const input = (tools: unknown[] = []) =>
  ({
    threadId: "fast-thread",
    runId: "fast-run",
    state: {},
    messages: [{ id: "m", role: "user", content: "Hola" }],
    context: [],
    tools,
    forwardedProps: {},
  }) as unknown as RunAgentInput;

test("the fast lane never forwards caller tools to the provider", async () => {
  const tool = {
    name: "send_email",
    description: "Ejecuta un efecto de negocio",
    parameters: { type: "object", properties: {} },
  };
  await withFastLane([chunk({ role: "assistant", content: "Respuesta visible" }, "stop")], async (seen) => {
    const events: BaseEvent[] = [];
    const text = await new CopilotInferenceProvider().stream(
      input([tool]),
      "Prompt sintetico",
      "fast",
      new AbortController().signal,
      (event) => {
        events.push(event);
      },
    );
    assert.equal(text, "Respuesta visible");
    assert.equal(seen.calls, 1);
    assert.equal(seen.body?.tools, undefined);
    assert.equal(seen.body?.tool_choice, undefined);
    assert.ok(!JSON.stringify(seen.body).includes("send_email"));
    assert.deepEqual(
      events.map((event) => event.type),
      [EventType.TEXT_MESSAGE_START, EventType.TEXT_MESSAGE_CONTENT, EventType.TEXT_MESSAGE_END],
    );
  });
});

test("a tool call emitted by the provider rejects the fast stream instead of becoming context", async () => {
  const toolCall = chunk({
    tool_calls: [
      {
        index: 0,
        id: "synthetic-call",
        type: "function",
        function: { name: "AGUISendStateSnapshot", arguments: "{}" },
      },
    ],
  }, "tool_calls");
  await withFastLane([toolCall], async (seen) => {
    const events: BaseEvent[] = [];
    await assert.rejects(
      new CopilotInferenceProvider().stream(input(), "Prompt sintetico", "fast", new AbortController().signal, (event) => {
        events.push(event);
      }),
      /PROVIDER_ERROR/,
    );
    assert.equal(seen.calls, 1);
    // ninguna herramienta llega al consumidor como evento publico
    assert.equal(events.some((event) => event.type.includes("TOOL")), false);
  });
});
