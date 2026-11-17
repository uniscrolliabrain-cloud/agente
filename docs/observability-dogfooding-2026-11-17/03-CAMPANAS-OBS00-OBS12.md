# Campañas ultraconcretas OBS-00 a OBS-12
Todas: branch individual feat/obs-NN-..., owner de archivos, baseline SHA, tests unit/integration/e2e, evidencia docs/observability-dogfooding-2026-11-17/reports/OBS-NN.md, plan rollback, no merge ni deploy sin aprobación. Los paths propuestos se validan contra árbol actual antes de tocar. No mezclar cambios de otro child repo. Preferir nuevas capas a reescribir kernel.

## OBS-00 — Baseline y mapa de caminos (bloqueante)
Leer app.ts, service.ts, worker.ts, SOPExecutor, CapabilityRunner, policy, PDP, EventBus, metrics, logger, alert service, frontend, package.json, tests y CI. Registrar SHA, versions, rutas, actual wiring, deployment env y matriz de efectos. Reproducir hallazgos de auditorías Oct/Nov, clasificar confirmed/fixed/not-applicable/unknown. Ejecutar typecheck, unit, smoke; anotar fallos preexistentes. Salida BASELINE.md, PATH-MAP.md, METRICS-INVENTORY.md, SECURITY-THREATS.md. Gate: mapa de 100% de rutas con side effects conocidas; incertidumbres explícitas.

## OBS-01 — Correctitud de salud, métricas y logging (P0)
Modificar apps/server/src/app.ts: /api/health solo liveness read-only, startup emit solo en arranque; /api/health-deep con timeout y checks estables. request-logger.ts: rutas normalizadas, contexto tenant posterior a auth, no confiar en headers para autorización. metrics/registry.ts y metrics-exporter.ts: escape de labels, cardinalidad, histogramas y autorización. log.ts: redaction recursiva, LOG_LEVEL, service/version/region, errors estructurados. Tests 100 health calls 0 writes/events, Prometheus parse, 403/401 y secrets. Gate: cero efectos en sondas.

## OBS-02 — Contrato de observación y propagación (P0)
Crear apps/server/src/observability/{index,context,contracts,redaction}.ts, packages/domain/src/observability.ts si procede; Zod, versionado, AsyncLocalStorage/OTel context, correlationId vs traceId. Propagar HTTP, worker, queue, webhook, provider fetch; traceparent W3C real. No exponer tenantId en métricas de alta cardinalidad. Gate: pruebas request->async job->provider, trace tree coherente, tenant isolation.

## OBS-03 — Event Bus y durabilidad de auditoría (P0)
Revisar apps/server/src/engine/events/{bus,types,schemas,sinks/store}.ts y kernel/subscribers/audit-consumer.ts. Introducir retries/idempotencia/DLQ para proyección, métricas persisted/commit_unknown/audit_fail, no catch silencioso. Garantizar que evento no confirmado no se presenta como auditado. Tests transacción rollback/unknown, reinicio consumidor, reintento, duplicados, cross-tenant. Gate: ninguna pérdida silenciosa de evidencia crítica.

## OBS-04 — Instrumentación de SOP, workers y ejecuciones (P1)
Instrumentar sop-executor.ts, worker.ts, engine/execution/{executor,capability-runner,tool-executors}.ts y puntos reales de efectos. Spans task->sop->step->attempt; checkpoint, lease, retry, idempotency, approval, outcome_unknown y reconciled. Emitir eventos existentes si schema encaja, ampliar contratos con tests si falta. Gate: SOP con 5 steps visible de principio a fin; retries no duplican efectos.

## OBS-05 — Fast/Slow LLM y costes (P1)
Instrumentar model-chain.ts, model.ts, conversation.ts y cognition/v2/slow.ts; diferenciar lane fast-presenter, lane task-step, lane cognitive-slow. Provider/model real, TTFT si streaming, duration, input/output tokens si API expone, fallback, error class, rate limit, costEstimate con priceVersion. Sin prompt/body. Gate: un chat y un step LLM separados, costes reconciliables, no atribuir autoridad operativa a LAIA.

