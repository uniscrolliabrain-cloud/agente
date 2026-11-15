# C07 — Slow LLM asíncrono, Thoughts y tarjetas cognitivas enriquecidas
**Turno 08/16 · 2026-11-15 · Repo principal:** `uniscrolliabrain-cloud/agente`.
**Estado:** auditoría estática y campaña de implementación propuesta. **No código V2, no tests ejecutados, no merge/deploy.**
**Dependencias:** C00–C06; C02 proyección durable, C03 provenance, C04 memorias, C05 cromos, C06 atención. **Siguientes:** C08 JEV, C09 CardStore/ledger, C10 ContextServing, C11 Fast/Slow APIs.

## 1. Objetivo, reemplazo y alcance
Separar **(A) ejecución de Slow**, **(B) captura de resultado/Thought**, **(C) extracción estructurada de conocimiento**, **(D) clasificación no autoritativa**, **(E) promoción verificada y proyección**, **(F) entrega al contexto Fast**. La conversación rápida no espera la consolidación cognitiva. Las tarjetas V2 pueden representar afirmaciones, incertidumbres, relaciones, SOPs propuestos, decisiones, contradicciones candidatas y evidencia; no se convierten automáticamente en hechos o acciones.

**Sustitución opción 3:** conservar temporalmente `executeModelTask`, `SlowAuthor`, `captureSlowCognition`, `card-builder` como legacy, añadir pipeline V2 en shadow, comparar y migrar. No preservar la captura V1 como destino final.

## 2. Evidencia real leída en main, SHA de archivo
| Ruta | SHA blob | Observación |
|---|---|---|
| `apps/server/src/engine/model.ts` | `34989a4887c242d5b331e61620dacd4c5f055770` | 809 líneas; slow por task, fallback de modelos, cuotas, timeout/abort, captura de tarjeta al cierre, evento `cognition.card.created` |
| `apps/server/src/kernel/cognition/capture.ts` | `f8a675562d5db55fbd2379a198add44475167a9c` | 64 líneas; `SlowAuthor.writeReasoning` → `buildCognitionCard` → `cards.save` secuencial |
| `apps/server/src/kernel/cognition/card-builder.ts` | `2c2a9c915eb84535ee895d9880399f8f7fb41e90` | 109 líneas; reglas deterministas/regex, hash id por dedupeKey o thought.id, TTL 7 días |
| `apps/server/src/kernel/authors/slow-author.ts` | `13f68919a3fddbe323613fc3e419153c0cdefcfa` | 160 líneas; escribe output real en Thought, `ready` en metadata, confidence 0.8 por defecto |
| `apps/server/src/engine/events/types.ts` | `1e00fb0381281aa57999a98ee48b47fd453e3f71` | catálogo cerrado incluye `cognition.card.created` y `cognition.card.injected`; EventSink.write |
| `apps/server/src/engine/context/cognition-cards.ts` | `3c6df6d14fcd0cd7b4617c99304d6a2b600a49fe` | hasta 3 tarjetas, 700 chars/cuerpo, ~700 tokens; `markConsumed` antes de renderizar |

**Límite de evidencia:** inspección de archivos completos cortos y secciones relevantes del archivo `model.ts`; todavía no se verificaron todos los workers, colas, schemas de tareas, consumidores, proveedores Slow, tests ni deployments. Los SHA son blobs, no SHA del commit base. Revalidar HEAD antes de implementar.

