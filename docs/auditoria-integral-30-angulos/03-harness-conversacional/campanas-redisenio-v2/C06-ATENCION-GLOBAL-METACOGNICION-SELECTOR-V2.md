# C06 — Atención global, metacognición y selección de contexto V2
**Turno 07/16 · 2026-11-15 · Repositorio central:** `uniscrolliabrain-cloud/agente`. **Estado:** auditoría estática/documentación; sin código V2, tests, merge ni deploy.
**Dependencias:** C00–C05; especialmente C02 durable event projections, C03 graph, C04 memory, C05 ontology pending. **Consumidores futuros:** C07 Slow, C09 CardStore, C10 ContextServing, C11 Fast, C12 Presenter.

## 1. Objetivo y decisión sustitutiva
Construir una **Global Attention Workspace V2** que seleccione información relevante por tenant/actor/turno/tarea, mantenga vectores por autor y contexto, compare divergencias, trace las razones de inclusión/exclusión, gestione urgencia y no interrumpa al usuario salvo por política. **Sustituye** la heurística insuficiente como arquitectura final; conserva funciones puras útiles y adaptadores legacy en shadow. El kernel conserva autoridad de identidad, permisos y acciones; la cognición propone prioridades, no autorización.

## 2. Código realmente examinado, main (SHA blob)
| Archivo | SHA | Evidencia |
|---|---|---|
| `apps/server/src/kernel/graph/attention.ts` | `cb526ccf3dff5a1caa6ba9475f3c826af6c8e7a1` | `topMatched`, `normalizedWeights`, `matchScore`, `attentionOverlap`, `divergence`, `fromMetadata` |
| `apps/server/src/kernel/graph/thought.ts` | `8b2eacc5927fa46e15465db493a020227e9b45ec` | AttentionVector con author, scope, primary, matched, ignored, intent, confidence y Zod |
| `apps/server/src/kernel/observers/meta.ts` | `46be97c1bfbbc9345b6a07a4585ec95f6c25872e` | Meta hints, `seenHints` in-memory, progress casting, `detectAttentionConflict` |
| `apps/server/src/kernel/authors/fast-author.ts` | `237ab1c0c5174aa3d55259b4662d0886153a5946` | fallback de matched por substring de respuesta; confidence 0.9 por defecto; query = respuesta |
| `apps/server/src/kernel/authors/slow-author.ts` | `13f68919a3fddbe323613fc3e419153c0cdefcfa` | progress en attention.metadata, fallback `reasoning` 0.6/`delegation` 0.5, confidence 0.8 |
| `apps/server/src/engine/context/assembly.ts` | `39a9db7dd1882e21de80228517cc1cc8a64a5a90` | `attentionBoost` por menciones, ranking lexical y límites de items |

**Pendiente de inspección completa:** callsites de `Meta.evaluate` y `detectAttentionConflict`, consumers UI, presenter, attention in tasks, auth context, metrics, benchmarks, tests, stream lifecycle y storage de hints. SHA de commit base NO verificado. No afirmar ejecución ni cobertura exhaustiva.

