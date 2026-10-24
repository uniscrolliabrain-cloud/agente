# B1 - Shell 3 columnas plegables

> **UI_CAMPAIGN_B1_SHELL_V1** · Última actualización: 2026-10-03.
> Estado: HECHO.

## Objetivo

Sustituir el shell V2 por el shell de 3 columnas plegables. Sidebar izquierda, main, panel derecho. Con `grid-template-columns` para animar sin reflow.

## Ficheros nuevos (1)

- `apps/web/src/components/AppShell.tsx`.

## Ficheros modificados (4)

- `apps/web/src/App.tsx`.
- `apps/web/src/index.css`.
- `apps/web/src/components/SidebarV2.tsx`.
- `apps/web/src/components/TopBarV2.tsx`.

## Decisión clave

D17: panel derecho cerrado por defecto (`usePanel("ui.right", false)`).

## Verificación

- `AppShell.tsx` tiene `B1_APPSHELL_V1`.
- `App.tsx` tiene `B1_APPSHELL_WIRE_V1` y `WIRE_APPSHELL_V1`.
- `index.css` tiene `B1_SHELL_CSS_V1`.
- `SidebarV2.tsx` tiene `B1_SIDEBAR_V1`.
- `TopBarV2.tsx` tiene `B1_TOPBAR_V1`.

**Fin de B1.**