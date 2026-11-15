# C03 — Grafo cognitivo multicapa, procedencia, revisión e idempotencia
**Turno 04/16 · 2026-11-15 · Repo central:** `uniscrolliabrain-cloud/agente`.
**Estado:** auditoría estática y diseño de ejecución. **NO implementado; NO tests ejecutados; NO merge/deploy.**
**Vinculación:** [C00](./C00-REVISION-ULTRAGRANULAR-AUDITORIA-INCREMENTAL.md) · [C01](./C01-REVISION-ULTRAGRANULAR-CONTRATOS-Y-TAXONOMIA-V2.md) · [C02](./C02-EVENT-BUS-DURABLE-PROYECTOR-COGNITIVO-REPLAY.md) · [ADR-009](../ADR-009-REDISENO-SUSTITUTIVO-LEGACY-TRANSITORIO.md).

## 1. Objetivo y fronteras
Convertir los hechos autorizados y pensamientos existentes en un **grafo de conocimiento cognitivo multicapa, versionado y trazable**, apto para cinco memorias, seis polaridades cromáticas, atención vectorial y contexto Fast/Slow. El kernel sigue siendo autoridad; las hipótesis de Slow y clasificaciones JEV son propuestas, nunca hechos verificados por defecto. El repo Cyber únicamente debe emitir referencias de evidencia a través de su adaptador futuro: no modificarlo en C03.

**No construir un segundo kernel ni reemplazar el business graph sin auditar sus consumidores.** Sí diseñar la sustitución del grafo cognitivo insuficiente, mediante proyecciones V2 y retirada posterior del legacy. No ejecutar acciones a partir de aristas de razonamiento.

## 2. Evidencia de código, rutas y SHA de archivo de main
| Archivo | SHA blob | Hallazgo |
|---|---|---|
| `apps/server/src/kernel/graph/thought.ts` | `8b2eacc5927fa46e15465db493a020227e9b45ec` | Thought estricto, tenant/owner/actor/attention, edges entre Thoughts, provenance |
| `apps/server/src/kernel/graph/turn.ts` | `e5567354eab983192b9d2b04184fe1896ae96ab7` | parent/child turns, 500 thoughtIds, 100 childTurnIds |
| `apps/server/src/kernel/graph/store.ts` | `1665159e7039932e728a2dea14ac156767580c3e` | TurnStore tenant-scoped; no operaciones de grafo cognitivo multicapa |
| `apps/server/src/kernel/graph/port.ts` | `c1755a2af6e24553f2e61255225f37d09070eb34` | GraphPort read-only: resolveNode, neighbors, timeline |
| `apps/server/src/kernel/graph/attention.ts` | `cb526ccf3dff5a1caa6ba9475f3c826af6c8e7a1` | scoring determinista, canonicalNode/sameNode, overlap |
| `apps/server/src/kernel/graph/consolidate.ts` | `a4cda6d0dc3e7b6bda1676c394cbcdf9118d511f` | dedupe por hash; negación textual; cap de 200 Thoughts para comparación |
| `apps/server/src/kernel/kernel.ts` | `c48d832cee52dd0064317b3d360f0edd5b7227eb` | appendThought UUID nuevo; audit después de store; openTurnIdempotent solo encuentra turnos abiertos |
| `apps/server/src/kernel/cromos/cromo.ts` | `6efd66840dc85944884a1c2d0dcf3042e49e4629` | CROMOS_PENDING_V1; esquema mínimo sin polaridades operativas |

**Límite de auditoría:** no se ha leído aún la implementación concreta de todos los TurnStore, el business graph ni el promoter. Se intentó `apps/server/src/kernel/graph/promoter.ts`, que no existe en esa ruta. Localizar por búsqueda antes de crear o tocar archivos.

