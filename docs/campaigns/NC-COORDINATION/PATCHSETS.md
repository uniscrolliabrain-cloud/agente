# NC-P00 — Patchsets y orden de ejecución

> Base: `main` **4f81f22** · Fecha: 2026-10-30 · Estado: propuesta de NC-P00a.
> NC-P00a entrega documentos. NC-P00b implementa y verifica los fixes compartidos. Ninguna fase se cierra por existir un documento.

## 0. Regla de alcance

- Una PR pequeña por patchset, con allowlist exacta y un solo escritor.
- Nada de megarama, ni árbol de módulos vacío, ni reescritura de EventBus/Store/kernel.
- Toda capacidad nueva nace apagada y con equivalencia del camino anterior.
- Los tests compartidos se leen; no se modifican para aceptar regresiones.

## 1. Secuencia

| Orden | Patchset | Objetivo | Depende de | Habilita |
| --- | --- | --- | --- | --- |
| 1 | PS-00 | Documentos de P00a (este paquete) | — | revisión VS |
| 2 | PS-01 | Tenant/actor durable en tareas | PS-00 aceptado | VS-01, NC-P02 |
| 3 | PS-02 | Confirmación de eventos | PS-01 | proyección cognitiva |
| 4 | PS-03 | Memoria/contexto con un solo Store y puente legacy | PS-02 | NC-P03 |
| 5 | PS-04 | Contratos y flag, apagados | PS-01..03 | NC-P01 |
| 6 | — | Cierre `SHARED-FOUNDATION-CLOSURE.md` | 1–5 + aceptación VS | reanudar vertical |

PS-01 y PS-02 pueden ir en PRs separadas y mergearse en cualquier orden **solo si** no comparten archivos; comparten `service.ts` con PS-03, así que PS-03 espera a ambas.

---

## PS-00 — Documentos de coordinación (esta entrega)

**Allowlist**

- `docs/campaigns/NC-COORDINATION/ARCHITECTURE-MAP.md`
- `docs/campaigns/NC-COORDINATION/FILE-OWNERSHIP.md`
- `docs/campaigns/NC-COORDINATION/BRIDGE-REQUESTS.md`
- `docs/campaigns/NC-COORDINATION/CONTRACT-CANDIDATES.md`
- `docs/campaigns/NC-COORDINATION/PATCHSETS.md`

**Cambio.** Solo documentación. No toca código, tests, configuración ni índices de Cline.

**Aceptación.** Revisión del jefe VS sobre el mapa y las reservas; ninguna afirmación sin evidencia de archivo/línea; paths existentes verificados al SHA base.

**Rollback.** Revertir la PR documental.

---

## PS-01 — Contexto durable de tenant y actor

**Allowlist**

- `apps/server/src/engine/worker.ts`
- `apps/server/src/engine/service.ts`
- `packages/domain/src/agent.ts`
- `packages/domain/src/index.ts`
- `tests/cognition/foundation/task-context.test.ts` (nuevo)

**Cambio**

1. Campos aditivos en `AgentTask`: `requestedBy?`, `requestedActorKind?`, `requestCorrelationId?`.
2. `createTask` los persiste desde el `ExecutionContext` disponible; sin actor demostrado, quedan ausentes.
3. `TaskWorker.run` se ejecuta dentro de `runInTenantScope({ tenantId: task.tenantId, actorId })`.
4. `busEvent` usa el actor restaurado; `compat` se mantiene `"real"` solo si hay actor persistido.
5. Reclamación/reanudación: el scope se reconstruye desde la tarea, no desde `tenantIdFor(owner)`.

**Pruebas**

- `task-context.test.ts`: usuario en A y B; tarea creada en B; reinicio simulado entre create y claim; todas las escrituras (`tasks`, `run-events`, `runs`, eventos) bajo `B:owner`; la conexión de A no se resuelve.
- Regresión: tarea antigua sin `requestedBy` ejecuta y se marca `legacy`.
- Flag cognitiva apagada: resultados equivalentes al baseline.

**Aceptación VS-01**

- Mismo usuario en dos tenants.
- Reinicio entre recepción y ejecución.
- Reanudación de aprobación.
- Rechazo de conexión ajena.

**Rollback.** Revertir el wrapper de scope y los campos; los datos correctos permanecen válidos.

**Riesgo residual.** Tareas históricas con `tenantId` derivado de membership no se pueden corregir por inferencia; se documenta y se ofrece reasignación manual.

---

## PS-02 — Confirmación de escritura de eventos

**Allowlist**

- `apps/server/src/engine/events/bus.ts`
- `apps/server/src/engine/events/sinks/store.ts`
- `apps/server/src/engine/events/index.ts`
- `tests/cognition/foundation/event-confirmation.test.ts` (nuevo)

**Cambio**

1. `StoreSink.write` devuelve `{ id }` confirmado; duplicado devuelve el id existente.
2. `EventBus.emit` devuelve `SystemEvent | null` (`null` si dedupe).
3. `EmitOptions.strict?: boolean` (default `false`): propaga el error solo cuando el consumidor lo pide.
4. Sin cambios de esquema, tipos de evento ni sinks nuevos.

**Pruebas**

- Sink fallido: `strict` rechaza, no estricto registra y no lanza.
- Dedupe devuelve `null`.
- `list`, `aggregate`, `replay` intactos.
- Suite de eventos existente en verde.

