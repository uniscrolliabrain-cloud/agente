# Handoff · 10 de noviembre de 2026

> v1 · 2026-11-10 · Estado: handoff
>
> Base de código: `main`, commit `804d8f7` (`feat(vistas): unificar las vistas de workspace en ViewEnvelope`).
>
> Este paquete documenta el trabajo realizado en la sesión sobre las vistas servidas de `agente`, el estado real del código y lo que queda pendiente. Está escrito para que otra IA pueda continuar sin reconstruir el contexto desde el chat.

## Qué contiene

| Documento | Qué explica |
|---|---|
| [01-contexto-diagnostico-y-contrato.md](./01-contexto-diagnostico-y-contrato.md) | Punto de partida, contratos incompatibles, diagnóstico y decisiones de diseño. |
| [02-backend-view-envelope-y-rutas.md](./02-backend-view-envelope-y-rutas.md) | `ViewEnvelope`, adapter, rutas HTTP, dispatcher, permisos y errores. |
| [03-frontend-chat-resolucion-y-panel.md](./03-frontend-chat-resolucion-y-panel.md) | Resolución desde el chat, concurrencia, panel contextual y estados de UI. |
| [04-workspace-shell-y-templates.md](./04-workspace-shell-y-templates.md) | Catálogo de workspaces, ejecución de vistas y los siete templates. |
| [05-limpieza-pruebas-preview-y-entrega.md](./05-limpieza-pruebas-preview-y-entrega.md) | Eliminación del legacy, tests, typecheck, preview y estado de Git. |
| [06-futuro-y-plan-de-handoff.md](./06-futuro-y-plan-de-handoff.md) | Brechas, prioridades y plan por fases para el siguiente agente. |

## Resumen ejecutivo

El sistema pasó de tener varios contratos de vista incompatibles y un evento `view.resolved` que nadie consumía, a un flujo HTTP único que devuelve un `ViewEnvelope`. El envelope conserva el `RuntimeViewSpec` como payload de presentación y añade identidad, procedencia, frescura, permisos y fuente. Las vistas de workspace se ejecutan con `WorkspaceDispatcher`; los módulos que no declaraban vistas reciben una tabla por defecto que ejecuta su primera query real.

En frontend, el chat resuelve como máximo una vista por mensaje, cancela peticiones anteriores y conserva la vista actual si el intent no produce nada. El panel contextual renderiza un envelope, no un spec suelto. `WorkspaceShell` permite elegir workspace, ver sus vistas declaradas y ejecutarlas. Los siete `kind` tienen componente: dashboard, queue, inbox, board, table, detail y form.

La suite completa quedó en **718 tests, 701 pass, 0 fail, 12 skipped y 5 todo**. El typecheck raíz y el de `apps/web` pasan. El commit de código está publicado en `main` como `804d8f7`. El contrato con `agntia-gestoria` vive en `docs/07-integraciones/GESTORIA.md` y se publicó antes, en `155f799`; el clon local de gestoría no se tocó y no forma parte de este paquete.

## Límites que debe conocer quien continúe

- `form` es un borrador de solo lectura; no ejecuta comandos.
- Las acciones de `queue` e `inbox` solo aparecen si el host pasa `onAction`; el panel contextual actual no lo pasa.
- `timeline` y `graph` de `WorkspaceViewDeclaration` se adaptan a tabla.
- El resolver legacy por regex sigue existiendo como fallback sin `workspaceId`; no debe confundirse con el camino principal.
- `permissions.canView` se rellena, pero el backend todavía no aplica un `PolicyEngine` real a estas rutas. El contexto se construye con `permissions: []`.
- La previsualización se verificó con HTTP y el hostname exacto de Vite; no se hizo una inspección visual completa ni pruebas E2E.
- `agente-integration.patch` y `agntia-gestoria/` quedaron fuera del commit. No se deben mezclar con el trabajo de `agente`.

## Orden de lectura recomendado

Para una IA que vaya a tocar backend, empezar por 01 y 02. Para una que vaya a tocar UI, empezar por 03 y 04. Antes de cualquier cambio, leer 05 para reproducir la verificación y 06 para no repetir decisiones ya cerradas. La regla principal es simple: **no volver a introducir `view.resolved` como bus de vistas y no exponer filas crudas de proveedores externos**.
