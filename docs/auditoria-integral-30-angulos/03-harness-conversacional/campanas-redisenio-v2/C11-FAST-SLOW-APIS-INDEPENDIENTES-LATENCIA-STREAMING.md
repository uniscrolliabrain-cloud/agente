# C11 — Fast/Slow: servicios independientes, contratos API, latencia, streaming y backpressure

**Turno 12/16 · 2026-11-15 · Repositorio principal:** `uniscrolliabrain-cloud/agente` · **Rama documental:** `audit/preflight-cognition-option3-20261115`.
**Estado:** auditoría estática de código y diseño sustitutivo; **NO** implementación de runtime, **NO** pruebas ejecutadas, **NO** merge/deploy.
**Dependencias:** C00–C10; especialmente C02 event bus durable, C07 Slow async, C09 delivery ledger, C10 ContextServing. **Siguientes:** C12 Presenter/UX, C13 Anam, C14 ciberseguridad, C15 E2E.

## 0. Mandato del fundador y límites
**Objetivo:** Fast es una interfaz conversacional de baja latencia con su propia API/provider, modelo y presupuesto. Slow es un servicio de razonamiento y ejecución cognitiva asíncrona con API/provider, worker, cuotas y prioridades independientes. **Fast NO espera a Slow** y Slow no comparte su cola ni sus recursos de ejecución con Fast. El kernel determinista conserva autorización, efectos, eventos y trazabilidad. El resultado de Slow se publica por C02/C07/C09/C10, no mediante respuesta sincrónica forzada.

**Opción 3 sustitutiva:** reemplazar el ensamblaje y fallback cruzado de `conversation.ts`/`model.ts`/`model-chain.ts` por ports y runtime separados; conservar compatibilidad V1 en shadow/canary, retirar después. No mantener permanentemente el acoplamiento bajo un wrapper cosmético. No alterar contratos externos AG-UI ni SOPs sin matriz de compatibilidad.

## 1. Auditoría de código real en main (SHA blob, no commit)
| Archivo | SHA blob | Evidencia |
|---|---|---|
| `apps/server/src/engine/conversation.ts` | `63b5ea67765180a4822b7debde3fd60489cb8000` | 1469 líneas; `ConversationAgent` AG-UI; delegación, contexto, cards, config tenant, cuotas, streaming y Presenter en mismo módulo |
| `apps/server/src/engine/model.ts` | `34989a4887c242d5b331e61620dacd4c5f055770` | 809 líneas; `executeModelTask`, tools secuenciadas, Slow fallback, abort, timeout 300000 ms, usage, capture y cierre de turnos |
| `apps/server/src/engine/model-chain.ts` | `602b7ba758e95be25ac73cc3d78b7342fadae099` | 291 líneas; `modelChain`, `runWithModelFallback`, circuit breakers, bulkhead en memoria por provider, first-byte/total timeouts, abort |
| `apps/server/src/kernel/authors/fast-author.ts` | `237ab1c0c5174aa3d55259b4662d0886153a5946` | 103 líneas; persiste output real Fast en Thought, con atención |
| `apps/server/src/kernel/authors/slow-author.ts` | `13f68919a3fddbe323613fc3e419153c0cdefcfa` | 160 líneas; persiste output real Slow, progreso en metadata |
| `apps/server/src/engine/service.ts` | `a5f7ac6932c70066dd1e6a8f94edf8e67efe5dcb` | 3168 líneas; service central, worker, tareas durables, `executeModelTask`, cuotas y maintenance |
| `apps/server/src/engine/context/engine.ts` | `e986b20089953fdb69e0b15ebc83bf65c2614c2d` | 204 líneas; `ContextEngine.assemble`, recall, rol, entidades, eventos, learning; emite context.assembled |
| `apps/server/src/engine/context/cognition-cards.ts` | `3c6df6d14fcd0cd7b4617c99304d6a2b600a49fe` | C09: consumo de tarjeta antes de ACK |
| `apps/server/src/engine/events/bus.ts` | `21fe61384c6f12002d2e41bea172819c607629c7` | C02: bus con replay limitado y suscriptores no durables |
**Alcance verificable:** lectura completa de módulos cortos y tramos relevantes de `conversation.ts`, `model.ts`, `model-chain.ts`, `context/engine.ts`; no inventario exhaustivo de rutas HTTP, worker/adapters, clientes UI ni despliegue. **Revalidar HEAD y callsites antes de implementar**. No se ejecutó benchmark ni test.

