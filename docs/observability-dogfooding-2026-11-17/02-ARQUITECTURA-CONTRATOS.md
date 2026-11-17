# Arquitectura objetivo y contratos
## Dos planos
A. Auditoría de negocio: append-only SystemEvent + evidencias y decisiones inmutables en Postgres, tenant scoped, receipts, version de política, source/provenance. Los registros de auditoría críticos no dependen de sampling.
B. Telemetría técnica: OpenTelemetry SDK Node para traces/metrics/log correlation; OTLP -> Collector opcional -> Grafana Cloud (Tempo/Prometheus compatible/Loki según configuración). Grafana visualiza, NO certifica operaciones ni sustituye audit ledger. Evitar registrar contenido confidencial.
C. UX: Centro de Control consume API de observabilidad autenticada tenant-scoped; Grafana es consola técnica del fundador, no acceso directo de clientes.
D. Axiom Lab: evaluación determinista y JEV semántico no autoritativo en shadow; replay aislado sobre snapshots/evidenceRefs; jamás ejecuta efectos.

## IDs y relaciones
tenantId: frontera de autorización y partición; actorId: principal autenticado; owner NO equivale a tenant.
correlationId: operación de negocio estable a través de requests, jobs y retries.
traceId: W3C 16 bytes hex, identificador técnico de trace, diferente de correlationId.
spanId: W3C 8 bytes hex, padre/hijo.
causationId: evento desencadenante.
taskId, sopId, stepId, attemptId, providerRequestId, idempotencyKey, policyVersion, evidenceRefs, deploymentVersion.
NUNCA convertir ULID event.id en spanId sin derivación compatible ni crear traceId a posteriori si se pretende causalidad distribuida.

## Esquema de ObservationEnvelope (propuesta; adapter, no ruptura de SystemEvent)
{schemaVersion, eventId, tenantId, correlationId, traceId?, spanId?, causationId?, actorId?, threadId?, taskId?, sopId?, stepId?, attemptId?, source, type, outcome, occurredAt, durationMs?, policyVersion?, evidenceRefs?, errorCode?, provider?, model?, costEstimate?}
Enums cerrados; payload discriminado Zod; versiones; no secretos; timestamps UTC. No persistir span por cada evento empresarial por defecto (evitar explosión).
Status: proposed/allowed/denied/pending/started/succeeded/failed/outcome_unknown/reconciled. Distinguir 'accepted' de 'confirmed'. La semántica de persisted/pendingCommit es explícita.
No añadir tenantId como label Prometheus para miles de tenants sin política de cardinalidad: tenant en audit/traces controladas; métricas agregadas con labels de cardinalidad baja y tenant solo en métricas seleccionadas.

## ObservabilityBridge API
startSpan(name, context, fn), recordMetric(name, labels, value), emitBusinessEvent(type, payload, context), recordAuditDecision(decision, evidenceRefs), captureException(error, sanitizedContext).
Las operaciones de observabilidad no pueden bloquear trabajo ordinario por caída OTLP; los registros de auditoría legal/efecto sí deben respetar su garantía de persistencia definida. Controlar errores explícitamente, no catch vacío.

## Métricas prioritarias
http.server.duration histogram (route template, method, status class); chat.first_token_ms; chat.total_duration_ms; llm.duration_ms histogram {lane,provider,model,status}; llm.tokens.input/output; llm.estimated_cost; llm.fallbacks; sop.step.duration; sop.step.failures; kernel.policy.denials; approval.pending_age; worker.lease_lost; queue.oldest_age; action.outcome_unknown; audit.persist_failure; eventbus.commit_unknown; provider.errors_by_class; tenant_scope_mismatch. Prohibido label de userId, taskId, traceId, email o ruta cruda en Prometheus.
Medir SLA/SLO por clase: disponibilidad, éxito confirmado, latencia, tiempo hasta resolución, coste por operación; definir objetivos tras baseline dogfooding, no inventar números.

## Redacción, retención y permisos
Por defecto logs y spans solo metadatos; allowlist de campos. Secret scrub recursivo, test de fugas; cifrar evidencia sensible separada con RBAC, retention y borrado; accesos auditados. RLS y filtrado en SQL/API, nunca confiar en filtro UI. Instrumentar sin copiar contenido del usuario a proveedor externo. Sampling de spans técnicos; 100% auditoría de efectos y decisiones. Establecer budgets y retención según datos y obligaciones aplicables.

## Dashboards
D1 salud: HTTP, workers, colas, errores, DB, provider outages.
D2 Fast LLM: TTFT, latencia, errores, fallback, coste.
D3 SOPs: ejecuciones, steps, retries, estados, aprobaciones, outcomes.
D4 Kernel: políticas, denials, invariantes, evidencias, drift.
D5 Multi-tenant: integridad de partición, cuotas, consumo, incidentes sin datos privados.
D6 Integraciones: Gmail, Calendar, Drive, WhatsApp, voice, provider 429/timeouts.
D7 Finanzas de ejecución: coste por tarea/SOP/tenant, tokens y avatar minutos (cuando disponible).
D8 Axiom Lab: falsos positivos, shadow vs actual, cambios por policyVersion.
Provisionar JSON dashboards/alert rules como código, no configuración manual sin versionar.

## Alertas iniciales
P0: cross-tenant mismatch; effect executed without valid authorization; unknown external outcome not reconciled; audit durability failure.
P1: worker lease lost; DLQ growth; sustained provider errors; quota exhausted; health-deep unavailable; unexpected cost spike.
Alert routing externo independiente del proceso caído, cooldown, dedupe, escalation, test de envío. No alertar sobre tokens/payloads sensibles.
