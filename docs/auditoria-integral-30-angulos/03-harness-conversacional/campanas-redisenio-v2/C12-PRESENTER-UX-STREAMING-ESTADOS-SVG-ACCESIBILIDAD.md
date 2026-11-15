# C12 — Presenter V2, experiencia conversacional, progreso verificable y animaciones SVG

**Turno 13/16 · 2026-11-15 · Repo:** `uniscrolliabrain-cloud/agente` · **Rama:** `audit/preflight-cognition-option3-20261115`.
**Estado:** auditoría estática + handoff detallado; NO runtime, NO pruebas ejecutadas, NO merge/deploy.
**Dependencias:** C02 eventos durables, C03 grafo, C06 atención, C09 ledger, C10 ContextServing, C11 Fast/Slow. **Siguientes:** C13 Anam, C14 ciberseguridad, C15 E2E.

## 0. Contrato de producto
LAIA y los agentes hablan con naturalidad y rapidez. El usuario ve la **respuesta Fast en streaming**, puede seguir el estado **real** de tareas Slow, revisar pruebas/acciones y entender las fases del trabajo sin exponer secretos ni razonamiento privado. El estado visible procede de eventos autorizados y recibos; el LLM puede redactar su descripción, pero **no inventar transiciones**. Una animación SVG de puntos/espiral acompaña la espera, no finge progreso. No usar duraciones inventadas (p. ej., dos segundos por fase) ni porcentajes sin medición.

**Opción 3:** el Presenter V1 de scoring de Thoughts y la mezcla de render/estado en `conversation.ts` pasan a **legacy temporal**. Presenter V2 es un **proyector de eventos y políticas** + **compositor de mensajes**, no una capa de maquillaje que oculta fallos. La UX no revela chain-of-thought ni prompts internos; sí evidencia, operaciones verificadas, resultados y estados honestos.

## 1. Evidencia auditada de main (SHA blob)
| Archivo | SHA blob | Observación |
|---|---|---|
| `apps/server/src/kernel/observers/presenter.ts` | `280d31f472f1ac22aed427ea287f6715c0c7d246` | 183 líneas; prioridad ThoughtRole, score 0.5 rol + 0.3 attention.confidence + 0.2 atención matched; presentTurn relee thoughts y consulta metadata mediante cast a deps privados |
| `apps/server/src/kernel/observers/presenter-sse.ts` | `b223f889ec5d4b36c10b45060cc062bded9ab556` | 40 líneas; convierte Presentation a texto; en error vuelve al fallback silencioso |
| `apps/server/src/kernel/graph/progress.ts` | `71e8f2b3fbbb240b366630eca37ede33fc645aca` | 78 líneas; Zod progress/partial/ready/failed, step/totalSteps, helpers |
| `apps/server/src/kernel/authors/slow-author.ts` | `13f68919a3fddbe323613fc3e419153c0cdefcfa` | 160 líneas; progress start/ready en attention.metadata del Thought, no bus de progreso garantizado |
| `apps/server/src/engine/conversation.ts` | `63b5ea67765180a4822b7debde3fd60489cb8000` | 1469 líneas; AG-UI, RUN_STARTED, TEXT_MESSAGE_*, RUN_ERROR, presenter post-stream; prompt V1 ordena no explicar trabajo |
| `apps/web/src/components/ChatPanel.tsx` | `f5006731f5c0306d9867dd5760d3abc22b10de48` | 124 líneas; recibe `streaming`, `streamBuf`, delega componentes de visualización |
| `apps/server/src/kernel/authors/fast-author.ts` | `237ab1c0c5174aa3d55259b4662d0886153a5946` | 103 líneas; Fast output persistido en Thought tras respuesta |
| `apps/server/src/engine/model-chain.ts` | `602b7ba758e95be25ac73cc3d78b7342fadae099` | 291 líneas; fallback/cancel/timeout y eventos visibles; C11 |
**No encontrados en las rutas ensayadas:** `apps/server/src/engine/presenter.ts`, `apps/server/src/kernel/presenter.ts`, `apps/web/src/components/chat/ChatMessages.tsx`, `apps/web/src/components/ChatMessages.tsx`. **No implica inexistencia de componentes equivalentes**. W0 exige inventario real del árbol web, hooks AG-UI, estilos, chat bubbles, loading indicators y avatar.

