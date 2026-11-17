# Auditoría de código: observabilidad y fiabilidad
Método: lectura directa de ficheros GitHub de rama por defecto durante 2026-11-17 y contraste con docs/miniaudits/02-observabilidad/miniaudit.md y docs/miniaudits/2026-11-10/03-observabilidad/miniaudit.md. No se han ejecutado suites ni probado despliegues. Estado: verificado en fuente / pendiente de confirmar por tests.

## Inventario verificado
1. apps/server/src/engine/events/types.ts: SystemEvent versionado 1.0 con tenantId, owner, correlationId, causationId, source y payload; lista cerrada incluye action.outcome_unknown, policy.denied, verification.disagreement, run.recorded, span.recorded y evaluation.submitted. No duplicar nombres existentes.
2. apps/server/src/engine/events/bus.ts: Zod payload schema, resolución de tenant, protección TENANT_MISMATCH, dedupeKey opcional, sink durable, callbacks afterCommit, resultados persisted/pendingCommit/commitOutcome=unknown. En catch puede devolver error como resultado en vez de lanzar.
3. apps/server/src/kernel/subscribers/audit-consumer.ts: índice kernel-audit-index para seis tipos seleccionados; projectKernelAuditEvent hace db.put; startKernelAuditConsumer captura rechazo con .catch(() => {}) (confirmar repercusión operacional).
4. apps/server/src/engine/sop-executor.ts: checkpoints y eventos SOP, correlationId task.id en rutas; llm_generate usa modelChain(mode task), sin autoridad propia; verificar todos los exits, retries, estados waiting y resultados desconocidos.
5. apps/server/src/engine/execution/capability-runner.ts: gobierno condicionado por wiring de governance/getAgentRole/roleId/actorId; no afirmar bypass general sin auditar los otros ejecutores y PDP. Requiere matriz de caminos con efectos.
6. apps/server/src/engine/model-chain.ts: modos chat/task y fallback. Instrumentar provider/model real, intentos, tokens y costes sin registrar credenciales.
7. apps/server/src/engine/cognition/v2/slow.ts: cola de trabajos Slow cognitivos y eventos de estado; distinguir de steps LLM de SOP.
8. apps/server/src/middleware/request-logger.ts: correlationId con AsyncLocalStorage, parseTraceparent que extrae traceId; NO establece span padre OTel ni propagación W3C real en lo observado. getTenantId opcional y comentario reconoce auth posterior.
9. apps/server/src/log.ts: JSON estructurado, AsyncLocalStorage, redacción de algunas claves, backgroundFailure con contador. Revisar redacción recursiva, campos no reconocidos y salida de errores.
10. apps/server/src/metrics/registry.ts: registry propio de counters/gauges/histograms y render Prometheus; inspeccionar escape, labels, cardinalidad y buckets. No duplicar métricas indiscriminadamente al introducir OTel.
11. apps/server/src/metrics-exporter.ts: /metrics usa registry acumulativo, no recorre DB; token x-metrics-token o admin, filtro tenant, p99 calculado. No repetir hallazgo antiguo de escaneo DB como actual.
12. apps/server/src/engine/events/exporters/otel.ts: interface vacía con comentario stub; NO existe exportación OTel real en ese archivo.
13. apps/server/src/alerts/service.ts: motor declarativo con cooldown, LogAlertHandler solo log; validar wiring y otros handlers antes de asegurar que no existen canales externos.
14. apps/server/src/app.ts: requestLogger() registrado alrededor de línea 413 sin resolver explícito de tenant; /api/health en ~519 escribe health/ping y emite system.startup por petición; /api/health-deep con checks; auth actualiza logContext con enterWith después, inspeccionar propagación.
15. apps/web/src/components/ControlCenterView.tsx: KPIs de tareas y notificaciones, polling useTasks(3000), sin explorador de trazas en código leído.
16. docs/miniaudits/2026-11-10/03-observabilidad/miniaudit.md: 20 hallazgos históricos con validación parcial, entre ellos inputs de alertas a cero, labels, health, cardinalidad, traceparent, no exportador. Reproducir uno a uno.

## Riesgos y prioridades
P0: la sonda de vida tiene efectos (app.ts 519-529); separar liveness read-only de readiness/deep y startup emitido solo al arrancar. P0: no declarar operación confirmada si DB/API devuelve outcome_unknown o pendingCommit; exigir reconciliación e informe. P0: no mezclar tenant/owner, especialmente en traces, auditoría y filtros; autorización por servidor, no solo query param.
P1: trazas W3C ausentes en exporter stub; correlación HTTP->SOP->kernel->worker->API externa; asegurar propagación a jobs asíncronos y webhooks.
P1: consumidor audit silencia fallos; dead-letter/retry y métricas audit_persist_failed. Auditoría crítica debe persistir con garantías explícitas.
P1: instrumentar todos los límites de efecto y decisiones kernel (allowed, denied, needs_approval, unknown), sin dar autoridad a JEV.
P1: alertas independientes de proceso/log y con inputs medidos, no constantes.
P1: log sanitization, redaction de cuerpos, secrets, tokens, correos y datos financieros; evitar datos sensibles en Grafana.
P2: métricas histograma p50/p95/p99 de Fast/Slow, latencia de resolución, cola, worker lease, costes, tokens, fallbacks, cuotas y API 429.
P2: Centro de Control explorador con RBAC, tenant isolation y filtros.
P2: Axiom Lab shadow con replay solo de decisiones, nunca side effects.
P3: retención, budgets, muestreo, volumen, dashboards como código, SLO.

## Matriz de pruebas obligatoria
- HTTP con y sin traceparent válido: traceId/spanId correctos, sin confiar ciegamente en ids externos.
- Request->chat->task->SOP->step LLM->kernel->approval->tool->receipt: mismo correlationId, trace parent-child correcto.
- Job asíncrono y reintento: conserva correlationId, nuevo attemptId/span; idempotencyKey estable.
- Webhook entrante sin padre: root trace nuevo enlazado por business operation id.
- Dos tenants con mismo owner: no fuga en queries, Grafana labels, audit index ni UX.
- Emisión de evento dentro de transacción rollback y commit desconocido: sin falsos succeeded.
- Caída de consumidor audit: retry/dlq y alarma externa.
- Falla Grafana: ejecución de negocio sigue; audit durable no depende de Grafana.
- 429, timeout, 400, 503: clasificación transitoria/permanente.
- Health check repetido 100 veces: 0 escrituras y 0 startup events.
- Datos secretos en prompt, respuesta, excepción y header: 0 filtraciones en logs/spans.
- Métricas con rutas dinámicas y tenants: cardinalidad acotada, labels escapados.
- Replay de shadow axiom: 0 emails, pagos, mensajes o cambios externos.
- Reglas obligatorias: no se deshabilitan por ausencia de JEV/Grafana.

## Lo que NO está verificado
HEAD SHA exacto, CI, despliegue, config real de Grafana, rutas de todos los child repos, cobertura de todo el árbol, latencias medidas, presencia de herramientas en runtime productivo, acceso al stack de infraestructura, comportamiento end-to-end. Las campañas OBS-00 y OBS-01 deben cerrar esta incertidumbre.
