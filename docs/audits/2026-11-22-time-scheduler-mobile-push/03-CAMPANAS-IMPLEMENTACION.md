# 03 — Campañas ultragr anulares de implementación (solo plan)

Cada campaña: **preflight → evidencia SHA/archivos → contrato → patchset mínimo → tests → audit → reporte → aprobación**. El agente implementador no ejecuta deploy ni merge sin autorización. Rebase consciente de trabajo paralelo; jamás sobrescribir archivos ajenos. Un branch por campaña; mantener manifiesto de paths y conflictos.

## C00 — Baseline y conciliación de ramas (solo lectura)
**Objetivo:** inventario verificado de main y ramas. Leer `main`, `campaign/c02-baseline-movil`, `docs/future-android-private-beta`, `feat/mobile-chat-multimodal-ux`, `feat/voice-avatar-scaffold`, `feat/cognition-v2-runtime-C00-C15`, `docs/observability-dogfooding-audit-20261117`. Comparar commits y árbol; buscar service worker, manifest, FCM, schedule, time, notification. Confirmar rutas montadas, scripts y tests. **Entregables:** matriz existe/parcial/legacy/no localizado, SHA por branch, mapa import/call graph, deuda y no-colisión. **Gate:** cada afirmación con archivo y línea.

## C01 — Reproducir defectos antes de tocar código
**Foco:** `service.ts`, `sop-triggers.ts`, `events/bus.ts`, `notification-prefs.ts`, `notifications-stream.ts`, DB.
1. Fake clock: tick en 08:59, siguiente 09:02 para SOP diario 09:00: documentar pérdida.
2. 500 SOPs, 200 primeros no relevantes, SOP 450 due: medir starvation.
3. Dos workers evaluando mismo SOP mismo minuto: medir tareas duplicadas.
4. Tenant A/B preferencias diferentes: demostrar lookup `default` vs `tenantId`.
5. Principal A con cabecera `x-user-id=B`: verificar ruta montada y negar acceso.
6. Simular crash entre `createTask` y `lastFiredAt`.
**Gate:** tests rojos controlados con nombres y stack; si alguno ya pasa, documentar por qué.

## C02 — Tiempo y recurrencias
**Objetivo:** introducir `ClockPort`, validación TZ y `nextRunAt` persistido sin romper cron legacy.
**Paths candidatos:** `packages/domain/src/schedule.ts`, `engine/time/*`, migración SQL del store real, tests time.
**Pasos:** localizar librerías existentes; Zod; índice due; generador next occurrence; DST; catch-up; feature flag; pruebas 10 zonas horarias, hora repetida/omitida, febrero, cambio verano/invierno.
**Gate:** 100% tests de casos calendario y regresión cron.

## C03 — Claim, atomicidad y compatibilidad
**Objetivo:** scheduler durable reusando `TaskWorker` y `SOPExecutor`, sin loop paralelo.
**Pasos:** claim por tenant, idempotencia UNIQUE run, lease, checkpoint, transacción run/task/outbox; revalidar authz y suspensión; metrics; backpressure. Migrar SOP triggers mediante adapter; dual-read solo si evita duplicados; rollback por flag.
**Gate:** dos workers simultáneos, reinicio a mitad, crash injection, 500/500 SOPs, 0 runs perdidos fuera de política de catch-up, ningún side effect duplicado bajo contrato idempotente.

## C04 — Arreglar preferencias, destinatarios y seguridad
**Objetivo:** un repositorio canónico de prefs por tenant/user/channel/eventType.
**Pasos:** inventariar registros legacy; migración reversible; reemplazar `'default'` en bus; eliminar fallback a tenant `default` en shared; verificar `ctx` autenticado; desactivar ruta SSE legacy; filtrar por destinatario; endpoints PDP + rate-limit.
**Gate:** tests HTTP multi-tenant/multi-user; usuario A no puede leer/escribir prefs de B ni suscripciones de B; revocación efectiva.

## C05 — PWA Web Push de extremo a extremo
**Objetivo:** primer aviso Android con app cerrada.
**Pasos:** confirmar PWA actual; añadir manifest/icons/SW versionado sin romper assets; permiso tras click; VAPID keys en Doppler; subscribe/unsubscribe; API authz; cifrado endpoint/keys; delivery adapter; manejar 404/410; deep link allowlisted; botón probar notificación solo a propio dispositivo; opt-out y logout.
**Gate:** Chrome Android real: permiso granted/denied, pantalla bloqueada, app cerrada, tap abre tarea autorizada, logout revoca, usuario B no recibe aviso de A. Probar HTTPS en staging, nunca enviar a usuarios reales sin aprobación.

## C06 — Outbox durable + fanout
**Objetivo:** separar registro, evento y entrega.
**Pasos:** crear NotificationOutbox con índice pending, dispatcher con lease, jitter, dead-letter, TTL, receipts, quotas, quiet hours; integrar desde evento post-commit transaccional; SSE conserva UX online; no mandar dos avisos por mismo evento/dispositivo.
**Gate:** crash antes/después de send, reintento proveedor 429/5xx, invalid subscription, backfill, dedupe, observabilidad.

## C07 — UX usuario
**Objetivo:** interfaz calmada: centro de notificaciones, configuración dispositivos, preferencias por tipo, quiet hours, badges, historial, gestión de schedules y pruebas locales.
**Pasos:** integrar en UI existente sin menú adicional redundante; permisos explicados, rechazo respetado, deep link, accesibilidad, móvil y teclado; tests componentes y E2E.
**Gate:** sin popups al cargar, accesibilidad, sesión expirada, offline, múltiples dispositivos.

## C08 — APK Android opcional (NO bloqueante MVP)
**Precondición:** decisión explícita de empaquetar Android. Evaluar Capacitor y compatibilidad web; FCM y POST_NOTIFICATIONS; claves en Doppler; firma APK; canales Android; logout/token rotation; privacidad; distribución beta. **Gate:** APK instalada en dispositivo real, app en background, deep link, tenant switch, token inválido y actualización.

## C09 — Observabilidad, canary y handoff
Dashboard: `scheduler_due_lag_seconds`, `schedule_missed_total`, `schedule_claim_conflict_total`, `push_outbox_pending`, `push_delivery_attempt_total`, `push_delivery_success_total`, `push_invalid_subscription_total`, `push_delivery_latency_seconds`, `clock_skew_seconds`; etiquetas tenant anonimizadas/bounded, sin endpoints ni tokens. Alertas: lag > umbral, backlog creciente, 0 entregas con pending >0, fallos de authz. Canary solo con consentimiento y autorización de deploy. Reportar rollback y evidencia.

## Plantilla obligatoria por campaña
```md
# REPORTE-CXX
Base SHA / rama / worktree / owner:
Objetivo y alcance:
Archivos leídos (línea/evidencia):
Archivos tocados:
Contratos creados/cambiados:
Tests exactos ejecutados + resultado:
Evidencia multi-tenant y seguridad:
Riesgos y deuda:
Rollback:
Conflictos con otras ramas:
Estado: pendiente | implementado | probado | bloqueado
Aprobación humana necesaria para merge/deploy:
```
