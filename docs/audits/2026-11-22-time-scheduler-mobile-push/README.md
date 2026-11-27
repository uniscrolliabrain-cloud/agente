# Auditoría transversal: tiempo, scheduler y notificaciones móviles — 2026-11-22

**Rama:** `docs/audit-time-scheduler-mobile-push-20261122` · **Alcance:** SOLO DOCUMENTACIÓN. **Base:** `main` SHA `3023637d72994460b1aa4742f558557ec0c69922` (consultado al iniciar). **Evidencia:** inspección remota de archivos y búsquedas de código, NO ejecución local ni prueba en producción. Los documentos legacy no prevalecen sobre código.

## Objetivo
Aprovechar el motor determinista actual para un servicio temporal coherente y notificaciones push móviles en Android/PWA, preservando tenant, actor, autorización, SOP, aprobaciones, event bus, replay, idempotencia y observabilidad. No introducir un segundo scheduler ni una segunda fuente de verdad.

## Lectura obligatoria, en orden
1. `01-EVIDENCIAS-Y-BRECHAS.md`: inventario verificable, riesgos concretos, incertidumbres.
2. `02-ARQUITECTURA-CONTRATOS.md`: contratos TS/Zod, invariantes, arquitectura y decisiones.
3. `03-CAMPANAS-IMPLEMENTACION.md`: campañas secuenciales, rutas, pruebas, gates y handoff.
4. `04-TESTS-OPERACION-Y-SEGURIDAD.md`: matriz adversarial, observabilidad, operación y rollback.

## Hallazgos principales
- `engine/worker.ts` implementa `TaskWorker`, `nextRunAt`, lease, polling, recuperación y guard.
- `engine/sop-triggers.ts` soporta intervalos y daily/weekly/monthly **en UTC**, evalúa únicamente el instante actual y guarda `lastFiredAt` después de `createTask`.
- `engine/service.ts` arranca `maintain()` cada 60s. Su evaluación de SOPs tiene un fallback de 200 filas potencialmente hambriento y cursor de estado no compatible con SOP; requiere prueba y rediseño basado en vencimientos.
- `engine/events/bus.ts` consulta preferencias con id literal `default` mientras `notification-prefs.ts` guarda por `tenantId`; riesgo de preferencias ignoradas en multi-tenant.
- `notifications-stream.ts` montado por `app.ts` usa principal `ctx.actorId`, pero existe implementación legacy `engine/notifications-stream.ts` que confía en `x-user-id`; confirmar inexistencia de otros mounts y retirar/deprecar.
- No se encontraron `PushManager`, `Notification.requestPermission`, `navigator.serviceWorker`, VAPID, Firebase ni Capacitor en búsquedas de código de `main`. Ausencia en búsqueda NO prueba ausencia en ramas.
- `notifications-stream.ts` es SSE con polling de 3s, NO Web Push en segundo plano.

## Prioridad de producto
**P0** seguridad/tenant, vencimientos perdidos, dedupe, outbox; **P1** PWA Web Push Android con permisos explícitos, gestión de dispositivos y deep links; **P2** APK Capacitor/FCM cuando se decida empaquetado. No pedir Firebase ni Google Play para el MVP web.

## Restricciones
No editar `main`; no merge; no deploy; no crear secrets reales; no disparar push real sin consentimiento. Cualquier ruta, firma, módulo o contrato propuesto es diseño hasta validación del agente implementador. Cada campaña exige baseline, patch, tests, reporte y aprobación humana antes de merge.
