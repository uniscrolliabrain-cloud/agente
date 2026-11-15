# C10 — ContextServingFacade V2: snapshots, deltas, referencias y presupuestos
**Turno 11/16 · 2026-11-15 · Repo principal:** `uniscrolliabrain-cloud/agente` · **rama documental:** `audit/preflight-cognition-option3-20261115`.
**Estado:** auditoría estática y handoff de implementación, sin cambios de runtime, tests ejecutados, merge ni despliegue.
**Precedentes:** C00–C09. **Dependencias reales:** C02 durable event replay, C03 graph, C04 five memories/RAG, C05 cromos (ontología aún no aprobada), C06 attention, C07 extraction, C08 JEV (API no verificada), C09 CardStore+ledger. **Siguientes:** C11 Fast/Slow, C12 Presenter, C13 Anam, C15 E2E.

## 1. Resultado objetivo y decisión de reemplazo
Crear **una única fachada de lectura cognitiva** entre los productores de conocimiento y los consumidores Fast, Slow, Presenter y workers. En lugar de concatenar en `conversation.ts` RAG, ContextEngine, role memories, urgent hints y tarjetas, el runtime genera **ContextSnapshotV2** autorizado, versionado, presupuestado y reproducible; devuelve **deltas** o **referencias** cuando no conviene repetir contenido. Cada consumidor obtiene una vista adaptada al propósito y al permiso del actor. El Fast no espera a Slow, JEV, reindexación ni consolidación.

**Opción 3 sustitutiva:** `engine/context/assembly.ts`, `engine/context/budget.ts`, `engine/context/cognition-cards.ts` y el ensamblaje en `conversation.ts` pasan a **LEGACY TEMPORAL**; reutilizar solo utilidades puras comprobadas y el `ContextEngine` mediante adapters. No construir una fachada ornamental que delegue al mismo ensamblaje V1 indefinidamente.

## 2. Evidencia verificada en main — SHA blob, no commit
| Ruta | SHA blob | Hallazgo |
|---|---|---|
| `apps/server/src/engine/context/assembly.ts` | `39a9db7dd1882e21de80228517cc1cc8a64a5a90` | 132 líneas, `renderContext` a texto, role memories, attentionBoost lexical, límites por categoría |
| `apps/server/src/engine/context/budget.ts` | `713c9b3b757252ea6e469e95a576adae03cf5f2f` | 63 líneas, presupuesto por rol/entidad/memoria/evento/documento; estimación tokens |
| `apps/server/src/engine/context/cognition-cards.ts` | `3c6df6d14fcd0cd7b4617c99304d6a2b600a49fe` | 110 líneas, 3 cards, 700 chars, `markConsumed` antes de render |
| `apps/server/src/engine/conversation.ts` | `63b5ea67765180a4822b7debde3fd60489cb8000` | 1469 líneas; recall, RAG, ContextEngine, urgencias, cards y streaming ensamblados en el handler |
| `apps/server/src/engine/memory.ts` | `28dcf52b5df55c16529091ad45768895e510e27e` | 485 líneas; `MemoryService.recall` mezcla RAG, memories, facts y private memories; `formatRecall` textual |
| `apps/server/src/engine/rag.ts` | `74453c54484df22536a7c0bac5683073da077d61` | 575 líneas; chunks, registry de fuentes, pgvector opcional, BM25, index/reindex y citabilidad |
| `apps/server/src/kernel/cognition/card-store.ts` | `cbb1259b202ffb25a79511bdb927fa5c0199c41f` | CardStore V1 consumed; C09 documenta reemplazo |
| `apps/server/src/kernel/graph/attention.ts` | `cb526ccf3dff5a1caa6ba9475f3c826af6c8e7a1` | scoring de atención, no policy |
**Pendientes:** `engine/context/engine.ts` completo, route/middleware auth y task consumers, UI, tokenizer real, integración AG-UI, config por tenant, pruebas de TTFT, adapters DB/tenant y cambios en ramas de ejecución. **No afirmar auditoría exhaustiva ni pruebas ejecutadas.** Antes de tocar código, Freebuff fija SHA commit y reaudita HEAD.

