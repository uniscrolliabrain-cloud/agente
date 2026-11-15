# C09 — CardStore V2, delivery ledger, lease/ACK, replay e invalidación
**Turno 10/16 · 2026-11-15 · Repo:** `uniscrolliabrain-cloud/agente` · **rama:** `audit/preflight-cognition-option3-20261115`.
**Estado:** auditoría estática + handoff de implementación, **sin cambios de runtime, tests ejecutados, merge ni deploy**.
**Precedentes:** C00–C08, especialmente C02 durable EventBus, C03 graph, C04 memory, C06 attention, C07 candidate extraction, C08 JEV signals. **Siguiente:** C10 ContextServing.

## 1. Decisión sustitutiva opción 3
Separar **estado de conocimiento** (tarjeta, revisiones, evidencia, visibilidad, revocación) de **estado de entrega** (qué snapshot se preparó, para qué destinatario/turno, lease, ACK, reintentos, expiración). `consumed` V1 mezcla ambas dimensiones. CardStore V2 es una **proyección durable** del conocimiento; el ledger es una **proyección durable de entrega**. El EventBus C02 aporta eventos y replay, no un segundo sistema de autoridad. El Fast recibe referencias/snapshots de C10, no elige tarjetas desde una tabla global.

## 2. Evidencia real de main (SHA blob, no commit)
| Archivo | SHA blob | Hallazgo |
|---|---|---|
| `apps/server/src/kernel/cognition/card-store.ts` | `cbb1259b202ffb25a79511bdb927fa5c0199c41f` | 228 líneas, store por owner, tenant filter, pending/ranking, save, CAS opcional, markConsumed/release/markUseful |
| `apps/server/src/engine/context/cognition-cards.ts` | `3c6df6d14fcd0cd7b4617c99304d6a2b600a49fe` | 110 líneas, 3 tarjetas, 700 chars, 700 tokens estimados, consumed antes de render |
| `packages/domain/src/cognition-card.ts` | `4817c9688f37508922a3237a184ad309a9352160` | V1 strict Zod, six kinds, statuses proposed/consumed/expired/superseded, thread/tenant, confidence, evidence Thought |
| `apps/server/src/cognition-routes.ts` | `30100658e9ab6836890761a48f3e9640b8313ced` | GET owner/tenant, POST useful, no ledger/ACK/retract API |
| `tests/cognition-cards.test.ts` | `0458a4e8d1742977b75e4e440741291a9a7f64d3` | 374 líneas, in-memory CAS store, isolation, retry same card ID, consumed/release y budget |
| `apps/server/src/kernel/cognition/card-builder.ts` | `2c2a9c915eb84535ee895d9880399f8f7fb41e90` | dedupe card por key, TTL legacy, clasificación regex |
| `apps/server/src/engine/events/types.ts` | `1e00fb0381281aa57999a98ee48b47fd453e3f71` | catálogo cerrado; eventos nuevos requieren schema |
**Auditoría pendiente:** implementación real de `db.compareAndSwap`, `insertIfAbsent`, indexes y transacciones en adapters Postgres/KV; wiring de `assembleCognitionCards` en streaming Fast; consumidores HTTP y migraciones. Revalidar HEAD antes de editar. Tests NO ejecutados.

