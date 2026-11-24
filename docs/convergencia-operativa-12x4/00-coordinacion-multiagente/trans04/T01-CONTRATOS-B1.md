# T01 · Propuesta de contratos B1

## ADR · Métricas, trazas y autoridad

Mantener `globalMetrics` como registro Prometheus por proceso. Proponer en T02 un SDK de trazas por proceso (API, worker, Cognition worker) con propagación W3C y exportación OTLP por lotes al collector y de allí a Grafana. Mantener un solo pipeline por señal: scrape del registry para métricas y exportación OTLP para spans. Cola de exportación acotada, pérdida contabilizada, flush con plazo y fallo aislado de Fast, runtime y workers. El collector no escribe en bus, memoria ni contexto. Usar links al cruzar persistencia, fan-out o replay cuando no exista un padre verificable. No reconstruir trazas tomando event IDs como span IDs.

Allowlist de atributos: proceso, etapa, capability registrada, ruta template o unmatched, clase de resultado, canal/proveedor lógico, entorno y versión. Prohibir en métricas/trazas externas identidad, tenant, payload, prompts, adjuntos, credenciales, ruta cruda y IDs de negocio. Auditoría interna correlaciona evidencia con ACL. Medir cardinalidad bajo entradas variadas, colas y cardinalidad de etiquetas con límites acordados antes de habilitar egress. El cliente no impone sampling, tenant ni identidad mediante headers. Separar observación, decisión, ejecución, receipt, proyección, observación Slow, tarjeta y snapshot. Fast consume snapshots preparados autorizados, sin esperar exportación, Slow o JEV.

Dependencias propuestas, sin cambio de lockfile: contrastar `@opentelemetry/api`, SDK de trazas Node y exporter OTLP HTTP con Node CI y pnpm fijado; verificar compatibilidad entre versiones, licencia, vulnerabilidades y lockfile congelado. No instalar SDK de métricas duplicado. Habilitación por proceso y entorno vacía por defecto; revertir deshabilitando exportación y retirando el SDK, manteniendo registry, recibos y eventos.

## Solicitudes de hooks

| ID | Propietario y punto de inserción | Diff conceptual y contrato | Prueba |
|---|---|---|---|
| T04-H01 | Trans01 · app.ts, kernel/kernel.ts, engine/events/bus.ts, engine/service.ts | Insertar hooks tras scope autorizado y después de commit/resultado del kernel. Emitir etapa, duración y estado enumerados. Enlazar correlación interna al contexto de traza sin transportarla como etiqueta. | Denegación y rollback no producen éxito; replay mantiene vínculo sin duplicar outcome. |
| T04-H02 | trans02 · engine/cognition/v2/runtime.ts, workers.ts, context.ts | Envolver Fast, cola, Slow, receipts y snapshot en observaciones con outcome y tiempo; medir lag entre marcadores durables, sin depender del exporter. | Slow/JEV o collector indisponibles dejan Fast operativo; snapshot revocado no se contabiliza como servido. |
| T04-H03 | Trans03 · packages/integrations, engine/whatsapp-outbound.ts, google-auth.ts | Instrumentar tras la decisión existente, clasificar respuesta, ambigüedad, retry y revocación con código enumerado; sin scopes/tokens ni payload bruto. | Timeout ambiguo no emite entrega confirmada; replay no repite efecto, OAuth revocado no invoca adaptador. |

## Fixtures y upstream

Upstream confirmado por su README y contrato de ingesta: [uniscrolliabrain-cloud/agntiapro-acme](https://github.com/uniscrolliabrain-cloud/agntiapro-acme/tree/8637e8925dd57351e9e93af8dae79aa3b2163314), SHA `8637e8925dd57351e9e93af8dae79aa3b2163314`. El árbol contiene README y diez documentos, sin licencia ni generador ejecutable. `BLOCKED_DEPENDENCY` para importar: confirmar permiso/licencia y una revisión con generador. Su envelope conserva scenarioId, runId, correlación e idempotencia; adaptar al schema canónico y resolver tenant en el borde autenticado. El instalador consume bundle para identidad y catálogo ficticios; los eventos posteriores ingresan por adaptador sintético y contratos autorizados. El reloj virtual queda en simulación, fuera de TTL, revocación y leases reales.

Fixtures locales independientes: escenarios deterministas A/B con tiempo controlado, identificadores sintéticos y evento→receipt→tarjeta→snapshot versionados. Usar simuladores locales y evitar cualquier import del demo. Casos: receipt válido y falso, evento duplicado, contradicción, revocación posterior a preparación, entrega incierta y recuperación sin efecto duplicado. Contrato de import futuro: schema versionado, hash, procedencia, volumen acotado, validación previa, rechazo por defecto y plan sin escritura.

## Matriz de baseline y gates posteriores

| Fase | Baseline o prueba existente | Evidencia de aceptación pendiente |
|---|---|---|
| 01 Consolidación | git merge-base/cherry, cognition-v2-http, public-events | Rutas únicas y equivalencia por contrato, HTTP y RLS de SHA combinado. |
| 02 Observabilidad | worker-metrics y registry/logger inspeccionados | E2E causal con collector local, redacción, cardinalidad y exportación caída. |
| 03 Proveedores | cognition-v2-jev-egress, slow-lanes, voice | Fast independiente y provider sandbox autorizado; separar latencia, coste y entrega. |
| 04 WhatsApp | suite general; verify:slice smoke | Webhook→resultado durable→tarjeta→snapshot; medir dedupe y scopes. |
| 05 Google | suite gate, autorización y RAG | Maps, Calendar, Drive, Gmail y Docs con ACL revocable, receipt y resultado ambiguo. |
| 06 Sintética | vertical-slice-bundle, vertical-slice-provision | Hash e identidad reproducibles, cero red, rechazo por scope, contradicción y replay. |
| 07 Owner real | planProvision/applyProvision/checkProvision revisados | Plan aislado, reserva concurrente, aprobación de apply y Postgres restringido. |
| 08 Seguridad | bridge y RLS defensivos | Validar separación de tenants, denegación por defecto y auditoría pasiva. |
| 09 Observabilidad V2 | exporter, logger, worker y stubs inventariados | Medir p95/p99, lag, cola, duplicados, coste y pérdida de telemetría; runbook por SLO. |
| 10 Gestoría | contrato documental de integración | Upstream/licencia, recibo conciliado, fiscalidad como propuesta y aprobación humana. |
| 11 Recompilación | bundle y bootstrap existentes | Versiones de SOP, procedencia, preservación de personalizaciones y rollback. |
| 12 Validación | gate, cognition-v2, verify:slice, release:check/verify | Ejecutar SHA combinado, restauración, entorno restringido, sandbox y evidencia separada por entorno. |

No usar datos de producción ni un collector externo para baseline. Medir latencia desde el reloj del proceso, lag a partir de eventos durables comparables y percentiles sobre ventanas/rangos documentados. Fijar umbrales después de obtener baseline representativo. Un fallo del gate mantiene bloqueadas las dependencias correspondientes.
