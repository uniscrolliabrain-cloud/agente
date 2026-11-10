# 02 · Backend: `ViewEnvelope`, adapter y rutas

> v1 · 2026-11-10 · Estado: handoff
>
> Base: commit `804d8f7`. Archivos clave: `packages/domain/src/view-envelope.ts`, `apps/server/src/engine/views/workspace-adapter.ts`, `apps/server/src/routes/views.ts`, `apps/server/src/routes/workspaces.ts`.

## El contrato `ViewEnvelope`

`ViewEnvelope` es el contrato canónico de una vista servida. Se define con Zod en `packages/domain/src/view-envelope.ts` y se exporta como tipo inferido. Sus campos son:

- `id`: identificador de la vista servida, con un máximo de 240 caracteres.
- `tenantId`: tenant resuelto por el servidor, nunca por el cliente.
- `workspaceId`: opcional; identifica el workspace que produjo la vista.
- `spec`: el `RuntimeViewSpec` validado por `runtimeViewSpecSchema`.
- `provenance`: lista de hasta 50 fuentes, cada una con `source`, `ref`, `label` y `asOf`.
- `freshness`: `generatedAt`, `sourceAsOf` opcional y `stale` con valor por defecto `false`.
- `permissions`: `canView` con valor por defecto `true` y `canAct` como lista de acciones, máximo 50.
- `source`: `provider`, `workspaceId`, `entityType` y `entityId`, todos opcionales salvo `provider`.
- `generatedAt`: fecha ISO con offset.

El schema usa `z.iso.datetime({ offset: true })` para las fechas. `parseViewEnvelope(raw)` devuelve el envelope tipado o `null`; no lanza. Esa decisión permite que una respuesta inválida se trate como “no hay vista” en lugar de romper el panel. El envelope no sustituye a `RuntimeViewSpec`: lo envuelve. `RuntimeViewSpec` sigue siendo la unión discriminada de los siete kinds y el renderer sigue validándolo antes de pintar.

La razón de ser del envelope es evitar que la UI adivine. Antes el frontend recibía un spec suelto; no sabía de qué tenant venía, qué fuente lo había producido, si estaba fresco ni qué acciones podía ejecutar. Ahora todo eso viaja en el mismo objeto. Hoy el panel solo muestra `source.provider` y comprueba `permissions.canView`, pero el contrato ya tiene la información para una cabecera de procedencia, un aviso de obsolescencia y un control de acciones.

## El adapter de workspace

`adaptWorkspaceView` recibe `tenantId`, `workspaceId`, `declaration`, `result`, opcionalmente `entityId` y `now`, y devuelve `ViewEnvelope | null`. El resultado de la query es un `QueryResult<unknown>` con `status: "ok" | "empty" | "forbidden"`, `items`, `total` y `nextCursor` opcional. El adapter convierte cada item a un objeto plano con `asRow`; si el item no es un objeto, lo envuelve como `{ value }`. No inventa filas: si `items` está vacío, el spec queda vacío y el template muestra su estado vacío.

La construcción del spec depende del `kind` de la declaración:

- `dashboard`: produce KPIs genéricos con el total de elementos y el nombre de la query. No es un dashboard de negocio real; es un fallback honesto.
- `queue`: mapea hasta 50 filas a items con `id`, `title`, `subtitle`, estado normalizado y `actions: []`. El estado se agrupa en `pending`, `running`, `done` o `error` con heurísticas sobre `status`/`state`.
- `inbox`: mapea hasta 50 filas con prioridad `low`, `medium` o `high` y `actions: []`.
- `board`: construye hasta 10 columnas a partir de los estados únicos y hasta 200 tarjetas; cada tarjeta se asigna a una columna por slug del estado.
- `detail`: toma la primera fila y crea propiedades con `key`, `label`, `value`, `provenance: "auto"` y relaciones vacías.
- `form`: toma la primera fila y crea campos con tipo inferido (`text`, `number`, `date`, `select`, `textarea`, `checkbox`), `required: false`, `provenance: "missing"` y `submitLabel: "Guardar"`.
- `table`, `timeline` y `graph`: todos caen en una tabla. Las columnas se infieren de la unión de claves de las filas, máximo 20; las filas se recortan a 200. `timeline` y `graph` no tienen template runtime propio todavía.

