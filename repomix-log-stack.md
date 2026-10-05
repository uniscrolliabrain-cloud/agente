This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: apps/server/src/log.ts, apps/server/src/metrics/registry.ts, apps/server/src/middleware/request-logger.ts, apps/server/src/engine/retry.ts, apps/server/src/alerts/definitions.ts
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      alerts/
        definitions.ts
      engine/
        retry.ts
      metrics/
        registry.ts
      middleware/
        request-logger.ts
      log.ts
```

# Files

## File: apps/server/src/alerts/definitions.ts
```typescript
// ALERTS_DEFINITIONS_V1 — las 5 alertas mínimas del roadmap 02.
//
// Ver: docs/audits/02-observabilidad/roadmap.md §8 ("5 alertas definidas
// y probadas").
//
// Cada alerta es una condición sobre datos observables. No escanean la DB:
// leen de un snapshot inyectado por el caller (típicamente el MetricsRegistry
// o el AlertService desde index.ts).

import type { AlertDefinition } from "./service.ts";

export interface AlertDeps {
  metricsSnapshot: () => {
    http5xx: number;
    httpTotal: number;
    taskFailuresLastHour: number;
    tenantQuotaExceeded: number;
    workerRunning: boolean;
    /** RESILIENCE_ALERTS_V1 — campos añadidos para el bloque 03. */
    circuitOpenCount: number;
    deadLetterCount: number;
    outcomeUnknownCount: number;
  };
}

export function buildAlertDefinitions(deps: AlertDeps): AlertDefinition[] {
  return [
    {
      id: "http_5xx_high",
      description: "Errores 5xx superan el 5% de los requests en la última ventana",
      severity: "critical",
      cooldownSec: 300,
      condition: () => {
        const s = deps.metricsSnapshot();
        return s.httpTotal >= 20 && s.http5xx / s.httpTotal > 0.05;
      },
    },
    {
      id: "tasks_failing_burst",
      description: "Más de 10 tareas fallidas en la última hora",
      severity: "critical",
      cooldownSec: 600,
      condition: () => deps.metricsSnapshot().taskFailuresLastHour > 10,
    },
    {
      id: "tenant_quota_repeated",
      description: "Algún tenant ha superado su cuota más de 5 veces",
      severity: "warning",
      cooldownSec: 3600,
      condition: () => deps.metricsSnapshot().tenantQuotaExceeded > 5,
    },
    {
      id: "worker_down",
      description: "El worker no está corriendo",
      severity: "critical",
      cooldownSec: 300,
      condition: () => !deps.metricsSnapshot().workerRunning,
    },
    {
      id: "http_latency_p99",
      description: "Latencia p99 de HTTP superior a 2s",
      severity: "warning",
      cooldownSec: 600,
      condition: () => {
        // Placeholder: la latencia p99 se calcula con histograma.
        // Hasta implementar histograma, esta alerta no dispara.
        return false;
      },
    },
    // RESILIENCE_ALERTS_V1 — 3 alertas específicas de resiliencia.
    // Ver: docs/audits/03-resiliencia/roadmap.md §8.
    {
      id: "circuit_breaker_open",
      description: "Algún circuit breaker lleva abierto más de 5 minutos",
      severity: "critical",
      cooldownSec: 600,
      condition: () => deps.metricsSnapshot().circuitOpenCount > 0,
    },
    {
      id: "dead_letter_growing",
      description: "Más de 10 tareas en el dead-letter queue sin resolver",
      severity: "warning",
      cooldownSec: 1800,
      condition: () => deps.metricsSnapshot().deadLetterCount > 10,
    },
    {
      id: "outcome_unknown_accumulating",
      description: "Más de 3 acciones en outcome_unknown sin reconciliar",
      severity: "warning",
      cooldownSec: 1800,
      condition: () => deps.metricsSnapshot().outcomeUnknownCount > 3,
    },
  ];
}
```

## File: apps/server/src/engine/retry.ts
```typescript
// RETRY_V1 — backoff exponencial con jitter.
//
// Primitiva base del bloque 03. La usan model-chain, worker, google y computer.
//
// Ver: docs/audits/03-resiliencia/miniaudit.md ("Sin retry con backoff"),
// docs/audits/03-resiliencia/roadmap.md §8 ("el sistema reintenta con backoff").
//
// Reglas:
//   - Nunca reintentar errores deterministas (4xx, validación).
//   - Sí reintentar errores transitorios (5xx, timeouts, red).
//   - Jitter completo (no parcial): evita thundering herd cuando N tareas
//     fallan por el mismo proveedor caído y reintentan a la vez.

