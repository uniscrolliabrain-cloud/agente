# 01 — Auditoría estática de código: evidencias, defectos e incertidumbres

**Corte:** `main@3023637d72994460b1aa4742f558557ec0c69922`. Las referencias a líneas son aproximadas de este corte y deben revalidarse tras cambios. No se han corrido tests, builds, migrations, dispositivos ni pruebas multiinstancia.

## Inventario de rutas y evidencia

| Ruta | Evidencia inspeccionada | Diagnóstico |
|---|---|---|
| `apps/server/src/engine/worker.ts` | `TaskWorker`, `now?: () => number`, `tick()`, `scheduled && nextRunAt <= now`, lease/guard/timeout/backoff | Motor durable reutilizable. Auditar reclamación CAS y ejecución concurrente real |
| `apps/server/src/worker-entry.ts` | `DATABASE_URL` obligatoria, `recoverInterruptedActions`, `recoverInterruptedTasks`, `agent.start()` | Worker desacoplado de API, adecuado para producción |
| `apps/server/src/engine/service.ts` | `start()` arranca `maintain()` inmediatamente y cada 60000ms; evaluación de SOPs | No es scheduler por vencimientos; retrasos y cortes de proceso pueden perder ticks |
| `apps/server/src/engine/sop-triggers.ts` | `parseCron`: every:Nm, every:Nh, daily/weekly/monthly UTC; `evaluateCron` usa minuto actual | No hay zona IANA ni catch-up de ventanas vencidas |
| `apps/server/src/actions-deferred.ts` | Store persistente, `due`, `claim` CAS, cancelación, recibo `executed: true` | Patrón útil; no reutilizar semántica de undo como agenda general |
| `apps/server/src/engine/events/bus.ts` | `globalSubscribers.publish`, `options.notify`, inserción notificación, preferencias `default` | Punto de integración; inconsistencia de claves y post-commit a investigar |
| `apps/server/src/notification-prefs.ts` | `GET/PUT /prefs`, `disabled[]`, registro id `tenantId` | Preferencias simples; no son preferencias individuales por canal/dispositivo |
| `apps/server/src/notifications-stream.ts` | SSE cada 3s; `ctx.actorId`, `ctx.tenantId`, `notificationVisible` | Streaming autenticado; fallback tenant `default` exige revisión fail-closed |
| `apps/server/src/engine/notifications-stream.ts` | `x-user-id` como destinatario | Implementación legacy insegura si se monta; no aparece como mount principal |
| `apps/server/src/app.ts` | `app.route('/api/notifications', notificationsStreamRoutes(agent,tenantService))`; prefs routes | Confirma montaje de versión superior; verificar middleware `ctx` en la ruta |
| `apps/server/src/events-routes.ts` | SSE eventos, heartbeat 15s, replay por rango | Observabilidad y canal online; no entrega background |
| `apps/server/src/engine/cognition/v2/{slow,memory,context,storage}.ts` | funciones `clock = () => Date.now()` | Inyección temporal parcial; no prueba un reloj global |
| `packages/domain/src/sop.ts` | triggers manual/api/cron/email_subject/email_body_match | Contrato de trigger ligado a SOP; falta contrato de Schedule de usuario independiente |

## P0-01: disparos perdidos por ventana
`service.ts` usa intervalo de 60s. `evaluateCron` construye `new Date()` y exige que coincida minuto UTC. Una pausa del proceso, restart, tick tardío, mantenimiento lento o carga de >200 SOPs puede saltarse el minuto. Para `every:Nm`, el módulo de minutos tampoco representa intervalos transcurridos desde la última ejecución; es alineación al reloj UTC. **Solución:** persistir `nextRunAt`, consultar `<= now`, reclamar CAS, decidir política de catch-up (`skip`, `once`, `all` con límite), registrar run.

## P0-02: escaneo de SOPs potencialmente hambriento
`service.ts` (aprox. 679–710) llama `scanByStatusWithCursor('sops',['true'],200,...)` y el propio comentario dice que busca `data.status` inexistente en SOPs. El fallback `scan('sops',200)` no aplica cursor. Por tanto el cursor persistido no garantiza rotación. **Confirmar con test 500 SOPs y verificar cuáles disparan**. Reemplazar por consulta de schedules vencidos con índice y cursor/claim transaccional.

