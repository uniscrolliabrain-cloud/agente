# NC-P00 — Solicitudes de puente compartido

> Base: `main` **4f81f22** · Fecha: 2026-10-30 · Estado global: **propuestas**, sin acuerdo de VS todavía.
> Ninguna ficha autoriza a editar. La reserva se activa solo tras aceptación registrada (ver `NC-P00-SHARED-FOUNDATION.md`, «Criterios de cierre»).

## Protocolo

Ciclo: `proposed` → `agreed` → `reserved` → `PR abierta` → `integrated` → `consumers updated` → `released`.
Cada ficha declara paths exactos, firmas antes/después, consumidores, compatibilidad, pruebas, flag y rollback.
Si no hay canal autorizado entre chats, Alfonso transmite la solicitud; el silencio no es aceptación.

---

## NC-BR-001 — Contexto durable de ejecución (tenant + actor)

```yaml
id: NC-BR-001
status: proposed
base_sha: 4f81f22
requester: nc-lead
integration_owner: nc-lead
patchset: PS-01
paths:
  - apps/server/src/engine/worker.ts
  - apps/server/src/engine/service.ts
  - packages/domain/src/agent.ts
  - packages/domain/src/index.ts
satisfies_vs: [VS-01-shared-foundation]
```

**Problema (evidencia).** `createTask` persiste `task.tenantId` desde el scope o la membership (`service.ts:1236,1274`), pero `TaskWorker.tick` escanea y ejecuta sin `runInTenantScope` (`worker.ts:181,242`). El Store scoped resuelve entonces por membership primaria (`app.ts:103`, `tenant.ts:92`), y el actor se reconstruye con `assignedTo ?? roleId ?? owner` marcado como `legacy` (`worker.ts:372`). Tras un reinicio, una tarea creada en la empresa B puede escribir en la A. Es el fallo que VS-01 describe literalmente (`CAMPANA-VERTICAL-AGNTIA.md:70`).

**Cambio propuesto.**

1. `AgentTask` gana campos **opcionales y aditivos**:
   ```ts
   requestedBy?: string;              // usuario/actor que originó la tarea
   requestedActorKind?: "human" | "agent" | "system";
   requestCorrelationId?: string;
   ```
   `tenantId` ya es obligatorio desde `TASK_TENANT_REQUIRED_V1`; no se renombra.
2. `createTask` los rellena desde `ctx`/`currentTenantScope()` y del actor autenticado; si no hay actor demostrado, no inventa: deja `requestedBy` ausente y `compat` explícito.
3. `TaskWorker` envuelve la ejecución:
   ```ts
   runInTenantScope({ tenantId: task.tenantId, actorId }, () => this.run(owner, task))
   ```
   con `actorId = task.requestedBy ?? task.assignedTo ?? owner`, y `task.tenantId` como fuente primaria. La membership solo se usa si el registro es anterior y se marca como `legacy`.
4. `busEvent` y `db` del worker heredan el scope; no se añade un segundo bus ni un segundo worker.

**Antes / después (firma).**

| Antes | Después |
| --- | --- |
| `private async run(owner: string, previous: AgentTask)` | igual, pero invocado dentro de `runInTenantScope` |
| `TaskContext` sin tenant/actor | sin cambio de forma; el scope viaja por ALS |
| `AgentTask` sin actor solicitante | tres campos opcionales |

**Compatibilidad.** Registros antiguos: `tenantId` ya existe (backfill `'default'` documentado en el dominio); `requestedBy` ausente → `assignedTo ?? owner` con `compat: "legacy"`, igual que hoy. No se reescriben tareas existentes.

**Pruebas de aceptación.**

- Usuario con membership en A y B crea tarea en B → tarea, `run-events`, `runs`, `outcome` y eventos quedan bajo `B:owner`.
- Reinicio entre `createTask` y `claim` → sigue en B; no se reconstruye desde A.
- Tarea antigua sin `requestedBy` → ejecuta y se etiqueta `legacy`; no se le atribuye identidad falsa.
- Conexión de A no se usa desde una tarea de B.
- Camino con flag cognitiva apagada: resultados idénticos a hoy.

**Rollback.** Revertir el `runInTenantScope` del worker y los campos aditivos; los datos escritos bajo el tenant correcto siguen siendo válidos.

