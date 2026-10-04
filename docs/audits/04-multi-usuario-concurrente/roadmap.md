# Roadmap — 04 multi-usuario concurrente

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Dos usuarios a la vez no deben pisarse.

## 2. Estado verificado
- compareAndSwap a nivel de record.
- insertIfAbsent cierra carreras de creación.
- Fuente: repodump db.ts, threads-routes.ts, projects-routes.ts.

## 3. Huecos contra producción
- Sin locks de edición.
- Sin avisos de "otro usuario está editando".
- Sin reconciliación de conflictos.
- Sin rate limit por usuario.
- Sin presence service.

## 4. Objetivo
Dos usuarios en el mismo thread no corrompen estado. El segundo ve 409.

## 5. Fronteras
- No colaboración en tiempo real.

## 6. Conexiones
- Depende de: 05, 07.
- Dependen de esta: ninguna.

## 7. Principios del PRODUCT.md
Tareas durables, memoria curada.

## 8. Cómo se verifica el cierre
- Test con 2 usuarios concurrentes en el mismo thread.
- Notificaciones dirigidas por userId.
