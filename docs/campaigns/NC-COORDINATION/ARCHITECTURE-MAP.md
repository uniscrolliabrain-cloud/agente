# NC-P00a — Mapa de arquitectura de la base compartida

> Entrega de NC-P00a · Base: `main` **4f81f22** · Fecha: 2026-10-30
> Alcance: superficies que el núcleo (NC) y el vertical (VS) comparten, tal como están en ese SHA.
> Autor: jefe NC. Estado: propuesta para revisión de VS. No acredita fixes ni pruebas ejecutadas.

## 0. Método y lectura

- Todo lo que sigue es **lectura estática del árbol en 4f81f22**, con `archivo:línea` como evidencia.
- `[E]` = comprobado leyendo el código. `[H]` = hipótesis de comportamiento en runtime, pendiente de prueba.
- Las líneas citadas son del SHA base; cualquier PR desplaza numeración.
- No se ha ejecutado `pnpm test` ni `pnpm typecheck` todavía: el baseline de pruebas es parte de la aceptación de P00, no de este documento.
- Los comentarios del repo **no** se usan como prueba de comportamiento: hay cabeceras desactualizadas (ver F8 y F10).

## 1. Arranque: quién construye qué y sobre qué Store

`createApp(db, config)` en `apps/server/src/app.ts` es el punto único de montaje. La discrepancia importante es **qué Store recibe cada pieza**.

| Pieza | Construcción | Store inyectado | Espacio de clave | Evidencia |
| --- | --- | --- | --- | --- |
| `TenantService` | `new TenantService(db, config)` | crudo | lee `tenant-membership` / `user-tenants` por owner | `app.ts:96` |
| `TenantScopedStore` (`tdb`) | `new TenantScopedStore(db, scope ?? tenantIdFor)` | crudo + resolver | `` `${tenantId}:${owner}` `` | `app.ts:101-103`, `db-tenant.ts:18` |
| `Files`, `WorkspaceService`, `RagService` | con `tdb` | scoped | compuesta | `app.ts:106-111` |
| `EventBus` | `new EventBus(tdb)` | scoped | compuesta | `app.ts:137` |
| `StoreSink` / `StoreQuery` | por defecto del bus, mismo store | scoped | compuesta | `events/bus.ts:64`, `events/sinks/store.ts:20` |
| `BusinessGraph` | `new BusinessGraph(db, bus)` | **crudo** | plana (`owner`) | `app.ts:168` |
| `MemoryService` (contexto) | `new MemoryService(db, rag)` | **crudo** | plana | `app.ts:183` |
| `ContextEngine` | `new ContextEngine(db, graph, memory, bus)` | **crudo** | plana | `app.ts:184` |
| `Kernel` | `StoreTurnStore(StorePort→db)`, `StoreAuditStore(db)` | **crudo**, `owner = tenantId` | namespace propio | `app.ts:246-253` |
| `AgentService` | `new AgentService(tdb, …, bus, business)` | scoped | compuesta | `app.ts:299` |
| `MemoryService` (servicio) | `new MemoryService(db, this.rag)` dentro de `AgentService` | **scoped** | compuesta | `service.ts:245` |
| `TaskWorker` | `new TaskWorker(db, …)` dentro de `AgentService` | **scoped** | compuesta | `service.ts:323` |

Consecuencia directa (F1, F2): existen **dos `MemoryService` distintos** y **dos grafos/contextos** sobre espacios de clave incompatibles en el mismo proceso.

## 2. Tres espacios de clave conviviendo

