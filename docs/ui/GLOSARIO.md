# Glosario - Campaña UI/UX

> **UI_CAMPAIGN_04_GLOSARIO_V1**
>
> Términos que aparecen en los docs y en el código. Sirve para que cualquiera
> (humano o IA) entienda sin tener que buscarlos.
>
> Última actualización: 2026-10-03.

---

## Términos del dominio

**AgentTask** - tarea durable del agente. Estados: `queued`, `running`, `waiting_approval`, `waiting_input`, `scheduled`, `paused`, `succeeded`, `failed`, `cancelled`. Tiene `plan` (lista de `TaskStep`), `evidence`, `state`, `artifactIds`.

**TaskStep** - un paso del plan de una tarea. `status`: `pending`, `running`, `succeeded`, `failed`, `waiting`.

**SOP** - Standard Operating Procedure. Pipeline declarativo JSON. `steps` con `tool` de un enum cerrado, `allowedTools`, `trigger` (`manual`, `api`, `cron`, `email_subject`, `email_body_match`).

**Skill** - script Python en `/workspace/skills/<id>/` del sandbox Docker. Se instala al primer uso.

**ActionProposal** - propuesta revisada (email, calendar, drive). Tiene `hash`, `expiresAt`, `status`. Requiere aprobación.

**AgentRole** - rol del equipo digital. Campos: `id`, `name`, `tone` (`warm`/`concise`/`thoughtful`), `avatar` (`sky`/`sand`/`lilac`), `objetivo`, `sops`, `memories`, `permissions` (opcional).

**AgentMemory** - hecho curado. Campos: `id`, `text`, `source`, `category` (opcional), `tags` (opcional), `roleId` (opcional), `createdAt`.

**MemoryCategory** - `empresa`, `cliente`, `proceso`, `preferencia`, `rrhh`, `producto`, `otro`. Los roles usan `rol-identidad`, `rol-dominio`, `rol-preferencias`, `rol-historial` (que el schema del backend NO acepta hoy).

**BusinessEntity** - entidad del Business Graph. `type`, `name`, `status`, `properties`, `provenance` (`source`, `actor`, `updatedAt`, `confidence`).

**BusinessRelation** - relación entre dos entidades. `fromEntityId`, `toEntityId`, `type`, `properties`, `provenance`.

**Project** - agrupación temática. `name`, `blocks`, `linkedMemoryIds`, `linkedArtifactIds`.

**Thread** - conversación del chat. `id`, `title`, `messageCount`.

**SystemEvent** - evento del bus. 40+ tipos. `id`, `schemaVersion`, `tenantId`, `owner`, `type`, `emittedAt`, `source`, `correlationId`, `causationId`, `payload`.

---

## Términos de la UI

**ViewSpec** - spec JSON validado con Zod que el backend genera y el frontend consume. Discriminated union por `kind`. Los kinds: `dashboard`, `queue`, `inbox`, `board`, `table`, `detail`, `form`.

**ViewResolver** - decide qué ViewSpec servir según la intención del usuario. Hoy es un stub con regex. En D2 se reescribe con intenciones cerradas.

**ViewRenderer** - componente React que mapea `spec.kind` a componente. Con `assertNever` para garantizar exhaustividad.

**LiveItem** - item de sidebar que "vive". 6+3 estados: `idle`, `counter`, `progress`, `pulse`, `timer`, `alert`, `error`, `stale`, `queued`, `done`. Regla: uno a la vez. Franja de 18px.

**LiveActivity** - tipo del dominio (`packages/domain/src/live.ts`). Union de 9 variantes.

**pickPrimary** - función pura que, dado un array de `LiveActivity`, devuelve la ganadora por prioridad. Prioridad: `alert > error > stale > pulse > progress > counter > timer > queued > done`.

**useLiveActivity** - hook que consume `/api/events?since=` con polling y aplica `applyEvent` para construir el Map de actividades vivas.

**applyEvent** - reducer puro que traduce `SystemEvent` a `LiveActivity`.

**useNow** - hook con `useSyncExternalStore` que da un `Date.now()` compartido con un solo `setInterval`.

**usePanel** - hook con `localStorage` para persistir el estado de los paneles plegables.

**useTypewriter** - hook que consume el stream SSE. Velocidad adaptativa: 40 a 600 chars/s según atraso. Respeta `prefers-reduced-motion`.

**toolsReducer** - reducer puro que mantiene la lista de tool calls de un turno. `RUN_STARTED` resetea, `TOOL_CALL_START` añade, `TOOL_CALL_END` cierra.

**ToolCallsGroup** - componente `<details>` con summary vivo ("3 pasos · 8s") y lista de tool calls.

**ProvenanceChip** - chip que indica el origen de un campo (`auto`, `alta`, `media`, `sugerido`, `tu`, `missing`).

**Shell** - contenedor de 3 columnas: sidebar izquierda, main, panel derecho. Plegable. Estado en `localStorage`.

**AppShell** - componente que implementa el shell. `data-left` y `data-right` para el CSS.

---

## Términos del backend

**EventBus** - bus de eventos append-only. `emit`, `list`, `aggregate`. Con `dedupeKey` opcional.

**Store** - abstracción de persistencia (`pglite` o `postgres`). Métodos: `get`, `list`, `listPaged`, `put`, `compareAndSwap`, `insertIfAbsent`, `claim`, `take`, `scanByStatus`, `transaction`.

**TenantScopedStore** - envuelve el Store y compone la clave `tenantId:owner`. Todo acceso de negocio pasa por aquí.

**TenantService** - resuelve el tenantId de un owner. Cachea 5 minutos. Fuente única.

**compareAndSwap** - operación atómica: actualiza solo si el registro tiene un `expected` concreto y aplica un `patch` fusionado. Devuelve el registro actualizado o `null`.

**claim** - operación atómica sobre `actions`: pasa de `awaiting_review` a `executing` (o lo que se indique) y solo uno gana.

**Kernel** - kernel cognitivo. `openTurn`, `openChildTurn`, `appendThought`, `thoughtsOf`, `closeTurn`. Con `Thought`, `Turn`, `AttentionVector`.

**Presenter** - decide qué thought mostrar al usuario. `PRIORITY`: `response > display > confirmation > correction > reasoning > critic > verifier > observation > action > reflection > delegation > query > intent`.

**SOPExecutor** - ejecuta un SOP paso a paso. Con leases, CAS, allowedTools, ciclo, profundidad, ask_user, aprobación.

**ActionService** - propuestas con idempotencia. `propose`, `decide`, `record`. En C3 se integra `DeferredActions`.

**DeferredActions** - gestiona las acciones diferidas (undo de 8s). Con `DeferredStore`, CAS de cancelar, tick periódico, reconciliación al arranque.

---

## Términos de la campaña

**Branch** - unidad de trabajo. Un flujo completo. Con commits ordenados y merge a main al cerrar.

**Fase** - conjunto de branches con objetivo común. A, B, C, D, E.

**Ledger** - registro de ficheros tocados en la sesión actual. Se calcula antes de escribir.

**Marca de idempotencia** - comentario con forma `XXX_V1`, `XXX_V2` que indica que un bloque está aplicado.

**Anchor** - fragmento exacto de código que un bloque reemplaza. Si no coincide, el bloque falla.

---

**Fin del glosario.**