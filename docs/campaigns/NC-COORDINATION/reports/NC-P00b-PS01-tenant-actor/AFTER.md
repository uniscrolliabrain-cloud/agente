# AFTER — NC-P00b / PS-01: contexto durable de tenant y actor

| Campo | Valor |
| --- | --- |
| Unidad | NC-P00b / PS-01 |
| Tipo | Implementación (slice mínimo) + pruebas |
| Fecha | 2026-10-31 |
| Base | `main` **4f81f22** |
| Rama | `campaign/nc-p00b-ps01-tenant-actor` |
| Worktree | `C:\Users\Alfonso\Desktop\git hub repos\agente-nc-ps01` |
| PR | **#8** (borrador) |
| Estado | `implemented_pending_review` |

## 1. Qué se ha corregido

El worker ejecutaba cada tarea fuera de un scope de tenant. `TenantScopedStore`
resolvía entonces por membership primaria, así que una tarea creada en la
empresa B por un usuario cuya membership primaria es A escribía `run-events`,
`runs`, `outcome` y eventos en A. El turno del kernel y la cuota se atribuían
también a la membership. Además, `compat` era siempre `"real"` porque
`assignedTo` cae a `owner`.

Cambios, todos aditivos salvo la semántica de `compat`:

1. **Contrato** (`packages/domain/src/agent.ts:73-77`): `AgentTask.requestedBy?`.
   Opcional; no se deriva del owner. Sin cambios en `tenantId`, `assignedTo` ni
   en las firmas de `createTask` / `TaskWorker.run`.
2. **Creación** (`apps/server/src/engine/service.ts:1236-1284`): `createTask`
   lee el scope una vez, lo usa para el límite de tareas y persiste
   `requestedBy` solo si hay `actorId` demostrado. Sin scope, el campo queda
   ausente (no se inventa identidad).
3. **Ejecución** (`apps/server/src/engine/worker.ts:248-256`): `run` abre
   `runInTenantScope({ tenantId: previous.tenantId, actorId })` y delega en
   `runScoped`. El tenant sale de la tarea, no de la membership. `actorId =
   requestedBy ?? assignedTo ?? owner`; `runScoped` conserva la firma privada.
4. **Kernel y cuotas** (`apps/server/src/engine/model.ts:46-52`, `:533-539`):
   `KernelContext.tenantId` y la cuota usan `initial.tenantId` y solo caen a
   `tenantIdFor(owner)` si el registro es antiguo y no lo trae.
5. **Identidad honesta** (`apps/server/src/engine/worker.ts:389-393`):
   `requestingActorId = requestedBy ?? assignedBy ?? owner`; `compat = "real"`
   únicamente si hay `requestedBy`. Un fallback se declara `"legacy"`.
6. **Orden de descubrimiento** (`apps/server/src/engine/worker.ts:181-190`): el
   `put` de `worker-status` pasa a ejecutarse después del `scanByStatus`. Antes,
   el resolver del store registraba el prefijo del tenant de membership antes
   del primer escaneo y `scanByStatus` filtraba por prefijos conocidos.
7. **Reanudación** (`apps/server/src/engine/service.ts:339-380`):
   `recoverInterruptedTasks` hacía el CAS con la owner ya peelada y sin scope,
   así que el store lo resolvía por membership primaria: una tarea `running`
   de otra empresa no se recuperaba y se quedaba colgada para siempre. Ahora el
   CAS y su evento corren dentro del scope de `value.tenantId`.

## 2. Archivos tocados

- `apps/server/src/engine/worker.ts`
- `apps/server/src/engine/model.ts`
- `apps/server/src/engine/service.ts`
- `packages/domain/src/agent.ts`
- `tests/cognition/foundation/task-context.test.ts` (nuevo)
- `docs/campaigns/NC-COORDINATION/reports/NC-P00b-PS01-tenant-actor/AFTER.md`

