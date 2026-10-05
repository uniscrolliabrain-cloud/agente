# Pendientes — fixes que no entraron

> Doc vivo. Se actualiza cada vez que un mini script da MISS y no se resuelve en el momento.

## Bloque 05

| Marca | Archivo | Motivo | Estado |
|-------|---------|--------|--------|
| WORKER_STATUS_FIELD_V1 | apps/server/src/engine/worker.ts | Anchor con comentario intermedio no previsto | pendiente |
| WORKER_PLAN_EVENT_V1 | apps/server/src/engine/worker.ts | Anchor del compareAndSwap no coincide | pendiente |
| RUN_EVENT_CORRELATION_V1 | apps/server/src/engine/worker.ts | Anchor del put run-events no coincide | pendiente |
| WORKER_STATUS_THROTTLE_V1 | apps/server/src/engine/worker.ts | Anchor del if(this.running) no coincide | pendiente |
| CURSOR_VALIDATE_V1 | apps/server/src/db.ts | Anchor no coincide exacto | pendiente |
| IDEMPOTENCY_RESERVE_V1 | apps/server/src/engine/transaction.ts | Anchor no coincide exacto | pendiente |

## Bloque 04

| Marca | Archivo | Motivo | Estado |
|-------|---------|--------|--------|
| (fase 2) | varios | Requiere más archivos | pendiente |

## Bloque 03

| Marca | Archivo | Motivo | Estado |
|-------|---------|--------|--------|
| (ninguno) | — | — | — |

## Reglas

- Cada MISS se apunta aquí con archivo y motivo.
- Al cierre de cada bloque se revisan los pendientes y se deciden:
  - Aplicar con nuevo anchor.
  - Descartar (falso positivo).
  - Aparcar para otro bloque.
- El doc no se borra. Se actualiza.