## 2. Hallazgos C12-F01–F25
1. `Presenter.score` trata confidence del Thought como señal de selección; no demuestra verificación ni corrección.
2. Prioridad `response` alta puede ocultar una corrección/confirmación posterior relevante.
3. `presentTurn` llama `thoughtsOf` y después `present`, que vuelve a llamar `thoughtsOf`; doble lectura.
4. Acceso a `kernel.deps.store` mediante cast a `unknown` rompe encapsulación del kernel.
5. `presenter-sse.ts` retorna texto plano; no existe contrato estructurado de UI state en ese helper.
6. Su `catch` convierte cualquier fallo en fallback sin error clasificado para observabilidad.
7. En `conversation.ts` el streaming Fast ya emite texto antes de la selección Presenter post-stream; el Presenter no controla coherentemente la respuesta ya mostrada.
8. La respuesta Fast puede persistirse con texto Presenter distinto del contenido enviado al usuario; riesgo de divergencia auditada.
9. `progress.ts` distingue progress/partial/ready/failed; es base reutilizable, pero sin receipt durable no acredita finalización.
10. `SlowAuthor` persiste progress en `attention.metadata`; es una representación indirecta, no canal de progreso autónomo.
11. `progressStep(0,1,...)` no es porcentaje real; no mostrar 0% o 50% deducidos.
12. La anotación legacy que propone “disimular bien” no debe convertirse en comportamiento engañoso.
13. El prompt Fast prohíbe «decir lo que vas a hacer»; entra en conflicto con UX de estados pedagógicos y acciones confirmadas.
14. `ChatPanel.tsx` tiene `streaming` y `streamBuf`; hay soporte UI básico, no evidencia de estado cognitivo V2.
15. Los componentes web concretos del cuerpo de mensajes no fueron localizados en esta pasada; inventariar antes de patchsets.
16. AG-UI contiene RUN_STARTED/TEXT_MESSAGE/TOOL_CALL/RUN_ERROR; extender con compatibilidad, no sustituir protocolo arbitrariamente.
17. Una tool puede comenzar sin terminar; fase “completada” requiere receipt de resultado.
18. Un Slow durable puede continuar después del cierre del navegador; UI debe rehidratar estado desde event projection.
19. Reconexión sin cursor puede repetir mensajes/estados; C02 aporta cursor durable pendiente.
20. Fases estáticas de cinco pasos con intervalos fijos no reflejan trabajo real.
21. Una animación decorativa puede ser continua aunque el estado semántico sea “esperando”; separar ambos.
22. Estado visible debe filtrarse por tenant, actor, thread y task; no mostrar metadatos de otro usuario.
23. Fallo de Presenter no debe ocultar un fallo de tarea; se conserva evento de error y fallback visual.
24. UX accesible necesita reduced motion, aria-live, teclado, contraste y gestión de foco; no se verificó cobertura existente.
25. Presenter V2 debe mostrar progreso verificable sin revelar chain-of-thought, secretos ni contenido de memoria privada.

## 3. Arquitectura objetivo
```text
C02 EventBus + C09 Delivery receipts + C11 Fast/Slow events
   → PresenterProjectionV2 (tenant/actor/task/thread auth)
       → phase reducer deterministic
       → evidence/provenance + status classification
       → privacy/visibility policy
       → PresentationModelV2 (text, status, receipts, actions, refs)
           → AG-UI adapter (compat)
           → Web chat state store (reconnect/replay)
           → UI components: bubble, phase timeline, spinner SVG, task receipt
           → C13 avatar/voice (same authoritative presentation model)
```
**Regla fundamental:** el reducer de fases solo interpreta eventos autorizados. LLM puede proponer copy natural basado en un estado autorizado, sin alterar `phase`, `status`, `completedAt`, `receiptId` ni inventar evidencia.

