# 04 · Workspace, shell y siete templates

> v1 · 2026-11-10 · Estado: handoff
>
> Base: commit `804d8f7`. Archivos clave: `apps/web/src/api/workspaces.ts`, `apps/web/src/hooks/useWorkspaceView.ts`, `apps/web/src/workspaces/WorkspaceShell.tsx`, `apps/web/src/view/ViewRenderer.tsx`, `apps/web/src/templates/`.

## De una vista “de chat” a una vista de workspace

El chat y el workspace comparten el mismo contrato de salida (`ViewEnvelope`) pero tienen entradas distintas. El chat parte de un intent y, si hay un workspace activo, lo usa como contexto. El workspace parte de un `workspaceId` explícito, carga el catálogo de vistas declaradas y ejecuta la que el usuario elige. No usa el resolver por regex ni el evento `view.resolved`. Esa separación es importante: una vista de workspace no debería depender de que el usuario escriba la palabra “tabla” o “dashboard”.

`WorkspaceShell` recibe `workspaces`, `workspaceId` y `onSelectWorkspace`. Si no hay workspace seleccionado, muestra una lista de tarjetas con título, familia y referencia; si no hay ninguno, muestra “No hay workspaces disponibles.” Cuando hay workspace, carga el detalle y muestra una cabecera con el título y la familia, un `<select>` para cambiar de workspace y tabs con las vistas declaradas. El cuerpo renderiza loading, error, vista o un estado vacío.

## Cliente HTTP

`apps/web/src/api/workspaces.ts` define los tipos `WorkspaceListEntry`, `WorkspaceViewDefinition` y `WorkspaceDetail`. `WorkspaceDetail` incluye `manifest`, `capabilities`, `views` (ids), `viewDefinitions` (declaraciones completas), `commands` y `queries`. Las funciones son:

- `listWorkspaces()`: `GET /api/workspaces`.
- `getWorkspaceDetail(id)`: `GET /api/workspaces/:id`.
- `getWorkspace(id)`: igual que el detalle, pero devuelve `WorkspaceDetail | null`.
- `getWorkspaceView(id, viewId)`: `POST /api/workspaces/:id/view` con `{ viewId }` y devuelve `ViewEnvelope`.

La duplicación entre `getWorkspaceDetail` y `getWorkspace` es heredada. El shell usa `getWorkspaceDetail`; `getWorkspace` queda como wrapper. Si se limpia la API, conviene dejar una sola función y actualizar consumidores, pero no es urgente.

## `useWorkspaceView`

El hook recibe `workspaceId` y `viewId`. Si no hay workspace, limpia detalle, vista y error. Si hay, marca loading, limpia error y lanza una función asíncrona:

1. `getWorkspaceDetail(workspaceId)`.
2. Si el componente ya se desmontó o cambió de workspace, sale.
3. Guarda el detalle.
4. Calcula `target = viewId ?? nextDetail.viewDefinitions[0]?.id`.
5. Si no hay target, deja la vista en `null`.
6. `getWorkspaceView(workspaceId, target)`.
7. Si no se canceló, guarda la vista.

El cleanup pone `cancelled = true`. No usa `AbortController`; por tanto, la petición HTTP sigue viva aunque el resultado se ignore. Es una mejora pendiente. Tampoco hay una secuencia: si el usuario cambia de vista rápidamente, la primera respuesta podría llegar después de la segunda y pisarla, porque `cancelled` solo protege el cambio de workspace, no el cambio de `viewId` dentro del mismo workspace. El shell evita parte del problema porque cambia `selectedViewId`, pero el hook no tiene una protección de orden.

El hook devuelve `{ detail, view, loading, error }`. No expone un `refresh`; para recargar hay que cambiar de vista o remontar. El shell resetea `selectedViewId` a `null` cuando cambia `workspaceId` mediante un `useEffect`, lo que fuerza la primera vista del nuevo workspace.

## `WorkspaceShell`

El shell tiene dos estados visuales:

**Sin workspace seleccionado.** Muestra el título “Workspaces”, una frase de ayuda y una cuadrícula de botones. Cada botón enseña `title` y `family · reference`. Al hacer clic, `onSelectWorkspace(id)` actualiza el estado en `App`. No hay búsqueda ni filtro; con 34 workspaces la lista puede ser larga. Es una brecha de UX.

**Con workspace seleccionado.** Muestra:

- Cabecera con `detail.manifest.title` o el id como fallback, y `detail.manifest.family`.
- Selector de workspace con todas las opciones.
- Tabs con `detail.viewDefinitions`. La vista activa es `selectedViewId ?? detail.viewDefinitions[0]?.id`.
- Cuerpo con loading, error (`role="alert"`), `ViewRenderer` o “Este workspace no declara vistas todavía.”