## 3. Hallazgos C10-F01–F24
1. La composición de contexto ocurre en múltiples lugares de `conversation.ts`, no en una única fachada con contrato.
2. `MemoryService.recall` ya mezcla RAG/memories/facts/private; migrar sin perder esa separación de privacidad.
3. `conversation.ts` añade RAG al prompt como mensaje `system` con advertencia; hay que distinguir datos externos de instrucciones del sistema de forma robusta.
4. `conversation.ts` usa `precomputedRecall` para evitar doble recall en algunas rutas; preservar optimización.
5. `ContextEngine.assemble` se llama condicionado a rol; sin rol, las fuentes disponibles y prioridades pueden diferir.
6. `renderContext` es un renderer textual, no un snapshot inmutable con provenance/version.
7. `attentionBoost` depende de `nodeMentions` lexical; no garantiza evidencia ni ACL.
8. El presupuesto V1 asigna 2000 role, 3000 entity, 5000 memory, 2000 event, 10000 document tokens por defecto; **no es un límite global probado del modelo**.
9. `estimateTokens` necesita validación por tokenizer/modelo; aproximaciones no garantizan cabida real.
10. `selectWithinBudget` de budget.ts salta ítems grandes (`continue`), mientras selector de tarjetas C09 hace `break`; criterios inconsistentes.
11. `renderContext` limita recuerdos de rol a 8, propiedades 20, relaciones 15, eventos 10, hits RAG 5; son heurísticas sin optimización global.
12. `assembleCognitionCards` reclama tarjetas y las marca consumed antes de ACK; C09 debe sustituirlo.
13. `conversation.ts` emite `cognition.card.injected` al preparar/incluir, no prueba entrega efectiva ni uso por modelo.
14. El código V1 dispone de `release` en fallos de stream; no cubre todos los crashes/ACK tardíos.
15. `MemoryService.recall` usa umbrales de scores RAG 0.4/0.7; la escala del ranking no equivale a probabilidad de veracidad.
16. `MemoryService` busca memorias con cap 2000 y páginas de 500; la fachada debe distinguir truncado de ausencia.
17. `RagService` ya tiene registry de fuentes y citabilidad; **reutilizar**, no eliminar al migrar.
18. `RagService` indexa chunks y actualiza registry en pasos separados; C04 identificó riesgos de revisión/consistencia.
19. La búsqueda vectorial opcional y fallback BM25 requieren recibos de degradación, no un resultado indistinguible.
20. Los scopes owner, tenant, thread, private y role no son intercambiables; PDP y policyRevision deben acompañar cada referencia.
21. No existe contrato de delta/cursor compartido identificado en archivos auditados; no afirmar que el repositorio entero carezca de él.
22. `pendingMetaContext` y urgencias se agregan por rutas independientes; la fachada debe controlar prioridades e interrupciones.
23. El contexto Fast no debe bloquearse esperando Slow/JEV; deadlines y snapshot anterior válido son necesarios.
24. No se identificó mecanismo V2 para invalidar simultáneamente snapshot, referencias, cache y leases tras revocación.

