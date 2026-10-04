# 08 — Bus de eventos

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump engine/events/*

## Ontología del área

Conceptos: `SystemEvent`, `SystemEventType`, `EventBus`, `EventSink`,
`EventQuery`, `dedupeKey`, `correlationId`, `causationId`.

Es la columna vertebral de la observabilidad, del kernel cognitivo, de las
reacciones y de las notificaciones.

## Estado real del código

- `EventBus.emit(owner, type, source, payload, options)` con Zod.
- 41 tipos de evento en `SYSTEM_EVENT_TYPES`.
- `StoreSink` append-only con `insertIfAbsent`.
- `StoreQuery.recent` con filtros; `aggregate` con `GROUP BY` en SQL.
- `dedupeKey` opcional con TTL 60s.

## Evidencia

- El test `todo SystemEventType tiene schema y un payload minimo valido`
  **pasa**.
- El test `EventBus.emit no lanza con ningun tipo del enum` **pasa** (con
  background_failure de `action.deferred`, `action.cancelled`, `view.resolved`
  hasta el fix de este pase).
- El test `todo SystemEventType del enum aparece en algun bus.emit del repo`
  **pasa**.
- **No hay SSE en vivo**. Solo polling en `useLiveActivity`.

## Huecos concretos

- **SSE en vivo**. Hoy solo `GET /api/events` con polling cada 5s.
- **Consumidores reales**. Hoy solo `ReactionEngine` lo lee. `Meta`,
  `observability` podrían consumirlo.
- **Retención por tipo**. 90 días para todos.
- **Índices adicionales**. `records(kind, data->>'type', updated_at)`.

## Interrelación

- Transversal.
- Comparte `db.ts` con `04`, `05`, `07`.
- Alimenta `02-observabilidad`, `09-kernel-cognitivo`, `12-contexto-memoria`.

## Riesgos

- Que `system-events` crezca sin tope.
- Que el `dedupeKey` se olvide en sitios críticos.
- Que un evento se escriba pero nadie lo lea.

## Tipo de fixes

1. `GET /api/events/stream` con SSE.
2. Retención por tipo: `task.*` 90d, `policy.*` 30d, `agent.*` 7d.
3. Test que verifique que cada tipo con `dedupeKey` no se duplica.
4. Índices para agregados rápidos.