1. **Engine scoped** — `TenantScopedStore` compone `` `${tenantId}:${owner}` `` (`db-tenant.ts:18`). Lo usan bus, files, workspace, rag, `AgentService`, `TaskWorker`, actions.
2. **Engine plano** — `Store` crudo con `owner` tal cual. Lo usan `BusinessGraph`, `ContextEngine` y la `MemoryService` que se le inyecta (`app.ts:168-184`).
3. **Kernel** — `StorePort.put(tenantId, kind, id, data)` delega en `db.put(tenantId, kind, data)`: el **owner es el `tenantId`**, sin `owner` de usuario (`app.ts:198-213`). Turnos y thoughts viven ahí; la auditoría del kernel igual (`StoreAuditStore(db)`, `app.ts:253`).

El bus sí recibe por separado `owner` y `options.tenantId` (`events/bus.ts`), pero la clave física la decide el Store inyectado. Los emisores del kernel pasan `thought.owner` como owner y `thought.tenantId` como tenant (`kernel/subscribers/bus-emitter.ts:37-63`), así que la clave final depende del resolver del scope.

## 3. Camino de una petición HTTP

`apps/server/src/app.ts` (middleware de auth):

1. `owner` se deriva del actor verificado: JWT del proveedor → usuario humano; si no, `auth.owner(...)` de sesión (`app.ts:571-583`).
2. `membershipTenant = tenantService.tenantIdFor(owner)` con `catch(() => "default")` (`app.ts:584`, `FALLBACK_TENANT_V1`).
3. `resolvedTenant` = tenant del JWT si existe; si no, el tenant de sesión **solo si sigue habiendo membership**; si no, la membership primaria (`app.ts:585-593`).
4. Guard de query/header `tenantId` distinto del resuelto → 403 `TENANT_MISMATCH` (`app.ts:597-601`).
5. `runInTenantScope({ tenantId: resolvedTenant, actorId: ctxActor.id }, () => next())` (`app.ts:646`). Desde aquí, `tdb` resuelve por `AsyncLocalStorage` (`tenant-scope.ts:21`, `app.ts:103`).

Punto débil [E]: fuera de una petición HTTP **no hay scope**, así que `tdb` cae a `tenantServiceEarly.tenantIdFor(owner)` → membership primaria o `"default"` cacheado hasta 5 min (`tenant.ts:92`, `TENANT_CACHE_TTL_MS`).

## 4. Camino de una tarea durable

1. `AgentService.createTask` (`service.ts:1223`) valida, calcula `tenantIdForGuard = currentTenantScope()?.tenantId ?? tenantIdFor(owner) ?? owner` (`service.ts:1236`), y persiste `task.tenantId = tenantIdForGuard` (`service.ts:1274`, obligatorio desde `TASK_TENANT_REQUIRED_V1`).
2. Inserta con `insertIfAbsent` en `tdb` y solo el ganador emite `task.created` (`service.ts:1295`).
3. `TaskWorker.tick` (`worker.ts:161`) hace `db.scanByStatus<AgentTask>("tasks", [...])` (`worker.ts:181`) **sin scope activo**.
4. `TaskWorker.run(owner, task)` (`worker.ts:242`) reclama con CAS, ejecuta el handler y escribe `run-events`, `runs` y eventos con `this.db`.
5. El actor se reconstruye como `task.assignedTo ?? task.state.roleId ?? owner`, con `compat: "real" | "legacy"` (`worker.ts:370-375`).

Puntos débiles [E]:

- El worker **nunca** envuelve la ejecución en `runInTenantScope` (no hay ninguna llamada fuera de `app.ts:646` y `whatsapp-routes.ts:107-111`).
- `task.tenantId` se persiste y se usa en `dead-letter.ts:45` y `sop-executor.ts:537`, pero **no** para el scope del Store.
- El propio comentario del worker documenta la deuda: la optimización por prefijo de tenant «requiere conocer el tenant activo, que el worker no tiene» (`worker.ts:177-181`).
- No hay campo de actor solicitante en `AgentTask`; `assignedBy` es del delegante, no del usuario que pidió la acción (`packages/domain/src/agent.ts:68-72`).

Esto es exactamente VS-01 («ningún worker reconstruye el tenant únicamente desde la membership primaria», `docs/operacion/CAMPANA-VERTICAL-AGNTIA.md:70`).

