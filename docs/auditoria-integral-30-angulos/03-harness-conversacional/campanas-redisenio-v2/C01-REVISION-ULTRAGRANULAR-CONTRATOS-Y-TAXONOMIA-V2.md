# C01 — Contratos y taxonomía cognitiva V2: auditoría incremental, diseño sustitutivo y handoff
**Turno:** 02/16 · **Fecha:** 2026-11-15 · **Repo principal:** `uniscrolliabrain-cloud/agente` · **Rama documental:** `audit/preflight-cognition-option3-20261115`
**Estado:** AUDITADO ESTÁTICAMENTE / DISEÑADO / NO IMPLEMENTADO / TESTS NO EJECUTADOS.
**Predecesor:** [C00 profunda](./C00-REVISION-ULTRAGRANULAR-AUDITORIA-INCREMENTAL.md) · **ADR vinculante:** [ADR-009](../ADR-009-REDISENO-SUSTITUTIVO-LEGACY-TRANSITORIO.md).
**Regla:** Ciberseguridad es repo hijo y solo entra como interfaz en C01/C14. No convertir esta campaña en refactor de Cyber.

## 1. Alcance, no objetivos y decisiones
Diseñar **contratos nuevos** para hechos/eventos, Thoughts, tarjetas RAG/RAC enriquecidas, clasificación, cromos, atención, memorias, snapshots/deltas/referencias, ACL y trazabilidad. Mantener kernel/policy/approval/SOP como autoridad. Slow y JEV son productores de **propuestas**, no jueces de ejecución. V1 no es contrato de destino: se mantiene solo temporalmente para compatibilidad, migración y rollback.

**No hacer aún:** reescribir `conversation.ts`, crear proyector durable (C02), materializar cinco memorias sin inventario (C04), activar JEV (C08), cambiar card store (C09), implantar ContextServing (C10), conectar Cyber (C14), merge o deploy.

## 2. Evidencia de código verificada (main, SHA de archivo)
| Ruta | SHA de archivo | Hallazgo |
|---|---|---|
| `packages/domain/src/cognition-card.ts` | `4817c9688f37508922a3237a184ad309a9352160` | Zod `.strict()`, kind 6 valores, status 4, scope thread/tenant, evidence thoughtIds min 1, version numérica 1 |
| `apps/server/src/kernel/cognition/card-builder.ts` | `2c2a9c915eb84535ee895d9880399f8f7fb41e90` | clasificación regex; hash SHA256 de tenant+dedupeKey/Thought+literal 1; TTL 7 días; body 8000 caracteres |
| `apps/server/src/kernel/cognition/card-store.ts` | `cbb1259b202ffb25a79511bdb927fa5c0199c41f` | almacenamiento `owner` en kind cognition-cards; filtro tenant; CAS opcional, fallback put no atómico |
| `apps/server/src/kernel/cognition/capture.ts` | `f8a675562d5db55fbd2379a198add44475167a9c` | `SlowAuthor.writeReasoning` seguido de `buildCognitionCard` y `cards.save`; sin transacción visible entre ambos |
| `apps/server/src/kernel/graph/thought.ts` | `8b2eacc5927fa46e15465db493a020227e9b45ec` | Thought V2 ya tiene tenant/owner/actor, roles, attention, edges, provenance; reutilizar, no duplicar |
| `apps/server/src/kernel/authors/slow-author.ts` | `13f68919a3fddbe323613fc3e419153c0cdefcfa` | Thought real, attention y progress; actor slow-llm, provenance slow.llm |
| `apps/server/src/kernel/context/kernel-context.ts` | `86197c2532d04cd6938a34f970bdcda6a7cfee07` | tenantId, owner, role, requestId, actorId obligatorios; personaId, threadId, correlationId opcionales |
| `apps/server/src/engine/events/types.ts` | `1e00fb0381281aa57999a98ee48b47fd453e3f71` | SYSTEM_EVENT_TYPES union cerrada; envelope schemaVersion literal 1.0; source.kind union cerrada |
| `apps/server/src/cognition-routes.ts` | `30100658e9ab6836890761a48f3e9640b8313ced` | GET cards y POST useful; owner/tenant de auth; promoción a tenant no da por sí sola lectura cross-owner |
| `packages/domain/src/node-ref.ts` | `0a43ce5a3ff99acae9a22f73b216ea73aeac6d07` | canonicalNode/parseNodeRef; `unknown` fallback; `nodeMentions` usa substring |
| `tests/cognition-cards.test.ts` | `0458a4e8d1742977b75e4e440741291a9a7f64d3` | tests actuales exigen consumo one-shot, idempotencia por operación y owner isolation; serán tests de **legacy**, no DoD de V2 |

