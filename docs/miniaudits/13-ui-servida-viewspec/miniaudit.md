# 13 — UI servida (ViewSpec)

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump packages/domain/src/views.ts, engine/views/resolver.ts, routes/views.ts, useViewResolver.ts, código real

## Ontología

RuntimeViewSpec, ViewResolver, intents, readView, computeView. Siete kinds: dashboard, queue, inbox, board, table, detail, form.

## Estado real

ViewResolver con regex de intenciones. runtimeViewSpecSchema con 7 kinds. Endpoint POST /api/views/resolve. useViewResolver en frontend. conversation.ts llama a resolveView en el turno (fix de este pase).

## Evidencia

Los tests de view-resolver.test.ts pasan. Panel contextual recibe el spec pero la UI no lo dibuja en la mayoría de los casos. ChatPanel llama a resolveView cada vez que el usuario escribe, sin cache.

## Huecos declarados

- Intenciones ricas.
- Wiring al chat con cache por thread.
- Panel contextual que se rellene.
- view.resolved al bus.

## Huecos profundos (auditoría extendida)

1. **`registerIntent` no se llama en ningún sitio**: el resolver tiene intenciones registradas solo en tests. En runtime, `resolveView` siempre devuelve `null`.
2. **Sin cache por thread**: cada mensaje del usuario dispara una llamada a `/api/views/resolve`. Con 10 mensajes/min, 10 requests.
3. **`resolveView` con regex case-insensitive sin normalizar acentos**: "factura" matchea, "facturá" no.
4. **Sin cache de specs resueltos**: la misma intención se re-resuelve. No hay LRU.
5. **Sin "el usuario puede elegir vista"**: solo hay resolución automática. El usuario no puede forzar un tipo de vista.
6. **Sin "vista anterior"**: cuando el panel se vacía, no hay historial.
7. **`RuntimeViewSpec` sin `provenance`**: no hay forma de saber de qué intención vino el spec.
8. **Sin validación estricta al servir**: `parseRuntimeViewSpec` valida pero no rechaza specs que pasan el schema pero son incoherentes.
9. **`view.resolved` se emite en conversation.ts (fix 09-15) pero nadie lo consume**: el frontend no lo recibe por SSE.
10. **Sin "preview" de la vista antes de abrirla**: el panel se abre directo, sin confirmación.
11. **Sin "vista por defecto" si no hay intención**: el panel queda vacío con "Escribe en el chat".
12. **Sin "vista persistida por usuario"**: cada sesión empieza de cero.
13. **Sin "vista compartida"**: un usuario no puede pasarle su vista a otro del mismo tenant.
14. **Sin "vista exportable"**: no hay "descargar la tabla como CSV".
15. **`useViewResolver` sin manejo de errores**: si el request falla, no hay retry ni fallback.
16. **Sin "loading state"**: el panel no sabe si está cargando o si no hay spec.
17. **Sin "vista cacheada"**: cada vez que el usuario escribe, se pide de nuevo.
18. **Sin "spec válido mínimo"**: el schema acepta specs vacíos. Un `dashboard` sin KPIs es válido pero inútil.
19. **Sin test de las 20 intenciones reales**: solo hay tests de 4 intenciones mock.
20. **`ViewResolver` con regex en cliente**: el resolver hace regex sobre el texto del usuario. Un usuario con input raro puede colgar el resolver (ReDoS).

## Interrelación

Promesa visual del PRODUCT. Depende de 09, 14.

## Riesgos

Resolver devuelve spec inválido. Panel se abre sin que el usuario lo pida. LLM en el resolver genera specs inesperados.

## Tipo de fixes

Registro de intenciones con regex + palabras clave + entidades. Cache por thread. Test de 20 intenciones. Emitir view.resolved al bus. Loading state. Persistencia por usuario. Exportar a CSV.