**Riesgo.** Tareas creadas antes del fix con `tenantId` incorrecto (derivado de membership) seguirán en el tenant equivocado: la migración no puede adivinar el tenant real. Se documentará como límite y se ofrecerá reasignación manual, no automática.

---

## NC-BR-002 — Confirmación explícita de eventos

```yaml
id: NC-BR-002
status: proposed
base_sha: 4f81f22
requester: nc-lead
integration_owner: nc-lead
patchset: PS-02
paths:
  - apps/server/src/engine/events/bus.ts
  - apps/server/src/engine/events/sinks/store.ts
  - apps/server/src/engine/events/index.ts
satisfies_vs: [VS-01-shared-foundation, NC-P02-memory-projection]
```

**Problema (evidencia).** `emit` escribe en el sink y publica en `globalSubscribers`, pero captura cualquier error y solo lo registra (`bus.ts:109,113,146`). Un `await bus.emit(...)` no distingue «persistido» de «fallido»; y la escritura del hecho de negocio y la del evento son statements separados, sin atomicidad (`db.ts:131,158`). Un proyector cognitivo no puede usar `emit` como frontera de confirmación.

**Cambio propuesto (mínimo, sin reescribir el bus).**

- `StoreSink.write(event): Promise<{ id: string }>` (hoy `Promise<void>`), devolviendo la fila insertada; si `insertIfAbsent` no inserta por duplicado, devuelve el id existente.
- `EventBus.emit(...): Promise<SystemEvent | null>` — `null` si dedupe descartó el evento.
- `EmitOptions` gana `strict?: boolean` (default `false`): con `strict: true`, el error se propaga; sin él, comportamiento actual intacto.
- No se añaden tipos de evento, ni outbox, ni transacciones nuevas. La durabilidad cognitiva avanzada (checkpoints, replay de proyección) queda para NC-P02 y no se promete aquí.

**Compatibilidad.** Los ~decenas de llamantes que ignoran el retorno siguen compilando y comportándose igual. Solo el nuevo consumidor usa `strict` y el retorno.

**Pruebas.**

- Sink que falla + `strict: true` → rechaza; sin `strict` → no lanza y registra `event_bus_errors_total`.
- Dedupe con la misma `dedupeKey` → segunda llamada devuelve `null`.
- Replay y `list` siguen leyendo el mismo formato.
- Suite de eventos y rutas existentes en verde.

**Rollback.** Revertir la firma del sink y el flag; el formato persistido no cambia.

**Riesgo.** Convertir `emit` en algo que puede lanzar invita a usarlo como transacción: se documentará explícitamente que **no** hay atomicidad con el efecto de negocio, solo confirmación de escritura del evento.

---

## NC-BR-003 — Instancia única de memoria y contexto por scope

```yaml
id: NC-BR-003
status: proposed
base_sha: 4f81f22
requester: nc-lead
integration_owner: nc-lead
patchset: PS-03
paths:
  - apps/server/src/app.ts
  - apps/server/src/engine/service.ts
  - apps/server/src/engine/memory.ts
  - apps/server/src/engine/context/engine.ts
satisfies_vs: [VS-01-shared-foundation, NC-P01-contracts]
```

**Problema (evidencia).** Hay dos `MemoryService`: `app.ts:183` sobre Store crudo (usada por `ContextEngine`) y `service.ts:245` sobre `tdb` (usada por chat, tools, SOPs y promoción). `BusinessGraph` también va sobre Store crudo (`app.ts:168`). El recall del contexto lee un namespace distinto del que escribe la promoción (F1/F2 del mapa).

**Cambio propuesto.**

1. Construir **una** `MemoryService` con `tdb` en `app.ts` y pasarla a `ContextEngine` y a `AgentService` (nuevo campo opcional `memory` en el objeto `business`).
2. `AgentService` reutiliza `business.memory` si existe; si no, mantiene su construcción actual (compatibilidad para tests y composiciones antiguas).
3. `BusinessGraph` recibe `tdb` en `app.ts` (hoy `db`).
4. **Política de registros antiguos** (obligatoria antes de mergear): `MemoryService` gana lectura de respaldo del Store plano durante una ventana explícita, marcando cada hit con `origin: "scoped" | "legacy"`; y un script de migración idempotente copia `memories` planas a `tenant:owner` sin borrar el original. Sin esta política no se cambia el namespace.