**Corrección importante de C00:** la nomenclatura `Thought V2` en código no equivale a que el **pipeline cognitivo opción 3** esté implementado. No crear otro Thought V2 idéntico.

## 3. Hallazgos incrementales C01-F01–F12
1. **F01 — Cardinalidad:** V1 admite `insight/risk/opportunity/decision/summary/question`; nuevas taxonomías deben versionarse sin mutar parser estricto.
2. **F02 — Estado de tarjeta equivocado para V2:** `proposed→consumed` mezcla vida del conocimiento y estado de entrega. Separar lifecycle de Card y DeliveryReceipt.
3. **F03 — Owner vs tenant:** `markUseful` pone `scope=tenant` pero el store sigue leyendo bajo owner. **No hay demostración de compartición entre usuarios del tenant**. Diseñar índice y ACL empresariales, no solo etiqueta.
4. **F04 — CAS opcional:** `CognitionCardStore.patch` hace read+put sin CAS si el adaptador carece de compareAndSwap; no afirmar concurrencia fuerte en todos los backends.
5. **F05 — Idempotencia vs revisión:** `buildCognitionCard` usa `tenantId:dedupeKey:1`; dos revisiones reales de la misma tarea podrían colapsar. Distinguir logicalCardId, revisionId, sourceRevision y operationId.
6. **F06 — Semántica de TTL:** V1 expira a 7 días desde Thought; snapshots/refs V2 necesitan expiración dependiente de fuente, consentimiento y política de retención, no un TTL universal.
7. **F07 — Thought→Card no atómico:** capture escribe Thought antes de guardar Card. Diseñar reconciliación por sourceRef y eventos/outbox, no compensar borrando Thought válido.
8. **F08 — Epistemia ausente:** confidence numérico no distingue hecho verificado, inferencia, hipótesis, contradicción, desconocido y ejecución confirmada.
9. **F09 — Event schema rígido:** `SystemEvent.schemaVersion: "1.0"` y catálogo cerrado; nuevas familias requieren versión/adaptador y registro de payloads, no payload arbitrario.
10. **F10 — NodeRef fallback peligroso para autorización:** `unknown` y substring son útiles para búsqueda, **no** para identidad/ACL ni join entre tenants.
11. **F11 — Autoría y actor:** KernelContext ya separa tenant/owner/actor/persona; V2 debe añadir receptor/subject y visibilidad sin confundir owner con empresa.
12. **F12 — Tests de legacy:** `tests/cognition-cards.test.ts` comprueba explícitamente que segunda lectura no repite tarjetas. No copiar esta aserción al contrato snapshot V2.

## 4. Arquitectura contractual propuesta (no código existente)
```text
KernelContext (autoridad, V1 vigente)
    ├─ AuthoritativeEventV1 / adapter de versión
    │     └─ CognitiveProjectionEnvelopeV2 [nuevo]
    ├─ Thought (kernel graph existente, no duplicar)
    │     └─ ThoughtRefV2 + EvidenceRefV2 [nuevos adaptadores]
    ├─ MemoryRefV2 / CromoRefV2 / AttentionRefV2 [referencias, sin inventar stores]
    ├─ CognitionCardV2 [nuevo; conocimiento versionado]
    │     ├─ ClassificationV2 [rules/JEV; no autoritativa]
    │     ├─ EpistemicAssessmentV2 [no sustituye receipts]
    │     └─ VisibilityPolicyV2 [enforced por servicio, no LLM]
    └─ ContextServingV2 [nuevo]
          ├─ ContextSnapshotV2 [persistente/versionado]
          ├─ ContextDeltaV2 [notificación nueva, ACK]
          ├─ ContextReferenceV2 [fetch autorizado]
          └─ DeliveryReceiptV2 [estado por destinatario/canal]
```
**Separar cuatro identidades:** `tenantId` (empresa), `owner` (namespace heredado), `actorId` (quien actúa), `personaId/agentId` (rol/agente funcional); no inferir equivalencias. Un `subjectRef` puede representar tarea, cliente, documento, activo o entidad. El permiso siempre se evalúa en servidor con contexto autenticado y política vigente.

