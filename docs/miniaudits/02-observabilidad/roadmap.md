# Roadmap — 02 observabilidad

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
No puedes operar lo que no ves. Base de cualquier deploy a producción.

## 2. Estado verificado
- log.ts con JSON de una línea.
- 6 métricas Prometheus bajo demanda.
- health-deep con checks.
- Fuente: repodump apps/server/src/log.ts, metrics-exporter.ts.

## 3. Huecos contra producción
- Sin traceId global.
- backgroundFailure sin owner/tenantId/taskId.
- Sin alertas.
- Sin dashboards.
- Sin redacción de secretos.

## 4. Objetivo
Reconstruir una operación end-to-end (HTTP → task → turn → thought) desde
los logs. Un fallo en producción dispara una alerta.

## 5. Fronteras
- No dashboards Grafana.
- No tracing OTel todavía.

## 6. Conexiones
- Transversal.
- Depende de: 08 (bus).
- Dependen de esta: todas.

## 7. Principios del PRODUCT.md
Tareas durables, kernel cognitivo.

## 8. Cómo se verifica el cierre
- Un request HTTP con correlationId propaga el id a todas las líneas.
- 5 alertas definidas y probadas.
- Redacción de token, apiKey, authorization.