## 3. Hallazgos C09-F01–F22
1. `CognitionCard` V1 usa `consumed` como status del objeto, no como evento por destinatario.
2. `assembleCognitionCards` llama `markConsumed` antes de devolver/renderizar bloque; sin ACK downstream.
3. `release` solo revierte consumed a proposed; no tiene lease token, expiración ni fence.
4. Una caída tras consumed y antes de respuesta puede perder entrega lógica.
5. Reintentos paralelos dependen de CAS opcional; fallback read+put no es atómico.
6. `save` con `insertIfAbsent` evita duplicado de card ID; fallback `put` puede sobrescribir.
7. `save` no garantiza emisión de evento en la misma transacción; outbox C02 pendiente.
8. `pending` filtra `proposed` y TTL, por lo que conocimiento útil deja de ser recuperable como contexto cuando se consume.
9. `markUseful` promueve scope a tenant pero sigue bajo namespace `owner`: no es compartición real cross-owner.
10. Scope `tenant` no sustituye permisos por actor/rol/propósito.
11. Ranking `confidence*0.45` trata confidence no calibrada como factor dominante.
12. `recency*0.25` favorece lo reciente, no necesariamente lo verificado.
13. Bonus de scope tenant 0.05 puede amplificar información no autorizada si el filtro falla.
14. `list` filtra tenant después de recuperar por owner; revisar coste y paginación.
15. `pending` toma un límite fijo 20 antes de rankear; tarjetas pertinentes fuera de la primera ventana pueden omitirse.
16. El ranking por score carece de desempate estable explícito.
17. `selectCognitionCards` calcula tokens con `length/4`; estimación no es tokenización real.
18. El selector usa `break` cuando una tarjeta excede budget, potencialmente omitiendo otras más pequeñas que sí caben.
19. La representación incluye `confidence` sin estado epistemológico; riesgo de falsa certeza en Fast.
20. `safeText` elimina caracteres de control y marca datos/no instrucciones; no es una defensa completa contra prompt injection.
21. Tests V1 cubren consumo único, reintento y aislamiento en memoria; no demuestran restart/lease/fence/ACK durables.
22. `cognition-routes` no expone revocación, versionado, entrega ni ACK; el nuevo API debe mantener compatibilidad temporal.

## 4. Contratos propuestos (no existentes)
```ts
type CardLifecycleV2 = "candidate"|"active"|"superseded"|"retracted"|"expired"|"quarantined";
type DeliveryStateV2 = "planned"|"leased"|"rendered"|"acknowledged"|"released"|"expired"|"failed";
interface CognitionCardV2 {
 schemaVersion:"2.0"; cardId:string; revision:number; tenantId:string; owner:string;
 subjectRefs:string[]; threadId?:string; sourceEventIds:string[];
 sourceCandidateId:string; evidenceRefs:string[]; graphRefs:string[];
 kind:string; title:string; contentRef:string; contentDigest:string;
 epistemicStatus:"hypothesis"|"reported"|"verified"|"contradicted"|"retracted";
 lifecycle:CardLifecycleV2; visibilityPolicyId:string; policyRevision:string;
 createdAt:string; updatedAt:string; expiresAt?:string;
}
interface CardDeliveryV2 {
 schemaVersion:"2.0"; deliveryId:string; tenantId:string; actorId:string;
 consumer:"fast"|"presenter"|"worker"; threadId?:string; turnId?:string;
 cardId:string; cardRevision:number; contextSnapshotId:string;
 state:DeliveryStateV2; attempt:number; leaseToken?:string; fencingVersion:number;
 leaseExpiresAt?:string; preparedAt:string; renderedAt?:string; acknowledgedAt?:string;
 idempotencyKey:string; policyRevision:string; failureCode?:string;
}
interface DeliveryAckV2 {
 deliveryId:string; tenantId:string; actorId:string; consumer:string;
 contextSnapshotId:string; turnId?:string; receiptId:string; acknowledgedAt:string;
}
```
**Semántica de ACK:** distinguir `rendered` (bloque integrado en prompt) de `acknowledged` (el consumidor confirma que procesó el snapshot según contrato). ACK no significa que el usuario leyó, que el LLM usó el dato ni que el dato sea verdadero. No prometer exactamente una vez física: **at-least-once + idempotencia de efectos**. Si un cliente falla antes de ACK, se puede reentregar la misma revisión con clave estable.