## 2. Hallazgos C11-F01–F27
1. `modelChain(config,tenant,mode)` ya separa modo `chat` (fast) y `task` (slow), **pero la política de fallback puede mezclar perfiles**.
2. En `conversation.ts` ~1063–1070, si Fast y Slow tienen credenciales, el chat construye `[fast,slow]`; **fallback Fast→Slow confirmado**.
3. En ~1076–1078, el modelo específico de rol puede adelantarse al Fast; falta garantía de clase de latencia.
4. En ~1080–1084, si solo hay Fast se añade cadena global; no hay clasificación de latencia/coste por perfil.
5. `modelChain` default `mode="task"`; un caller que omite mode puede obtener ruta no prevista.
6. `runWithModelFallback` permite `maxSpecs` opcional; sin él, se usan todos los candidatos.
7. El fallback solo salta a siguiente modelo antes de eventos que demuestran salida visible; buena garantía reutilizable.
8. `producedOutput` incluye eventos de tools; una herramienta iniciada puede impedir fallback aunque no haya respuesta textual; revisar semántica.
9. `runWithModelFallback` tiene first-byte y total deadlines por intento, pero no deadline global de solicitud para todos los intentos.
10. Chat pasa firstByteMs 8000 y totalMs 45000 por defecto; **son valores de configuración, no mediciones de latencia**.
11. Slow tiene además timeout exterior 300000 ms; puede coexistir con timers por intento del model-chain; documentar jerarquía.
12. Bulkhead `globalThis.__llm_bulkhead__` es un Map **por proceso**, no cuota distribuida.
13. Bulkhead está indexado por proveedor, no por fast/slow/tenant; un Slow saturado puede afectar Fast del mismo provider.
14. Si bulkhead lleno y no hay fallback, el código sigue aumentando contador e intentando; no constituye límite duro.
15. Circuit breaker `globalCircuits.get("llm:"+provider)` comparte estado por proveedor entre clases; fallo Slow puede degradar Fast.
16. `runWithModelFallback` libera bulkhead en rutas de éxito/fallo y usa attemptId para ignorar eventos tardíos; reutilizar comportamiento tras tests.
17. `ConversationAgent` implementa AG-UI Observable, cancelación y stream, pero contiene composición de contexto, tools, model routing y Presenter.
18. `shouldDelegateToSlow` añade **instrucción al prompt** para delegar; no es decisión determinista de runtime.
19. La heurística de delegación no demuestra que el trabajo se haya encolado; el acuse del Fast debe depender de receipt real.
20. La política de prompt «Nunca digas lo que vas a hacer» contradice la UX acordada de mostrar fases verificables; resolver en C12.
21. `ConversationAgent` hace lecturas de RAG/context/cards y cuotas antes de llamar al modelo; medir cada tramo para aislar TTFT.
22. Cuotas Fast se calculan leyendo `llm-usage` y agregando en memoria; bajo concurrencia la comprobación previa no garantiza reserva atómica.
23. `model.ts` hace comprobación análoga para Slow; preservar controles pero introducir reservas por clase de servicio.
24. `model.ts` serializa tools por `toolQueue`; mantener idempotencia, aprobación y orden de efectos durante refactor.
25. Slow registra uso y captura Thought/card tras completar; C07 separa publicación y consolidación del resultado.
26. `FastAuthor`/`SlowAuthor` escriben grafo real, pero no sustituyen contratos durables de resultados ni ACK C02/C09.
27. `service.ts` une worker y servicio conversacional; un aislamiento real necesita políticas, recursos y despliegue observables, no solo dos funciones.

## 3. Topología objetivo y política de aislamiento
```text
HTTP/AG-UI auth middleware
  → ConversationGateway (tenant, actor, role, requestId, thread)
      → FastAdmissionControl (fast-only quota, priority, deadline)
      → C10 ContextServingSnapshot (bounded)
      → FastInferencePort (Fast provider chain ONLY)
      → AG-UI stream → C12 Presenter
      → Fast output receipt / C02 event / C03 Thought
      ↘ DelegationDecision (deterministic policy + Fast proposal)
          → C02 durable TaskRequested → worker lease/fence
              → SlowAdmissionControl (separate budget & queue)
              → SlowInferencePort (Slow provider chain ONLY)
              → C07 extraction/Thought/candidate
              → C08 semantic signals (optional)
              → C03/C04/C09 projections → C10 snapshot/delta
              → C12 async notification/progress (not fabricated)
```
**Aislamiento por clase:** Fast y Slow tienen provider allowlists, API credentials, circuit/bulkhead, token/cost quotas, concurrency, deadlines, retry policy, telemetry y fallback independientes. Pueden compartir infraestructura física si hay límites verificables y prioridades; si no se puede garantizar p95 Fast bajo carga Slow, separar pools/procesos/despliegues. Un provider común puede tener rate limit compartido externo: implementar capacidad reservada Fast, o degradar con señal explícita.