Diff de código: **+80 / −22** en cuatro archivos de código, más el archivo de
pruebas. No se tocó `app.ts`, `tenant-scope.ts`, `db.ts`, `db-tenant.ts`,
`events/**`, `context/**`, kernel, auth ni canales.

## 3. Pruebas

Archivo `tests/cognition/foundation/task-context.test.ts`, con Store real
(PGlite) y dos tenants sintéticos; sin mocks de Store.

| Prueba | Qué exige | Resultado |
| --- | --- | --- |
| Ejecuta y escribe en el tenant de la tarea | tarea en B, membership A: `run-events` en B, ninguno en A, `compat: "real"`, `requestingActorId` = solicitante, `actorId` = ejecutor | pasa |
| Tarea sin `requestedBy` | se ejecuta en B y emite `compat: "legacy"` | pasa |
| Reanudación | tarea `running` con lease caducado en B, membership A: `recoverInterruptedTasks` la devuelve a `queued` en B y no crea nada en A | pasa |
| Arranque en frío | store nuevo sin prefijos vistos + worker nuevo descubren y ejecutan la tarea de B | pasa |

Comandos y resultados:

```
npx tsx --import ./tests/setup.ts --test --test-timeout=120000 \
  tests/cognition/foundation/task-context.test.ts
# tests 4 / pass 4 / fail 0

npx tsc --noEmit          # exit 0 (incluye tests/**)
npx tsc --noEmit          # apps/worker, exit 0
npx biome check tests/cognition/foundation/task-context.test.ts
# limpio
```

La prueba de reanudación se validó en las dos direcciones: contra `4f81f22`
sin el fix falla con `AssertionError: debe recuperar la tarea de tenant-b`;
con el fix pasa.

`biome check` sobre los cuatro archivos de código sigue reportando hallazgos
anteriores (formato en `model.ts:464-491`, `useTemplate` en
`service.ts:334`/`:2571`/`:2598`, imports sin usar, etc.). Ninguno cae en las
líneas modificadas por este patchset; no se corrigieron para no ampliar el
diff.

### 3.1 Batería de regresión

Ejecutada en serie (`--test-concurrency=1`) para no mezclar PGlite de varios
archivos en el mismo equipo:

| Archivo | Resultado |
| --- | --- |
| `tests/tenant-isolation.test.ts` | pasa (incluye «50 tenants con lectura cruzada imposible» y «scanByStatus no mezcla tenants») |
| `tests/tenant-isolation-extended.test.ts` | pasa |
| `tests/worker-concurrency.test.ts` | pasa (claims únicos, cancelación, leases caducados) |
| `tests/worker-metrics.test.ts` | pasa |
| `tests/task-plans.test.ts` | pasa |
| `tests/engine.test.ts` | pasa |
| `tests/crash-recovery.test.ts` | pasa aislado (45,5 s) |
| `tests/tenant-http-e2e.test.ts` | pasa 5/5 (aislamiento HTTP, `switch-tenant`, `files.import`) |
| `tests/context-engine.test.ts` | pasa 4/4 |
| `tests/tasks-reassign.test.ts` | **falla**: `PORT must be an integer...` — previo |
| `tests/model-worker.test.ts` | **falla**: mismo `PORT` — previo |

Los dos fallos por `PORT=0` se reproducen igual en un worktree limpio de
`4f81f22` sin este patchset: son de entorno, no de PS-01.

`crash-recovery` falló en la primera pasada por concurrencia: el test deja vivo
el subproceso `crash-worker` cuando el claim no llega en 15 s y `node --test`
ejecuta varios archivos a la vez. Aislado pasa en la rama (45,5 s) y en el
baseline (51,2 s). No es una regresión; queda anotado como flake del test en
equipos cargados.

No ejecutado: suite completa (`pnpm test`, 112 archivos, con varios fallos
previos de entorno) y reinicio de proceso real. El límite está declarado en §5.

## 4. Comportamiento observable que cambia

