# AGNTIAPRO V2 — Auditoría intermedia de implementación

Checkpoint UTC: 2026-11-16T13:47:34.208372+00:00. Código auditado: [640a55db01fc9f934bf927dec53e97035f0455f3](https://github.com/uniscrolliabrain-cloud/agente/commit/640a55db01fc9f934bf927dec53e97035f0455f3). Base: [54b8d5407a8576459448c4d059a877297d18ca7a](https://github.com/uniscrolliabrain-cloud/agente/commit/54b8d5407a8576459448c4d059a877297d18ca7a). Evidencia local sintética; no certificación de producción.

**Resultado: EN CURSO / NO_GO para certificación integral.** Hay código funcional probado y publicado, pero ninguna campaña C00–C15 supera todavía todo su gate. Dos defectos P1 se reproducen con fixtures: ledger sin correlación por ejecución y reenvío de eventos privados del proveedor. Se publican antes de corregirlos para que la auditoría tenga una referencia estable. La ontología C05 está aprobada; la mejora cognitiva/empresarial aún no está medida.

**Seguimiento posterior:** los dos defectos reproducidos en este checkpoint se corrigieron en commits separados después de publicarlo. Véanse [W7 y sus pruebas](checkpoints/FOLLOW-UP-W7.md). Las tablas y hallazgos siguientes describen el SHA congelado, no se reescriben como si las correcciones ya existieran al auditarlo.

## A. Identificación y trazabilidad

- Repositorio: https://github.com/uniscrolliabrain-cloud/agente.
- Rama principal: [feat/cognition-v2-runtime-C00-C15](https://github.com/uniscrolliabrain-cloud/agente/tree/feat/cognition-v2-runtime-C00-C15).
- HEAD de código auditado completo: `640a55db01fc9f934bf927dec53e97035f0455f3`. Base utilizada y main remoto: `54b8d5407a8576459448c4d059a877297d18ca7a`.
- Referencia documental: `audit/preflight-cognition-option3-20261115` @ `1e007d75b470490fe2ca8943ed5dc91803af039a`.
- UTC de generación: `2026-11-16T13:47:34.208372+00:00`.
- Diff vs main: 164 files changed, 14533 insertions(+), 30 deletions(-). Diff vs documental: 128 files changed, 9117 insertions(+), 30 deletions(-).
- Todas las ramas de implementación enumeradas en [COMMITS.md](checkpoints/COMMITS.md) se publicaron con push explícito sin fuerza. No se tocó main.
- Árbol limpio al congelar código; los únicos cambios posteriores para esta publicación son los informes/helper del checkpoint. Los node_modules enlazados son locales e ignorados. No hay cambios fuente ocultos.
- PRs: ninguna abierta en padre ni dedicada a estas ramas/hijo según consulta GitHub; no se creó ni fusionó PR.

El SHA del commit que añade este informe se obtiene en GitHub y se entrega con la publicación; por autorreferencia no puede figurar dentro de su propio contenido. Todas las pruebas de este checkpoint principal se atribuyen al código congelado anterior, no se reutilizan resultados de un HEAD distinto como si fueran actuales. W6 y el hijo se identifican por separado.

## Worktrees y PR

```text
worktree /workspace/uniscrolliabrain-cloud-agente
HEAD 640a55db01fc9f934bf927dec53e97035f0455f3
branch refs/heads/feat/cognition-v2-runtime-C00-C15

worktree /tmp/agente-cognition-v2-baseline
HEAD 54b8d5407a8576459448c4d059a877297d18ca7a
detached

worktree /workspace/agente-cognition-w4
HEAD 1f63fa9929a48c16f02344a0b1efa52216f2e91a
branch refs/heads/feat/cognition-v2-W6-jev-contract
```

Todos limpios al congelar código. Hijo independiente en `/workspace/agntia-ciberseguridad`, limpio. W4/W5 tienen refs sin worktree propio activo. La documentación de este checkpoint se incorpora después del SHA auditado: el commit del informe no puede incluir su propio hash, que se entrega en la respuesta de publicación.

Consultas GitHub: ninguna PR abierta en el padre; ninguna PR para la rama principal ni para la rama SDK del hijo. La PR histórica #8 no pertenece a este checkpoint. No se ha creado ni fusionado ninguna PR.

Historial completo con SHA, fechas y finalidad: [COMMITS.md](checkpoints/COMMITS.md). Inventario verificable y deltas entre ramas: [FILE-INVENTORY.md](checkpoints/FILE-INVENTORY.md).

## B. Estado de las 16 campañas

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

### C00 — Baseline y mapa de sustitución

Estado **EN CURSO**, estimación **70%**. Baseline reproducible e inventario inicial; no lectura exhaustiva de todo el monorepo y de todas las ramas externas.

**Funcionalidad real:** SHAs congelados, 8 informes de baseline, callgraph y clasificación REUTILIZAR/SUSTITUIR/LEGACY TEMPORAL; comparación de tests y auditorías con main.

**Contratos, interfaces y endpoints:** No endpoint de producto. Baseline main 54b8d54, documentación 1e007d7.

**Dependencias:** Ninguna específica de C00.

**Migraciones:** Ninguna.

**Resultados de pruebas de la campaña:** Baseline histórico: 790 tests, 772 pass, 0 fail, 1 cancelled, 12 skipped, 5 TODO; cancelación de jerarquía LAIA pasó al repetir el foco. Auditorías base 5/7; fuente en 00-baseline/EXECUTION-REPORT.md.

**Bugs corregidos:** Se separaron fallos heredados de cambios V2 y errores de entorno de regresiones.

**Riesgos conocidos:** Hay áreas y proveedores sin auditar; documentación importada no equivale a implementación.

**Dependencias pendientes:** Ampliar consumidores y superficies de negocio conforme se migren.

**Gate pendiente:** Completar inventario/callgraph de consumidores restantes y validar el mapa de retirada con evidencia de cada sustitución.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [docs/auditoria-integral-30-angulos/03-harness-conversacional/ADR-009-REDISENO-SUSTITUTIVO-LEGACY-TRANSITORIO.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/ADR-009-REDISENO-SUSTITUTIVO-LEGACY-TRANSITORIO.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/BITACORA-DECISIONES-Y-RESPUESTAS.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/BITACORA-DECISIONES-Y-RESPUESTAS.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/PREFLIGHT-C00-COMPATIBILIDAD-NO-DESTRUCCION.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/PREFLIGHT-C00-COMPATIBILIDAD-NO-DESTRUCCION.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/PROTOCOLO-CONTINUIDAD-RESPUESTAS-Y-HANDOFF.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/PROTOCOLO-CONTINUIDAD-RESPUESTAS-Y-HANDOFF.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C00-REVISION-ULTRAGRANULAR-AUDITORIA-INCREMENTAL.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C00-REVISION-ULTRAGRANULAR-AUDITORIA-INCREMENTAL.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C00-inventario-exhaustivo-y-mapa-de-destruccion-controlada.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C00-inventario-exhaustivo-y-mapa-de-destruccion-controlada.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C01-REVISION-ULTRAGRANULAR-CONTRATOS-Y-TAXONOMIA-V2.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C01-REVISION-ULTRAGRANULAR-CONTRATOS-Y-TAXONOMIA-V2.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C01-contratos-v2-adr-y-arquitectura-de-sustitucion.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C01-contratos-v2-adr-y-arquitectura-de-sustitucion.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C02-EVENT-BUS-DURABLE-PROYECTOR-COGNITIVO-REPLAY.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C02-EVENT-BUS-DURABLE-PROYECTOR-COGNITIVO-REPLAY.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C02-event-bus-durable-ingest-y-proyector-shadow.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C02-event-bus-durable-ingest-y-proyector-shadow.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C03-REVISION-ULTRAGRANULAR-GRAFO-COGNITIVO-MULTICAPA.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C03-REVISION-ULTRAGRANULAR-GRAFO-COGNITIVO-MULTICAPA.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C03-grafo-multicapa-y-procedencia.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C03-grafo-multicapa-y-procedencia.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C04-CINCO-MEMORIAS-RECUPERACION-RAG-REVOCACION.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C04-CINCO-MEMORIAS-RECUPERACION-RAG-REVOCACION.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C04-cinco-memorias-y-recuperacion-rag.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C04-cinco-memorias-y-recuperacion-rag.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C05-CROMOS-ONTOLOGIA-SEIS-POLARIDADES-MOTOR-V2.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C05-CROMOS-ONTOLOGIA-SEIS-POLARIDADES-MOTOR-V2.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C05-cromos-y-motor-de-atencion-vectorial.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C05-cromos-y-motor-de-atencion-vectorial.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C06-ATENCION-GLOBAL-METACOGNICION-SELECTOR-V2.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C06-ATENCION-GLOBAL-METACOGNICION-SELECTOR-V2.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C06-slow-llm-asincrono-productor-de-conocimiento.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C06-slow-llm-asincrono-productor-de-conocimiento.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C07-SLOW-LLM-ASINCRONO-THOUGHTS-TARJETAS-ENRIQUECIDAS.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C07-SLOW-LLM-ASINCRONO-THOUGHTS-TARJETAS-ENRIQUECIDAS.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C07-clasificador-jev-ai-y-metacognicion-no-autoritativa.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C07-clasificador-jev-ai-y-metacognicion-no-autoritativa.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C08-JEV-CLASIFICADOR-SEMANTICO-NO-AUTORITATIVO.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C08-JEV-CLASIFICADOR-SEMANTICO-NO-AUTORITATIVO.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C08-cardstore-v2-snapshots-y-ledger-de-entrega.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C08-cardstore-v2-snapshots-y-ledger-de-entrega.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C09-CARDSTORE-V2-DELIVERY-LEDGER-LEASE-ACK-REPLAY.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C09-CARDSTORE-V2-DELIVERY-LEDGER-LEASE-ACK-REPLAY.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C09-context-serving-runtime-y-presupuestos-de-tokens.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C09-context-serving-runtime-y-presupuestos-de-tokens.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C10-CONTEXT-SERVING-FACADE-SNAPSHOTS-DELTAS-REFERENCIAS.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C10-CONTEXT-SERVING-FACADE-SNAPSHOTS-DELTAS-REFERENCIAS.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C10-fast-llm-y-router-de-conversacion-v2.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C10-fast-llm-y-router-de-conversacion-v2.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C11-FAST-SLOW-APIS-INDEPENDIENTES-LATENCIA-STREAMING.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C11-FAST-SLOW-APIS-INDEPENDIENTES-LATENCIA-STREAMING.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C11-presenter-y-ux-de-recorrido-pedagogico.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C11-presenter-y-ux-de-recorrido-pedagogico.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C12-PRESENTER-UX-STREAMING-ESTADOS-SVG-ACCESIBILIDAD.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C12-PRESENTER-UX-STREAMING-ESTADOS-SVG-ACCESIBILIDAD.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C12-voz-anam-y-sesiones-multicanal.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C12-voz-anam-y-sesiones-multicanal.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C13-ANAM-AVATAR-VOZ-REALTIME-INTERRUPCIONES-SESIONES.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C13-ANAM-AVATAR-VOZ-REALTIME-INTERRUPCIONES-SESIONES.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C13-adaptador-ciberseguridad-y-eventos-del-dominio.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C13-adaptador-ciberseguridad-y-eventos-del-dominio.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C14-BRIDGE-CIBERSEGURIDAD-PYTHON-TS-GOBERNANZA-EVIDENCIA.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C14-BRIDGE-CIBERSEGURIDAD-PYTHON-TS-GOBERNANZA-EVIDENCIA.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C14-shadow-canary-migracion-y-retiro-de-legacy.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C14-shadow-canary-migracion-y-retiro-de-legacy.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C15-CERTIFICACION-E2E-ACEPTACION-INTEGRAL-HANDOFF-EJECUCION.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C15-CERTIFICACION-E2E-ACEPTACION-INTEGRAL-HANDOFF-EJECUCION.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C15-certificacion-e2e-seguridad-rendimiento-y-handoff-final.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C15-certificacion-e2e-seguridad-rendimiento-y-handoff-final.md)
- [docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/README.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/README.md)
- [docs/implementation/cognition-v2/00-baseline/BASELINE.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/00-baseline/BASELINE.md)
- [docs/implementation/cognition-v2/00-baseline/CALLGRAPH.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/00-baseline/CALLGRAPH.md)
- [docs/implementation/cognition-v2/00-baseline/DEPENDENCY-MAP.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/00-baseline/DEPENDENCY-MAP.md)
- [docs/implementation/cognition-v2/00-baseline/EXECUTION-REPORT.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/00-baseline/EXECUTION-REPORT.md)
- [docs/implementation/cognition-v2/00-baseline/LEGACY-CLASSIFICATION.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/00-baseline/LEGACY-CLASSIFICATION.md)
- [docs/implementation/cognition-v2/00-baseline/README.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/00-baseline/README.md)
- [docs/implementation/cognition-v2/00-baseline/REPO-INVENTORY.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/00-baseline/REPO-INVENTORY.md)
- [docs/implementation/cognition-v2/00-baseline/RISKS.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/00-baseline/RISKS.md)

**Archivos existentes modificados:**

Ninguno atribuido en este inventario.

**Tests identificados:**

Ninguno atribuido en este inventario.

**Commits del patchset:**

- [8ac7a0003d42d6609fbf3fc4d64dd3b39eba792f](https://github.com/uniscrolliabrain-cloud/agente/commit/8ac7a0003d42d6609fbf3fc4d64dd3b39eba792f) — docs(cognition): C00 freeze references and substitution baseline

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

### C01 — Contratos y migración

Estado **EN CURSO**, estimación **60%**. Contratos strict y backfill gobernado funcionan; catálogo global y mapping de dominio incompletos.

**Funcionalidad real:** Identidad/ref/epistemicidad/visibilidad, DTOs versionados; adaptador conservador V1; planes paginados, digest, expiración, receipts y replay de importación; owner incluido en clave canónica.

**Contratos, interfaces y endpoints:** POST /api/cognition-v2/migration/legacy-cards/prepare y /:id/apply; runtime identidad de sesión; CognitiveRecord, CognitiveRef, planes 1.0 y resolver versionado.

**Dependencias:** Zod ya existente. Sin dependencia nueva para backfill.

**Migraciones:** cognition_v2_import_plans/import_receipts aditivas, incluidas en RLS; sin borrado V1 ni cutover real.

**Resultados de pruebas de la campaña:** W4 suite V2 42/42 PASS con Postgres; foco nativo/HTTP 8/8; foco versionado backfill 5/5. Último gate completo W4 832 tests /815 pass/0 fail/12 skip/5 TODO. Resultados nuevos del checkpoint en TEST-RESULTS.md.

**Bugs corregidos:** No promover legacy a hecho; IDs largos; colisión de ID entre owners; references perdidas; cambio de fuente/plan; duplicados y rollback de página.

**Riesgos conocidos:** Resolvedor predeterminado no cubre entidades ni memorias V1 no migradas; sin snapshot global consistente del tenant.

**Dependencias pendientes:** Adaptadores de dominio autorizados, reconciliación de cambios y retención de planes.

**Gate pendiente:** Migración/corpus completos, versiones y revocaciones de todas las fuentes, cutover progresivo y retirada de lectores V1.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [apps/server/src/cognition-v2-routes.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/cognition-v2-routes.ts)
- [apps/server/src/engine/cognition/v2/legacy-adapter.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/legacy-adapter.ts)
- [apps/server/src/engine/cognition/v2/legacy-backfill.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/legacy-backfill.ts)
- [packages/domain/src/card-ontology.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/packages/domain/src/card-ontology.ts)
- [packages/domain/src/cognition-v2.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/packages/domain/src/cognition-v2.ts)
- [packages/domain/src/cognitive-reference.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/packages/domain/src/cognitive-reference.ts)
- [packages/domain/src/runtime-outcome.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/packages/domain/src/runtime-outcome.ts)
- [tests/cognition-v2-backfill.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-backfill.test.ts)
- [tests/cognition-v2-contracts.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-contracts.test.ts)
- [tests/cognition-v2-migration.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-migration.test.ts)

**Archivos existentes modificados:**

- [apps/server/src/db-tenant.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/db-tenant.ts)

**Tests identificados:**

- [tests/cognition-v2-contracts.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-contracts.test.ts)
- [tests/cognition-v2-migration.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-migration.test.ts)
- [tests/cognition-v2-backfill.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-backfill.test.ts)
- [tests/cognition-v2-http.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-http.test.ts)

**Commits del patchset:**

- [cb2ddebcccbf440e7f5086f4b0abbb720c62e500](https://github.com/uniscrolliabrain-cloud/agente/commit/cb2ddebcccbf440e7f5086f4b0abbb720c62e500) — feat(cognition): C01 PS01 strict versioned cognitive contracts
- [119fbf285e60220e92c2fcda0c52e2d9ee09d68e](https://github.com/uniscrolliabrain-cloud/agente/commit/119fbf285e60220e92c2fcda0c52e2d9ee09d68e) — fix(cognition): C01 preserve uncertainty and scope in legacy migration
- [af3b16d244b64660a28faa7d47f0b4f73edf5ec2](https://github.com/uniscrolliabrain-cloud/agente/commit/af3b16d244b64660a28faa7d47f0b4f73edf5ec2) — feat(cognition): C01 stage resumable legacy backfill with scoped evidence and receipts

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

### C02 — Event Bus durable y replay

Estado **EN CURSO**, estimación **60%**. Journal/proyector fiables en fixtures y Postgres; consumidores legacy siguen sin delivery durable completo.

**Funcionalidad real:** Transacción real por conexión/AsyncLocalStorage, afterCommit, recibos pending/committed/unknown, journal ordenado por tenant, cursor/inbox/leases/fence/retry/DLQ.

**Contratos, interfaces y endpoints:** Eventos cognition.v2.record.proposed, source.revoked, slow.status; DurableEventSink/DurableProjector; no segundo bus ni exactly-once distribuido.

**Dependencias:** pg/PGlite ya existentes; no broker externo nuevo.

**Migraciones:** Journal/sequences/cursors/inbox/objects/edges/revocations aditivos; scan_actor para recuperación; RLS explícita, runtime compartido falla cerrado.

**Resultados de pruebas de la campaña:** 501 eventos y caída/fencing/replay comprobados; tanda nativa W3 5/5; W4 gate 832/815/0/12/5. Harness de eventos reforzado: 3/3 focal PASS; no inferir que todos los subscribers legacy son durables.

**Bugs corregidos:** BEGIN en pool sin pinning; estado global de transacción; publicación precommit; ACK de COMMIT perdido; fencing de fallos; éxito persistido confundido con fallo de notificación.

**Riesgos conocidos:** Índices/notifications/metrics legacy fire-and-forget; RLS compartido global no integrado; retención y operación de DLQ incompletas.

**Dependencias pendientes:** Migrar subscribers, reconciliación/rebuild operacional y controles por rol restringido en todo el runtime.

**Gate pendiente:** Demostrar recuperación integral de todos los consumidores, aislamiento compartido, restore/retención y equivalencia de rebuild a escala.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [apps/server/src/engine/cognition/v2/projector.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/projector.ts)
- [apps/server/src/engine/cognition/v2/rls.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/rls.ts)
- [apps/server/src/engine/cognition/v2/storage.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/storage.ts)
- [tests/cognition-v2-durability.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-durability.test.ts)
- [tests/cognition-v2-event-receipts.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-event-receipts.test.ts)
- [tests/cognition-v2-faults.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-faults.test.ts)
- [tests/cognition-v2-postgres.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-postgres.test.ts)
- [tests/cognition-v2-transactions.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-transactions.test.ts)

**Archivos existentes modificados:**

- [apps/server/src/db-tenant.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/db-tenant.ts)
- [apps/server/src/db.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/db.ts)
- [apps/server/src/engine/events/bus.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/events/bus.ts)
- [apps/server/src/engine/events/schemas.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/events/schemas.ts)
- [apps/server/src/engine/events/types.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/events/types.ts)
- [tests/event-bus.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/event-bus.test.ts)

**Tests identificados:**

- [tests/cognition-v2-durability.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-durability.test.ts)
- [tests/cognition-v2-event-receipts.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-event-receipts.test.ts)
- [tests/cognition-v2-postgres.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-postgres.test.ts)
- [tests/cognition-v2-transactions.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-transactions.test.ts)
- [tests/cognition-v2-faults.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-faults.test.ts)
- [tests/event-bus.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/event-bus.test.ts)

**Commits del patchset:**

- [cf72046f34b37ae5fa4595f71d0b7048eb616ead](https://github.com/uniscrolliabrain-cloud/agente/commit/cf72046f34b37ae5fa4595f71d0b7048eb616ead) — fix(cognition): C02 bind transactions to async connection scope
- [ff07febdad307023b379014fff2bfe8d6cdce243](https://github.com/uniscrolliabrain-cloud/agente/commit/ff07febdad307023b379014fff2bfe8d6cdce243) — feat(cognition): C02-C10 durable projection and authorized card delivery slice
- [1f3eeb4aea8ca4526dd5967aa4da8c84d9261592](https://github.com/uniscrolliabrain-cloud/agente/commit/1f3eeb4aea8ca4526dd5967aa4da8c84d9261592) — fix(cognition): C02 publish nested events only after outer commit
- [738a5762c7b80c834f1a8b8718d08dd1560026a7](https://github.com/uniscrolliabrain-cloud/agente/commit/738a5762c7b80c834f1a8b8718d08dd1560026a7) — fix(cognition): C15 close dispatch revocation and unknown commit gaps
- [55eb692d921cf10b43432a8f2f208bf49da5375d](https://github.com/uniscrolliabrain-cloud/agente/commit/55eb692d921cf10b43432a8f2f208bf49da5375d) — test(cognition): C02 require durable receipts for every event type

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

### C03 — Grafo cognitivo multicapa

Estado **EN CURSO**, estimación **35%**. Proyección de referencias y relaciones funcional; no grafo empresarial completo ni consolidación semántica avanzada.

**Funcionalidad real:** Nodos cognitivos/revisiones, derived_from, queries autorizadas acotadas, evidencia Thought/event/receipt y revocación transitiva; grafo proyección, nunca autoridad empresarial.

**Contratos, interfaces y endpoints:** GET /api/cognition-v2/graph/:id; CognitiveGraphQuery.neighbors/evidence; referencias canónicas con tenant/revisión.

**Dependencias:** Ninguna específica.

**Migraciones:** Objetos/aristas/tombstones aditivos compartidos con C02.

**Resultados de pruebas de la campaña:** Restart/revocación y evidencia real de Thought probados; W5 foco resultados/ontología 6/6 y memoria 4/4 PASS; no benchmark de grafo denso.

**Bugs corregidos:** Ocultar Thought reasoning público; latest antes de revocación; evitar resurrección de derivados tardíos.

**Riesgos conocidos:** Consultas depth<=3/nodos<=50; relaciones de dominio, resolución de entidades y consolidación no completas.

**Dependencias pendientes:** C01/C02, autorizadores de dominio y dataset de grafo a escala.

**Gate pendiente:** Reconstrucción multicapa completa, dedupe/consolidación y consultas/invalidación autorizadas a escala.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [apps/server/src/engine/cognition/v2/graph.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/graph.ts)
- [apps/server/src/engine/cognition/v2/projector.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/projector.ts)
- [apps/server/src/engine/cognition/v2/storage.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/storage.ts)
- [packages/domain/src/cognition-v2.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/packages/domain/src/cognition-v2.ts)

**Archivos existentes modificados:**

Ninguno atribuido en este inventario.

**Tests identificados:**

- [tests/cognition-v2-durability.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-durability.test.ts)
- [tests/cognition-v2-faults.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-faults.test.ts)
- [tests/cognition-v2-http.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-http.test.ts)
- [tests/cognition-v2-runtime-outcome.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-runtime-outcome.test.ts)

**Commits del patchset:**

- [1da67c68e3b87566046ed8c29cc3d11dcd80209d](https://github.com/uniscrolliabrain-cloud/agente/commit/1da67c68e3b87566046ed8c29cc3d11dcd80209d) — feat(cognition): C03-C06 project scoped memories graph RAG and attention
- [738a5762c7b80c834f1a8b8718d08dd1560026a7](https://github.com/uniscrolliabrain-cloud/agente/commit/738a5762c7b80c834f1a8b8718d08dd1560026a7) — fix(cognition): C15 close dispatch revocation and unknown commit gaps
- [812ea3601473257a03292926b79299d31822c657](https://github.com/uniscrolliabrain-cloud/agente/commit/812ea3601473257a03292926b79299d31822c657) — feat(cognition): C05 derive scoped outcome cards from verified runtime receipts

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

### C04 — Cinco memorias, RAG y revocación

Estado **EN CURSO**, estimación **50%**. Cinco métodos funcionales y RAG real reutilizado; automatización y políticas completas pendientes.

**Funcionalidad real:** Episódica/procedimental desde eventos, semántica desde tarjeta, autobiográfica desde episodios y trabajo con TTL; RAG preparado fuera de Fast, versionado por digest/reingesta y retirada.

**Contratos, interfaces y endpoints:** POST /working, GET /memories?kind=..., POST /rag/prepare; métodos de memoria internos con referencias/autorización.

**Dependencias:** Reutiliza RagService/stores existentes; sin vector DB duplicada.

**Migraciones:** rag_refs y metadata contentDigest, sin backfill destructivo de documentos.

**Resultados de pruebas de la campaña:** Pipeline de cinco memorias, TTL, reinicio y revocación; RAG de fuente corregida/reingestada probado; foco posterior de memoria/resultados 4/4 PASS.

**Bugs corregidos:** Revisión externa igual con contenido distinto; hits de índice de generación vieja; transitive revoke; síntesis no hereda verificación automáticamente.

**Riesgos conocidos:** Falta creación/consolidación automática transversal, recall a escala, retención y memoria compartida con ACL completas.

**Dependencias pendientes:** Fuentes/domain resolvers, quality corpus y gobernanza de memoria.

**Gate pendiente:** Todas las memorias integradas con productores/consumidores reales, calidad y aislamiento/retención/revocación a escala.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [apps/server/src/engine/cognition/v2/memory.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/memory.ts)
- [apps/server/src/engine/cognition/v2/rag.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/rag.ts)
- [tests/cognition-v2-memory-attention.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-memory-attention.test.ts)
- [tests/cognition-v2-rag.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-rag.test.ts)

**Archivos existentes modificados:**

- [apps/server/src/engine/rag.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/rag.ts)

**Tests identificados:**

- [tests/cognition-v2-memory-attention.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-memory-attention.test.ts)
- [tests/cognition-v2-rag.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-rag.test.ts)
- [tests/cognition-v2-durability.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-durability.test.ts)
- [tests/cognition-v2-runtime-outcome.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-runtime-outcome.test.ts)

**Commits del patchset:**

- [1da67c68e3b87566046ed8c29cc3d11dcd80209d](https://github.com/uniscrolliabrain-cloud/agente/commit/1da67c68e3b87566046ed8c29cc3d11dcd80209d) — feat(cognition): C03-C06 project scoped memories graph RAG and attention
- [738a5762c7b80c834f1a8b8718d08dd1560026a7](https://github.com/uniscrolliabrain-cloud/agente/commit/738a5762c7b80c834f1a8b8718d08dd1560026a7) — fix(cognition): C15 close dispatch revocation and unknown commit gaps
- [812ea3601473257a03292926b79299d31822c657](https://github.com/uniscrolliabrain-cloud/agente/commit/812ea3601473257a03292926b79299d31822c657) — feat(cognition): C05 derive scoped outcome cards from verified runtime receipts

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

### C05 — Ontología y cromos

Estado **EN CURSO**, estimación **55%**. Semántica aprobada e integración inicial; falta demostrar mejora de calidad y rendimiento.

**Funcionalidad real:** Ocho familias, seis polos en tres pares, diez dimensiones tipadas/null, registro/digest/aprobación/revocación, desacuerdo persistido; outcomes de jobs desde recibos reales.

**Contratos, interfaces y endpoints:** agntiapro.cards@1.0.0; founder-20261116-card-ontology-001; CardOntologyService y RuntimeOutcomeProjector. Sin nueva semántica en kernel.

**Dependencias:** Ninguna específica; Zod existente.

**Migraciones:** Registro/decisiones/revocaciones en records; sin migrar automáticamente cromos legacy.

**Resultados de pruebas de la campaña:** C05 foco 3/3; resultados+ontología 6/6; W5 suite V2 45/45 PASS y foco de memoria derivada posterior 4/4 PASS. No prueba de rendimiento empresarial ni proveedor real.

**Bugs corregidos:** Desconocido convertido en 0; aprobación autoreportada; summary inconsistente; outcome inferido como hecho; referencias ajenas; pérdida de incertidumbre legacy.

**Riesgos conocidos:** Dimensiones propuestas no calibradas ni utilizadas como ranking óptimo; outcomes verificados limitados a jobs Slow, no pagos/SOP/acciones de negocio.

**Dependencias pendientes:** Ablaciones, corpus gold, verificadores de dominio y benchmarks. La aprobación humana de ontología YA ESTÁ RESUELTA.

**Gate pendiente:** Completar integraciones/normalización e invalidación operacional y demostrar beneficio con corpus y carga. No falta nombrar los polos.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [apps/server/src/engine/cognition/chromatic/card-ontology.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/chromatic/card-ontology.ts)
- [apps/server/src/engine/cognition/chromatic/ontology-registry.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/chromatic/ontology-registry.ts)
- [apps/server/src/engine/cognition/v2/runtime-outcome.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/runtime-outcome.ts)
- [docs/implementation/cognition-v2/C05/ADR-CHROMATIC-ONTOLOGY.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C05/ADR-CHROMATIC-ONTOLOGY.md)
- [docs/implementation/cognition-v2/C05/APPROVAL-20261116.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C05/APPROVAL-20261116.md)
- [docs/implementation/cognition-v2/C05/IMPLEMENTATION-REPORT.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C05/IMPLEMENTATION-REPORT.md)
- [docs/implementation/cognition-v2/C05/PROPOSAL-ONTOLOGY-V1.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C05/PROPOSAL-ONTOLOGY-V1.md)
- [packages/domain/src/card-ontology.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/packages/domain/src/card-ontology.ts)
- [packages/domain/src/runtime-outcome.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/packages/domain/src/runtime-outcome.ts)
- [tests/cognition-v2-ontology.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-ontology.test.ts)
- [tests/cognition-v2-runtime-outcome.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-runtime-outcome.test.ts)

**Archivos existentes modificados:**

Ninguno atribuido en este inventario.

**Tests identificados:**

- [tests/cognition-v2-ontology.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-ontology.test.ts)
- [tests/cognition-v2-runtime-outcome.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-runtime-outcome.test.ts)

**Commits del patchset:**

- [fab62999b735838d310bed2dbcd0a21482bbe9df](https://github.com/uniscrolliabrain-cloud/agente/commit/fab62999b735838d310bed2dbcd0a21482bbe9df) — feat(cognition): C05 apply approved card ontology to Slow projections and context
- [812ea3601473257a03292926b79299d31822c657](https://github.com/uniscrolliabrain-cloud/agente/commit/812ea3601473257a03292926b79299d31822c657) — feat(cognition): C05 derive scoped outcome cards from verified runtime receipts

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

### C06 — Atención global y metacognición

Estado **EN CURSO**, estimación **40%**. Persistencia y señales disponibles; integración multiagente/global incompleta.

**Funcionalidad real:** Workspace persistido, scoring versionado, dedupe por selección/digest y metahints de resultados desde eventos; estado no concede permisos ni ejecuta acciones.

**Contratos, interfaces y endpoints:** POST /attention; GlobalAttentionWorkspace.select; hints persistentes con fuente/revisión.

**Dependencias:** Ninguna específica.

**Migraciones:** cognition_v2_attention y objetos meta_hint.

**Resultados de pruebas de la campaña:** Persistencia/dedupe/revocación local probados; no evaluación global multiagente ni estabilidad bajo carga prolongada.

**Bugs corregidos:** Estado efímero como única garantía se evita en el nuevo workspace; scoring se mantiene separado de ACL.

**Riesgos conocidos:** El ranking de ContextServing todavía no consume integralmente el workspace global; reglas/ACK de todos los hints y calibración faltan.

**Dependencias pendientes:** C03/C04/C07/C10 y políticas de foco compartido.

**Gate pendiente:** Workspace completo integrado con todos los consumidores, reconstrucción, concurrencia y evaluación multiagente.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [apps/server/src/engine/cognition/v2/attention.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/attention.ts)
- [apps/server/src/engine/cognition/v2/projector.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/projector.ts)
- [tests/cognition-v2-memory-attention.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-memory-attention.test.ts)

**Archivos existentes modificados:**

Ninguno atribuido en este inventario.

**Tests identificados:**

- [tests/cognition-v2-memory-attention.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-memory-attention.test.ts)
- [tests/cognition-v2-durability.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-durability.test.ts)

**Commits del patchset:**

- [1da67c68e3b87566046ed8c29cc3d11dcd80209d](https://github.com/uniscrolliabrain-cloud/agente/commit/1da67c68e3b87566046ed8c29cc3d11dcd80209d) — feat(cognition): C03-C06 project scoped memories graph RAG and attention
- [eb08ef1335ab17ddaa60666b0494398707b77dd9](https://github.com/uniscrolliabrain-cloud/agente/commit/eb08ef1335ab17ddaa60666b0494398707b77dd9) — feat(cognition): C07-C12 wire independent inference and factual runtime receipts

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

### C07 — Slow LLM asíncrono

Estado **EN CURSO**, estimación **60%**. Trabajo durable completo a nivel de slice; extracción avanzada/proveedor/coste no certificados.

**Funcionalidad real:** Cola/worker, lease/fence, retries, output persistido antes de extracción, captura kernel idempotente de Thought cerrado, tarjetas enriquecidas, cancelación, fallo terminal auditable.

**Contratos, interfaces y endpoints:** POST /slow, POST /slow/:id/cancel; SlowCognitionQueue; captureAsyncResult; proceso independiente con Postgres o embedded explícito con PGlite.

**Dependencias:** @ai-sdk/openai, @ai-sdk/google y @ai-sdk/anthropic declarados directamente para providers reales; ninguna inferencia de pago probada.

**Migraciones:** slow_jobs, output/classification/failure_code y slots/cuotas durables.

**Resultados de pruebas de la campaña:** Reinicio lógico, cancelación, agotamiento, fallos proveedor/esquema y captura real probados; W4 42/42 y W5 45/45 V2 PASS.

**Bugs corregidos:** Dependencia de turno padre abierto; captura duplicada; cancelación tardía; jobs agotados sin estado terminal; evidencia fabricada; COMMIT incierto.

**Riesgos conocidos:** Faltan extracción multiclaim avanzada, proveedores reales, observabilidad operacional completa y costes calibrados.

**Dependencias pendientes:** C02/C03/C04 y modelos/configuración/budgets de prueba real.

**Gate pendiente:** Recuperación/retry/errores demostrados bajo carga real y todas las etapas de enriquecimiento, verificación y procedencia.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [apps/server/src/cognition-worker-entry.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/cognition-worker-entry.ts)
- [apps/server/src/engine/cognition/v2/slow.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/slow.ts)
- [apps/server/src/engine/cognition/v2/workers.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/workers.ts)
- [tests/cognition-v2-slow-lanes.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-slow-lanes.test.ts)

**Archivos existentes modificados:**

- [apps/server/src/kernel/graph/store-store.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/kernel/graph/store-store.ts)
- [apps/server/src/kernel/graph/store.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/kernel/graph/store.ts)
- [apps/server/src/kernel/kernel.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/kernel/kernel.ts)

**Tests identificados:**

- [tests/cognition-v2-slow-lanes.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-slow-lanes.test.ts)
- [tests/cognition-v2-faults.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-faults.test.ts)
- [tests/cognition-v2-http.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-http.test.ts)
- [tests/cognition-v2-ontology.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-ontology.test.ts)

**Commits del patchset:**

- [0f77eb42d3cb1f5d4f72f3b1130f6881ea9c6dc6](https://github.com/uniscrolliabrain-cloud/agente/commit/0f77eb42d3cb1f5d4f72f3b1130f6881ea9c6dc6) — feat(cognition): C07 capture asynchronous results idempotently in kernel
- [eb08ef1335ab17ddaa60666b0494398707b77dd9](https://github.com/uniscrolliabrain-cloud/agente/commit/eb08ef1335ab17ddaa60666b0494398707b77dd9) — feat(cognition): C07-C12 wire independent inference and factual runtime receipts
- [fab62999b735838d310bed2dbcd0a21482bbe9df](https://github.com/uniscrolliabrain-cloud/agente/commit/fab62999b735838d310bed2dbcd0a21482bbe9df) — feat(cognition): C05 apply approved card ontology to Slow projections and context

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

### C08 — JEV no autoritativo

Estado **EN CURSO**, estimación **40%**. Puerto/baseline en main; adaptador documentalmente verificado en rama W6, aún inactivo externamente.

**Funcionalidad real:** Main: clasificador opcional acotado/fallback, contexto autorizado y rechazo de anclas ajenas. W6: REST TypeSafe documentado, siete Choice, minimización/gateway obligatorio, uso y confianza no calibrada.

**Contratos, interfaces y endpoints:** SemanticClassifier / SemanticEvaluationContext en main. TypesafeJevClassifier / JevEgressGate / providerEvidence en W6. No endpoint de autoaprobación ni integración externa automática.

**Dependencias:** W6 usa fetch nativo sin dependencias nuevas; SDK oficial identificado, no instalado.

**Migraciones:** W6 no crea ledger/PDP de egreso: exige uno por puerto; no pretende que un array de pruebas sea garantía durable.

**Resultados de pruebas de la campaña:** W6: 7/7 foco y validación wire contra OpenAPI oficial PASS; suite V2 de la rama del checkpoint 52/52 PASS, 113.837 s. Cero llamadas de inferencia reales.

**Bugs corregidos:** Proveedor ficticio evitado; etiquetas malformadas, drift de versión, references cross-tenant, timeout y accounting desconocido rechazados/controlados.

**Riesgos conocidos:** No cuenta/clave validada, gateway/PDP/cuotas durables sin implementación/configuración productiva, ni calibración/corpus real. Main no incorpora todavía W6.

**Dependencias pendientes:** Credenciales, egreso gobernado y prueba sintética real, términos/retención aplicables; integración de W6 después del checkpoint.

**Gate pendiente:** Integrar adapter real gobernado, probar sandbox/fallos/budgets, calibrar gold corpus y medir coste/calidad sin afectar Fast.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [apps/server/src/engine/cognition/v2/slow.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/slow.ts)
- [packages/domain/src/cognition-v2.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/packages/domain/src/cognition-v2.ts)
- [apps/server/src/engine/cognition/v2/jev-classifier.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/1f63fa9929a48c16f02344a0b1efa52216f2e91a/apps/server/src/engine/cognition/v2/jev-classifier.ts)
- [docs/implementation/cognition-v2/C08/JEV-PROVIDER-VERIFICATION.md](https://github.com/uniscrolliabrain-cloud/agente/blob/1f63fa9929a48c16f02344a0b1efa52216f2e91a/docs/implementation/cognition-v2/C08/JEV-PROVIDER-VERIFICATION.md)
- [docs/implementation/cognition-v2/C08/evidence/TYPESAFE-CONTRACT.json](https://github.com/uniscrolliabrain-cloud/agente/blob/1f63fa9929a48c16f02344a0b1efa52216f2e91a/docs/implementation/cognition-v2/C08/evidence/TYPESAFE-CONTRACT.json)
- [docs/implementation/cognition-v2/C08/evidence/TYPESAFE-WIRE-VALIDATION.json](https://github.com/uniscrolliabrain-cloud/agente/blob/1f63fa9929a48c16f02344a0b1efa52216f2e91a/docs/implementation/cognition-v2/C08/evidence/TYPESAFE-WIRE-VALIDATION.json)
- [tests/cognition-v2-jev.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/1f63fa9929a48c16f02344a0b1efa52216f2e91a/tests/cognition-v2-jev.test.ts)

**Archivos existentes modificados:**

Ninguno atribuido en este inventario.

**Tests identificados:**

- [tests/cognition-v2-slow-lanes.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-slow-lanes.test.ts)
- [tests/cognition-v2-ontology.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-ontology.test.ts)
- [tests/cognition-v2-jev.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/1f63fa9929a48c16f02344a0b1efa52216f2e91a/tests/cognition-v2-jev.test.ts)

**Commits del patchset:**

- [fab62999b735838d310bed2dbcd0a21482bbe9df](https://github.com/uniscrolliabrain-cloud/agente/commit/fab62999b735838d310bed2dbcd0a21482bbe9df) — feat(cognition): C05 apply approved card ontology to Slow projections and context
- [1f63fa9929a48c16f02344a0b1efa52216f2e91a](https://github.com/uniscrolliabrain-cloud/agente/commit/1f63fa9929a48c16f02344a0b1efa52216f2e91a)

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

### C09 — CardStore y delivery ledger

Estado **EN CURSO**, estimación **55%**. Conocimiento/entrega separados y recuperación probada; nuevo P1 de correlación por turno permanece abierto.

**Funcionalidad real:** Revisiones inmutables, leases/fencing, render/ACK idempotente, revocación/restart y worker de recuperación con cursor/receipts atómicos.

**Contratos, interfaces y endpoints:** CardDeliveryLedger.reserve/rendered/ack/recover; DeliveryRecoveryWorker. ACK interno, no ACK de recepción del navegador.

**Dependencias:** Ninguna específica.

**Migraciones:** deliveries/delivery_recoveries; scan_actor; sin consumo/destrucción del conocimiento.

**Resultados de pruebas de la campaña:** Recuperación PGlite 2/2 y native Postgres 1/1 PASS; tanda nativa 5/5. Repro de auditoría exit 1: 3 chat_runs completed, 1 entrega acknowledged, esperadas 3 por turno.

**Bugs corregidos:** ACK pre-render, fence viejo, reintentos tras restart y expiración de snapshot/lease corregidos. Gap per-run recién detectado, SIN corregir en este checkpoint.

**Riesgos conocidos:** P1 delivery ID ligado a snapshot/actor, no a thread/run. ACK representa consumo servidor, no recepción del cliente; retención y operación prolongada pendientes.

**Dependencias pendientes:** Correlación por consumidor/turno y contrato explícito de ACK cliente/servidor; validación de streaming desconectado.

**Gate pendiente:** Corregir el P1 y demostrar entrega trazable por consumidor bajo desconexión/replay; migración masiva y recuperación operacional completas.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [apps/server/src/engine/cognition/v2/context.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/context.ts)
- [apps/server/src/engine/cognition/v2/delivery-recovery.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/delivery-recovery.ts)
- [apps/server/src/engine/cognition/v2/storage.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/storage.ts)
- [scripts/repro-cognition-delivery-reuse.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/scripts/repro-cognition-delivery-reuse.ts)
- [tests/cognition-v2-delivery-recovery.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-delivery-recovery.test.ts)

**Archivos existentes modificados:**

Ninguno atribuido en este inventario.

**Tests identificados:**

- [tests/cognition-v2-durability.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-durability.test.ts)
- [tests/cognition-v2-delivery-recovery.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-delivery-recovery.test.ts)
- [scripts/repro-cognition-delivery-reuse.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/scripts/repro-cognition-delivery-reuse.ts)

**Commits del patchset:**

- [ff07febdad307023b379014fff2bfe8d6cdce243](https://github.com/uniscrolliabrain-cloud/agente/commit/ff07febdad307023b379014fff2bfe8d6cdce243) — feat(cognition): C02-C10 durable projection and authorized card delivery slice
- [b323ab358d4e5ddb59efcd7e3032d20edd0ae4c9](https://github.com/uniscrolliabrain-cloud/agente/commit/b323ab358d4e5ddb59efcd7e3032d20edd0ae4c9) — feat(cognition): C09 recover abandoned deliveries with durable scan and fencing
- [40b12dc3b83e069ab81ffc3d8290131db60d446e](https://github.com/uniscrolliabrain-cloud/agente/commit/40b12dc3b83e069ab81ffc3d8290131db60d446e) — test(cognition): C09 prove concurrent recovery on native Postgres
- [640a55db01fc9f934bf927dec53e97035f0455f3](https://github.com/uniscrolliabrain-cloud/agente/commit/640a55db01fc9f934bf927dec53e97035f0455f3) — test(cognition): C09 checkpoint reproduce per-run delivery ledger gap

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

### C10 — ContextServingFacade

Estado **EN CURSO**, estimación **60%**. Snapshots/deltas/ref/invalidación funcionan; faltan todos los consumidores y tokenizer real.

**Funcionalidad real:** Contexto autorizado, presupuestos, watermark, caché por consulta/política, referencias y deltas internos; RAG preparado fuera del camino Fast; revalidación antes de dispatch.

**Contratos, interfaces y endpoints:** POST /snapshots, GET /snapshots/:id, GET/DELETE /references/:id, /graph/:id, /rag/prepare. getDelta es método interno, no endpoint publicado dedicado.

**Dependencias:** Ninguna específica.

**Migraciones:** snapshots con queryDigest; cursors/watermarks y refs reutilizados.

**Resultados de pruebas de la campaña:** Caché por consulta/revocación 1/1 PASS; HTTP y core V2 integrados. Sin pruebas de todos los renderers o consumidores empresariales.

**Bugs corregidos:** Snapshot de otra pregunta; cache stale de fuente; revocación entre preparar y admitir inferencia; referencias de reasoning internas públicas.

**Riesgos conocidos:** tokens usa cota de bytes UTF-8, no contador exacto; selección acotada y alcance privado/self-read; falta integración completa de atención/coletores.

**Dependencias pendientes:** Tokenizers por modelo, PDP/consumers agentes/middleware y carga real.

**Gate pendiente:** Snapshots/deltas consistentes para todos los consumidores, autorizados por políticas completas, medidos bajo fallos/carga.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [apps/server/src/cognition-v2-routes.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/cognition-v2-routes.ts)
- [apps/server/src/engine/cognition/v2/context.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/context.ts)
- [tests/cognition-v2-context-cache.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-context-cache.test.ts)
- [tests/cognition-v2-http.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-http.test.ts)

**Archivos existentes modificados:**

Ninguno atribuido en este inventario.

**Tests identificados:**

- [tests/cognition-v2-context-cache.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-context-cache.test.ts)
- [tests/cognition-v2-durability.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-durability.test.ts)
- [tests/cognition-v2-rag.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-rag.test.ts)
- [tests/cognition-v2-runtime.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-runtime.test.ts)

**Commits del patchset:**

- [ff07febdad307023b379014fff2bfe8d6cdce243](https://github.com/uniscrolliabrain-cloud/agente/commit/ff07febdad307023b379014fff2bfe8d6cdce243) — feat(cognition): C02-C10 durable projection and authorized card delivery slice
- [1da67c68e3b87566046ed8c29cc3d11dcd80209d](https://github.com/uniscrolliabrain-cloud/agente/commit/1da67c68e3b87566046ed8c29cc3d11dcd80209d) — feat(cognition): C03-C06 project scoped memories graph RAG and attention
- [393b990338a9ceb7f54cdcdabae2f364bd71feb2](https://github.com/uniscrolliabrain-cloud/agente/commit/393b990338a9ceb7f54cdcdabae2f364bd71feb2) — fix(cognition): C10 bind prepared snapshots to the requested query
- [738a5762c7b80c834f1a8b8718d08dd1560026a7](https://github.com/uniscrolliabrain-cloud/agente/commit/738a5762c7b80c834f1a8b8718d08dd1560026a7) — fix(cognition): C15 close dispatch revocation and unknown commit gaps

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

### C11 — Fast y Slow independientes

Estado **EN CURSO**, estimación **55%**. Separación operativa demostrada con fixtures; no migración de herramientas ni SLO/costes reales.

**Funcionalidad real:** Providers/config/pools/cuotas/circuitos/timeouts separados; Fast sin fallback Slow, streaming AG-UI y persistencia exacta del texto emitido.

**Contratos, interfaces y endpoints:** Ruta conversacional V2 opt-in por COGNITION_V2_TENANTS; fastOnlyModel; provider streaming. La ruta Fast usa tools=[] y aún no despacha acciones empresariales V2.

**Dependencias:** Tres SDKs AI declarados directamente; Fast/Slow requieren perfiles explícitos.

**Migraciones:** lane_slots/usage/locks y chat_runs durables.

**Resultados de pruebas de la campaña:** Fast con Slow saturado, errores/timeouts/cancelación y 10 muestras TTFT de proveedor en proceso. No son SLA ni costes del proveedor.

**Bugs corregidos:** Fallback cruzado; circuitos contaminados por cancelación; llamadas cobradas antes de abort; incoherencia respuesta/stream y actor desactivado.

**Riesgos conocidos:** P1 funcional: tools de negocio/delegación siguen V1; habilitar V2 no ofrece paridad empresarial. Cuotas de llamadas no equivalen a facturación real.

**Dependencias pendientes:** Migración de capacidades/SOPs y modelos/corpus/load/costes reales.

**Gate pendiente:** Paridad de capacidades gobernadas y medición TTFT p50/p95/p99 bajo saturación/proveedor/coste real con objetivos aprobados.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [apps/server/src/engine/cognition/v2/inference.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/inference.ts)
- [apps/server/src/engine/cognition/v2/provider.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/provider.ts)
- [apps/server/src/engine/cognition/v2/runtime.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/runtime.ts)

**Archivos existentes modificados:**

- [apps/server/src/agent.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/agent.ts)
- [apps/server/src/app.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/app.ts)
- [apps/server/src/engine/conversation.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/conversation.ts)

**Tests identificados:**

- [tests/cognition-v2-slow-lanes.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-slow-lanes.test.ts)
- [tests/cognition-v2-runtime.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-runtime.test.ts)
- [tests/cognition-v2-faults.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-faults.test.ts)

**Commits del patchset:**

- [d674bc8ad3e6bdc4528e4aeeae19c21ed651cb2b](https://github.com/uniscrolliabrain-cloud/agente/commit/d674bc8ad3e6bdc4528e4aeeae19c21ed651cb2b) — build(cognition): pin independent provider clients and verified cyber SDK
- [eb08ef1335ab17ddaa60666b0494398707b77dd9](https://github.com/uniscrolliabrain-cloud/agente/commit/eb08ef1335ab17ddaa60666b0494398707b77dd9) — feat(cognition): C07-C12 wire independent inference and factual runtime receipts
- [738a5762c7b80c834f1a8b8718d08dd1560026a7](https://github.com/uniscrolliabrain-cloud/agente/commit/738a5762c7b80c834f1a8b8718d08dd1560026a7) — fix(cognition): C15 close dispatch revocation and unknown commit gaps

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

### C12 — Presenter, UX y accesibilidad

Estado **EN CURSO**, estimación **50%**. UI factual/ligera y polling implementados; falta presenter integral y accesibilidad completa.

**Funcionalidad real:** Journey desde eventos propios, cursor/dedupe/reconexión, SVG de espera y reduced motion; estado actual de chat persistido.

**Contratos, interfaces y endpoints:** GET /journey?after=...; timeline acotada, sin cronómetros que inventen progreso.

**Dependencias:** Sin librería de animación nueva.

**Migraciones:** Reutiliza eventos/recibos/chatruns; no estado React como garantía durable.

**Resultados de pruebas de la campaña:** Smoke Chromium histórico local para SVG/móvil/reduced motion y polling/cursor PASS; no WCAG integral. test:browser canónico del checkpoint falla BROWSER_UNAVAILABLE, no es el mismo smoke.

**Bugs corregidos:** Spiral DOM pesado sustituido por 16 círculos SVG; timeline que solo refrescaba al cambiar chat; dedupe y limpiar ante denegación.

**Riesgos conocidos:** Texto natural Fast no es verificador formal de claims; timeline no cubre todos los estados/receipts de negocio; UX/a11y completa pendiente.

**Dependencias pendientes:** C09 delivery/ACK por turno, migración de eventos de negocio y evaluación de accesibilidad.

**Gate pendiente:** Presenter verificable para todos los estados del runtime, reconexión/streaming y auditoría WCAG/teclado/lectores real.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [apps/server/src/engine/cognition/v2/presenter.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/presenter.ts)
- [apps/web/src/components/chat/CognitionTimeline.tsx](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/web/src/components/chat/CognitionTimeline.tsx)
- [apps/web/src/components/chat/ThinkingSpiral.tsx](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/web/src/components/chat/ThinkingSpiral.tsx)
- [apps/web/src/components/chat/thinking-spiral.css](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/web/src/components/chat/thinking-spiral.css)
- [scripts/check-cognition-timeline.mjs](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/scripts/check-cognition-timeline.mjs)

**Archivos existentes modificados:**

- [apps/web/src/components/ChatPanel.tsx](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/web/src/components/ChatPanel.tsx)
- [apps/web/src/components/MessageList.tsx](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/web/src/components/MessageList.tsx)

**Tests identificados:**

- [tests/cognition-v2-http.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-http.test.ts)
- [tests/cognition-v2-runtime.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-runtime.test.ts)
- [scripts/check-cognition-timeline.mjs](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/scripts/check-cognition-timeline.mjs)

**Commits del patchset:**

- [eba49879c55a974608789a40a7c9c7b60f0a5dfb](https://github.com/uniscrolliabrain-cloud/agente/commit/eba49879c55a974608789a40a7c9c7b60f0a5dfb) — feat(cognition): C12 show receipt timeline and accessible SVG activity
- [d1922bbc7f7dcc69edc595d92ddab3b9b1f411ec](https://github.com/uniscrolliabrain-cloud/agente/commit/d1922bbc7f7dcc69edc595d92ddab3b9b1f411ec) — feat(cognition): C12 resume durable timeline with bounded cursor polling
- [eb08ef1335ab17ddaa60666b0494398707b77dd9](https://github.com/uniscrolliabrain-cloud/agente/commit/eb08ef1335ab17ddaa60666b0494398707b77dd9) — feat(cognition): C07-C12 wire independent inference and factual runtime receipts

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

### C13 — Voz, avatar y sesiones

Estado **EN CURSO**, estimación **25%**. Coordinador y adaptador Fast locales; sin Anam/ElevenLabs físicos.

**Funcionalidad real:** Consentimiento, sesiones, leases/fence/epoch, dedupe transcript-final por hash, expiración/reaper y cancelación al mismo Fast.

**Contratos, interfaces y endpoints:** SharedFastVoicePort/VoiceAuthorization/VoiceProviderPort; proveedor no disponible por defecto. No nuevo endpoint Anam ni SDK ElevenLabs operativo.

**Dependencias:** Ningún SDK Anam/ElevenLabs instalado por esta implementación.

**Migraciones:** voice_consents/voice_sessions/voice_turns aditivas; no audio/transcript crudo persistido.

**Resultados de pruebas de la campaña:** 4/4 casos locales PASS (restart lógico/dedupe, renderer concurrente/fence, expiración, reuse/cancel Fast). Sin media ACK físico ni sandbox.

**Bugs corregidos:** Eventos tardíos tras interrupción y sesiones huérfanas gobernados por epoch/fechas persistentes.

**Riesgos conocidos:** Barage-in físico, consentimiento operativo, límites/billing del proveedor y frontend avatar no comprobados; RLS global de estas tablas pendiente.

**Dependencias pendientes:** Cuenta/sandbox/secretos Anam y voz, contratos/datos/retención y autorización de piloto sintético.

**Gate pendiente:** Audio/video realtime end-to-end con interrupción real, sesiones huérfanas, ACK de reproducción, accesibilidad y límites reales.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [apps/server/src/engine/voice-v2/contracts.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/voice-v2/contracts.ts)
- [apps/server/src/engine/voice-v2/coordinator.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/voice-v2/coordinator.ts)
- [apps/server/src/engine/voice-v2/fast-adapter.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/voice-v2/fast-adapter.ts)
- [docs/implementation/cognition-v2/C13/ANAM-PROVIDER-VERIFICATION.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C13/ANAM-PROVIDER-VERIFICATION.md)
- [docs/implementation/cognition-v2/C13/EXECUTION-REPORT.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C13/EXECUTION-REPORT.md)
- [docs/implementation/cognition-v2/C13/TEST-RESULTS.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C13/TEST-RESULTS.md)
- [tests/cognition-v2-voice.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-voice.test.ts)

**Archivos existentes modificados:**

Ninguno atribuido en este inventario.

**Tests identificados:**

- [tests/cognition-v2-voice.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-voice.test.ts)

**Commits del patchset:**

- [e9b0b66cc00df8c1b82d14a0825862e1126ccea5](https://github.com/uniscrolliabrain-cloud/agente/commit/e9b0b66cc00df8c1b82d14a0825862e1126ccea5) — feat(cognition): C13 govern durable voice sessions and interruption epochs

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

### C14 — Puente de ciberseguridad

Estado **EN CURSO**, estimación **50%**. SDK/relay/contratos reales probados; orquestación y autorización de piloto no configuradas.

**Funcionalidad real:** SDK publicado en hijo independiente con ACK real existente; tools readonly nominadas, relay inbox transaccional ACK postcommit y proyección minimizada al contexto.

**Contratos, interfaces y endpoints:** CyberClient.ackOutbox en hijo, contratos de delegación/evidencia/estado parcial; no endpoint falso ni remediación externa.

**Dependencias:** @agntia/ciberseguridad file:vendor alpha.2; cliente real del hijo reutilizado, no cliente HTTP duplicado.

**Migraciones:** Inbox/proyecciones del bridge aditivas; outbox/ACK Python preexistentes sin migración destructiva.

**Resultados de pruebas de la campaña:** Padre 5/5 bridge y 1/1 contexto; hijo checkpoint npm SDK 8 tests/7 pass/1 skip, Python 9/9 PASS. Sin scanner contra activos externos.

**Bugs corregidos:** ACK SDK ausente respecto al endpoint existente; ACK antes de efecto; pérdida de ACK/dedupe y fallo hash/tenant; partial tratado indebidamente como completo evitado.

**Riesgos conocidos:** PDP/broker/delegaciones reales y jobs padre pendientes; licencia SDK private/UNLICENSED no acredita distribución comercial; sin garantías de protección certificada.

**Dependencias pendientes:** Credenciales/delegación de middleware, assets sintéticos autorizados, licencia/contrato y gobernanza de remediación.

**Gate pendiente:** Jobs/recibos reales padre-hijo con PDP/broker, fallos/rollback y evidencia completa, sin extrapolar zero findings a seguridad.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [apps/server/src/engine/security-v2/capabilities.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/security-v2/capabilities.ts)
- [apps/server/src/engine/security-v2/cognition-adapter.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/security-v2/cognition-adapter.ts)
- [apps/server/src/engine/security-v2/contracts.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/security-v2/contracts.ts)
- [apps/server/src/engine/security-v2/event-relay.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/security-v2/event-relay.ts)
- [apps/server/src/engine/security-v2/sdk-adapter.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/security-v2/sdk-adapter.ts)
- [docs/implementation/cognition-v2/C14/REPORT-W0-W6.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C14/REPORT-W0-W6.md)
- [docs/implementation/cognition-v2/C14/TEST-RESULTS.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C14/TEST-RESULTS.md)
- [tests/cognition-v2-cyber-bridge.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-cyber-bridge.test.ts)
- [tests/cognition-v2-security-context.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-security-context.test.ts)
- [vendor/agntia-ciberseguridad-0.1.0-alpha.2.tgz](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/vendor/agntia-ciberseguridad-0.1.0-alpha.2.tgz)

**Archivos existentes modificados:**

Ninguno atribuido en este inventario.

**Tests identificados:**

- [tests/cognition-v2-cyber-bridge.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-cyber-bridge.test.ts)
- [tests/cognition-v2-security-context.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-security-context.test.ts)
- [hijo typescript/test/client.test.mjs](https://github.com/uniscrolliabrain-cloud/agntia-ciberseguridad/blob/0a809a18f31aeaba03277d2399549bd1603cd68c/typescript/test/client.test.mjs)
- [hijo tests/contracts/test_python_ts.py](https://github.com/uniscrolliabrain-cloud/agntia-ciberseguridad/blob/0a809a18f31aeaba03277d2399549bd1603cd68c/tests/contracts/test_python_ts.py)

**Commits del patchset:**

- [b8b99fcc35e20a806120b9367335436952b3f1fb](https://github.com/uniscrolliabrain-cloud/agente/commit/b8b99fcc35e20a806120b9367335436952b3f1fb) — feat(cognition): C14 connect governed SDK reads and durable outbox ACK relay
- [11f5df32658a9da2689b6a3c9c7975a005b5b0ce](https://github.com/uniscrolliabrain-cloud/agente/commit/11f5df32658a9da2689b6a3c9c7975a005b5b0ce) — feat(cognition): C14 project minimized child receipts into shared context
- [0a809a18f31aeaba03277d2399549bd1603cd68c](https://github.com/uniscrolliabrain-cloud/agntia-ciberseguridad/commit/0a809a18f31aeaba03277d2399549bd1603cd68c) (hijo).

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

### C15 — Certificación y checkpoint

Estado **EN CURSO**, estimación **25%**. Evidencia y pruebas locales abundantes; programa completo no certificado y P1 abierto.

**Funcionalidad real:** Gate de evidencia NO_GO, matriz A01–A30, revisiones independientes previas, pruebas nativas/HTTP/UI y este checkpoint publicable.

**Contratos, interfaces y endpoints:** Reporte de aceptación basado en gate real; no autorización de producción por pasar fixtures.

**Dependencias:** Sin dependencia de certificación nueva; c8 ausente en el checkout.

**Migraciones:** Ninguna migración certificadora; conserva snapshots de evidencia.

**Resultados de pruebas de la campaña:** Histórico W4 gate 832/815/0/12/5, 8/10; resultados de este checkpoint, resultados exactos en TEST-RESULTS.md. C15 siempre NOT_CERTIFIED/NO_GO con bloqueos reales.

**Bugs corregidos:** Cinco P1 de revisión anterior corregidos (dispatch/revocación, actor inactivo, RAG generaciones y COMMIT unknown); nuevo P1 de delivery abierto.

**Riesgos conocidos:** Cobertura no medida por c8 ausente; browser canónico sin Chromium disponible; integración compartida, providers, roles/capacidades, restore/canary/cutover incompletos.

**Dependencias pendientes:** C00–C14, decisiones/configuración de F, revisión independiente y aprobación de release del fundador.

**Gate pendiente:** Superar todos los criterios A01–A30, corregir P1, medir riesgos/costes reales y recibir GO separado. No declarar 16 campañas completadas.

**Archivos creados / incorporados (incluye documentación, distinguible por ruta):**

- [docs/implementation/cognition-v2/C15/ACCEPTANCE-MATRIX.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/ACCEPTANCE-MATRIX.md)
- [docs/implementation/cognition-v2/C15/EXECUTION-REPORT.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/EXECUTION-REPORT.md)
- [docs/implementation/cognition-v2/C15/SECURITY-REVIEW.md](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/SECURITY-REVIEW.md)
- [docs/implementation/cognition-v2/C15/evidence/ACCEPTANCE-24b4e8d.json](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/evidence/ACCEPTANCE-24b4e8d.json)
- [docs/implementation/cognition-v2/C15/evidence/ACCEPTANCE-W3-11b3ebd.json](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/evidence/ACCEPTANCE-W3-11b3ebd.json)
- [docs/implementation/cognition-v2/C15/evidence/ACCEPTANCE-W4-af3b16d.json](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/evidence/ACCEPTANCE-W4-af3b16d.json)
- [docs/implementation/cognition-v2/C15/evidence/ADDITIONAL-COMMANDS.json](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/evidence/ADDITIONAL-COMMANDS.json)
- [docs/implementation/cognition-v2/C15/evidence/BASELINE-COMMANDS.json](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/evidence/BASELINE-COMMANDS.json)
- [docs/implementation/cognition-v2/C15/evidence/CURRENT-FOCUSED.json](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/evidence/CURRENT-FOCUSED.json)
- [docs/implementation/cognition-v2/C15/evidence/FIXTURE-LATENCY.json](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/evidence/FIXTURE-LATENCY.json)
- [docs/implementation/cognition-v2/C15/evidence/FROZEN-REFERENCES.json](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/evidence/FROZEN-REFERENCES.json)
- [docs/implementation/cognition-v2/C15/evidence/GATE-13caec2.json](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/evidence/GATE-13caec2.json)
- [docs/implementation/cognition-v2/C15/evidence/GATE-24b4e8d.json](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/evidence/GATE-24b4e8d.json)
- [docs/implementation/cognition-v2/C15/evidence/GATE-W3-11b3ebd.json](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/evidence/GATE-W3-11b3ebd.json)
- [docs/implementation/cognition-v2/C15/evidence/GATE-W4-af3b16d.json](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/evidence/GATE-W4-af3b16d.json)
- [docs/implementation/cognition-v2/C15/evidence/UI-CHECK.json](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/docs/implementation/cognition-v2/C15/evidence/UI-CHECK.json)
- [scripts/gate-cognition-v2.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/scripts/gate-cognition-v2.ts)
- [scripts/repro-cognition-delivery-reuse.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/scripts/repro-cognition-delivery-reuse.ts)

**Archivos existentes modificados:**

Ninguno atribuido en este inventario.

**Tests identificados:**

- [tests/cognition-v2-http.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-http.test.ts)
- [tests/cognition-v2-runtime.test.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/tests/cognition-v2-runtime.test.ts)
- [scripts/repro-cognition-delivery-reuse.ts](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/scripts/repro-cognition-delivery-reuse.ts)

**Commits del patchset:**

- [13caec2f0ec47b859b9613965a9967c8ae64d418](https://github.com/uniscrolliabrain-cloud/agente/commit/13caec2f0ec47b859b9613965a9967c8ae64d418) — test(cognition): C15 separate local gate evidence from production acceptance
- [97adb8bd666fea77687600b7cca07c7d6578ff50](https://github.com/uniscrolliabrain-cloud/agente/commit/97adb8bd666fea77687600b7cca07c7d6578ff50) — docs(cognition): C15 record W3 full gate and resolved ontology decision
- [38d0c6afaf3022d724fae49846667a19c22e749d](https://github.com/uniscrolliabrain-cloud/agente/commit/38d0c6afaf3022d724fae49846667a19c22e749d) — docs(cognition): C15 preserve full W4 migration gate evidence
- [640a55db01fc9f934bf927dec53e97035f0455f3](https://github.com/uniscrolliabrain-cloud/agente/commit/640a55db01fc9f934bf927dec53e97035f0455f3) — test(cognition): C09 checkpoint reproduce per-run delivery ledger gap

Los resultados exactos nuevos y sus límites figuran en [TEST-RESULTS.md](checkpoints/TEST-RESULTS.md). No hay inferencias de cobertura o aceptación a partir del número de documentos.

## C. Inventario transversal del código

| Superficie | V2 real en este checkpoint | Legacy activo / compatibilidad | Pendiente de sustitución o prueba |
|---|---|---|---|
| Kernel y contratos | Zod estricto, identidad/referencias/versiones/epistemología; captura idempotente de turnos y outcomes Slow | Kernel determinista sigue autoritativo; modelos no conceden permisos | Capacidades empresariales V2 y paridad de acciones |
| Eventos y persistencia | Conexión transaccional fijada, afterCommit, journal/cursor/inbox/leases/fencing/DLQ/replay | Bus y suscriptores antiguos siguen usados | Auditar/migrar todos los consumidores, outbox transversal y restore a escala |
| Grafo/cromos | Nodos/edges/revisiones/revocación; ontología aprobada 8 familias/6 polos/10 dimensiones | Cromos históricos conservados mientras se migran consumidores | Consolidación, entidades de dominio, ranking/calibración y cutover |
| Cinco memorias/RAG | Tipos funcionales, TTL, procedencia, recuperación y revocación; PreparedRag reutiliza RagService | engine/memory.ts y rag.ts no retirados | Consolidación completa, agentes/permisos ampliados y evaluación de retrieval |
| Atención/metacognición | Estados y hints persistentes, scoring estable versionado | Primitivas legacy siguen disponibles | Workspace multiagente global/ranking integral y validación empresarial |
| Slow/JEV | Worker durable, cancel/retry/raw-output, Thoughts/cards; clasificador determinista | Slow antiguo para flujos no migrados | W6 adaptador Typesafe/JEV separado y no activado; gateway real y ensayos con consentimiento |
| CardStore/ledger | Revisiones no one-shot, leases/fence/ACK interno y recovery | Consumidores legacy temporales | P1-01 correlación por run; ACK de cliente y retiro one-shot |
| ContextServing | Snapshots/deltas/refs/budgets, caché con query digest/policy/source watermark, invalidación | Context builder V1 en ruta por defecto | Consumidores empresariales y control global/tokenizador |
| Fast/Slow | Pools/config/circuitos/cuotas SQL separados, streaming Fast sin esperar Slow | Conversation/model-chain V1 para tenants sin allowlist | TTFT/costes reales, carga/caos, delegación gobernada y P1-02 allowlist de eventos públicos |
| Presenter/UI | Timeline de recibos reales, polling/cursor/reconexión; SVG ligero/reduced-motion | Chat V1 y UI existentes | UX empresarial completa, browser actual, WCAG integral, ACK cliente |
| Anam/ElevenLabs | Solo contratos/coordinador durable/consent/epochs/reaper y fake provider | Ninguna integración nueva real activada | SDK/contrato oficial, sesiones remotas, voz/media y barge-in físico |
| Ciberseguridad | SDK real alpha.2 hijo, ACK endpoint existente, relay durable/minimización | Middleware Python independiente; no remediaciones | PDP/broker/jobs/delegaciones reales y pruebas autorizadas de activos sintéticos |
| Auth/auditoría | Sesión -> tenant/actor, membership+usuario activo, propósito/policy revision, aislamiento focal SQL/RLS | Servicios authz/runtime existentes siguen autoridad | Roles/capacidades completas; shared RLS deshabilitado hasta prueba transversal |

Las tablas cognitivas son aditivas: rag_refs, import_plans, import_receipts, attention, chat_runs, lane_locks, lane_slots, lane_usage, slow_jobs, sequences, events, cursors, inbox, objects, edges, revocations, deliveries, delivery_recoveries y snapshots (prefijo cognition_v2_). Instalación explícita y pruebas locales; no se ejecutaron migraciones de empresas reales ni se borraron stores legacy. Voz y bridge tienen persistencia adicional propia, fuera de esta lista; deben entrar en el inventario RLS integral.

Nuevas dependencias principales: clientes directos @ai-sdk de proveedores y SDK hijo file:vendor alpha.2. No dependencia Anam/ElevenLabs/JEV añadida por adivinar un SDK. W6 usa fetch con contrato oficial. Ningún componente cognitivo es un segundo kernel.

La implementación opt-in falla cerrada en MULTI_TENANT_SHARED. En el carril V2 Fast no se conectan tools empresariales. Este corte reemplaza funciones concretas; no acredita aún sustitución integral Opción 3 ni permite retirar V1. Los documentos originales de C00–C15 se conservaron como referencia y no se contabilizan como código.

[Clasificación inicial de legacy](00-baseline/LEGACY-CLASSIFICATION.md) y [delta actualizado](checkpoints/ARCHITECTURE-DELTA.md). Las listas de archivos por campaña pueden solaparse por dependencias reales; el inventario de archivos no los cuenta varias veces.

## D. Verificación técnica

Node v24.22.1; pnpm 11.25.0 (packageManager del repo 11.19.0). Configuración WORKSPACE_MODE=sample y Postgres 17 local sintético para pruebas nativas. Se publican resultados depurados, nunca variables con valores sensibles ni logs brutos.

| Comando exacto | Estado / salida | Duración s | Total / pass / fail / omitidos / todo / cancelados | Causa / alcance |
|---|---|---:|---|---|
| `pnpm typecheck` | PASS / 0 | 26.837 | — / — / — / — / — / — | TypeScript raíz y worker; sin contador de tests. |
| `pnpm secrets:check` | PASS / 0 | 1.198 | — / — / — / — / — / — | Modo sample: verifica contrato de presencia de configuración; no escanea todos los secretos del código. |
| `pnpm audit:contracts` | FAIL / 1 | 22.652 | — / — / — / — / — / — | 6 contratos exportados sin consumidores detectados: ActionSpec, ColumnSpec, DataSourceSpec, ViewProvenance, CognitionCardScope, CognitionCardStatus. Ya observados en baseline. |
| `pnpm audit:idempotency` | PASS / 0 | 3.337 | — / — / — / — / — / — | Auditoría estática aprobada; no demuestra por sí sola exactamente una vez distribuido. |
| `pnpm audit:bridges` | FAIL / 1 | 2.4 | — / — / — / — / — / — | 12/16 bridges reconocidos; detectores esperan marcadores legacy. No se añadieron comentarios para falsear el resultado. Mismo fallo de baseline. |
| `pnpm test:browser` | FAIL / 1 | 5.292 | 1 / 0 / 1 / 0 / 0 / 0 | BROWSER_UNAVAILABLE: Chromium no inicia en este entorno. La prueba esperaba NAVIGATION_FAILED. Se conserva la aserción. |
| `pnpm test:coverage` | FAIL / 1 | 4.533 | — / — / — / — / — / — | c8: not found. No se ejecutaron casos ni se midió cobertura; c8 no está instalado/declarado en este checkout. |
| `pnpm verify:slice` | PASS / 0 | 74.477 | 7 / 7 / 0 / 0 / 0 / 0 | 7 casos más smoke autenticado local sintético. |
| `pnpm test` | PASS / 0 | 663.972 | 835 / 818 / 0 / 12 / 5 / 0 | Suite completa sobre código congelado; Postgres sintético loopback para casos nativos. |
| `pnpm gate` | FAIL / 1 | 677.818 | 835 / 818 / 0 / 12 / 5 / 0 | Orquestador completo; consultar resultado estructurado y contadores. |
| `pnpm release:verify` | BLOCKED_NOT_EXECUTED / None | None | — / — / — / — / — / — | BLOQUEADO / NO EJECUTADO: requiere destino de release autorizado en ejecución. No se contactó producción ni se desplegó. |

Evidencia estructurada: [COMMAND-RESULTS.json](checkpoints/COMMAND-RESULTS.json). Un guion no produce contadores TAP: «—» no equivale a cero casos aprobados.

## Evidencia adicional con alcance distinto

| Prueba | Ref | Resultado exacto | Duración |
|---|---|---|---:|
| Suite focal V2 con Postgres nativo | W6 `1f63fa9929a48c16f02344a0b1efa52216f2e91a` | 52 total, 52 pass, 0 fail, 0 skip | 113.837 s |
| SDK hijo `npm --prefix typescript test` | hijo `0a809a18f31aeaba03277d2399549bd1603cd68c` | 8 total, 7 pass, 0 fail, 1 skip | TAP suite 198.680 ms; tiempo wall no instrumentado |
| `CI=1 python -m unittest tests.contracts.test_python_ts tests.integration.test_budget_concurrency` | hijo mismo SHA | 9/9 PASS | 3.196 s |
| Wire JEV sintético validado con OpenAPI oficial / jsonschema | W6 | request y response válidos; 0 inferencias reales | no instrumentada |
| Reproducción ledger `node --import tsx scripts/repro-cognition-delivery-reuse.ts` | principal SHA auditado | exit 1 esperado: 3 runs completados / 1 delivery ACK, esperado 3 | no instrumentada |
| Reproducción eventos privados `node --import tsx docs/implementation/cognition-v2/checkpoints/REPRO-FAST-EVENTS.ts` | principal SHA auditado; helper publicado con informe | exit 1 esperado: 3 eventos REASONING_MESSAGE_CONTENT reenviados; esperado 0 | no instrumentada |

Las reproducciones son fixtures sintéticas sin proveedor ni red: el primer fallo evidencia pérdida de correlación por ejecución; el segundo una frontera de presentación demasiado permisiva. No son parte de `pnpm test` en este checkpoint y explican por qué una suite verde no certifica el programa.

Gate actual: **8/10 checks aprobados**, 677.818 s; fallan `audit:contracts` y `audit:bridges`. Suite interna: 835 total, 818 aprobados, 0 fallidos, 12 omitidos, 5 todo, 0 cancelados. [Resultado estructurado](checkpoints/GATE-RESULT.json).

## Comparación histórica (no ejecución actual)

Baseline main: 790 total, 772 pass, 0 fail, 1 cancelado, 12 omitidos, 5 todo; cancelación LAIA focal rerun PASS. Gate W4: 832 total / 815 pass / 0 fail / 12 omitidos / 5 todo, 8/10 checks, 826.5 s; contratos/bridges fallaban también allí. La comprobación UI previa con Chromium real y build web corresponde a evidencia histórica en C15, no a la prueba browser actual. No se declara cobertura porcentual ni latencia/coste de proveedores reales.

## E. Auditoría de seguridad y arquitectura

Severidad: P0 incidente crítico; P1 bloquea aceptación/cutover; P2 limitación o riesgo que requiere cierre; P3 mantenimiento. No se confirmó P0 en la superficie inspeccionada. Esto no certifica ausencia global de vulnerabilidades. Se distinguen defectos reproducidos de funciones deshabilitadas por diseño.

## P1-01 — Delivery reutilizado entre ejecuciones

**P1.** [apps/server/src/engine/cognition/v2/context.ts:142](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/context.ts#L142)

Evidencia: ID incluye snapshot/card/revisión, no consumidor/run; runtime.ts:104–143 reutiliza snapshot y entrega contexto aun sin nueva reserva. Fixture: 3 runs, 1 ACK.

Impacto: Auditoría de entrega incompleta para el mismo actor. No se ha probado fuga entre tenants.

Corrección propuesta: Incluir consumerRef estable por run en identidad y recibo; reservar/renderizar solo contexto entregable; conservar idempotencia por run, fencing y reintentos.

## P1-02 — Reenvío de eventos privados del proveedor

**P1.** [apps/server/src/engine/cognition/v2/runtime.ts:133](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/runtime.ts#L133)

Evidencia: Callback solo excluye RUN_STARTED/RUN_FINISHED. provider.ts:51 también reenvía el resto. Fixture inyecta REASONING_MESSAGE_CONTENT: 3/3 llegan al observable público.

Impacto: Un proveedor que emita eventos de razonamiento puede exponerlos al cliente. Fixture sintética, ningún incidente con datos reales observado.

Corrección propuesta: Allowlist de TEXT_MESSAGE_START/CONTENT/END validada en frontera pública; rechazar reasoning/state/custom/tool no autorizados; tests de no divulgación y streaming.

## P1-03 — RLS compartida todavía sin certificación integral

**P1.** [apps/server/src/engine/cognition/v2/runtime.ts:65](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/runtime.ts#L65)

Evidencia: MULTI_TENANT_SHARED=true lanza COGNITION_V2_SHARED_RLS_NOT_CERTIFIED. Tests restrictivos focales cubren tablas cognitivas; no toda la aplicación, voz y bridge.

Impacto: Impide activar modo compartido; gate seguro cerrado, no fuga activa demostrada.

Corrección propuesta: Inventario completo de tablas/roles; HTTP+workers+kernel+voz+bridge bajo rol restringido; pruebas cruzadas entre empresas y actores antes de habilitar.

## P1-04 — Paridad empresarial y sustitución legacy incompletas

**P1.** [apps/server/src/engine/cognition/v2/runtime.ts:119](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/runtime.ts#L119)

Evidencia: Prompt declara ausencia de ejecución empresarial; tools=[] en línea133. Las acciones empresariales siguen en runtime V1.

Impacto: V2 no sustituye aún todo el flujo de ejecución/delegación; no apto para retirar legacy ni habilitar globalmente.

Corrección propuesta: Migrar capacidades con PDP, aprobaciones, recibos y rollback E2E; cutover gradual con métricas, luego retirada de consumidores legacy.

## P1-05 — Consumidores secundarios legacy sin recibo durable

**P1.** [apps/server/src/kernel/subscribers/audit-consumer.ts:20](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/kernel/subscribers/audit-consumer.ts#L20)

Evidencia: audit-consumer.ts:20–32 y notifications-consumer.ts:33–46 realizan escrituras fire-and-forget con catch vacío; service.ts:772–787 registra suscriptores.

Impacto: Un fallo del store puede perder una proyección secundaria aunque el evento canónico siga persistido. No equivale a pérdida del journal nuevo.

Corrección propuesta: Migrar consumidores a inbox/cursor/lease durable y reconciliación; pruebas de crash entre efecto y ACK.

## P1-06 — Egress JEV real todavía sin implementación PDP/cuota durable

**P1.** [apps/server/src/engine/cognition/v2/jev-classifier.ts:1](https://github.com/uniscrolliabrain-cloud/agente/blob/1f63fa9929a48c16f02344a0b1efa52216f2e91a/apps/server/src/engine/cognition/v2/jev-classifier.ts#L1)

Evidencia: Solo W6: contrato oficial y adaptador probado con transporte simulado; JevEgressGate obligatorio no tiene bootstrap productivo configurado.

Impacto: Bloquea activación externa y prueba de costes/consentimiento; clasificador determinista sigue operativo.

Corrección propuesta: Implementar gateway durable de grants, cuota y reconciliación; credencial y consentimiento explícito; pruebas staging. No activar por detectar una API key.

## P2-01 — ACK es recibo de consumidor servidor

**P2.** [apps/server/src/engine/cognition/v2/runtime.ts:142](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/runtime.ts#L142)

Evidencia: ACK después de persistir respuesta, antes de RUN_FINISHED. No confirma recepción en navegador ni reproducción de audio.

Impacto: No permite afirmar que el usuario recibió/escuchó la respuesta; ledger solo demuestra consumo interno.

Corrección propuesta: Tipar consumer y alcance del ACK; añadir ACK cliente si se requiere garantía de recepción, con reintento/reconciliación sin borrar conocimiento.

## P2-02 — Voz sin proveedor audiovisual operativo

**P2.** [apps/server/src/engine/voice-v2/coordinator.ts:1](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/voice-v2/coordinator.ts#L1)

Evidencia: Coordinador probado con adaptador falso; no cliente Anam/ElevenLabs ni sesión real.

Impacto: No hay garantía física de stop/playback/barge-in ni de limpieza remota de sesiones.

Corrección propuesta: Implementar adaptador desde contrato oficial, consentimiento, credenciales de prueba, callback autenticado y pruebas reales de interrupción/reaper.

## P2-03 — Presupuesto por bytes y calibración incompleta

**P2.** [apps/server/src/engine/cognition/v2/context.ts:21](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/context.ts#L21)

Evidencia: Límite conservador por UTF-8; atención y dimensiones ontológicas no calibradas con dataset empresarial/proveedor real.

Impacto: Eficiencia cognitiva/costes/TTFT p50-p99 no demostrados en carga real.

Corrección propuesta: Tokenización del proveedor cuando proceda, métricas sin PII, evaluación de calidad, coste y latencia por tenant y carril.

## P2-04 — Backfill limitado a referencias verificables

**P2.** [apps/server/src/engine/cognition/v2/legacy-backfill.ts:105](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/legacy-backfill.ts#L105)

Evidencia: Resolver por defecto admite Thoughts propios y memorias ya migradas; bloquea entidades empresariales no resolubles.

Impacto: Cobertura de migración parcial, retirada V1 bloqueada; comportamiento fail-closed evita inventar procedencia.

Corrección propuesta: Resolvers versionados por dominio, export/import verificado y ensayos de rollback/recovery sin borrar V1.

## P2-05 — Pruebas browser/cobertura no operativas en entorno actual

**P2.** [package.json:1](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/package.json#L1)

Evidencia: test:browser devuelve BROWSER_UNAVAILABLE; coverage devuelve c8: not found.

Impacto: No hay evidencia actual de cobertura ni browser canónico verde.

Corrección propuesta: Restaurar dependencia justificada de coverage y Chromium permitido; rerun sin debilitar aserciones.

## P3-01 — Auditorías estáticas legacy incompatibles con parte del corte nuevo

**P3.** [scripts/audits/bridges.ts:1](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/scripts/audits/bridges.ts#L1)

Evidencia: Contratos:6 huérfanos. Bridges:12/16. Baseline ya fallaba; deben reconciliarse marcadores/consumidores reales.

Impacto: Gate completo no verde; riesgo de ruido ocultando defectos nuevos.

Corrección propuesta: Actualizar detección con imports/wiring efectivo y retirar aliases sin uso tras verificar compatibilidad; no suprimir fallos ni añadir marcadores ficticios.

## Hallazgos previos cerrados y límites de revisión

La revisión anterior corrigió revocación antes del dispatch/admisión de lane; actor inactivo; digest RAG a igual revisión; generación RAG obsoleta; y COMMIT exitoso con ACK de conexión perdido (resultado desconocido, sin fingir rollback). Véase [revisión histórica](C15/SECURITY-REVIEW.md). El checkpoint añade los defectos P1-01/P1-02 sin ocultarlos tras tests verdes. No se realizó pentest de producción, escaneo de activos externos, revisión exhaustiva de todos los middleware ni certificación independiente final.

## F. Dependencias externas y decisiones humanas

## Trabajo autónomo disponible

Corregir P1-01/P1-02 con regresiones, migrar más consumidores a proyecciones durables, integrar W6 controladamente después de publicar esta referencia, implementar gateway de egress/cuota desactivado por defecto, mejorar migración y contratos de ACK, ampliar pruebas de RLS y compatibilidad empresarial. Reparar tooling de cobertura/browser cuando el entorno permita dependencias. No hace falta una nueva decisión ontológica para continuar esto.

## Credenciales y configuración externa

- Fast/Slow: cuentas y credenciales de proveedores, modelos aprobados, cuotas y presupuestos por tenant, entorno sintético para carga/costes. Fixtures no miden facturación real.
- JEV: documentación oficial verificada en Typesafe (typesafe.ai -> docs.typesafe.ai; API /v1/systemone). jev.ai estaba aparcado: no se usa. API key/cuenta, modelo pinneado, acuerdo de datos/región/retención y autorización de egress por tenant. No se hicieron inferencias reales. Fuentes y OpenAPI hash en rama W6; no se inventa coste ni calibración.
- Anam y ElevenLabs: cuentas/entitlements, SDK y contrato vigente, callbacks/session tokens, consentimiento de voz y entorno de prueba; no hay cliente nuevo operativo. No asumir que ambas plataformas se usan juntas ni enviar datos por tener credencial.
- Ciberseguridad: broker/PDP/delegaciones padre-hijo, identidad de servicio, configuración de tenant y assets sintéticos autorizados; revisión licencia SDK private/UNLICENSED. No escanear/remediar terceros.

## Decisiones arquitectónicas

C05 ya tiene aprobación del fundador: decisión founder-20261116-card-ontology-001; ocho familias, seis polos en tres pares y diez dimensiones independientes con unknown=null. Documento aprobado en 83ae5a0, SHA256 df014cf043a5d5ccfd6cef98ee7351ce6dba0713bd5f12cdc9c15ca94b697182. Se implementó registro versionado y pruebas; no está BLOCKED_DECISION por ontología. Quedan calibración, taxonomía empresarial por tenant, permisos de publicación/revisión y política de gobierno para futuras versiones; no se necesita reinterpretar la aprobación existente.

Debe fijarse la garantía de ACK por consumidor: recibo interno, recepción cliente o playback no son el mismo evento. Hasta entonces el servidor solo acredita persistencia interna. Retención/visibilidad/consentimiento externo y política de datos requieren configuración gobernada. Los modelos solo proponen clasificación; el kernel decide acciones y no hereda autoridad de confianza/scoring.

## Autorización antes de activar o desplegar

No merge a main, producción, activación con empresas reales, remediaciones externas ni migración destructiva. Requieren autorización posterior y resultado concreto revisable. Publicar ramas de este checkpoint sí está autorizado. No se ha solicitado permiso adicional para trabajo reversible local. C15 sigue NO_GO por gates incompletos, defectos P1 y falta de evidencia de integración real.

## Continuidad

Se reanuda automáticamente C09/C11/C12 tras publicar este checkpoint, empezando por los dos defectos reproducidos. El orden restante está en [NEXT-STEPS.md](checkpoints/NEXT-STEPS.md). Este informe no sustituye el handoff maestro, ADR-009 ni los gates de las campañas. No se ha fusionado main, desplegado producción, ejecutado una migración destructiva ni activado integraciones sobre empresas reales.

