# E03 · Camino canónico de una vista

**Etapa**: E03 de `ACME_CAMPAIGN_V1`
**Rama**: `feat/acme-tenant`
**Estado**: completada (auditoría, sin cambios de código)
**Método**: lectura de `routes/workspaces.ts`, `engine/views/workspace-adapter.ts`, `engine/workspaces/{registry,dispatcher,default-views}.ts`, `packages/domain/src/{views,view-envelope}.ts`, `packages/workspaces/src/contracts/workspace-module.ts`, `apps/web/src/{api/workspaces.ts,hooks/useWorkspaceView.ts,workspaces/WorkspaceShell.tsx,view/ViewRenderer.tsx}` y los 34 `contract.ts` + `application/views.ts` del paquete.

---

## 1. Diagrama real (validado línea a línea)

```
ALL_WORKSPACES (packages/workspaces/src/index.ts:39)
  └─ registry.registerAll → withDefaultViews            [default-views.ts:17]
       └─ GET /api/workspaces                → lista (id, slug, family, title, reference)
       └─ GET /api/workspaces/:id            → { manifest, viewDefinitions, commands, queries }
       └─ POST /api/workspaces/:id/view      [routes/workspaces.ts:58]
            ├─ owner    = c.get("owner")
            ├─ tenantId = c.get("tenantId") ?? owner          ← H11
            ├─ body     = Zod{ viewId?, intent?, entityId? }
            ├─ declaration = m.views.find(id === viewId) ?? findView(views, intent) ?? views[0]
            ├─ context  = WorkspaceContext{ workspaceId, tenantId, owner, actorId: owner,
                                            actorKind:"user", permissions:[], correlationId }
            ├─ envelope = WorkspaceQueryEnvelope{ query: declaration.query, parameters:{entityId?}, limit:50 }
            ├─ dispatcher.dispatchQuery(m, context, envelope)  [dispatcher.ts:29]
            │    └─ handler.handle(services, context, envelope)   services = { db: tdb, bus }
            │         └─ tdb.list(ctx.owner, kind)  → clave `${tenant}:${owner}`
            ├─ 403 si result.status === "forbidden"
            ├─ adaptWorkspaceView({ tenantId, workspaceId, declaration, result, entityId })
            │    └─ buildSpec por declaration.kind → parseRuntimeViewSpec (Zod)
            │         └─ si null → 422 "La vista no se pudo normalizar"
            └─ 200 { view: ViewEnvelope }
                 └─ apiFetch → getWorkspaceView()            [api/workspaces.ts:52]
                      └─ useWorkspaceView()                  [hooks/useWorkspaceView.ts]
                           └─ WorkspaceShell → <ViewRenderer spec={view.spec} />
                                └─ parseRuntimeViewSpec otra vez → template por kind
```

Puntos de contrato que el diagrama de §3 asumía y aquí quedan fijados:

- El `ViewEnvelope` **solo** lo construye `adaptWorkspaceView`; la ruta no añade ni quita campos.
- La ruta **no** inventa filas: si la query devuelve `items: []`, el adapter produce spec vacío (los tests `workspace-view-adapter.test.ts` lo cubren).
- `tenantId` del envelope es el del `WorkspaceContext`, es decir el del principal resuelto por el middleware (E02), no el que mande el cliente.
- El renderer **vuelve a validar** el spec con `parseRuntimeViewSpec`; si el adapter devolviera algo fuera de contrato, la UI muestra "No he podido mostrar esta vista." en vez de romper.

## 2. Campos obligatorios del `ViewEnvelope`

De `packages/domain/src/view-envelope.ts` (`viewEnvelopeSchema`):

| Campo | Tipo / límite | Lo pone |
|---|---|---|
| `id` | string 1–240 | `${workspaceId}:${declaration.id}` |
| `tenantId` | string 1–100, **obligatorio** | `WorkspaceContext.tenantId` |
| `workspaceId` | string ≤100, opcional | `m.manifest.id` |
| `spec` | `runtimeViewSpecSchema` (unión por `kind`) | `buildSpec` |
| `provenance` | array ≤50 de `{source, ref?, label?, asOf?}` | `[{source:"workspace", ref:"<ws>/<query>", label:<viewId>, asOf}]` |
| `freshness` | `{ generatedAt: ISO con offset (obligatorio), sourceAsOf?, stale: bool }` | `generatedAt = now.toISOString()`, `stale:false` |
| `permissions` | `{ canView: bool, canAct: string[] ≤50 }` | `canView:true`, `canAct: declaration.actions` |
| `source` | `{ provider (obligatorio), workspaceId?, entityType?, entityId? }` | `provider:"workspace"`, `workspaceId`, `entityId?` |
| `generatedAt` | ISO con offset | mismo instante que `freshness.generatedAt` |

`freshness.generatedAt` y `generatedAt` usan `z.iso.datetime({ offset: true })`; `toISOString()` produce `Z`, que cumple.

## 3. Qué `kind` produce qué spec y qué template la pinta

