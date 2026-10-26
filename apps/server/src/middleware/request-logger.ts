// REQUEST_LOGGER_V1 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â correlationId + logging estructurado por request.
//
// Genera un correlationId por request (o reusa el header X-Correlation-Id)
// y lo propaga al resto del cÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³digo vÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a AsyncLocalStorage.
//
// Ver: docs/audits/02-observabilidad/miniaudit.md ("Sin traceId").

import type { Context, Next } from "hono";
import { randomUUID } from "node:crypto";
import { withLogContext, logInfo, logWarn, logContext } from "../log.ts";
import { globalMetrics } from "../metrics/registry.ts";

/**
 * Extrae el correlationId de la cabecera o genera uno nuevo.
 * Acepta X-Correlation-Id y X-Request-Id para clientes existentes.
 */
// TRACEPARENT_PARSE_V1 - parsea y valida traceparent W3C.
  // MIDDLEWARE_TRACEPARENT_V1
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
 * Middleware que envuelve el request en un contexto de correlaciÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n.
 * Debe registrarse ANTES que cualquier otro middleware que loguee.
 */
  // MIDDLEWARE_REQUEST_LOGGER_V1
export interface RequestLoggerOptions {
  // LOG_CONTEXT_TENANT_V1 - resuelve el tenantId del owner para el logContext.
  getTenantId?: (owner: string) => Promise<string>;
}

export function requestLogger(options: RequestLoggerOptions = {}) {
  return async (c: Context, next: Next) => {
    const correlationId = correlationIdFrom(c);
    const startedAt = performance.now();
    const method = c.req.method;
    const path = new URL(c.req.url).pathname;

    // Cabecera de vuelta para que el cliente pueda trazar.
    c.header("X-Correlation-Id", correlationId);

    // LOG_CONTEXT_TENANT_V1 - si options.getTenantId esta y ya hay owner en
    // el contexto, se resuelve tenantId. Si no, comportamiento anterior.
    // (Nota: el middleware de auth corre DESPUES; ver deuda Fase 4.)
    const preCtx = logContext.getStore();
    let tenantId: string | undefined;
    if (options.getTenantId && preCtx?.owner) {
      try { tenantId = await options.getTenantId(preCtx.owner); } catch { tenantId = undefined; }
    }
    await withLogContext(
      { correlationId, ...(tenantId ? { tenantId } : {}), ...(preCtx?.owner ? { owner: preCtx.owner } : {}) },
      async () => {
        // METRICS_TENANT_LABEL_V1 — tenantId del logContext para logs y métricas.
      const tenantIdForLabels = logContext.getStore()?.tenantId;
      logInfo("http.request", { method, path, ...(tenantIdForLabels ? { tenantId: tenantIdForLabels } : {}) });
      try {
        await next();
        const durationMs = Math.round(performance.now() - startedAt);
        const status = c.res.status;
        const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
        const emit = level === "warn" ? logWarn : logInfo;
        emit("http.response", { method, path, status, durationMs });
        // METRICS_HTTP_V1 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â contador por mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©todo, ruta y status.
        // MIDDLEWARE_HTTP_METRIC_V1
        // METRICS_TENANT_LABEL_V1 — label `tenant` si hay tenantId.
        // METRICS_LABELS_TYPE_V1 - Labels exige Record<string,string>; el ternario
        // producia un union con {} que no encajaba en la firma.
        const tenantLabels: Record<string, string> = tenantIdForLabels
          ? { tenant: tenantIdForLabels }
          : {};
        globalMetrics.inc("openmuse_http_requests_total", {
          method,
          path: path.replace(/\/[0-9a-f-]{8,}/gi, "/:id"),
          status: String(status),
          ...tenantLabels,
        });
        // HISTOGRAM_HTTP_LATENCY_WIRE_V1 - observa la duraciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n en ms.
        // MIDDLEWARE_HTTP_HISTOGRAM_V1
        // METRICS_TENANT_LABEL_V1 — idem para el histograma.
        globalMetrics.observe(
          "openmuse_http_request_duration_ms",
          durationMs,
          { method, path: path.replace(/\/[0-9a-f-]{8,}/gi, "/:id"), status: String(status), ...tenantLabels },
        );
        // HTTP_ERRORS_AND_HISTOGRAM_V1 - contador dedicado a errores por ruta.
        if (status >= 400) {
          // MIDDLEWARE_HTTP_ERRORS_V1
          // METRICS_TENANT_LABEL_V1 — idem para errores por ruta.
          globalMetrics.inc("http_errors_by_route_total", {
            method,
            path: path.replace(/\/[0-9a-f-]{8,}/gi, "/:id"),
            status: String(status),
            ...tenantLabels,
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