## 3. Hallazgos incrementales C03-F01–F16
1. **F01 — Thought no es KnowledgeNode:** Thought ya representa razonamiento/observación y no debe convertirse directamente en hecho de negocio. Crear proyección epistemológica con evidencia.
2. **F02 — Idempotencia:** `appendThought` genera `randomUUID()` cada vez. Reintentos pueden duplicar Thoughts; usar `sourceEventId+projectorVersion+semanticRole` como clave estable de proyección, no reemplazar UUID histórico sin migración.
3. **F03 — Turn reabierto:** `openTurnIdempotent` busca solo abiertos; un replay tras cierre puede abrir otro. No usar Turn como checkpoint del proyector.
4. **F04 — GraphPort lectura:** `resolveNode/neighbors/timeline` no permiten escritura/revisión de edges; diseñar puerto nuevo `CognitiveGraphProjectionPort`, mantener GraphPort legacy para vistas.
5. **F05 — Edge Thought:** `thoughtEdgeSchema` apunta solo a `toThoughtId`; no representa vínculos tipados entre tarjeta, evento, memoria, entidad, política y evidencia.
6. **F06 — Provenance limitada:** Thought provenance tiene source/timestamp/parentId/correlationId, no sourceEventId, projectorVersion, revision ni verificador.
7. **F07 — Attention no es autorización:** `attentionScope` incluye `global`; es una etiqueta cognitiva, no permiso para lectura cross-tenant.
8. **F08 — Normalización de referencias:** `canonicalNode/sameNode` sirve para scoring; no sustituye identidad tipada/tenant-bound ni ACL.
9. **F09 — Consolidación no semántica:** `consolidate` solo detecta negaciones explícitas y devuelve `textualNegations`; no etiquetar como contradicciones verificadas.
10. **F10 — Cap y muestreo:** comparación O(n²) se limita a 200 pensamientos mediante muestreo por ID. Riesgo de omitir contradicciones; diseñar recuperación por candidatos y métricas de cobertura.
11. **F11 — Dedupe insuficiente:** hash de role, actor.kind y contenido normalizado; no incorpora tiempo, fuente, actor.id ni ámbito de asunto. No fusionar automáticamente evidencia independiente.
12. **F12 — Orden del superviviente:** el primer Thought del grupo se conserva como survivor; no hay decisión por evidencia/verificación/recencia.
13. **F13 — Audit después de store:** en `Kernel.appendThought`, una excepción en audit tras append puede dejar Thought persistido aunque el caller crea que falló. Reconciliar y evitar reintento ciego.
14. **F14 — Turn límites:** 500 thoughtIds por turno, 100 hijos; el grafo duradero no debe depender de un turno ilimitado.
15. **F15 — Cromos pendientes:** `cromo.ts` declara tipos logic/physics/intent/memory/policy pero no la topología de seis puntas ni cableado. Reservar referencias, no inventar implementación actual.
16. **F16 — Integración de grafos:** kernel expone `businessGraph` legacy y `graph?:GraphPort`. Proyección cognitiva debe enlazar entidades sin reescribir silenciosamente business graph ni cambiar permisos.

## 4. Topología objetivo y separación de capas
```text
L0 Event log autoritativo C02  ──sourceEventId──┐
L1 Thought/Turn kernel existente ──thoughtRef───┤
L2 Evidence/Verification receipts C01 ─────────┤
                                               ▼
                                    CognitiveGraphProjection V2
                                  ┌─────────┼─────────┐
                           EntityRef   KnowledgeNode  ClaimNode
                                  └─────────┼─────────┘
                                  typed provenance/edges
                                  ┌─────────┼─────────┐
                             MemoryRef  CromoRef   AttentionRef
                                  └─────────┼─────────┘
                              ContextServing C09/C10
```
**Capas conceptuales, no necesariamente bases físicas separadas.** El evento autoritativo y los Thoughts históricos son fuente; el grafo es **proyección reconstruible**. Un Claim puede ser `hypothesis`, `reported`, `verified`, `contradicted` o `retracted`, con versiones y evidencias. `supports` no significa prueba concluyente. La política de acceso se evalúa en cada lectura.

