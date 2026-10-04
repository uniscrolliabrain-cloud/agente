# 04 — Multi-usuario concurrente

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump db.ts, threads-routes.ts, projects-routes.ts, código real tras bloques 01-09

## Ontología

compareAndSwap, insertIfAbsent, updatedAt, conflict, sesión, presencia, edit lock.

## Estado real

compareAndSwap protege contra carreras a nivel de record. insertIfAbsent cierra carreras de creación. threads-routes.ts y projects-routes.ts exponen PUT que pueden pisarse. No hay detección de conflicto en el cliente.

## Evidencia

Los tests de actions.test.ts prueban "concurrent approval consumes the proposal only once" y "concurrent idempotent proposals retain a single persisted review". Ambos pasan. No hay tests de dos usuarios escribiendo el mismo thread.

## Huecos declarados

- Sin locks de edición.
- Sin avisos de "otro usuario está editando".
- Sin reconciliación de conflictos.
- Sin rate limit por usuario.
- Sin presence service.

## Huecos profundos (auditoría extendida)

1. **`conversations` PUT hace `db.put` sin CAS**: dos usuarios pisándose en el chat. Implementado en fix 04-01 pero solo si el cliente envía `expectedUpdatedAt`.
2. **`projects` PATCH hace `db.put` sin CAS**: fix 04-02 con la misma limitación.
3. **`blocks` PUT hace `db.put` sin CAS**: fix 04-03.
4. **`memories` POST hace `compareAndSwap({})`**: expected vacío = siempre gana. No protege contra carreras.
5. **`goals` PATCH usa `db.put`**: fix 04-02 no lo cubre.
6. **`agent-settings/identity` POST**: fix existe pero sin CAS real.
7. **Sin optimistic locking en `notifications`**: dos usuarios marcando leída la misma notificación es idempotente pero sin verificación.
8. **Sin ETag / If-Match HTTP estándar**: en vez de `expectedUpdatedAt` custom, se podría usar el header estándar.
9. **`presence` en proceso único**: el PresenceService es in-memory. Con 2 réplicas, dos usuarios en réplicas distintas no se ven.
10. **`edit-lock` in-process**: mismo problema. Con 2 réplicas, no hay coordinación.
11. **Sin Redis / store compartido para locks**: en producción multi-réplica, faltaría.
12. **Sin WebSocket para presence en vivo**: usa polling (no implementado aún). Latencia 3-5s.
13. **`rate-limit` por usuario in-process**: mismo problema multi-réplica.
14. **Sin quota compartida entre usuarios del mismo tenant**: 5 usuarios × 100 tareas = 500, sin límite del tenant.
15. **Sin notificación de "otro usuario cambió X"**: solo devuelve 409, no avisa proactivamente.
16. **Sin "ver qué cambió"**: el 409 no incluye diff. El usuario tiene que recargar y comparar visualmente.
17. **`threads-routes PUT` no valida que el usuario sea el dueño del thread**: cualquier usuario autenticado con el id puede escribirlo. Falta check de ownership explícito.
18. **`projects-routes PATCH` mismo problema**: falta ownership check.
19. **Sin auditoría de cambios por usuario**: `activity` no guarda quién hizo qué cambio.
20. **Sin "revertir a versión anterior"**: cuando hay 409, no hay forma de recuperar la versión previa del otro usuario.

## Interrelación

Transversal al estado compartido. Comparte db.ts con 05 y 07.

## Riesgos

Cliente con 5 usuarios ve corrupción de datos. Notificaciones duplicadas o perdidas entre usuarios del mismo owner. Presencia en vivo muestra lo que escribe otro.

## Tipo de fixes

updatedAt optimista en PUT. Cliente detecta 409 Conflict y muestra "recarga". Notificaciones dirigidas por userId. Presence service efímero con store compartido. Rate limit por usuario con store compartido. ETag HTTP. Diff en el 409. Ownership check en threads y projects.
