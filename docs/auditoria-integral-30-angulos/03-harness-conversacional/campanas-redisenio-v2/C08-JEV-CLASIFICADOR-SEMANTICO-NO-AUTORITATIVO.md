# C08 — JEV AI: clasificador semántico no autoritativo, gateway, contratos y certificación
**Turno 09/16 · 2026-11-15 · Repositorio:** `uniscrolliabrain-cloud/agente`. **Rama documental:** `audit/preflight-cognition-option3-20261115`.
**Estado:** auditoría estática y diseño de implementación; sin código de integración, sin pruebas ejecutadas, sin merge ni deploy.
**Dependencias:** C00–C07. **Consumidores:** C09 CardStore/ledger, C10 ContextServing, C15 aceptación.

## 1. Decisión arquitectónica
JEV recibe **candidatos de conocimiento**, no acceso libre al kernel ni permisos para mutar stores. Devuelve **señales semánticas estructuradas**: clasificación, similitud, redundancia, contradicción candidata, continuidad, relaciones propuestas, pertinencia, metadatos de cromos (solo ontología C05 aprobada), uncertainty y evidence anchors. El **runtime determinista** valida schema, identidad, evidencia, autorización, estado epistémico y decide qué proyectar. Slow redacta/extrae; JEV etiqueta y compara; **ninguno decide hechos, permisos, aprobaciones ni SOPs**. Se requiere un baseline determinista sin JEV y evaluación A/B.

## 2. Evidencia auditada en main
| Ruta | SHA blob | Qué confirma |
|---|---|---|
| `docs/campaigns/NC-COORDINATION/CONTRACT-CANDIDATES.md` | `b9a2d87519d99982f78aca131660fb517d9249d4` | JevAdapter/SemanticOperation bloqueados porque API real no verificada; dominio fuera de kernel |
| `docs/campaigns/NC-COORDINATION/specs/NC-03-SOURCE.md` | `3183af93bfe7d26725241ee0cb4b4b0852c2a55b` | semantic gateway, evaluación, continuidad, contradicción y scoring no autoritativos; plan previo |
| `apps/server/src/engine/events/schema-registry.ts` | `f0379f09273376494f63ec3bf126510242787ac8` | registro Zod por type@version; comentario de futura lectura por Jev/Pydantic |
| `packages/domain/src/classification.ts` | `8dae67137b664b82b17af110f92c41ea64b24cba` | **clasificación de seguridad de campos**, no clasificación cognitiva |
| `apps/server/src/engine/authz/pdp.ts` | `44e84885f5a12c5245bd526abe1a71ed5b6a20e8` | PolicyDecisionPoint ABAC con deny-overrides y clasificación de sensibilidad |
| `apps/server/src/kernel/cognition/card-builder.ts` | `2c2a9c915eb84535ee895d9880399f8f7fb41e90` | heurística V1 determinista para tipo de tarjeta; baseline parcial, no JEV |
| `apps/server/src/kernel/cromos/cromo.ts` | `6efd66840dc85944884a1c2d0dcf3042e49e4629` | cromos pending; ontología de polaridades no aprobada |
| `apps/server/src/engine/events/types.ts` | `1e00fb0381281aa57999a98ee48b47fd453e3f71` | catálogo cerrado; eventos cognitivos nuevos requieren schema |
| `docs/estado/FUTURE.md` | `f6bf5b4942af1d4d0463ce54361ce24bfe2c15f5` | idea histórica Jev+Pydantic, no evidencia de integración |

**Búsqueda efectuada:** `jev`, `JEV`, `classifier`, `classification` en búsqueda de código GitHub del repo. Resultado: referencias documentales y comentarios, **sin cliente JEV operativo identificado**. Limitación: búsqueda indexada no sustituye auditoría completa de dependencias, ramas, secretos, variables de entorno o repos externos; tampoco verifica API de proveedor. No afirmar inexistencia absoluta. **No inventar endpoints, SDK, precio, protocolo, credenciales ni comportamiento de Jev.**