## 4. Contratos propuestos (no existen)
```ts
type UiPhaseV2 =
 "received"|"context_preparing"|"model_waiting"|"responding"|
 "delegation_queued"|"task_running"|"awaiting_approval"|
 "result_ready"|"completed"|"failed"|"cancelled"|"degraded";
interface UiPhaseEventV2 {
 schemaVersion:"2.0"; eventId:string; tenantId:string; actorId:string;
 threadId:string; turnId?:string; taskId?:string; correlationId:string;
 phase:UiPhaseV2; occurredAt:string; sourceEventId:string;
 sourceType:string; receiptId?:string; sequence:number;
 visibilityPolicyId:string; policyRevision:string;
}
interface PresentationModelV2 {
 schemaVersion:"2.0"; presentationId:string; tenantId:string;
 actorId:string; threadId:string; turnId?:string; taskId?:string;
 status:UiPhaseV2; textSegments:Array<{id:string;text:string;kind:"assistant"|"tool_summary"|"notice";sourceEventIds:string[]}>;
 phases:UiPhaseEventV2[]; actions:Array<{kind:"open_task"|"review_approval"|"view_sources";targetId:string}>;
 evidenceRefs:string[]; lastEventCursor?:string; degradedReason?:string;
 policyRevision:string; digest:string;
}
interface UiStreamEnvelopeV2 {
 schemaVersion:"2.0"; streamId:string; tenantId:string; actorId:string;
 threadId:string; cursor:string; eventId:string; sequence:number;
 kind:"phase"|"text_delta"|"tool_receipt"|"task_update"|"error"|"complete";
 payload:unknown;
}
```
**Semántica:** `model_waiting` no significa “razonando internamente” sino “esperando respuesta del proveedor”; `context_preparing` solo si ContextServing realmente está activo; `task_running` exige lease/estado de worker; `result_ready` exige evento de resultado persistido; `completed` exige finalización del flujo correspondiente. `awaiting_approval` nunca se transforma en “ejecutado” sin aprobación+receipt.

## 5. Diseño de fases verídicas y copy
| Fuente comprobable | Estado UX | Texto sugerido | Condición de salida |
|---|---|---|---|
| Solicitud autenticada aceptada | received | «He recibido tu mensaje» | request receipt |
| C10 inicia recuperación | context_preparing | «Preparando el contexto» | snapshot/degraded |
| Fast provider request enviado | model_waiting | «Preparando la respuesta» | primer token/error |
| Primer token visible | responding | Texto Fast streaming | RUN_FINISHED/error |
| C11 delegación durable confirmada | delegation_queued | «Trabajo añadido a la cola» | task leased |
| Worker con lease válido | task_running | «Trabajo en curso» | task update |
| Acción requiere revisión | awaiting_approval | «Pendiente de tu aprobación» | approval decision |
| C07/C09 resultado persistido | result_ready | «Resultado disponible» | delivery/presentation |
| Finalización con receipt | completed | «Terminado» | terminal |
| Error real | failed/degraded | «No se ha podido completar» | retry/resolution |
**No hacer:** avanzar por cronómetro, simular consultas que no ocurrieron, mostrar porcentajes inventados, exponer “pensamientos” privados, decir “enviado” cuando solo se preparó borrador.

## 6. Animación SVG y diseño visual
**Concepto:** indicador compacto, luminoso, de puntos en espiral cerrada con tamaños graduales y opacidad pulsante, fondo blanco/transparente según tema; coherente con interfaces de IA modernas. La animación representa **actividad de interfaz**, no progreso cuantitativo ni inferencia interna. El usuario había preferido espiral más cerrada y puntos claros; usarlo como requisito visual, sin convertirlo en evidencia de una fase. **No se crea imagen ni GIF en esta campaña documental**: el componente propuesto es SVG/CSS editable dentro de React.

- Componente propuesto `apps/web/src/components/chat/ThinkingSpiral.tsx`: SVG `viewBox` estable, 12–18 círculos con radios/opacidades graduadas; rotación CSS suave, no `setInterval` React.
- CSS propuesto `apps/web/src/components/chat/thinking-spiral.css`: `prefers-reduced-motion: reduce` desactiva movimiento; tokens de tema; tamaños 16/20/24 px; no flicker agresivo.
- `aria-hidden=true` para el SVG; el estado accesible vive en texto con `role=status` y `aria-live=polite`; errores críticos `role=alert` solo cuando corresponde.
- No disparar cambios de texto accesible cada frame; anunciar transiciones semánticas, no frames de animación.
- El spinner se oculta al primer token visible o al estado terminal; puede reaparecer ante espera de tool si existe evento real.
- UX responsiva: móvil, teclado, alto contraste, dark/light; no usar color como único canal.
- La timeline muestra estados pasados y actual; timestamp solo del evento real, no hora fabricada.
- Los mensajes Fast ya enviados no se reemplazan silenciosamente por texto Presenter distinto; correcciones se agregan con evento/corrección explícita.

