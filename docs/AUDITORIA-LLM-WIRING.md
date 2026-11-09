# Auditoría · cableado de LLM, personas, kernel, cognición, bus y grafo

**Repositorio** `uniscrolliabrain-cloud/agente` · **Fecha** 9 de noviembre de 2026 · **Base** `0c043da` (`main`) · **Método** lectura estática del árbol, sin ejecución de proveedores reales.

Predecesora: [AUDITORIA-AGENTES-LLM.md](./AUDITORIA-AGENTES-LLM.md) (4 nov 2026, base `4f81f22`). Esta auditoría no repite su inventario: comprueba qué sigue abierto, qué se rompió después y qué falta para que Laia y Marcos existan de verdad en el chat y en el runtime.

---

## Veredicto

El sistema **sí infiere**: hay cadena de modelos, fallback, circuit breaker, cuotas, RAG, kernel persistente y bus. Lo que no hay es **un cerebro único**. Hay siete prompts escritos a mano en siete sitios, dos registros de personas que no se hablan, un grafo que solo se escribe, y una capa de meta que se calcula dos veces y se inyecta cero. Laia y Marcos existen como JSON y como endpoints de lectura, pero **no participan en ninguna inferencia**.

No es un problema de modelo. Es un problema de **composición**: identidad, persona, contexto, atención y resultados viven en módulos correctos que nadie ensambla antes de llamar al LLM.

Prioridad real: **cinco bugs P0** que hoy degradan o corrompen la inferencia, y **una decisión de arquitectura** (un compilador de prompt por persona) que desbloquea todo lo demás.

---

## 1. Mapa real de inferencia

Siete construcciones de `BuiltInAgent`, siete prompts, ninguna compartida.

