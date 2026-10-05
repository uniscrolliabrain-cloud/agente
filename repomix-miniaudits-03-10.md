This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: docs/audits/03-resiliencia/**, docs/audits/04-multi-usuario-concurrente/**, docs/audits/05-motor-tareas-durable/**, docs/audits/06-aprobaciones-acciones/**, docs/audits/08-bus-de-eventos/**, docs/audits/09-kernel-cognitivo/**, docs/audits/10-fast-slow-llm/**
- Files matching these patterns are excluded: **/node_modules/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
docs/
  audits/
    03-resiliencia/
      miniaudit.md
      roadmap.md
    04-multi-usuario-concurrente/
      miniaudit.md
      roadmap.md
    05-motor-tareas-durable/
      miniaudit.md
      roadmap.md
    06-aprobaciones-acciones/
      miniaudit.md
      roadmap.md
    08-bus-de-eventos/
      miniaudit.md
      roadmap.md
    09-kernel-cognitivo/
      miniaudit.md
      roadmap.md
    10-fast-slow-llm/
      miniaudit.md
      roadmap.md
```

# Files

## File: docs/audits/03-resiliencia/miniaudit.md
```markdown
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
```

## File: docs/audits/03-resiliencia/roadmap.md
```markdown
# Roadmap — 03 resiliencia

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Un fallo aislado no puede tumbar el sistema. "Recuperar sin duplicar".

## 2. Estado verificado
- Leases CAS, heartbeat, AbortSignal propagado.
- recoverInterruptedTasks y recoverInterruptedActions al arrancar.
- Fuente: repodump worker.ts, service.ts, computer.ts.

## 3. Huecos contra producción
- Sin retry con backoff.
- Sin circuit breaker.
- Sin dead letter queue.
- Timeouts inconsistentes (30/45/90/300s).
- outcome_unknown sin reconciliación.
- recoverInterruptedActions solo al arrancar.

## 4. Objetivo
Tres fallos consecutivos de un proveedor no rompen el sistema.
outcome_unknown reconciliable en <1 minuto.

## 5. Fronteras
- No chaos engineering.
- No multi-región.

## 6. Conexiones
- Depende de: 05, 06, 20, 21, 22.
- Dependen de esta: 06, 22.

## 7. Principios del PRODUCT.md
Tareas durables.

## 8. Cómo se verifica el cierre
- Mock con 500 en 10 llamadas: backoff y luego circuit breaker.
- Reconciliación de outcome_unknown con endpoint y UI.
- Dead letter queue con 10 tareas.
```

## File: docs/audits/04-multi-usuario-concurrente/miniaudit.md
```markdown
# 04 — Multi-usuario concurrente

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump db.ts, threads-routes.ts, projects-routes.ts, código real tras bloques 01-09

## Ontología

compareAndSwap, insertIfAbsent, updatedAt, conflict, sesión, presencia, edit lock.

## Estado real

compareAndSwap protege contra carreras a nivel de record. insertIfAbsent cierra carreras de creación. threads-routes.ts y projects-routes.ts exponen PUT que pueden pisarse. No hay detección de conflicto en el cliente.

## Evidencia

Los tests de actions.test.ts prueban "concurrent approval consumes the proposal only once" y "concurrent idempotent proposals retain a single persisted review". Ambos pasan. No hay tests de dos usuarios escribiendo el mismo thread.

## Huecos declarados

- Sin locks de edición.
- Sin avisos de "otro usuario está editando".
- Sin reconciliación de conflictos.
- Sin rate limit por usuario.
- Sin presence service.

## Huecos profundos (auditoría extendida)