## 3. Hallazgos C06-F01–F19
1. AttentionVector V1 existe y valida Zod; no existe aún un workspace global duradero de competencia de focos.
2. `topMatched` ordena pesos pero no valida elegibilidad/ACL.
3. `normalizedWeights` usa `canonicalNode`; normalización de pesos no equivale a relevancia factual.
4. `matchScore` usa primera coincidencia `sameNode`, mientras `normalizedWeights` agrega: posibles diferencias si referencias equivalentes duplicadas.
5. `attentionOverlap` usa matching voraz y Jaccard ponderado; orden de entrada puede afectar emparejamiento con referencias equivalentes.
6. `divergence=1-overlap` mide diferencia de foco, no contradicción epistemológica.
7. `attentionScope.global` es scope cognitivo, **no permiso global**.
8. `thought.ts` permite razones `string` además de enums, lo que dificulta taxonomía/analítica estable.
9. `thought.ts` valida duplicados por string exacto, mientras matching posterior usa equivalencia canónica: posible discrepancia.
10. `FastAuthor` deduce matched por substring de respuesta, no por evidencia recuperada.
11. `FastAuthor` pone confidence 0.9 por defecto sin calibración verificable.
12. `SlowAuthor` inventa nodo genérico `reasoning` o `delegation` si no hay matched; no confundir con entidad real.
13. `SlowAuthor` usa confidence 0.8 por defecto; no es confianza calibrada.
14. `SlowAuthor` guarda ProgressEvent en `attention.metadata.progress`, acoplando señal de estado y atención.
15. `Meta.extractProgress` castea metadata a ProgressEvent sin parsear contra schema en esa ruta.
16. `Meta.seenHints` es memoria local; `evaluate` no comprueba ese Set al emitir, y `maybeCleanup` no se invoca en `evaluate`: **no demuestra supresión efectiva de duplicados**.
17. `Meta.detectAttentionConflict` aplica umbral overlap 0.3 y devuelve booleano, sin explicaciones ni estatus de conflicto.
18. `Meta.evaluate` define fast idle como 1000 ms fijo, mientras `MetaDeps.longNoOutputMs` es configurable: revisar compatibilidad con tenant config y UI.
19. `renderContext` usa `nodeMentions` y scoring lexical de memorias; no integra una decisión global reproducible ni ledger de entrega.

## 4. Arquitectura objetivo
```text
Events C02 + Claims C03 + Memories C04 + Chromatic signals C05
                    ↓ (auth/policy first)
          AttentionCandidateRegistry
             ↙       ↓       ↘
       Fast focus  Slow focus  Worker/user focus
             ↘       ↓       ↙
         GlobalAttentionWorkspace V2
          scoring + budgets + conflict detection
               + trace/exclusions
                    ↓
         AttentionSnapshot (tenant/actor/turn)
          ↙             ↘
 ContextServing C10    MetaHints durable C09
          ↓                 ↓
       Fast C11       Presenter C12 / UX
```
Global Workspace significa **competición y coordinación de información autorizada**, no un almacén global entre empresas. Scoring cognitivo separado de `PolicyDecisionPoint`. JEV puede proponer relaciones en C08; la decisión de publicación se valida determinísticamente.

## 5. Contratos propuestos, no existentes
```ts
type AttentionCandidateV2 = {
 schemaVersion:"2.0"; candidateId:string; tenantId:string; actorId:string;
 sourceRef:string; sourceRevision:string; sourceKind:"event"|"thought"|"claim"|"memory"|"cromo"|"task"|"user_input";
 attentionAuthor:"user"|"fast"|"slow"|"worker"|"presenter"|"system";
 targetRefs:string[]; reasonCode:string; evidenceRefs:string[];
 relevance:number; urgency:number; recency:number; uncertainty:number;
 estimatedTokens:number; observedAt:string; policyRevision:string;
};
type AttentionSnapshotV2 = {
 snapshotId:string; tenantId:string; actorId:string; turnId?:string; taskId?:string;
 workspaceVersion:string; algorithmVersion:string; policyRevision:string;
 selected:Array<{candidateId:string;score:number;reasonCodes:string[]}>;
 excluded:Array<{candidateId:string;reasonCode:"denied"|"stale"|"duplicate"|"budget"|"irrelevant"|"low_confidence"}>;
 maxTokens:number; expiresAt:string; sourceEventIds:string[]; digest:string;
};
type MetaHintV2 = {
 hintId:string; tenantId:string; actorId:string; correlationId:string;
 sourceEventId:string; kind:"slow_ready"|"slow_failed"|"progress_stalled"|"needs_clarification"|"high_priority_update";
 urgency:"low"|"medium"|"high"; state:"pending"|"leased"|"delivered"|"acknowledged"|"expired";
 policyRevision:string; createdAt:string; expiresAt:string; evidenceRefs:string[];
};
```
Los IDs y digests deben ser estables por `tenant+sourceEvent+algorithmVersion+semanticRole`. Un cambio de permisos invalida snapshots. Nunca incluir contenido secreto en logs de scoring.