## 5. Contratos propuestos (interfaces de diseño, no código existente)
### 5.1 CognitiveGraphNodeV2
```ts
type CognitiveGraphNodeV2 = {
 schemaVersion:"2.0"; nodeId:string; tenantId:string;
 kind:"claim"|"knowledge"|"event_ref"|"thought_ref"|"entity_ref"|"memory_ref"|"cromo_ref"|"attention_ref"|"evidence_ref";
 subjectId:string; revision:number; sourceRevision:string;
 epistemicStatus:"verified_fact"|"reported_fact"|"inference"|"hypothesis"|"contradicted"|"retracted";
 sourceRefs:string[]; visibilityPolicyId:string; policyRevision:string;
 createdAt:string; updatedAt:string; invalidatedAt?:string;
};
```
Separar `logical nodeId` y `revisionId` si se guardan versiones inmutables. No materializar secretos de Cyber en node metadata; usar evidenceRef con fetch autorizado.

### 5.2 CognitiveGraphEdgeV2
```ts
type CognitiveGraphEdgeV2 = {
 schemaVersion:"2.0"; edgeId:string; tenantId:string;
 fromNodeId:string; toNodeId:string;
 relation:"supports"|"contradicts"|"refines"|"derived_from"|"observed_in"|"about"|"depends_on"|"supersedes"|"attends_to"|"classified_as";
 weight?:number; confidence?:number; evidenceRefs:string[];
 sourceEventId:string; projectorVersion:string; revision:number;
 status:"active"|"superseded"|"revoked"; createdAt:string;
};
```
**Reglas:** extremos del mismo tenant; `global` solo para ontologías explícitamente públicas y nunca como atajo de datos de clientes; `confidence` no autoriza ejecución; proyección idempotente por sourceEventId+semanticKey+version.

### 5.3 CognitiveGraphProjectionPort
```ts
interface CognitiveGraphProjectionPort {
 applyBatch(input:{tenantId:string;consumerVersion:string;sourceEventId:string;nodes:CognitiveGraphNodeV2[];edges:CognitiveGraphEdgeV2[];fencingToken:string}):Promise<{digest:string;alreadyApplied:boolean}>;
 getNode(ctx:AuthorizedReadContext,ref:string):Promise<CognitiveGraphNodeV2|undefined>;
 neighbors(ctx:AuthorizedReadContext,ref:string,limit:number):Promise<CognitiveGraphNodeV2[]>;
 traceEvidence(ctx:AuthorizedReadContext,ref:string,depth:number):Promise<string[]>;
 invalidateSource(tenantId:string,sourceRef:string,policyRevision:string):Promise<void>;
}
```
`AuthorizedReadContext` procede de kernel/policy; no aceptar actor/tenant de una tarjeta o prompt. C02 define transacción, inbox, lease y cursor; C03 no reimplementa esos mecanismos.

### 5.4 Reglas de procedencia y temporalidad
Guardar `observedAt`, `ingestedAt`, `validFrom`, `validUntil` cuando correspondan, además de `sourceEventId` y `sourceRevision`. Diferenciar corrección de una fuente, contradicción entre fuentes, revocación de permiso y expiración. Toda invalidación debe propagarse a índices, memorias y snapshots (campañas posteriores). No borrar historia necesaria para auditoría salvo retención legal/privacidad; evitar exposición de nodos revocados.