## OBS-06 — Kernel, axiomas, approvals y verificación (P1)
Instrumentar kernel/kernel.ts, policy/engine.ts, governance/PDP real, state machine, verification y approvals. Decisión tipada allow/deny/needs_approval, policyVersion, ruleIds, evidenceRefs, reasonCode, effect boundary. Buscar caminos alternos y cerrar huecos con campaña separada autorizada, sin cambiar semántica silenciosamente. Gate: cada efecto externo enlaza con autorización o rechazo verificable.

## OBS-07 — OTel SDK y exportación (P1)
Instalar versiones compatibles @opentelemetry/api, sdk-node, auto-instrumentations-node, exporter-trace-otlp-http, exporter-metrics-otlp-http si procede; sustituir stub exporters/otel.ts por adaptador real o retirarlo documentadamente. Inicializar ANTES de cargar Hono/HTTP; config env OTEL_SERVICE_NAME, OTEL_EXPORTER_OTLP_ENDPOINT, headers secretos; collector opcional, TLS, sampling, flush y shutdown. Tests con in-memory exporter, caída OTLP no rompe SOP. Gate: traza end-to-end visible en backend de pruebas; ninguna credencial commit.

## OBS-08 — Alertas y SLO (P1)
Revisar alerts/service.ts y wiring; sustituir inputs falsos por métricas reales, routing externo seguro (Grafana Cloud alerts o canal autorizado), cooldown/dedupe/ack, reglas de incidentes y pruebas de entrega. Crear dashboards y alert definitions versionados en infra/observability/{dashboards,alerts}. Gate: simular 5 incidentes y comprobar alerta fuera del proceso, sin datos privados.

## OBS-09 — Centro de Control y explorador (P2)
Crear apps/server/src/routes/observability.ts o patrón real de routes; endpoints tenant-scoped /api/observability/runs, /:runId, /timeline, /evidence (autorizado). Extender apps/web/src/components/ControlCenterView.tsx con filtros, timeline, costes, decisiones, estados unknown y drilldown; nunca llamar Grafana con token desde browser. Tests roles owner/manager/employee/guest y dos empresas. Gate: reconstrucción desde UI y cero fuga cruzada.

## OBS-10 — Axiom Lab shadow/replay (P2)
Crear engine/observability/axiom-lab/ o ubicación acordada; policyVersion, snapshotRef, replay de propuestas y evidencias con herramientas mockeadas y efectos deshabilitados. JEV solo advisory; métricas false-positive, disagreement y would_block; comparativa shadow vs actual. Gate: replay de 100 casos sin llamadas externas de escritura y sin modificar auditoría original.

## OBS-11 — Costes, privacidad y operaciones (P2)
Definir retención por tipo, sampling, cuotas, estimación gasto Grafana Cloud, redaction tests, runbooks de incidentes, recuperación, backup de audit y políticas de acceso. Revisar regiones/transferencias y cumplimiento aplicable. Gate: ejercicio de caída de proveedor, consulta de auditoría preservada, budget alarm.

## OBS-12 — Dogfooding de 2–3 empresas y aceptación (P2)
Crear fixtures de tres tenants propios, humanos/agentes con permisos distintos, SOPs correo/calendario/leads/facturación con sandbox o mocks. Ejecutar casos normales, fallos, reintentos, aprobaciones, proveedores no disponibles y cross-tenant. Medir latencias y costes reales, fijar SLO a partir de datos. Informe DOGFOODING-RESULTS.md con incidentes -> reglas candidatas para Axiom Lab. Gate final: reconstrucción de cada operación, evidencia íntegra, ningún efecto no autorizado, alarmas probadas y 0 fugas entre tenants.

## Dependencias y olas
Ola A: OBS-00 -> OBS-01 -> OBS-02 -> OBS-03.
Ola B: OBS-04 + OBS-05 + OBS-06 en ramas de escritura disjuntas después de OBS-02; integración secuencial.
Ola C: OBS-07 -> OBS-08, en paralelo OBS-09 tras OBS-03/04/06.
Ola D: OBS-10 -> OBS-11 -> OBS-12.
Cada ola requiere pruebas y aprobación explícita para integrar.

## Reporte estándar por campaña
SHA base/final, branch, alcance, rutas creadas/modificadas, dependencias añadidas y licencias, schema/migration, evidencia test comando+salida, riesgos, regresiones, seguridad/PII, métrica de coste, screenshots solo si UI, estado gate, rollback, pendientes y dependencia externa. Sin gate verde por inferencia.