## 5. Modelo de persistencia y garantías
- **CardStore:** `tenantId+cardId+revision` único, append-only revision/provenance, tombstones, CAS real para transiciones, query por actor+policy, retención diferenciada de delivery.
- **Ledger:** `tenantId+consumer+actorId+turnId+snapshotId+cardId+revision` como clave semántica; lease atómico con token y fencing; TTL/heartbeat; ACK idempotente y rechazo de ACK obsoleto.
- **Outbox/inbox C02:** creación/actualización de tarjeta, planning, ACK, release, retract se registran como eventos tipados y proyecciones idempotentes. Nunca `save card` y `emit` separados sin reconciliación.
- **Aislamiento:** índices siempre tenant-first; owner no es frontera de tenant, ni `scope=tenant` concede acceso. Resolver PDP y clasificación de campos antes de leer contentRef.
- **Revisión:** retractación/invalidez de evidencia incrementa revision y cancela leases activos; ACK sobre revisión revocada se rechaza o marca stale.
- **Replay:** recomponer card projections y ledger sin volver a consultar LLM/JEV; resultados no deterministas se guardan como señales versionadas.
- **Idempotencia:** lease/fence por operación, no asumir que compareAndSwap opcional protege concurrencia.
- **Ciclo:** tarjeta `active` puede entregarse a múltiples turnos/actores autorizados; el ledger registra cada uno sin consumir el conocimiento.

## 6. Wiring transversal
```text
C07 Slow Candidate + C08 SemanticSignal → verifier/policy
 → C02 events → CardProjectorV2 → CardStoreV2 (revisioned)
 → C06 AttentionSnapshot → C10 ContextServing snapshot/delta/refs
 → DeliveryPlanner → atomic lease → render receipt
 → Fast/Presenter consumer → ACK → durable ledger
                     ↘ timeout/crash → lease expiry/retry
source retracted → tombstone → invalidate Card + Snapshot + active deliveries
```
La lectura Fast no debe depender de JEV síncrono. El planificador no debe reservar tarjetas que no caben en el snapshot final. El `DeliveryPlanner` se ejecuta después de selección de contexto, no antes. C10 define semántica final de snapshot; C09 implementa recibos y ledger.

## 7. Patchsets PS09.0–PS09.14
**PS09.0 Inventario:** `C09/evidence/CALLGRAPH.md`, `DB-CAS-SEMANTICS.md`, `STREAM-ACK-BOUNDARY.md`; confirmar rutas reales, adapters y tests.
**PS09.1 Domain:** `packages/domain/src/cognition-card-v2.ts` (alinear C01, NO duplicar schema), `card-delivery-v2.ts`, `card-delivery-ack-v2.ts`.
**PS09.2 Migration adapter:** `apps/server/src/engine/cognition/cards/legacy-card-adapter.ts`, mapping de estados sin convertir consumed en lifecycle.
**PS09.3 Store:** `engine/cognition/cards/card-store-v2.ts`; tenant-first, revision, CAS, tombstone, retention.
**PS09.4 Projector:** `engine/cognition/cards/card-projector-v2.ts`; sourceEventId/version, inbox/outbox C02.
**PS09.5 Ledger store:** `engine/cognition/cards/delivery-ledger.ts`; lease, fence, ACK, release, expiry.
**PS09.6 Planner:** `engine/cognition/cards/delivery-planner.ts`; no reservar antes de selección C10.
**PS09.7 Policy:** `engine/cognition/cards/card-visibility.ts`; PDP, field filter, owner/tenant/actor, purpose.
**PS09.8 Ranking:** `engine/cognition/cards/card-ranker.ts`; C06 score, evidence, novelty, deterministic ties, budget.
**PS09.9 Invalidator:** `engine/cognition/cards/card-invalidator.ts`; revision/retract/revoke, invalidate snapshot/leases.
**PS09.10 Context bridge:** `engine/cognition/cards/context-bridge.ts`; snapshot/delta/refs C10, render receipts.
**PS09.11 API:** modificar `apps/server/src/cognition-routes.ts` solo tras authz audit; endpoints V2 list/inspect/retract y ACK interno autenticado, sin permitir ACK arbitrario del cliente.
**PS09.12 Events:** ampliar `engine/events/{types,schemas}.ts` y registry con tipos estrictos para card lifecycle/delivery; migración versionada.
**PS09.13 Shadow:** dual-read compare sin doble entrega; flags tenant propuestos `cardStoreV2.shadow/read`.
**PS09.14 Tests/observability:** tests de DB real, concurrency, restart, isolation, latency, perf, security y rollback.

**Clasificación:** reutilizar validación Zod V1 y tests como fixtures; sustituir status consumed/heurística como diseño final; legacy temporal `CognitionCardStore`, `assembleCognitionCards`, endpoints V1 hasta cutover. Paths propuestos, verificar antes de escribir.

