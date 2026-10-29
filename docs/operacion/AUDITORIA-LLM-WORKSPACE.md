# Auditoría del camino LLM → kernel → workspace

> Método: lectura directa del código sobre `main @ c69e028` + rama
> `campaign/canales-runtime`. **No** se ejecutó ningún proveedor (no hay claves).
> Cada afirmación lleva fichero + marcador greppable para que se pueda refutar.
> Si algo de aquí deja de ser verdad, se corrige este documento: es el contrato.
>
> Complemento: `docs/operacion/HANDOFF-LLM.md` (el mandato de trabajo).

## 1. El camino, en 7 tramos

```
(peticion)
 1. HTTP/panel ──► conversation.ts (chat, cadena FAST)
 2. tarea durable ──► worker.ts ──► model.ts::executeModelTask (cadena SLOW)
 3. SOP ──► sop-executor.ts ──► tool llm_generate ──► model.ts::generateText
 4. plan ──► planner/llm-planner.ts (cadena global, sin tenant)
 5. ejecucion ──► execution/executor.ts ──► capability-runner.ts ──► tool-executors.ts
 6. registro ──► kernel/kernel.ts (turnos + thoughts) + audit + metricas
 7. salida ──► packages/workspaces/** (contratos) + engine/workspaces (registry/dispatcher)
```

Un mismo modelo se invoca desde **cuatro sitios distintos**, con tres patrones
de resiliencia y **una sola** implementación de transporte.

## 2. Real vs scaffold (lo importante)