## 4. Contratos propuestos, no existentes
```ts
type InferenceClassV2 = "fast"|"slow";
interface InferenceRequestV2 {
 schemaVersion:"2.0"; requestId:string; correlationId:string;
 tenantId:string; actorId:string; roleId?:string; threadId?:string; taskId?:string;
 class:InferenceClassV2; contextSnapshotId:string; modelPolicyId:string;
 deadlineAt:string; priority:"interactive"|"normal"|"background";
 idempotencyKey:string; maxInputTokens:number; maxOutputTokens:number;
}
interface InferencePolicyV2 {
 class:InferenceClassV2; providerAllowlist:string[]; modelAllowlist:string[];
 fallbackPolicyId:string; firstByteMs:number; totalMs:number;
 maxAttempts:number; maxConcurrentPerTenant:number; maxConcurrentGlobal:number;
 reservedCapacity:number; maxCostUnits:number; policyRevision:string;
}
interface InferenceReceiptV2 {
 schemaVersion:"2.0"; requestId:string; attemptId:string; class:InferenceClassV2;
 tenantId:string; modelSpec:string; provider:string; status:"accepted"|"streaming"|"completed"|"failed"|"cancelled"|"timed_out"|"rejected";
 firstByteAt?:string; finishedAt?:string; outputDigest?:string;
 inputTokens?:number; outputTokens?:number; costUnits?:number;
 failureCode?:string; sourceEventIds:string[];
}
interface DelegationReceiptV2 {
 schemaVersion:"2.0"; delegationId:string; tenantId:string; actorId:string;
 threadId:string; sourceTurnId:string; taskId:string; idempotencyKey:string;
 status:"accepted"|"rejected"|"queued"; eventId:string; createdAt:string;
}
```
**Invariante:** Fast nunca usa modelo/pool Slow por fallback. Slow no entra al stream Fast como una llamada oculta. Un fallback Fast puede usar **otro Fast aprobado**; un fallback Slow puede usar **otro Slow aprobado**. Si no hay capacidad, respuesta degradada explícita o tarea durable con receipt real; nunca prometer trabajo no encolado.

## 5. Latencia y medición
**TTFT end-to-end:** desde recepción autenticada hasta primer token útil entregado al cliente, no hasta inicio del provider. Instrumentar `auth`, `context_fetch`, `policy`, `queue_wait`, `provider_connect`, `first_token`, `stream_flush`, `presenter`. Registrar p50/p95/p99, errores, timeouts, cancel, retries, tokens/cost, saturation y backpressure por tenant/rol/provider/clase. Los 8s/45s actuales son configuración, **no SLO medido**.

**Presupuesto crítico:** ContextServing C10 tiene deadline y cache policy-safe; herramientas lentas/Drive/Google/RAG no deben bloquear respuesta de acuse si hay delegación real. El Fast puede enviar estado verídico `received/queued/working` con receipt; C12 diseña UX sin simular fases inexistentes. No emitir progreso falso ni tiempos arbitrarios.

## 6. Cancelación, retries y fallos
- **Cancel Fast:** abort del stream y provider, liberar bulkhead/reserva; no cancelar automáticamente Slow durable ya aceptado salvo instrucción explícita del usuario y política de tarea.
- **Cancel Slow:** comando autorizado sobre taskId, lease fencing, worker abort, estado terminal/event; no perder auditoría de resultados parciales.
- **Client disconnect:** detener stream Fast; tareas Slow previamente encoladas sobreviven.
- **Retry Fast:** antes del primer evento visible; después, no reiniciar silenciosamente un stream parcial. Reintentos del usuario crean nuevo requestId o reutilizan idempotencyKey según contrato.
- **Retry Slow:** worker at-least-once con idempotencia de efectos y reconciliación C02/C07, no ejecutar tools de negocio dos veces.
- **Timeout:** first byte, total attempt, request deadline y task deadline con jerarquía; el más estricto prevalece.
- **Backpressure:** colas por clase y tenant, fair scheduling, límites duros, `retryAfter` y prioridad interactiva. Evitar starvation de Slow.
- **Costos:** reserva y conciliación atómicas por tenant/model class; reconciliar usage tras fallos; no eludir guardrails.
- **Provider outage:** circuit separado por clase, proveedor compartido con límites externos; no fallback cruzado implícito.
- **Observabilidad:** trace correlationId une turno, delegación, task, Slow run, candidate, card y snapshot.

