# Vistas y Templates de UI Servida

> v1 · 2026-10-27 · Estado: current

## 7 templates de UI servida

OpenMuse sirve vistas (`ViewSpec` - template) según la intención del usuario. Los templates incluyen:

1. Dashboard
2. Chat
3. Mail
4. Calendar
5. Files
6. Activity
7. Connections

## Resolución de vistas

`routes/views.ts` resuelve regex a `ViewSpec` válido, pero los builders por defecto producen KPI cero y listas vacías. Las vistas no están aún conectadas a datos reales en todos los casos.

## Archivos relacionados

- [`UI-REDESIGN.md`](./UI-REDESIGN.md) - Rediseño del shell.
- [`UI_ANIMATIONS.md`](./UI_ANIMATIONS.md) - Animaciones.
- [`mockups/`](../mockups/) - Mockups de referencia.
