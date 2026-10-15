# ESTADO-REAL

> Inventario honesto generado el 12/10/2026 sobre `C:\Users\Alfonso\Desktop\git hub repos\agente`
> (la ruta `agente---------------------------` del encargo no existe [verificado con Test-Path]).
> Marcas: [leído] [grep] [inferido] [no verificado]. "Hecho" = se ejecuta + pasa por los sitios correctos + tiene test + es observable + hace lo que debe.

## Resumen

- El flujo de chat base existe y está cableado de punta a punta (web → SSE → copilotkit → ConversationAgent → LLM → kernel), pero sus tests E2E (api, agent-api, conversation-browser, kernel) están en rojo [leído][grep].
- `apps/server/src/engine/service.ts` estaba **corrompido (613 MB, 49 líneas de ~13 MB de mojibake)**; lo he reconstruido a 124 KB / 2.973 líneas y he dejado el original en `%TEMP%\service.ts.corrupt.bak` [verificado].
- `pnpm typecheck` **falla** (33 KB de errores tsc: imports rotos, barrel de workspaces con rutas `./` en vez de `../`, `hints` sin definir) [leído].
- `pnpm test` post-reparación **completa y falla**: 274 ✔ / 57 ✗ / 15 ficheros completos en rojo; 45 líneas `ERR_MODULE_NOT_FOUND` procedentes de `packages/workspaces/src/index.ts` [leído].
- Workspaces: 2 de 34 con UI real; en backend los 34 persisten en el store interno pero **ninguno llama a APIs externas** [grep].

## 1. Flujo de chat

Pasos ordenados del envío del owner a la respuesta visible. "Cableado" = el import y la llamada real existen en el código [leído].

| # | Paso | Fichero | Cableado al siguiente | Test | Observable | Estado |
|---|------|----------|----------------------|------|-----------|--------|
| 1 | Render del panel + RoleSelector | `apps/web/src/components/ChatPanel.tsx` [leído] | Sí: `chat.send` llega por props y `RoleSelector` llama a `chat.setRoleId` [leído] | No hay tests de UI en `tests/` [grep] | No | Existe |
| 2 | Envío: `useChat.send()` | `apps/web/src/hooks/useChat.ts` [leído] | Sí: llama a `streamChat(...)` de `../api/chat` [leído] | `tools-reducer.test.ts` cubre el reducer de tool-calls del stream [grep] | No | Existe |
| 3 | Transporte SSE | `apps/web/src/api/chat.ts` [leído] | Sí: `POST /api/copilotkit/run` con `state.roleId`, parsea `data:` SSE [leído] | Indirecto: `api.test.ts`, `agent-api.test.ts` [grep] — **ambos fallan** [leído] | No | Cableado, no certificable |
| 4 | Ruta del servidor | `apps/server/src/app.ts:789-809` [leído] | Sí: reescribe `/api/copilotkit/run` → `/agent/default/run` y llama `runtime.fetch` [leído]; devuelve 503 si `agentConfigured(config)` es falso [leído] | `api.test.ts`/`agent-api.test.ts` (rojos) [leído] | `backgroundFailure` en errores | Cableado; test rojo |
| 5 | Runtime CopilotKit | `apps/server/src/agent.ts` [leído] | Sí: factory devuelve `ConversationAgent` (sample/llm) o `HttpAgent` (agui) [leído] | `agent-runtime.test.ts` cubre runtimes de agente (distinto alcance) [grep] | No | Existe |
| 6 | Turno + LLM + stream | `apps/server/src/engine/conversation.ts` [leído: líneas 1-330, 480-740, 746-1012] | Sí: `openTurn` (tenant de `TenantService`, `personaId` = `state.roleId`), `runWithModelFallback` con `modelChain`, emite eventos al SSE [leído] | `conversation-browser.test.ts` (rojo), `kernel.test.ts` (rojo) [leído] | `recordUsage`, `bus.emit("view.resolved")`, `backgroundFailure` [leído] | Cableado; tests rojos |
| 7 | Cierre del turno kernel | `conversation.ts` `writeFastResponse` → `closeKernelTurn` → `Promoter.promote` → `Meta.evaluate` [leído] | Sí, en ese orden (corrida arreglada: escribir y después cerrar) [leído en comentario + código] | `kernel-presenter.test.ts` (rojo), `kernel-meta-context.test.ts` (pasa) [leído] | audit `promotion.executed`, persist de hints a `MetaHintsStore` | **Roto en silencio**: `conversation.ts:828` usa `hints` sin definir → `ReferenceError` tragado por `catch {}` → los meta-hints **no se persisten** nunca [leído + tsc TS2304] |