## 7. Patchsets PS11.0–PS11.17 — rutas propuestas
**PS11.0 — Baseline:** auditar `conversation.ts`, `model.ts`, `model-chain.ts`, worker, task routing, AG-UI, tenant config, auth y UI. Reporte `C11/evidence/FAST-SLOW-CALLGRAPH.md`.
**PS11.1 — Domain:** `packages/domain/src/inference-request-v2.ts`, `inference-policy-v2.ts`, `inference-receipt-v2.ts`, `delegation-receipt-v2.ts`; strict Zod.
**PS11.2 — Provider port:** `apps/server/src/engine/inference/provider-port.ts`; normalización de modelos, event adapter.
**PS11.3 — Fast port:** `engine/inference/fast-inference.ts`; fast-only model allowlist y fallback.
**PS11.4 — Slow port:** `engine/inference/slow-inference.ts`; slow-only model allowlist, C07 scheduler.
**PS11.5 — Policy resolver:** `engine/inference/model-policy-resolver.ts`; tenant/role/provider/region/cost/version; deny-by-default.
**PS11.6 — Admission:** `engine/inference/admission-control.ts`; quota reservation, fair queue, per-class deadlines.
**PS11.7 — Bulkheads:** `engine/inference/capacity-pools.ts`; separación Fast/Slow, hard limits, distributed coordination si múltiples instancias.
**PS11.8 — Circuit/fallback:** `engine/inference/fallback-policy.ts`; separate profile circuit keys; no Fast→Slow.
**PS11.9 — Streaming:** `engine/inference/fast-stream-adapter.ts`; AG-UI compat, first token, abort, partial-stream errors.
**PS11.10 — Slow worker:** `engine/inference/slow-worker-adapter.ts`; task lease, cancellation, C02/C07 receipts.
**PS11.11 — Delegation:** `engine/inference/delegation-gateway.ts`; proposal→policy→durable task receipt, idempotency.
**PS11.12 — Context:** `engine/inference/context-serving-adapter.ts`; C10 snapshot, deadline, cache and policy.
**PS11.13 — Usage:** `engine/inference/usage-ledger.ts`; token/cost reservation, reconciliation.
**PS11.14 — Telemetry:** `engine/inference/metrics.ts`; TTFT stage spans, saturation, provider and tenant.
**PS11.15 — Conversation migration:** refactor `engine/conversation.ts` to gateway+fast port, keep AG-UI/tools/auth; no all-at-once rewrite.
**PS11.16 — Task migration:** refactor `engine/model.ts` and `service.ts` to Slow port; preserve SOP approvals and worker semantics.
**PS11.17 — Tests/shadow:** compatibility, perf, load, cancellation, failure injection, rollback, Codex independent review.

**REUTILIZAR:** AG-UI, existing auth/tenant config, circuit/bulkhead concepts, guardrails, task worker, model provider adapters, FastAuthor/SlowAuthor as migration bridges. **SUSTITUIR:** cross-profile fallback, prompt-only delegation, shared admission, synchronous coupling and ad hoc quota scans. **LEGACY TEMPORAL:** original ConversationAgent/model-chain/model task code behind flags; remove only after acceptance.

## 8. Waves W0–W11 con gates
**W0 Baseline/SHAs:** freeze main SHA, audit complete callgraph/worker/routes/config/AG-UI; run tests baseline. Gate: evidence and ownership map.
**W1 Contratos:** schemas, receipts, class policies, tenant/actor; strict validation and security. Gate: no cross-class fallback.
**W2 Provider adapters:** port and model chain wrappers, preserve existing providers. Gate: fallback tests.
**W3 Admission/quotas:** reservations, bulkheads, circuit, fair scheduling, provider rate limit. Gate: hard capacity and tenant isolation.
**W4 Fast runtime:** bounded ContextServing, Fast-only fallback, streaming AG-UI. Gate: no Slow invocation on Fast path.
**W5 Delegation:** durable task receipt, dedupe and user-visible acknowledgement. Gate: no phantom tasks.
**W6 Slow runtime:** worker/lease/fence, provider chain, cancellation, C07 output/capture. Gate: retries do not duplicate effects.
**W7 Telemetry:** TTFT stage breakdown, cost, error budgets, tracing. Gate: reproducible measurements.
**W8 Fault injection:** provider outages, partial stream, task cancellation, client disconnect, overload. Gate: no lost receipts.
**W9 Shadow:** compare legacy vs V2 routing with no duplicate tools/tasks. Gate: safety/latency/cost report.
**W10 Canary:** tenant-limited **only after founder approval**, rollback flags. Gate: p95 and task completion no regressions.
**W11 Certification:** pnpm typecheck/test/gate, load test, Codex independent tests, ADR, handoff C12. Gate: signed GO/NO-GO.

