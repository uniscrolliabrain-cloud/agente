# Rediseño del Shell

> v1 · 2026-10-27 · Estado: current

## Campaña de UI/UX

Shell, chat, panel contextual, templates. En curso.

## Documentación relacionada

| Fichero | Qué es |
|---------|--------|
| [`UI_ANIMATIONS.md`](./UI_ANIMATIONS.md) | Animaciones (typewriter, cascada, contadores) |
| [`VIEWS_AND_TEMPLATES.md`](./VIEWS_AND_TEMPLATES.md) | 7 templates de UI servida |
| [`mockups/`](../mockups/) | Mockups de referencia |

## Estado actual

- **Panel principal**: chat, tareas y revisión de acciones.
- **Centro de control**: contadores derivados de `useTasks` y notificaciones.
- **Centro de mando 35**: prototipo con arrays fijos de clientes, proyectos, tickets, agentes y métricas.
- **Chat del workspace 02 (WhatsApp)**: mock en memoria, streaming simulado con timers.
- **Shell del catálogo**: `activeWorkspaceId` fijo en `null` sin setter.
- **Pantalla de Agentes**: muestra "En construcción".

## Vistas por intención

`routes/views.ts` resuelve regex a `ViewSpec` válido, pero los builders por defecto producen KPI cero y listas vacías.

## Próximos pasos

- Conectar vistas por intención a datos reales.
- Completar el shell del catálogo con selección de workspace.
- Implementar la pantalla de Agentes.