El shell no pasa `onAction` a `ViewRenderer`. Por eso las acciones de queue e inbox no se muestran aunque el spec las tenga; el adapter las deja vacías de todos modos. Tampoco hay un botón de refresco, ni paginación, ni filtros. La lista de vistas se renderiza completa; si un workspace declara muchas, no hay virtualización ni overflow horizontal específico.

La selección de workspace vive en `App` (`activeWorkspaceId`), no en la URL. Si el usuario recarga, vuelve a “sin workspace”. Si se abre un workspace desde un enlace, no hay deep link. Eso es deuda de navegación.

## Los siete templates

`ViewRenderer` valida el spec con `parseRuntimeViewSpec`. Si falla, muestra “No he podido mostrar esta vista.” con `role="alert"`. Si valida, despacha por `kind` y usa `assertNever` para que TypeScript obligue a cubrir los siete casos. Los templates son:

### Dashboard

Es el template existente. Recibe `kpis` y los pinta. El adapter genera KPIs genéricos (“Elementos” y “Workspace”); no hay un dashboard de negocio real. Es el punto más evidente de “hay contrato, falta semántica de dominio”.

### Queue

Recibe items con `id`, `title`, `subtitle`, `status` y `actions`. Pinta el estado como chip y muestra acciones solo si `onAction` existe y el item tiene acciones. El adapter deja `actions: []`, así que hoy es una lista de estado, no una cola accionable.

### Inbox

Recibe items con prioridad y acciones. Pinta la prioridad como chip y aplica un estilo de alta prioridad. Igual que queue, las acciones solo aparecen si el host pasa `onAction`; hoy no se pasa. El estado vacío dice “No hay elementos pendientes.”

### Board

Recibe columnas (`id`, `label`, `status`) y tarjetas (`id`, `columnId`, `title`, `subtitle`, `updatedAt`). Agrupa las tarjetas por `columnId`, cuenta las de cada columna y las pinta en una cuadrícula. No hay drag and drop ni movimiento entre columnas. El adapter crea columnas a partir de los estados únicos de las filas.

### Table

Recibe columnas y filas. Si no hay filas, muestra “No hay datos para esta vista.” Si hay, pinta una tabla con alineación por columna y formatea objetos con `JSON.stringify`. El adapter infiere tipos (`text`, `number`, `date`, `chip`, `action`) y limita a 20 columnas y 200 filas. Es el template que usan los 34 módulos por defecto y el fallback de timeline/graph.

### Detail

Recibe propiedades y relaciones. Cada propiedad tiene `key`, `label`, `value` y `provenance`; la UI pinta el valor y un chip con la procedencia. Si hay relaciones, las lista con nombre y tipo. El adapter toma solo la primera fila y marca todas las propiedades con `provenance: "auto"`. No hay edición ni navegación a la entidad relacionada.

### Form

Recibe `entityType`, `fields` y `submitLabel`. Pinta inputs según el tipo (`text`, `number`, `date`, `select`, `textarea`, `checkbox`), con valores por defecto cuando son primitivos. No hay `onSubmit`, no hay validación y no hay escritura. El propio template muestra: “Borrador de solo lectura. Las acciones de escritura se conectan cuando el workspace declare su comando.” Es honesto, pero no es un formulario funcional.

## CSS y estados

Los estilos nuevos están en `apps/web/src/index.css` bajo `VIEW_TEMPLATES_V1`. Cubren el panel contextual (loading, error, fuente), tabla, propiedades, relaciones, board, inbox, acciones, formulario y shell de workspace. La mayoría usa variables de tema (`--surface`, `--border`, `--text-*`, `--accent-*`), así que funcionan en claro y oscuro. Hay estilos específicos para `data-priority="high"` en inbox y para la tab activa del shell.

Los estados vacíos son explícitos en cada template. Esa es una decisión de producto: una vista sin datos debe decirlo, no mostrar una tabla vacía sin contexto ni inventar filas. El adapter respeta la misma regla: si la query devuelve `items: []`, el spec queda vacío.

## Verificación y deuda

La verificación de esta capa fue typecheck de `apps/web` y la suite del backend. No hay tests de componentes, de templates ni de `WorkspaceShell`. No se hizo una inspección visual completa; el preview se comprobó por HTTP y se mostró el panel, pero no se recorrieron los siete templates con datos reales.

Las mejoras más valiosas para el siguiente agente son: agregar `onAction` y un endpoint de comandos; añadir refresh y orden de peticiones en `useWorkspaceView`; convertir timeline/graph en templates reales; añadir filtros, ordenación y paginación a table/queue/inbox; hacer formularios con submit; mostrar procedencia y frescura en la cabecera; y añadir tests de renderizado con specs de ejemplo para los siete kinds.
