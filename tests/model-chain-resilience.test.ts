// MODEL_CHAIN_RESILIENCE_V1 - cubre los fallos de wiring que impedian que una
// configuracion documentada de LLM funcionase: claves por proveedor, openrouter,
// fugas del bulkhead y timeouts de primer byte/total.

import assert from "node:assert/strict";
import { test } from "node:test";
import { EventType, type BaseEvent, type RunAgentInput } from "@ag-ui/core";
import { Observable } from "rxjs";
import {
  chainApiKeys,
  envApiKeyFor,
  modelChain,
  normalizeModelSpec,
  runWithModelFallback,
} from "../apps/server/src/engine/model-chain.ts";

const input = {
  threadId: "t",
  runId: "r",
  messages: [],
  state: {},
  tools: [],
  context: [],
  forwardedProps: {},
} as unknown as RunAgentInput;

const content = (delta: string) =>
  ({ type: EventType.TEXT_MESSAGE_CONTENT, messageId: "m", delta }) as unknown as BaseEvent;

function makeRun(events: BaseEvent[], behavior: "complete" | "hang" = "complete") {
  return {
    run: () =>
      new Observable<BaseEvent>((subscriber) => {
        for (const event of events) subscriber.next(event);
        if (behavior === "complete") subscriber.complete();
        return () => undefined;
      }),
    abortRun: () => undefined,
  };
}

function collect(events: Observable<BaseEvent>): Promise<{ text: string; error?: Error }> {
  return new Promise((resolve) => {
    let text = "";
    events.subscribe({
      next: (event) => {
        if (event.type === EventType.TEXT_MESSAGE_CONTENT && "delta" in event && typeof event.delta === "string") {
          text += event.delta;
        }
      },
      error: (error) => resolve({ text, error: error instanceof Error ? error : new Error(String(error)) }),
      complete: () => resolve({ text }),
    });
  });
}

test("normaliza openrouter al proveedor OpenAI-compatible", () => {
  assert.equal(normalizeModelSpec("openrouter/google/gemini-2.5-flash"), "openai/google/gemini-2.5-flash");
  assert.deepEqual(
    modelChain({ model: "openrouter/google/gemini-2.5-flash", modelFallback: "openrouter/meta/llama" } as never),
    ["openai/google/gemini-2.5-flash", "openai/meta/llama"],
  );
});

test("chainApiKeys asigna la clave del tenant al spec normalizado", () => {
  const tenant = {
    slow: { provider: "openrouter", model: "google/gemini-2.5-flash", apiKey: "sk-slow" },
    fast: { provider: "openai", model: "fast-model", apiKey: "sk-fast" },
  };
  const keys = chainApiKeys(
    ["openai/google/gemini-2.5-flash", "openai/fast-model", "openai/global"],
    tenant as never,
  );
  assert.equal(keys.get("openai/google/gemini-2.5-flash"), "sk-slow");
  assert.equal(keys.get("openai/fast-model"), "sk-fast");
  assert.equal(keys.has("openai/global"), false);
});

test("envApiKeyFor resuelve la clave del proveedor real", () => {
  const previousOpenAI = process.env.OPENAI_API_KEY;
  const previousOpenRouter = process.env.OPENROUTER_API_KEY;
  try {
    delete process.env.OPENAI_API_KEY;
    process.env.OPENROUTER_API_KEY = "sk-or-test";
    assert.equal(envApiKeyFor("openrouter/google/gemini-2.5-flash"), "sk-or-test");
    process.env.OPENAI_API_KEY = "sk-openai-test";
    assert.equal(envApiKeyFor("openrouter/google/gemini-2.5-flash"), "sk-openai-test");
  } finally {
    if (previousOpenAI === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousOpenAI;
    if (previousOpenRouter === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = previousOpenRouter;
  }
});

test("libera el bulkhead al completar y no fuerza el fallback tras N runs", async () => {
  delete (globalThis as Record<string, unknown>).__llm_bulkhead__;
  const previous = process.env.LLM_BULKHEAD_PER_PROVIDER;
  process.env.LLM_BULKHEAD_PER_PROVIDER = "1";
  try {
    const used: string[] = [];
    const create = (spec: string) => {
      used.push(spec);
      return makeRun([content("ok")]);
    };
    for (let i = 0; i < 3; i += 1) {
      const result = await collect(runWithModelFallback(["testprov/a", "testprov/b"], create, input).events);
      assert.equal(result.text, "ok");
      assert.equal(result.error, undefined);
    }
    assert.deepEqual(used, ["testprov/a", "testprov/a", "testprov/a"]);
    const bulkhead = (globalThis as Record<string, unknown>).__llm_bulkhead__ as Map<string, number>;
    assert.equal(bulkhead.size, 0);
  } finally {
    if (previous === undefined) delete process.env.LLM_BULKHEAD_PER_PROVIDER;
    else process.env.LLM_BULKHEAD_PER_PROVIDER = previous;
    delete (globalThis as Record<string, unknown>).__llm_bulkhead__;
  }
});

test("salta al fallback si el primario no emite el primer byte", async () => {
  const create = (spec: string) =>
    spec === "openai/primary" ? makeRun([], "hang") : makeRun([content("fallback")]);
  const result = await collect(
    runWithModelFallback(["openai/primary", "openai/fallback"], create, input, {
      firstByteMs: 25,
      totalMs: 500,
    }).events,
  );
  assert.equal(result.text, "fallback");
  assert.equal(result.error, undefined);
});

test("corta con error una respuesta colgada despues del primer byte", async () => {
  let fallbackUsed = false;
  const create = (spec: string) => {
    if (spec === "openai/secondary") fallbackUsed = true;
    return spec === "openai/primary" ? makeRun([content("partial")], "hang") : makeRun([content("fallback")]);
  };
  const result = await collect(
    runWithModelFallback(["openai/primary", "openai/secondary"], create, input, {
      firstByteMs: 500,
      totalMs: 40,
    }).events,
  );
  assert.equal(result.text, "partial");
  assert.match(result.error?.message ?? "", /exceeded/);
  assert.equal(fallbackUsed, false);
});

test("sin fallback, el primer byte agotado devuelve error humano", async () => {
  const result = await collect(
    runWithModelFallback(["openai/only"], () => makeRun([], "hang"), input, {
      firstByteMs: 20,
      totalMs: 500,
    }).events,
  );
  assert.match(result.error?.message ?? "", /did not respond/);
});