| # | Sitio | Quién lo llama | Prompt | Cadena |
|---|---|---|---|---|
| 1 | [`conversation.ts:1049`](../apps/server/src/engine/conversation.ts#L1049) | Chat web (`/api/copilotkit/run`) | Hardcodeado `"Eres Laia…"` + rol de `agent-roles` si llega `roleId` | fast → slow → global → fallback |
| 2 | [`model.ts:488`](../apps/server/src/engine/model.ts#L488) | Tareas durables (`executeModelTask`) | `"You are ${agentName}…"` + `contextBlock` | rol → slow → global |
| 3 | [`model.ts:670`](../apps/server/src/engine/model.ts#L670) | `generateText` (tool executors) | Asistente genérico | global |
| 4 | [`planner/llm-planner.ts:52`](../apps/server/src/engine/planner/llm-planner.ts#L52) | Orquestador de objetivos | Planificador | global |
| 5 | [`planner/replanner.ts:59`](../apps/server/src/engine/planner/replanner.ts#L59) | Orquestador tras fallo | Replanificador | global |
| 6 | [`verification/llm-verifier.ts:52`](../apps/server/src/engine/verification/llm-verifier.ts#L52) | Verificación | Verificador | global |
| 7 | [`sop-executor.ts:758`](../apps/server/src/engine/sop-executor.ts#L758) | Paso `llm_generate` | Ejecutor de procedimiento | global |

Consecuencias directas:

- **La identidad cambia según la puerta.** El chat dice «Laia, asistente personal del dueño»; la tarea dice «Laia, operator»; el SOP dice «Laia executing one step». Tres voces para el mismo producto.
- **El contexto se construye tres veces distinto**: `ContextEngine` en chat y tarea, `workspaceContext` en tarea, nada en SOP/planner/verifier.
- **Los sitios 3–7 ignoran tenant, persona y rol.** Su cadena es `modelChain(config)` sin `tenant`, así que ni fast/slow ni modelo por rol llegan nunca.

Esta es la raíz del «está desperdigado»: no hay una función `compose(persona, turn, budget) → prompt`.

---

## 2. Hallazgos P0 · la inferencia hoy falla o miente

### P0-1 · El chat mata la respuesta a los 2 segundos

[`conversation.ts:1055`](../apps/server/src/engine/conversation.ts#L1055) pasa `timeoutMs: 2000`, y en [`model-chain.ts:112`](../apps/server/src/engine/model-chain.ts#L111) ese valor es el **plazo de primer byte**, no el plazo total:

```ts
const firstByteMs = options.timeoutMs ?? (Number(process.env.LLM_FIRST_BYTE_MS ?? "45000") || 45000);
```

Un modelo real (Gemini/OpenRouter) tarda más de 2 s en emitir el primer token con contexto largo. Resultado: aborta, salta al fallback, y si el fallback tampoco arranca en 2 s el usuario recibe «Ahora mismo no puedo responder». El comentario `FIX_11_A2_CHAT_TIMEOUT_V1` sugiere que se confundió «timeout de chat» con «timeout de primer byte».

**Arreglo:** separar `firstByteMs` (15–45 s) de `totalMs` (60–120 s) en `runWithModelFallback`; que el chat configure el segundo, no el primero.

### P0-2 · El Presenter puede guardar el mensaje del usuario como respuesta del asistente

Orden actual en [`conversation.ts:1115-1145`](../apps/server/src/engine/conversation.ts#L1115):

1. `presentText(ctx, turnId)` — lee los thoughts del turno.
2. `textToPersist = presenterText ?? response`.
3. `writeFastResponse(...)` — escribe la respuesta real.

En ese momento el turno contiene el `intent` que escribió `UserAuthor` ([`conversation.ts:280`](../apps/server/src/engine/conversation.ts#L287)) y **todavía no** la respuesta del modelo. `Presenter.presentTurn` devuelve `undefined` solo si no hay thoughts; con uno, lo elige. `intent` está en la lista de prioridad ([`presenter.ts:25`](../apps/server/src/kernel/observers/presenter.ts#L20)), así que gana por defecto.

Efecto: el SSE muestra la respuesta correcta, pero el grafo persiste el texto del usuario como `response`. El registro cognitivo y la conversación divergen, y `Promoter` aprende de un texto que no generó el modelo.

**Arreglo:** escribir primero, presentar después, y excluir `intent`/`query` de la presentación. El `presenterText` de cierre ([`conversation.ts:1210`](../apps/server/src/engine/conversation.ts#L1218)) ya se calcula y se descarta: unificar en un solo punto.

### P0-3 · El bulkhead por proveedor no se libera y acaba forzando el fallback

En [`model-chain.ts:118-165`](../apps/server/src/engine/model-chain.ts#L118):

- `releaseBulkhead()` se llama en timeout y en `error`.
- **No** se llama en `complete` (fin normal).
- **No** se llama al saltar por `RUN_ERROR` con `startNextAttempt()`.

Cada respuesta exitosa deja el contador incrementado. Con el límite por defecto de 10 (`LLM_BULKHEAD_PER_PROVIDER`), tras diez turnos correctos todas las llamadas saltan al fallback aunque el proveedor esté sano. Es un agotamiento silencioso: no hay error, solo peor modelo y más coste.

**Arreglo:** liberar en `complete`, en el salto por `RUN_ERROR`, en el unsubscribe y en el salto por circuito abierto; usar `finally` por intento.

### P0-4 · Los runtimes del chat y de la tarea nunca se cierran

[`conversation.ts:261-269`](../apps/server/src/engine/conversation.ts#L261) abre un runtime y guarda `_runtimeId` en una propiedad privada. [`model.ts:66`](../apps/server/src/engine/model.ts#L66) abre otro con `void`.

`AgentService.completeRuntime` y `failRuntime` existen ([`service.ts:2204`](../apps/server/src/engine/service.ts#L2204)) y **no se llaman desde ningún sitio** (`grep` devuelve solo sus definiciones). El `sweep` de [`runtime.ts:132`](../apps/server/src/engine/agents/runtime.ts#L143) los marca `failed` a los 5 minutos.

Efecto: cada conversación genera un `agent.runtime_failed` falso, un checkpoint `failed` y ruido en métricas. El runtime no sirve como unidad de observación porque su final siempre es un timeout.

**Arreglo:** envolver el stream en `try/finally` y cerrar con `complete`/`fail` según el resultado, con `durationMs` real. El `_runtimeId` debe vivir en el contexto del run, no en el agente (los clones comparten clase).

### P0-5 · Los meta-hints del turno anterior se leen y se tiran

[`conversation.ts:158-170`](../apps/server/src/engine/conversation.ts#L158):

```ts
const metaHint = this.lastMetaHint;
this.lastMetaHint = null;
…
void metaHint;                 // nunca llega al prompt
void this.pendingMetaContext;  // tampoco
```

Además `metaHintsPromptBlock` ([`conversation.ts:130`](../apps/server/src/engine/conversation.ts#L130)) devuelve `""` y no se referencia en ningún sitio. La expiración compara contra `this.lastMetaHint`, que ya es `null`, así que nunca expira nada.

El único camino vivo es el otro: `service.systemContext` recalcula hints desde el turno abierto cada 30 s ([`service.ts:1069-1104`](../apps/server/src/engine/service.ts#L1069)). Es decir, hay **dos Meta** y la del chat es código muerto con estado que aparenta funcionar.

**Arreglo:** un solo pipeline: `Meta.evaluate` al cerrar → `MetaHintsStore.persist` (ya existe) → `systemContext` lee del store con TTL y tenant → se inyecta como bloque de datos. Borrar los campos privados y el getter vacío.

---

## 3. Hallazgos P1 · personas, Laia y Marcos

### P1-1 · Laia no está en el registro que consulta la API

[`app.ts:131-132`](../apps/server/src/app.ts#L131):

```ts
bootstrapPersonas(personaRegistry, "default", clientsDir),
bootstrapPersonas(personaRegistry, "default", "clientes/_example"),
```

`bootstrapPersonas` compone `join(clientsDir, tenantId, "personas")` ([`bootstrap.ts:26`](../apps/server/src/engine/agents/personas/bootstrap.ts#L26)). La segunda llamada busca `clientes/_example/default/personas`, que no existe. Laia vive en `clientes/_example/personas/laia/persona.json`, así que **carga 0**.

El bootstrap de [`index.ts:47`](../apps/server/src/index.ts#L47) sí usa `tenants = ["default", "_example"]`, pero construye **otro** `PersonaRegistry` que nadie consume. Dos registros, uno inútil.

### P1-2 · Una persona sin `stats.json` se descarta en silencio

[`bootstrap.ts:30`](../apps/server/src/engine/agents/personas/bootstrap.ts#L30): `if (!stats) continue`. `clientes/agntia/personas/laia/persona.json` no tiene `stats.json`, luego la Laia de Agntia **nunca se registra**. El `loader` ya sabe construir stats por defecto; el bootstrap no lo usa.

### P1-3 · Ninguna persona de disco puede empezar trabajo

[`registry.ts:77`](../apps/server/src/engine/agents/personas/registry.ts#L77) registra con `owners: activation?.owners ?? []`. `canStartWork` exige `entry.activation.owners.includes(work.owner)` y devuelve `sin_humano`. El bootstrap no pasa owners. Solo `loadInstalledPersonas` (instalaciones en store) rellena activación. Las personas de `clientes/` son decorativas por defecto.

### P1-4 · El chat no conoce personas: solo `agent-roles`

El frontend envía `state.roleId` ([`api/chat.ts:49`](../apps/web/src/api/chat.ts#L49)); el servidor lee `agent-roles` ([`conversation.ts:925-935`](../apps/server/src/engine/conversation.ts#L925)). `roleId` se usa además como `personaId` del kernel ([`conversation.ts:245-258`](../apps/server/src/engine/conversation.ts#L245)), mezclando dos conceptos: **rol** (catálogo de negocio, 16) y **persona** (identidad instalada, Laia/Marcos/12).

Ningún componente web envía `personaId` (`grep` en `apps/web/src`: solo una definición de tipo). El selector de personas existe en `/api/agent-personas`, pero no alimenta el chat.

**Consecuencia:** «Laia en el chat principal» no es un bug de una línea; falta el puente UI → `state.personaId` → kernel → prompt. Y falta que el prompt sepa usar una persona: [`agent-persona.ts`](../packages/domain/src/agent-persona.ts) declara explícitamente que **una persona no es un prompt**; hoy no existe el compilador que la convierta en uno.

### P1-5 · `delegate_task` pierde la persona

`createTaskSchema` acepta `roleId` ([`agent.ts:341`](../packages/domain/src/agent.ts#L341)), pero la herramienta pasa los argumentos que invente el modelo ([`conversation.ts:578-600`](../apps/server/src/engine/conversation.ts#L578)). El `roleId` del estado no se propaga. Si Laia delega, la tarea nace sin saber quién la pidió; `assignedTo` tampoco se rellena.

**Arreglo:** inyectar `roleId`/`requestedBy`/`personaId` desde `this.currentCtx` antes de `createTask`, y validar en servidor que la persona puede trabajar (`canStartWork`).

### P1-6 · Marcos no puede ser operador del runtime

`AgentRuntime` ([`runtime.ts`](../packages/domain/src/runtime.ts)) no tiene `personaId` ni `operatorId`. `spawn` recibe solo `roleId`, y los dos llamadores pasan constantes: `"user"` en chat ([`conversation.ts:264`](../apps/server/src/engine/conversation.ts#L264)) y `"agent"` en tarea ([`model.ts:69`](../apps/server/src/engine/model.ts#L69)).

Marcos existe como `persona.json` con `enabled: false`, `reportsTo: "laia"` y una SOP asignada (`investigar-leads`). No hay ningún punto donde su identidad se una a un runtime, a una tarea o a un turno. «Operador del runtime» hoy no tiene contrato: no hay operador, solo un rol de cadena.

### P1-7 · El coste se atribuye al modelo equivocado

[`conversation.ts:1096`](../apps/server/src/engine/conversation.ts#L1096) registra `this.config.model` aunque haya respondido el fast del tenant o el fallback. `llm-usage`, las cuotas (`checkSpeedQuota`) y las métricas por modelo trabajan con un dato falso. Lo mismo en tarea ([`model.ts:607`](../apps/server/src/engine/model.ts#L607), `config.model`).

**Arreglo:** `runWithModelFallback` debe exponer el spec que respondió; `recordUsage` recibe ese spec y `speed` derivado.

### P1-8 · Las claves del tenant no llegan al runtime (sigue abierto desde la auditoría anterior)

`createAgent` construye `new BuiltInAgent({ model, … })` con el string `provider/model` y nada más ([`conversation.ts:1051`](../apps/server/src/engine/conversation.ts#L1051), [`model.ts:486`](../apps/server/src/engine/model.ts#L482)). El `apiKey` y `baseUrl` del `ProviderSpec` solo se usan para decidir si el spec entra en la cadena. Un despliegue con credenciales exclusivamente por tenant pasa los guards y falla en la llamada.

---

## 4. Hallazgos P2 · kernel, cognición, bus y grafo

| Pieza | Qué hay | Qué falta |
|---|---|---|
| **Kernel** | Turnos, thoughts, audit, cierre con hijos, hooks al bus, store persistente | `closeTurn` y `thoughtsOf` resuelven tenant desde `owner` e ignoran `ctx.tenantId` ([`kernel.ts`](../apps/server/src/kernel/kernel.ts)); un contexto con tenant explícito puede cerrar en otro bucket y el `catch` del chat lo traga |
| **Cognición** | `attention.ts` (topMatched, overlap), `rules.ts`, `promote.ts`, `consolidate.ts` | Nada de eso entra en el prompt. La atención se escribe por autor y se lee por API; no selecciona contexto, no prioriza memorias, no decide modelo |
| **Grafo** | `GraphContext` con entidad, relaciones, eventos | No hay recuperación de **turnos/thoughts previos** por persona. La memoria conversacional del LLM depende solo del historial que reenvía el cliente; el grafo es write-only para inferencia |
| **Bus** | Emisor de kernel, consumidores de índice/audit/métricas/notificaciones, subscriber inverso | El subscriber inverso abre **un turno por evento de negocio** ([`events.ts:63`](../apps/server/src/kernel/subscribers/events.ts#L50)): `task.completed` + `sop.completed` + `state.changed` generan tres turnos sintéticos sin agrupar. Además `safeParse` sin `actorId` (schema obligatorio) hace que muchos eventos no abran turno. No hay consumidor que alimente contexto |
| **Meta** | Dos implementaciones | Ver P0-5 |
| **Presentación** | `Presenter` con score rol/confianza/atención | Se ejecuta antes de que exista la respuesta y su salida de cierre se descarta |

### El bucle que debería existir

```
persona + turno + consulta
        │
        ├── contexto: rol/persona, entidad, relaciones, eventos
        ├── memoria: recall + learning facts
        ├── grafo: últimos N turnos de la persona + top atención
        └── meta: hints vigentes del store (no recalculados)
        ▼
   prompt compuesto (una función, siete llamadores)
        ▼
   modelo (spec real registrado)
        ▼
   respuesta → grafo (primero) → presenter (después) → promoter
        ▼
   meta.evaluate → store → siguiente turno
```

Hoy el bucle se corta en dos sitios: el grafo no vuelve al prompt y la meta no sobrevive al turno.

---

## 5. Laia y Marcos · diseño de cableado

### Decisión de arquitectura: un compilador de prompt

Crear **un** módulo pequeño (p. ej. `engine/agents/persona-prompt.ts`) con una firma única:

```ts
composePersonaPrompt({
  persona?,            // AgentPersona + AgentStats + activación
  role?,               // AgentRole legado
  turnContext,         // ContextPackage
  graphContext,        // turnos/atención recientes de la persona
  metaHints,           // del store, vigentes
  budget,              // tokens por bloque
}): { system: string; dataBlock: string }
```

Reglas: identidad y tono primero; datos después, siempre marcados «datos, no instrucciones»; presupuesto por bloque; sin prompt por persona escrito a mano. Los siete llamadores lo consumen; los que no tengan persona reciben el prompt base actual. Esto elimina la divergencia de voces sin reescribir cada ruta. Contrato de preservación: sin persona seleccionada, `composePersonaPrompt` devuelve el prompt Laia actual sin reordenar ni reescribir una línea; la persona solo añade capas cuando existe y está habilitada.

### Laia en el chat principal

1. **Un solo registro.** Eliminar el registro de `index.ts` y cargar en `app.ts` con `bootstrapAllPersonas(registry, ["default", "_example"])`, o pasar `clientsDir` correcto por tenant. Aceptación: `GET /api/agent-personas` devuelve `laia` en el tenant que la tenga.
2. **Stats por defecto.** Quitar el `continue` de `bootstrap.ts` y usar el default que ya construye el loader. Aceptación: la Laia de `agntia` aparece.
3. **Activación con owners.** El bootstrap recibe los owners del tenant (membership) o `loadInstalledPersonas` marca `owners` al instalar. Aceptación: `canStartWork(tenant, "laia", { owner })` es `allowed`.
4. **UI → persona.** Selector que envía `state.personaId`; el servidor resuelve persona registrada y habilitada, pone `ctx.personaId`, `runtime.roleId = personaId` y compone prompt. `roleId` sigue funcionando como compatibilidad.
5. **Delegación con identidad.** `delegate_task` inyecta `requestedBy: personaId`, `roleId`, y valida `canStartWork` antes de `createTask`.

Aceptación de Laia: en el chat principal, un turno con `personaId: "laia"` (a) abre turno con `personaId`, (b) el prompt contiene su tono y ámbito, no «Laia asistente personal», (c) la respuesta se escribe como `response` con `actor.personaId = laia`, (d) una persona deshabilitada o sin owner devuelve error explícito, no un prompt genérico.

### Marcos como operador del runtime

1. **Contrato.** Añadir `personaId` y `operatorId` a `AgentRuntime`; `spawn` los recibe y los emite al bus.
2. **Quién lo lanza.** El worker, al ejecutar una SOP con `assignedTo: "marcos"`, abre runtime con `personaId: "marcos"`, `taskId` y `sopId`; el chat sigue abriendo runtime de usuario.
3. **Permiso.** Antes de spawn, `registry.canStartWork(tenant, "marcos", { owner, sopId })`. Deshabilitado → `persona_deshabilitada`, como ya especifica la campaña 09.
4. **Cierre.** `complete`/`fail` en `finally`, con `durationMs`, turno y taskId. Aceptación: el evento `agent.runtime_completed` existe y no hay `runtime_failed` por sweep en un flujo correcto.
5. **Supervisión de Laia.** `listTurnsAllPersonas` y `attentionOfPersona` ya existen; falta un resumen prompt-facing («qué está haciendo Marcos») con presupuesto, inyectado solo cuando Laia pregunta por el squad.

Aceptación de Marcos: SOP `investigar-leads` encendida → runtime con `personaId: marcos`, turno con su identidad, ficha persistida, runtime `completed`; con Marcos apagado → rechazo `persona_deshabilitada` y cero llamadas al modelo.

---

## 6. Plan por fases

### Fase 0 · congelar los caminos actuales

Antes de tocar nada: prompt dorado de chat y de tarea, secuencia SSE dorada, ciclo de tarea con lease y recuperación. Si estos tests no existen, cualquier «mejora» puede romper Laia sin que nadie lo note.

### Fase 1 · P0, arreglar la inferencia (sin tocar personas)

| Cambio | Fichero | Aceptación |
|---|---|---|
| Separar primer byte de plazo total | `model-chain.ts`, `conversation.ts` | Un mock que responde a los 3 s completa; no salta al fallback |
| Escribir respuesta antes de presentar; excluir `intent` | `conversation.ts`, `presenter.ts` | El thought `response` contiene el texto del modelo, nunca el del usuario |
| Liberar bulkhead en todos los caminos | `model-chain.ts` | 30 llamadas correctas con límite 10 no degradan al fallback |
| Cerrar runtimes en `finally` | `conversation.ts`, `model.ts` | `agent.runtime_completed` con duración; sweep no encuentra huérfanos |
| Un solo pipeline de meta | `conversation.ts`, `service.ts` | El hint del turno N aparece en el prompt del turno N+1 y expira |
| Registrar el spec real | `model-chain.ts`, `service.ts` | `llm-usage.model` coincide con el proveedor que respondió |

### Fase 2 · Personas (Laia y Marcos)

Registro único, stats/activación, compilador de prompt, `personaId` en chat y delegación, runtime con operador. Aceptaciones de la sección 5.

### Fase 3 · Bucle cognitivo

- `graphContext(ctx, personaId, query)`: últimos turnos + top atención + contradicciones abiertas, con presupuesto y marcas de dato.
- Un turno por *evento agrupado*, no por evento: dedupe por `correlationId` y ventana, o adjuntar al turno abierto del owner.
- `consolidate` deja de ser informe: sus duplicados y negaciones se guardan como estado consultable del siguiente turno.

### Fase 4 · Verificación

- Mock de proveedor que registra **modelo, endpoint, clave y prompt** por tenant. Sin eso, P1-8 no se puede cerrar.
- Snapshot tests del prompt compuesto: una persona, un rol, sin ninguno.
- Test de dos tenants: misma persona, distinto prompt, distinta clave, cero cruce.

---

## 7. Lo que ya está bien y no hay que tocar

- `runWithModelFallback` no reinicia respuestas ya emitidas; el cambio de intento es correcto.
- Circuit breaker por proveedor y timeout de primera respuesta existen y están probados por diseño.
- `Kernel` persiste turnos, thoughts y auditoría con hash chain; el store es durable incluso sin Postgres.
- `Meta` y `Presenter` son deterministas y testeables; el problema es dónde se llaman, no qué hacen.
- `Promoter` tiene destinos explícitos y escribe memoria/grafo/audit; solo le falta que la respuesta llegue antes.
- `PersonaRegistry.canStartWork` ya modela tenant + humano + SOP + enabled: el contrato de Marcos está escrito, falta llamarlo.
- El bus tiene esquema, dedupe, consumidores y replay; el problema es el subscriber inverso, no el bus.

---


## 8. Preservación · los caminos de chat y worker

La base no es el problema a reemplazar: es lo que ya funciona y hay que conservar. Todo lo propuesto en esta auditoría es **integración en costuras**, no sustitución. La regla es dura: si la persona, el grafo o la meta no están, el chat y el worker deben comportarse **exactamente** como hoy.

### 8.1 · Qué se congela

| Camino | Mecanismo actual | Se preserva |
|---|---|---|
| Chat HTTP | `/api/copilotkit/run` → reescritura a `agent/default/run` → `makeRuntime` (`agent.ts`) | Ruta, registro `default`, selección `sample`/`model`/`agui` |
| Chat agente | `ConversationAgent.run`: rate limit → RAG → `systemContext` → rol → cadena → SSE | Orden y contrato de eventos AG-UI (`RUN_STARTED`, `TEXT_MESSAGE_*`, `RUN_FINISHED`) |
| Chat modelo | `modelChain` + `runWithModelFallback` (fast → slow → global → fallback) | Cadena, circuit breaker, fallback y semántica de no reiniciar salida ya emitida |
| Chat cierre | escribir respuesta → Presenter → `closeTurn` → `Promoter` → `Meta` | Secuencia y escritura en el grafo (solo se corrige el orden del P0-2) |
| Worker | `createTask` (idempotencia) → `queued` → `TaskWorker.tick` → `dueTasks` | Idempotencia por clave y ciclo `queued → running → succeeded/failed` |
| Worker lease | CAS con `leaseId` + `leaseUntil`, heartbeat cada `leaseMs/3`, `guard()` con caché de 100 ms, `LostLeaseError` | Reclamo, heartbeat, detección de robo y reencolado |
| Worker durabilidad | `checkpoint()` con CAS sobre el lease; `recoverInterruptedTasks` al arrancar | Reanudación tras reinicio y recuperación de leases expirados |
| Worker trabajo | `planForKind`, executor de SOP, `executeLeadInvestigation`, `prepareFollowUpDraft` | Handlers y sus entradas/salidas |

El worker ya declara a Marcos como agente de la SOP de cualificación (`worker.ts:620`, `LEAD_INVESTIGATION_AGENT = "marcos"`). Esa es la costura natural para su identidad: usarla, no crear un flujo paralelo.

### 8.2 · Dónde se integra lo nuevo

| Costura | Punto exacto | Cambio | Default sin persona |
|---|---|---|---|
| S1 · resolución | antes de `kernelContextSchema.parse` en `conversation.ts:235` | `state.personaId` → persona registrada y habilitada; si no, `roleId` como hoy | Idéntico al actual |
| S2 · prompt | concatenación en `conversation.ts:970` | `composePersonaPrompt(...)`; sin persona devuelve el prompt Laia byte a byte | Idéntico al actual |
| S3 · contexto | `Promise.all` de recuperación + `context.assemble` | grafo y meta como bloques opcionales con deadline | Sin cambios |
| S4 · modelo | `runWithModelFallback` | exponer el spec que respondió para `recordUsage`; cadena intacta | Idéntico al actual |
| S5 · cierre | `writeFastResponse` / `presentText` | escribir antes de presentar; excluir `intent` | Corrige P0-2 |
| W1 · tarea | `createTask` (`service.ts:1278`) | `requestedBy`/`personaId` opcionales; misma clave de idempotencia | Idéntico al actual |
| W2 · runtime | `TaskWorker.run` alrededor del handler | spawn con `personaId`/`operatorId` y cierre en `finally` | `roleId: "agent"` como hoy |
| W3 · prompt de tarea | `model.ts:488` | misma función de composición | Prompt actual byte a byte |
| W4 · permiso | antes de `executeLeadInvestigation` | `canStartWork(tenant, "marcos", { owner, sopId })`; apagado → rechazo sin modelo | Sin persona, sin cambio |

### 8.3 · Reglas de integración

1. **Laia sigue siendo la identidad por defecto.** Laia y Marcos son capas opcionales; nunca sustituyen la voz base cuando no se seleccionan.
2. **Ningún camino nuevo.** No se añade endpoint de chat, ni orquestador, ni cola paralela. Se extienden `ConversationAgent`, `TaskWorker` y `executeModelTask`.
3. **Todo lo nuevo es opcional, con default igual a hoy.** Si falta persona, activación, grafo o meta, el turno continúa con el comportamiento actual.
4. **Fallo de lo nuevo no rompe lo viejo.** Igual que hoy el kernel es best-effort: persona y cognición también. Un error de composición degrada al prompt base, no a un 500.
5. **Contratos intocables:** eventos SSE, lease/CAS del worker, idempotencia de `createTask`, cadena de modelos y aislamiento por tenant.
6. **Los tests de caracterización van primero.** Antes de tocar una costura se congela el comportamiento actual (Fase 0); así «preservar» es una aserción, no una intención.

### 8.4 · Cómo se demuestra que no se perdió nada

| Test | Qué fija |
|---|---|
| Prompt dorado sin persona | Hash del prompt actual de chat y de tarea; cualquier cambio no intencionado lo rompe |
| SSE dorado | Misma secuencia de eventos AG-UI en un turno normal, con y sin persona |
| Ciclo de tarea | `createTask` → claim → checkpoint → `succeeded`, lease limpio; y reclamo tras expiración |
| Persona ausente | Con `personaId` desconocido o deshabilitado: misma respuesta y mismas llamadas que hoy |
| Worker apagado | Marcos deshabilitado: rechazo antes del modelo, cero llamadas, tarea marcada como corresponde |

---

## 9. Latencia · qué cuesta cada pieza y qué regla la mantiene

El compilador de prompt es una función pura sobre unos pocos KB: **menos de 1 ms**. La persona y su activación viven en un `Map` en memoria: **~0 ms**. El coste no está en la solución, está en el IO que ya se paga antes de la primera llamada al modelo.

### Lo que hoy se paga antes del primer token

| Bloque | Coste típico | Evidencia |
|---|---:|---|
| Rate limit | 2–10 ms (1 lectura) | `conversation.ts:840` |
| Kernel: spawn + openTurn + UserAuthor + audit | 15–60 ms (3–4 escrituras) | `conversation.ts:261-290` |
| `memory.recall` nº1 | **80–300 ms** (embedding HTTP + RAG) | `conversation.ts:865` |
| `systemContext` | 10–60 ms (cache 30 s; en frío listas + Meta) | `conversation.ts:902` |
| `context.assemble` | **80–300 ms** (segundo `memory.recall`) | `conversation.ts:948` → `context/engine.ts:124` |
| **Total antes del modelo** | **~200–700 ms p50** | |

Con un rol seleccionado se llama a `memory.recall` **dos veces**: una para `ragContext` y otra dentro de `ContextEngine.assemble`. Cada una hace `embed()` contra Google ([`embeddings.ts:16`](../apps/server/src/engine/embeddings.ts#L16), timeout 15 s) y un `rag.search` que en Postgres sin pgvector recorre `rag-sources` ([`rag.ts:468`](../apps/server/src/engine/rag.ts#L468)). Es el mayor coste fijo del chat y está duplicado.

El plazo de 2 s no reduce esa latencia: la **corta**. Por eso el usuario percibe «no puedo responder» en vez de 700 ms de espera más el modelo.

### Lo que añade la solución

| Pieza nueva | Coste | Cómo se acota |
|---|---:|---|
| Compilar persona + rol | <1 ms | función pura, sin IO |
| Resolver activación | ~0 ms | `Map` del registry |
| Contexto del grafo (últimos turnos + atención) | 5–20 ms | 2 consultas indexadas, en paralelo |
| Leer meta-hints del store | 2–5 ms | 1 `get` por tenant/turno |
| Quitar el `recall` duplicado | **−80 a −300 ms** | una sola recuperación compartida |
| Quitar el recálculo de Meta en cada turno | −10 a −50 ms | leer del store, no recalcular |

Saldo esperado: **entre 100 y 300 ms menos en p50**, no más. El único coste real nuevo es el tamaño del prompt: cada 1.000 tokens de contexto añaden prefill al proveedor (del orden de 10–50 ms según modelo). Por eso el compilador debe llevar presupuesto: persona ~200 tokens, grafo ~300, memoria ~500, meta ~100, y un tope duro de bloque de datos.

### La regla que evita que esto degenere

1. **Un solo `Promise.all` con deadline.** Recuperación, grafo y meta se piden a la vez con `AbortSignal.timeout(300-400 ms)`. Si un bloque opcional no llega, se degrada a vacío y el turno sigue. Nunca se encadenan.
2. **El modelo no espera a bloques opcionales.** Grafo y meta son mejora, no requisito: si tardan, se omiten. La recuperación sí merece espera, acotada.
3. **Nada de `recall` por bloque.** Una recuperación por turno, compartida por chat, rol y persona.
4. **El timeout se separa en dos.** Primer byte para el chat: 6–8 s con fallback inmediato (no 2 s); plazo total: 30–45 s. Un éxito no cambia de latencia; un fallo deja de mentir a los 2 s.
5. **Medir `ttft_ms` desglosado** (rate, kernel, recall, contexto, meta, modelo) y publicar p50/p95. Sin ese dato, cualquier discusión de latencia es opinión.

### Qué NO hacer

- No construir el contexto del grafo recorriendo todos los thoughts del owner: se leen los últimos N turnos de la persona, con índice.
- No inyectar el grafo entero «por si acaso»: el prefill crece y el coste también.
- No mover la recuperación dentro del prompt del sistema como paso previo bloqueante del stream: el primer token debe poder salir aunque el contexto opcional falle.

---

## 10. Límites de esta auditoría

Lectura estática sobre `0c043da`. No se ejecutaron proveedores reales, ni dos tenants con claves distintas, ni una conversación completa con Laia. Los hallazgos P0 se deducen del orden de llamadas y de contadores sin `finally`; se confirmarían con los tests de la fase 1. Los conteos (7 puntos de inferencia, 2 registros de personas, 3 prompts de identidad) salen de `grep` sobre el árbol versionado.

Comandos de reproducción:

```sh
grep -rn "new BuiltInAgent" apps/server/src | wc -l
grep -rn "completeRuntime\|failRuntime" apps/server/src
grep -n "bootstrapPersonas\|personasRoutes" apps/server/src/app.ts
grep -n "releaseBulkhead\|complete: () =>" apps/server/src/engine/model-chain.ts
grep -n "void metaHint\|pendingMetaHints" apps/server/src/engine/conversation.ts
```
