// LOG_STRUCTURED_V2 — correlationId + redacción de secretos.
//
// V2 respecto a V1:
//   - correlationId en cada línea (propagado desde el request HTTP).
//   - Redacción automática de campos sensibles en payloads anidados.
//   - backgroundFailure con contexto estructurado (owner, tenantId, taskId).
//   - Cabecera obligatoria: http.method, http.path, http.status cuando aplica.
//
// Ver: docs/audits/02-observabilidad/miniaudit.md ("Sin traceId",
// "backgroundFailure sin contexto", "Sin redacción de secretos").

import { AsyncLocalStorage } from "node:async_hooks";

// ---------------------------------------------------------------------------
// Contexto de correlación por request.
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
 * Ejecuta `fn` con el contexto de correlación activo. Las llamadas a
 * logInfo/logWarn/logError/backgroundFailure dentro de `fn` incluyen
 * automáticamente correlationId, owner y tenantId.
 */
export function withLogContext<T>(ctx: LogContext, fn: () => T): T {
  return logContext.run(ctx, fn);
}

// ---------------------------------------------------------------------------
// Redacción de campos sensibles.
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
 * Profundidad máxima 8 para evitar ciclos.
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
// Emisión.
// ---------------------------------------------------------------------------

type Level = "info" | "warn" | "error" | "debug";

function emit(level: Level, event: string, fields: Record<string, unknown>): void {
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

export function backgroundFailure(
  phase: string,
  error: unknown,
  context: FailureContext = {},
): void {
  emit("error", "background_failure", {
    phase,
    error: error instanceof Error ? error.name : "UnknownError",
    message: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500),
    ...context,
  });
}