## 4. Contratos propuestos (no existentes)
```ts
type ContextConsumerV2 = "fast"|"slow"|"presenter"|"worker"|"audit";
type ContextRefV2 = {
 refId:string; sourceKind:"event"|"graph"|"memory"|"rag"|"card"|"cromo"|"attention"|"task";
 sourceId:string; sourceRevision:string; tenantId:string;
 contentDigest:string; visibilityPolicyId:string; policyRevision:string;
 epistemicStatus:"hypothesis"|"reported"|"verified"|"contradicted"|"retracted";
};
type ContextRequestV2 = {
 schemaVersion:"2.0"; requestId:string; tenantId:string; actorId:string;
 consumer:ContextConsumerV2; threadId?:string; turnId?:string; taskId?:string;
 query:string; previousSnapshotId?:string; purpose:string;
 budgets:{deadlineMs:number;maxInputTokens:number;maxRefs:number;maxInlineChars:number};
 capabilities:{supportsDeltas:boolean;supportsReferences:boolean;tokenizerId?:string};
};
type ContextSnapshotV2 = {
 schemaVersion:"2.0"; snapshotId:string; tenantId:string; actorId:string;
 consumer:ContextConsumerV2; purpose:string; policyRevision:string;
 sourceWatermarks:Record<string,string>; algorithmVersion:string;
 refs:ContextRefV2[]; inlineSegments:Array<{refId:string;text:string;tokenCount:number;trust:"untrusted_data"|"verified_system"}>;
 excluded:Array<{refId:string;reason:"denied"|"stale"|"budget"|"duplicate"|"low_relevance"|"missing"}>;
 budgets:{maxInputTokens:number;usedInputTokens:number;remainingInputTokens:number};
 degradedSources:string[]; createdAt:string; expiresAt:string; digest:string;
};
type ContextDeltaV2 = {
 schemaVersion:"2.0"; baseSnapshotId:string; nextSnapshotId:string;
 tenantId:string; actorId:string; policyRevision:string;
 added:ContextRefV2[]; removedRefIds:string[]; changed:ContextRefV2[];
 sourceWatermarks:Record<string,string>; digest:string;
};
```
**Invariantes:** un delta no es válido si actor, tenant, propósito, policyRevision o base digest difieren; en tal caso entregar snapshot completo. Las referencias no son URLs públicas y se resuelven con nueva autorización. `verified_system` solo para instrucciones internas autenticadas, nunca para contenido de documentos/LLM/JEV. `sourceWatermarks` refleja cursores realmente soportados por C02, no relojes ficticios.

## 5. Flujo objetivo
```text
User/Task/Turn + KernelContext(authenticated)
  → ContextServingFacade.get(request)
     → authz/PDP, tenant/actor/purpose/field sensitivity
     → candidate collectors:
         C02 events | C03 graph | C04 5 memories/RAG
         C05 chromos (only approved ontology) | C06 attention
         C09 cards (only active authorized revisions)
     → provenance/epistemic/TTL/revocation checks
     → dedupe by canonical sourceRef + revision
     → bounded relevance scoring and tokenizer-aware budget
     → immutable ContextSnapshot
     → optional ContextDelta / authorized refs
     → C09 DeliveryPlanner lease/render/ACK
  → consumer-specific renderer (Fast / Slow / Presenter)
  → AG-UI stream independently; metrics + audit
```
**No hacer lecturas externas dentro del render**: la recuperación y snapshot se completan antes de render; si una fuente falla, registrar `degradedSources`, devolver snapshot seguro dentro de deadline. Para revocaciones críticas, invalidar inmediatamente o fail-closed, no usar cache obsoleta.

## 6. Reglas de serving y seguridad
- **Auth-first:** `tenantId`, actorId y purpose de contexto autenticado, nunca campos LLM ni cliente sin validar. PDP por cada referencia, incluso en delta/cache.
- **Source provenance:** sourceRevision, policyRevision, digest y estado epistemológico; un claim reported no se convierte en verified por repetición.
- **Budget global:** reservar tokens para instrucciones confiables, input del usuario, tools y respuesta; el presupuesto cognitivo es **subpresupuesto** del context window del modelo.
- **Tokens reales:** tokenizer compatible con proveedor/modelo o estimador conservador validado; tests de límite y fallback.
- **Relevance:** combinar C06 AttentionSnapshot, query, recency, evidence y novelty; pesos versionados y desempate estable; sin utilizar confidence LLM como verdad.
- **Reference mode:** inline solo fragmentos autorizados y pertinentes; resolver refs bajo policy vigente. No generar enlaces presignados sin TTL/ACL.
- **Deltas:** solo si hay snapshot base válido, mismo actor/tenant/consumer/purpose y policy revision. Evitar que el diff revele títulos/IDs de material no autorizado.
- **Invalidation:** cambio de permisos, retractación, borrado RGPD, fuente RAG reemplazada, memoria revocada o ontología actualizada → invalidar snapshot, delta y delivery leases.
- **Freshness:** tolerancias distintas por tipo de dato (hechos financieros, task status, recuerdos); nunca afirmar freshness sin watermark.
- **Prompt injection:** documentos, cards y resultados LLM son datos; delimitación, metadata trust y tests adversariales; ninguna tarjeta puede introducir system instructions.
- **Failure semantics:** `degraded` explícito y abstención para datos esenciales, sin respuestas inventadas por fallback.
- **Performance:** deadline de snapshot por consumidor, concurrencia acotada, cache segmentada por policyRevision/tenant/actor, circuit breaker por fuente, no bloqueo de TTFT.

