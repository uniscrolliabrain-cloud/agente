// LOG_STRUCTURED_V2 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â correlationId + redacciÃƒÆ’Ã‚Â³n de secretos.
//
// V2 respecto a V1:
//   - correlationId en cada lÃƒÆ’Ã‚Â­nea (propagado desde el request HTTP).
//   - RedacciÃƒÆ’Ã‚Â³n automÃƒÆ’Ã‚Â¡tica de campos sensibles en payloads anidados.
//   - backgroundFailure con contexto estructurado (owner, tenantId, taskId).
//   - Cabecera obligatoria: http.method, http.path, http.status cuando aplica.
//
// Ver: docs/audits/02-observabilidad/miniaudit.md ("Sin traceId",
// "backgroundFailure sin contexto", "Sin redacciÃƒÆ’Ã‚Â³n de secretos").

import { AsyncLocalStorage } from "node:async_hooks";

// ---------------------------------------------------------------------------
// Contexto de correlaciÃƒÆ’Ã‚Â³n por request.
// ---------------------------------------------------------------------------

export interface LogContext {
  correlationId: string;
  owner?: string;
  tenantId?: string;
  taskId?: string;
  requestId?: string;
}

export const logContext = new AsyncLocalStorage<LogContext>();

/**
 * Ejecuta `fn` con el contexto de correlaciÃƒÆ’Ã‚Â³n activo. Las llamadas a
 * logInfo/logWarn/logError/backgroundFailure dentro de `fn` incluyen
 * automÃƒÆ’Ã‚Â¡ticamente correlationId, owner y tenantId.
 */
export function withLogContext<T>(ctx: LogContext, fn: () => T): T {
  return logContext.run(ctx, fn);
}

// ---------------------------------------------------------------------------
// RedacciÃƒÆ’Ã‚Â³n de campos sensibles.
// ---------------------------------------------------------------------------

const SENSITIVE_KEYS = new Set([
  "authorization",
  "apikey",
  "api_key",
  "apiKey",
  "password",
  "secret",
  "token",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "cookie",
  "set-cookie",
  "x-access-key",
  "openmuse_access_key",
]);

const REDACTED = "[REDACTED]";

/**
 * Recorre el objeto y sustituye valores de claves sensibles por [REDACTED].
 * Profundidad mÃƒÆ’Ã‚Â¡xima 8 para evitar ciclos.
 */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 8) return value;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase()) || SENSITIVE_KEYS.has(k)) {
      out[k] = REDACTED;
    } else if (typeof v === "object") {
      out[k] = redact(v, depth + 1);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// EmisiÃƒÆ’Ã‚Â³n.
// ---------------------------------------------------------------------------

type Level = "info" | "warn" | "error" | "debug";

const LEVEL_ORDER: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
function minLevel(): number {
  const raw = process.env.LOG_LEVEL?.toLowerCase();
  if (raw && raw in LEVEL_ORDER) return LEVEL_ORDER[raw as Level];
  return LEVEL_ORDER.info;
}
// LOG_LEVEL_GLOBAL_V1 - respeta LOG_LEVEL en todos los niveles.
function emit(level: Level, event: string, fields: Record<string, unknown>): void {
  if (LEVEL_ORDER[level] < minLevel()) return;
  // LOG_SAMPLING_V1 Ã¢â‚¬â€ sampling configurable solo para INFO.
  if (level === "info") {
    const rate = Number(process.env.LOG_SAMPLE_RATE ?? "1");
    if (Number.isFinite(rate) && rate < 1 && Math.random() > rate) return;
  }
  const ctx = logContext.getStore();
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...(ctx?.correlationId ? { correlationId: ctx.correlationId } : {}),
    ...(ctx?.owner ? { owner: ctx.owner } : {}),
    ...(ctx?.tenantId ? { tenantId: ctx.tenantId } : {}),
    ...(ctx?.taskId ? { taskId: ctx.taskId } : {}),
    ...(ctx?.requestId ? { requestId: ctx.requestId } : {}),
    ...(redact(fields) as Record<string, unknown>),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function logInfo(event: string, fields: Record<string, unknown> = {}): void {
  emit("info", event, fields);
}

export function logWarn(event: string, fields: Record<string, unknown> = {}): void {
  emit("warn", event, fields);
}

export function logError(event: string, fields: Record<string, unknown> = {}): void {
  emit("error", event, fields);
}

export function logDebug(event: string, fields: Record<string, unknown> = {}): void {
  if (process.env.LOG_LEVEL === "debug") emit("debug", event, fields);
}

// ---------------------------------------------------------------------------
// backgroundFailure con contexto estructurado.
// ---------------------------------------------------------------------------

export interface FailureContext {
  owner?: string;
  tenantId?: string;
  taskId?: string;
  actionId?: string;
  monitorId?: string;
  sopId?: string;
}

// LOG_RETRYABLE_V1 - importa la clasificacion de retry del motor.
import { defaultIsRetryable } from "./engine/retry.ts";

// LOG_RETRYABLE_V1 - extrae stack y cause del error para logs estructurados.
function errorFields(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) {
    return { error: "UnknownError", message: String(error).slice(0, 500) };
  }
  const out: Record<string, unknown> = {
    error: error.name,
    message: error.message.slice(0, 500),
  };
  if (error.stack) out.stack = error.stack.split("\n").slice(0, 8).join("\n").slice(0, 2000);
  const cause = (error as { cause?: unknown }).cause;
  if (cause instanceof Error) {
    out.cause = { name: cause.name, message: cause.message.slice(0, 500) };
  }
  return out;
}

export function backgroundFailure(
  phase: string,
  error: unknown,
  context: FailureContext = {},
): void {
  // LOG_RETRYABLE_V1 - distingue transitorio (retry) vs permanente.
  const retryable = defaultIsRetryable(error);
  // LOG_BG_FAILURES_METRIC_V1 - contador por fase.
  import("./metrics/registry.ts").then(({ globalMetrics }) => {
    globalMetrics.inc("background_failures_total", { phase, retryable: String(retryable) });
  }).catch(() => {});
  emit("error", "background_failure", {
    phase,
    retryable,
    ...errorFields(error),
    ...context,
  });
}
