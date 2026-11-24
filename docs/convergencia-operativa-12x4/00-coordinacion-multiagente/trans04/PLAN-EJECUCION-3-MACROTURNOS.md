# Trans04 — ejecución M1–M3
Aplicar PROTOCOLO-3-MACROTURNOS.md. Rama Trans04, carpeta trans04. Verificar T01-PATHS y reserva exacta.
## M1
1. I01 MetricsRegistry/globalMetrics, MetricsCollector ya montado service.ts:274; corregir request-logger cardinalidad por route template y p99 tenant filtrado antes de cuantiles. Tests dos URLs misma ruta y A/B.
2. I02 OTLP: registry Prometheus por proceso, trazas W3C y exporter acotado no bloqueante; no tenant/PII externos. H01/H02/H03 interfaces y solicitudes a owners, no editar sus paths. Tests collector offline, redacción, doble conteo.
3. I03 CI/deps: Node versión CI, pnpm lock reproducible; diagnosticar tasks-reassign timeout sin ampliar timeout ni skip; gate limpio no concurrente. Mantener gate-cognition-v2 NO_GO. B2.
## M2
4. I04 fixtures: deterministas por tenant/seed, WhatsApp y cinco Google slices; upstream ACME verificar licencia/generador antes de importar; si no, fixture local etiquetada.
5. I05 provision-vertical-slice.ts y lib/vertical-slice-bundle.ts/agency-bootstrap.ts: plan/apply/check, reserva y journal tenant/actors/complete; lecturas fallidas no equivalen a vacío; CAS/concurrencia/reanudación, preservar customizaciones. Test fallo por paso y dos provisionadores. Sin apply owner real. B3.
6. I06 observabilidad V2: outcome, lag, coste, ciber/gestoría, dashboards/alertas sin UX; no duplicar registry. I07 recompilación bundle, migración/restore y jornada E2E; gate-report, gate-cognition-v2, verify:slice, release checks. B4.
## M3
7. Auditar Trans03 adaptadores/scopes/egress/unknown; detectar mocks/skips y fuga de secretos; corregir propios gates/fixtures. B5.
8. Fault injection, carga, restore, Postgres restringido, collector offline, SHA combinado; runbooks y evidencia con exit codes, skips y bloqueos. B6. No deploy ni neutralizar NO_GO.
