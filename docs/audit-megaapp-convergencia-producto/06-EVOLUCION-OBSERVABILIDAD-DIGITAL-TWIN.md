# Auditoría 06 — Evolución empresarial, observabilidad y Digital Twin
Fecha: 2026-11-27. Base documental 92bc9038927ba580fba53de304c4e85372b04a89, main e496dd43338107f07d48d62d3e0ea03c0e0c6c89; código contrastado en exec/Trans06 7663df43e73ab8e116c39e105b8d1bb3475a9cf5. No se presupone integración de ramas ni cierre de las campañas. Auditoría estática selectiva, sin tests ejecutados, acceso DB, proveedores ni cambios de código.

## 0. Mandato
UI Lab es demo y referencia de diseño; no conectar interfaces comerciales antes de instalar y certificar las capacidades del alcance, compilar empresa, definir actores y agentes y habilitar APIs/conectores. Ingeniería y observabilidad real preceden y acompañan construcción. Conservar PMV de slices limitados. Pendientes postauditorías: coherencia documental 7/10 y universos demo 5/10. No iniciar esas mejoras ni nuevas campañas funcionales aquí.

## 1. Fuente founder y distinciones temporales
Fuente literal: apps/ui-lab/docs/agntia-demo/03-instrucciones-founder-raw/01-FASES-DEL-TENANT-VERBATIM.md: fase 0 sandbox; 1 compilación; 3 formación; 4 beta PMV validación obligatoria; 5 deploy completo; 6 feedback, ajustes, monitorización y acompañamiento; 7 alpha; 8 scale y Digital Twin que simula variaciones futuras. Fase 2 no especificada y semántica de alpha no desarrollada en raw. FASES-00-08.md añade propuestas de ensayo en 2, alpha de evolución aislada en 7 y what-if en 8: no elevar estas propuestas a mandato literal. 02-ACTUALIZACION-TECNOLOGICA-VERBATIM.md: departamento de actualización tecnológica, contenido semanal adaptado, infraestructura para que el owner lidere sin aprender necesariamente RAG/prompts. DATASET-SINTETICO.md define reloj lógico fijo, IDs causales, KPIs derivados, escenarios futuros y separación de simulación/estado producto/presentación; metas no resultados reales.
Cinco ejes independientes: fase de empresa; revisión del bundle; tiempo efectivo del hecho y tiempo de registro; madurez de cada capacidad; universo real/sintético/prospectivo. Las ramas de futuro no reemplazan pasado. Un snapshot de contexto no es snapshot del tenant; un dashboard no es gemelo; un replay no es simulación contrafactual.

## 2. Cartografía del grafo multicapa: piezas reales, no un nuevo almacén
| Capa lógica | Archivo/contrato existente | Evidencia y límite |
|---|---|---|
| Verdad de negocio | engine/business/graph.ts | entidades, relaciones, schema, versión, provenance y state machines; no historia completa certificada |
| Representación de turno | kernel/graph/{thought,turn,store-store,consolidate,promote,attention}.ts | turnos y artefactos, dedup/contradicción simple, pesos y overlap; no equivalen a hechos empresariales |
| Causalidad operacional | engine/events/{bus,replay,snapshot,sinks/store}.ts; cognition/v2/storage.ts | bus y secuencia durable por tenant para V2, correlación y proyección; reconciliar dos recorridos |
| Conocimiento cognitivo | packages/domain/src/{cognition-v2,cognitive-reference,card-ontology}.ts; engine/cognition/v2/{graph,projector,storage}.ts | records revisionados, evidence refs, derived_from, lifecycle, epistemia, autorización |
| Semántica cromática | engine/cognition/chromatic/card-ontology.ts; kernel/cromos/ | tres ejes y seis polos en ontología aprobada registrada; prototipos de cromos/axiomas/campo no cableados según propio archivo |
| Atención y contexto | cognition/v2/{attention,context,rag}.ts | selección acotada y reproducible, snapshot y score; no equivale a atención cromática calibrada |
| Memorias | cognition/v2/memory.ts; learning/observer.ts | cinco tipos de memoria y aprendizaje histórico, reconciliación pendiente |
| Longitudinal | cognition/v2/longitudinal/{selector,pack,proposal,segments,narrative-extraction}.ts | contratos y funciones puras; no ciclo autónomo certificado |
| Prospectiva | UI Lab vendor/studio/model.ts, Visualizer.tsx; FASES-00-08.md | demo navegador y especificación; no motor de simulación real demostrado |