| Tramo | Veredicto | Evidencia |
|---|---|---|
| Transporte al modelo | **Delegado al vendor.** Todo pasa por `@copilotkit/runtime/v2` `BuiltInAgent`. En `apps/server/src/engine/**` hay exactamente **2 llamadas HTTP propias**: `embeddings.ts:22` (Gemini embedContent) y `business.ts:142` (comprobar que una URL responde). No hay cliente de proveedor, ni parser SSE, ni lectura de `usage`. | grep `BuiltInAgent` en `model.ts`, `conversation.ts`, `planner/llm-planner.ts`, `sop-executor.ts` |
| Resiliencia de la cadena | **Real y profunda.** `model-chain.ts::runWithModelFallback`: timeout de primer byte (`LLM_FIRST_BYTE_MS`, 45 s), circuit breaker por proveedor (`globalCircuits.get("llm:"+provider)`), bulkhead por proveedor (`LLM_BULKHEAD_PER_PROVIDER`, Map en `globalThis`), `attemptId` para ignorar eventos tardíos del intento abortado, y fallback **solo** si no hubo salida visible al cliente. | `model-chain.ts`, marcadores `MODEL_FIRST_BYTE_CONFIG_V1`, `MODEL_FALLBACK_PROVIDER_CIRCUIT_V1`, `MODEL_BULKHEAD_PER_PROVIDER_V1` |
| Selección de modelo | **Real a medias.** `modelChain(config, tenant, mode)`: chat → `[fast, global, fallback]`, tarea → `[slow, global, fallback]`. Roles con modelo propio (`tenantConfig.roles[roleId]`) se anteponen en tareas. Pero `generateText` y `LlmPlanner` llaman `modelChain(config)` **sin tenant**. | `model-chain.ts::modelChain`, `model.ts` (`MODEL_SLOW_CHAIN_OUT_OF_SCOPE_V1`), `llm-planner.ts` |
| Contabilidad de uso/coste | **Simulada.** `recordUsage(owner, "task", model, promptChars, text.length, "slow")`: son **caracteres**, no tokens; no hay coste real por proveedor; la cuota se comprueba sumando en memoria la tabla `llm-usage` completa en cada tarea. | `model.ts` (bloque `RECORD_USAGE_SLOW_V1` + bloque de cuota) |
| Planner | **Real con formato frágil.** `LlmPlanner` (prompt "solo JSON", `maxSteps: 1`) + `parsePlannerResponse` que extrae con `indexOf("[")`/`lastIndexOf("]")`. Fallback `StubPlanner` devuelve plan **vacío** con `reason: "stub planner: no implementado"`. | `planner/llm-planner.ts:13`, `planner/planner.ts:58`, `planner/replanner.ts:22` |
| Ejecución de pasos | **Real.** Dependencias, `retry.maxAttempts`, compensación en orden inverso, estado `blocked` si todos los pasos se saltan. | `execution/executor.ts` (`EXECUTOR_COMPENSATION_V2`, `EXECUTOR_STATUS_BLOCKED_V1`) |
| Autorización al efecto | **Real y en el sitio correcto.** `CapabilityRunner` comprueba governance **antes** de ejecutar, valida la aprobación contra `actions` (solo `executing`/`succeeded` autorizan) y lleva claims de idempotencia con estados `claimed/done/failed/outcome_unknown` + regla de claim rancio (5 min). | `execution/capability-runner.ts` (`CAPABILITY_RUNNER_B10_V1`) |
| Kernel | **Real como registro, con dos agujeros.** Turnos/thoughts con tenant explícito, audit append, métricas, hooks `onTurnOpened/onThoughtAppended`, apertura idempotente, turnos hijo, cierre recursivo. Agujeros: la tenancy del kernel sigue siendo de un solo tenant lógico y el store por defecto es en memoria. | `kernel/kernel.ts` vs `kernel/tenancy/default-resolver.ts:3,6` y `kernel/graph/in-memory-store.ts:5` |
| Autores del kernel | **Real en persistencia, inventado en atención.** `FastAuthor.writeResponse` escribe el texto real del fast LLM, pero si no le pasan `matched`, lo **fabrica** por substring: `weight = entity.length / (response.length/10)`. Es una señal de atención ficticia, no recuperación. | `kernel/authors/fast-author.ts` (`FAST_AUTHOR_ATTENTION_V1`) |
| Observador meta (chat) | **Apagado.** Se calculan hints y `metaHintsPromptBlock` devuelve `""`: el trabajo se hace y no llega al prompt. | `engine/conversation.ts` (`CONVERSATION_META_HINTS_PROMPT_V1`) |
| Memoria | **Real pero léxica.** Reformulación con stopwords, scoring TF (`1 + log(freq)`), paginación keyset, dedup por hash, olvido con TTL, `retryMissingEmbeddings`. La recall **no** usa vectores. | `engine/memory.ts` (`FIX_12_10_TF_SCORING_V1`) |
| Embeddings | **Real y mal configurado.** Llama a Gemini de verdad, pero: modelo hardcodeado (`text-embedding-004`), lee `GOOGLE_API_KEY`/`GEMINI_API_KEY` del entorno e **ignora** `EMBEDDINGS_LLM_MODEL/PROVIDER/BASE_URL/API_KEY` del TenantConfig, y devuelve `null` silencioso ante cualquier fallo. | `engine/embeddings.ts:5,22` vs `kernel/config/env-resolver.ts` |
| Compilador de workspace | **No existe como tal.** Lo que hay: `WorkspaceGenerator` deriva secciones board/table de `business-schemas/default`; `WorkspaceRegistry` mapea rol → vista por defecto (16 roles); `WorkspaceModuleRegistry` + `WorkspaceDispatcher` resuelven los 34 módulos. | `engine/workspace/generator.ts`, `registry.ts`, `engine/workspaces/*`, `app.ts:281-285` |
| 34 módulos de workspace | **Contratos reales, handlers fabricados, estado mentiroso.** `commands.ts` genera un handler por capacidad que solo persiste y **emite siempre el mismo evento** (`whatsapp.message.received`, incluso en `mark_read`). Y: los 34 `workspace.json` dicen `"status": "scaffold"`, mientras el contrato que el runtime registra declara `status: "implemented"`. | `packages/workspaces/*/workspace.json:8` (34/34 `scaffold`), `packages/workspaces/02-whatsapp/src/contract.ts`, `src/application/commands.ts` |
| Puente de capacidades | **Real con default peligroso.** `bridge.ts` registra cada capacidad como `kind: "tool"`, `inputs/outputs: {}` e **`idempotency: "idempotent"` para todas**, incluidas las que envían. | `engine/workspaces/bridge.ts` |

## 3. Defectos, por severidad

**D1 · Un `llm_generate` de SOP no tiene dueño económico (crítico).**
`generateText` usa la cadena **global** (ignora la key del tenant por diseño:
`modelChain(config)`), no registra `llm-usage` y no comprueba cuota. Una SOP
puede gastar la key de la plataforma sin contabilidad ni límite. Un cliente
podría, en teoría, facturarte a ti.
→ Arreglo: `F2`+`F3` del mandato.

**D2 · El coste es un número inventado (crítico).**
`promptChars`/`text.length` no son tokens; no hay coste. La cuota de 50 €/día se
calcula sobre esa ficción, y la suma recorre la tabla entera en cada tarea.
→ Arreglo: `F2`.

**D3 · La cuota es por owner, no por tenant, y se evalúa tarde (alto).**
El bloque de cuota de `model.ts` lista `llm-usage` del owner y compara con
`service.guardrails.checkTokens(tenantIdForQuota, tokensToday)`: mezcla dos
ámbitos. Además se evalúa **después** de montar el prompt, con el gasto de hoy,
no se reserva presupuesto para la llamada en curso.

**D4 · Tres de los cuatro invocadores ignoran el tenant (alto).**
Chat y tarea respetan `fast`/`slow` por tenant; `generateText` (SOP) y
`LlmPlanner`/`LlmReplanner` no. Dos tenants con keys distintas comparten la
cadena global en esos caminos.

