# 05 — Motor de tareas durable

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/server/src/engine/worker.ts, service.ts

## Ontología del área

Conceptos: `TaskWorker`, `leaseId`, `leaseUntil`, `heartbeat`,
`ctx.checkpoint`, `ctx.guard()`, `LostLeaseError`, `AgentTask.status`,
`AgentTask.plan`, `run-events`.

Es el corazón del sistema: todo lo que sea "trabajo en background" pasa por
aquí.

## Estado real del código

- `TaskWorker` con lease CAS y heartbeat cada `leaseMs/3`.
- `checkpoint(patch)` hace `compareAndSwap` con `{ leaseId, status: "running" }`.
- `guard()` verifica que el lease sigue vivo antes de cada tool.
- `recoverInterruptedTasks()` recupera tareas con lease expirado.
- Plan por defecto según `kind`: document (5 pasos), monitor (3), finance (3),
  agent (4).
- `settled()` al cerrar notifica al owner.

## Evidencia

- Los tests de `engine.test.ts` que prueban "two workers claim one task only
  once", "cancellation invalidates a stale worker", "scheduled tasks wait
  for due time" **pasan**.
- El test "expired leases recover saved checkpoints after the database
  restarts" **timeout a 20s**.
- El test "pending reviews do not starve queued work" **pasa**.
- **No hay tests de `Promise.all` con 2000 tareas**.

## Huecos concretos

- **`this.active` sin tope real**. Aunque cada tick mete 3, con tareas
  largas (5 min) y poll 1s, `active` puede acumular cientos.
- **No hay cuotas por owner en la ejecución**. Sí en `createTask` (100 activas),
  pero el worker no las aplica.
- **No hay cancelación real del handler**. `abort()` mata el `AbortController`,
  pero un `fetch` con timeout de 45s no siempre respeta el abort.
- **No hay observabilidad por task**: `task.started`, `task.step`,
  `task.finished` solo como `run-events`, no como métricas.
- **El `heartbeat` no invalida el guard cache siempre**. Hay un `invalidateGuard()`
  pero depende del timing.

## Interrelación

- Es el corazón. Llama a `executeModelTask`, `sopExecutor`, `document`,
  `observe`, `finance`.
- Comparte `worker.ts` con `03-resiliencia`, `db.ts` con `04` y `07`.
- Depende de `08-bus-de-eventos` para emitir `task.*`.

## Riesgos

- Que el lease expire mientras el handler hace una operación larga y otro
  worker tome la tarea. **Duplicación de efecto**.
- Que `checkpoint` falle y la tarea quede en estado inconsistente.
- Que `this.active` crezca sin control.

## Tipo de fixes

1. Guard en `checkpoint` y `guard` que verifique que la operación externa
   se abortó cuando el lease se perdió.
2. Tope real de concurrencia (`MAX_ACTIVE` global).
3. Métrica `openmuse_task_duration_seconds{kind,status}`.
4. Test de crash-recovery.
5. Retry con backoff a nivel de task.
