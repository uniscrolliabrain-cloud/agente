# E15 · Query handlers tenant-scoped

**Etapa**: E15 de `ACME_CAMPAIGN_V1`
**Rama**: `feat/acme-tenant`
**Estado**: completada
**Verificación**: `tsc --noEmit` 0 · `tests/acme-queries.test.ts` 28 pass / 0 fail · `tests/acme-workspaces.test.ts` 12 pass · `tenant-acme-isolation` 5 pass / 0 fail / 1 todo (5b, E17) · verificación contra `artifacts/demo/acme` en verde.

---

## 1. Decisión H25: lectura de equipo sin tocar el contrato

`WorkspaceStoreLike` solo declara `list(owner, kind)`, que devuelve lo que **ese** owner escribió. Las 10 tareas de ACME no son de un solo usuario: son de Carlos, Marta, Javier y Sofía. Si las vistas leyeran por owner, un compañero vería su workspace vacío o, peor, uno distinto al del resto.

Decisión: **leer por tenant, no por owner**, sin modificar el contrato.

- `packages/workspaces/src/runtime/tenant-rows.ts` detecta de forma **estructural** si el store expone `scanByPrefix(kind, tenantId, limit)` — el mismo patrón que ya usan `apps/server/src/engine/events/bus.ts` y `engine/leads.ts` — y lo usa con el `tenantId` del **contexto**.
- Si el store no lo expone (dobles de test, implementaciones antiguas) cae a `list(owner, kind)`, que sigue limitado por la clave `${tenantId}:${owner}`. Nunca hay lectura sin filtro de tenant.
- `tenantId` vacío o con `:` no se consulta: se devuelve vacío antes de tocar el store. El delimitador es el que separa tenant y owner en la clave física; el store también lo rechaza.
- No se añade ningún método a `workspace-module.ts`, ni un flag, ni una rama `if (tenant === "acme")`.

`apps/server/src/app.ts` cablea `new WorkspaceDispatcher({ db: tdb })`, y `tdb` es el `TenantScopedStore`, que sí tiene `scanByPrefix`. En runtime la lectura es tenant-wide; en tests con dobles, la de siempre.

## 2. Las 21 queries

Cada handler devuelve filas **tal como están en el store** con `id`/`title`/`status`; el adapter decide columnas, chips y columnas de tablero. Filtros por campos reales (`status`, `type`, `read`), nunca por palabras del título.

| Vista | Query | Fuente | Filtro |
|---|---|---|---|
| obras/resumen | `obras.resumen` | `projects` | — |
| obras/tablero | `obras.tablero` | `projects` | — (columnas = `status`) |
| obras/tareas | `obras.tareas` | `tasks` | — |
| obras/incidencias | `obras.incidencias` | `tasks` | `status === "waiting_input"` |
| obras/partes | `obras.partes` | `agent-artifacts` | — |
| obras/detalle | `obras.detalle` | `projects` | `entityId` o primera fila |
| obras/parte-nuevo | `obras.parte-nuevo` | — | formulario vacío |
| clientes/resumen | `clientes.resumen` | `business-records` | `type ∈ {client, lead, invoice}` |
| clientes/oportunidades | `clientes.oportunidades` | `business-records` | `type === "lead"` |
| clientes/facturas | `clientes.facturas` | `business-records` | `type === "invoice"` y `status !== "cobrada"` |
| clientes/bandeja | `clientes.bandeja` | `whatsapp-inbox` | — |
| clientes/cartera | `clientes.cartera` | `business-records` | `type === "client"` |
| clientes/ficha | `clientes.ficha` | `business-records` | `entityId` o primer cliente |
| clientes/alta | `clientes.alta` | — | formulario vacío |
| suministros/resumen | `suministros.resumen` | `actions` | — |
| suministros/pedidos | `suministros.pedidos` | `actions` | — (columnas = `status`) |
| suministros/aprobaciones | `suministros.aprobaciones` | `actions` | `awaiting_review` o `scheduled` |
| suministros/avisos | `suministros.avisos` | `notifications` | — |
| suministros/documentos | `suministros.documentos` | `files` | — |
| suministros/ficha | `suministros.ficha` | `actions` | `entityId` o primera acción |
| suministros/pedido-nuevo | `suministros.pedido-nuevo` | — | formulario vacío |

## 3. Verificación contra el backend aislado real

`DATA_DIR=artifacts/demo/acme tsx artifacts/acme/verify-e15.ts` (script gitignored), leyendo `<DATA_DIR>/postgres`:

```
acme-obras/resumen       dashboard items= 3 spec=dashboard
acme-obras/tablero       board     items= 3 spec=board
acme-obras/tareas        queue     items=10 spec=queue
acme-obras/incidencias   inbox     items= 1 spec=inbox
acme-obras/partes        table     items= 2 spec=table
acme-obras/detalle       detail    items= 1 spec=detail
acme-obras/parte-nuevo   form      items= 0 spec=form
acme-clientes/resumen       dashboard items=11
acme-clientes/oportunidades board     items= 4
acme-clientes/facturas      queue     items= 2
acme-clientes/bandeja       inbox     items= 2
acme-clientes/cartera       table     items= 3
acme-clientes/ficha         detail    items= 1
acme-clientes/alta          form      items= 0
acme-suministros/resumen       dashboard items= 4
acme-suministros/pedidos       board     items= 4
acme-suministros/aprobaciones  queue     items= 2
acme-suministros/avisos        inbox     items= 4
acme-suministros/documentos    table     items= 4
acme-suministros/ficha         detail    items= 1
acme-suministros/pedido-nuevo  form      items= 0

lectura de equipo: admin=10 marta=10 tareas
OK: 21 vistas con spec válido, lectura de equipo y 0 filas en default
```

Los totales coinciden con lo sembrado en E07–E13 (3 obras, 10 tareas, 2 artefactos, 3 clientes + 4 leads + 4 facturas, 4 acciones, 4 notificaciones, 4 documentos, 2 mensajes). El campo `spec` es el resultado de pasar el envelope por `parseRuntimeViewSpec`: los 21 specs son válidos.

## 4. Guardas cubiertas por test

- Cada vista con `acme` devuelve el número exacto de filas esperado y **ninguna** contiene `FUGA` (el ruido de otros tenants).
- Con un tenant sin datos, las 21 devuelven `items: []` y `status: "empty"`.
- Con `acme-otro` (que sí tiene filas propias), ninguna fila tiene id `acme-*`: el prefijo `acme:` no captura `acme-otro:`.
- `detalle` con `entityId` devuelve esa fila, no la primera.
- Los estados no se inventan: el tablero sale `[active, paused]` y las acciones `[awaiting_review, failed, outcome_unknown, scheduled]`.
- `readTenantRows` cae a `list(owner)` cuando el store no expone `scanByPrefix`, y no consulta con `tenantId` vacío o con `:`.

## 5. Lo que sigue abierto

- **Formularios vacíos** (`parte-nuevo`, `alta`, `pedido-nuevo`): no hay fila que precargar. Necesitan un comando real para tener campos; hoy el spec es válido con `fields: []`.
- **KPIs del dashboard** (H23): el adapter solo produce "Elementos" y "Workspace", aunque el schema admite 6. No se toca el adapter aquí; la decisión de E16/E19 es construir el spec con datos reales (importes sumados de `amountEur` en E19).
- **HTTP**: 5b sigue en `todo` y ahora falla por una razón concreta y visible: `view.tenantId` sale con el uuid del owner porque `routes/workspaces.ts` hace `c.get("tenantId") ?? owner` (H11). Es exactamente lo que cierra E17.