Dónde se rompe (solo estado, sin propuestas):
- **La respuesta al usuario NO se rompe**: la cadena 1→6 está entera y el cierre de turno ocurre [leído].
- Se rompe el paso 7 en la persistencia de hints (`hints` sin ámbito) [leído][tsc].
- No se puede **certificar** el paso 3-6 en ejecución porque sus tests E2E están en rojo (§7) [leído].
- Marcas `_V1`/`_WIRE_V1` inspeccionadas en `conversation.ts`: `CONVERSATION_META_HINTS_PROMPT_V1` → el getter devuelve `""` (declarado, no hecho) [leído línea 42-44]; `CONVERSATION_PRESENTER_SSE_WIRE_V1` → calcula `presenterText` y lo descarta con `void presenterText` (solo declarado) [leído 838-847]; `KERNEL_PROMOTER_IMPORT_V1` → el import SÍ se usa después en `closeKernelTurn` (hecho) [leído 848].

## 2. Agentes y Laia

- **Cuántos se cargan al arrancar (llamada real)**: `apps/server/src/app.ts:88-100` [leído] crea `new PersonaRegistry()` y ejecuta `bootstrapPersonas(registry, "default", "clientes")` + `bootstrapPersonas(registry, "default", "clientes/_example")`. En local carga **12 + 1 = 13 personas** en el tenant `default` (12 carpetas verificadas en `clientes/default/personas/`: direccion, comercial, atencion, administrativo, finanzas, marketing, contenido, operaciones, compras, rrhh, legal, compliance [verificado]; `_index.json` declara count=12 [leído]; `clientes/_example/personas/` solo contiene `laia` [verificado]).
- **Registry duplicado y descartado**: `apps/server/src/index.ts:30-42` [leído] crea OTRO `PersonaRegistry` local, llama a `wirePersonaBootstrap(registry, ["default","_example"], clientsDirFrom(config.dataDir))` y **no lo pasa a nadie** — se descarta al terminar el bloque [inferido del código leído]. Ese es el único camino que avisa con `console.warn` si `loaded === 0` (`personas-bootstrap.ts:23-28` [leído]).
- **Laia**: se carga por defecto en local vía `app.ts` con `bootstrapPersonas(registry, "default", "clientes/_example")` [leído] (comentario `LAIA_BOOTSTRAP_EXAMPLE_V1`). NO vive en `clientes/default/personas/` [verificado].
- **Docker / producción**: `.dockerignore` contiene `clientes` y `tests` [leído]; el stage runtime del Dockerfile solo copia `node_modules`, `dist`, `package.json` y el workspace-template [leído] → **la imagen no contiene `clientes/`** → ambas cargas dan `loaded=0`. `clientsDirFrom("/data")` = `/clientes` (inexistente) [inferido de `personas-bootstrap.ts:32-34` + `ENV DATA_DIR=/data`]. El aviso `loaded===0` solo está en el camino descartado de `index.ts`; el camino real (`app.ts:99`, `if (loaded > 0 || failed > 0)`) **no avisa con 0/0** [leído].
- **UI para hablar con un agente concreto**: `AgentsView.tsx` [leído] es un CRUD de **roles** contra `/api/agent/roles` (crear, activar/desactivar, ficha `onOpenEmployee`); no hay chat embebido por agente. `App.tsx:20,184` monta `AgentsPage` [grep]. Los componentes de `apps/web/src/components/agents/` (AgentCard, AgentSquad, AgentHero, AgentProfile, AgentCommandBar, AgentActivityLog, types) solo se referencian dentro de esa carpeta [grep negativo].
- **¿El chat enruta al agente seleccionado?**: enruta por **ROL**, no por selector de agentes. `RoleSelector.tsx:24` fetcha `/api/agent/roles` [leído]; `useChat` lo manda como `state.roleId` [leído]; `conversation.ts:129-141` lo convierte en `personaId` del KernelContext y `conversation.ts:592-605` lee el record `agent-roles` para el prompt del rol [leído]. Sin rol, prompt genérico "Eres OpenMuse..." [leído 498-521]. El `personaId` no se valida contra el registry antes de usarlo [inferido].
- **Tests**: `agent-persona.test.ts` (schema, Laia mínima), `laia-hierarchy.test.ts` (Laia ve los 12), `kernel-persona-isolation.test.ts` (aislamiento por personaId) [leído de nombres] — los dos últimos **fallan** en la última ejecución (§7) [leído].
- **Estado**: Laia y los 12 existen y se cargan en local (llamada real), pero en Docker no existen [inferido] y no hay test de arranque completo de personas → **no cumple los 5 criterios**.

## 3. Workspaces

### 3a. Frontend `apps/web/src/workspaces/` (34 carpetas) [datos por script, verificado]