## 5. Contratos propuestos, campos mínimos y restricciones
### PS01.1 — `packages/domain/src/cognition-card-v2.ts` (NUEVO)
```ts
type CardV2 = {
  schemaVersion: "2.0";
  logicalCardId: string; revisionId: string; revision: number;
  tenantId: string; ownerId: string; authorActorId: string;
  subjectRefs: CanonicalRefV2[];
  source: { sourceType: "thought"|"event"|"memory"|"document"|"cyber-evidence";
            sourceId: string; sourceRevision: string; correlationId?: string; causationId?: string };
  kind: "insight"|"risk"|"opportunity"|"decision"|"summary"|"question"|"warning"|"action_candidate";
  title: string; body: string;
  epistemic: EpistemicAssessmentV2;
  classification: ClassificationV2;
  evidenceRefs: EvidenceRefV2[];
  attentionRefs: string[]; memoryRefs: string[]; cromoRefs: string[];
  visibility: VisibilityPolicyV2;
  lifecycle: "active"|"superseded"|"expired"|"revoked";
  createdAt: string; updatedAt: string; expiresAt?: string;
};
```
**Ejemplo de diseño, no implementación aprobada de campo definitivo.** Restricciones: `revision>=1`, sourceRevision no vacío, evidenceRefs nunca suplantan authorization, refs validadas, timestamps UTC offset-aware, límites de tamaño, `.strict()`, `logicalCardId` estable y `revisionId` distinto en nueva versión. `action_candidate` es una **propuesta** sin facultad de ejecución. Decidir si `warning` y `action_candidate` son tipos de tarjeta o etiquetas clasificatorias tras pruebas de consumidores.

### PS01.2 — `packages/domain/src/cognitive-evidence-v2.ts` (NUEVO)
```ts
type EvidenceRefV2 = {
  tenantId: string; kind: "thought"|"event"|"document"|"memory"|"external_receipt"|"cyber";
  id: string; revision?: string; digest?: string;
  observedAt?: string; verification: "verified"|"reported"|"unverified"|"disputed";
  redactionPolicyId?: string;
};
type EpistemicAssessmentV2 = {
  status: "verified_fact"|"reported_fact"|"inference"|"hypothesis"|"unknown"|"contradicted";
  confidence?: number; assessedAt: string;
  justificationRefs: string[];
};
```
No convertir un output LLM o `confidence:1` en `verified_fact`; exigir fuente con receipt y verificador determinista. Un receipt externo prueba el estado reportado por la herramienta, no que el resultado empresarial final esté completado.

### PS01.3 — `packages/domain/src/cognitive-classification-v2.ts` (NUEVO)
```ts
type ClassificationV2 = {
  classifier: "rules"|"jev"|"slow"|"human";
  classifierVersion: string; taxonomyVersion: string;
  labels: string[]; scores: Record<string,number>;
  cromoCandidates: string[]; attentionHints: string[];
  explanationRefs: string[]; classifiedAt: string;
  review: "proposed"|"validated"|"rejected"|"needs_review";
};
```
JEV puede proponer tags y puntuaciones; solo el sistema autoritativo decide scopes, acciones, policy, permisos y qué entra en contexto. Fallback rules en timeout, schema inválido o proveedor ausente. Tratar contenido de JEV como datos no confiables.

### PS01.4 — `packages/domain/src/context-serving-v2.ts` (NUEVO)
```ts
type ContextSnapshotV2 = {
  schemaVersion:"2.0"; snapshotId:string; tenantId:string; recipientActorId:string;
  roleId?:string; threadId?:string; taskId?:string;
  sourceWatermark:string; policyRevision:string;
  cardRevisionRefs:string[]; memoryRefs:string[]; attentionRefs:string[];
  tokenBudget:number; assembledAt:string; invalidatedAt?:string;
};
type ContextDeltaV2 = {
  deltaId:string; tenantId:string; recipientActorId:string;
  sourceWatermark:string; revisionRefs:string[]; createdAt:string;
};
type DeliveryReceiptV2 = {
  deltaId:string; recipientActorId:string; channel:string;
  status:"pending"|"leased"|"acknowledged"|"expired"|"revoked";
  attempt:number; lastAttemptAt?:string; ackAt?:string;
};
type ContextReferenceV2 = {
  refId:string; tenantId:string; resourceKind:string; resourceId:string;
  revision:string; expiresAt?:string;
};
```
Snapshot no consume tarjetas; Delta se entrega al menos una vez, con dedupe y ACK lógico; Reference se resuelve **cada vez** con autorización y revocación actuales. No almacenar el contenido sensible en receipt. TokenBudget por tokenizer/modelo, no chars/4 como fuente de verdad.

