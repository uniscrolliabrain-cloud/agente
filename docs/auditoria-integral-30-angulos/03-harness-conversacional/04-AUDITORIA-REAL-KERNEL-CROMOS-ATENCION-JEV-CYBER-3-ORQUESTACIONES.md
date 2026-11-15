# Auditoría técnica — kernel, cognition, cromos, atención, memoria, bus y Ciberseguridad
**Fecha 2026-11-15.** Código leído en `main` del padre y contratos publicados en `main` de Ciberseguridad. **No se han ejecutado tests ni revisado exhaustivamente todas las rutas/callers.** Las observaciones de riesgo requieren pruebas de integración antes de considerarse vulnerabilidades confirmadas. No cambiar el alcance: padre + Ciberseguridad únicamente.

## 0. Tesis del fundador recuperada
Slow LLM no es solo planificador: **también crea tarjetas RAG/RAC con metadatos**; JEV AI, cuando exista, las **clasificará** y aportará metacognición; el runtime necesita un **servidor de tarjetas/contexto** que las distribuya a LAIA y demás agentes de forma continua y selectiva. La fuente de contexto es kernel + grafo multicapa + Event Bus + memorias + attention vectors; el Fast conversa con ese contexto preparado. El camino de ejecución sigue siendo autorizado por kernel y las fases SVG para clientes pueden ser pedagógicas.

**Advertencia:** en el código actual `CognitionCard` no equivale automáticamente a un documento RAG indexado/vectorizado; hoy es una proyección tipada de un `Thought`. La integración de recuperación semántica y JEV AI es trabajo de diseño, no capacidad demostrada.

## 1. Evidencia de código (lectura directa)
| Superficie | Ruta real | Lo que hace hoy | Brecha con visión |
|---|---|---|---|
| Ciclo cognitivo | `apps/server/src/kernel/cognition/cycle.ts` | `runCognitionCycle`: turn idempotente, observation Thought, decision opcional, cierre, marcas perceive/attend/decide/act/reflect/consolidate | las marcas no implican seis motores independientes; no prueba un scheduler cognitivo continuo |
| Suscriptor del bus | `apps/server/src/kernel/subscribers/events.ts` | `subscribeAll`, mapea ~16 tipos, valida contexto con actorId, ignora `kernel.*`, invoca ciclo en async fire-and-forget | confirmar replay durable, persistencia de cursor, fallos/reintentos y mapeo de eventos `security.*` |
| Contrato Thought | `apps/server/src/kernel/graph/thought.ts` | Zod con tenant, actor, attention vector, edges tipados, provenance | el Thought graph no es por sí solo un grafo multicapa completo de negocio+memoria+cromos |
| Atención | `apps/server/src/kernel/graph/attention.ts` | scoring puro: pesos, topMatched, Jaccard ponderado, divergencia, metadata validada | falta evidenciar un scheduler global de atención y clasificación JEV |
| Cromos | `apps/server/src/kernel/cromos/cromo.ts` | Zod `logic|physics|intent|memory|policy`, axioms, field, provenance | el propio archivo declara `CROMOS_PENDING_V1` y no cableado; no confundir con producción |
| Metacognición | `apps/server/src/kernel/observers/meta.ts` | reglas sobre slow ready/failed, fast idle, timeout, hints y attention conflict | no es JEV AI ni clasificación semántica completa; `seenHints` es estado de instancia, revisar ciclo de vida |
| Presenter | `apps/server/src/kernel/observers/presenter.ts` | selecciona Thoughts por rol/confianza/atención y compone presentaciones | no demuestra ser aún compilador completo de tarjetas semánticas versionadas |
| Captura Slow | `apps/server/src/kernel/cognition/capture.ts` | `SlowAuthor.writeReasoning → buildCognitionCard → cards.save` | base correcta para enriquecer clasificación, metadatos y servir contexto |
| Builder | `apps/server/src/kernel/cognition/card-builder.ts` | proyección determinista, kind inferido por regex, hash dedupe, body hasta 8000 caracteres, TTL 7 días | clasificación JEV ausente; distinguir semántica de contenido, tamaño y tokens |
| Contrato tarjeta | `packages/domain/src/cognition-card.ts` | seis kinds: insight/risk/opportunity/decision/summary/question; status, scope, evidence, attention, provenance, version | faltan categorías operativas y políticas de difusión granular por actor/agente |
| Store | `apps/server/src/kernel/cognition/card-store.ts` | owner+tenant, pending, rank, CAS consume/release, markUseful | consumo one-shot vs contexto persistente; comparar índices y permisos de actores |
| Contexto chat | `apps/server/src/engine/context/cognition-cards.ts` | 3 tarjetas máximo, 700 tokens total aproximados, cuerpo 700 caracteres, consume antes de render | **no** equivale a tarjetas de ~1000 tokens cada una; estimador chars/4; separar token budgets |
| Promoción | `apps/server/src/kernel/graph/promote.ts` | clasifica destinos response/memory/business-graph/audit/discard; comentario inicial dice que escritura real es posterior | verificar cuerpo completo y callers antes de afirmar persistencia de proyección |
| Consolidación | `apps/server/src/kernel/graph/consolidate.ts` | dedupe por hash y negaciones textuales simples | no inferir detección semántica de contradicciones |
| Bus | `apps/server/src/engine/events/bus.ts` | validación de schema, persistencia, publish a subscribers, dedupe opt-in, replayTenant limitado | `emit` retorna `persisted:false` ante errores; no es outbox transaccional demostrado; `subscribeAll` en vivo requiere recuperación robusta |

