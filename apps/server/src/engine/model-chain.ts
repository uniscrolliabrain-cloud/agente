import { type BaseEvent, EventType, type RunAgentInput } from "@ag-ui/core";
import { Observable } from "rxjs";
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
 * The runtime resolves openai, anthropic and google specs. An "openrouter/..."
 * spec is an OpenAI-compatible endpoint, so it is normalized to openai/... and
 * served by OPENROUTER_API_KEY (config.ts aliases OPENAI_API_KEY/BASE_URL when
 * the OpenAI key is empty).
 */
export function normalizeModelSpec(spec: string): string {
  const trimmed = spec.trim();
  const [provider, ...rest] = trimmed.split("/");
  if (provider?.toLowerCase() === "openrouter" && rest.length > 0) {
    return `openai/${rest.join("/")}`;
  }
  return trimmed;
}

/** API key for a spec, from the same environment names config.ts publishes. */
export function envApiKeyFor(spec: string): string | undefined {
  const provider = normalizeModelSpec(spec).split("/")[0]?.toLowerCase();
  const read = (name: string) => process.env[name]?.trim() || undefined;
  if (provider === "openai") return read("OPENAI_API_KEY") ?? read("OPENROUTER_API_KEY");
  if (provider === "anthropic") return read("ANTHROPIC_API_KEY");
  if (provider === "google" || provider === "gemini") return read("GOOGLE_API_KEY") ?? read("GEMINI_API_KEY");
  if (provider === "minimax") return read("MINIMAX_API_KEY");
  return undefined;
}

/**
 * Ordered model specifiers: the primary model first, then the configured fallback.
 * "openai/unconfigured" preserves the previous behaviour when no model is configured at all.
 */
// FALLBACK_CROSS_V1 - cadena con fast, slow y fallback global.
// FIX_1_MODELCHAIN_TENANT_V1 - acepta TenantConfig opcional. Si se pasa, la
// cadena completa es [fast, slow, global, fallback]. Si no, [global, fallback].
import type { TenantConfig } from "../kernel/config/tenant-config.ts";