## 3. Hallazgos C07-F01–F20
1. **F01:** `executeModelTask` ejecuta una tarea delegada y el Slow real; no es un pipeline autónomo de extracción/serving de conocimiento.
2. **F02:** `model.ts` usa `runWithModelFallback`; preservar compatibilidad con proveedores/config tenant durante migración.
3. **F03:** se aplica cuota de uso Slow antes de inferencia; el nuevo worker debe reutilizar gobernanza, no eludirla.
4. **F04:** el modelo se aborta con timeout y señal; la captura V2 debe registrar cancelación, no publicar texto incompleto como resultado verificado.
5. **F05:** `text` se construye desde eventos `TEXT_MESSAGE_CONTENT`; auditar límites, parcialidad, truncado y resultados de herramientas.
6. **F06:** `ctx.event("step",...)` recorta a 12.000 caracteres; no utilizar evento de progreso como fuente completa de contenido.
7. **F07:** `captureSlowCognition` se invoca después de respuesta y antes de cerrar turnos; acoplamiento con lifecycle y riesgo de orfandad.
8. **F08:** Thought se persiste antes de tarjeta sin transacción conjunta; fallo intermedio requiere reconciliación.
9. **F09:** `SlowAuthor.writeReasoning` genera ID de atención aleatorio; `Kernel.appendThought` genera nuevo Thought ID en reintentos.
10. **F10:** dedupeKey del card builder estabiliza card ID, **no** idempotencia de Thought ni del evento.
11. **F11:** card builder clasifica por heurística, no por contenido estructurado de Slow/JEV.
12. **F12:** inferencia V1 usa cuerpo del Thought; puede convertir resumen de tarea en tarjeta sin extracción de claims/evidencia por separado.
13. **F13:** TTL por defecto 7 días es regla legacy de entrega; no debe determinar retención de memoria semántica o evidencia.
14. **F14:** `SlowAuthor` fija confidence 0.8 por defecto; no es probabilidad calibrada.
15. **F15:** `SlowAuthor` puede insertar matched `reasoning` genérico; no inferir entidad o evidencia de ello.
16. **F16:** progreso `ready` se almacena en `attention.metadata`; no sustituye recibo durable de publicación de tarjeta.
17. **F17:** `cognition.card.created` se emite cuando `capture.created` es true; comprobar fallo de emisión tras save y reintentos sin evento.
18. **F18:** catálogo de eventos V1 no incluye aún eventos granulares para `candidate.extracted/classified/verified/retracted`; añadir solo mediante schema/versioning C02.
19. **F19:** `assembleCognitionCards` marca consumed antes de que el Fast confirme recepción; riesgo de pérdida lógica.
20. **F20:** presupuesto chars/4 y límite 3 tarjetas no soportan entrega incremental referenciada; sustituir en C09/C10.

## 4. Pipeline objetivo
```text
Task/Turn authorized → SlowRunRequested (C02 durable)
  → worker lease/heartbeat/fence → Slow LLM provider chain
  → raw output receipt (encrypted/retention policy, checksum)
  → Thought capture idempotent (C03)
  → ExtractionJob: claims/evidence/relations/temporal/uncertainty
  → CognitiveCandidateV2 (not yet verified)
  → JEV classifier port C08 (optional, metadata only)
  → deterministic validation/policy + evidence checks
  → Graph/Memory/CardStore projections C03/C04/C09
  → Attention C06 + ContextServing C10
  → Fast next turn / Presenter update only when authorized
```
La finalización de una tarea y la finalización de su **consolidación cognitiva** son estados separados. El Fast no espera al pipeline Slow. El runtime de acciones conserva sus aprobaciones y receipts independientes; texto Slow nunca autoriza herramientas.

## 5. Contratos propuestos, sujetos a C01/C02
```ts
type SlowRunStatusV2 = "requested"|"leased"|"running"|"completed"|"failed"|"cancelled"|"timed_out";
type SlowCognitionStageV2 = "capture_pending"|"captured"|"extract_pending"|"extracted"|"classify_pending"|"classified"|"verify_pending"|"verified"|"projected"|"quarantined";
interface SlowRunReceiptV2 {
  schemaVersion:"2.0"; runId:string; tenantId:string; actorId:string; taskId:string;
  sourceEventId:string; correlationId:string; modelProvider:string; modelId:string;
  status:SlowRunStatusV2; attempt:number; leaseToken?:string; startedAt?:string; endedAt?:string;
  outputRef?:string; outputDigest?:string; usageRef?:string; failureCode?:string;
}
interface CognitiveCandidateV2 {
  schemaVersion:"2.0"; candidateId:string; tenantId:string; sourceRunId:string;
  sourceThoughtId:string; sourceEventId:string; extractorVersion:string;
  kind:"claim"|"insight"|"risk"|"opportunity"|"decision"|"question"|"procedure_candidate"|"relationship";
  title:string; contentRef:string; contentDigest:string;
  evidenceRefs:string[]; entityRefs:string[]; graphRefs:string[];
  temporal?:{observedAt?:string;validFrom?:string;validUntil?:string};
  epistemicStatus:"hypothesis"|"reported"|"verified"|"contradicted"|"retracted";
  uncertainty?:{reasonCodes:string[];modelConfidence?:number};
  visibilityPolicyId:string; policyRevision:string; expiresAt?:string;
}
```
No usar `modelConfidence` como verdad ni autorización. `outputRef` no es URL pública. Distinguir datos sensibles, secreto y PII; contenido en almacenamiento autorizado, índices con referencias y digests.