## 2. Hallazgos que condicionan la arquitectura
### H1. Slow ya produce tarjetas, pero no RAG clasificado por JEV
`captureSlowCognition` es un puente real. `buildCognitionCard` no llama al LLM y clasifica por regex sobre intent/body. Esto es útil como fallback determinista, pero no permite taxonomía semántica rica, clasificación por riesgos/visibilidad/cromos ni revisión metacognitiva. **No reemplazar este puente**: introducir una fase `ClassifyAndEnrich` posterior a creación y anterior a publicación, con implementación determinista inicial y adaptador JEV futuro. La clasificación LLM no otorga permisos.

### H2. 700 tokens agregados hoy, no 1000 por tarjeta
`MAX_CARDS=3`, `MAX_BODY_CHARS=700`, `MAX_BLOCK_TOKENS=700`; cálculo `ceil(length/4)`. La conversación mencionó ~1000 tokens por tarjeta como referencia; son dos presupuestos distintos. Reconciliar con benchmarks y tokenizador real: `perCardCap`, `aggregateCap`, `personaCap`, `historyCap`, `responseReserve`, separados por voz/chat/modelo. No incrementar indiscriminadamente: primero medir.

### H3. Contexto de consumo único vs contexto persistente
`pending` filtra `status=proposed`; `markConsumed` lo cambia a `consumed`. Una tarjeta útil puede necesitar mantenerse activa en muchas conversaciones o agentes. Proponer dos canales: `notification/delta` (entrega puntual con ack) y `state/context` (snapshot versionado y revalidado). No redefinir `consumed` para significar caducado. Promoción a scope tenant mediante `markUseful` debe someterse a permisos, clasificación y aprobación de difusión cuando proceda.

### H4. Bus→cognición existe, pero no se demuestra entrega durable end-to-end
El subscriber hace `void async` con catch/log y recibe publish en vivo. El bus dispone de `replayTenant`, pero no hemos verificado que el consumidor cognitivo guarde cursor y reprocesa eventos perdidos. Un evento persistido pero no entregado debe terminar proyectándose. Diseñar `CognitionProjector` con cursor, idempotency y replay; no depender solo de SSE/live publish.