## 6. Reglas de scoring y selección
**Primero filtrar por auth, vigencia y status epistemológico.** Después normalizar scores finitos en [0,1], versionar coeficientes y registrar trazas. Ejemplo inicial **solo de diseño, pendiente calibración**:
`score = wR*relevance + wU*urgency + wT*recency + wE*evidenceStrength + wN*novelty - wC*tokenCost - wD*duplication`.
No convertir `confidence` de un LLM en `evidenceStrength`. Presupuestos independientes para contexto Fast, Slow y Presenter; `maxCandidates`, `maxDepth`, `deadlineMs` y `maxTokens`. Desempate estable por score, observedAt, candidateId. Selección determinista para mismo snapshot, coeficientes y permisos. Los pesos se calibran con corpus y ablaciones; no afirmar óptimos.

**Divergencia:** diferenciar `focus_divergence` (vectores no coinciden), `claim_contradiction_candidate` (evidencias incompatibles) y `policy_conflict` (decisión kernel). Solo la última puede bloquear ejecución; las otras generan solicitud de aclaración o investigación.

## 7. Patchsets PS06.0–PS06.12
- **PS06.0 inventario:** localizar imports y consumidores de `Meta`, `AttentionVector`, `attentionOverlap`, `renderContext`; diagramar pipeline real, flags y métricas. Crear `C06/evidence/CALLGRAPH.md`, `SCORING-BASELINE.md`.
- **PS06.1 domain:** `packages/domain/src/attention-workspace-v2.ts`, `meta-hint-v2.ts`; Zod strict, canonical refs, sourceRevision, actor/tenant.
- **PS06.2 ports:** `apps/server/src/engine/cognition/attention/ports.ts`; interfaces candidate registry, snapshot store y MetaHint delivery, sin nuevo Event Bus.
- **PS06.3 canonicalizer:** `attention/canonicalize.ts`; usar `node-ref.ts`, eliminar duplicados equivalentes con pruebas de orden.
- **PS06.4 candidate builder:** `attention/candidate-builder.ts`; entradas de C02–C05, razones, evidence y ACL.
- **PS06.5 scorer:** `attention/scoring.ts`; funciones puras, pesos versionados, presupuesto, deterministic ties.
- **PS06.6 workspace:** `attention/global-workspace.ts`; snapshots, competition, exclusions, dedupe y TTL.
- **PS06.7 meta evaluator:** `attention/meta-evaluator.ts`; estados y hints de progreso; parsear ProgressEvent; separar meta de policy.
- **PS06.8 ledger:** `attention/hint-delivery.ts`; inbox/outbox C02, lease/fence, ACK y replay; **no** reutilizar `Meta.seenHints` como garantía durable.
- **PS06.9 author adapters:** `attention/author-adapters.ts`; mapear FastAuthor/SlowAuthor sin defaults engañosos, registrar `confidenceOrigin`.
- **PS06.10 context adapter:** `attention/context-adapter.ts`; servir solo snapshots autorizados a C10, no prompt injection.
- **PS06.11 shadow wiring:** flags por tenant, comparar V1/V2 sin alterar rutas legacy, observabilidad.
- **PS06.12 tests:** unit, property, concurrency, security, perf, integration, e2e, fault injection.

**Clasificación:** reutilizar `attention.ts` como funciones puras; sustituir heurística de ranking y Meta como autoridad de entrega; mantener `Meta`/authors V1 como LEGACY TEMPORAL hasta gates. Paths nuevos son propuestas sujetas a descubrimiento de convenciones y colisiones.