**Compatibilidad.** API pública de `recall`/`searchMemories`/`remember` intacta (`memory.ts:90,110,191`). `RecallResult` gana un campo opcional `origin` por hit, no obligatorio.

**Pruebas.**

- Memoria escrita por `service.memory.remember` es visible en el siguiente `ContextEngine.assemble`.
- Memoria legacy plana sigue recuperable durante la ventana y marcada como `legacy`.
- Migración ejecutada dos veces no duplica.
- Dos tenants con el mismo `owner` no se cruzan.

**Rollback.** Volver a inyectar el Store crudo y desactivar el respaldo legacy; los datos migrados no se borran.

**Riesgo.** Cambiar el namespace sin migración haría invisibles memorias existentes. Por eso el punto 4 es condición de merge, no un extra. Además, `BusinessGraph` y `ContextEngine` declaran hoy `db: Store` (`business/graph.ts:56`, `context/engine.ts:53`): inyectar `tdb` exige ampliar el tipo o un adaptador mínimo, con `tsc` como evidencia y sin casts ciegos.

---

## NC-BR-004 — Exportación del contrato compartido de cognición

```yaml
id: NC-BR-004
status: proposed
base_sha: 4f81f22
requester: nc-lead
integration_owner: nc-lead
patchset: PS-04
paths:
  - packages/domain/src/index.ts
  - packages/domain/src/cognition.ts   # nuevo, propiedad NC
satisfies_vs: [VS-04-panel]
```

**Problema.** Los contratos cognitivos necesitan un punto canónico de importación para NC y VS. `packages/domain/src/index.ts` es compartido.

**Cambio.** Exportar desde `index.ts` solo lo que VS consuma (por ejemplo `CognitiveRunSummary` e `ExecutionContext`), no el catálogo completo. `cognition.ts` es del jefe NC; VS lo lee.

**Compatibilidad.** Exportaciones aditivas; sin renombrar tipos existentes.

**Pruebas.** `tsc --noEmit` y un test de contrato que importe desde el barrel.

**Rollback.** Quitar los exports; los módulos siguen importando por ruta directa.

---

## NC-BR-005 — Montaje de rutas cognitivas (diferido)

```yaml
id: NC-BR-005
status: draft
base_sha: 4f81f22
requester: nc-lead
integration_owner: nc-lead
patchset: NC-P07
paths:
  - apps/server/src/app.ts
```

**Problema.** Los inspectores cognitivos necesitan montaje, autorización real y flag. No es necesario para P00–P02.

**Decisión.** Se pospone a NC-P07. No se crea `cognition-routes.ts` con montaje activo en esta fase. Si se crea el archivo, queda sin registrar en `app.ts` hasta el puente.

---

## NC-BR-006 — Flag de capacidad cognitiva (diferido)

```yaml
id: NC-BR-006
status: draft
base_sha: 4f81f22
requester: nc-lead
integration_owner: nc-lead
patchset: PS-04
paths:
  - apps/server/src/config.ts
  - .env.example
```

**Problema.** Toda capacidad nueva debe nacer apagada y ser equivalente a hoy.

**Decisión.** Se propone `COGNITION_ENABLED=false` leída en `Config`, con default `false`; sin tocar `tenancy`, auth, DB ni despliegue. Se activa por tenant/entorno en P07. Hasta P01 no se implementa.

---

## Resumen de estado

| ID | Tema | Patchset | Estado | Bloquea a |
| --- | --- | --- | --- | --- |
| NC-BR-001 | tenant/actor durable | PS-01 | proposed | VS-01, NC-P02 |
| NC-BR-002 | confirmación de eventos | PS-02 | proposed | NC-P02 |
| NC-BR-003 | memoria/contexto único | PS-03 | proposed | NC-P03 |
| NC-BR-004 | barrel de dominio | PS-04 | proposed | panel VS-04 |
| NC-BR-005 | rutas cognitivas | NC-P07 | draft | — |
| NC-BR-006 | flag cognitiva | PS-04 | draft | — |
