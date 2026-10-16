# Roadmap — 08 bus de eventos

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Cada acción del sistema se registra y se puede reconstruir.

## 2. Estado verificado
- EventBus con Zod, 41 tipos, dedupe con TTL 60s.
- StoreSink append-only, StoreQuery con aggregate en SQL.
- Fuente: repodump engine/events/*.

## 3. Huecos contra producción
- Sin SSE en vivo (solo polling).
- Solo ReactionEngine lo lee.
- Retención uniforme 90 días.
- Faltan índices para agregados.

## 4. Objetivo
SSE en vivo. Consumidores reales además de ReactionEngine. Retención por
tipo.

## 5. Fronteras
- No Kafka ni OTel todavía.

## 6. Conexiones
- Transversal.
- Dependen de esta: 02, 09, 12.
- Archivos compartidos: engine/events/*, db.ts.

## 7. Principios del PRODUCT.md
Kernel cognitivo.

## 8. Cómo se verifica el cierre
- GET /api/events/stream con SSE.
- 3 consumidores reales del bus.
- Test de dedupe por tipo.
