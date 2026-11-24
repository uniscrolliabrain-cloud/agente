# Observabilidad integral

Instrumentar OpenTelemetry SDK, propagación W3C, métricas y trazas kernel, fast/slow, bus, grafo, memorias, workers, SOP, API, web y DB. Exportar OTLP a Grafana; logs estructurados con redacción.

## Superficies candidatas (confirmar contra código)
bootstrap server/worker, kernel, engine, packages/domain, apps/web, workflows

## Gate específico
Prueba de correlación evento→receipt→SOP→outcome→card; p50/p95/p99, lag, DLQ, coste, alertas; sin PII, tokens ni IDs de alta cardinalidad en métricas.

# Contrato transversal obligatorio

LLM propone, sistema dispone. Kernel autoridad única; runtime determinista ejecuta SOPs/skills; bus append-only con correlationId/causationId, schemaVersion, tenant y actor; proyecciones y grafo verificables; cinco memorias con procedencia; fast independiente de slow; slow observa y propone, nunca autoriza. Deny-by-default, fail-closed, leases/fences, idempotencia, outbox/inbox, retry acotado, DLQ, replay, rollback. No duplicar rutas ni adaptadores activos. No cambiar contratos por conveniencia de un mock. No secretos en repo, logs o prompts. No modificar UX ni owner demo. No afirmar PASS sin comando, SHA, entorno y evidencia.

Cada bloque: leer código vivo y AGENTS.md; inventariar paths exactos y dependencias antes de editar; registrar patchsets y migraciones; implementar en rama canónica con commits pequeños; ejecutar typecheck y tests afectados, después suite global y gates de aislamiento; reportar diferencias, riesgos y rollback. Si falta cuenta/API/secret, puerto real verificado + stub fail-closed y ticket OWNER_ACTION; nunca inventar readiness.

## Cuatro pasadas
- [01-scaffold-docu](01-scaffold-docu/README.md)
- [02-coding-audit-transversal](02-coding-audit-transversal/README.md)
- [03-reaudit-refactoring](03-reaudit-refactoring/README.md)
- [04-reaudit-hardening](04-reaudit-hardening/README.md)

## Ajuste de auditoría contra código vivo (24-11-2026)

Reutilizar apps/server/src/metrics/registry.ts, metrics-exporter.ts, engine/metrics/collector.ts, kernel/subscribers/metrics-consumer.ts y middleware/request-logger.ts. Exportador Prometheus existente usa METRICS_TOKEN o admin y filtro tenant. Auditar cardinalidad y autenticación; evitar doble contabilización al añadir OTLP. Instrumentar API, worker-entry y cognition-worker-entry por separado.

Estado: inspección estática; confirmar HEAD y ejecutar gates durante la campaña.