## 3. Hallazgos C08-F01–F20
1. **F01:** Jev está especificado conceptualmente, pero no se verificó adaptador real en código.
2. **F02:** documentación NC marca explícitamente API Jev no verificada; no tratar plan como implementación.
3. **F03:** `SchemaRegistry` se diseñó pensando en Jev/Pydantic futuro, pero no hay consumo demostrado.
4. **F04:** `classification.ts` es de sensibilidad de datos; mezclarlo con semántica rompería privacidad y modelo mental.
5. **F05:** `PolicyDecisionPoint` es autoridad de acceso; Jev no lo sustituye.
6. **F06:** `card-builder.ts` clasifica por reglas simples; puede servir baseline de comparación, no verdad semántica.
7. **F07:** Slow/C07 ya produce Thought y tarjeta V1; el clasificador V2 debe recibir candidate con evidenceRefs, no texto sin procedencia.
8. **F08:** tipos de cromo y seis polaridades no están aprobados; JEV no puede rellenarlos inventando ontología.
9. **F09:** las relaciones semánticas no demuestran causalidad; causalidad requiere contrato específico y evidencia.
10. **F10:** similitud alta no equivale a duplicado exacto ni autoriza fusionar registros.
11. **F11:** contradicción semántica es candidato; no borrar claims existentes automáticamente.
12. **F12:** confidence de modelo no es calibración estadística ni evidencia verificable.
13. **F13:** salida de Jev es **dato externo no confiable**: validar esquema, tamaño, tipos, enum, referencias y versión.
14. **F14:** clasificación cross-tenant sería fuga; prefiltrar por ACL y minimizar datos enviados.
15. **F15:** API externa podría implicar transferencia de datos personales; exigir evaluación RGPD/DPA/región/retención antes de uso real.
16. **F16:** clasificación asíncrona no debe bloquear TTFT Fast ni ejecución autorizada de SOP.
17. **F17:** Jev caído debe producir estado `unavailable/degraded`, no etiquetas inventadas ni permisos ampliados.
18. **F18:** cambios de modelo/versiones de Jev alteran resultados; registrar `providerVersion`, `ontologyVersion`, `algorithmVersion`.
19. **F19:** reintentos requieren idempotencia por candidate revision, no duplicar proyecciones ni eventos.
20. **F20:** sin corpus etiquetado, baseline y métricas no se puede afirmar que Jev mejora la clasificación.

## 4. Contratos candidatos (no existentes)
```ts
type SemanticOperationV2 =
  | "classify_candidate" | "compare_similarity" | "detect_contradiction"
  | "propose_relation" | "evaluate_continuity" | "rank_relevance"
  | "propose_chromatic_metadata";
type SemanticEvaluationRequestV2 = {
 schemaVersion:"2.0"; requestId:string; tenantId:string; actorId:string;
 candidateId:string; candidateRevision:string; sourceEventIds:string[];
 operation:SemanticOperationV2; evidenceRefs:string[]; contentRefs:string[];
 policyRevision:string; ontologyVersion?:string;
 budget:{deadlineMs:number;maxInputTokens:number;maxOutputTokens:number;maxCostUnits:number};
};
type SemanticSignalV2 = {
 schemaVersion:"2.0"; requestId:string; signalId:string; candidateId:string;
 operation:SemanticOperationV2; provider:"baseline"|"jev";
 providerVersion:string; taxonomyVersion:string; ontologyVersion?:string;
 status:"evaluated"|"insufficient_evidence"|"invalid"|"unavailable"|"timeout";
 proposedLabels:string[]; relationCandidates:Array<{fromRef:string;toRef:string;kind:string;score:number}>;
 contradictionCandidates:Array<{leftRef:string;rightRef:string;score:number;reasonCode:string}>;
 evidenceRefs:string[]; uncertaintyCodes:string[]; observedAt:string;
};
type SemanticDecisionV2 = {
 signalId:string; decision:"accept_metadata"|"quarantine"|"reject"|"needs_review";
 decidedBy:"deterministic_policy"|"human_reviewer"; policyRevision:string;
 reasons:string[]; projectedEventIds:string[];
};
```
**Separación estricta:** `SemanticSignalV2` no contiene `allowed`, `approved`, `execute`, `verifiedFact` ni cambios directos de memoria. `provider=jev` solo se usa cuando cliente real validado. Referencias a contenido se resuelven por un gateway con permisos; no se envían secrets por defecto.

## 5. Pipeline y wiring transversal
```text
C07 Candidate (tenant/actor/evidence) → authz PDP + data minimization
 → semantic scheduler C02 (lease, budget, cancellation)
 → SemanticGateway
      ├─ DeterministicBaseline (siempre disponible)
      └─ JevAdapter (solo tras API real verificada y consentimiento/config)
 → strict schema validation + ref validation + version checks
 → SemanticSignal (append-only audit + provenance)
 → deterministic EvaluationPolicy + optional human review
 → C03 graph / C04 memory / C05 cromos / C06 attention / C09 cards
 → C10 ContextServing snapshots → Fast
```
JEV clasifica **tarjetas candidatas creadas por Slow** y, cuando corresponda, relaciones y memorias. No clasifica documentos enteros de forma indiscriminada: el scheduler selecciona segmentos pertinentes y autorizados. Distinguir sensibilidad del dato (`classification.ts`) de clasificación semántica (`SemanticOperationV2`).