El adapter valida el spec resultante con `parseRuntimeViewSpec`; si no valida, devuelve `null` y la ruta responde 422. El envelope resultante usa `id = workspaceId:declaration.id`, `provenance` con una entrada `source: "workspace"` y `ref: workspaceId/query`, `freshness` con `generatedAt` y `stale: false`, `permissions.canAct` copiando `declaration.actions`, y `source.provider: "workspace"`. No hay `sourceAsOf` real: se usa `generatedAt` como `asOf` de la procedencia. Eso es una simplificación consciente; el documento 06 la marca como deuda.

## `POST /api/views/resolve`

La ruta principal vive en `apps/server/src/routes/views.ts`. Acepta un body con `intent`, `workspaceId`, `viewId`, `entityId`, `messageId` y `threadId`, todos opcionales, pero exige al menos `intent` o `workspaceId`. Si llega `viewId` sin `workspaceId`, responde 422.

Con `workspaceId`, el flujo es:

1. `registry.get(workspaceId)`; si no existe, 404.
2. Si hay `viewId`, se busca exactamente; si no, se busca por `intent` normalizado contra `id`, `title` e `intent` de las declaraciones. Si no hay coincidencia, se usa la primera vista.
3. Se construye un `WorkspaceContext` con `tenantId` tomado de `c.get("ctx")?.tenantId ?? owner`, `actorId: owner`, `actorKind: "user"`, `permissions: []` y `correlationId: messageId ?? randomUUID()`.
4. Se construye un `WorkspaceQueryEnvelope` con la query de la declaración, `version: 1`, `parameters` con `entityId` si existe, y `limit: 50`.
5. `dispatcher.dispatchQuery` ejecuta el handler. Si el resultado es `forbidden`, la ruta responde 403.
6. `adaptWorkspaceView` convierte el resultado. Si devuelve `null`, 422.
7. Se responde `{ view }`.

Sin `workspaceId`, la ruta mantiene el resolver legacy por regex como fallback explícito. Si hay `intent`, llama a `resolveView(owner, intent)`; si devuelve un spec, lo envuelve con `legacyView`, que marca `provider: "legacy"`, `freshness.stale: true` y `permissions.canAct: []`. Si no hay intención o el resolver no encuentra nada, responde `{ view: null }`. No hay builders por defecto. Esta rama existe para no romper el chat antiguo mientras se migra, pero no es el camino recomendado para nuevas integraciones.

`messageId` y `threadId` se aceptan y se usan para correlación (`messageId` como `correlationId`), pero no se persisten ni se usan para cachear. El frontend evita duplicados por mensaje; el backend no tiene una tabla de resoluciones. Esa es otra deuda para el futuro.

## Rutas de workspace

`apps/server/src/routes/workspaces.ts` expone el catálogo y la ejecución:

- `GET /api/workspaces`: lista con `id`, `slug`, `family`, `title` y `reference`.
- `GET /api/workspaces/:id`: detalle con `manifest`, `capabilities`, `views` (ids), `viewDefinitions` (declaraciones completas), `commands` y `queries`.
- `POST /api/workspaces/:id/view`: ejecuta una vista declarada. Acepta `viewId`, `intent` y `entityId`; si no hay `viewId`, busca por intención y cae en la primera. El resto del flujo es el mismo que en `/api/views/resolve`: contexto, envelope de query, dispatcher, 403/422 y `{ view }`.
- `POST /api/workspaces/:id/command`: ya existía; valida un `workspaceCommandEnvelopeSchema` y ejecuta `dispatchCommand`.
- `POST /api/workspaces/:id/query`: ya existía; valida un `workspaceQueryEnvelopeSchema` y ejecuta `dispatchQuery`.
- `GET /api/workspaces/:id/capabilities`, `/views` y `/events`: catálogo de solo lectura.