## 6. Patchsets por ruta y dependencia
**PS03.0 — Descubrimiento real:** inventariar `apps/server/src/kernel/graph/**`, implementación de TurnStore, `GraphPort` adapters, business graph, Promoter, routes, tests, consumidores UI. Guardar `C03/evidence/GRAPH-CONSUMERS.md` y `STORAGE-BACKENDS.md`. No modificar hasta completar.
**PS03.1 — Contratos domain:** proponer `packages/domain/src/cognitive-graph-v2.ts`, `cognitive-graph-edge-v2.ts`, `cognitive-provenance-v2.ts`; exportar desde barrel **real**, tras localizarlo. Tests Zod y cross-tenant.
**PS03.2 — Projection port:** nuevo `apps/server/src/kernel/graph/cognitive-projection-port.ts`; adaptar storage tras W0, no duplicar `GraphPort` existente. Definir interfaces read/write y policy.
**PS03.3 — Normalización:** nuevo `apps/server/src/kernel/graph/cognitive-ref-adapter.ts`; mapear NodeRef V1, Thought, event source y entityRef; ambiguos a quarantine.
**PS03.4 — Proyección determinista:** nuevo `apps/server/src/kernel/graph/cognitive-projector.ts`; input C02, output nodes/edges con ID estable y digest. Sin llamadas LLM ni acciones.
**PS03.5 — Provenance e invalidación:** nuevo `apps/server/src/kernel/graph/cognitive-provenance.ts`; rastreo y revocación por sourceRevision/policyRevision; tests de ciclos.
**PS03.6 — Consolidación V2:** nuevo `apps/server/src/kernel/graph/consolidate-v2.ts`; separar dedupe exacto, candidatos semánticos, contradicción no verificada y decisión de promoción; no alterar `consolidate.ts` hasta canary.
**PS03.7 — Read facade:** nuevo `apps/server/src/kernel/graph/cognitive-query-v2.ts`; filtros tenant/actor/purpose, bounded traversals, paginación, presupuesto, cache invalidation.
**PS03.8 — Wiring shadow:** integrar mediante `projector-registry` de C02, solo namespace shadow; `KernelDeps.graph` legacy continúa sirviendo consumidores actuales. Flag por tenant.
**PS03.9 — Certificación:** tests y benchmarks; registrar diffs de edges, provenance y leakage; plan de rollback y handoff C04.

Todas las rutas nuevas son **propuestas**; antes de implementar comprobar convenciones reales y evitar colisiones.

## 7. Waves ejecutables con gates
### W0 — Baseline, búsqueda y compatibilidad
- Fijar SHA commit, verificar dependencias C01/C02 y rutas reales.
- Leer implementaciones persistentes/in-memory de TurnStore, GraphPort y business graph; localizar Promoter real con búsqueda.
- Elaborar tabla source→projection→consumer y qué está ya implementado.
- **Gate:** no escribir si no se conoce la atomicidad del store ni quién es owner de cada grafo.

### W1 — Taxonomía, IDs y schema
- Acordar tipos node/edge, semántica epistémica, identidad, revisión y retención.
- Crear PS03.1 y fixtures con 2 tenants, 3 usuarios y 2 agentes.
- Test de referencias desconocidas, cross-tenant, revisiones, evidencia faltante.
- **Gate:** ninguna etiqueta de atención o LLM equivale a autorización.

### W2 — Persistencia y proyección determinista
- Implementar PS03.2–PS03.4 en store shadow con IDs deterministas.
- Reutilizar inbox/lease/cursor C02, sin segunda cola paralela.
- Crash/retry/replay mismo sourceEventId produce mismo digest y una sola proyección.
- **Gate:** sin doble Thought ni mutación de grafo de negocio.

### W3 — Relaciones y provenance
- Construir edges tipados, traceEvidence, sourceRevision, invalidation.
- Probar grafo cíclico, aristas huérfanas, fuente borrada, corrección y retractación.
- **Gate:** una afirmación sin evidencia verificable no puede promoverse a hecho confirmado.

### W4 — Consolidación V2
- Contrastar `consolidate.ts` con corpus adversarial: negaciones, matices, entidades homónimas, idiomas, temporalidad y cambios de estado.
- Mantener heurística como señal, no juez; dedupe exacto solo con identidad/evidencia compatibles.
- Medir recall, falsos positivos, coste, cobertura del cap 200 y escalabilidad.
- **Gate:** no descartar evidencia independiente ni fusionar datos de dos empresas.