## 6. Baseline determinista y evaluación
Implementar primero un `DeterministicSemanticBaseline` que: valida refs y schema, asigna etiquetas de reglas existentes cuando procede, devuelve `insufficient_evidence` si faltan citas, no declara contradicción por mera negación lexical, y no infiere cromos sin ontología. Construir corpus de casos con ground truth humano: claims equivalentes, parecidos pero distintos, contradicciones temporales, sarcasmo, negación, citas no verificables, duplicados, documentos maliciosos, español/inglés, roles y empresas diferentes. Métricas: precision/recall/F1 por operación, tasa de falsos positivos de contradicción, calibración, coste, latencia p50/p95/p99, throughput, tasa de abstención, cobertura de evidencia y privacy leakage. Umbrales numéricos se fijan tras baseline, no inventarlos.

## 7. Descubrimiento obligatorio de proveedor antes de integración
**G0 Provider Discovery — bloqueante para PS08.7:** localizar documentación oficial actual de Jev AI, especificación de endpoints/SDK/protocolo, autenticación, permisos, pricing/quotas, payload máximos, límites, política de retención, región de procesamiento, DPA, soporte de datos sensibles, timeouts y SLA. Crear `JEV-PROVIDER-VERIFICATION.md` con URLs oficiales, fecha, ejemplos reales de request/response y prueba sandbox **sin datos de cliente**. Si no existe API utilizable, mantener port con baseline y registrar `BLOCKED_EXTERNAL_PROVIDER`; **no escribir stub que aparente integración productiva**.

## 8. Patchsets PS08.0–PS08.13
- **PS08.0 Auditoría y provider discovery:** inventario real de imports, config, secretos, schema-registry, cards, workers, auth y dependencias; evidencias oficiales Jev.
- **PS08.1 Domain:** `packages/domain/src/semantic-evaluation-v2.ts`, `semantic-signal-v2.ts`, `semantic-decision-v2.ts` (Zod strict).
- **PS08.2 Port:** `apps/server/src/engine/cognition/semantic/semantic-port.ts` con `evaluate(req):Promise<SemanticSignalV2>`; sin SDK hardcoded.
- **PS08.3 Baseline:** `semantic/deterministic-baseline.ts`; pruebas con corpus, no clasificaciones engañosas.
- **PS08.4 Gateway:** `semantic/semantic-gateway.ts`; ACL, minimización, deadlines, quotas y schema validation.
- **PS08.5 Scheduler:** `semantic/evaluation-queue.ts`; reutiliza durable C02, no segundo bus.
- **PS08.6 Policy:** `semantic/evaluation-policy.ts`; kernel/PDP valida resultados, evita promociones automáticas.
- **PS08.7 Jev adapter condicionado:** `semantic/jev-adapter.ts`; implementar **solo** tras G0 y test sandbox; si no, no crear adaptador fingido.
- **PS08.8 Versioning:** `semantic/ontology-version.ts`, `semantic/taxonomy-registry.ts`; bloquear cromos hasta C05 aprobado.
- **PS08.9 Provenance:** `semantic/semantic-signal-store.ts`; events/outbox, sourceRevision y replay.
- **PS08.10 Projector:** `semantic/semantic-projector.ts`; C03/C04/C05/C06/C09, solo metadata aceptada.
- **PS08.11 Observability:** `semantic/metrics.ts`; abstention, disagreement, cost, latency, leakage.
- **PS08.12 Shadow:** flags tenant `semanticV2.shadow/jev/read` **propuestos**; compare baseline vs Jev, sin side effects.
- **PS08.13 Tests/handoff:** security, adversarial, fault injection, benchmark, CI, rollback y reportes.

**Nota:** rutas propuestas; verificar colisiones y convenciones en checkout. No añadir imports muertos, hooks vacíos ni archivos sin consumidor/test. No cambiar el kernel para introducir tipos de Jev.