- Los eventos de tareas nuevas desde una petición con scope llevan
  `compat: "real"` y `requestingActorId` = actor del token. Las tareas
  históricas y las creadas sin scope pasan a `compat: "legacy"`; antes casi
  todas se etiquetaban `"real"`.
- La cuota de una tarea se imputa al tenant de la tarea. Un usuario con
  membership A ejecutando en B consume el límite de B.
- `TaskWorker.run` y `recoverInterruptedTasks` ya no resuelven identidad por
  membership para abrir el scope.
- Una tarea de otra empresa que quedó `running` con el lease caducado ahora se
  recupera; antes se quedaba colgada.

## 5. Límites conocidos y desviaciones del BEFORE

1. **`requestedActorKind` no se añadió.** El BEFORE lo proponía
   (`"human" | "agent" | "system"`), pero no tiene consumidor en esta unidad:
   añadirlo sería contrato muerto. `requestedBy` basta para distinguir
   identidad demostrada de fallback. Decisión pendiente para Codex.
2. **`maintainTenant` no se corrigió.** El BEFORE proponía quitar el filtro por
   membership primaria y envolver `maintainOwner` en el scope. Al comprobarlo,
   esa corrección ingenua es incorrecta: `maintainOwner` pagina con
   `scanByStatusWithCursor`, que dentro de `TenantScopedStore` filtra por todos
   los prefijos vistos (`db-tenant.ts:188-208`) y devuelve también filas de A
   con el owner ya peelado. Bajo scope B, `publishOutcome(owner)` resolvería
   `B:owner` para una fila de A. Hace falta un primitivo de scan por tenant en
   `db-tenant.ts`, que está fuera de la allowlist. Se propone **PS-01b**. Lo
   mismo aplica a los otros bucles de `maintain()` que hacen CAS o emiten con
   owners peelados (`pendingActions`, `publishOutcome` en `taskStatusPage`):
   siguen sin scope y entran en la misma unidad.
3. **El filtrado por prefijos de `scanByStatus` sigue siendo estructural.**
   `db-tenant.ts:152-181` solo escanea prefijos ya resueltos por el proceso. En
   un proceso donde solo se ha resuelto A, una tarea de B no se descubre hasta
   que algo registre B. El reordenado de `worker-status` evita una de las vías
   (registrar A antes del primer scan), pero no cierra el problema; también
   requiere unidad propia sobre `db-tenant.ts`.
4. **La prueba de «reinicio» no reinicia el sistema operativo.** Crea un
   `TenantScopedStore` y un `TaskWorker` nuevos sobre el mismo Store, que es lo
   que se pierde en un reinicio (prefijos en memoria y estado del worker). Un
   reinicio de proceso real queda para la verificación de integración.
5. **Timers creados dentro del handler heredan el scope.** El heartbeat se
   limpia al cerrar la tarea; no se observó escritura posterior en las pruebas,
   pero no hay prueba específica de un timer que sobreviva al `run`.
6. **Tareas históricas con `tenantId: "default"`.** El backfill no distingue un
   `default` legítimo de uno de relleno. No se migran ni se reinterpretan.

## 6. Rollback

Revertir el wrapper de `run`, el uso de `initial.tenantId` en `model.ts`, el
campo `requestedBy`, el cambio de `compat` y el reordenado de `worker-status`.
Los datos escritos en el tenant correcto siguen siendo válidos; los eventos ya
emitidos con `legacy` no se reescriben.

## 7. Para la revisión de Codex

1. Confirmar el slice y la base `4f81f22`.
2. Decidir si `requestedActorKind` se añade ahora o se descarta.
3. Aceptar PS-01b (`scanByStatus`/`maintainTenant` con primitivo por tenant en
   `db-tenant.ts`) como unidad separada y reservar sus paths.
4. Confirmar que el cambio de `compat` a `legacy` para tareas históricas es
   aceptable para VS.
5. Decidir si la verificación de cierre exige reinicio de proceso real además de
   la prueba de arranque en frío.
