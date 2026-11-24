# T01 · Auditoría de infraestructura

Base ejecutable `a48b79e93a2a0ddde88a9345853e42b928d80092`; campaña de lectura `52dcd7ace6b88f4e33ec9c828cfbc4093766dade`. Se creó `Trans04` desde la rama remota de handoff `trans04`, que se conserva. La carpeta de evidencias conserva su nombre histórico. El mandato vigente es el de Trans04. Los documentos de Trans01 se consultaron como coordinación desde `origin/Trans01`, dado que no existen en la base propia.

## Fuentes y ramas

[T01-RAMAS.tsv](T01-RAMAS.tsv) congela las refs de origin obtenidas por fetch, merge-base, divergencia, equivalencias por `git cherry` y cantidad de paths contra merge-base. Un patch equivalente es candidato a reconciliación semántica, y la cifra no incluye merges. Mantener ramas mixtas/UX y releases; para un cierre posterior contrastar checks y PR por SHA, preservar procedencia y probar el árbol combinado. Áreas prioritarias: auditoría de observabilidad dogfooding, Doppler, C06.P03a y auditoría Cognition independiente, CI y ramas de release; no se incorpora ningún patch ni se cierra ninguna rama en B1.

El paquete histórico `docs/agntia-demo/` está disponible en `d0c05b9e` y fue movido a `apps/ui-lab/docs/agntia-demo/`. AgntiaPro compila procesos y capacidades de una empresa desde sandbox, progresa mediante aprobación y validación explícitas y preserva una fuente causal reutilizable para formación y simulación. Laia supervisa e interactúa, los roles operativos tienen permisos explícitos y los estados de empresa, servicio y conector evolucionan por separado. Un fixture no certifica un resultado empresarial real.

## Mapa de código y conflictos

| Productor | Consumo actual | Hallazgo y próxima verificación |
|---|---|---|
| `middleware/request-logger.ts:requestLogger` | `metrics/registry.ts:globalMetrics` y logs | Usa pathname con sustitución regex parcial; rutas no reconocidas y segmentos libres pueden multiplicar series. `app.ts` monta logger temprano sin resolver tenant y el logger lee tags antes de `next()`. Confirmar ruta canónica tras routing y usar scope autenticado exclusivamente para auditoría. |
| `kernel/kernel.ts`, `kernel/subscribers/metrics-consumer.ts`, `engine/events/consumers/metrics.ts`, `engine/worker.ts` | Registry del proceso | Contar decisión, transición y entrega por separado. El consumidor observa eventos; no prueba éxito del proveedor. Evitar doble conteo al instalar hooks. |
| `metrics-exporter.ts:metricsRoutes` | Prometheus por HTTP | Token o admin según configuración, filtro por tenant; p99 se calcula antes del filtro. Acordar semántica de agregados y probar por scope antes de ampliar acceso. |
| `engine/metrics/collector.ts:MetricsCollector` | Store de métricas por tenant | No se hallaron instancias en servidor con búsqueda de símbolos; resumen limitado a 10.000 filas. No usar como fuente única de SLO. |
| `engine/events/exporters/otel.ts` | Interfaz vacía sin consumidor operativo | El comentario propone IDs procedentes del evento y atributos de proyecto/cliente; el contrato nuevo debe usar contexto W3C y allowlist sin IDs de negocio, previa revisión de Trans01. `infra/compose.yaml` contiene browser-worker, no collector OTLP. |
| `scripts/lib/vertical-slice-bundle.ts` → `scripts/provision-vertical-slice.ts` → `scripts/lib/agency-bootstrap.ts` | Parser, plan, instalación reanudable y check | Conservar fingerprint/op key, validación de referencias, journal tenant→actors→complete y fallos explícitos. Confirmar concurrencia en Postgres restringido antes de owner real. |
| `scripts/gate-report.ts` → `scripts/gate-cognition-v2.ts` | Reporte del gate base y certificación V2 | Exigir correspondencia SHA y entorno. El gate V2 conserva NO_GO con bloqueos abiertos. `.github/workflows/ci.yml` ejecuta unit, worker, web; integración y release dependen de main. |

## Reserva solicitada

[T01-PATHS.txt](T01-PATHS.txt) enumera paths exactos para revisión. Solicitar también reserva de `tests/trans04-observability-contract.test.ts` y `tests/trans04-fixture-contract.test.ts`; suites existentes se ejecutan como lectura. Deploy, DB de producción, Vercel y generación editorial quedan fuera del patchset de CI. `infra/compose.yaml` y cualquier manifiesto de collector requieren reserva específica. Sin cambios de runtime, CI, dependencias, secrets ni infraestructura en P1.

## Dependencias y señales de operación

- API y worker pueden arrancar como procesos distintos (`index.ts`, `worker-entry.ts`); Cognition worker tiene su propio entrypoint. Cada proceso requiere identidad de servicio y lifecycle explícitos. Un gauge de API no acredita la salud del worker remoto.
- `readInstallation` y las consultas de instalaciones de `provision-vertical-slice.ts` tienen catches a null/[]: diferenciar ausencia y fallo de Store antes de un apply real. El plan de owner necesita identidad, memberships, capacidades y consentimiento aprobados, DB aislada para pruebas y un check que contraste journal y estado persistido.
- `vendor/agntia-ciberseguridad-0.1.0-alpha.2.tgz` es el artefacto local existente. `agntia-ciberseguridad` y `agntia-gestoria` son upstreams localizados por README. Reconciliar versiones, licencias y SBOM antes de cambiar dependencias. Limitar esta línea a autorización, auditoría pasiva y aislamiento. Para gestoría, mantener propuestas fiscales separadas de datos conciliados y efectos sujetos a aprobación.
- Para fase 09, distinguir con series de baja cardinalidad OAuth autorizado/revocado, aceptación/entrega WhatsApp, operación Google y resultado durable, observación pasiva y resultado conciliado. Ante lag, comprobar salud y watermark antes de revisar cola y DLQ. Ante fallo de collector, validar que el exporter pierda sólo telemetría y que el servicio mantenga latencia y disponibilidad. Ante subida de coste, contrastar llamadas, tokens y reintentos por proceso.
- Para recompilación, usar el parser y bootstrap existentes. El inventario de SOP debe fijar versión, rol, capacidad, fuente y receipt antes de migrar referencias; preservar hechos, histórico y personalizaciones al revertir.