## 7. Patchsets PS12.0–PS12.16 (rutas nuevas propuestas)
**PS12.0 — Baseline:** `C12/evidence/WEB-CHAT-COMPONENT-TREE.md`, `PRESENTER-CALLGRAPH.md`, `AGUI-EVENT-MAP.md`, `ACCESSIBILITY-BASELINE.md`; localizar UI real.
**PS12.1 — Domain:** `packages/domain/src/presentation-v2.ts`, `ui-phase-event-v2.ts`; strict Zod, provenance, policy.
**PS12.2 — Phase reducer:** `apps/server/src/engine/presentation/phase-reducer.ts`; finite-state, idempotent, ordered.
**PS12.3 — Projection:** `engine/presentation/presenter-projection.ts`; C02 cursor, replay, task/thread/tenant.
**PS12.4 — Policy:** `engine/presentation/visibility.ts`; filter source and fields, redact PII/secrets.
**PS12.5 — Composer:** `engine/presentation/composer.ts`; deterministic status + LLM optional copy, no state mutation.
**PS12.6 — Evidence:** `engine/presentation/evidence-resolver.ts`; refs C10, receipts C09, no fabricated citations.
**PS12.7 — AG-UI adapter:** `engine/presentation/agui-adapter.ts`; preserve RUN_*, TEXT_MESSAGE_*, TOOL_CALL_*; custom events only after client compatibility.
**PS12.8 — Stream replay:** `engine/presentation/stream-cursor.ts`; dedupe sequence, reconnect, bounded buffer.
**PS12.9 — Presenter V1 adapter:** `kernel/observers/presenter-v2-adapter.ts`; reuse valid Thought metadata, remove private deps cast after new Kernel API.
**PS12.10 — Chat state:** locate existing hook/store; add `apps/web/src/features/chat/presentation-state.ts` only if architecture fits.
**PS12.11 — Phase timeline:** `apps/web/src/components/chat/PhaseTimeline.tsx`; real events, no timer-based transitions.
**PS12.12 — Spinner:** `apps/web/src/components/chat/ThinkingSpiral.tsx` + CSS; accessible/reduced motion.
**PS12.13 — Task receipt:** `apps/web/src/components/chat/TaskProgressReceipt.tsx`; queued/running/approval/done, links to task details.
**PS12.14 — Chat integration:** modify **actual** message renderer/hook/ChatPanel after W0 inventory; maintain streaming, scroll, focus, mobile.
**PS12.15 — Telemetry:** `engine/presentation/metrics.ts`; time to visible phase, stream drift, errors, reconnect.
**PS12.16 — Tests/rollout:** unit/e2e/accessibility/security/shadow, Codex review, rollback.

**REUTILIZAR:** AG-UI protocol, progress Zod as legacy adapter, existing ChatPanel, kernel Thought, source receipts. **SUSTITUIR:** Presenter score as final arbiter, duplicated thoughtsOf, cast into kernel deps, ad hoc post-stream text replacement, prompt-only status. **LEGACY TEMPORAL:** `presenter.ts`, `presenter-sse.ts`, old UI loading indicator until canary.