### PS01.5 — `packages/domain/src/cognitive-projection-event-v2.ts` (NUEVO)
Envelope versionado con `eventId`, `tenantId`, `sourceEventId`, `sourceSchemaVersion`, `projectorVersion`, `correlationId`, `causationId`, `observedAt`, `revision`, `payloadKind` cerrado y `payload` tipado. Proyección de hechos no debe alterar ni reemitir el evento fuente como si fuera un hecho nuevo. No cambiar directamente `SystemEvent.schemaVersion` sin estrategia de lectura mixta. C02 define cursor/replay.

### PS01.6 — `packages/domain/src/canonical-ref-v2.ts` (NUEVO o adaptador de node-ref)
CanonicalRef debe ser identidad tipada, no `nodeMentions`; `tenantId`, `kind`, `id`, `revision?`, `namespace?`. `unknown` solo en ingest/quarantine, nunca para autorización. No comparar IDs entre tenants mediante texto normalizado.

### PS01.7 — `packages/domain/src/visibility-policy-v2.ts` (NUEVO)
Visibilidad: `tenantId`, `ownerId`, `allowedActorIds`, `allowedRoleIds`, `allowedAgentIds`, `purpose`, `sensitivity`, `policyRevision`, `expiresAt?`. La lista en el objeto es **un límite adicional**, no concesión: autorización requiere evaluación kernel/policy y membership actual. Deny-by-default si falta actor, rol, tenant, consentimiento o propósito. Redacción de evidencia por canal y actor.

## 6. Matriz de compatibilidad y migración V1→V2
| V1 | V2 | Política |
|---|---|---|
| `id` hash task/Thought | `logicalCardId` + `revisionId` | migrar identidad y preservar source; no reinterpretar duplicados como revisiones |
| `status:proposed/consumed` | `lifecycle` + `DeliveryReceipt` | nunca convertir consumed en revoked ni borrar conocimiento |
| `scope:thread/tenant` | `VisibilityPolicyV2` | promover no significa acceso global; verificar membership |
| `confidence` | `epistemic.status` + confidence | confidence no prueba hecho |
| `attention.primary/matched` | `attentionRefs` y metadata | reutilizar AttentionVector existente, no duplicar |
| `evidence.thoughtIds` | `evidenceRefs` tipadas | conservar provenance; añadir refs de evento/documento/receipt |
| `provenance.source` | `source` versionado | conservar autoría y causalidad |
| `expiresAt` fijo | retention/TTL por tipo | no extender datos revocados por migración |
| `version:1` | `schemaVersion:2.0` y `revision` | version de schema ≠ revision de contenido |
| `nodeRef unknown` | canonical ref tipada | cuarentena de referencias ambiguas |

**Dual-read:** V2 primero para datos V2, V1 mediante adapter explícito; nunca pasar V2 a `cognitionCardSchema` estricto. **Dual-write:** solo si es necesario para consumidores antiguos, con ID de operación y sin efectos duplicados. **Backfill:** paginado por owner/tenant, cursor, checksum, cuarentena de filas inválidas, reporte de diffs. **Cutover:** canary y retiro de V1 en C14/C15 tras verificar dependencias. La estrategia concreta de DB se decide tras auditoría de stores C00/C09.

## 7. Waves ejecutables, patchsets y pruebas
### W1 — Inventario final de consumidores y schemas
Buscar imports de `cognitionCardSchema`, `CognitionCard`, `SystemEvent`, `nodeRefSchema`, `kernelContextSchema`, `markUseful`, `markConsumed`. Registrar paths reales y commits. **Entregable:** `C01/CONSUMER-MATRIX.md`. **Gate:** cada consumidor clasificado legacy, adapter o V2.

### W2 — Semántica y ADR de identidad/epistemia
Definir glosario de Card, Thought, Event, Evidence, Receipt, Snapshot, Delta, Reference, Classification, Memory, Cromo y Attention. Resolver casos de revisiones, contradicción, unknown, revocación y conservación. **Entregable:** `C01/ADR-IDENTITY-EPISTEMICS.md`. **Gate:** ningún campo otorga permisos implícitos.

### W3 — Contratos Zod V2 en paquete domain
Crear PS01.1–PS01.7 (adaptar nombres a estructura del repo), exports reales y validaciones cruzadas. Validar limites, `.strict()`, enums cerrados, UUID/ULID según convención real, timestamps. **Entregable:** archivos TS + tests por schema. **Gate:** typecheck y schemas positivos/negativos.

### W4 — Adaptadores V1/V2 y compatibilidad
Construir `apps/server/src/kernel/cognition/adapters/v1-to-v2.ts` y tests. No cambiar V1 ni rutas productivas. **Entregable:** fixture corpus, migration matrix y checksum report. **Gate:** ningún dato se expone a un actor adicional por migración.