**D5 · La atención del kernel se inventa (alto).**
`FastAuthor` fabrica `matched` por longitud de substring. Meta, Presenter y
cualquier vista que lea `attention` está leyendo una fábula.
→ Arreglo: `F4` (los `matched` salen del recall real, con score).

**D6 · El bulkhead y el circuit breaker son globales del proceso, no del tenant (alto).**
`globalCircuits` y el Map de `globalThis` cruzan inquilinos: un tenant abusador
puede dejar sin intentos al resto. En multi-tenant esto es un acoplamiento real.

**D7 · Embeddings ignoran la configuración por tenant y fallan en silencio (alto).**
`env-resolver.ts` sirve `EMBEDDINGS_LLM_*` por tenant y `embeddings.ts` no los
mira. `return null` en el `catch` convierte una cuota agotada en "sin memoria",
que es indistinguible de "no había nada".
→ Arreglo: `F5`.

**D8 · El recall es léxico y nadie conoce su precisión (medio).**
TF con stopwords no es búsqueda semántica. No hay ni un test que mida recall
sobre un conjunto fijo: no se sabe si recupera.

**D9 · El planner parsea JSON a ciegas (medio).**
`indexOf("[")`/`lastIndexOf("]")` acepta cualquier basura entre corchetes; si el
modelo añade prosa con un array (ejemplos), se queda con el fragmento incorrecto.
No hay schema, ni reparación, ni comprobación de que los `capabilityId` existan
(`validatePlanCapabilities` existe pero no se aplica en el planner).

**D10 · Los handlers de workspace son un stub que se declara implementado (medio).**
Todos los comandos persisten y emiten el mismo evento; ningún payload se valida
de verdad (`z.record(z.unknown())`). Y el estado del contrato (`implemented`)
contradice al manifest (`scaffold`): el runtime registra el que miente.

**D11 · El puente declara idempotente lo que no lo es (medio).**
`bridge.ts` pone `idempotency: "idempotent"` a toda capacidad de workspace. En
`CapabilityRunner`, eso **desactiva** la clave de idempotencia y el claim: un
`messaging.send` reintentado puede salir dos veces.

**D12 · El observador meta se calcula y se tira (bajo, pero es deuda confusa).**
`metaHintsPromptBlock` devuelve `""`; el trabajo de meta se paga y no se usa.
O se cablea o se borra: hoy parece una funcionalidad que no está.

## 4. Invariantes que YA se cumplen (no romper al arreglar)

1. **Fail-closed honesto.** Sin credencial: 503 con el nombre de la variable. Sin
   aprobación válida: error, no efecto. Sin `AUTH_PROVIDER` correcto: 401/403.
2. **Nada se escribe fuera sin `prepare_*` + aprobación.** Un `finish_task` sin
   efecto real no cierra la tarea.
3. **El kernel no puede romper una tarea** (`KERNEL_NONFATAL_V1`): todos los
   caminos del kernel son best-effort y con `catch`.
4. **Idempotencia con estados explícitos** (`claimed/done/failed/outcome_unknown`)
   y reconciliación obligatoria del `outcome_unknown`.
5. **Datos no son instrucciones.** El prompt declara explícitamente que memoria,
   documentos y contexto son datos; hay que mantener esa línea en cada prompt nuevo.
6. **Aislamiento por tenant en el acceso a datos.** Todo pasa por
   `TenantScopedStore` o por tenant explícito.

## 5. Qué significa "profundo" aquí (definición operativa)

Un tramo está profundo cuando cumple **los cinco**:

1. **Instrumentado**: emite números reales (tokens, coste, latencia, nº de
   intentos) atribuidos a un tenant y a un modo (`chat`/`task`/`sop`/`plan`).
2. **Atribuido**: cada gasto tiene dueño (tenant + owner + rol + spec) y se puede
   cortar antes de gastar.
3. **Degradado con verdad**: cuando no puede, dice qué falta y qué se pierde; no
   devuelve `null` ni un plan vacío como si fuera un resultado.
4. **Probado sin red**: hay tests con `fetch` mockeado que cubren el camino de
   error y el de éxito; `ALLOW_NETWORK=0` debe bastar.
5. **Con la evidencia escrita**: el marcador de cambio, el test que lo cubre y la
   línea de este documento actualizada.

Todo lo que no cumpla los cinco, hoy es "scaffold", por bien que compile.

## 6. Fuera de alcance sin claves

No se puede auditar (ni afirmar nada) sobre: calidad real de las respuestas,
facturación del proveedor, latencia real de red, cuotas reales de cada key,
comportamiento de la JWKS de Supabase contra Google, ni la entrega de Meta/Vapi.
Todo eso se mide cuando existan las claves — y para entonces ya hay que tener los
números en `llm-usage` (F2), porque sin ellos no se puede ni discutir el coste.