La duplicación entre `/api/views/resolve` y `/api/workspaces/:id/view` es intencionada pero costosa. La primera es la entrada del chat y acepta `messageId`/`threadId`; la segunda es la entrada del shell de workspace y siempre tiene `:id` en la URL. Ambas comparten adapter, dispatcher y contrato de respuesta, pero no comparten un helper de ejecución. Un siguiente paso razonable es extraer ese helper para que no se separen las reglas de permisos o de error.

## Dispatcher, registry y vistas por defecto

`WorkspaceDispatcher` recibe los `WorkspaceServices` y resuelve comandos y queries por nombre. Si no encuentra un comando, devuelve `{ status: "rejected", reason: "Comando no registrado: ..." }`; si no encuentra una query, devuelve `{ status: "empty", items: [], total: 0 }`. No lanza. Esa decisión hace que un workspace incompleto no tumbe la ruta, pero también puede ocultar un error de configuración; conviene añadir observabilidad antes de producción.

`WorkspaceModuleRegistry.register` aplica `withDefaultViews` a cada módulo. Si el módulo ya declara vistas, no lo toca. Si no, crea una vista `id: "default"`, `intent: manifest.title`, `kind: "table"`, `title: manifest.title`, `query: primeraQuery` y `actions: []`. Si el módulo no tiene queries, usa `${manifest.id}.empty`; el dispatcher devolverá vacío. Los 34 módulos de `ALL_WORKSPACES` quedan con al menos una vista. El test `workspace-default-views.test.ts` recorre todos y exige que la vista tenga query.

## Permisos y límites reales

El punto más delicado es que el envelope declara permisos, pero el backend no los impone todavía. `WorkspaceContext.permissions` se construye vacío en ambas rutas. El adapter pone `canView: true` salvo que el dispatcher haya devuelto `forbidden`; `canAct` se copia de la declaración, no de la identidad del actor. No hay comprobación de que el workspace pertenezca al tenant, ni de que el actor pueda ver la query, ni de que la entidad sea del tenant. El `tenantId` sí se toma del contexto del servidor, no del body, lo cual evita una suplantación trivial, pero no sustituye a autorización.

La deuda inmediata es conectar `WorkspaceContext` con el principal autenticado, aplicar el `PolicyEngine` o el mecanismo equivalente y probar dos tenants. Antes de exponer vistas con datos reales de gestoría, `canView` debe ser una decisión del servidor basada en el actor y la entidad, no un valor por defecto. El contrato ya tiene el hueco; falta el gobierno.

## Errores y decisiones de borde

- Workspace inexistente: 404.
- Vista inexistente: 404 en la ruta de workspace; en `/api/views/resolve` sin `viewId` se cae en la primera vista.
- `viewId` sin `workspaceId`: 422.
- Resultado `forbidden`: 403 con mensaje genérico.
- Spec que no valida: 422 con “La vista no se pudo normalizar”.
- Query no registrada: `empty`, no error.
- Sin `intent` ni `workspaceId`: Zod rechaza el body.

No se devuelven filas crudas de proveedores: el adapter normaliza y el envelope declara `source: "workspace"`. Esa regla es parte del contrato con gestoría y debe mantenerse. Si en el futuro se añade un adapter Odoo, debe vivir en gestoría y entregar datos normalizados, no filas de Odoo. En `agente`, cualquier nuevo proveedor debe entrar por un adapter que produzca un `RuntimeViewSpec` válido y un envelope con procedencia.

## Tests que cubren esta capa

`tests/view-envelope.test.ts` valida un envelope correcto y rechaza un spec inválido. `tests/workspace-view-adapter.test.ts` comprueba que una tabla se construye desde filas reales y que una cola mantiene estados y resultados vacíos. `tests/workspace-default-views.test.ts` recorre los 34 workspaces. `tests/views-route.test.ts` monta Hono, registra HubSpot con un store fake y verifica que `POST /api/views/resolve` devuelve un envelope con tenant y workspace correctos. No hay test de `POST /api/workspaces/:id/view` ni de permisos cruzados; están en la lista de pendientes del documento 06.