## 6. Reglas de idempotencia y transacciones
- `runId` estable por task+attempt y request key; `candidateId` por sourceRunId+extractorVersion+claim semantic key; `Thought` V2 por sourceEventId+role+projectorVersion.
- Reintento del worker con mismo lease/fence no genera segunda proyección; intento nuevo de modelo **sí** es nueva evidencia con relación a intento previo.
- Persistir recibo de output y evento antes de encolar extracción; el worker de extracción usa inbox/offset C02, no `void` sin ACK.
- Si Thought existe y card falta, reconciliar card; si card existe y evento falta, outbox repite evento; si tarjeta revocada, no recrearla por replay de fuente obsoleta.
- No asumir transacción entre stores distintos; documentar saga idempotente y compensación.
- Cancelación del usuario y task terminal deben impedir nuevas acciones; pueden permitir auditoría del output parcial solo con estado `partial/unverified`, nunca publicarlo como conocimiento verificado.

## 7. Patchsets PS07.0–PS07.13 (paths nuevos propuestos)
**PS07.0 Baseline:** inventario real de task worker, model chain, providers, quotas, turn lifecycle, event sinks, stores, tests y consumers. `C07/evidence/SLOW-CALLGRAPH.md`, `FAILURE-MATRIX.md`.
**PS07.1 Domain:** `packages/domain/src/slow-run-v2.ts`, `cognitive-candidate-v2.ts`, `cognitive-extraction-v2.ts`; Zod strict, source refs.
**PS07.2 Scheduler:** `apps/server/src/engine/cognition/slow/slow-run-queue.ts` como adapter C02, no cola paralela sin durabilidad.
**PS07.3 Worker:** `slow/slow-run-worker.ts`, lease, heartbeat, cancellation, deadlines, retries y quotas.
**PS07.4 Provider:** `slow/provider-adapter.ts`; reutilizar `model-chain.ts` y tenant config; no hardcodear API key.
**PS07.5 Output receipt:** `slow/output-receipt.ts`; cifrado/retención, digest, usage y trace.
**PS07.6 Thought bridge:** `slow/thought-projector.ts`; preservar `SlowAuthor` V1 solo temporalmente; stable IDs y provenance C03.
**PS07.7 Extractor:** `slow/knowledge-extractor.ts`; structured output, schema validation, evidence anchors, temporalidad.
**PS07.8 Candidate store:** `slow/candidate-store.ts`; idempotencia, revisions, quarantine y CAS.
**PS07.9 Classifier port:** `slow/classifier-port.ts`; JEV futuro C08, fallback determinista sin afirmar clasificación completa.
**PS07.10 Verification:** `slow/candidate-verifier.ts`; policy, ACL, evidence, contradicción y promoción explícita.
**PS07.11 Projections:** `slow/candidate-projector.ts`; C03/C04/C09, outbox, invalidación.
**PS07.12 Shadow integration:** adapter en `model.ts`/worker tras inventario, flags por tenant; no doble publicación de tarjetas.
**PS07.13 Tests/metrics:** recuperación, concurrencia, seguridad, latencia, coste, precisión, regressions y handoff C08.

No editar rutas legacy ni activar nueva cola hasta completar inventario de owners, imports y compatibilidad. C02/C03/C04/C06 están **documentadas, no implementadas**; el agente debe distinguir dependencias bloqueantes.