## 7. Patchsets PS10.0–PS10.15 (rutas propuestas)
**PS10.0 Auditoría/ADR:** `C10/evidence/CALLGRAPH.md`, `CONTEXT-INPUT-MATRIX.md`, `AUTH-FLOW.md`, `TTFT-BASELINE.md`; auditar `context/engine.ts`, todos los callsites y branches.
**PS10.1 Domain:** `packages/domain/src/context-serving-v2.ts`, `context-ref-v2.ts`, `context-delta-v2.ts`; reutilizar contrato C01, evitar duplicados.
**PS10.2 Facade:** `apps/server/src/engine/cognition/context-serving/facade.ts`; `getSnapshot`, `getDelta`, `resolveRefs`, `invalidate`.
**PS10.3 Collectors:** `context-serving/collectors/{event,graph,memory,rag,card,chromatic,attention}.ts`; adapters C02–C09, bounded and abortable.
**PS10.4 Policy:** `context-serving/policy-filter.ts`; PDP, field classification, tenant/actor/purpose, consent.
**PS10.5 Canonical refs:** `context-serving/ref-resolver.ts`; sourceRevision, ACL on resolution, no bare URLs.
**PS10.6 Selection:** `context-serving/selector.ts`; score versionado C06, dedupe, epistemic status, stable ties.
**PS10.7 Budget:** `context-serving/token-budget.ts`; tokenizer/model-aware, global cap, truncation trace, source quotas.
**PS10.8 Snapshot store:** `context-serving/snapshot-store.ts`; immutable digest, TTL, policyRevision, replay.
**PS10.9 Delta engine:** `context-serving/delta-engine.ts`; base digest, added/removed/changed, invalidation.
**PS10.10 Invalidation:** `context-serving/invalidation.ts`; revocation cascade C03/C04/C09, indexes, tombstones.
**PS10.11 Renderer:** `context-serving/renderers/{fast,slow,presenter}.ts`; data-only formatting, no trusted role escalation.
**PS10.12 Delivery bridge:** `context-serving/delivery-bridge.ts`; C09 ledger lease/render/ACK after selection.
**PS10.13 Conversation adapter:** modificar `apps/server/src/engine/conversation.ts` solo tras inventario; sustituir gradualmente recall/context/cards por una llamada facade; preservar auth, quota, model chain, AG-UI.
**PS10.14 Observability/shadow:** `context-serving/metrics.ts`, tenant flags `contextServingV2.shadow/read` **propuestos**; comparar V1/V2 sin doble entrega.
**PS10.15 Tests:** contract, privacy, delta, replay, fault injection, perf, e2e, rollback, Codex review.

## 8. Olas W0–W10 con gates
**W0 — Baseline y mapa:** fijar commit SHA, callgraph real, ContextEngine, db/tenant, permisos, stream, tests. Gate: inventario de fuentes y consumidores.
**W1 — Contratos:** schemas, refs, snapshots/deltas, purpose, policy. Gate: strict Zod y no IDs cross-tenant.
**W2 — Collectors:** C02/C03/C04/C05/C06/C09, budgets y degradación. Gate: cada fuente con provenance.
**W3 — Auth:** PDP por fuente/campo, private memory, role downgrade, tenant switch. Gate: fail-closed.
**W4 — Ranking/budget:** tokenizer, scoring, context window global, stable tie. Gate: no overflow y TTFT baseline.
**W5 — Snapshot/delta:** immutable digest, cache y sourceWatermarks, delta base check. Gate: replay determinista.
**W6 — Invalidación:** revoke/retract/RGPD/role change/ontology; lease cancellation. Gate: ningún dato revocado en contexto.
**W7 — Ledger/renderers:** C09 ACK, consumers Fast/Slow/Presenter, prompt injection. Gate: no consumo prematuro.
**W8 — Shadow:** comparar prompts, recall, latency, cost, omissions, privacy. Gate: sin side effects.
**W9 — Canary:** solo con aprobación, rollback flags, p95 y tasa de fallos, tests e2e. Gate: GO/NO-GO.
**W10 — Certificación:** `pnpm typecheck`, `pnpm test`, `pnpm gate`, pruebas de streaming, Codex review, handoff C11. Gate: resultados reales y firma founder.

