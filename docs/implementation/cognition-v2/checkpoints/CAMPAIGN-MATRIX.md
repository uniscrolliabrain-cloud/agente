# Estado C00–C15 y gates

Checkpoint UTC: 2026-11-16T13:47:34.208372+00:00. Código auditado: [640a55db01fc9f934bf927dec53e97035f0455f3](https://github.com/uniscrolliabrain-cloud/agente/commit/640a55db01fc9f934bf927dec53e97035f0455f3). Base: [54b8d5407a8576459448c4d059a877297d18ca7a](https://github.com/uniscrolliabrain-cloud/agente/commit/54b8d5407a8576459448c4d059a877297d18ca7a). Evidencia local sintética; no certificación de producción.

Todos los estados son **EN CURSO**. Los porcentajes son estimaciones de cobertura funcional del alcance conocido, no mediciones de esfuerzo restante ni aceptación. La incertidumbre es alta. Ninguna campaña ha superado íntegramente su gate. Una suite parcial aprobada no cambia ese estado.

| Campaña | Estado | Estimación | Justificación | Gate pendiente |
|---|---|---:|---|---|
| C00 Baseline y mapa de sustitución | EN CURSO | 70% | Baseline reproducible e inventario inicial; no lectura exhaustiva de todo el monorepo y de todas las ramas externas. | Completar inventario/callgraph de consumidores restantes y validar el mapa de retirada con evidencia de cada sustitución. |
| C01 Contratos y migración | EN CURSO | 60% | Contratos strict y backfill gobernado funcionan; catálogo global y mapping de dominio incompletos. | Migración/corpus completos, versiones y revocaciones de todas las fuentes, cutover progresivo y retirada de lectores V1. |
| C02 Event Bus durable y replay | EN CURSO | 60% | Journal/proyector fiables en fixtures y Postgres; consumidores legacy siguen sin delivery durable completo. | Demostrar recuperación integral de todos los consumidores, aislamiento compartido, restore/retención y equivalencia de rebuild a escala. |
| C03 Grafo cognitivo multicapa | EN CURSO | 35% | Proyección de referencias y relaciones funcional; no grafo empresarial completo ni consolidación semántica avanzada. | Reconstrucción multicapa completa, dedupe/consolidación y consultas/invalidación autorizadas a escala. |
| C04 Cinco memorias, RAG y revocación | EN CURSO | 50% | Cinco métodos funcionales y RAG real reutilizado; automatización y políticas completas pendientes. | Todas las memorias integradas con productores/consumidores reales, calidad y aislamiento/retención/revocación a escala. |
| C05 Ontología y cromos | EN CURSO | 55% | Semántica aprobada e integración inicial; falta demostrar mejora de calidad y rendimiento. | Completar integraciones/normalización e invalidación operacional y demostrar beneficio con corpus y carga. No falta nombrar los polos. |
| C06 Atención global y metacognición | EN CURSO | 40% | Persistencia y señales disponibles; integración multiagente/global incompleta. | Workspace completo integrado con todos los consumidores, reconstrucción, concurrencia y evaluación multiagente. |
| C07 Slow LLM asíncrono | EN CURSO | 60% | Trabajo durable completo a nivel de slice; extracción avanzada/proveedor/coste no certificados. | Recuperación/retry/errores demostrados bajo carga real y todas las etapas de enriquecimiento, verificación y procedencia. |
| C08 JEV no autoritativo | EN CURSO | 40% | Puerto/baseline en main; adaptador documentalmente verificado en rama W6, aún inactivo externamente. | Integrar adapter real gobernado, probar sandbox/fallos/budgets, calibrar gold corpus y medir coste/calidad sin afectar Fast. |
| C09 CardStore y delivery ledger | EN CURSO | 55% | Conocimiento/entrega separados y recuperación probada; nuevo P1 de correlación por turno permanece abierto. | Corregir el P1 y demostrar entrega trazable por consumidor bajo desconexión/replay; migración masiva y recuperación operacional completas. |
| C10 ContextServingFacade | EN CURSO | 60% | Snapshots/deltas/ref/invalidación funcionan; faltan todos los consumidores y tokenizer real. | Snapshots/deltas consistentes para todos los consumidores, autorizados por políticas completas, medidos bajo fallos/carga. |
| C11 Fast y Slow independientes | EN CURSO | 55% | Separación operativa demostrada con fixtures; no migración de herramientas ni SLO/costes reales. | Paridad de capacidades gobernadas y medición TTFT p50/p95/p99 bajo saturación/proveedor/coste real con objetivos aprobados. |
| C12 Presenter, UX y accesibilidad | EN CURSO | 50% | UI factual/ligera y polling implementados; falta presenter integral y accesibilidad completa. | Presenter verificable para todos los estados del runtime, reconexión/streaming y auditoría WCAG/teclado/lectores real. |
| C13 Voz, avatar y sesiones | EN CURSO | 25% | Coordinador y adaptador Fast locales; sin Anam/ElevenLabs físicos. | Audio/video realtime end-to-end con interrupción real, sesiones huérfanas, ACK de reproducción, accesibilidad y límites reales. |
| C14 Puente de ciberseguridad | EN CURSO | 50% | SDK/relay/contratos reales probados; orquestación y autorización de piloto no configuradas. | Jobs/recibos reales padre-hijo con PDP/broker, fallos/rollback y evidencia completa, sin extrapolar zero findings a seguridad. |
| C15 Certificación y checkpoint | EN CURSO | 25% | Evidencia y pruebas locales abundantes; programa completo no certificado y P1 abierto. | Superar todos los criterios A01–A30, corregir P1, medir riesgos/costes reales y recibir GO separado. No declarar 16 campañas completadas. |

El detalle de los quince campos por campaña está en [el informe principal](../AUDITORIA-INTERMEDIA-CODEX.md#b-estado-de-las-16-campañas).

