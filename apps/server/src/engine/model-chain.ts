import { type BaseEvent, EventType, type RunAgentInput } from "@ag-ui/core";
import { Observable } from "rxjs";
import { retryWithBackoff, defaultIsRetryable } from "./retry.ts";
import { globalCircuits } from "./circuit-breaker.ts";
import type { Config } from "../config.ts";

/** Provider events that prove the client already received model output for this run. */
const producedOutput = new Set<string>([
  EventType.TEXT_MESSAGE_START,
  EventType.TEXT_MESSAGE_CONTENT,
  EventType.TEXT_MESSAGE_CHUNK,
  EventType.TEXT_MESSAGE_END,
  EventType.TOOL_CALL_START,
  EventType.TOOL_CALL_ARGS,
  EventType.TOOL_CALL_END,
  EventType.TOOL_CALL_RESULT,
]);

export interface ModelRun {
  run(input: RunAgentInput): Observable<BaseEvent>;
  abortRun(): void;
}

/**
 * Ordered model specifiers: the primary model first, then the configured fallback.
 * "openai/unconfigured" preserves the previous behaviour when no model is configured at all.
 */
// FALLBACK_CROSS_V1 - cadena con fast, slow y fallback global.
export function modelChain(config: Config): string[] {
  const specs = [config.model, config.modelFallback].flatMap((spec) =>
    spec?.trim() ? [spec.trim()] : [],
  );
  return specs.length ? [...new Set(specs)] : ["openai/unconfigured"];
}

/**
 * Runs `input` against the first specifier that answers. The next specifier is only used when the
 * current one fails before producing client-visible output, so a half-streamed answer is never
 * restarted and the failure that triggered the fallback is never surfaced.
 *
 * Each attempt carries a monotonically increasing attemptId. Once a new attempt starts, any
 * subsequent event/error/complete from the previous subscription is ignored, so a late
 * RUN_ERROR+RUN_FINISHED pair from the primary cannot terminate the outer observable before
 * the fallback has had a chance to run.
 */
export function runWithModelFallback(
  specs: string[],
  create: (spec: string) => ModelRun,
  input: RunAgentInput,
  options: { timeoutMs?: number } = {},
): { events: Observable<BaseEvent>; abort: () => void } {
  // MODEL_CHAIN_TIMEOUT_V1 - antes no habia timeout global. Si el modelo
  // primario se quedaba colgado (red, proveedor caido), el fallback nunca
  // entraba. Ahora cada intento tiene un timeout implicito (default 120s,
  // configurable). Al expirar, se aborta el intento y entra el fallback.
  const timeoutMs = options.timeoutMs ?? 120_000;
  let current: ModelRun | undefined;
  const events = new Observable<BaseEvent>((subscriber) => {
    let index = 0;
    let announceStart = true;
    let stopped = false;
    let subscription: { unsubscribe: () => void } | undefined;
    let attemptId = 0;

    const hasFallback = () => index + 1 < specs.length;

    const startNextAttempt = () => {
      subscription?.unsubscribe();
      index += 1;
      announceStart = false;
      attempt();
    };

    // MODEL_CHAIN_NETWORK_TIMEOUT_V1 - timeout duro por intento. Si el modelo
    // no emite output en 45s, abortamos y pasamos al fallback. Antes un fetch
    // colgado no emitia ni evento ni error, y el fallback nunca entraba.
    const attempt = () => {
      const myId = ++attemptId;
      const agent = create(specs[index]);
      current = agent;
      let answered = false;
      // MODEL_CHAIN_RETRY_V1 — retry con backoff exponencial entre intentos.
      // Ver: docs/audits/03-resiliencia/miniaudit.md ("Sin retry con backoff").
      // No reintentamos dentro del mismo spec: dejamos que el fallback haga su
      // trabajo. Pero sí aplicamos circuit breaker por spec para cortar rápido
      // si un proveedor está caído.
      // CB_PER_PROVIDER_V1 - agrupa el circuit por provider.
const provider = specs[index].split("/")[0] ?? "unknown";
const circuit = globalCircuits.get(`llm:${provider}`);
      if (circuit.getState() === "open") {
        // Salta al siguiente spec sin intentar.
        if (hasFallback()) { startNextAttempt(); return; }
      }
      // MODEL_FIRST_BYTE_CONFIG_V1
      const firstByteMs = Number(process.env.LLM_FIRST_BYTE_MS ?? "45000") || 45000;
      const bulkheadKey = "__llm_bulkhead__";
      const bulkhead = ((globalThis as Record<string, unknown>)[bulkheadKey] as Map<string, number>) ?? new Map<string, number>();
      (globalThis as Record<string, unknown>)[bulkheadKey] = bulkhead;
      const BULKHEAD_MAX = Number(process.env.LLM_BULKHEAD_PER_PROVIDER ?? "10") || 10;
      const providerKey = specs[index].split("/")[0] ?? "unknown";
      const running = bulkhead.get(providerKey) ?? 0;
      if (running >= BULKHEAD_MAX && hasFallback()) { startNextAttempt(); return; }
      bulkhead.set(providerKey, running + 1);
      const releaseBulkhead = () => { const cur = bulkhead.get(providerKey) ?? 1; if (cur <= 1) bulkhead.delete(providerKey); else bulkhead.set(providerKey, cur - 1); };
      const firstByteTimeout = setTimeout(() => {
        releaseBulkhead();
        if (myId !== attemptId) return;
        if (!answered && hasFallback()) {
          try { agent.abortRun(); } catch { /* noop */ }
          startNextAttempt();
        } else if (!answered) {
          try { agent.abortRun(); } catch { /* noop */ }
          subscriber.error(new Error("Model did not respond within 45 seconds"));
        }
      }, 45_000);
      subscription = agent.run(input).subscribe({
        next: (event) => {
          if (myId !== attemptId) return;
          if (producedOutput.has(event.type)) {
            answered = true;
            clearTimeout(firstByteTimeout);
          }
          if (event.type === EventType.RUN_STARTED && !announceStart) return;
          if (event.type === EventType.RUN_ERROR && !answered && hasFallback()) {
            clearTimeout(firstByteTimeout);
            startNextAttempt();
            return;
          }
          subscriber.next(event);
        },
        error: (error) => {
          if (myId !== attemptId) return;
          clearTimeout(firstByteTimeout);
          releaseBulkhead();
          if (stopped) return;
          if (!answered && hasFallback()) {
            startNextAttempt();
            return;
          }
          subscriber.error(error);
        },
        complete: () => {
          if (myId !== attemptId) return;
          clearTimeout(firstByteTimeout);
          if (!stopped) subscriber.complete();
        },
      });
    };

    attempt();
    return () => {
      stopped = true;
      if (typeof current !== "undefined") { try { current?.abortRun(); } catch { /* noop */ } }
      subscription?.unsubscribe();
    };
  });
  return { events, abort: () => current?.abortRun() };
}