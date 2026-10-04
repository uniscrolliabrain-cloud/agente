# D2 - ViewResolver + endpoint

> **UI_CAMPAIGN_D2_VIEWRESOLVER_V1** · Última actualización: 2026-10-03.
> Estado: HECHO.

## Objetivo

Resolver por intenciones cerradas. Sin LLM libre al principio. Cada `registerIntent(re, build)` recibe un texto y devuelve un spec validado.

## Ficheros nuevos (1)

- `tests/view-resolver.test.ts`.

## Ficheros modificados (6)

- `apps/server/src/engine/events/types.ts` (`view.resolved`).
- `apps/server/src/engine/events/schemas.ts` (schema `view.resolved`).
- `apps/server/src/engine/views/resolver.ts` (REWRITE).
- `apps/server/src/routes/views.ts`.
- `apps/server/src/engine/conversation.ts`.
- `apps/server/src/engine/service.ts` (opcional).

## Verificación

- `types.ts` tiene `D2_VIEW_RESOLVED_V1`.
- `schemas.ts` tiene `D2_VIEW_RESOLVED_V1`.
- `resolver.ts` tiene `D2_VIEWRESOLVER_V2`.
- `routes/views.ts` tiene `D2_VIEWS_ENDPOINT_V2`.
- `conversation.ts` tiene `D2_RESOLVEVIEW_WIRE_V1`.
- `tests/view-resolver.test.ts` existe.

**Fin de D2.**