| workspace | UI (tsx) | api.ts (L) | hooks | estado |
|---|---|---|---|---|
| 01-gmail | 0 | – | 0 | scaffold (solo .gitkeep + 9 L) |
| **02-whatsapp** | **11** | **217** | **1** | **parcial** (UI+API+hook reales) |
| 03-hubspot | 0 | – | 0 | scaffold |
| 04-holded | 0 | – | 0 | scaffold |
| 05-google-drive | 0 | – | 0 | scaffold |
| 06-google-calendar | 0 | – | 0 | scaffold |
| 07-linear | 0 | – | 0 | scaffold |
| 08-chatgpt | 0 | – | 0 | scaffold |
| 09-airtable | 0 | – | 0 | scaffold |
| 10-perdoo | 0 | – | 0 | scaffold |
| 11-holded-tesoreria | 0 | – | 0 | scaffold |
| 12-odoo-purchase | 0 | – | 0 | scaffold |
| 13-productive | 0 | – | 0 | scaffold |
| **14-zendesk** | **30** | **276** | **1** | **parcial** (UI+API+hook reales) |
| 15-docusign | 0 | – | 0 | scaffold |
| 16-n8n | 0 | – | 0 | scaffold |
| 17-process-street | 0 | – | 0 | scaffold |
| 18-factorial | 0 | – | 0 | scaffold |
| 19-personio | 0 | – | 0 | scaffold |
| 20-ramp | 0 | – | 0 | scaffold |
| 21-stripe | 0 | – | 0 | scaffold |
| 22-canva | 0 | – | 0 | scaffold |
| 23-buffer | 0 | – | 0 | scaffold |
| 24-shopify | 0 | – | 0 | scaffold |
| 25-intercom | 0 | – | 0 | scaffold |
| 26-odoo-inventory | 0 | – | 0 | scaffold |
| 27-maintainx | 0 | – | 0 | scaffold |
| 28-odoo-manufacturing | 0 | – | 0 | scaffold |
| 29-isms-online | 0 | – | 0 | scaffold |
| 30-microsoft-entra | 0 | – | 0 | scaffold |
| 31-suitedash | 0 | – | 0 | scaffold |
| 32-notion | 0 | – | 0 | scaffold |
| 33-langsmith | 0 | – | 0 | scaffold |
| 34-trello | 0 | – | 0 | scaffold |

Resumen: **2/34 con UI real, 32 scaffold** [verificado]. Ningún test cubre estos componentes [grep en `tests/`].

### 3b. Backend `packages/workspaces/*/src/application/` [datos por script + lectura de 01-gmail]

Todas persisten en el store interno vía `services.db.insertIfAbsent/put/get` y emiten al bus (patrón verificado leyendo `01-gmail/src/application/commands.ts` completo [leído]; grep de `fetch(|https://|axios` = **0** en los 34 `commands.ts` [grep]). Ruta HTTP: `app.ts:590` `app.route("/api/workspaces", ...)` [grep].

| workspace | commands | queries | APIs externas | estado |
|---|---|---|---|---|
| 01-gmail | 75 L | 37 L | 0 | interno (records+bus) |
| 02-whatsapp | 72 L | 13 L | 0 | interno |
| 03-hubspot | 111 L | 10 L | 0 | interno |
| 04-holded | 98 L | 10 L | 0 | interno |
| 05-google-drive | 72 L | 20 L | 0 | interno |
| 06-google-calendar | 85 L | 13 L | 0 | interno |
| 07-linear | 63 L | 29 L | 0 | interno (2 coincidencias TODO/error; naturaleza no verificada) |
| 08-chatgpt | 59 L | 10 L | 0 | interno |
| 09-airtable | 85 L | 10 L | 0 | interno |
| 10-perdoo | 59 L | 20 L | 0 | interno |
| 11-holded-tesoreria | 85 L | 10 L | 0 | interno |
| 12-odoo-purchase | 59 L | 20 L | 0 | interno |
| 13-productive | 59 L | 20 L | 0 | interno |
| 14-zendesk | 72 L | 20 L | 0 | interno |
| 15-docusign | 72 L | 13 L | 0 | interno |
| 16-n8n | 72 L | 13 L | 0 | interno |
| 17-process-street | 72 L | 13 L | 0 | interno |
| 18-factorial | 59 L | 13 L | 0 | interno |
| 19-personio | 59 L | 20 L | 0 | interno |
| 20-ramp | 72 L | 13 L | 0 | interno |
| 21-stripe | 157 L | 39 L | 0 | interno |
| 22-canva | 72 L | 13 L | 0 | interno |
| 23-buffer | 59 L | 20 L | 0 | interno |
| 24-shopify | 72 L | 20 L | 0 | interno |
| 25-intercom | 59 L | 20 L | 0 | interno |
| 26-odoo-inventory | 85 L | 13 L | 0 | interno |
| 27-maintainx | 72 L | 13 L | 0 | interno |
| 28-odoo-manufacturing | 72 L | 13 L | 0 | interno |
| 29-isms-online | 85 L | 13 L | 0 | interno |
| 30-microsoft-entra | 72 L | 20 L | 0 | interno |
| 31-suitedash | 72 L | 13 L | 0 | interno |
| 32-notion | 72 L | 13 L | 0 | interno |
| 33-langsmith | 72 L | 13 L | 0 | interno |
| 34-trello | 80 L | 30 L | 0 | interno |