export interface RetryOptions {
  maxAttempts: number;
  baseMs: number;
  maxMs: number;
  /** Determina si un error merece reintento. Default: true para errores transitorios. */
  isRetryable?: (error: unknown) => boolean;
  /** Callback por cada intento fallido (útil para logging/métricas). */
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void;
  /** Signal externo (abort del worker, shutdown). */
  signal?: AbortSignal;
}

export function defaultIsRetryable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  // Abortos explícitos: no reintentar.
  if (error.name === "AbortError") return false;
  // Errores tipados con status 4xx: no reintentar.
  const status = (error as { status?: number }).status;
  if (typeof status === "number") {
    if (status >= 400 && status < 500 && status !== 408 && status !== 429) return false;
    if (status >= 500 || status === 408 || status === 429) return true;
  }
  // Errores de red / timeout / DNS.
  const message = error.message.toLowerCase();
  if (/timeout|econn|enotfound|eai_again|socket|network|aborted|fetch failed/.test(message)) {
    return true;
  }
  // Errores tipo OutcomeUnknownError del dominio: el efecto puede haber salido.
  if ((error as { outcomeUnknown?: boolean }).outcomeUnknown === true) return false;
  // Por defecto, no reintentar: preferimos declarar explícitamente qué es retryable.
  return false;
}

/** Jitter completo: un valor uniforme en [0, delay]. Evita sincronización de reintentos. */
function withFullJitter(delayMs: number): number {
  return Math.floor(Math.random() * delayMs);
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const isRetryable = options.isRetryable ?? defaultIsRetryable;
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {
    options.signal?.throwIfAborted();
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === options.maxAttempts) break;
      if (!isRetryable(error)) break;

      // Backoff exponencial: base * 2^(attempt-1), capado a maxMs.
      const expDelay = Math.min(options.maxMs, options.baseMs * 2 ** (attempt - 1));
      const delayMs = withFullJitter(expDelay);

      options.onRetry?.(attempt, delayMs, error);
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, delayMs);
        const abort = () => {
          clearTimeout(timer);
          reject(new Error("Aborted during retry backoff"));
        };
        options.signal?.addEventListener("abort", abort, { once: true });
      });
    }
  }
  throw lastError;
}
```

## File: apps/server/src/metrics/registry.ts
```typescript
// METRICS_REGISTRY_V1 — contadores y gauges acumulativos en memoria.
//
// Los servicios incrementan aquí. /metrics solo serializa.
// Sin esto, cada GET /metrics escanea la DB entera.
// Ver: docs/audits/02-observabilidad/miniaudit.md ("metrics-exporter
// genera las métricas bajo demanda, no las acumula").

type Labels = Record<string, string>;

function labelKey(labels: Labels): string {
  const entries = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([k, v]) => `${k}="${v}"`).join(",");
}

interface Counter {
  name: string;
  help: string;
  samples: Map<string, { labels: Labels; value: number }>;
}

interface Gauge {
  name: string;
  help: string;
  samples: Map<string, { labels: Labels; value: number }>;
}

export class MetricsRegistry {
  private readonly counters = new Map<string, Counter>();
  private readonly gauges = new Map<string, Gauge>();

  counter(name: string, help: string): void {
    if (!this.counters.has(name)) {
      this.counters.set(name, { name, help, samples: new Map() });
    }
  }

  gauge(name: string, help: string): void {
    if (!this.gauges.has(name)) {
      this.gauges.set(name, { name, help, samples: new Map() });
    }
  }

  inc(name: string, labels: Labels = {}, value = 1): void {
    const c = this.counters.get(name);
    if (!c) return;
    const key = labelKey(labels);
    const sample = c.samples.get(key) ?? { labels, value: 0 };
    sample.value += value;
    c.samples.set(key, sample);
  }

  set(name: string, value: number, labels: Labels = {}): void {
    const g = this.gauges.get(name);
    if (!g) return;
    g.samples.set(labelKey(labels), { labels, value });
  }