### W5 — Event/Context/ACL contract tests
Definir test matrix para projection envelope, context snapshot, delta/ACK, reference fetch, policy revision, stale data, forged actor, wrong tenant, revoked memory, JEV injection. **Entregable:** `C01/TEST-PLAN.md`, fixtures de 2 tenants/3 users/2 agentes. **Gate:** no se acepta campo arbitrario en boundary.

### W6 — Revisión de integración Cyber (solo contrato)
Comparar envelope Python/SDK TS del hijo con CognitiveProjectionEventV2, mapear estados de jobs y receipts; no instalar SDK ni alterar Cyber. **Entregable:** `C01/CYBER-CONTRACT-MATRIX.md` para C14. **Gate:** pending/running/partial/blocked/unknown no se convierten en completed.

### W7 — Certificación documental y handoff C02
Ejecutar `pnpm typecheck`, `pnpm test`, `pnpm gate` en checkout autorizado, con códigos de salida; inspeccionar diffs de schemas, exports y consumidores. **Entregable:** `C01/EXECUTION-REPORT.md`, `ROLLBACK.md`, `CONTRACT-REGISTRY.md`. **Gate:** C02 recibe tipos aprobados y payload catalog; no hay despliegue.

## 8. Tests obligatorios, nombres sugeridos
- `tests/cognition-card-v2.test.ts`: parse correcto, campos desconocidos, revision monotónica, sourceRefs, epistemic.
- `tests/cognition-v1-v2-adapter.test.ts`: legacy consumed no implica revocado, owner/tenant no se confunden, hash estable.
- `tests/cognitive-classification-v2.test.ts`: JEV malicious output no cambia ACL ni factualidad.
- `tests/context-serving-contract-v2.test.ts`: snapshot persistente, delta ACK, reference revoke, policy revision.
- `tests/cognitive-projection-event-v2.test.ts`: event versioning, causation, duplicate source event, unknown kind.
- `tests/cognitive-tenant-boundary.test.ts`: 2 empresas, 3 humanos y agentes, cross-owner, role downgrade, missing actor.
- `tests/cyber-envelope-contract-v2.test.ts`: fixtures Python/TS, status partial, stale expected_revision, 202 pending.
**NOTA:** todos los paths de tests anteriores son propuestas; no afirmar que existen.

## 9. Riesgos y controles de ejecución
**P0-A** scope tenant mal interpretado → ACL kernel, tenant membership y pruebas cross-owner.
**P0-B** dedupe por taskId oculta revisión → IDs lógicos y de revisión separados.
**P0-C** card delivery y lifecycle confundidos → ledger independiente.
**P0-D** JEV/Slow promueve hipótesis a hechos → epistemia validada por receipts.
**P0-E** schemas V1 strict → versionado, adapters, rollback.
**P0-F** evento de proyección se reinyecta como evento autoritativo → sourceEventId y loop prevention.
**P0-G** CAS no disponible → no asumir atomicidad; C09 define persistencia robusta.
**P0-H** NodeRef unknown usado como permiso → identidad tipada, deny-by-default.
**P0-I** revocación y cache → policyRevision + invalidación y revalidación en lectura.
**P0-J** estados Cyber heterogéneos → adapter y fixture contract tests.

## 10. Plantilla de reporte por wave
```yaml
campaign: C01
wave: W?
repository: uniscrolliabrain-cloud/agente
base_commit_sha: NOT_VERIFIED
branch: ""
status: PLANNED
code_paths_verified: []
files_created: []
files_modified: []
schema_changes: []
consumer_changes: []
legacy_retirement_condition: ""
tests: {commands: [], pass: [], fail: [], skipped: [], not_run: []}
security_review: {tenant: "", actor: "", role: "", policy: "", revocation: ""}
cyber_contract_check: ""
rollback: ""
blocking_decisions: []
next_wave: ""
```

## 11. Estado real y salida para C02
**Esta entrega:** se ha leído código real de contratos, builder, store, capture, Thought, SlowAuthor, events, routes, NodeRef, tests y kernel context; se han diseñado interfaces y waves, **sin escribir código de producción ni ejecutar tests**. Los SHA listados son de **archivos**, no SHA de commit de main. La auditoría de consumidores completa sigue pendiente. El ejecutor no debe marcar C01 PASS hasta cumplir W1–W7 y reportar evidencia.

**C02:** debe construir Event Bus/proyector durable usando `CognitiveProjectionEventV2` y source IDs, pero **sin crear otro bus autoritativo ni activar consumidores duplicados**.