## P0-03: preferencias no coherentes
`notification-prefs.ts` guarda `notification-prefs` con `id=tenantId`, pero `events/bus.ts` consulta `id='default'`. En shared tenant podría ignorar preferencias. Además `disabled[]` parece almacenado por owner+tenant, no actor. **Diseño:** `NotificationPreference(tenantId,userId,channel,eventType,...)`, compatibilidad migratoria, lectura y escritura por mismo repositorio, tests de aislamiento y precedencia.

## P0-04: aislamiento de notificaciones
`notifications-stream.ts` filtra por `ctx.actorId`, pero el fallback `tenantId='default'` y `notificationVisible` asume que una notificación sin tenant pertenece al viewer. Confirmar alcance de `db.list(owner,...)`, migración legacy y fail-closed en shared. `engine/notifications-stream.ts` toma `x-user-id`: bloquear uso directo, revisar imports y tests.

## P0-05: deduplicación y atomicidad
`evaluateCron` crea tarea con `idempotencyKey=sop-cron:id:bucket` y después hace `db.put(lastFiredAt)`. Verificar semántica de `createTask` con dos procesos, rollback, failpoint entre operaciones, owner/tenant en dedupe, política de reintentos. No declarar exactly-once de efectos externos; usar at-least-once + idempotencia por proveedor y receipts.

## P0-06: eventos/notifications post-commit
`events/bus.ts` publica a subscribers y registra dedupe/notificación en `notifyCommitted`. Error marca `POST_COMMIT_NOTIFICATION_FAILED`. El push no debe depender de un callback efímero ni bloquear el evento de negocio: **outbox durable transaccional** y delivery worker idempotente.

## P1: reloj y sincronización
No se localizó endpoint `server-time` ni servicio temporal común. Eso no obliga a introducir daemon de reloj. Diseñar `ClockPort`: `wallNow(): Date` para UTC persistido, `monotonicNow(): number` para medir duraciones; IANA TZ en scheduling; NTP de host/VM monitorizado. `Date.now()` en varios módulos no demuestra desincronización real. Evitar `setInterval` como autoridad de vencimiento.

## P1: push Android
Búsquedas en main sin `PushManager`, `navigator.serviceWorker`, `Notification.requestPermission`, VAPID, FCM, Capacitor. Verificar `apps/web` y ramas `docs/future-android-private-beta`, `campaign/c02-baseline-movil`, `feat/mobile-chat-multimodal-ux`, `feat/voice-avatar-scaffold`. Android Chrome PWA puede usar Web Push con SW, permiso del usuario y suscripción; SSE solo funciona mientras conexión activa. APK nativa puede usar FCM; no duplicar avisos al mismo dispositivo.

## Investigaciones adicionales obligatorias antes de implementar
1. Inspeccionar árbol real y referencias de imports de las dos rutas SSE, auth middleware, RLS/tenant store.
2. Leer `createTask`, `db.compareAndSwap`, `db.insertIfAbsent`, `db.afterCommit`, `EventBus.emit`, worker `dueTasks`, índice y esquema SQL.
3. Auditar `app.ts`, `index.ts`, `worker-entry.ts` para evitar dos loops de `maintain` simultáneos; multiinstancia.
4. Comparar branches activas (c02 móvil, docs beta, mobile-chat, cognition, compliance) con main, registrar SHA y evitar sobrescribir trabajo.
5. Verificar scripts/test runner real y coverage; no fiarse de docs históricos ni de `typecheck-batch.txt`.
6. Auditar permisos notificaciones, CSP, HTTPS, rutas SW, cache, logout y multi-device en frontend.
7. Comprobar hosting Vercel/Fly, service worker scope, configuración PWA y políticas del navegador en dispositivos reales.
8. Verificar política de retención y consentimiento antes de guardar tokens de dispositivo.
