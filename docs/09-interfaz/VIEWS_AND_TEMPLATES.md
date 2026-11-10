# Vistas y templates de UI servida

> v2 · 2026-11-10 · Estado: implementado

## Contrato

Una vista servida viaja como `ViewEnvelope` (`packages/domain/src/view-envelope.ts`):

- `spec`: `RuntimeViewSpec`, el payload de presentación.
- `provenance`: de dónde sale cada dato.
- `freshness`: cuándo se generó y si está obsoleta.
- `permissions`: si se puede ver y qué acciones se pueden ejecutar.
- `source`: workspace, proveedor y entidad.

`RuntimeViewSpec` no es el contrato completo: es solo la forma que consume el renderer. El envelope evita que la UI tenga que adivinar procedencia o permisos.

## Pipeline

```
usuario escribe
  → ChatPanel (una resolución por messageId)
  → POST /api/views/resolve
  → workspace dispatcher (query real)
  → workspace-adapter
  → ViewEnvelope
  → ContextualPanel
  → ViewRenderer
```

Sin `workspaceId`, `/api/views/resolve` solo puede usar el resolver legacy y devuelve `view: null` si no hay intención. No hay builders estáticos por defecto.

Las vistas de un workspace se ejecutan por:

```
GET  /api/workspaces/:id
POST /api/workspaces/:id/view { viewId }
```

`WorkspaceShell` carga el catálogo, lista las vistas declaradas y ejecuta la elegida. Los 34 módulos que no declaraban vistas reciben una vista `table` por defecto que ejecuta su primera query; si no hay datos, la tabla aparece vacía, no inventada.

## Siete kinds renderizados

| Kind | Componente |
|---|---|---|
| `dashboard` | `DashboardTemplate` |
| `queue` | `QueueTemplate` |
| `inbox` | `InboxTemplate` |
| `board` | `BoardTemplate` |
| `table` | `TableTemplate` |
| `detail` | `DetailTemplate` |
| `form` | `FormTemplate` |

`timeline` y `graph` de `WorkspaceViewDeclaration` se adaptan hoy a `table`; no se anuncian como kinds runtime hasta tener componente propio.

## Límites actuales

- `form` es un borrador de solo lectura: no ejecuta comandos de escritura.
- Las acciones de `queue`/`inbox` solo se muestran si el host pasa `onAction`; no hay endpoint genérico de acciones.
- La vista de workspace no usa el resolver del chat: tiene su propio `workspaceId`, su query y su envelope.
- No se exponen filas crudas de un proveedor externo: el adapter normaliza y el envelope declara la fuente.

## Archivos clave

- [`packages/domain/src/view-envelope.ts`](../../packages/domain/src/view-envelope.ts)
- [`apps/server/src/engine/views/workspace-adapter.ts`](../../apps/server/src/engine/views/workspace-adapter.ts)
- [`apps/server/src/routes/views.ts`](../../apps/server/src/routes/views.ts)
- [`apps/server/src/routes/workspaces.ts`](../../apps/server/src/routes/workspaces.ts)
- [`apps/web/src/view/ViewRenderer.tsx`](../../apps/web/src/view/ViewRenderer.tsx)
- [`apps/web/src/workspaces/WorkspaceShell.tsx`](../../apps/web/src/workspaces/WorkspaceShell.tsx)