## 5. Camino de memoria y contexto

`MemoryService` (`engine/memory.ts`, `recall` en `:90`) = reformulación de query + `RagService.search` + scoring TF de `memories` + fallback a las 3 más recientes. `ContextEngine.assemble` (`context/engine.ts:59`) llama `memory.recall` en `:94` y emite `context.assembled` en `:142`.

Llamantes reales:

| Llamante | Línea | Store efectivo de la memoria |
| --- | --- | --- |
| `engine/context/engine.ts` | `:94` | **plano** (`app.ts:183`) |
| `engine/conversation.ts` | `:590` | scoped (`service.ts:245`) |
| `engine/execution/tool-executors.ts` | `:69` | scoped |
| `engine/form-builder.ts` | `:60` | scoped |
| `engine/sop-executor.ts` | `:654` | scoped |

`ContextEngine.assemble` se invoca desde `conversation.ts:672`, `model.ts:433`, `orchestrator/orchestrator.ts:69` y `service.ts:274`.

Consecuencia [E]: lo que `service.memory.remember(...)` escribe bajo `${tenantId}:${owner}` **no** lo ve el `ContextEngine` que lee owner plano, y viceversa. Los consumidores del contexto reciben un recall de un namespace distinto del que escribe la promoción.

## 6. Camino kernel → bus

- `SlowAuthor` escribe `reasoning`/`delegation` con `AttentionVector` real (`kernel/authors/slow-author.ts:58`, `:118`).
- Quien lo usa hoy: `sop-executor.ts:119`. **`model.ts` no lo llama** (cierra turno y promociona en `model.ts:617`). La cabecera que dice «Quien lo llama: model.ts» es histórica (F8).
- `KernelBusEmitter.attach()` (`kernel/subscribers/bus-emitter.ts:26`) emite `kernel.turn.opened` y `kernel.thought.*` con `void … .catch(() => {})`.
- `Promoter` escribe memoria con `void this.deps.memory…` (`kernel/graph/promote.ts:247-253`) y hay **dos caminos de promoción**: `conversation.ts:938` (con `memory` + `graph`) y `service.ts:2382` (`promoteAllForSupervisor` + `persistPromotionDestinations`). `model.ts:617` promueve sin memoria ni grafo.

## 7. Fronteras de confirmación del Event Bus

| Aspecto | Realidad en 4f81f22 | Evidencia |
| --- | --- | --- |
| Escritura | `await this.sink.write(event)` con `insertIfAbsent` (append-only) | `events/bus.ts:109`, `sinks/store.ts:20` |
| Errores | `catch` → `backgroundFailure` + métrica; el llamante no distingue éxito de fallo | `events/bus.ts:146` |
| Publicación | `globalSubscribers.publish(event)` en proceso, no durable | `events/bus.ts:113` |
| Dedupe | solo con `dedupeKey` explícita, TTL 60 s, LRU 64 | `events/bus.ts:22-25` |
| Atomicidad | ninguna: la escritura del hecho y la del evento son statements separados | `db.ts:131-166` (`put` upsert / `insertIfAbsent` aparte) |
| Replay | `replayEvents` lee por rango/tipo, sin checkpoints de consumidor | `events/replay.ts` |
| Vocabulario | `SYSTEM_EVENT_TYPES` es lista cerrada y `payloadSchemas` es `Record<SystemEventType, ZodTypeAny>` exhaustivo | `events/types.ts:1`, `events/schemas.ts:24` |

Añadir una familia `cognition.*` obliga a tocar `types.ts` y `schemas.ts` a la vez (el registry se auto-registra desde `payloadSchemas`, `events/bus.ts:24-31`).

## 8. Hallazgos que condicionan NC-01/02/03

