# 02 — Observabilidad

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/server/src/log.ts, metrics-exporter.ts, app.ts

## Ontología del área

Conceptos: `SystemEvent`, `KernelContext.correlationId`, `RunEvent`,
`health-deep`, métricas Prometheus, `backgroundFailure`.

La observabilidad es lo que permite reconstruir qué pasó en una ejecución
concreta (HTTP → task → turn → thought).

## Estado real del código

- `log.ts` con `emit(level, event, fields)` que imprime JSON de una línea.
- `metrics-exporter.ts` con `openmuse_worker_running`,
  `openmuse_tasks_total{tenant,status}`, `openmuse_roles_total`,
  `openmuse_tasks_running`, `openmuse_tasks_failed`, `openmuse_builds_total`.
- `/api/health-deep` verifica DB, bus, worker, kernel, tenantService,
  capabilities, guardrails, metrics.
- `backgroundFailure(phase, error)` en `log.ts`.

## Evidencia

- Los tests de `test-full.txt` **no muestran tracing**. Solo logs.
- Los errores 429 de Gemini **no se distinguen** de errores de código en el
  log. `backgroundFailure("event emit action.deferred", error)` no incluye
  tenantId ni taskId.
- `metrics-exporter.ts` genera las métricas **bajo demanda**, no las acumula.
  Cada `GET /metrics` recalcula desde la DB.

## Huecos concretos

- **No hay `traceId`**. El `KernelContext` tiene `correlationId` pero no está
  claro que se propague a los logs.
- **No hay tracing distribuido** (OpenTelemetry). Solo logs y métricas.
- **No hay alertas**. Ninguna regla dispara por "X fallos en Y minutos".
- **No hay dashboards**. Solo el endpoint `/metrics`.
- **`backgroundFailure(phase, error)` no incluye contexto**. Sin `owner`,
  `tenantId`, `taskId`, es difícil filtrar 100 tenants.
- **No hay redacción de secretos**. Un `console.log` de un payload puede
  filtrar tokens.

## Interrelación

- Transversal. Todas las ramas necesitan emitir métricas y logs.
- Comparte archivos con `08-bus-de-eventos` (`system-events` es la fuente de
  verdad de las métricas agregadas).

## Riesgos

- Que un fallo en producción no se pueda diagnosticar por falta de contexto.
- Que los logs de `system-events` crezcan sin tope.
- Que `/metrics` se calcule en cada request y bloquee la DB.

## Tipo de fixes

1. Propagar `correlationId` desde HTTP hasta cada log.
2. Añadir `owner`, `tenantId`, `taskId` a `backgroundFailure`.
3. Redacción de campos sensibles (`token`, `apiKey`, `authorization`).
4. Alertas mínimas: worker down, DB down, rate limit, backup fallido.
5. Métricas acumulativas en memoria + flush a DB, no cálculo bajo demanda.