## 3. Hallazgos y certeza
Certezas de comportamiento local observado, no probabilidades estadísticas; impactos sistémicos requieren prueba. No presentar todos como novedades de Trans06.
| ID | Hallazgo | Certeza | Implicación |
|---|---|---:|---|
| E01 | BusinessGraph.updateEntity verifica versión opcional, incrementa y hace put, luego emit. Sin CAS/transacción conjunta en método | 100% | posibilidad de pérdida de actualización y divergencia dato/evento; reproducir concurrencia |
| E02 | entity.updated publica changedFields y versión, no valores anteriores/posteriores | 100% | replay de ese evento solo no reconstruye entidad arbitraria; revisar record history existente y recibos |
| E03 | app.ts:220 puerto de grafo timeline devuelve [] | 100% | trayectoria temporal a través de ese puerto no implementada |
| E04 | DurableEventSink escribe system-events sin asignar seq local y otra secuencia cognition_v2_events; conserva orden commit por tenant con lock | 100% | reconciliar con cursor de StoreQuery y fuente única; ya advertido en auditoría transversal, no duplicar patch |
| E05 | DurableProjector usa lease/fence, inbox y cursor transaccionales; un dead_letter se salta al avanzar cursor | 100% | progreso no equivale a cobertura; UI debe exponer gaps/DLQ y recuperación, no declarar reconstrucción completa |
| E06 | CognitiveProjector genera edges derived_from para propuestas, verifica ontología si presente, rechaza verified_fact y runtimeOutcome de propuestas; outcomes terminales desde receipt y revocación | 100% | preservar frontera epistémica; no atribuirle toda la ontología empresarial ni todos los eventos |
| E07 | CognitiveGraphQuery.neighbors limita profundidad 3 y nodos 50; consulta 50 edges por nodo sin detectar truncamiento si devuelve exactamente 50 con menos de 50 nodos; resuelve refs exactas y revalida | 100% local | inspector debe mostrar cobertura real y límites, revisar paginación/densidad de aristas |
| E08 | contextScorer es .5 relevance + .3 urgency + .2 novelty + coincidencias léxicas; no usa pesos cromáticos ni confianza como certeza | 100% | no vender campo calibrado ni embedding en esta función; RAG separado |
| E09 | GlobalAttentionWorkspace deriva selección de snapshot autorizado, guarda v2.3 y hash, revalida score y fuente; chat runtime usa prepared snapshot directo o snapshot de preparación | 100% | selección verificable no prueba que toda selección de chat pase por attention.select; conservar ambos contratos hasta reconciliar |
| E10 | FiveMemories comparte proyección, TTL working, evidencia y downgrade de verified_fact derivado; fromEvent valida owner y para procedural tipo sop.step_completed, no verifica receipt adicional allí | 100% | evento no equivale a prueba de efecto; enlazar semántica de audit03 antes de promover memoria procedural |
| E11 | LearningObserver histórico crea fact con confidence .9 y evidenceIds [], IDs timestamp; contadores read-modify-write, avgDurationMs inicial 0; patrón >=5 produce propuesta SOP | 100% | no tratar como aprendizaje validado/activación; probar dedup, evidencia, CAS y vínculo revisión/receipt |
| E12 | selector longitudinal declara 13 skills, pesos vacíos intencionados, salida de una skill máx., prioridad feedback/contradicción; pack mide bytes y marca mandatory omitido; proposal validator protege premisas user_stated | 100% | selección acotada, no calibración ni automatismo; conservar, no inventar nuevo planner |
| E13 | SlowObservationBridge exige verificador de evidencia cuyo default false; no instancia localizada en runtime.ts/app.ts inspeccionados; BusinessRead seam solo read_workspace no pública | 100% local, 95% montaje no demostrado | integrar solo vía contrato/política autorizados; no auto-dispatch |
| E14 | CardOntologyService registra tres ejes, decisión founder referenciada, valida anclaje y contextDigest; annotation review proposed; abstención unknown | 100% | cromática semántica existe, no confundir con axiomas físicos activos |
| E15 | kernel/cromos explícitamente pending; checkContradiction reconoce prefijo no y fieldEnergy promedio cuadrático | 100% | investigación pura, no deducir consciencia, razonamiento universal o rendimiento operativo |
| E16 | replayEvents recupera recent acotado y filtra tipos múltiples después de límite; snapshotBus agrega byType por hours pero total/bySource últimas 5000 sin igual ventana | 100% | no llamar replay total ni KPI reconciliado; hacer explícita ventana, cursor, cobertura |
| E17 | KernelSnapshot exporta turns/thoughts hasta límite, import recorre solo thoughts, no crea turns en ese método; fallback sin transaction | 100% local | no es restore completo ni twin; probar destino vacío, scopes, idempotencia y lotes fallidos |
| E18 | fase8 y Digital Twin en docs/Studio son prospectivos; no se ha identificado motor de escenarios certificado en superficies inspeccionadas | 95% | mantener simulación separada; no afirmar inexistencia exhaustiva del repo |

