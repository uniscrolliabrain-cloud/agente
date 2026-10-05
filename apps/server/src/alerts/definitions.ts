// ALERTS_DEFINITIONS_V1 â€” las 5 alertas mÃ­nimas del roadmap 02.
//
// Ver: docs/audits/02-observabilidad/roadmap.md Â§8 ("5 alertas definidas
// y probadas").
//
// Cada alerta es una condiciÃ³n sobre datos observables. No escanean la DB:
// leen de un snapshot inyectado por el caller (tÃ­picamente el MetricsRegistry
// o el AlertService desde index.ts).

import type { AlertDefinition } from "./service.ts";

export interface AlertDeps {
  metricsSnapshot: () => {
    http5xx: number;
    httpTotal: number;
    taskFailuresLastHour: number;
    tenantQuotaExceeded: number;
    workerRunning: boolean;
    /** LATENCY_P99_WIRE_V1 - p99 de latencia HTTP en ms. */
    httpLatencyP99Ms: number;
    /** RESILIENCE_ALERTS_V1 â€” campos aÃ±adidos para el bloque 03. */
    circuitOpenCount: number;
    deadLetterCount: number;
    outcomeUnknownCount: number;
  };
}

export function buildAlertDefinitions(deps: AlertDeps): AlertDefinition[] {
  return [
    {
      id: "http_5xx_high",
      description: "Errores 5xx superan el 5% de los requests en la Ãºltima ventana",
      severity: "critical",
      cooldownSec: 300,
      condition: () => {
        const s = deps.metricsSnapshot();
        return s.httpTotal >= 20 && s.http5xx / s.httpTotal > 0.05;
      },
    },
    {
      id: "tasks_failing_burst",
      description: "MÃ¡s de 10 tareas fallidas en la Ãºltima hora",
      severity: "critical",
      cooldownSec: 600,
      condition: () => deps.metricsSnapshot().taskFailuresLastHour > 10,
    },
    {
      id: "tenant_quota_repeated",
      description: "AlgÃºn tenant ha superado su cuota mÃ¡s de 5 veces",
      severity: "warning",
      cooldownSec: 3600,
      condition: () => deps.metricsSnapshot().tenantQuotaExceeded > 5,
    },
    {
      id: "worker_down",
      description: "El worker no estÃ¡ corriendo",
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
        // LATENCY_P99_WIRE_V1 - lee el histograma HTTP y calcula p99.
        return deps.metricsSnapshot().httpLatencyP99Ms > 2000;
      },
    },
    // RESILIENCE_ALERTS_V1 â€” 3 alertas especÃ­ficas de resiliencia.
    // Ver: docs/audits/03-resiliencia/roadmap.md Â§8.
    {
      id: "circuit_breaker_open",
      description: "AlgÃºn circuit breaker lleva abierto mÃ¡s de 5 minutos",
      severity: "critical",
      cooldownSec: 600,
      condition: () => deps.metricsSnapshot().circuitOpenCount > 0,
    },
    {
      id: "dead_letter_growing",
      description: "MÃ¡s de 10 tareas en el dead-letter queue sin resolver",
      severity: "warning",
      cooldownSec: 1800,
      condition: () => deps.metricsSnapshot().deadLetterCount > 10,
    },
    {
      id: "outcome_unknown_accumulating",
      description: "MÃ¡s de 3 acciones en outcome_unknown sin reconciliar",
      severity: "warning",
      cooldownSec: 1800,
      condition: () => deps.metricsSnapshot().outcomeUnknownCount > 3,
    },
  ];
}