| `declaration.kind` | Spec que construye `buildSpec` | Renderer |
|---|---|---|
| `dashboard` | `{kind, title, kpis:[{label:"Elementos", value: result.total ?? rows.length},{label:"Workspace", value: declaration.query}]}` — **máx. 6 KPIs** | `DashboardTemplate` |
| `queue` | `items` ≤50: `{id, title, subtitle?, status: pending\|running\|done\|error, actions:[]}`; `status` se deduce de `row.status ?? row.state` (`queueStatus`) | `QueueTemplate` |
| `inbox` | `items` ≤50: `{id, title, subtitle?, priority: low\|medium\|high, actions:[]}`; prioridad de `row.priority ?? row.urgency` | `InboxTemplate` |
| `board` | `columns` ≤10 (una por `row.status ?? row.state` distinto, `id = slug(status)`), `cards` ≤200 con `columnId` | `BoardTemplate` |
| `table` | `columns` ≤20 (unión de claves, `type` inferido: chip/number/date/text), `rows` ≤200 | `TableTemplate` |
| `detail` | `properties` ≤50 de `rows[0]` (`{key,label,value: primitive,provenance:"auto"}`), `relations: []` | `DetailTemplate` |
| `form` | `fields` ≤50 de `rows[0]` (`type` inferido; `required:false`; `provenance:"missing"`), `submitLabel:"Guardar"` | `FormTemplate` |
| `timeline` / `graph` / desconocido | cae al **default** del `switch` → `table` | `TableTemplate` |

Inferencias del adapter que condicionan los datos de ACME:
- `columnType`: clave `status|state|stage|priority` → `chip`; algún número → `number`; string con prefijo `YYYY-MM-DD` → `date`; resto `text`.
- `queueStatus`: `done|complete|closed|success|sent|paid` → `done`; `error|fail|reject|blocked` → `error`; `run|active|working|progress|open` → `running`; resto `pending`.
- `board` genera columnas a partir de los valores de estado presentes; si no hay filas, no hay columnas (`columns: []`) y el board sale vacío — coherente con R8, pero poco útil: por eso ACME necesita estados estables en los datos, no columnas inventadas.

## 4. Hallazgos de esta etapa

| # | Hallazgo | Consecuencia para ACME | Etapa |
|---|---|---|---|
| H18 | **Los 34 módulos declaran `VIEWS = []`** (`grep` en `packages/workspaces/*/src/application/views.ts`), así que `withDefaultViews` les da una única vista `table:"default"` sobre su primera query. Hoy **solo `kind:"table"` llega al renderer** en el camino real | Para tener dashboard/board/queue en ACME hay que **declarar vistas en el módulo ACME**; no basta con sembrar datos. Los 7 renderers existen y están probados por el adapter, pero nadie los usa desde el registry | E15 |
| H19 | El tenant del almacenamiento **no** sale de `ctx.tenantId`: `tdb` resuelve `currentTenantScope()?.tenantId ?? tenantService.tenantIdFor(owner)` (`app.ts:105-108`). Los handlers pasan solo `ctx.owner` | En una petición HTTP manda el scope del middleware; **en el seed no hay scope**, manda la membership del owner. El seed debe correr dentro de `runInTenantScope` o con la membership ya creada | E06, E07 |
| H20 | `findView` elige por coincidencia de texto normalizado sobre `id+title+intent` y cae a `views[0]` | El cliente web siempre manda `viewId` explícito (`getWorkspaceView`), así que el camino de ACME no depende de la heurística. No se toca | — |
| H21 | `WorkspaceShell` no comprueba que `view.tenantId` coincida con el tenant de la sesión | Un envelope de otro tenant se pintaría. Añadir aserción cliente en E18 | E18 |
| H22 | `detail` y `form` usan solo `rows[0]`; sin filas producen `properties: []` / `fields: []` y un form sin campos | Las vistas de detalle de ACME deben pedir su `entityId` (ya viaja en `parameters.entityId` y en `source.entityId`) | E15 |
| H23 | `dashboard` solo tiene 2 KPIs genéricos (`Elementos`, `Workspace`); el schema admite 6 pero el adapter no los calcula | Para KPIs reales de ACME hace falta un spec construido por un adapter específico del módulo, o ampliar `buildSpec`. Se decide en E15 **sin** tocar el schema | E15 |
| H24 | `permissions.canAct` viene de `declaration.actions`, y la ruta pasa `permissions: []` en el `WorkspaceContext` | Los botones de acción se renderizan aunque el actor no pueda ejecutar; hoy `actions: []` en todas las vistas | E16 |

## 5. Contrato que debe cumplir el workspace ACME (entrada de E15)

1. `manifest.id` propio (p. ej. `acme-obras`), `family` existente, `status:"implemented"`.
2. `views` **declaradas** (no vacías) con `kind` explícito, `query` que exista en `queries` y `actions: []` mientras no haya comandos.
3. Cada `query` debe leer con `services.db.list(ctx.owner, "<kind>", { limit: env.limit })` — el prefijo de tenant lo pone `tdb`.
4. Los items que devuelva la query deben traer `id`, `title` (o `name`/`subject`) y `status` para queue/board, `priority` para inbox.
5. Añadir el módulo a `ALL_WORKSPACES` es **aditivo** (un import + un elemento); no se modifica ningún módulo existente.
6. Nada de esto toca `views.ts` ni `view-envelope.ts`: los specs deben encajar en los límites actuales.

## 6. Aceptación de E03

- [x] Diagrama de §3 validado contra código real, con fichero y línea.
- [x] Campos obligatorios del envelope listados con sus límites.
- [x] Tabla `kind` → spec → template completa, incluido el default `table`.
- [x] Se sabe que hoy solo `table` se usa desde el registry (H18), y qué hay que declarar en ACME.
- [x] Sin cambios de código; baseline de E01 sigue siendo válido.