**Aceptación.** Un proyector puede distinguir «evento persistido» de «evento descartado/fallido» sin cambiar el comportamiento de los emisores actuales.

**Rollback.** Revertir firmas y flag.

---

## PS-03 — Un solo Store para memoria y contexto

**Allowlist**

- `apps/server/src/app.ts`
- `apps/server/src/engine/service.ts`
- `apps/server/src/engine/memory.ts`
- `apps/server/src/engine/context/engine.ts`
- `apps/server/src/engine/business/graph.ts`
- `scripts/migrate-memory-scope.ts` (nuevo)
- `tests/cognition/foundation/memory-scope.test.ts` (nuevo)

**Cambio**

1. `MemoryService` única con `tdb`; `ContextEngine` y `AgentService` la comparten.
2. `BusinessGraph` recibe `tdb` en el montaje.
3. Lectura de respaldo de memorias planas durante la ventana de migración, con `origin: "legacy"`.
4. Script idempotente de migración `owner` → `tenantId:owner`; no borra el origen hasta cierre de ventana.
5. `AgentService` acepta `business.memory` opcional; sin él, mantiene su construcción actual (tests y composiciones antiguas).
6. **Cambio de firma necesario:** `BusinessGraph` y `ContextEngine` declaran hoy `db: Store` (`business/graph.ts:56`, `context/engine.ts:53`). Para inyectar `tdb` hay que ampliar el tipo a `Store | TenantScopedStore` o introducir un adaptador mínimo. Las dos alternativas tocan archivos compartidos y deben ir en esta allowlist, no colarse en otro patchset.

**Pruebas**

- Memoria escrita por el servicio visible en `ContextEngine.assemble`.
- Memoria legacy recuperable y marcada; migración dos veces no duplica.
- Dos tenants con el mismo `owner` no se cruzan.
- Chat, tool `recall`, form-builder y SOP siguen funcionando.

**Aceptación.** No se pierde ninguna memoria existente; el recall del contexto y la promoción ven el mismo conjunto.

**Rollback.** Volver al Store crudo y desactivar el respaldo; los datos migrados se conservan.

---

## PS-04 — Contratos mínimos y flag apagada

**Allowlist**

- `packages/domain/src/cognition.ts` (nuevo)
- `packages/domain/src/index.ts`
- `apps/server/src/config.ts`
- `.env.example`
- `apps/server/src/engine/cognition/index.ts`, `contracts/execution-context.ts`, `contracts/cognitive-run.ts` (nuevos)
- `tests/cognition/foundation/contracts.test.ts` (nuevo)

**Cambio**

1. `ExecutionContext`, `PersistedTaskContext`, `CognitiveRun` v0, taxonomía de errores.
2. Barrel de dominio con exportaciones aditivas.
3. `COGNITION_ENABLED=false` por defecto; ninguna ruta ni worker lo consume todavía.
4. Sin cromos, sin Jev, sin tarjetas: esos contratos están bloqueados por fuente.

**Pruebas**

- Zod valida y rechaza casos límite (tenant vacío, actor ausente, budget negativo).
- `tsc --noEmit` y lint.
- Con flag apagada, el runtime se comporta igual (test de equivalencia de una ruta existente).

**Rollback.** Quitar exports y flag; no hay consumidores todavía.

---

## 2. Baseline y verificación

Antes de PS-01:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
```

- Registrar el resultado **tal cual**, incluidos fallos previos, con SHA y fecha.
- Un fallo previo no se arregla dentro de estos patchsets: se documenta y se separa.
- Para un patchset concreto: `pnpm test -- tests/cognition/foundation/...` o el runner `tsx --test` que usa el repo (`package.json:22`).

Después de cada patchset:

```bash
git diff --name-only 4f81f22...HEAD
git status --short
```

y comparación contra la allowlist. Cualquier archivo extra detiene la entrega.

## 3. Evidencia de cierre

`SHARED-FOUNDATION-CLOSURE.md` (nuevo, en esta carpeta) debe incluir:

- SHA base y SHA final de cada PR.
- Paths exactos y allowlist cumplida.
- Contratos y firmas antes/después.
- Comandos y resultados de pruebas (sin ocultar fallos).
- Límites conocidos y datos no migrables.
- Rollback probado.
- Aceptación del jefe VS y consumidor/límites del jefe NC.
- Ownership posterior de cada archivo liberado.

## 4. Fuera de alcance de P00

- Ontología cromática (10 dimensiones, 6 polaridades) y tarjetas.
- Jev, gateway semántico y calibración.
- Memoria episódica, grafo asociativo, tiempo bitemporal, escenarios, perspectivas, metacognición, aprendizaje e innovación.
- Rutas e inspectores cognitivos con montaje activo.
- Cambios de auth, DB, despliegue, canales, OAuth o billing.

Todo eso empieza en NC-P01/P02, sobre los contratos y la base compartida cerrada.

## 5. Reglas de parada

- Si aparece un fallo de aislamiento no relacionado: se reproduce, se documenta y se decide con VS; no se arregla «de paso» todo el runtime.
- Si un archivo reservado cambia por otro equipo: se detiene el patchset y se pide reasignación; no se resuelve con un merge silencioso.
- Si una prueba requiere datos de producción o secretos: se sustituye por fixture sintético y se declara la limitación.
- Si la ontología o Jev no tienen fuente verificada: no se implementan; se mantiene el baseline determinista.
