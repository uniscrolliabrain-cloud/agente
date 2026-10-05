// REQUEST_LOGGER_V1 Ã¢â‚¬â€ correlationId + logging estructurado por request.
//
// Genera un correlationId por request (o reusa el header X-Correlation-Id)
// y lo propaga al resto del cÃƒÂ³digo vÃƒÂ­a AsyncLocalStorage.
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
// TRACEPARENT_PARSE_V1 - parsea y valida traceparent W3C.
function parseTraceparent(header: string | undefined): string | undefined {
  if (!header) return undefined;
  const parts = header.split("-");
  if (parts.length !== 4) return undefined;
  const [version, traceId, spanId, flags] = parts;
  if (!/^[0-9a-f]{2}$/.test(version)) return undefined;
  if (!/^[0-9a-f]{32}$/.test(traceId)) return undefined;
  if (!/^[0-9a-f]{16}$/.test(spanId)) return undefined;
  if (!/^[0-9a-f]{2}$/.test(flags)) return undefined;
  if (traceId === "0".repeat(32)) return undefined;
  if (spanId === "0".repeat(16)) return undefined;
  return traceId;
}

function correlationIdFrom(c: Context): string {
  const traceId = parseTraceparent(c.req.header("traceparent"));
  const fromHeader =
    c.req.header("x-correlation-id") ??
    c.req.header("x-request-id") ??
    traceId;
  if (fromHeader && /^[A-Za-z0-9._-]{8,128}$/.test(fromHeader)) return fromHeader;
  return randomUUID();
}

/**
 * Middleware que envuelve el request en un contexto de correlaciÃƒÂ³n.
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
        // METRICS_HTTP_V1 Ã¢â‚¬â€ contador por mÃƒÂ©todo, ruta y status.
        globalMetrics.inc("openmuse_http_requests_total", {
          method,
          path: path.replace(/\/[0-9a-f-]{8,}/gi, "/:id"),
          status: String(status),
        });
        // HISTOGRAM_HTTP_LATENCY_WIRE_V1 - observa la duraciÃ³n en ms.
        globalMetrics.observe(
          "openmuse_http_request_duration_ms",
          durationMs,
          { method, path: path.replace(/\/[0-9a-f-]{8,}/gi, "/:id"), status: String(status) },
        );
        // HTTP_ERRORS_AND_HISTOGRAM_V1 - contador dedicado a errores por ruta.
        if (status >= 400) {
          globalMetrics.inc("http_errors_by_route_total", {
            method,
            path: path.replace(/\/[0-9a-f-]{8,}/gi, "/:id"),
            status: String(status),
          });
        }
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