Fuentes: rutas anteriores relativas a exec/Trans06, especialmente business/graph.ts:139–207, app.ts:201–220, cognition/v2/storage.ts:57–145, graph.ts completo, projector.ts completo, context.ts:7–15, attention.ts completo, runtime.ts:121–150, memory.ts completo, learning/observer.ts:25–126, longitudinal/{selector,pack,proposal}.ts completos, slow-observation.ts, business-read.ts, chromatic/card-ontology.ts, kernel/cromos/{cromo,logic/axioms,physics/field}.ts, events/{snapshot,replay}.ts y kernel/snapshot.ts completos. Docs de founder y fases leídos en rama documental. No se ejecutaron tests ni se leyó cada archivo del árbol.

## 4. Ingeniería: seis vistas sincronizadas por referencia y autorización
Reutilizar plan04: inspector/timeline/visualizador de Studio como presentación; eventos y estado real de endpoints existentes. No promover reducer ni reloj de demo al runtime. Selección estable (tenant, environment, actor autorizado, kind, id, revision, correlationId), consultas limitadas, estados live/stale/degraded/replay. No mostrar raw prompts, pensamientos privados, secretos ni contenido de otros actores. No usar hexágonos coloreados como prueba de activación.
1. Visor causal: evento -> decisión -> efecto -> receipt -> proyección; mostrar secuencia, timestamps, esquema, correlación, causación, retraso, pérdidas y DLQ. Filtrar por ejecución, thread o entidad.
2. Grafo multicapa: overlays de negocio, cognitivo, evidencia y causalidad, no copia central de data. Aristas tipadas, origen, revisión, límites de cobertura. Seleccionar una card y comparar fuente/autorización, lifecycle, epistemia y relaciones. Unknown/disputed visible.
3. Atención: algoritmo/version, selección, señales y score, snapshot/digest/watermark, presupuesto y rechazo. Diferenciar relevancia de certeza y visualización semántica cromática de física experimental. No persistir query privada en telemetría.
4. Memorias: cinco clases, procedencia, fecha, expiración, revocación, revisiones y entrega/ACK. No mostrar una memoria procedimental como SOP ejecutable.
5. Longitudinal: journal y anchors, brief/narrativa, versión, evidencia, selección de skill, presupuesto, propuesta vs aceptación; si no está montado mostrar no instrumentado. Sin exponer cadena de razonamiento.
6. Empresa/versiones: baseline operativa, revisión draft/approved/active, capacidad y conectores, métricas de negocio reales, incidencia/feedback -> propuesta -> validación sandbox -> activación autorizada -> verificación. No auto-publicar a partir de feedback.