1. **`conversations` PUT hace `db.put` sin CAS**: dos usuarios pisándose en el chat. Implementado en fix 04-01 pero solo si el cliente envía `expectedUpdatedAt`.
2. **`projects` PATCH hace `db.put` sin CAS**: fix 04-02 con la misma limitación.
3. **`blocks` PUT hace `db.put` sin CAS**: fix 04-03.
4. **`memories` POST hace `compareAndSwap({})`**: expected vacío = siempre gana. No protege contra carreras.
5. **`goals` PATCH usa `db.put`**: fix 04-02 no lo cubre.
6. **`agent-settings/identity` POST**: fix existe pero sin CAS real.
7. **Sin optimistic locking en `notifications`**: dos usuarios marcando leída la misma notificación es idempotente pero sin verificación.
8. **Sin ETag / If-Match HTTP estándar**: en vez de `expectedUpdatedAt` custom, se podría usar el header estándar.
9. **`presence` en proceso único**: el PresenceService es in-memory. Con 2 réplicas, dos usuarios en réplicas distintas no se ven.
10. **`edit-lock` in-process**: mismo problema. Con 2 réplicas, no hay coordinación.
11. **Sin Redis / store compartido para locks**: en producción multi-réplica, faltaría.
12. **Sin WebSocket para presence en vivo**: usa polling (no implementado aún). Latencia 3-5s.
13. **`rate-limit` por usuario in-process**: mismo problema multi-réplica.
14. **Sin quota compartida entre usuarios del mismo tenant**: 5 usuarios × 100 tareas = 500, sin límite del tenant.
15. **Sin notificación de "otro usuario cambió X"**: solo devuelve 409, no avisa proactivamente.
16. **Sin "ver qué cambió"**: el 409 no incluye diff. El usuario tiene que recargar y comparar visualmente.
17. **`threads-routes PUT` no valida que el usuario sea el dueño del thread**: cualquier usuario autenticado con el id puede escribirlo. Falta check de ownership explícito.
18. **`projects-routes PATCH` mismo problema**: falta ownership check.
19. **Sin auditoría de cambios por usuario**: `activity` no guarda quién hizo qué cambio.
20. **Sin "revertir a versión anterior"**: cuando hay 409, no hay forma de recuperar la versión previa del otro usuario.

## Interrelación

Transversal al estado compartido. Comparte db.ts con 05 y 07.

## Riesgos

Cliente con 5 usuarios ve corrupción de datos. Notificaciones duplicadas o perdidas entre usuarios del mismo owner. Presencia en vivo muestra lo que escribe otro.

## Tipo de fixes

updatedAt optimista en PUT. Cliente detecta 409 Conflict y muestra "recarga". Notificaciones dirigidas por userId. Presence service efímero con store compartido. Rate limit por usuario con store compartido. ETag HTTP. Diff en el 409. Ownership check en threads y projects.
```

## File: docs/audits/04-multi-usuario-concurrente/roadmap.md
```markdown
# Roadmap — 04 multi-usuario concurrente

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Dos usuarios a la vez no deben pisarse.

## 2. Estado verificado
- compareAndSwap a nivel de record.
- insertIfAbsent cierra carreras de creación.
- Fuente: repodump db.ts, threads-routes.ts, projects-routes.ts.

## 3. Huecos contra producción
- Sin locks de edición.
- Sin avisos de "otro usuario está editando".
- Sin reconciliación de conflictos.
- Sin rate limit por usuario.
- Sin presence service.

## 4. Objetivo
Dos usuarios en el mismo thread no corrompen estado. El segundo ve 409.

## 5. Fronteras
- No colaboración en tiempo real.

## 6. Conexiones
- Depende de: 05, 07.
- Dependen de esta: ninguna.

## 7. Principios del PRODUCT.md
Tareas durables, memoria curada.

## 8. Cómo se verifica el cierre
- Test con 2 usuarios concurrentes en el mismo thread.
- Notificaciones dirigidas por userId.
```

## File: docs/audits/05-motor-tareas-durable/miniaudit.md
```markdown
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
```

## File: docs/audits/05-motor-tareas-durable/roadmap.md
```markdown
# Roadmap — 05 motor de tareas durable

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Una tarea sobrevive reinicios, no se duplica, no se pierde.