## 8. Waves W0–W8
**W0 — Auditoría real:** SHA commit, imports, consumers, tests, tenant config, observer loops y estados. Gate: callgraph completo.
**W1 — Contratos:** identidad, scope, reason taxonomy, validación y schema version. Gate: sin acceso cross-tenant.
**W2 — Candidatos:** extraer señales de eventos, grafo y memorias; distinguir confidence de evidencia. Gate: provenance verificable.
**W3 — Selección:** scoring determinista y budgets; dataset multilingüe y ambiguo. Gate: reproducibilidad, límite de tiempo.
**W4 — Metacognición:** hints durables, progress typed, ACK/retry, no interrupciones ficticias. Gate: no duplicados ni hints huérfanos.
**W5 — Adaptadores:** authors y context assembly; Fast independiente y no bloqueante. Gate: p95 y compatibilidad.
**W6 — Shadow:** tenant feature flags, comparar V1/V2, medir selección y supresión. Gate: sin side effects.
**W7 — Seguridad y resiliencia:** tenant switch, role downgrade, revoked memory, restart, worker crash, backpressure. Gate: fail-closed.
**W8 — Certificación:** pnpm typecheck/test/gate, integración con C02–C05, logs, reporte Codex, rollback y handoff C07. Gate: aprobación founder para activar.

## 9. Matriz de pruebas
| Test propuesto | Esperado |
|---|---|
| `attention-canonicalization-v2.test.ts` | refs equivalentes, orden independiente, no duplicados |
| `attention-workspace-tenant.test.ts` | datos tenant A no aparecen para B |
| `attention-workspace-policy.test.ts` | downgrade y revocación invalidan snapshot |
| `attention-workspace-scoring.test.ts` | score estable, finito, budget y desempates |
| `attention-workspace-conflicts.test.ts` | foco divergente ≠ contradicción factual |
| `attention-meta-progress.test.ts` | payload inválido rechazado, sin casts |
| `attention-hint-delivery.test.ts` | ACK/retry/restart exactamente una entrega efectiva |
| `attention-author-adapters.test.ts` | default confidence no es certeza |
| `attention-context-serving.test.ts` | no fuga de referencias/secretos ni prompt injection |
| `attention-workspace-performance.test.ts` | p95, token budget, 1000 candidatos |
| `attention-shadow-legacy.test.ts` | flags off mantienen comportamiento V1 |

## 10. Riesgos P0 y rollback
P0: scope global confundido con permiso; score LLM confundido con hecho; metadata de progreso no validada; hint in-memory confundido con ACK; feedback de atención crea bucles; snapshot obsoleto después de revocación; ranking introduce latencia; canonical refs colisionan entre tenants; selección reenvía texto malicioso; tareas Slow bloquean Fast. Control: auth-first, epistemic status, ledger durable, bounded budgets, snapshots versionados, métricas y feature flags. Rollback desactiva `attentionV2.shadow/read` (nombres **propuestos**), conserva proyecciones para auditoría y devuelve lectura al contexto V1 sin borrar fuentes.

## 11. Handoff y reporte obligatorio
Cada wave genera `REPORT-Wx.md` con commit base, archivos tocados, diff, pruebas realmente ejecutadas y exit codes, métricas, riesgos, fallos, owner, rollback y GO/NO-GO. Adjuntar `CALLGRAPH.md`, `SCORING-BASELINE.md`, `AUTH-MATRIX.md`, `EVAL-DATASET.md`, `REPLAY-TRACES.jsonl` anonimizados. No reportar PASS sin ejecutar tests.

```yaml
campaign: C06
turn: 07/16
repo: uniscrolliabrain-cloud/agente
branch: audit/preflight-cognition-option3-20261115
source_ref: main
source_commit_sha: NOT_VERIFIED
status: STATIC_AUDIT_AND_IMPLEMENTATION_PLAN
findings: 19
patchsets: 13
waves: 9
runtime_modified: false
tests_executed: false
merge: false
deploy: false
next: C07_async_slow_llm_enriched_thoughts_cards
```