## 9. Adversarial tests
| Test | Invariante |
|---|---|
| `inference-fast-fallback.test.ts` | Fast never routes to Slow, even on provider outage |
| `inference-role-override.test.ts` | role model cannot violate fast latency class |
| `inference-bulkhead-hard-limit.test.ts` | no overflow without fallback; no shared starvation |
| `inference-circuit-isolation.test.ts` | Slow failures do not open Fast circuit |
| `inference-tenant-fairness.test.ts` | noisy tenant cannot monopolize pool |
| `inference-usage-reservation.test.ts` | concurrent quota checks do not overspend |
| `inference-first-byte-timeout.test.ts` | no fallback after visible output |
| `inference-total-deadline.test.ts` | global deadline across attempts |
| `inference-stream-cancel.test.ts` | abort releases provider resources and lease |
| `inference-slow-disconnect.test.ts` | browser disconnect does not lose accepted Slow task |
| `inference-delegation-receipt.test.ts` | no task acknowledgement without durable receipt |
| `inference-task-idempotency.test.ts` | redelivery does not duplicate tools or card |
| `inference-context-policy.test.ts` | C10 refs never cross tenant/actor |
| `inference-fast-ttft-load.test.ts` | Fast p95 under simultaneous Slow load measured |
| `inference-provider-shared-limit.test.ts` | provider shared rate limit handled fairly |
| `inference-agui-compat.test.ts` | AG-UI event order/streaming unchanged |
| `inference-shadow-rollback.test.ts` | flags off preserve V1, no duplicate effects |

## 10. Riesgos P0
**P0-01** Fast→Slow fallback silencioso; **P0-02** bulkhead per process not distributed; **P0-03** no hard admission when full/no fallback; **P0-04** provider circuit shared; **P0-05** quota race; **P0-06** phantom delegation due to prompt instruction; **P0-07** Fast TTFT blocked by context/DB; **P0-08** stream restarted after visible output; **P0-09** task cancellation confusion; **P0-10** duplicate business effects on retry; **P0-11** no global deadline; **P0-12** tenant data leak via context; **P0-13** secrets exposed in model config; **P0-14** breaking AG-UI protocol; **P0-15** removing legacy before readiness; **P0-16** unbounded cost due to retries.

## 11. Migration, rollback y reporting
**M0:** baseline and inventory. **M1:** contracts/adapters no production routing. **M2:** shadow telemetry, no duplicate inference/tools. **M3:** Fast-only route tenant canary with approval. **M4:** Slow independent worker cutover after C02/C07 gates. **M5:** retire legacy fallback and obsolete code after E2E and owner approval.

**Flags propuestos (NO existentes):** `inferenceV2.shadow`, `inferenceV2.fastRead`, `inferenceV2.slowWorker`, `inferenceV2.strictProfile`. Rollback disable V2 routing and restore V1 **only if security and quota policy permit**; do not restore unsafe cross-profile fallback without explicit policy decision. Preserve receipts, events, tasks, and audit. No deploy/merge without founder approval.

Each wave writes `REPORT-Wx.md` with source commit, actual files/diffs, command exit codes, TTFT p50/p95/p99, load/fault traces, token/cost ledger, failure classification, Codex review, GO/NO-GO, rollback and unresolved blockers. Artifacts: `FAST-SLOW-CALLGRAPH.md`, `MODEL-POLICY-MATRIX.md`, `STREAM-PROTOCOL-COMPAT.md`, `CAPACITY-TEST-RESULTS.md`, `HANDOFF-C12.md`.

```yaml
campaign: C11
turn: 12/16
repo: uniscrolliabrain-cloud/agente
branch: audit/preflight-cognition-option3-20261115
source_ref: main
source_commit_sha: NOT_VERIFIED
status: STATIC_AUDIT_AND_PLAN
findings: 27
patchsets: 18
waves: 12
runtime_modified: false
tests_executed: false
merge: false
deploy: false
next: C12_presenter_ux_svg_progress
```