## 2. Estado verificado
- TaskWorker con lease CAS, heartbeat, checkpoint.
- recoverInterruptedTasks al arrancar.
- Fuente: repodump worker.ts, service.ts.

## 3. Huecos contra producción
- this.active sin tope real.
- Sin cuotas por owner en ejecución.
- Sin cancelación real del handler.
- Sin métricas de task.

## 4. Objetivo
Cobertura 100% de casos de lease expirado sin duplicar efecto. Tope real
de concurrencia.

## 5. Fronteras
- No Kafka.
- No sharding entre procesos.

## 6. Conexiones
- Depende de: 08.
- Dependen de esta: 03, 06, 22, 24.
- Archivos compartidos: worker.ts, service.ts, db.ts.

## 7. Principios del PRODUCT.md
Tareas durables.

## 8. Cómo se verifica el cierre
- Test: matar el proceso a mitad, reiniciar, la tarea continúa.
- Tope MAX_ACTIVE respetado con 100 tareas largas.
- Métrica task_duration_seconds visible.
```

## File: docs/audits/06-aprobaciones-acciones/miniaudit.md
```markdown
# 06 — Aprobaciones / acciones

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump actions.ts, actions-deferred.ts, engine/routes.ts, ApprovalModal.tsx, código real tras bloques 01-09

## Ontología

ActionProposal, ActionService, propose, decide, hash, expiresAt, idempotencyKey, outcome_unknown, DeferredActions, signers, needed, executeAt.

## Estado real

ActionService.propose con hash SHA-256 y expiresAt 30 min. decide con compareAndSwap sobre status. ActionProposal con 9 estados. DeferredActions con undo de 8s y dualAt para doble firma.

## Evidencia

Los 12 tests de actions.test.ts pasan (approve, deny, expired, disconnected, concurrent, outcome_unknown, idempotent replay, review con version). Los 6 de deferred-actions.test.ts pasan.

## Huecos declarados

- Reconciliación de outcome_unknown desde la UI.
- Doble firma configurable expuesta.
- Undo de 8s integrado en UI.
- Auditoría visual.
- Reintento controlado.

## Huecos profundos (auditoría extendida)

1. **`propose` con `idempotencyKey` usa `hash(key)` como id**: dos proposals con la misma key en tenants distintos colisionan. Falta prefijo de tenant.
2. **`hash` del payload no incluye `connectionId`**: si el usuario cambia de cuenta Google, el hash sigue siendo el mismo pero la acción cambia de cuenta.
3. **`expiresAt` de 30 min hardcodeado**: no configurable por tenant.
4. **`decide("deny")` es CAS pero no incrementa attempts**: no hay penalización por denegar repetido.
5. **`decide` no permite "reabrir" una acción denegada**: una vez denegada, se crea una nueva.
6. **Sin edición de una acción propuesta**: si el usuario quiere cambiar el subject del email antes de aprobar, tiene que denegar y volver a proponer.
7. **`ApprovalModal` no muestra `expiresAt`**: el usuario no sabe cuándo expira la propuesta.
8. **`ApprovalModal` no muestra `hash`**: cuando cambia, no hay forma de verlo.
9. **Sin historial de acciones en el chat**: la propuesta aparece y desaparece. No hay contexto de "hace 3 días aprobé X".
10. **`DeferredActions.decide` con `dualAt` fijo por proceso**: `config.deferredAction.dualAt` no se usa, es un parámetro del constructor.
11. **`signers` no valida que sea el mismo usuario firmando dos veces con distinto id**: cualquier id sirve.
12. **`executeAt` con `windowMs` de 8s no es configurable por tenant**: hardcodeado.
13. **Sin "notificar al firmante X"**: la propuesta no avisa a los co-firmantes.
14. **`outcome_unknown` no se reconcilia automáticamente**: el job de maintain detecta "executing > 10 min" pero no consulta al proveedor.
15. **Sin "acción preparada por rol"**: `prepare` no guarda qué rol propuso la acción.
16. **`action.failed` no distingue error de negocio vs error de infra**: ambos van al mismo estado.
17. **Sin `retries` explícito**: cuando una acción falla, ¿cuántas veces se puede reintentar? Hoy 0.
18. **`action-audit` no se expone en la UI**: el endpoint existe pero el front no lo consume.
19. **Sin "acción programada visible"**: cuando una acción pasa a `scheduled`, no hay una vista del "va a ejecutarse en 5s".
20. **Sin "cancelar acción en curso"**: una vez ejecutando, no se puede cancelar.

