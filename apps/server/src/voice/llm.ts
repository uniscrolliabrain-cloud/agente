// VOICE_LLM_V1 - puente entre el modelo y Anam (custom LLM) en formato
// OpenAI Chat Completions con streaming.
//
// Diferencias con el chat normal, a proposito:
//   - sin kernel, sin auditoria, sin vistas ni tarjetas en el camino critico;
//   - una sola lectura de contexto (snapshot) ya hecha;
//   - presupuesto de primer byte de voz (900 ms), no los 8 s del chat;
//   - `maxSteps: 1` y sin herramientas: en voz, una ida al modelo.
// Lo que no va en el camino critico se cierra despues, fuera del stream.

import { EventType, type RunAgentInput } from "@ag-ui/core";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import type { Config } from "../config.ts";
import type { TenantConfig } from "../kernel/config/tenant-config.ts";
import {
  chainApiKeys,
  envApiKeyFor,
  modelChain,
  normalizeModelSpec,
  runWithModelFallback,
} from "../engine/model-chain.ts";

export interface VoiceCompletionInput {
  config: Config;
  tenant?: TenantConfig;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  systemPrompt: string;
  firstByteMs: number;
  totalMs: number;
  signal?: AbortSignal;
}

function toRunInput(input: VoiceCompletionInput): RunAgentInput {
  return {
    threadId: `voice-${Date.now()}`,
    runId: `voice-run-${Date.now()}`,
    messages: input.messages.map((message, index) => ({
      id: `voice-msg-${index}`,
      role: message.role,
      content: message.content,
    })),
    state: {},
    tools: [],
    context: [],
    forwardedProps: {},
  };
}

/**
 * Convierte el Observable de eventos del runtime en un async iterable de
 * trozos de texto. Es lo que permite consumirlo por SSE sin arrastrar rxjs a
 * las rutas.
 */
export function deltasOf(events: unknown, signal?: AbortSignal): AsyncIterable<string> {
  const queue: string[] = [];
  let finished = false;
  let failure: unknown;
  let wake: (() => void) | undefined;
  const notify = () => {
    const current = wake;
    wake = undefined;
    current?.();
  };
  // El Observable del runtime trae un Observer tipado con zod; aqui solo se
  // usa next/error/complete, asi que se estrecha a mano en vez de arrastrar
  // esos tipos a la firma del modulo.
  const observable = events as {
    subscribe: (observer: {
      next: (event: { type?: string; delta?: unknown }) => void;
      error: (error: unknown) => void;
      complete: () => void;
    }) => { unsubscribe: () => void };
  };
  const subscription = observable.subscribe({
    next: (event: { type?: string; delta?: unknown; message?: unknown }) => {
      if (event?.type === EventType.TEXT_MESSAGE_CONTENT && typeof event.delta === "string") {
        queue.push(event.delta);
        notify();
        return;
      }
      // RUN_ERROR no llega por el canal de error del Observable: viaja como
      // evento. Sin esto la llamada se quedaba muda y solo cerraba el stream.
      if (event?.type === EventType.RUN_ERROR && typeof event.message === "string") {
        failure = new Error(event.message);
        finished = true;
        notify();
      }
    },
    error: (error: unknown) => {
      failure = error;
      finished = true;
      notify();
    },
    complete: () => {
      finished = true;
      notify();
    },
  });
  const onAbort = () => {
    finished = true;
    notify();
  };
  signal?.addEventListener("abort", onAbort, { once: true });

  return {
    [Symbol.asyncIterator]() {
      return {
        async next(): Promise<IteratorResult<string>> {
          for (;;) {
            if (queue.length > 0) return { value: queue.shift() as string, done: false };
            if (failure) throw failure;
            if (finished) {
              subscription.unsubscribe();
              signal?.removeEventListener("abort", onAbort);
              return { value: undefined, done: true };
            }
            await new Promise<void>((resolve) => {
              wake = resolve;
            });
          }
        },
        async return(): Promise<IteratorResult<string>> {
          subscription.unsubscribe();
          signal?.removeEventListener("abort", onAbort);
          return { value: undefined, done: true };
        },
      };
    },
  };
}

export function voiceCompletion(input: VoiceCompletionInput): AsyncIterable<string> {
  const chain = modelChain(input.config, input.tenant, "chat");
  if (chain.length === 1 && chain[0] === "openai/unconfigured") {
    throw new Error("No hay modelo configurado para voz");
  }
  const apiKeys = chainApiKeys(chain, input.tenant);
  const run = runWithModelFallback(
    chain,
    (model) => {
      const apiKey = apiKeys.get(normalizeModelSpec(model)) ?? envApiKeyFor(model);
      return new BuiltInAgent({
        model,
        ...(apiKey ? { apiKey } : {}),
        maxSteps: 1,
        maxRetries: 0,
        tools: [],
        prompt: input.systemPrompt,
      });
    },
    toRunInput(input),
    { firstByteMs: input.firstByteMs, totalMs: input.totalMs },
  );
  input.signal?.addEventListener("abort", () => run.abort(), { once: true });
  return deltasOf(run.events, input.signal);
}

/** Formatea un delta como chunk OpenAI. Anam lo entiende sin adaptador. */
export function sseChunk(delta: string): string {
  return `data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`;
}

export function sseDone(): string {
  return "data: [DONE]\n\n";
}
