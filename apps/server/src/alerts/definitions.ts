// ALERTS_DEFINITIONS_V1 â€” las 5 alertas mÃ­nimas del roadmap 02.
//
// Ver: docs/audits/02-observabilidad/roadmap.md Â§8 ("5 alertas definidas
// y probadas").
//
// Cada alerta es una condiciÃ³n sobre datos observables. No escanean la DB:
// leen de un snapshot inyectado por el caller (tÃ­picamente el MetricsRegistry
// o el AlertService desde index.ts).

import type { AlertDefinition } from "./service.ts";

export interface AlertSnapshot {
  http5xx: number | undefined;
  httpTotal: number | undefined;
  taskFailuresLastHour: number | undefined;
  tenantQuotaExceeded: number | undefined;
  workerRunning: boolean | undefined;
  httpLatencyP99Ms: number | undefined;
  circuitOpenCount: number | undefined;
  deadLetterCount: number | undefined;
  outcomeUnknownCount: number | undefined;
}
export interface AlertDeps {
  metricsSnapshot: () => AlertSnapshot | Promise<AlertSnapshot>;
}

/** Counts cover rows visible to this store's database role, not a proof of global RLS coverage. */
export function createAlertSnapshotReader(
  db: Pick<import("../db.ts").Store, "rawQuery">,
  metrics: import("../metrics/registry.ts").MetricsRegistry,
  circuits: Pick<import("../engine/circuit-breaker.ts").CircuitRegistry, "all">,
  workerRunning: () => boolean | undefined,
) {
  metrics.gauge("agente_alert_source_available", "Whether an alert input has measured data");
  let cached: Promise<AlertSnapshot> | undefined;
  let expires = 0;
  let inFlight = false;
  return (): Promise<AlertSnapshot> => {
    if (cached && (inFlight || Date.now() < expires)) return cached;
    inFlight = true;
    cached = (async () => {
      let taskFailuresLastHour: number | undefined, deadLetterCount: number | undefined, outcomeUnknownCount: number | undefined;
      try {
        const [row] = await db.rawQuery<{ tasks: string | number; dead: string | number; unknown: string | number }>(
          `SELECT count(*) FILTER (WHERE kind='tasks' AND data->>'status'='failed' AND updated_at >= now()-interval '1 hour') AS tasks,
           count(*) FILTER (WHERE kind='dead-letter' AND nullif(data->>'resolvedAt','') IS NULL) AS dead,
           count(*) FILTER (WHERE kind='actions' AND data->>'status'='outcome_unknown') AS unknown
           FROM records WHERE kind IN ('tasks','dead-letter','actions')`);
        const count = (value: unknown) => {
          if ((typeof value !== "number" && typeof value !== "string") || (typeof value === "string" && !/^(0|[1-9][0-9]*)$/.test(value))) throw Error("INVALID_ALERT_COUNT");
          const parsed = Number(value);
          if (!Number.isSafeInteger(parsed) || parsed < 0 || value === "") throw Error("INVALID_ALERT_COUNT");
          return parsed;
        };
        const values = [count(row?.tasks), count(row?.dead), count(row?.unknown)];
        [taskFailuresLastHour, deadLetterCount, outcomeUnknownCount] = values;
      } catch { /* Unavailable is distinct from measured zero. */ }
      const httpTotal = metrics.counterTotal("agente_http_requests_total");
      let http5xx: number | undefined;
      if (httpTotal !== undefined) {
        http5xx = 0;
        for (let status = 500; status < 600; status++) http5xx += metrics.counterTotal("agente_http_requests_total", { status: String(status) }) ?? 0;
      }
      const snapshot: AlertSnapshot = { http5xx, httpTotal, taskFailuresLastHour, deadLetterCount, outcomeUnknownCount,
        tenantQuotaExceeded: metrics.counterTotal("agente_quota_exceeded_total"),
        workerRunning: workerRunning(), circuitOpenCount: circuits.all().filter(c => c.getState() === "open").length,
        httpLatencyP99Ms: metrics.quantile("agente_http_request_duration_ms", 0.99) };
      for (const [source, value] of Object.entries(snapshot)) metrics.set("agente_alert_source_available", value === undefined ? 0 : 1, { source });
      return snapshot;
    })().finally(() => { inFlight = false; expires = Date.now() + 1000; });
    return cached;
  };
}

export function buildAlertDefinitions(deps: AlertDeps): AlertDefinition[] {
  return [
    {
      id: "http_5xx_high",
      description: "Errores 5xx superan el 5% de los requests desde el inicio del proceso",
      severity: "critical",
      cooldownSec: 300,
      condition: async () => {
        // ALERTS_HTTP_5XX_WIRE_V1
        const s = await deps.metricsSnapshot();
        return s.httpTotal !== undefined && s.http5xx !== undefined && s.httpTotal >= 20 && s.http5xx / s.httpTotal > 0.05;
      },
    },
    {
      id: "tasks_failing_burst",
      description: "MÃ¡s de 10 tareas fallidas en la Ãºltima hora",
      severity: "critical",
      cooldownSec: 600,
      condition: async () => { const value = (await deps.metricsSnapshot()).taskFailuresLastHour; return value !== undefined && value > 10; },
    },
    {
      id: "tenant_quota_repeated",
      description: "AlgÃºn tenant ha superado su cuota mÃ¡s de 5 veces",
      severity: "warning",
      cooldownSec: 3600,
      condition: async () => { const value = (await deps.metricsSnapshot()).tenantQuotaExceeded; return value !== undefined && value > 5; },
    },
    {
      id: "worker_down",
      description: "El worker no estÃ¡ corriendo",
      severity: "critical",
      cooldownSec: 300,
      condition: async () => (await deps.metricsSnapshot()).workerRunning === false,
    },
    {
      id: "http_latency_p99",
      description: "Latencia p99 de HTTP superior a 2s",
      severity: "warning",
      cooldownSec: 600,
      condition: async () => {
        // ALERTS_HTTP_P99_WIRE_V1
        // LATENCY_P99_WIRE_V1 - lee el histograma HTTP y calcula p99.
        const value = (await deps.metricsSnapshot()).httpLatencyP99Ms;
        return value !== undefined && value > 2000;
      },
    },
    // RESILIENCE_ALERTS_V1 â€” 3 alertas especÃ­ficas de resiliencia.
    // Ver: docs/audits/03-resiliencia/roadmap.md Â§8.
    {
      id: "circuit_breaker_open",
      description: "Hay un circuit breaker abierto",
      severity: "critical",
      cooldownSec: 600,
      condition: async () => { const value = (await deps.metricsSnapshot()).circuitOpenCount; return value !== undefined && value > 0; },
    },
    {
      id: "dead_letter_growing",
      description: "MÃ¡s de 10 tareas en el dead-letter queue sin resolver",
      severity: "warning",
      cooldownSec: 1800,
      condition: async () => { const value = (await deps.metricsSnapshot()).deadLetterCount; return value !== undefined && value > 10; },
    },
    {
      id: "outcome_unknown_accumulating",
      description: "MÃ¡s de 3 acciones en outcome_unknown sin reconciliar",
      severity: "warning",
      cooldownSec: 1800,
      condition: async () => { const value = (await deps.metricsSnapshot()).outcomeUnknownCount; return value !== undefined && value > 3; },
    },
  ];
}