## Interrelación

Depende de 05. Comparte actions.ts con 14, 22, 23. Depende de 08.

## Riesgos

Acción en executing para siempre. Dos usuarios aprueban y ejecuta dos veces. Usuario no ve botón de reconciliar.

## Tipo de fixes

Endpoint POST /api/actions/:id/reconcile. ApprovalModal con outcome_unknown. undoMs y dualAt expuestos por tenant. Test de aprobación concurrente extendido. Métrica outcome_unknown_total. Edición de propuesta. Notificación a firmantes. Config por tenant.
```

## File: docs/audits/06-aprobaciones-acciones/roadmap.md
```markdown
# Roadmap — 06 aprobaciones y acciones

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Nada externo se ejecuta sin aprobación humana.

## 2. Estado verificado
- ActionService con hash, expiresAt, idempotencyKey.
- 9 estados en ActionProposal.
- DeferredActions con undo de 8s.
- Fuente: repodump actions.ts, actions-deferred.ts.

## 3. Huecos contra producción
- outcome_unknown sin reconciliación UI.
- Doble firma no expuesta.
- Undo de 8s no visible.
- Auditoría visual incompleta.
- Sin endpoint de reintento.

## 4. Objetivo
100% de acciones externas con aprobación. outcome_unknown reconciliable
en <1 minuto.

## 5. Fronteras
- No firma criptográfica compleja.
- No multi-nivel de aprobación.