## 8. Waves W0–W9 con gates
**W0 Auditoría:** fijar SHA commit, leer worker/queue, model chain, store, tests, auth y todos los consumidores; entregar diagrama y matriz de fallos. Gate: paths verificados.
**W1 Contratos:** cerrar schemas y taxonomy con C01, estados y evidencia; tests strict. Gate: no promociones sin evidencia.
**W2 Lifecycle durable:** scheduler/lease/heartbeat/cancel/fence con C02. Gate: no duplicados ni jobs huérfanos.
**W3 Proveedores:** model chain, timeout, fallback, cuotas, abort, usage y secrets. Gate: coste/latencia medibles.
**W4 Capture:** output receipt + Thought idempotente, crash recovery. Gate: no orfandad sin reconciliación.
**W5 Extraction:** claims, citas, relaciones, temporalidad y contradicción candidata; evaluación de precisión. Gate: contenido inventado no promovido.
**W6 Classification:** port JEV no autoritativo y fallback, metadata versionada. Gate: fallo JEV no bloquea ni autoriza.
**W7 Projection:** CardStore C09/Graph C03/Memory C04 y atención C06, outbox e invalidación. Gate: tenant isolation y replay.
**W8 Shadow/canary:** comparar V1/V2, Fast TTFT, p95, tokens/costes, recall, ruido y tasas de error. Gate: no degradación crítica.
**W9 Certificación:** pnpm typecheck/test/gate, e2e, fault injection, Codex review, rollback y handoff. Gate: aprobación founder para cutover.

## 9. Matriz adversarial y tests
| Test propuesto | Criterio |
|---|---|
| `slow-run-idempotency-v2.test.ts` | redelivery/lease no duplica Thought ni candidate |
| `slow-run-crash-recovery.test.ts` | crash entre output/Thought/card/event se reconcilia |
| `slow-run-cancel.test.ts` | abort y timeout no publican resultado como verified |
| `slow-run-tenant-isolation.test.ts` | ningún output/ref cruza empresa o actor |
| `slow-run-provider-fallback.test.ts` | cuotas, provider fallback y usage no se duplican |
| `slow-knowledge-extractor.test.ts` | extracción estructurada válida, evidence anchors |
| `slow-candidate-verifier.test.ts` | hypothesis ≠ verified; prompt injection tratado como dato |
| `slow-candidate-revision.test.ts` | retractación, fuente corregida, replay obsoleto |
| `slow-jev-port.test.ts` | timeout, malformed response, schema drift y fallback |
| `slow-card-projection.test.ts` | outbox event/card coherentes, no delivery prematuro |
| `slow-fast-isolation.test.ts` | Fast no espera extracción; TTFT bajo carga |
| `slow-legacy-shadow.test.ts` | flags off preservan rutas actuales |

## 10. Riesgos P0
- Captura secuencial sin transacción → saga/outbox/reconciliación.
- Idempotencia de tarjeta confundida con idempotencia de Thought → claves estables por etapa.
- Resultado parcial de timeout convertido en hecho → estado epistemológico y cancel.
- Progreso textual como fuente autoritativa → output receipt con digest.
- LLM emite instrucción desde documento → tratar como datos y verificar policy.
- JEV clasifica como juez → clasificación metadata, kernel decide.
- Nuevo worker evita cuotas y gobernanza → adapters existentes.
- Fast bloqueado por extracción → async con deadline y backpressure.
- Evento emitido después de save se pierde → outbox C02.
- Fuente revocada reaparece por replay → sourceRevision y tombstone.
- Doble publicación V1/V2 en shadow → namespace y flags aislados.
- PII/secretos en cards/logs → contentRef autorizado, redacción y retención.

## 11. Rollback, reportes y criterios de cierre
Flags `slowCognitionV2.shadow/write/read` son **propuestos**, no existentes. Rollback: parar workers V2, desactivar lectura, conservar receipts y checkpoints, volver a captura legacy sin duplicar efectos, reconstruir proyecciones desde C02 cuando estén disponibles. No borrar datos ni desplegar sin autorización.

Cada ola deja `REPORT-Wx.md` con SHA base, archivos creados/modificados, comandos y exit codes reales, métricas de TTFT/coste/precision, bugs, patchsets, revisiones Codex, decisiones GO/NO-GO y rollback. Adjuntar `CALLGRAPH.md`, `SCHEMA-COMPAT.md`, `FAULT-INJECTION.md`, `BENCHMARK.md`, `HANDOFF-C08.md`.

```yaml
campaign: C07
turn: 08/16
repo: uniscrolliabrain-cloud/agente
branch: audit/preflight-cognition-option3-20261115
source_ref: main
source_commit_sha: NOT_VERIFIED
status: STATIC_AUDIT_AND_PLAN
findings: 20
patchsets: 14
waves: 10
runtime_modified: false
tests_executed: false
merge: false
deploy: false
next: C08_jev_classifier_non_authoritative
```