## 9. Matriz adversarial
| Test propuesto | Aceptación |
|---|---|
| `context-serving-contracts.test.ts` | schemas estrictos, tamaños, refs, versiones |
| `context-serving-tenant-isolation.test.ts` | no cruza empresas ni owners/roles |
| `context-serving-private-memory.test.ts` | memoria privada nunca llega a otro actor |
| `context-serving-policy-revision.test.ts` | role downgrade invalida snapshot/cache/delta |
| `context-serving-delta.test.ts` | base mismatch/actor mismatch → snapshot completo |
| `context-serving-replay.test.ts` | misma fuente+versión+policy → digest estable |
| `context-serving-token-budget.test.ts` | tokenizer y reserva de output, sin overflow |
| `context-serving-source-degradation.test.ts` | fallo RAG/graph/card → degraded explícito |
| `context-serving-rag-reindex.test.ts` | revisión sustituida no reaparece |
| `context-serving-revocation.test.ts` | retractación invalida refs y leases |
| `context-serving-prompt-injection.test.ts` | contenido externo no escala a instrucciones |
| `context-serving-delivery-ledger.test.ts` | ACK y retry sin pérdida ni doble efecto |
| `context-serving-fast-ttft.test.ts` | Slow/JEV no bloquean Fast, p95 medido |
| `context-serving-shadow.test.ts` | flags off preservan V1, no doble escritura |
| `context-serving-privacy-metadata.test.ts` | deltas/exclusions no filtran nombres privados |

## 10. Riesgos P0, migración y rollback
**P0:** prompt de contexto como system instruction; ACL solo en fuente pero no cache; ref/delta filtrando datos privados; invalidación parcial; timeout Fast; token budget no global; confianza LLM como verdad; fuentes RAG obsoletas; doble lectura/entrega; replay sin policy revision; C02–C09 aún no implementadas. Cada dependencia no disponible se representa como **blocked/degraded** en plan y gate, no con mocks que aparenten producción.

**Migración M0–M5:** M0 inventario/contratos, M1 collectors shadow, M2 snapshot store y policy, M3 read canary por tenant, M4 cutover autorizado, M5 retiro legacy y actualización de tests/docs. Rollback: desactivar `contextServingV2.read` (flag propuesto), conservar proyecciones, volver a V1 temporalmente **solo si política de seguridad lo permite**; ante revocación crítica sin garantía V1, fail-closed, no retorno inseguro. No borrar datos ni desplegar sin autorización.

## 11. Handoff y evidencia
Freebuff crea por ola `REPORT-Wx.md` con SHA base, archivos reales, patchsets, diffs, comandos/exit codes, métricas de TTFT/p95/tokens, riesgos, tests, Codex review y GO/NO-GO. Adjuntar `CALLGRAPH.md`, `AUTH-FLOW.md`, `CONTEXT-INPUT-MATRIX.md`, `TOKENIZER-VALIDATION.md`, `DELTA-REPLAY-TRACES.jsonl` sin PII, `HANDOFF-C11.md`. **No reportar PASS sin tests ejecutados.**

```yaml
campaign: C10
turn: 11/16
repo: uniscrolliabrain-cloud/agente
branch: audit/preflight-cognition-option3-20261115
source_ref: main
source_commit_sha: NOT_VERIFIED
status: STATIC_AUDIT_AND_PLAN
findings: 24
patchsets: 16
waves: 11
runtime_modified: false
tests_executed: false
merge: false
deploy: false
next: C11_fast_slow_independent_apis
```