## 5. Digital Twin: tres tiempos, tres responsabilidades
PASADO: replay de hechos autorizados y reconstrucción histórica con versión y cobertura. PRESENTE: estado observado con watermark y frescura; no es prueba de futuro. FUTURO: rama aislada sobre baseline inmutable, supuestos y modelo versionado, seed/reloj lógico, outputs etiquetados forecast. No llamadas reales ni efectos (correo, pagos, despliegue, cambios de política) desde rama prospectiva. El usuario puede comparar variantes y proponer decisión; decisión pasa por circuito normal, no se ejecuta al elegir escenario.
Ejemplo hipotético Taller Horizonte: baseline contratos/capacidad/colas del snapshot certificado; simular mayor demanda y cambio de dotación o automatización; comparar carga, retrasos y costes con rangos y supuestos. No inventar números ni causalidad. Si falta data, declarar desconocido. Un escenario puede quedar invalidado al cambiar baseline. No construir un simulador universal sin datos de operación y evidencia de utilidad.
Propuestas de contrato (no crear aún): referencia baseline {tenantId,bundleRevision,asOf,watermark,sourceRefs,coverage}; scenario {id,baselineRef,modelVersion,seed,assumptions,logicalClock,scope,simulationMode}; result {scenarioRef,metricDefinitions,values/ranges,limits,provenance,calibrationStatus}. Reutilizar contratos snapshot/event/view donde encajen; evitar segundo grafo/almacén de verdad. Aislamiento por entorno y permisos, promover únicamente propuestas revisadas, nunca registros simulados.

## 6. Reciclaje y destino propuesto
| Fuente | Decisión | Destino / cuándo |
|---|---|---|
| Studio Timeline/Inspector/Visualizer y CSS | reciclar visual puro | web/src/engineering/ del plan04; futuro Studio comercial tras gates |
| Studio model y fixtures | conservar demo | laboratorio, reloj lógico; no DB real |
| kernel-routes, events-routes, cognition-v2-routes | reutilizar/modificar | consultas autorizadas read-only y cursor, sin proxy raw |
| engine/cognition/v2/{storage,projector,graph,context,attention,memory} | conservar/hardenizar | fuente existente, no nuevo motor |
| learning/observer, longitudinal | reconciliar | flujo feedback y propuestas tras tests y composición; sin activar por defecto |
| company-v2 y code-v1 | reciclar presentación | futuro Tu Empresa y Agntia Code, datos reales desde adapters |
| contracts para historial/forecast | crear solo si no hay equivalente tras inventario | packages/domain/src/ (nombres por decidir); no confundir con KernelSnapshot |
| tests de replay, proyección y atención existentes | ampliar | fixtures de fallo/reconexión/revisión, luego Postgres staging |

## 7. Gates propuestos de observabilidad y evolución
G1 Inyectar hecho controlado de prueba: persistencia, seq, receipt, proyección y visor correlacionados. Demostrar restart, disconnect/replay, duplicados, lag, DLQ visible, revocación. Comparar hashes/estado final al reconstruir con proyector versionado, no reemitir efectos externos.
G2 Concurrencia en entidad y evolución de relación: dos actualizaciones misma revisión, fallo entre put/evento, historia antes/después; impedir pérdida silenciosa. Comparar time window de métricas y cobertura, no valores demo.
G3 Card -> selección -> snapshot -> entrega -> ACK, verificar procedencia, score exacto, presupuesto, revisión y retractación; distinguir hipótesis y receipt. Validar aislamiento de actor/tenant en todos los paneles.
G4 Empresa compilada de alcance mínimo: agentes/SOPs/providers reales autorizados, al menos circuito Google/WhatsApp en alcance aprobado. Observar cada resultado, no declarar otros módulos operativos.
G5 Revisión empresarial: feedback respaldado, cambio propuesto, simulación aislada, validación, decisión explícita, aplicación/rollback, seguimiento por baseline; no publicar ready_for_review.
G6 Solo con baseline histórica suficiente y modelo calibrado para caso concreto: escenarios reproducibles, mismos supuestos misma salida, validación temporal con datos retenidos, incertidumbre visible, sin efectos ni mezcla de universos. No fijar horizonte/SLO/modelo numérico sin data/decisión founder.
G7 Promoción UI por slice después de gates04, sin modificar diseño aprobado ni poner fixtures en modo real.

## 8. Conclusión y limitaciones
Hay un núcleo real valioso para observabilidad y futura evolución: journal, proyecciones durables, evidencia, atención versionada y autorización. No es todavía un Digital Twin empresarial certificado. Evitar construir UI final o algoritmo de simulación antes de poder observar el circuito operativo real. Conservar hipótesis cromáticas como investigación, no como condición del PMV. No ejecutar aquí. Revalidar hallazgos en SHA integrado y asignarlos a campañas existentes. Siguiente audit07 reconciliará todas las pasadas, dependencias, código muerto condicionado y mejoras documentales/demo pendientes. Esta entrega no es certificación de madurez porcentual; no se probó ningún endpoint, entorno, base de datos o proveedor.
