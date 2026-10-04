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