// MODEL_CHAIN_MODE_V1 — separa chat y tarea. Chat: [fast, global]. Tarea: [slow, global].
export function modelChain(config: Config, tenant?: TenantConfig, mode: "chat" | "task" = "task"): string[] {
  const specs: string[] = [];
  if (mode === "chat" && tenant?.fast?.apiKey && tenant.fast.model) {
    specs.push(normalizeModelSpec(`${tenant.fast.provider}/${tenant.fast.model}`));
  }
  if (mode === "task" && tenant?.slow?.apiKey && tenant.slow.model) {
    specs.push(normalizeModelSpec(`${tenant.slow.provider}/${tenant.slow.model}`));
  }
  if (config.model?.trim()) specs.push(normalizeModelSpec(config.model));
  if (config.modelFallback?.trim()) specs.push(normalizeModelSpec(config.modelFallback));
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
// B-11 - maxProfile corta el fallback si el siguiente spec no es del perfil permitido.
// Si no se pasa, comportamiento previo (cruza perfiles).
export function runWithModelFallback(
  specs: string[],
  create: (spec: string) => ModelRun,
  input: RunAgentInput,
  options: { timeoutMs?: number; firstByteMs?: number; totalMs?: number; maxSpecs?: number } = {},
): { events: Observable<BaseEvent>; abort: () => void } {
  const maxSpecs = options.maxSpecs ?? specs.length;
  const effectiveSpecs = specs.slice(0, Math.max(1, maxSpecs));
  // MODEL_CHAIN_TIMEOUT_V1 - cada intento tiene dos relojes: el primer byte
  // (para saltar a un fallback antes de ensenar nada) y el total (para cortar
  // una respuesta que se queda colgada despues de empezar).
  // MODEL_CHAIN_FIRST_BYTE_ENV_V1 - el valor por defecto sale de config.ts, no
  // de un 2s hardcodeado en el chat.
  const firstByteMs =
    options.firstByteMs ??
    options.timeoutMs ??
    (Number(process.env.LLM_FIRST_BYTE_MS ?? "45000") || 45000);
  const totalMs =
    options.totalMs ??
    options.timeoutMs ??
    (Number(process.env.LLM_GLOBAL_MS ?? "120000") || 120000);
  let current: ModelRun | undefined;
  const events = new Observable<BaseEvent>((subscriber) => {
    let index = 0;
    let announceStart = true;
    let stopped = false;
    let subscription: { unsubscribe: () => void } | undefined;
    let attemptId = 0;
    let releaseCurrent: (() => void) | undefined;

    const hasFallback = () => index + 1 < effectiveSpecs.length;

    const startNextAttempt = () => {
      subscription?.unsubscribe();
      releaseCurrent?.();
      releaseCurrent = undefined;
      index += 1;
      announceStart = false;
      attempt();
    };

    // MODEL_CHAIN_NETWORK_TIMEOUT_V1 - timeout duro por intento: si el modelo
    // no emite output, se aborta y entra el fallback; si ya emitio, se corta
    // con error para no reiniciar una respuesta a medias.
    const attempt = () => {
      const myId = ++attemptId;
      const spec = effectiveSpecs[index] ?? "openai/unconfigured";
      const agent = create(spec);
      current = agent;
      let answered = false;
      let finished = false;
      const provider = spec.split("/")[0] ?? "unknown";
      const circuit = globalCircuits.get(`llm:${provider}`);
      if (circuit.getState() === "open") {
        // Salta al siguiente spec sin intentar.
        if (hasFallback()) {
          startNextAttempt();
          return;
        }
      }
      const bulkheadKey = "__llm_bulkhead__";
      const bulkhead =
        ((globalThis as Record<string, unknown>)[bulkheadKey] as Map<string, number>) ??
        new Map<string, number>();
      (globalThis as Record<string, unknown>)[bulkheadKey] = bulkhead;
      // MODEL_BULKHEAD_PER_PROVIDER_V1
      const BULKHEAD_MAX = Number(process.env.LLM_BULKHEAD_PER_PROVIDER ?? "10") || 10;
      const running = bulkhead.get(provider) ?? 0;
      if (running >= BULKHEAD_MAX && hasFallback()) {
        startNextAttempt();
        return;
      }
      bulkhead.set(provider, running + 1);
      // MODEL_BULKHEAD_RELEASE_V1 - antes solo se liberaba en error/timeout.
      // Un run correcto dejaba el contador incrementado para siempre y, tras
      // N llamadas, todo el trafico saltaba al fallback. Se libera una sola vez.
      let released = false;
      const releaseBulkhead = () => {
        if (released) return;
        released = true;
        const cur = bulkhead.get(provider) ?? 1;
        if (cur <= 1) bulkhead.delete(provider);
        else bulkhead.set(provider, cur - 1);
      };
      releaseCurrent = releaseBulkhead;
      const clearTimers = () => {
        clearTimeout(firstByteTimeout);
        clearTimeout(totalTimeout);
      };
      const failWithoutOutput = (message: string) => {
        if (finished) return;
        finished = true;
        clearTimers();
        releaseBulkhead();
        subscriber.error(new Error(message));
      };
      const firstByteTimeout = setTimeout(() => {
        if (myId !== attemptId || finished) return;
        try {
          agent.abortRun();
        } catch {
          /* noop */
        }
        if (!answered && hasFallback()) {
          clearTimers();
          releaseBulkhead();
          startNextAttempt();
          return;
        }
        failWithoutOutput(
          `Model did not respond within ${Math.round(firstByteMs / 1000)} seconds`,
        );
      }, firstByteMs);
      const totalTimeout = setTimeout(() => {
        if (myId !== attemptId || finished) return;
        try {
          agent.abortRun();
        } catch {
          /* noop */
        }
        if (!answered && hasFallback()) {
          clearTimers();
          releaseBulkhead();
          startNextAttempt();
          return;
        }
        failWithoutOutput(
          answered
            ? `Model run exceeded ${Math.round(totalMs / 1000)} seconds`
            : `Model did not respond within ${Math.round(totalMs / 1000)} seconds`,
        );
      }, totalMs);
      subscription = agent.run(input).subscribe({
        next: (event) => {
          if (myId !== attemptId || finished) return;
          if (producedOutput.has(event.type)) {
            answered = true;
            clearTimeout(firstByteTimeout);
          }
          if (event.type === EventType.RUN_STARTED && !announceStart) return;
          if (event.type === EventType.RUN_ERROR && !answered && hasFallback()) {
            clearTimers();
            releaseBulkhead();
            startNextAttempt();
            return;
          }
          subscriber.next(event);
        },
        error: (error) => {
          if (myId !== attemptId || finished) return;
          clearTimers();
          releaseBulkhead();
          if (stopped) return;
          if (!answered && hasFallback()) {
            startNextAttempt();
            return;
          }
          finished = true;
          subscriber.error(error);
        },
        complete: () => {
          if (myId !== attemptId || finished) return;
          clearTimers();
          releaseBulkhead();
          if (!stopped) {
            finished = true;
            subscriber.complete();
          }
        },
      });
    };

    attempt();
    return () => {
      stopped = true;
      releaseCurrent?.();
      if (typeof current !== "undefined") {
        try {
          current?.abortRun();
        } catch {
          /* noop */
        }
      }
      subscription?.unsubscribe();
    };
  });
  return { events, abort: () => current?.abortRun() };
}
