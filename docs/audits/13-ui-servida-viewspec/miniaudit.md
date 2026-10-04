# 13 — UI servida (ViewSpec)

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump packages/domain/src/views.ts, engine/views/resolver.ts,
> routes/views.ts

## Ontología

RuntimeViewSpec, ViewResolver, intents, readView, computeView. Siete kinds:
dashboard, queue, inbox, board, table, detail, form.

## Estado real

ViewResolver con regex de intenciones. runtimeViewSpecSchema con 7 kinds.
Endpoint POST /api/views/resolve. useViewResolver en el frontend.
conversation.ts llama a resolveView en el turno (fix de este pase).

## Evidencia

Los tests de view-resolver.test.ts pasan. El registry test verifica
dashboard, queue y un kind no soportado. Panel contextual recibe el spec
pero la UI no lo dibuja en la mayoría de los casos. ChatPanel llama a
resolveView cada vez que el usuario escribe, sin cache.

## Huecos

Intenciones ricas (no solo regex). Wiring al chat con cache por thread.
Panel contextual que se rellene. Emitir view.resolved al bus.

## Interrelación

Promesa visual del PRODUCT.md. Depende de 09 (kernel), 14 (templates).

## Riesgos

Resolver devuelve spec inválido. Panel se abre sin que el usuario lo pida.
LLM en el resolver genera specs inesperados.

## Tipo de fixes

Registro de intenciones con regex + palabras clave + entidades. Cache por
thread. Test de 20 intenciones. Emitir view.resolved al bus.