## 6. Conexiones
- Depende de: 05.
- Dependen de esta: 14, 22, 23.
- Archivos compartidos: actions.ts, service.ts.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Endpoint POST /api/actions/:id/reconcile.
- ApprovalModal muestra outcome_unknown con botón.
- Test de aprobación y rechazo por acción.
```

## File: docs/audits/08-bus-de-eventos/miniaudit.md
```markdown
# 08 — Bus de eventos

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump engine/events/*, código real tras bloques 01-09

## Ontología

SystemEvent, SystemEventType, EventBus, EventSink, EventQuery, dedupeKey, correlationId, causationId.

## Estado real

EventBus.emit con Zod. 41 tipos en SYSTEM_EVENT_TYPES. StoreSink append-only con insertIfAbsent. StoreQuery.recent con filtros; aggregate con GROUP BY. dedupeKey opcional con TTL 60s.

## Evidencia

Los tests "todo SystemEventType tiene schema y payload", "EventBus.emit no lanza con ningun tipo", "todo SystemEventType aparece en algun bus.emit" pasan. No hay SSE en vivo. Solo polling cada 5s.

## Huecos declarados

- Sin SSE.
- Solo ReactionEngine lo lee.
- Retención uniforme 90 días.
- Faltan índices para agregados.

## Huecos profundos (auditoría extendida)

1. **`ulid` no expone `timestampOf(id)`**: para ordenar por ULID hace falta parsear el id manualmente.
2. **`dedupeKey` sin TTL variable**: siempre 60s. Un evento de "task status changed" puede repetirse en <60s y perderse.
3. **`dedupe-state` sin límite por owner**: LRU de 64 entradas. Con 100 eventos/s, se pierden claves.
4. **`emit` fire-and-forget con catch silencioso**: si el sink falla, nadie se entera. Debería incrementar un contador.
5. **`StoreSink.write` no valida tenantId**: cualquier tenantId vale. Un bug puede contaminar otro tenant.
6. **`StoreQuery.recent` filtra en memoria**: trae todos los eventos del owner y filtra por tipo/since. Con 100.000 eventos, es lento.
7. **`StoreQuery.recent` con `limit` tope 200**: con 1000 eventos por hora, solo se ven 200. Paginación real necesaria.
8. **`aggregate` con `GROUP BY` sin índice**: cada llamada escanea toda la tabla del owner.
9. **Sin `sinceId` en `recent`**: el cliente no puede hacer polling incremental eficiente.
10. **Sin `system-events` en el índice compuesto `(owner, kind, updated_at)`**: el índice existe pero no filtra por tipo. El agregado sigue lento.
11. **`schema-registry.ts` no se usa en runtime**: solo valida al emitir pero no se expone el registro. `GET /schemas` no lo consume.
12. **`payloadSchemas` con `Record<SystemEventType, ZodTypeAny>`**: si se añade un tipo sin schema, TS falla pero runtime no.
13. **Sin `causationId` consistente**: los emisores rara vez lo pasan. Sin cadena causal real.
14. **Sin `correlationId` propagado automáticamente**: cada emisor lo pasa o no. Inconsistente.
15. **`EventBus` sin dedupe por defecto**: los emisores tienen que acordarse de pasar dedupeKey. Ruido en `system-events`.
16. **Sin "replay" endpoint**: no hay forma de reprocesar eventos históricos.
17. **Sin "snapshot del bus" endpoint**: el operador no puede ver el estado agregado.
18. **Sin `BusSink` alternativo (Kafka, OTel)**: solo StoreSink. Frontera declarada pero sin stub funcional.
19. **Sin test de 1000 eventos/s**: no hay test de estrés del bus.
20. **Sin retención por tipo aplicada**: `retention.ts` existe tras fix 08-03 pero `maintain()` no lo usa hasta fix 08-14.

## Interrelación

Transversal. Alimenta 02, 09, 12.

## Riesgos

system-events crece sin tope. dedupeKey olvidado. Evento escrito y nadie lo lee.

## Tipo de fixes

GET /api/events/stream con SSE. Retención por tipo. Test de dedupe por tipo. Índices para agregados. `sinceId` en recent. `causationId` consistente. Dedupe por defecto. Replay endpoint. Snapshot endpoint. Sink alternativo stub.
```

## File: docs/audits/08-bus-de-eventos/roadmap.md
```markdown
# Roadmap — 08 bus de eventos

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Cada acción del sistema se registra y se puede reconstruir.

## 2. Estado verificado
- EventBus con Zod, 41 tipos, dedupe con TTL 60s.
- StoreSink append-only, StoreQuery con aggregate en SQL.
- Fuente: repodump engine/events/*.

## 3. Huecos contra producción
- Sin SSE en vivo (solo polling).
- Solo ReactionEngine lo lee.
- Retención uniforme 90 días.
- Faltan índices para agregados.

## 4. Objetivo
SSE en vivo. Consumidores reales además de ReactionEngine. Retención por
tipo.

## 5. Fronteras
- No Kafka ni OTel todavía.

## 6. Conexiones
- Transversal.
- Dependen de esta: 02, 09, 12.
- Archivos compartidos: engine/events/*, db.ts.

## 7. Principios del PRODUCT.md
Kernel cognitivo.

## 8. Cómo se verifica el cierre
- GET /api/events/stream con SSE.
- 3 consumidores reales del bus.
- Test de dedupe por tipo.
```

## File: docs/audits/09-kernel-cognitivo/miniaudit.md
```markdown
# 09 — Kernel cognitivo

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump kernel/*, KERNEL_SPEC.md

## Ontología

Kernel, KernelContext, Thought, Turn, AttentionVector, MatchReason,
IgnoreReason, ThoughtRole, Promoter, Rules, Consolidate, Meta, Presenter,
Views.

## Estado real

Kernel con openTurn/openChildTurn/appendThought/closeTurn/thoughtsOf.
StoreTurnStore con closeTurnAndChildren (fix de este pase). StoreAuditStore
con hash chain y CAS sobre anchor. Meta con 4 reglas. Promoter con destinos.
Views con readView.

## Evidencia

StoreAuditStore.verify falla al pasar 10.000 entradas (fix de este pase).
Presenter existe pero conversation.ts no lo llama. Meta.evaluate corre en
maintain() pero nadie lee los hints. Rules.classify no usa attention.

## Huecos

Presenter no wireado. Meta sin consumidor. Rules.ts sin atención.
consolidate no se llama en maintain.

## Interrelación

Depende de 05, 08, 10. Alimenta a 11 y 12.

## Riesgos

Kernel escribe más de lo que se lee. Presenter nunca se cablea. Meta
escribe run-events que nadie limpia.

## Tipo de fixes

Wire del Presenter al SSE. Wire de Meta.evaluate en el chat. Rules.classify
con isFocusedOn >= 0.7. consolidate en maintain cada 5 min. Test end-to-end.
```

## File: docs/audits/09-kernel-cognitivo/roadmap.md
```markdown
# Roadmap — 09 kernel cognitivo

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Cada turno se registra como Thought con AttentionVector. Audit con hash
chain. Grafo compartido.

## 2. Estado verificado
- Kernel con openTurn, appendThought, closeTurn, openChildTurn.
- StoreTurnStore con closeTurnAndChildren.
- StoreAuditStore con hash chain y CAS sobre anchor.
- Fuente: repodump kernel/*.

## 3. Huecos contra producción
- Presenter no wireado al SSE.
- Meta sin consumidor.
- Rules.ts sin atención.
- consolidate no se llama en maintain.

## 4. Objetivo
El kernel decide qué se muestra, no solo lo observa.

## 5. Fronteras
- No cromos ni polaridad todavía.

## 6. Conexiones
- Depende de: 05, 08, 10.
- Dependen de esta: 11, 12.
- Archivos compartidos: kernel/*, conversation.ts.

## 7. Principios del PRODUCT.md
Kernel cognitivo.

## 8. Cómo se verifica el cierre
- Test de SSE que verifica que el Presenter decide el texto.
- Meta hint inyectado en el siguiente turno.
- Rules.classify con isFocusedOn.
```

## File: docs/audits/10-fast-slow-llm/miniaudit.md
```markdown
# 10 — Fast / slow LLM

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump kernel/config/*, conversation.ts, model.ts, model-chain.ts, código real

## Ontología

TenantConfig, ProviderSpec, fast, slow, embeddings, EnvTenantConfigResolver, modelChain, runWithModelFallback, KernelContext.

## Estado real

EnvTenantConfigResolver lee FAST_LLM_* y SLOW_LLM_*. TenantConfig con fast, slow, embeddings. conversation.ts usa el fast (fix de este pase). modelChain con fallback global.

## Evidencia

model.ts no usa el slow. executeModelTask usa modelChain(config), no TenantConfig.slow. recordUsage guarda source pero no velocidad. Sin fallback cruzado.

## Huecos declarados

- model.ts no usa el slow.
- Cuotas por velocidad.
- Fallback cruzado.
- Elección por complejidad (hoy regex).

## Huecos profundos (auditoría extendida)

1. **`modelChain(config)` ignora el tenant config**: lee solo `config.model` global. El tenant no puede tener su propio modelo.
2. **`TenantConfig.fast` y `.slow` sin validación al arrancar**: si la apiKey está vacía, el error aparece en el primer mensaje, no al arrancar.
3. **`EnvTenantConfigResolver` lee envs cada vez**: no cachea. Con 100 turns/min, 100 lecturas de process.env.
4. **Sin caché de TenantConfig por tenant**: cada llamada a `kernel.config(ctx)` recalcula el objeto completo.
5. **Sin fallback fast → slow**: si el fast falla, salta al global, no al slow del tenant.
6. **Sin fallback slow → global**: si el slow falla, salta al global, no al fast del tenant.
7. **Sin medición de latencia por velocidad**: `recordUsage` no distingue fast vs slow. Métricas agregadas sin sentido.
8. **Sin cuotas por velocidad**: un tenant con cuota agotada en fast puede seguir usando slow.
9. **`shouldDelegateToSlow` con regex**: `/(analiza|investiga|prepara|resume|planifica|revisa|compara|estudia|calcula)/i`. Se olvida de idiomas y de contexto.
10. **Sin "cambio dinámico de modelo"**: no se puede empezar en fast y pasar a slow a mitad del turno si el fast no puede resolverlo.
11. **`provider-spec.ts` valida pero el resolver no parsea**: `providerEnv` cae a `"google"` silenciosamente si el valor es raro.
12. **Sin `baseUrl` por tenant**: `providerSpecSchema` lo soporta pero el resolver no lo lee del env.
13. **Sin "modelo por rol"**: un rol podría preferir un modelo distinto (ej. legal usa uno más caro). No implementado.
14. **`fastIdleMs` no se usa en conversation.ts**: `TenantConfig.fastIdleMs` declarado pero el chat no lo consulta.
15. **`quiescenceMs` no se usa en closeTurn**: `TenantConfig.quiescenceMs` declarado pero el kernel no lo aplica al cerrar turnos.
16. **`slowLongMs` no se usa en Meta**: `TenantConfig.slowLongMs` declarado pero Meta usa `longNoOutputMs` hardcodeado.
17. **`maxThoughtsPerTurn` no se usa en StoreTurnStore**: `TenantConfig.maxThoughtsPerTurn` declarado pero el store usa `MAX_THOUGHTS_PER_TURN` constante.
18. **Sin "modo degradado"**: si ambos modelos fallan, el chat devuelve un error técnico, no un mensaje humano.
19. **Sin test de que un tenant con config propia funciona**: no hay test que verifique que el fast del tenant se usa.
20. **`embeddings` en TenantConfig sin usar**: `TenantConfig.embeddings` declarado pero `RagService` usa `process.env.GEMINI_API_KEY` directo.

## Interrelación

Transversal a chat y tareas. Los embeddings usan un tercer modelo.

## Riesgos

Fast y slow comparten cuota. Task tarda 5 min en el slow. Fallback oculta fallos reales.

## Tipo de fixes

executeModelTask con KernelContext y TenantConfig.slow. recordUsage con speed. Fallback fast → slow → global. Cache de TenantConfig. Modelo por rol. Wire de los tiempos (fastIdleMs, quiescenceMs, slowLongMs, maxThoughtsPerTurn).
```

## File: docs/audits/10-fast-slow-llm/roadmap.md
```markdown
# Roadmap — 10 fast / slow LLM

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Dos velocidades con cuotas separadas. El fast habla, el slow trabaja.

## 2. Estado verificado
- EnvTenantConfigResolver lee FAST_LLM_* y SLOW_LLM_*.
- conversation.ts usa el fast (fix de este pase).
- Fuente: repodump kernel/config/*, conversation.ts, model.ts.

## 3. Huecos contra producción
- model.ts no usa el slow.
- recordUsage sin campo velocidad.
- Sin fallback cruzado fast → slow.
- Elección por complejidad es regex.

## 4. Objetivo
Tareas durables usan slow real. Cuotas por velocidad. Fallback explícito
fast → slow → global.

## 5. Fronteras
- No LLM local.

## 6. Conexiones
- Depende de: 09.
- Dependen de esta: 11, 24.
- Archivos compartidos: conversation.ts, model.ts, kernel/config/*.

## 7. Principios del PRODUCT.md
Tareas durables, kernel cognitivo.

## 8. Cómo se verifica el cierre
- Test que verifica que una task usa el slow.
- recordUsage con campo speed.
- Fallback fast → slow → global con mock.
```