  render(): string {
    const lines: string[] = [];
    for (const c of this.counters.values()) {
      lines.push(`# HELP ${c.name} ${c.help}`);
      lines.push(`# TYPE ${c.name} counter`);
      for (const s of c.samples.values()) {
        const lbl = Object.entries(s.labels).map(([k, v]) => `${k}="${v}"`).join(",");
        lines.push(`${c.name}${lbl ? `{${lbl}}` : ""} ${s.value}`);
      }
    }
    for (const g of this.gauges.values()) {
      lines.push(`# HELP ${g.name} ${g.help}`);
      lines.push(`# TYPE ${g.name} gauge`);
      for (const s of g.samples.values()) {
        const lbl = Object.entries(s.labels).map(([k, v]) => `${k}="${v}"`).join(",");
        lines.push(`${g.name}${lbl ? `{${lbl}}` : ""} ${s.value}`);
      }
    }
    return lines.join("\n") + "\n";
  }
}

export const globalMetrics = new MetricsRegistry();

// Registro de los contadores y gauges base.
globalMetrics.counter("openmuse_http_requests_total", "Requests HTTP por método, ruta y status");
globalMetrics.counter("openmuse_tasks_created_total", "Tareas creadas por tenant y tipo");
globalMetrics.counter("openmuse_tasks_completed_total", "Tareas completadas por tenant y estado");
globalMetrics.counter("openmuse_llm_calls_total", "Llamadas al LLM por velocidad, modelo, source");
// METRIC_LLM_SPEED_V1 - incluye label speed.
globalMetrics.counter("openmuse_llm_tokens_total", "Tokens consumidos por velocidad y modelo");
globalMetrics.gauge("openmuse_worker_running", "1 si el worker está corriendo");
globalMetrics.gauge("openmuse_tasks_active", "Tareas activas por tenant");
globalMetrics.gauge("openmuse_tenants_total", "Tenants activos");
// METRIC_LATENCY_SPEED_V1 - latencia por velocidad.
globalMetrics.counter("openmuse_llm_latency_ms_sum", "Suma de latencias");
globalMetrics.counter("openmuse_llm_latency_ms_count", "Numero de llamadas");
```

## File: apps/server/src/middleware/request-logger.ts
```typescript
// REQUEST_LOGGER_V1 — correlationId + logging estructurado por request.
//
// Genera un correlationId por request (o reusa el header X-Correlation-Id)
// y lo propaga al resto del código vía AsyncLocalStorage.
//
// Ver: docs/audits/02-observabilidad/miniaudit.md ("Sin traceId").

import type { Context, Next } from "hono";
import { randomUUID } from "node:crypto";
import { withLogContext, logInfo, logWarn } from "../log.ts";
import { globalMetrics } from "../metrics/registry.ts";

/**
 * Extrae el correlationId de la cabecera o genera uno nuevo.
 * Acepta X-Correlation-Id y X-Request-Id para clientes existentes.
 */
function correlationIdFrom(c: Context): string {
  const fromHeader =
    c.req.header("x-correlation-id") ??
    c.req.header("x-request-id") ??
    c.req.header("traceparent")?.split("-")[1];
  if (fromHeader && /^[A-Za-z0-9._-]{8,128}$/.test(fromHeader)) return fromHeader;
  return randomUUID();
}

/**
 * Middleware que envuelve el request en un contexto de correlación.
 * Debe registrarse ANTES que cualquier otro middleware que loguee.
 */
export function requestLogger() {
  return async (c: Context, next: Next) => {
    const correlationId = correlationIdFrom(c);
    const startedAt = performance.now();
    const method = c.req.method;
    const path = new URL(c.req.url).pathname;

    // Cabecera de vuelta para que el cliente pueda trazar.
    c.header("X-Correlation-Id", correlationId);

    await withLogContext({ correlationId }, async () => {
      logInfo("http.request", { method, path });
      try {
        await next();
        const durationMs = Math.round(performance.now() - startedAt);
        const status = c.res.status;
        const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
        const emit = level === "warn" ? logWarn : logInfo;
        emit("http.response", { method, path, status, durationMs });
        // METRICS_HTTP_V1 — contador por método, ruta y status.
        globalMetrics.inc("openmuse_http_requests_total", {
          method,
          path: path.replace(/\/[0-9a-f-]{8,}/gi, "/:id"),
          status: String(status),
        });
      } catch (error) {
        const durationMs = Math.round(performance.now() - startedAt);
        logWarn("http.error", {
          method,
          path,
          durationMs,
          error: error instanceof Error ? error.name : "UnknownError",
          message: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500),
        });
        throw error;
      }
    });
  };
}
```

## File: apps/server/src/log.ts
```typescript
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
```