## 8. Waves W0–W10 y gates
**W0 Inventory:** exact HEAD, real web tree/hook/styles, API routes, event stream and auth; baseline screenshots/accessibility and existing tests.
**W1 Contracts:** phase events/presentation schemas, source provenance, policy. Gate: strict validation.
**W2 Reducer:** deterministic transitions, duplicate/out-of-order, terminal states. Gate: no phantom phases.
**W3 Projection:** C02 replay and C09 receipts; rehydrate after reconnect. Gate: no missing/duplicate statuses.
**W4 Policy:** tenant/actor/thread/role, secrets, chain-of-thought. Gate: red-team privacy.
**W5 Presenter:** message selection and correction semantics, Fast streaming consistency. Gate: no text mismatch.
**W6 AG-UI:** adapters, compatibility and client replay. Gate: protocol tests.
**W7 Web:** spiral SVG, timeline, task receipts, mobile, keyboard, reduced motion. Gate: accessibility.
**W8 Failure:** provider timeout, task retry, approval, stale event, cancel, disconnect. Gate: truthful statuses.
**W9 Shadow/canary:** founder approval required, measure TTFT impact, UX, rollback flags. Gate: GO/NO-GO.
**W10 Certification:** pnpm typecheck/test/gate, browser tests, Codex independent audit, handoff C13.

## 9. Tests adversariales propuestos
| Test | Aceptación |
|---|---|
| `presenter-phase-reducer.test.ts` | fases solo por eventos reales |
| `presenter-duplicate-events.test.ts` | idempotencia, orden, terminal |
| `presenter-replay-reconnect.test.ts` | estado rehidratado, no duplicados |
| `presenter-authz.test.ts` | tenant/actor/thread aislamiento |
| `presenter-secret-redaction.test.ts` | no secretos ni pensamiento privado |
| `presenter-stream-consistency.test.ts` | texto mostrado = texto auditado o corrección explícita |
| `presenter-receipt.test.ts` | queued/done solo con receipt |
| `presenter-approval.test.ts` | prepared != approved != executed |
| `presenter-fallback.test.ts` | fallo de Presenter no tapa error real |
| `presenter-correction.test.ts` | corrections visible and attributable |
| `presenter-agui-compat.test.ts` | eventos AG-UI compatibles |
| `presenter-fast-ttft.test.ts` | sin bloqueo del primer token |
| `presenter-a11y.test.tsx` | reduced motion, aria-live, keyboard, contrast |
| `presenter-mobile.test.tsx` | layout sin overflow, responsive |
| `presenter-svg-perf.test.tsx` | no timers React, consumo bajo |
| `presenter-task-cancel.test.ts` | cancelled real, no completed falso |
| `presenter-slow-disconnect.test.ts` | task sigue y estado recuperable |
| `presenter-prompt-injection.test.ts` | datos externos no alteran phase/status |

## 10. Riesgos P0 y rollback
P0: mostrar “completado” antes del receipt; estado de tarea de otro tenant; filtrar Thought reasoning; perder eventos por reconnect; reemplazar respuesta Fast ya emitida; porcentaje inventado; estado no invalidado tras revocación; error oculto por fallback; acceso al Kernel por cast; degradación TTFT; UI que obliga movimiento sin reducción; aprobación confundida con ejecución; duplicar tareas al reconectar.

**Migración:** M0 inventory; M1 schemas+reducer shadow; M2 projection/replay; M3 AG-UI compat; M4 web canary aprobado; M5 retirar Presenter V1 cuando todos los consumidores estén migrados. Flags **propuestos**, no existentes: `presenterV2.shadow`, `presenterV2.stream`, `presenterV2.ui`. Rollback desactiva nuevas vistas y restaura stream V1 sin borrar eventos/receipts. Si V1 revela información sensible, fail-closed.

## 11. Handoff Freebuff / Codex
Cada wave produce `REPORT-Wx.md` con HEAD SHA, inventario de rutas reales, archivos creados/modificados, diff, tests y exit codes, capturas UI, métricas de TTFT y accesibilidad, trazas de evento sin PII, riesgos, Codex independent review, GO/NO-GO y rollback. Entregar `WEB-CHAT-COMPONENT-TREE.md`, `AGUI-EVENT-MAP.md`, `PRESENTER-CALLGRAPH.md`, `UI-STATE-TRACES.jsonl`, `HANDOFF-C13.md`. No declarar PASS si no se ejecutó test.

```yaml
campaign: C12
turn: 13/16
repo: uniscrolliabrain-cloud/agente
branch: audit/preflight-cognition-option3-20261115
source_ref: main
source_commit_sha: NOT_VERIFIED
status: STATIC_AUDIT_AND_PLAN
findings: 25
patchsets: 17
waves: 11
runtime_modified: false
tests_executed: false
merge: false
deploy: false
next: C13_anam_avatar_voice
```