## 9. Olas de ejecución W0–W9 y gates
**W0 Inventario:** confirmar HEAD SHA, llamadas, ramas en ejecución, scripts, secrets; mapa de dependencias. Gate: code evidence y owners.
**W1 Descubrimiento Jev:** fuente oficial y sandbox; si no disponible, estado bloqueado externo. Gate: contrato real validado.
**W2 Contratos:** strict Zod y referencias canónicas, taxonomy/version. Gate: deny-by-default.
**W3 Baseline:** corpus gold y métricas reproducibles. Gate: baseline medido, no claims sin evidencia.
**W4 Gateway:** budgets, auth, minimización, concurrency, cancel. Gate: sin fuga cross-tenant.
**W5 Integración condicional:** cliente Jev real, retry/backoff, circuit breaker, usage. Gate: sandbox y DPA.
**W6 Evaluación:** scores calibrados, contradiction candidates, review y no auto-promoción. Gate: ningún permiso o SOP alterado.
**W7 Proyección:** outbox/replay C02, C03/C04/C05/C06/C09; revocación. Gate: idempotencia.
**W8 Shadow/canary:** métricas y ablaciones, fallback y provider outages. Gate: latencia Fast no afectada.
**W9 Certificación:** pnpm typecheck/test/gate, e2e, Codex review, ADR, rollback, handoff C09. Gate: aprobación founder.

## 10. Tests adversariales propuestos
| Test | Aceptación |
|---|---|
| `semantic-contracts-v2.test.ts` | rechaza enum desconocido, scores NaN, refs ajenos, payload gigante |
| `semantic-policy-boundary.test.ts` | JEV jamás decide `allowed`, `approved`, `verifiedFact` |
| `semantic-tenant-isolation.test.ts` | no envío/lectura entre empresas, owner no sustituye tenant |
| `semantic-data-minimization.test.ts` | secret/confidential se bloquea o redacta por policy |
| `semantic-baseline-gold.test.ts` | corpus estable, métricas y abstención |
| `semantic-contradiction-temporal.test.ts` | contradicción temporal no provoca borrado automático |
| `semantic-causality.test.ts` | similitud y correlación no crean aristas causales |
| `semantic-ontology-version.test.ts` | seis polaridades sin ADR → abstain |
| `semantic-provider-timeout.test.ts` | fallback, circuit breaker, no Fast blocking |
| `semantic-idempotent-replay.test.ts` | mismo sourceRevision no duplica signals |
| `semantic-prompt-injection.test.ts` | output Jev y contenido externo tratados como datos |
| `semantic-revocation.test.ts` | fuente revocada no reaparece en graph/memory/context |
| `semantic-model-upgrade.test.ts` | version drift detectado y re-evaluación controlada |
| `semantic-cost-budget.test.ts` | límites de uso, concurrencia, cancelación |
| `semantic-shadow-legacy.test.ts` | flags off no cambian flujo V1 |

## 11. Riesgos P0 y rollback
**P0:** inventar API Jev; convertir Jev en juez; usar clasificación de sensibilidad como taxonomía; enviar PII sin base legal; contaminación cross-tenant; inferir polaridades no definidas; fusionar claims similares; crear causalidad falsa; pérdida de eventos por doble escritura; revocación parcial; costes sin presupuesto; bloquear Fast; modelos sin calibración; promover instrucciones maliciosas. Controles: discovery G0, ports, policy, evidencia, status epistemológico, abstención, shadow, métricas y replay.

Rollback: desactivar Jev/lectura V2 por tenant (flags propuestos), mantener baseline, conservar señales auditables con retención, reindexar proyecciones desde eventos si es necesario, no borrar V1 ni modificar policy. Si el proveedor no cumple seguridad/contrato, **NO-GO** de integración externa, pero se puede avanzar con baseline determinista.

## 12. Reportes y aceptación
Por ola, Freebuff escribe `REPORT-Wx.md`: commit base, rutas reales, diffs, comandos/exit codes, métricas, evidencias API Jev, problemas, decisiones, riesgos, rollback y estado GO/NO-GO; Codex audita tests en rama separada. Adjuntar `JEV-PROVIDER-VERIFICATION.md`, `CALLGRAPH.md`, `SECURITY-DATA-FLOW.md`, `CORPUS-GOLD.md`, `EVAL-RESULTS.md`, `HANDOFF-C09.md`.

```yaml
campaign: C08
turn: 09/16
repo: uniscrolliabrain-cloud/agente
branch: audit/preflight-cognition-option3-20261115
source_ref: main
source_commit_sha: NOT_VERIFIED
status: STATIC_AUDIT_AND_PLAN
jev_api_verified: false
jev_runtime_client_identified: false
findings: 20
patchsets: 14
waves: 10
runtime_modified: false
tests_executed: false
merge: false
deploy: false
next: C09_cardstore_v2_delivery_ledger
```
