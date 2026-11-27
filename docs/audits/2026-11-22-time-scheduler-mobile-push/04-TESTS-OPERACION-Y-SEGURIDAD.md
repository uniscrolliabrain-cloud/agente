# 04 — Tests adversariales, operaciones, secrets y aceptación

## Matriz temporal
| Caso | Preparación | Resultado exigido |
|---|---|---|
| Reinicio 09:00 | cron 09:00, proceso offline 08:59–09:03 | catch-up según política; nunca pérdida silenciosa |
| DST primavera | Europe/Madrid 02:30 inexistente | skip/next-valid documentado y testeado |
| DST otoño | Europe/Madrid 02:30 duplicada | first/second explícito; no doble accidental |
| Dos workers | 2 instancias reclaman mismo vencimiento | 1 run canónico por schedule/dueAt |
| Clock skew | reloj host ±90s vs DB | métrica, alarma, no ejecución adelantada no autorizada |
| Cambio TZ | usuario modifica zona | nextRunAt recalculado con versión |
| 500 SOPs | primeros 200 no due, 450 due | SOP 450 evaluado dentro del SLA |
| Suspensión tenant | tenant desactivado tras encolar | sin side effects nuevos |
| Cancelación | cancelar entre claim y ejecución | revalidación y no despacho |
| Crash transaccional | fallo entre run/task/outbox | reconciliación durable y sin pérdidas |
| Reintento externo | proveedor ejecuta y falla ACK | idempotencia/receipt; no prometer exactly-once |

## Matriz push
| Caso | Resultado |
|---|---|
| Permiso no concedido | no suscripción ni envío |
| Permiso denegado | sin reprompt invasivo |
| Chrome Android app cerrada | aviso visible cuando plataforma entrega push |
| App en primer plano | dedupe entre SSE e indicador |
| Logout/cambio tenant | suscripción revocada o deshabilitada |
| Endpoint 404/410 | invalidar registro y dejar receipt |
| 429/503 | backoff, jitter, límite, DLQ |
| Dispositivo robado | revocación desde settings |
| Tap deep link manipulado | solo rutas allowlisted y authz al abrir |
| Push duplicado | dedupe por notificationId+deviceId+channel |
| Dos usuarios mismo tenant | aislamiento de inbox y payload |
| Dos tenants mismo userId | aislamiento estricto |
| Quiet hours | posponer no críticos según TZ, respetar TTL |
| Notificación sensible | texto genérico en lock screen |
| CSP/SW | no romper caché de landing ni UX de chat |

## Seguridad
- API push requiere sesión/actor/tenant derivados de principal, nunca cabecera editable ni tenant en body como autoridad.
- Suscripciones son credenciales de entrega: cifrar endpoint/keys/token en reposo, proteger logs/backups, limitar acceso, rotar/revocar.
- VAPID pública en web, VAPID privada solo servidor; FCM service account solo backend/Doppler; no inventar valores ni copiarlos a Git.
- CSRF/Origin/CORS/rate-limit en POST subscribe; dedupe y cuotas por actor, tenant y device.
- Web Push no garantiza entrega inmediata ni puntualidad estricta: TTL, energía y navegador pueden demorarla.
- Notificación no autoriza acción: la aprobación y escritura pasan de nuevo por PDP.
- Consentimiento y privacidad documentados antes de push real; no exponer asunto de correo, datos bancarios, leads o PII en pantalla bloqueada.

## Operación y despliegue
1. Inventario de secretos sin imprimir valores: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (nombres propuestos), DB y auth; FCM solo en fase APK.
2. Confirmar HTTPS y scope del service worker en Vercel; backend y worker en Fly; CORS y cookie session para suscripción.
3. Configurar monitorización de tiempo del host y skew vs DB; evitar cron en instancia web efímera.
4. Migración DB backward compatible: expand → backfill → dual-read limitado → cutover → contract; dry run y rollback.
5. Canary con 1 usuario/dispositivo interno; opt-in; verificar entrega y click; sin producción ni merge automático.
6. Playwright para frontend, pruebas unitarias con reloj falso, integración Postgres real, pruebas manuales Android; simulaciones no sustituyen dispositivo real.
7. Aprobación humana antes de habilitar push a clientes.

## Definition of Done
- No regresiones en `TaskWorker`, SOPs, event bus, SSE, authz ni mobile chat.
- Tests deterministas de DST, missed ticks, concurrencia, multi-tenant, revocación y dedupe.
- Push Web real probado en Android con app cerrada y HTTPS.
- Historial/receipts auditables; métricas y alertas funcionando.
- Rollback probado; documentación de soporte, permisos, dispositivos y troubleshooting.
- Evidencia de ejecución real adjunta al reporte; no confundir presencia de código con garantía operativa.

## Handoff para agente implementador
«Antes de escribir código, lee los cuatro documentos de `docs/audits/2026-11-22-time-scheduler-mobile-push/`, reaudita main y ramas activas, verifica paths reales y dependencias, reproduce los fallos de C01, reserva superficies de escritura, implementa una campaña por rama y reporta tests, riesgos, SHA y rollback. No cambies main, no despliegues ni generes credenciales sin aprobación. Mantén Laia como interfaz ligera; toda ejecución queda en runtime determinista».
