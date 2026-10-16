# 03 — Resiliencia

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump worker.ts, service.ts, computer.ts, model-chain.ts, google.ts, código real tras bloques 01-09

## Ontología

LostLeaseError, AbortSignal, ctx.guard(), ctx.checkpoint, outcome_unknown, recoverInterruptedTasks, recoverInterruptedActions, retryWithBackoff, CircuitBreaker, DeadLetterQueue.

## Estado real

TaskWorker con leases CAS, heartbeat cada leaseMs/3, AbortSignal propagado. ctx.guard() antes de cada tool. recoverInterruptedTasks() recupera tareas con lease expirado. recoverInterruptedActions() marca executing como outcome_unknown al arrancar. browser.ts con serial(id, fn).

## Evidencia

Los tests de computer.test.ts que prueban timeout, Stop, quarantine pasan. Los tests de actions.test.ts que prueban outcome_unknown pasan. No hay tests de retry con backoff. No hay tests de circuit breaker.

## Huecos declarados

- Sin retry con backoff.
- Sin circuit breaker.
- Sin dead letter queue.
- Timeouts inconsistentes (30s/45s/90s/300s).
- outcome_unknown no se reconcilia desde la UI.
- recoverInterruptedActions solo al arrancar.

## Huecos profundos (auditoría extendida)

1. **`model-chain.ts` retry sin jitter**: los reintentos entre specs son inmediatos. Con 100 tareas concurrentes, sincronizados.
2. **`firstByteTimeout` de 45s es fijo**: un proveedor lento legítimo tira fallback sin motivo. Configurable por modelo.
3. **Circuit breaker por spec, no por proveedor**: si Google cae, `google/gemini-3.6-flash` y `google/gemini-3.5-flash` tienen circuitos distintos. Falta agrupar por provider.
4. **`recoverInterruptedTasks` sin lock**: si dos procesos arrancan a la vez, ambos intentan recuperar la misma task. Idempotente pero ruidoso.
5. **No hay timeout de shutdown**: `worker.stop()` espera `this.active` vacío sin límite. Con un handler colgado, el proceso no termina.
6. **`child.kill("SIGKILL")` en `runDocker` sin `waitpid`**: el proceso queda zombie hasta que el padre termina.
7. **No hay detección de "proveedor caído globalmente"**: 10 tareas fallan por 500 de Google y no hay alerta.
8. **`ctx.guard()` con cache de 500ms**: si el lease se roba en la ventana, no se detecta hasta el siguiente guard. Bajar a 100ms.
9. **Sin retry selectivo por tool**: `prepare_email` no debería reintentar (efecto externo); `read_workspace` sí. Hoy se tratan igual.
10. **`DeadLetterQueue` sin TTL**: entradas antiguas nunca se limpian. `maintain()` debería purgarlas a los 90 días.
11. **Sin reconciliación automática de `outcome_unknown`**: hay endpoint manual pero nadie reconcilia por defecto. Debería haber un job que consulte al proveedor.
12. **Sin "bulkhead" por proveedor**: si Google tarda 30s, todas las tasks que lo usan se acumulan. Falta pool separado.
13. **`AbortSignal.timeout(30000)` en google.ts hardcodeado**: no respeta `config.toolTimeouts`.
14. **Sin retry de webhook (WhatsApp, Stripe)**: si el webhook falla, no hay reintento. Se pierde el evento.
15. **`process.exit(1)` en `shutdown` sin drain**: si el drain tarda, se mata el proceso. Debería haber timeout de drain.
16. **Sin "graceful degradation"**: cuando el LLM falla, `ConversationAgent` no ofrece un modo degradado (solo el fallback de modelChain).
17. **`recoverInterruptedActions` solo al arrancar**: hay que hacerlo periódico.
18. **Sin retry en `Files.import`**: un `readFile` transitorio no se reintenta.
19. **`retryWithBackoff` no acepta `maxTotalTimeMs`**: un operation con 8 intentos y backoff de 30s puede tardar 4 minutos. Falta tope duro.
20. **Sin test de "proveedor caído durante 5 minutos"**: no hay test que verifique que el sistema sigue funcionando sin Google.

## Interrelación

Depende de 05, 06, 20, 21, 22. Comparte worker.ts con 05, service.ts con 06.

## Riesgos

Proveedor caído tumba el worker por reintentos infinitos. outcome_unknown no reconciliado ejecuta dos veces. Worker muerto no libera el lease.

## Tipo de fixes

Retry con backoff por handler. Circuit breaker por dominio. Dead letter queue con TTL. Timeouts configurables por tool. Reconciliación de outcome_unknown periódica. Bulkhead por proveedor. Retry selectivo por tool. Drain con timeout.
