# 05 — Motor de tareas durable

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump worker.ts, service.ts, db.ts, código real tras bloques 01-09

## Ontología

TaskWorker, leaseId, leaseUntil, heartbeat, ctx.checkpoint, ctx.guard(), LostLeaseError, AgentTask.status, AgentTask.plan, run-events.

## Estado real

TaskWorker con lease CAS y heartbeat cada leaseMs/3. checkpoint(patch) hace compareAndSwap con { leaseId, status: "running" }. guard() verifica que el lease sigue vivo antes de cada tool. recoverInterruptedTasks() recupera tareas con lease expirado. Plan por defecto según kind (document 5, monitor 3, finance 3, agent 4). settled() al cerrar notifica al owner.

## Evidencia

Los tests de engine.test.ts "two workers claim one task only once", "cancellation invalidates a stale worker", "scheduled tasks wait for due time" pasan. El test "expired leases recover saved checkpoints" timeout a 20s. "pending reviews do not starve queued work" pasa.

## Huecos declarados

- `this.active` sin tope real.
- Sin cuotas por owner en la ejecución.
- Sin cancelación real del handler.
- Sin observabilidad por task como métricas.
- heartbeat no invalida guard cache siempre.

## Huecos profundos (auditoría extendida)

1. **`tick()` corre cada 1s sin backoff**: si la DB está lenta, 1 tick/s es 60 ticks/minuto todos fallando.
2. **`scanByStatus` sin filtro por tenant**: el worker escanea todos los tenants en cada tick. Con 50 tenants son 50× filas.
3. **`eligible.length === 3` hardcodeado**: 3 tareas por tick. Con 1000 tareas queued, tarda 333s en procesarlas.
4. **`MAX_ACTIVE` implementado pero `eligible` todavía limita a 3**: el fix 05-01 sube el límite pero el código deja `eligible.length === 3`. Hmm, ya se subió a 20 en el fix 05-04. Aún así, límite fijo.
5. **`plan` por kind sin detalle**: "Understand the outcome" es vago. El plan no cambia según el input real.
6. **`checkpoint` escribe el plan completo cada vez**: 5 steps + 500 bytes de plan por checkpoint. Con 10 checkpoints por task, 5 KB de escritura.
7. **`run-events` sin tope por task**: una task con 100 eventos acumula 100 filas. `maintain()` los purga a los 90 días, pero la task sigue viva.
8. **`settled` se llama sin verificar que la task no cambió**: entre el último checkpoint y el settled, otro proceso puede haber movido la task.
9. **No hay cancelación de sub-tareas**: una SOP con 50 steps no puede cancelar el step actual a mitad.
10. **`attempts` incrementa en cada `run`, incluso si es un recover**: una task que se recuperó 5 veces tiene attempts=5, sin distinguir recuperaciones de reintentos reales.
11. **`this.active` es un Map sin LRU**: con 50 tasks concurrentes y 500 liberadas, el Map crece sin límite hasta que el proceso termina.
12. **Sin timeout por task**: una task colgada puede durar 5 minutos sin abort. `leaseMs` es 60s, pero el handler no lo respeta.
13. **`worker.stop()` espera sin timeout**: si un handler está colgado, el shutdown nunca termina.
14. **`heartbeat` con `leaseMs/3` fijo**: con lease de 60s, heartbeat cada 20s. Si el DB tarda 21s, se pierde el lease.
15. **`recoverInterruptedTasks` sin notificar**: cuando recupera una task, no emite evento. El operador no lo sabe.
16. **Sin `task.metrics.lastRunDuration`**: no se persiste cuánto duró la última ejecución. Debug imposible.
17. **`scanByStatusWithCursor` sin validación del cursor**: si el cursor es inválido, salta silenciosamente al inicio.
18. **Sin "task takeover"**: si un worker muere y otro quiere tomar su task, no hay protocolo explícito. Solo funciona por el lease expirado.
19. **`plan` se puede modificar en runtime por el handler**: `ctx.checkpoint({plan})` cambia el plan sin auditoría.
20. **`run-events` sin `correlationId`**: cada evento no lleva el id de la request que lo generó.

## Interrelación

Corazón. Comparte worker.ts con 03, db.ts con 04 y 07. Depende de 08.

## Riesgos

Lease expira mientras el handler hace operación larga → duplicación de efecto. checkpoint falla → tarea inconsistente. this.active crece sin control.

## Tipo de fixes

Guard que verifique abort de operación externa cuando el lease se pierde. Tope real de concurrencia. Métrica task_duration_seconds. Test de crash-recovery. Retry con backoff a nivel de task. Timeout por task. Backoff del tick. Cursor validation. Audit del plan.
