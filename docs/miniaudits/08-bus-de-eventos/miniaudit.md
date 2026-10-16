# 08 — Bus de eventos

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump engine/events/*, código real tras bloques 01-09

## Ontología

SystemEvent, SystemEventType, EventBus, EventSink, EventQuery, dedupeKey, correlationId, causationId.

## Estado real

EventBus.emit con Zod. 41 tipos en SYSTEM_EVENT_TYPES. StoreSink append-only con insertIfAbsent. StoreQuery.recent con filtros; aggregate con GROUP BY. dedupeKey opcional con TTL 60s.

## Evidencia

Los tests "todo SystemEventType tiene schema y payload", "EventBus.emit no lanza con ningun tipo", "todo SystemEventType aparece en algun bus.emit" pasan. No hay SSE en vivo. Solo polling cada 5s.

## Huecos declarados

- Sin SSE.
- Solo ReactionEngine lo lee.
- Retención uniforme 90 días.
- Faltan índices para agregados.

## Huecos profundos (auditoría extendida)

1. **`ulid` no expone `timestampOf(id)`**: para ordenar por ULID hace falta parsear el id manualmente.
2. **`dedupeKey` sin TTL variable**: siempre 60s. Un evento de "task status changed" puede repetirse en <60s y perderse.
3. **`dedupe-state` sin límite por owner**: LRU de 64 entradas. Con 100 eventos/s, se pierden claves.
4. **`emit` fire-and-forget con catch silencioso**: si el sink falla, nadie se entera. Debería incrementar un contador.
5. **`StoreSink.write` no valida tenantId**: cualquier tenantId vale. Un bug puede contaminar otro tenant.
6. **`StoreQuery.recent` filtra en memoria**: trae todos los eventos del owner y filtra por tipo/since. Con 100.000 eventos, es lento.
7. **`StoreQuery.recent` con `limit` tope 200**: con 1000 eventos por hora, solo se ven 200. Paginación real necesaria.
8. **`aggregate` con `GROUP BY` sin índice**: cada llamada escanea toda la tabla del owner.
9. **Sin `sinceId` en `recent`**: el cliente no puede hacer polling incremental eficiente.
10. **Sin `system-events` en el índice compuesto `(owner, kind, updated_at)`**: el índice existe pero no filtra por tipo. El agregado sigue lento.
11. **`schema-registry.ts` no se usa en runtime**: solo valida al emitir pero no se expone el registro. `GET /schemas` no lo consume.
12. **`payloadSchemas` con `Record<SystemEventType, ZodTypeAny>`**: si se añade un tipo sin schema, TS falla pero runtime no.
13. **Sin `causationId` consistente**: los emisores rara vez lo pasan. Sin cadena causal real.
14. **Sin `correlationId` propagado automáticamente**: cada emisor lo pasa o no. Inconsistente.
15. **`EventBus` sin dedupe por defecto**: los emisores tienen que acordarse de pasar dedupeKey. Ruido en `system-events`.
16. **Sin "replay" endpoint**: no hay forma de reprocesar eventos históricos.
17. **Sin "snapshot del bus" endpoint**: el operador no puede ver el estado agregado.
18. **Sin `BusSink` alternativo (Kafka, OTel)**: solo StoreSink. Frontera declarada pero sin stub funcional.
19. **Sin test de 1000 eventos/s**: no hay test de estrés del bus.
20. **Sin retención por tipo aplicada**: `retention.ts` existe tras fix 08-03 pero `maintain()` no lo usa hasta fix 08-14.

## Interrelación

Transversal. Alimenta 02, 09, 12.

## Riesgos

system-events crece sin tope. dedupeKey olvidado. Evento escrito y nadie lo lee.

## Tipo de fixes

GET /api/events/stream con SSE. Retención por tipo. Test de dedupe por tipo. Índices para agregados. `sinceId` en recent. `causationId` consistente. Dedupe por defecto. Replay endpoint. Snapshot endpoint. Sink alternativo stub.