- **Barrel roto**: `packages/workspaces/src/index.ts` importa `"./01-gmail/src/index.ts"` (e idem los 34) cuando los paquetes viven en `packages/workspaces/01-gmail/` — los 34 `src/index.ts` **existen** [leído + verificado Test-Path]; la ruta relativa es incorrecta desde `src/` → origina los 34 TS2307 de tsc y los 45 `ERR_MODULE_NOT_FOUND` de los tests [leído §7].

## 4. Wiring roto (los 7 puntos)

1. **`DeferredActions.run` en `index.ts:149-154`** [leído]: el callback **solo lee** la acción de la DB (`db.get(..., "actions", actionId)`), hace `void action;` y no ejecuta nada — el propio comentario dice "Por ahora, marcamos la acción como ejecutada". El `tick()` (`actions-deferred.ts:98-111` [leído]) llama a ese `run`, y al no lanzar excepción **pone `status: "executed"` y emite `action.executed`**. Es decir: **lee y descarta, pero la marca como ejecutada**. Test `actions-deferred-wire.test.ts` afirma el comportamiento actual ("approve con deferred pasa a scheduled en vez de ejecutar") [leído de nombre del test] — no cubre la ejecución real.
2. **`Promoter.promote`** [grep+leído]: usa **`classifyWithTenant(thought, ctx.tenantId)`** en `promote.ts:171` (import en línea 16). También clasifica destinos con `classifyDestination(role)` local (línea 104). **Hecho en este punto** (con test `kernel.test.ts`... que está en rojo, §7).
3. **`Meta.extractProgress`** (`meta.ts:159-169`) [leído]: lee **primero** de `thought.attention.metadata.progress` (marca `META_EXTRACT_PROGRESS_FIX_V1`) y si no existe cae a `thought.progress`. **Hecho** (test `kernel-meta-context.test.ts` pasa [leído §7]).
4. **`SlowAuthor.writeReasoning`** (`slow-author.ts:56-98`) [leído]: escribe el `progressStep(...)` dentro de **`attention.metadata.progress`** (línea 83, marca `SLOW_AUTHOR_PROGRESS_ATTENTION_V1`) — coherente con el punto 3. **Hecho**.
5. **`kernel-routes.ts`**: **no** hardcodea `tenantId: "default"` [grep: 0 ocurrencias de `"default"`]. Construye el contexto con `deps.tenants.resolve(owner)` vía cast (`ctxFor`, líneas 43-47, marca `KERNEL_ROUTES_CTX_TENANT_FIX_V1`) [leído]; idem el resto de rutas (líneas 147, 175, 188, 200, 253, 291, 357) [grep]. Ojo: el acceso es por `as unknown as {...}` — si `kernel.deps.tenants` no estuviera inyectado, cada llamada lanzaría en runtime; **la inyección real no está verificada** [no verificado].
6. **`tenant-membership` — se escribe de dos formas distintas** [leído]:
   - `engine/tenant.ts` (`MEMBERSHIP_ID = "default"`): `setMembership` escribe `db.put(owner, "tenant-membership", { id: "default", tenantId, ... })` → **`id="default"` en scope del owner**.
   - `engine/service.ts:969` (`ensureTenant`): `insertIfAbsent(owner, "tenant-membership", { id: "default", tenantId })` → igual, **`id="default"`**.
   - `admin-tenants.ts:126`: `db.put("system", "tenant-membership", { id: body.tenantId, tenantId: body.tenantId })` → **`id=<tenantId>` en scope "system"`**.
   - Lectores: `index.ts:48,76` listan scope `"system"` (solo ven las filas de admin); `index.ts:175-178` hace `scan("tenant-membership")` global para los consumidores; `admin-tenants.ts:50` lista scope `"system"`; `TenantService.resolve` lee `get(owner, kind, "default")` [leído]. **Consecuencia**: membership por-owner y membership global conviven con `id` y scope distintos [inferido de los 3 sitios leídos].
7. **`personas-bootstrap` en Docker con `DATA_DIR=/data`** [leído]: **SÍ avisa** si `loaded === 0` (`console.warn` en `personas-bootstrap.ts:23-28`, marca `PERSONAS_BOOTSTRAP_WARN_EMPTY_V1`), y en Docker efectivamente daría 0 porque `clientsDirFrom("/data")` = `/clientes` y `.dockerignore` excluye `clientes/` [inferido]. Pero esa llamada vive en el bloque try/catch de `index.ts:31-41` cuyo registry **se descarta** (§2); el bootstrap que alimenta el registry real (`app.ts:89-100`) **no avisa en 0/0** [leído]. Además `kernel/personas-bootstrap.ts:3-4` importa `../../engine/agents/...` que resuelve a `apps/server/engine/...` (inexistente; debería ser `../engine/...`) → en runtime ese import falla (`ERR_MODULE_NOT_FOUND` observado en tests, §7) [leído].

## 5. Observabilidad

- **`MetricsRegistry.quantile`** (`metrics/registry.ts:68-94` + `observe` 95-111) [leído]: el cálculo con múltiples samples es **correcto como aproximación por buckets**: `observe` guarda conteos no acumulativos por bucket (+1 en el bucket correspondiente, overflow en `buckets.length`), `quantile` acumula `cumulative` por muestra, añade la fila `+Inf`, ordena y devuelve el primer bucket con `cumulative >= q * total`. Es la heurística estándar de Prometheus (sin interpolación): **válido, con la resolución limitada a los buckets** [leído]. Detalle: usa `rows.find` dentro del doble bucle → O(n²) menor, sin impacto práctico [inferido].
- **Contadores que alimentan `buildAlertDefinitions`** (`index.ts:189-216`) [leído]:
  - `http5xx` / `httpTotal`: **reales** — lee `openmuse_http_requests_total`, que sí se incrementa en `middleware/request-logger.ts:69` [grep].
  - `httpLatencyP99Ms`: real (`quantile("openmuse_http_request_duration_ms", 0.99)`) [leído].
  - `workerRunning`: real (`agent.worker.running`) [leído].
  - **`taskFailuresLastHour: 0`, `tenantQuotaExceeded: 0`, `circuitOpenCount: 0`, `deadLetterCount: 0`, `outcomeUnknownCount: 0` — hardcodeados a 0** (líneas 204-209) [leído] → 5 de las condiciones de alerta **nunca pueden dispararse**.
- **Consumidores del bus** (`index.ts:168-250`) [leído]: no son una lista fija — `ownersWithConsumers` se construye con `db.scan("tenant-membership", 100)` y mapea `r.value.tenantId` (marca `EVENTS_CONSUMERS_DYNAMIC_OWNERS_V1`); sobre esa lista arrancan `startMetricsConsumer`, `startAuditConsumer`, `startNotificationsConsumer`, los consumidores kernel (metrics/audit/notifications/thought/turn) y los de estado. **Si el scan devuelve 0 filas, cae a la lista fija `["local-user", "system"]`** (línea 179) [leído]. Dos reservas: (a) el shape `r.value.tenantId` no está verificado contra el store real [no verificado]; (b) aquí es donde choca la inconsistencia del punto 6 de §4: las memberships escritas por-owner pueden no aparecer en este scan y viceversa [inferido].
- El `alertMetrics` del snapshot y el `globalMetrics` de `/metrics` son el mismo registro [leído] y `/metrics` está montado (`app.ts:540`) [grep].

## 6. Tests

`tests/` contiene **75 ficheros `*.test.ts`** (74 en la raíz + `tests/load/fifty-tenants.test.ts`) + `setup.ts` (aisla el fetch externo: bloquea Gemini/Google/Stripe/Facebook [leído]) y 5 helpers no-test (`browser.ts`, `computer.ts`, `crash-worker.ts`, `lifecycle.ts`, `model.ts`) [verificado por listado]. Nota: el glob del script `test` (`tests/*.test.ts`) solo ejecuta los de la raíz — `tests/load/fifty-tenants.test.ts` **queda fuera** [leído de package.json]. "Wiring" = cubre integración entre capas, no solo unidad [criterio de nombre+primer test leído por grep].

| fichero | cubre (1 línea) | wiring |
|---|---|---|
| actions-deferred-wire | approve+deferred pasa a scheduled; reconcile/retry en ActionService | **sí** |
| actions | propuestas de acción: denegar/concurrencia/idempotencia | sí (service↔persistencia) |
| agent-api | API de agente con sesión + rehilo de conversación concurrente | **sí** |
| agent-persona | `agentPersonaSchema` válida/inválida (Laia mínima) | no |
| agent-runtime | spawn/complete de runtimes de agente | sí |
| alerts | disparo de alerta + cooldown | no (unidad) |
| api | rutas privadas + workspace sample con PDF | **sí** (HTTP E2E) |
| apply-event | eventos sop/task actualizan estado | no |
| auth | login 401/token + modo real del servidor | **sí** |
| backup-restore | backup íntegro y restore | sí |
| browser | perfil de browser, reanudación de worker | **sí** |
| business-graph | createEntity con provenance, 409 duplicado | no |
| business-os-contracts | schemas goal/outcome | no |
| business-os-orchestrator | orchestrator achieved/blocked | no |
| business-os-slice | criterios de goal + CapabilityRegistry | no |
| computer-api | endpoints computer con ownership y receipts | **sí** |
| computer-runner | runner de comandos (test multi-línea, contenido no leído) | [no verificado] |
| computer | Docker argv + receipts | sí |
| concurrency | 409 en thread concurrente + notificaciones por userId | **sí** |
| context-engine | assemble de rol con memorias | no |
| conversation-browser | chat `browse_web` emite eventos SDK reales | **sí** |
| crash-recovery | worker muere → tarea running con lease | **sí** |
| dead-letter | enqueue → dead-letter | sí |
| deferred-actions | 1 firma programa y ejecuta tras ventana | **sí** |
| demo-model | navegación de demo aquarium | no |
| edit-lock | acquire/release de lock | no |
| engine | dos workers reclaman una tarea una vez | **sí** |
| entity-resolver | resolve por CIF | no |
| event-bus-dedupe | dedupeKey no duplica | sí |
| event-bus-stress | 500 emisiones sin pérdida | sí |
| event-bus | todo SystemEventType con schema + presencia en `bus.emit` | **sí** (contestado: falla §7) |
| events-sse | subscriber recibe eventos del owner | **sí** |
| expression | evaluateExpression | no |
| format | fmtDur | no |
| google | Gmail anidado sobre rutas autenticadas | sí |
| guardrails | cuota de creación de tareas | no |

| kernel-consolidate | consolidate detecta duplicados/negación/tenant | no |
| kernel-meta-context | Meta `evaluateWithProgress` ready/failed/long | **sí** (Meta↔kernel) |
| kernel-persona-isolation | `listTurns` aísla por personaId | **sí** |
| kernel-presenter | `presentTurn` devuelve response | **sí** |
| kernel-rules-attention | existe regla `survive_high_attention_focus` | no |
| kernel | openTurn+appendThought+closeTurn | **sí** |
| laia-hierarchy | Laia ve turnos/atención/notificaciones de los 12 | **sí** |
| live | pickPrimary | no |
| log | redacción de secretos | no |
| memory-board | groupMemories | no |
| memory | crear memoria con category/tags | no |
| model-worker | CopilotKit model worker ejecuta tools y persiste | **sí** |
| oauth | refresh no pisa cuenta Google nueva | sí |
| openbot | OpenBot deshabilitado por defecto | no |
| pdf | PDF real de 2 páginas + relleno | no |
| permissions | schema de rol con permissions | no |
| persistence | data dir sobrevive restart de DB + errores de idle client | **sí** |
| policy-engine | allowlist por rol | no |
| rag | embedTexts en paralelo / sin API key | no |
| registry | schemas dashboard/queue | no |
| reingest | endpoint reingest no devuelve 501 | sí |
| retry | retryWithBackoff | no |
| sop-contract | contrato de sop task | no |
| sop-triggers | cron every:Nm | no |
| state-machine | transiciones de estado | no |
| task-plans | planes document/monitor | no |
| tasks-reassign | reassign cambia assignedTo+state.roleId | **sí** |
| tenant-cache | TTL + invalidateAll | no |
| tenant-isolation-extended | N tenants sin lectura cruzada + scanByPrefix | **sí** |
| tenant-isolation | records no visibles entre tenants | **sí** |
| tenant-migration | migrate-tenant-scope sin pérdida | **sí** |
| tools-reducer | reducer de tool-calls del stream | no |
| truth-resolver | fuente más fiable + conflictos | no |
| vault | encriptación/authenticación del envelope | no |
| view-resolver | resolveView intención→vista | no |
| worker-concurrency | MAX_ACTIVE limita tareas en paralelo | **sí** |
| worker-metrics | `task_duration_seconds_count` incrementa | **sí** |
| workflows | document job + ideas con replies | **sí** |
| load/fifty-tenants | (nombre) carga con 50 tenants | **sí** (nombre) [test no leído] |

## 7. Typecheck y tests (salida real)

### typecheck — **FALLA** (exit=2)

Nota de método: `pnpm typecheck` (`tsc --noEmit && npm --prefix apps/worker run typecheck`) ejecuta bien la primera mitad pero el wrapper `pnpm.ps1` devuelve además un `NativeCommandError` espurio en stderr [leído en log]. He ejecutado `node_modules\.bin\tsc.cmd --noEmit` directamente (misma primera mitad; la segunda mitad con `npm --prefix apps/worker` **no ejecutada** [no verificado]).

Resultado tras la reparación de `service.ts` [leído de `%TEMP%\ec-tsc9.log`, 33.304 bytes]: **106 errores, TSC_EXIT=2**. Reparto por fichero [grep sobre el log]:

```
34 x packages/workspaces/src/index.ts      (TS2307: rutas './NN-x' en vez de '../NN-x')
 7 x apps/server/src/kernel/personas-bootstrap.ts (TS2307: '../../engine/...' inexistente)
 4 x apps/server/src/kernel/kernel.ts
 4 x apps/server/src/engine/events/consumers/state-denied.ts   (TS2307 imports rotos)
 3 x apps/server/src/engine/events/consumers/state-changed.ts  (TS2307 imports rotos)
 3 x apps/server/src/engine/events/consumers/verification-disagreement.ts (TS2307)
 3 x tests/event-bus.test.ts               (TS1117 propiedades duplicadas)
 2 x apps/server/src/routes/workspaces.ts
 2 x apps/server/src/engine/service.ts     (TS2345 Store | TenantScopedStore)
 1+ x contracts (21-stripe, 24-shopify, 23-buffer...), app.ts(221) TS2561, conversation.ts(828) TS2304...
```

Primeras y últimas líneas reales del log:

```
apps/server/src/app.ts(221,179): error TS2561: ... 'workspaceModuleRegistry' does not exist in type 'BusinessOsServices'. Did you mean to write 'workspaceRegistry'?
apps/server/src/engine/conversation.ts(828,64): error TS2304: Cannot find name 'hints'.
apps/server/src/engine/events/consumers/state-changed.ts(2,28): error TS2307: Cannot find module '../../db.ts' ...
...
packages/workspaces/src/index.ts(38,43): error TS2307: Cannot find module './34-trello/src/index.ts' ...
tests/event-bus.test.ts(73,3): error TS1117: An object literal cannot have multiple properties with the same name.
TSC_EXIT=2
```

Comparativa: antes de reparar `service.ts` el log era de 33.280 bytes con esencialmente los mismos errores [leído de `%TEMP%\ec-tsc4.log`] — la corrupción no cambiaba el typecheck (los bytes corruptos estaban dentro de comentarios/template-literals válidos), solo reventaba en tiempo de ejecución/memoria.

### tests — **FALLAN** (post-reparación, ejecución completa)

`pnpm test` (74 ficheros de la raíz — `tests/load/fifty-tenants.test.ts` queda fuera del glob; `tsx --test --test-timeout=5000`) tras reparar `service.ts` [leído de `%TEMP%\ec-test7.log`, 293.868 bytes]:

- Marcas: **274 ✔ / 57 ✗**; **45 líneas `ERR_MODULE_NOT_FOUND`** (≈15 errores ×3 líneas), todas originadas en `packages/workspaces/src/index.ts` [leído].
- Termina con `[ELIFECYCLE] Test failed` → **exit ≠ 0** [leído]. No imprime resumen agregado `# tests/# pass/# fail` [observado].
- **15 ficheros completos en rojo**: `agent-api` (45 s), `api` (45 s), `auth` (44 s), `browser` (42 s), `computer-api` (24 s), `concurrency` (10 s), `conversation-browser` (23 s), `kernel-persona-isolation` (7,5 s), `kernel-presenter` (6,4 s), `kernel` (6,2 s), `laia-hierarchy` (13 s), `memory` (13,5 s), `model-worker` (12,8 s), `tasks-reassign` (17,6 s), `workflows` (15,3 s) [leído].
- Ejemplos de tests individuales en rojo: `Meta detecta slow_failed_urgent` ✗, `todo SystemEventType tiene schema...` ✗, `ejecutar una tarea incrementa task_duration_seconds_count` ✗ (timeout 10 s), `el proceso worker muere a mitad de tarea...` ✗ [leído].
- Últimas líneas reales:

```
Ô£û ejecutar una tarea incrementa task_duration_seconds_count (11262.2463ms)
  'test timed out after 10000ms'
test at tests\workflows.test.ts:1:1
Ô£û tests\workflows.test.ts (15286.6784ms)
  'test failed'
[ELIFECYCLE] Test failed. See above for more details.
```

Comparativa con la ejecución **pre-reparación** (`ec-test5.log`, 247.028 bytes) [leído]: la suite **abortaba** sin llegar al final (moría tras `kernel.test.ts`), con `ERR_MODULE_NOT_FOUND` de `kernel/personas-bootstrap.ts` y ficheros individuales de **335-965 s** (agent-api 335 s, api 628 s, computer-api 965 s). Post-reparación los mismos ficheros tardan 7-45 s y la suite completa → **la corrupción de `service.ts` estaba disparando tiempos y abortos** [inferido de la comparación].

## 8. Qué está hecho de verdad

(Candidatos que cumplen los 5 criterios en lo que he podido verificar: wiring leído + test en verde en la última ejecución.)

- **Aislamiento multi-tenant del store**: `tenant-isolation`, `tenant-isolation-extended`, `tenant-migration`, `tenant-cache` en verde; `TenantService` es la frontera única de resolución [leído][test pasa].
- **Núcleo del event bus**: `event-bus-dedupe`, `event-bus-stress`, `events-sse` en verde; consumidores cableados en `index.ts` con owners dinámicos [leído][test pasa] (el test de completitud de contratos `event-bus.test.ts` está en rojo).
- **Workers y concurrencia**: `engine`, `worker-concurrency`, `crash-recovery` en verde [test pasa].
- **Módulos con test rojo y verde sólidos**: `vault`, `backup-restore`, `pdf`, `permissions`, `guardrails`, `policy-engine`, `rag`, `persistence`, `google`, `oauth` en verde [test pasa].
- **Observabilidad base**: `MetricsRegistry` (contador/histograma/quantile correctos) + `request-logger` incrementando HTTP + `/metrics` montado [leído].
- **De los 7 puntos de wiring: 4 están hechos** — Promote usa `classifyWithTenant`, Meta lee `attention.metadata.progress`, SlowAuthor escribe ahí, kernel-routes no hardcodea tenant [leído][grep].

## 9. Qué está a medias

- **Acciones diferidas**: `run` no ejecuta nada pero `tick` marca `executed` y emite `action.executed` (§4.1) [leído].
- **Meta-hints**: el cálculo existe pero `conversation.ts:828` usa `hints` fuera de ámbito → nunca se persisten, el `catch` lo traga [leído][tsc]; `metaHintsPromptBlock` devuelve `""` y `presenterText` se descarta con `void` [leído].
- **Alertas**: 5 de 8 métricas del snapshot están a 0 por código (§5) [leído].
- **Personas**: registry de `index.ts` descartado; `app.ts` no avisa en 0/0; `kernel/personas-bootstrap.ts` importa `../../engine/...` roto (7 errores tsc + `ERR_MODULE_NOT_FOUND` en ejecución) [leído].
- **Consumers de eventos**: 3 ficheros (`state-changed`, `state-denied`, `verification-disagreement`) con imports relativos rotos (TS2307) que `index.ts` importa dinámicamente al arrancar [leído]; el efecto sobre el arranque real no está ejecutado [no verificado].
- **Workspaces**: backend persistidor interno completo pero sin integración; frontend 2/34; barrel con 34 rutas rotas [verificado].

## 10. Qué no existe

- **Ninguna llamada a API externa** en los 34 workspaces (0 `fetch/https/axios`) [grep] — no existe la integración real con Gmail, Stripe, HubSpot, etc.
- **Selector o chat por agente concreto**: solo hay selector de roles en el chat; los componentes ricos de `components/agents/` no están conectados a un chat por agente [leído][grep].
- **Personas en la imagen Docker** (`.dockerignore` excluye `clientes/`) [leído].
- **Alertas de cuotas/dead-letter/circuitos**: las métricas que las alimentarían se generan como 0 [leído].
- **Tests de UI**: no hay un solo test de React/web en `tests/` [grep].

## 11. Frentes priorizados por impacto en cliente (máximo 5)

1. **Acciones diferidas que mienten** (§4.1): el cliente aprueba y el sistema responde `action.executed` sin que nada se haya ejecutado — pérdida directa de confianza en la automatización.
2. **Workspaces sin integración real**: 32/34 sin UI y 0/34 con APIs externas (§3) — el producto promete conectar el negocio y hoy solo escribe en su propio store.
3. **Agentes ausentes en producción**: en Docker no se carga ni Laia ni los 12 (§2) — la experiencia de "agentes" existe en local y no en la imagen desplegada.
4. **Suite y typecheck en rojo** (§7): 15 ficheros de test fallando, 106 errores tsc y los tests E2E del chat (api/auth/agent-api) entre ellos — cualquier cambio nuevo llega sin red de seguridad.
5. **Alertas ciegas** (§5): 5 de 8 métricas a 0 — el cliente se entera de los incidentes antes que el sistema.

## 12. Qué NO he verificado

- La **causa** de la corrupción de `service.ts` (corrupción y reparación verificadas byte a byte; el origen —editor, sincronización, antivirus— no) [no verificado].
- Que el servidor **arranque de verdad** (`index.ts` completo en ejecución): no lo he lanzado; los consumers con imports rotos podrían tumbarlo [no verificado].
- Que `kernel.deps.tenants` esté realmente inyectado para los casts de `kernel-routes.ts` [no verificado].
- El shape real de `db.scan("tenant-membership")` (`r.value.tenantId`) contra el store [no verificado].
- Internos de `components/agents/*` (AgentProfile, AgentSquad...) — solo he verificado quién los importa [no verificado].
- Ejecución en navegador/LLM vivo de whatsapp/zendesk (solo estructura de ficheros) [no verificado].
- La segunda mitad del script `typecheck` (`npm --prefix apps/worker run typecheck`) [no verificado].
- `docker build`/arranque de la imagen; contenido de `tests/computer-runner.test.ts` (test multi-línea) y `tests/load/fifty-tenants.test.ts` [no verificado].
- Contexto de por qué `apps/server/src/engine/service.ts` está en `.gitignore` (el commit `ad29d4a` lo excluyó: "excluding large service.ts") [verificado el hecho, no la causa].

---

**Si tuviera que arreglar una sola cosa mañana, sería `DeferredActions.run`, porque es el único punto donde el sistema le dice al cliente que su acción se ejecutó cuando en realidad solo la leyó y la descartó; todo lo demás falla ruidoso (tests rojos, tsc rojo), pero eso falla en silencio mintiendo sobre el estado del negocio.**
