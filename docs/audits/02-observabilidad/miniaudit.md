# 02 — Observabilidad

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump log.ts, metrics-exporter.ts, app.ts, engine/events/*, código real tras bloques 01-09

## Ontología

SystemEvent, KernelContext.correlationId, RunEvent, health-deep, métricas Prometheus, backgroundFailure.

## Estado real

log.ts con emit(level, event, fields) que imprime JSON de una línea. metrics-exporter.ts con 6 métricas. /api/health-deep verifica DB, bus, worker, kernel, tenantService, capabilities, guardrails, metrics. backgroundFailure(phase, error) en log.ts.

## Evidencia

Los tests no muestran tracing. Los errores 429 de Gemini no se distinguen de errores de código en el log. metrics-exporter genera las métricas bajo demanda, no las acumula.

## Huecos declarados

- Sin traceId.
- Sin tracing distribuido (OTel).
- Sin alertas.
- Sin dashboards.
- backgroundFailure sin contexto (owner, tenantId, taskId).
- Sin redacción de secretos.

## Huecos profundos (auditoría extendida)

1. **`logInfo`/`logWarn`/`logError` no aceptan contexto estructurado**: hay que concatenar strings. Se pierden campos en el parseo JSON.
2. **Sin sampling**: en producción con 100 req/s, se escriben 100 líneas/s de log info. Ruido.
3. **Sin rotación de logs**: el archivo crece indefinidamente. En 1 mes, 10 GB.
4. **Sin separación por nivel**: errors y debug van al mismo stream. El operador no puede filtrar barato.
5. **`console.log` directo en algunos sitios**: `kernel/graph/store-store.ts`, `metrics-exporter.ts`, `admin-routes.ts` usan `console.warn` directo, saltándose `log.ts`.
6. **Sin `LOG_LEVEL` respetado en todos los sitios**: algunos logs son hardcoded, otros respetan el nivel. Inconsistente.
7. **Sin log de HTTP bodies**: cuando un request falla, no hay forma de saber qué envió el cliente sin tocar el código.
8. **Sin contador de errores por ruta**: `/metrics` no expone `http_errors_by_route_total`. Saber qué endpoint falla más es manual.
9. **Sin histograma de latencia**: `openmuse_http_requests_total` no tiene versión histogram. No hay p50/p95/p99.
10. **`metrics-exporter.ts` recalcula todo en cada GET**: con 50 tenants son 50×4 list = 200 queries por request a /metrics.
11. **Sin `metrics_flush` a storage**: las métricas viven solo en memoria. Reinicio = pierde histórico.
12. **Sin dashboards predefinidos**: ni Grafana, ni JSON de dashboards, ni nada.
13. **Sin alertas implementadas**: el AlertService existe (fix 02-09) pero solo 5 alertas definidas. Faltan: circuito abierto, DLQ creciendo, tenant con quota agotada, worker caído, error rate >5%.
14. **Sin logs de decisión**: cuando el kernel decide un destino (Promoter), no hay log. Debug imposible.
15. **Sin traceId propagado al kernel**: `correlationId` se propaga al HTTP pero no llega a `Thought.provenance`. Imposible correlacionar un turno con un request.
16. **`backgroundFailure` no distingue transitorio vs permanente**: un 503 de Google reintentable y un 400 determinista van al mismo log. El operador no sabe cuál priorizar.
17. **Sin contador de fallos por fase**: `backgroundFailure` loguea pero no incrementa un contador. No hay `background_failures_total{phase}`.
18. **Sin `traceparent` W3C**: no se acepta ni se emite el header estándar de tracing. Imposible integrarse con OTel.
19. **Sin logs estructurados de excepciones**: los errores se loguean como string, no como JSON con `name`, `message`, `stack`, `cause`.
20. **Sin retención de logs**: el log.jsonl crece sin tope. Debería rotarse por tamaño o por días.

## Interrelación

Transversal. Comparte system-events con 08.

## Riesgos

Fallo sin diagnosticar. system-events crece sin tope. /metrics bloquea la DB al calcularse en cada request.

## Tipo de fixes

Propagar correlationId a cada log. Añadir contexto a backgroundFailure. Redacción de campos sensibles. Alertas mínimas. Métricas acumulativas con flush a DB. Sampling. Rotación. Histograma de latencia.