## 8. Waves W0–W9 con gates
**W0 Baseline:** HEAD SHA, DB adapters CAS, índices, streaming, events, rutas y pruebas; gate: contratos de almacenamiento reales.
**W1 Contratos/migración:** schema V2, map V1, estados, tenant/actor; gate: sin pérdida de provenance.
**W2 Store:** revisión, CAS y tombstone; gate: tests en Postgres/KV real, no solo mocks.
**W3 Ledger:** leases, fences, ACK, expiry, concurrency; gate: crash recovery y no doble efecto.
**W4 Proyecciones:** eventos C02, outbox, replay, C07/C08; gate: card/event convergen.
**W5 Policy:** actor/tenant/owner/field/retention; gate: red team cross-tenant.
**W6 Context:** C06/C10 budgets, snapshots, delivery receipts, sin consumir antes de ACK; gate: Fast TTFT.
**W7 Shadow:** comparación V1/V2, no side effects ni doble entrega; gate: métricas y rollback.
**W8 Fallos:** restart, delayed ACK, stale revision, revoke, concurrency, provider errors; gate: invariantes.
**W9 Certificación:** pnpm typecheck/test/gate, Codex tests independientes, reporte y aprobación founder.

## 9. Tests adversariales propuestos
| Test | Garantía |
|---|---|
| `card-store-v2-revision.test.ts` | revisión, tombstone, CAS real, no lost update |
| `card-delivery-ledger.test.ts` | lease/fence/ACK idempotente, timeout/retry |
| `card-delivery-restart.test.ts` | reinicio entre plan/render/ACK, recuperación |
| `card-delivery-stale-ack.test.ts` | ACK tardío no revive tarjeta retractada |
| `card-store-tenant-isolation.test.ts` | cross-tenant/owner/role/field denied |
| `card-store-policy-revocation.test.ts` | downgrade invalida lectura y leases |
| `card-projector-replay.test.ts` | replays deterministas, sin reconsultar Jev |
| `card-store-legacy-migration.test.ts` | V1 consumed ≠ V2 conocimiento agotado |
| `card-ranker-determinism.test.ts` | stable ties, evidencia y budgets |
| `card-context-selection.test.ts` | tarjeta grande no bloquea pequeñas útiles |
| `card-context-injection.test.ts` | texto malicioso tratado como datos |
| `card-ack-authentication.test.ts` | actor no puede confirmar delivery ajeno |
| `card-delivery-fault-injection.test.ts` | DB crash, network retry, duplicate event |
| `card-store-performance.test.ts` | p95, 10k cards, índices y paginación |
| `card-store-shadow.test.ts` | flags off equivalencia V1 |

## 10. Riesgos P0, rollback y handoff
P0: consumed antes de ACK; CAS opcional; falsa compartición cross-owner; ranking basado en confidence; TTL de entrega confundido con retención; ACK falsificado; race entre retractación y render; replay que revive revocados; doble publicación shadow; token estimation; prompts maliciosos; PII; pérdida de outbox.

Rollback: desactivar `cardStoreV2.read/shadow` (flags **propuestos**, no existentes), detener delivery planner, conservar ledger y snapshots auditables, reactivar V1 temporalmente, reconciliar eventos sin borrar evidencia. **No merge ni deploy sin autorización.**

Cada ola deja `REPORT-Wx.md` con SHA base, archivos/diffs, comandos y exit codes, DB semantics, metrics, fault injection, Codex review, GO/NO-GO y rollback. Adjuntar `CALLGRAPH.md`, `DB-CAS-SEMANTICS.md`, `STREAM-ACK-BOUNDARY.md`, `MIGRATION-MAP.md`, `HANDOFF-C10.md`.

```yaml
campaign: C09
turn: 10/16
repo: uniscrolliabrain-cloud/agente
branch: audit/preflight-cognition-option3-20261115
source_ref: main
source_commit_sha: NOT_VERIFIED
status: STATIC_AUDIT_AND_PLAN
findings: 22
patchsets: 15
waves: 10
runtime_modified: false
tests_executed: false
merge: false
deploy: false
next: C10_context_serving_facade_snapshots_deltas_refs
```
