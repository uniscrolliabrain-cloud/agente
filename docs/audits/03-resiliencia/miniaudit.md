# 03 — Resiliencia

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/server/src/engine/worker.ts, service.ts, computer.ts

## Ontología del área

Conceptos: `LostLeaseError`, `AbortSignal`, `ctx.guard()`, `ctx.checkpoint`,
`outcome_unknown`, `recoverInterruptedTasks`, `recoverInterruptedActions`.

La resiliencia es lo que permite que un fallo puntual no se propague.

## Estado real del código

- `TaskWorker` con leases CAS, heartbeat cada `leaseMs/3`, `AbortSignal`
  propagado por todos los handlers.
- `ctx.guard()` antes de cada tool.
- `recoverInterruptedTasks()` recupera tareas con lease expirado.
- `recoverInterruptedActions()` marca acciones `executing` como
  `outcome_unknown` al arrancar.
- `browser.ts` con `serial(id, fn)` para no pisarse entre requests del
  mismo browser.

## Evidencia

- En `test-full.txt`, los tests de `computer.test.ts` que prueban
  "timeout", "Stop interrupts", "failed Stop keeps commands quarantined",
  "a timeout with unconfirmed Docker cleanup stays quarantined" **pasan**.
  Eso significa que la resiliencia del computer está testeada.
- Los tests de `actions.test.ts` que prueban `outcome_unknown` pasan.
- **No hay tests de retry con backoff**. No hay tests de circuit breaker.
- El test `Docker subprocess uses literal argv, strips provider credentials,
  caps output and bounds hangs` **está skipped en Windows** porque Node
  spawn no ejecuta `.cmd` con shell:false.

## Huecos concretos

- **No hay retry con backoff real**. Las tareas fallan y quedan fallidas.
- **No hay circuit breaker**. Si Google falla, se sigue intentando.
- **No hay dead letter queue**. Las tareas fallidas quedan en `failed`
  sin cola separada.
- **Timeouts inconsistentes**: 30s computer, 45s browser, 90s `llm_generate`,
  300s task model. Son arbitrarios.
- **`outcome_unknown` no se reconcilia desde la UI**. Solo se marca.
- **`recoverInterruptedActions()` no se llama desde un scheduler**. Solo al
  arrancar el proceso.

## Interrelación

- Depende de `05-motor-tareas-durable`, `06-aprobaciones-acciones`,
  `20-computer-sandbox`, `21-browser-worker`, `14-google-drive-gmail`.
- Comparte `worker.ts` con `05` y `service.ts` con `06`.

## Riesgos

- Que un proveedor caído tumbe el worker entero por reintentos infinitos.
- Que un `outcome_unknown` no reconciliado ejecute dos veces días después.
- Que un worker muerto no libere el lease y bloquee la tarea para siempre.

## Tipo de fixes

1. `retry: { attempts: N, backoff: "exponential", baseMs }` por handler.
2. Circuit breaker por dominio (google.com, openrouter.ai, evolution-api).
3. Dead letter queue: `kind="dead-letter"` con motivo.
4. Timeouts configurables por tool en `TenantConfig`.
5. Reconciliación de `outcome_unknown` con endpoint y UI.
