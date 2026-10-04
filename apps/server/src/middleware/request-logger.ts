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
