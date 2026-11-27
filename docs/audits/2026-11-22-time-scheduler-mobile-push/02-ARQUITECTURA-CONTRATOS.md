# 02 — Arquitectura objetivo, contratos y decisiones

## Principios
1. **LLM interpreta; runtime valida y ejecuta.** Laia no mantiene timers, no inventa autorización y no despierta procesos.
2. Un scheduler durable de vencimientos, reutilizando `TaskWorker` y el store Postgres. No añadir Redis/BullMQ/Temporal sin medición de necesidad.
3. UTC para persistencia; IANA timezone para intención humana; reloj monotónico para duraciones. Nunca sumar 24h para «cada día a las 9».
4. Evento de negocio ≠ notificación ≠ intento de entrega. La notificación es persistente y el push es canal best-effort con retries.
5. Cada entidad con `tenantId`, `userId`, `actorId`, `scheduleId`, `runId`, `correlationId`; authz server-side.
6. Default deny; tenant suspendido/usuario revocado/dispositivo desregistrado bloquean nuevos envíos. Sin secretos en repositorio.

## Arquitectura temporal
```text
Chat/REST/UI -> ScheduleService (authz, Zod, TZ, policy)
    -> Postgres schedules (nextRunAt UTC, version, tenant, actor, idempotency)
    -> scheduler claim CAS + lease -> TaskWorker / SOPExecutor
    -> TaskRun receipts + EventBus -> Notification Outbox
                                      -> DeliveryWorker -> WebPush/FCM
                                      -> Notification Inbox + SSE
```

## Contratos de referencia (diseño, NO código existente)
```ts
type Schedule = {
 id: string; tenantId: string; createdBy: string; ownerUserId: string;
 target: {kind:"sop"; sopId:string} | {kind:"task"; templateId:string};
 trigger: {kind:"once"; at:string} |
          {kind:"recurring"; rule:string; timezone:string; dstPolicy:"skip"|"next-valid"|"first"|"second"};
 nextRunAt: string; enabled: boolean; version:number;
 catchUp: "skip"|"once"|"bounded"; maxCatchUpRuns:number;
 createdAt:string; updatedAt:string;
};
type ScheduleRun = {
 id:string; scheduleId:string; tenantId:string; dueAt:string;
 status:"claimed"|"queued"|"running"|"succeeded"|"failed"|"skipped";
 attempt:number; taskId?:string; leaseUntil?:string;
 correlationId:string; receiptId?:string;
};
type PushSubscriptionRecord = {
 id:string; tenantId:string; userId:string; deviceId:string;
 provider:"webpush"|"fcm"; endpointHash?:string; encryptedEndpoint?:string;
 encryptedKeys?:string; encryptedToken?:string;
 permission:"granted"; enabled:boolean; createdAt:string; lastSeenAt:string;
};
type NotificationDelivery = {
 id:string; tenantId:string; userId:string; notificationId:string;
 channel:"webpush"|"fcm"; deviceId:string; status:"pending"|"claimed"|"sent"|"failed"|"invalid";
 attempts:number; nextAttemptAt:string; lastErrorCode?:string;
};
```

**Zod:** `z.iso.datetime({offset:true})`, IANA zone validada con `Intl.DateTimeFormat` o librería TZ existente; tamaños máximos, strict objects, versionado de contratos. Investigar dependencia ya instalada antes de elegir `rrule`, `cron-parser` o Temporal API polyfill. Cron interno legacy debe coexistir durante migración, nunca reinterpretar silenciosamente.

## ClockPort
```ts
interface ClockPort {
 wallNow(): Date; // UTC timestamp persistible
 monotonicNowMs(): number; // duraciones, no persistir
}
```
Inyectar a scheduler y pruebas; `performance.now()` o `process.hrtime.bigint()` para intervalos; no usar tiempo del cliente como autoridad. Host con sincronización NTP y métrica de skew respecto a DB `SELECT now()` (con umbral configurable, sin asumir que DB es un servidor NTP).

## Recurrencia
- `nextRunAt` siempre UTC, derivado de regla + zona local y DST.
- DST: hora inexistente, hora duplicada, fin de mes, febrero, leap year, cambio de zona, edición concurrente.
- `dueAt` es identidad de run: UNIQUE(`tenant_id,schedule_id,due_at`).
- Claim CAS o `FOR UPDATE SKIP LOCKED` si encaja en DB existente; transacción para run + tarea + avance de schedule; outbox.
- Restart: replay bounded de vencidos; backpressure, cuota tenant, max backlog; nunca tormenta de avisos.
- Cancel/disable: revalidación antes del dispatch y antes de side effects. Cambiar horario invalida versiones antiguas.

## Push
**Web:** HTTPS, manifest PWA y service worker de scope restringido, `PushManager.subscribe({userVisibleOnly:true,applicationServerKey})`, clave pública VAPID en cliente y privada en Doppler; API POST/DELETE `/api/push/subscriptions`, GET dispositivos; worker de delivery con biblioteca web-push auditada. Mostrar `Notification.requestPermission()` solo tras interacción explícita; manejar `denied`, `default`, 404/410 y rotación de endpoint. SW recibe `push`, llama `showNotification`, `notificationclick` abre URL interna allowlisted. No abrir URLs arbitrarias desde payload.
**APK futura:** Capacitor + plugin FCM o nativo, token por instalación y usuario, Android 13+ `POST_NOTIFICATIONS`, canal Android, logout revoca registro, token rotation; no requiere publicar Play para APK privada, pero hay que gestionar firma/distribución. Verificar plugins y compatibilidad Android antes de decidir.
**Entrega:** `NotificationOutbox` por destinatario/canal, dedupe de evento, lease, backoff+jitter, TTL, rate limit, métricas. Nunca enviar directamente desde el handler del Event Bus como único mecanismo durable.
**Privacidad:** payload genérico sin PII en pantalla bloqueada; autorización al abrir deep link; no guardar endpoint/tokens en logs; cifrado de secretos en reposo y borrado en logout/desvinculación.
**Preferencias:** por tenant + user + tipo + canal; quiet hours en TZ del usuario, prioridad crítica controlada, opt-in por dispositivo; no inferir consentimiento desde sesión.

## Nuevas rutas propuestas, sujetas a baseline
`packages/domain/src/{schedule,notification-delivery}.ts`;
`apps/server/src/engine/time/{clock,schedule-service,recurrence,due-dispatch}.ts`;
`apps/server/src/engine/notifications/{outbox,dispatcher,webpush-adapter,preferences}.ts`;
`apps/server/src/{schedule-routes,push-routes}.ts`;
`apps/web/public/{manifest.webmanifest,sw.js}`;
`apps/web/src/features/notifications/{PushPermission,DeviceSettings,NotificationCenter}.tsx`.
No crear rutas duplicadas si existen equivalentes en ramas o paquetes.