| ID | Hallazgo | Evidencia | Impacto |
| --- | --- | --- | --- |
| F1 | Dos `MemoryService` con Stores distintos (plano vs compuesto) | `app.ts:183`, `service.ts:245` | El recall del contexto no ve lo que escribe la promoción |
| F2 | `BusinessGraph` y `ContextEngine` sobre Store crudo mientras bus/workspace van scoped | `app.ts:137,168,183,184` | Aislamiento inconsistente dentro del mismo proceso |
| F3 | La tarea durable no propaga tenant/actor al ejecutarse | `worker.ts:181,242,372`; sin `runInTenantScope` | Efectos en la empresa equivocada tras reinicio (VS-01) |
| F4 | `scan`/`scanByStatus` scoped dependen de prefijos vistos en proceso; si el Set está vacío caen al scan global | `db-tenant.ts:122,153`; `allTenantPrefixes()` | Lectura cruzada posible tras reinicio en workers y mantenimiento |
| F5 | Tenant de petición sin claim JWT = membership primaria; fallback `"default"` cacheado 5 min | `app.ts:584-593`, `tenant.ts:92` | Usuario en dos empresas puede escribir en la primaria |
| F6 | `emit` no confirma; publica en memoria; dedupe opcional | `bus.ts:109,113,146` | `await emit` no es garantía de durabilidad para proyección cognitiva |
| F7 | Vocabulario de eventos cerrado y exhaustivo | `types.ts:1`, `schemas.ts:24` | Cada evento cognitivo toca dos archivos compartidos |
| F8 | `SlowAuthor` no está cableado en `model.ts` | `sop-executor.ts:119` vs `model.ts:617` | El razonamiento lento no deja Thought con atención en el camino de tareas |
| F9 | Promoción a memoria con `void … catch(() => {})` y dos caminos de escritura | `promote.ts:247-253`, `conversation.ts:938`, `service.ts:2382` | Duplicados silenciosos y ruta de escritura no única |
| F10 | `thoughtsOf` busca prefijo `tenantId:turnId:` pero los thoughts se guardan con `owner = tenantId` | `store-store.ts:148` vs `app.ts:198-213` | El camino indexado no encuentra filas y siempre cae al batching **[H]** (requiere prueba) |
| F11 | Cromos declarados y sin cablear; flag `CROMOS` por defecto `false` | `kernel/cromos/cromo.ts:1`, `env-resolver.ts:81` | La ontología de 10 dimensiones y 6 polaridades no existe en código |
| F12 | `consolidate` es heurístico (duplicados + negación textual explícita) | `kernel/graph/consolidate.ts:1-17` | La detección de contradicciones semánticas necesita evaluador externo |

## 9. Lo que este mapa NO afirma

- No afirma que los fallos sean explotables en producción: falta reproducirlos con pruebas en runtime (parte de P00b).
- No propone reescribir bus, Store ni kernel: el acuerdo NC-P00 limita P00b a los fixes compartidos concretos.
- No incluye canales, OAuth, billing ni producto: son territorio VS.
- No inventa la ontología cromática: sigue pendiente de fuente concreta (`HANDOFF-JEFE-NUCLEO.md`, §3).

## 10. Documentos relacionados

- [HANDOFF-JEFE-NUCLEO.md](./HANDOFF-JEFE-NUCLEO.md) — protocolo operativo y matriz de propiedad.
- [NC-P00-SHARED-FOUNDATION.md](./NC-P00-SHARED-FOUNDATION.md) — acuerdo del propietario.
- [FILE-OWNERSHIP.md](./FILE-OWNERSHIP.md) — reservas por archivo.
- [BRIDGE-REQUESTS.md](./BRIDGE-REQUESTS.md) — cambios compartidos solicitados.
- [CONTRACT-CANDIDATES.md](./CONTRACT-CANDIDATES.md) — contratos mínimos propuestos.
- [PATCHSETS.md](./PATCHSETS.md) — orden de ejecución y allowlists.