### W5 — Consulta, atención y compatibilidad
- Implementar PS03.7; límites de profundidad, tamaño, tiempo y tokens.
- Conectar referencias de AttentionVector, MemoryRef y CromoRef sin activar todavía motores C04/C05.
- Pruebas de ACL, revocación, tenant switch, role downgrade y actor suplantado.
- **Gate:** mismo contexto Fast/Slow solo recibe nodos autorizados y vigentes.

### W6 — Shadow/canary, tests, reporte
- Integrar shadow vía C02, comparar V1 y V2 solo en semánticas comparables.
- Ejecutar typecheck, tests focalizados, regresión de kernel, graph, business graph, events y seguridad; guardar logs/exit codes.
- Documentar rollback, índices creados, migraciones reversibles, métricas y plan C04.
- **Gate:** revisión independiente de Codex y aprobación humana antes de cutover.

## 8. Matriz de pruebas obligatoria
| Test propuesto | Aserción |
|---|---|
| `tests/cognitive-graph-schema-v2.test.ts` | tipos/edges estrictos, revisiones, timestamps |
| `tests/cognitive-graph-idempotency.test.ts` | replay y retry no duplican nodes/edges |
| `tests/cognitive-graph-tenant-isolation.test.ts` | no cross-tenant en lectura, escritura ni traversal |
| `tests/cognitive-graph-provenance.test.ts` | evidencia completa y fuente rastreable |
| `tests/cognitive-graph-revocation.test.ts` | invalidación efectiva en query/cache |
| `tests/cognitive-graph-consolidation-v2.test.ts` | contradicción ≠ negación textual; no fusión de evidencia distinta |
| `tests/cognitive-graph-legacy-compat.test.ts` | GraphPort/Thought/Turn existentes siguen operativos hasta cutover |
| `tests/cognitive-graph-projector-recovery.test.ts` | crash, lease, redelivery, idempotencia |
| `tests/cognitive-graph-attention-refs.test.ts` | score de atención no es permiso |
| `tests/cognitive-graph-performance.test.ts` | límites de profundidad, cap, paginación y p95 |

## 9. Riesgos P0 y controles
- **P0-01:** duplicación de Thought por UUID aleatorio → no usar appendThought como efecto de replay sin inbox/idempotencia.
- **P0-02:** GraphPort legacy leído como graph writer → crear puerto separado y ownership.
- **P0-03:** dedupe textual borra evidencia independiente → nunca borrar automáticamente.
- **P0-04:** cromo/attention global atraviesa tenant → ACL kernel en lectura.
- **P0-05:** fuente revocada sigue en snapshot → invalidación y revalidación por policyRevision.
- **P0-06:** contradicción heurística promovida a verdad → status epistémico explícito.
- **P0-07:** proyección muta business graph → shadow namespace y autorización de escritura separada.
- **P0-08:** cycles o traversals sin límite → depth, fanout, budget y timeout.
- **P0-09:** migración sin evidencia de adapters → gate W0.
- **P0-10:** dependencia C02 sin implementar → C03 puede diseñarse, **no** activarse en runtime.

## 10. Handoff y reporte por ola
```yaml
campaign: C03
turn: 04/16
repo: uniscrolliabrain-cloud/agente
source_ref: main
source_commit_sha: NOT_VERIFIED
documentation_branch: audit/preflight-cognition-option3-20261115
status: STATIC_AUDIT_AND_PLAN_ONLY
verified_code_paths: 8
unverified_consumers: [turn_store_adapters, business_graph, promoter, UI_graph_views]
patchsets_planned: 10
waves_planned: 7
files_modified_runtime: []
tests_executed: false
deploy: false
merge: false
next: C04_five_memories_and_retrieval_with_deeper_audit
```
**Regla de continuidad:** el siguiente turno debe releer C00–C03, actualizar hallazgos contradichos por código nuevo, y profundizar el subsistema de cinco memorias antes de documentar C04. No declarar C03 implementada por haber escrito esta guía.
