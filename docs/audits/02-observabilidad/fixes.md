# Fixes — 02 observabilidad

> v1 · 2026-10-05 · Estado: aplicado (23 fixes)

## Fixes aplicados

| # | Fix | Marca | Archivo | Estado |
|---|---|---|---|---|
| 01 | Sampling de logs INFO | LOG_SAMPLING_V1 | apps/server/src/log.ts | applied |
| 02 | LOG_LEVEL en todos los niveles | LOG_LEVEL_GLOBAL_V1 | apps/server/src/log.ts | applied |
| 03 | backgroundFailure retryable + stack + cause + contador | LOG_RETRYABLE_V1 | apps/server/src/log.ts | applied |
| 04 | Contadores background_failures_total + http_errors_by_route_total | METRIC_BG_FAILURES_V1 + METRIC_HTTP_ERRORS_V1 | apps/server/src/metrics/registry.ts | applied |
| 05 | Interfaz Histogram | HISTOGRAM_V1 | apps/server/src/metrics/registry.ts | applied |
| 06 | Campo histograms en MetricsRegistry | HISTOGRAM_FIELDS_V1 | apps/server/src/metrics/registry.ts | applied |
| 07 | Métodos histogram y observe | HISTOGRAM_METHODS_V1 | apps/server/src/metrics/registry.ts | applied |
| 08 | Render de histogramas | HISTOGRAM_RENDER_V1 | apps/server/src/metrics/registry.ts | applied |
| 09 | Registrar histograma HTTP | HISTOGRAM_HTTP_LATENCY_V1 | apps/server/src/metrics/registry.ts | applied |
| 10 | Errores por ruta + observación de latencia | HTTP_ERRORS_AND_HISTOGRAM_V1 | apps/server/src/middleware/request-logger.ts | applied |
| 11 | Activar alerta http_latency_p99 | LATENCY_P99_WIRE_V1 | apps/server/src/alerts/definitions.ts | applied |
| 12 | thoughtProvenance acepta correlationId | PROVENANCE_CORRELATION_V1 | apps/server/src/kernel/graph/thought.ts | applied |
| 13 | Kernel propaga correlationId a Thought | KERNEL_CORRELATION_PROPAGATE_V1 | apps/server/src/kernel/kernel.ts | applied |
| 14 | Parseo W3C de traceparent | TRACEPARENT_PARSE_V1 | apps/server/src/middleware/request-logger.ts | applied |
| 15 | Deduplicar quotaPerSpeed | CONFIG_QUOTA_DEDUP_V1 | apps/server/src/config.ts | applied |
| 16 | .strict() en thoughtProvenance | ATTENTION_STRICT_V1 | apps/server/src/kernel/graph/thought.ts | applied |
| 17 | Exponer p99 HTTP en /metrics | METRICS_P99_EXPOSE_V1 | apps/server/src/metrics-exporter.ts | applied |
| 18 | Método quantile en MetricsRegistry | HISTOGRAM_QUANTILE_V1 | apps/server/src/metrics/registry.ts | applied |
| 19 | Cablear AlertService en index.ts | ALERTS_WIRE_V1 | apps/server/src/index.ts | applied |
| 20 | snapshotHttp en MetricsRegistry | (no aplicado, sustituido por inline) | — | replaced |
| 21 | Fallback snapshotHttp inline | ALERTS_WIRE_FIX3_V1 | apps/server/src/index.ts | applied |
| 22 | Completar mock metricsSnapshot en test | ALERTS_TEST_MOCK_FIX_V1 | tests/alerts.test.ts | pending |
| 23 | Reparar snapshotHttp roto | ALERTS_WIRE_FIX3_V1 | apps/server/src/index.ts | applied |

## No aplicados (fuera de alcance o requieren decisión)

| # | Punto del miniaudit | Motivo |
|---|---|---|
| 3 | Rotación de logs | infra, no código |
| 4 | Separación por nivel | ya hecho con stdout/stderr |
| 7 | Log HTTP bodies | riesgo PII, requiere diseño |
| 11 | metrics_flush a storage | decisión de diseño |
| 12 | Dashboards Grafana | ops, no código |
| 20 | Retención de logs | infra, no código |
| 24 | console.log directos (27 sitios) | arranque/CLI/demo, caso por caso en bloque 00 |

## Notas

- AlertService se instancia al arrancar el server y evalúa las 8 alertas cada 30s.
- El histograma HTTP se puebla en request-logger; la alerta p99 se apoya en él.
- correlationId viaja del request HTTP al Thought.provenance.