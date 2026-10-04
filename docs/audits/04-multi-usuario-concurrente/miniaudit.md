# 04 — Multi-usuario concurrente

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/server/src/db.ts, threads-routes.ts, projects-routes.ts

## Ontología del área

Conceptos: `compareAndSwap`, `insertIfAbsent`, `updatedAt`, `conflict`,
sesión, presencia.

## Estado real del código

- `compareAndSwap(owner, kind, id, expected, patch)` protege contra carreras
  a nivel de record. Devuelve `null` si no matchea.
- `insertIfAbsent` cierra carreras de creación.
- `threads-routes.ts` y `projects-routes.ts` exponen PUT que pueden pisarse.
- No hay detección de conflicto en el cliente.

## Evidencia

- Los tests de `actions.test.ts` prueban `concurrent approval consumes the
  proposal only once` — **pasa**.
- Los tests de `actions.test.ts` prueban `concurrent idempotent proposals
  retain a single persisted review` — **pasa**.
- **No hay tests de dos usuarios escribiendo el mismo thread**.

## Huecos concretos

- **No hay locks de edición**. Si dos usuarios abren el mismo thread, ambos
  ven el estado antiguo.
- **No hay avisos de "otro usuario está editando"**.
- **No hay reconciliación de conflictos** en memoria, artifacts, tasks.
- **No hay rate limit por usuario**, solo por IP/email.
- **No hay presence service** para ver quién está conectado.

## Interrelación

- Transversal al estado compartido: `threads-routes.ts`, `projects-routes.ts`,
  `agent/routes.ts`.
- Comparte `db.ts` con `05-motor-tareas-durable` y `07-aislamiento-multi-tenant`.

## Riesgos

- Que un cliente con 5 usuarios vea corrupción de datos sin darse cuenta.
- Que las notificaciones se dupliquen o se pierdan entre usuarios del
  mismo owner.
- Que la presencia en vivo muestre a un usuario lo que escribe otro.

## Tipo de fixes

1. `updatedAt` optimista en todos los PUT.
2. Cliente detecta `409 Conflict` y muestra "recarga".
3. Notificaciones dirigidas por `userId` (ya hay `assignedTo` en
   `AgentNotification` pero la UI no lo filtra).
4. Presence service efímero (SSE con estado compartido).
5. Rate limit por usuario además de por IP/email.