### H5. Cromos y metacognición no están al nivel de visión
`cromo.ts` declara pendiente/no cableado. `Meta` implementa reglas útiles de hints, no JEV. AttentionVector es una estructura matemática y semántica tipada, pero falta demostrar el grafo cromático multicapa end-to-end. Distinguir: **Thought graph**, **Business graph**, **Memory graph**, **Cromo/ontology layer**, **event provenance graph** y **session/card projection**. Los nombres son capas propuestas para análisis, no módulos existentes confirmados.

### H6. Política y epistemología
El contenido de una tarjeta derivada de un escáner, log o comentario de código es **dato no confiable**, incluso si Slow lo resumió. Nunca permitir que JEV, Slow, Presenter o Fast transformen texto en autorización. Separar `verified_fact`, `derived_summary`, `hypothesis`, `unverified_external` y `unknown_outcome` como estados epistemológicos propuestos.

## 3. Contrato Ciberseguridad contrastado
Fuentes directas del hijo:
- `agntia-ciberseguridad/docs/09-contrato-con-agente.md`: envelope propuesto `schema_version, server_verified_actor_ref, tenant_id, authorization_id, asset_id, capability, correlation_id, causation_id, idempotency_key, expected_revision, dry_run, approval_id, payload`; operaciones nominadas; `Job` con pending/running/partial/completed/failed/cancelled/blocked/reconciliation_required; eventos propuestos `security.audit.completed`, `security.finding.created/changed`, `security.policy.denied`, `security.remediation.proposed/verified`, etc.
- `agntia-ciberseguridad/docs/ESTADO-VIGENTE.md`: API FastAPI `/v1/tenants/{tenant}` 84 rutas; SDK TS server-only; 196 tests Python OK y 8 skipped reportados, 6 SDK pass/1 skip; SQLite esquema 8, demo sintética, `production_enabled=false`, integración padre pendiente. Estos resultados son **reportados por el repo**, no ejecutados por esta auditoría.
- `agntia-ciberseguridad/docs/02-arquitectura-y-confianza.md`: worker con lease/fence, outbox local, vault AES-GCM, scopes y políticas. Verificar implementación concreta de cada operación antes de afirmar compatibilidad binaria.

### Traducción de contratos
| Ciberseguridad | Padre Agente | Adaptador necesario |
|---|---|---|
| `tenant_id` | `tenantId` en eventos/Thought/CognitionCard | mapper tipado sin confundir owner |
| `server_verified_actor_ref` | KernelContext actorId + Actor | principal firmado/verificado, no dato del LLM |
| `authorization_id`, `approval_id` | policy/approvals del kernel | comprobar concesión en ambas fronteras |
| `capability` | Capability Registry / SOP | operación nominada y schema, sin shell arbitraria |
| `correlation_id`, `causation_id` | EventBus correlationId/causationId | propagación extremo a extremo |
| `idempotency_key`, `expected_revision` | executor/eventos | dedupe de negocio y optimistic concurrency |
| `job.status=partial` | task/progress/card | conservar parcialidad, no falsear `completed` |
| `reconciliation_required` | outcome_unknown/progreso | estado explícito hasta conciliación |
| `finding/evidence` | grafo, memory, Card evidence refs | referencias redacted, scoped, sin secretos en prompts |
| outbox cyber | EventBus padre | consumidor durable, cursor y ACK, no duplicar acciones |
| SDK TS server-only | server adapter `agente` | no exponer credenciales al browser |

**Límite:** se ha contrastado el contrato documental actualizado y estado publicado; aún falta inspección línea a línea de `contracts.py`, rutas FastAPI y SDK TS para confirmar campos exactos y versiones. No afirmar compatibilidad validada.

## 4. Tres enfoques de orquestación
### Opción A — Kernel central coordinador
```text
Cyber SDK → Kernel → EventBus → Kernel cognitive scheduler
                                  → graph/memory/attention/Slow/Meta
                                  → card store → Fast
```
**Ventajas:** control central, secuencia comprensible, menos infraestructura; buena para prototipo de un tenant. **Costes:** kernel gigante, acoplamiento cognición/autoridad, picos de eventos afectan a chat y autoridad, evolución de JEV complicada. **No recomendada como arquitectura final.**

