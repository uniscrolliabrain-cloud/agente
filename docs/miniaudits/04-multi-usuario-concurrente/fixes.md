# Fixes — 04 multi-usuario concurrente

> v1 · 2026-10-05 · Estado: aplicado (fase 1)

## Fixes aplicados (18)

| Marca | Archivo | Estado |
|-------|---------|--------|
| THREAD_CONFLICT_DIFF_V1 | threads-routes.ts | applied |
| PROJECT_CONFLICT_DIFF_V1 | projects-routes.ts | applied |
| SAVE_THREAD_EXPECTED_V1 | api/threads.ts | applied |
| PROJECT_EXPECTED_V1 | api/projects.ts | applied |
| PROJECT_BLOCKS_EXPECTED_V1 | api/projects.ts | applied |
| PRESENCE_MULTI_V1 | presence.ts | applied |
| PRESENCE_GC_V1 | presence.ts | applied |
| PRESENCE_QUERY_V1 | presence.ts | applied |
| THREAD_EDIT_LOCK_V1 | threads-routes.ts | applied |
| THREAD_EDIT_UNLOCK_V1 | threads-routes.ts | applied |
| PRESENCE_LEAVE_THREAD_V1 | threads-routes.ts | applied |
| PRESENCE_LEAVE_PROJECT_V1 | projects-routes.ts | applied |
| NOTIF_STREAM_TYPE_V1 | notifications-stream.ts | applied |
| NOTIF_STREAM_BUFFER_V1 | notifications-stream.ts | applied |
| RATE_LIMIT_PRUNE_V1 | rate-limit.ts | applied |
| NOTIF_READ_CAS_V1 | engine/routes.ts | applied |

## Fase 2 — pendiente

| Marca propuesta | Hueco | Destino |
|-----------------|-------|---------|
| goals CAS | B5 | bloque 12 |
| SSE Last-Event-ID | B12 | bloque 05 |
| quota del tenant | B14 | bloque 05 |
| record.conflict al bus | B15 | bloque 08 |
| actorId en run-events | B19 | bloque 08 |
| backoff SSE | N8 | bloque 05 |
| usePresence hook | N10 | bloque 13 |
| 409 en useThreads | N11 | bloque 15 |
| 409 en useProjects | N12 | bloque 15 |

## Falsos positivos del miniaudit

- B1, B2, B3, B4, B6, B17, B18 → ya estaban cubiertos por THREADS_CAS_V1, PROJECTS_CAS_V1, PROJECTS_BLOCKS_CAS_V1.

## Fuera de alcance

- B8 (ETag): diseño custom con expectedUpdatedAt.
- B11 (Redis): modelo clone-por-cliente.
- B20 (revertir versión): no prioritario.