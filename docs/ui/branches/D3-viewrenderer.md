# D3 - ViewRenderer + 2 templates + panel contextual

> **UI_CAMPAIGN_D3_VIEWRENDERER_V1** · Última actualización: 2026-10-03.
> Estado: HECHO.

## Objetivo

`ViewRenderer` con `assertNever` para garantizar exhaustividad. 2 templates reales (`dashboard`, `queue`). Panel contextual que renderiza el ViewSpec servido por el sistema.

## Ficheros nuevos (3)

- `apps/web/src/templates/queue/QueueTemplate.tsx`.
- `apps/web/src/hooks/useViewResolver.ts`.
- `tests/registry.test.ts`.

## Ficheros modificados (7)

- `apps/web/src/templates/dashboard/DashboardTemplate.tsx` (REWRITE).
- `apps/web/src/view/ViewRenderer.tsx` (REWRITE).
- `apps/web/src/components/ContextualPanel.tsx` (REWRITE).
- `apps/web/src/templates/registry.ts`.
- `apps/web/src/components/ChatPanel.tsx`.
- `apps/web/src/components/AppShell.tsx`.
- `apps/web/src/index.css`.

## Verificación

- `DashboardTemplate.tsx` tiene `D3_DASHBOARD_V2`.
- `QueueTemplate.tsx` tiene `D3_QUEUE_V1`.
- `ViewRenderer.tsx` tiene `D3_VIEWRENDERER_V2`.
- `ContextualPanel.tsx` tiene `D3_CONTEXTUALPANEL_V2`.
- `useViewResolver.ts` existe.
- `index.css` tiene `D3_TEMPLATES_CSS_V1`.

**Fin de D3.**