### Opción B — Event-driven distribuida pura
```text
Cyber outbox → Bus → [Graph projector] [Memory projector] [Attention]
                         ↓                  ↓                ↓
                   [Slow enrichment] → [JEV classification] → [Cards]
                                                       ↓
                                              [Context service] → Fast
```
**Ventajas:** independencia y escalado por componente, replay, extensibilidad futura. **Costes:** complejidad de colas, versiones, causalidad, consistency, coste operativo; muchas piezas para un solo desarrollador; riesgo de fragmentar política y observabilidad. **Recomendada solo cuando volumen y equipos lo justifiquen.**

### Opción C — Híbrida: kernel autoritativo + proyecciones cognitivas asíncronas (RECOMENDADA)
```text
[Cyber FastAPI/SDK] --receipts/outbox--> [Agente Domain Adapter]
                                           |
                                      [Kernel/Policy]
                                           |
                                     [Durable Event Bus]
                                           |
                               [Cognition Projector Worker]
                                  /      |         \
                            graph     memories    attention
                                  \      |         /
                                    [Slow API]
                                        |
                           [Card builder + JEV classifier port]
                                        |
                           [Versioned Card/Context Store]
                                        |
                          [Runtime Context Serving Facade]
                                        |
                         [Fast API / LAIA / Anam / Chat]
```
**Precisión:** las lecturas de Ciberseguridad no necesitan pasar por kernel como mutaciones de estado; sí deben estar autenticadas/autorizadas y registrar trazabilidad pertinente. Los eventos de un trabajo del dominio entran como hechos/evidencias y se proyectan, no como nuevas órdenes de ejecutar. El `CognitionProjector` puede empezar como worker lógico en el mismo server/proceso y evolucionar a proceso separado sin cambiar contrato.

**Razones de elección:** reutiliza `captureSlowCognition`, `CognitionCardStore`, `Meta`, `AttentionVector`, `EventBus` y `Presenter`; mantiene el kernel pequeño y seguro; evita red de microservicios prematura; permite sustituir el clasificador determinista por JEV AI; permite servir tarjetas precomputadas al Fast; integra Ciberseguridad sin importar su runtime Python al padre.

## 5. Taxonomía de proyecciones y servicio de tarjetas
**Canal `delta`:** novedad de un evento o un resultado Slow, notificación una vez, cursor y ACK. **Canal `snapshot`:** estado vigente (tarea, empresa, riesgos, preferencias, políticas), reutilizable mientras autorización y versión sigan vigentes. **Canal `reference`:** detalle RAG recuperable bajo demanda, con evidence refs, no todo inyectado. El runtime sirve estos tres con permisos y presupuestos, sin regenerar grafo por turno.

Propuesta de pipeline:
1. `CyberDomainAdapter` valida respuesta/receipts, tenant, firma/credencial, idempotencia, schema y revisiones.
2. `EventBus` persiste evento con correlation/causation; un outbox/ingest durable reconcilia entregas.
3. `CognitionProjector` consume por cursor y proyecta entidades/relaciones/Thoughts.
4. `AttentionProjector` prioriza actores/agentes, sin autorizar.
5. `SlowEnrichment` produce síntesis/Thoughts/tarjetas cuando la relevancia o complejidad lo requiere.
6. `CardClassifier` inicialmente determinista, posteriormente JEV AI: kind, topics, sensitivity, audience suggestion, urgency, confidence, expiry; su resultado es propuesta validada por política.
7. `CardStore` persiste versiones y revocaciones; index RAG/embeddings solo para datos permitidos.
8. `ContextServingFacade` construye snapshot `tenant+actor+agent+session+task` con presupuesto; incluye provenance y guarda card IDs.
9. Fast consume snapshot en inicio de turno, sin llamar a Slow. Las novedades críticas pueden generar notificación autorizada.
10. `ProgressProjector` convierte hechos reales a estado operativo; SVG muestra recorrido pedagógico separado.

## 6. Reglas de integración y fallos
- EventBus `persisted:false` no es éxito; consumidores críticos lo verifican.
- `reconciliation_required` no se traduce a `completed`.
- Clasificación JEV no es decisión de seguridad; scope/ACL siempre se calculan en el servidor.
- No introducir contenido de hallazgos crudos o secretos en prompts; solo extractos redactados y evidence refs.
- Un `CognitionCard` no debe promocionarse a `tenant` sin revisar alcance de lectura.
- Eventos duplicados no duplican tareas; fuera de orden no revierte snapshots.
- Revocación invalida tarjetas y cachés, incluida sesión Anam.
- Si Slow/JEV falla, determinismo y tarjeta factual mínima siguen disponibles.
- El runtime no espera clasificación de JEV para aceptar/denegar una acción autorizada.
- No generar `security.*` events en padre sin contrato de schemas/versiones y dedupe.

## 7. Orden de trabajo en AGENTE
**C0:** completar auditoría de memoria, graph, cromos, kernel close/promote, wiring real y tests, incluyendo búsqueda de JEV y cómo se activa el subscriber; trazar eventos desde `Cyber` hasta `conversation.ts`.
**C1:** contratos TS/Zod para `DomainEventEnvelope`, `CognitionProjection`, `ClassifiedCard`, `ContextSnapshot`, `CardDeliveryAck` y estados de job; no romper contrato V1.
**C2:** outbox/replay/cursor durable y consumer idempotente; verificar `persisted`.
**C3:** proyección incremental de grafo+memoria+atención con ACL.
**C4:** Slow enriquecimiento y clasificación determinista con puerto JEV; schema de metadata.
**C5:** ContextServingFacade delta/snapshot/reference, token budgets y invalidación.
**C6:** Fast API separada + Anam, no dependencia síncrona de Slow; preservar legacy.
**C7:** Cyber adapter SDK, escenarios de trabajo, reportes y eventos; sin escáneres reales hasta aprobación.
**C8:** UI SVG pedagógica + progreso factual, tests E2E y canary dos tenants.

## 8. Matriz de pruebas que certifica el enfoque C
- Cyber `partial` produce tarjeta factual parcial y timeline no completado.
- Cyber `reconciliation_required` obliga a conciliación, no éxito automático.
- Outbox replay tras caída del servidor reconstruye el mismo snapshot sin duplicar tarjetas.
- Dos tenants con LAIA no comparten memory, card, evidence ni session.
- Cambio de permiso revoca snapshot antes de siguiente turno.
- Clasificador JEV desconectado: fallback determinista sin perder hechos.
- Slow caído: Fast sigue conversando con snapshot permitido; no alucina resultados.
- Evento persistido pero no publicado se procesa por cursor.
- Un resultado del Slow crea tarjeta con provenance; no se interpreta como finding confirmado.
- Un usuario solicita efecto sensible: kernel aprueba/deniega, no Fast/JEV.
- SVG narrativo avanza independientemente, pero estado operativo solo con receipts.
- Métricas: lag de proyección, tarjetas activas, cache hit, tokens inyectados, p50/p95 first token/audio, eventos fallidos, revocaciones.

## 9. Próximas verificaciones pendientes (no inventar resultados)
1. Leer implementación y tests de cinco memorias; mapa exacto de stores y cómo se conectan al grafo.
2. Inspeccionar `kernel.ts` completo, `promote.ts` completo, wiring de subscribers, graph y cromos.
3. Verificar rutas y schemas exactos del SDK TS y Python `contracts.py` de Ciberseguridad.
4. Auditar consumidores de `EventBus.emit` y recovery, no solo API.
5. Medir latencia y coste de tarjetas/Slow/Fast en HEAD.
6. Recuperar reparto exacto de tokens de conversación si se dispone de export; ~1000/card es referencia, no presupuesto total cerrado.

**Resultado:** opción C preferida por compatibilidad con código existente, seguridad y capacidad de evolución. Esta es una recomendación arquitectónica basada en inspección parcial real; no constituye certificación de integración, ni tests ejecutados, ni despliegue.
