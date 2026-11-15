# Contratos objetivo V2 y taxonomía cognitiva
**Naturaleza:** especificación **PROPUESTA**, no módulos implementados. Debe migrarse con compatibilidad desde CognitionCard V1 Zod estricto.

## 1. Capas de verdad y autoridad
L0 **Evidence**: artefacto bruto scoped, hash, fuente y revisión, potencialmente no confiable.
L1 **Verified Fact**: hecho que pasó verificaciones deterministas apropiadas; no garantiza infalibilidad del origen.
L2 **Derived Knowledge**: resumen/inferencia con provenance y confidence.
L3 **Attention**: prioridad calculada para un agente, actor, tarea y ventana temporal.
L4 **Presentation**: texto contextual para Fast y UI.
L5 **Action Intent**: petición estructurada, no efecto.
L6 **Authorized Effect**: kernel/policy/approval + executor + receipt.
Prohibido elevar automáticamente L0–L4 a L6.

## 2. Taxonomía de tarjetas
**Por función:** `fact`, `event_delta`, `state_snapshot`, `risk`, `opportunity`, `decision_proposal`, `memory`, `relationship`, `policy_notice`, `progress`, `alert`, `summary`, `question`, `uncertainty`, `cyber_finding`, `cyber_job`. Son subtipos **propuestos** de metadata V2; no reemplazar kinds V1 sin migración.
**Por temporalidad:** ephemeral/turn, session, task, active_state, long_term, archival.
**Por entrega:** delta-once, persistent-snapshot, reference-only.
**Por epistemología:** source_unverified, verified, derived, hypothesis, disputed, outcome_unknown.
**Por confidencialidad:** public, tenant_internal, restricted_role, restricted_actor, secret_reference_only.
**Por origen:** slow, deterministic_projection, cyber_receipt, user_confirmed, system_policy, JEV_annotation.
**Por destinatario:** tenant, workspace, role, agent, actor, task, thread, session; intersección de ACL, nunca unión permisiva.

## 3. Envelope V2 propuesto
```ts
type CardDeliveryMode = "delta"|"snapshot"|"reference";
type EpistemicStatus = "source_unverified"|"verified"|"derived"|"hypothesis"|"disputed"|"outcome_unknown";
interface CardV2Envelope {
  schemaVersion: 2;
  cardId: string; revision: number; tenantId: string;
  ownerId: string; subjectRefs: string[];
  source: {kind: string; eventIds: string[]; thoughtIds: string[]; evidenceRefs: string[]; modelId?: string};
  taxonomy: {kind: string; topics: string[]; cromoRefs: string[]; graphLayerRefs: string[]};
  classification: {epistemic: EpistemicStatus; sensitivity: string; classifier: "rules"|"jev"|"human"; classifierVersion: string; confidence: number};
  visibility: {roles?: string[]; actorIds?: string[]; agentIds?: string[]; taskIds?: string[]};
  attention: {nodeRefs: string[]; priority: number; explanationRefs: string[]};
  delivery: {mode: CardDeliveryMode; ttlSeconds?: number; supersedes?: string};
  content: {short: string; detailRef?: string; language: string; tokenEstimate: number; tokenizerId: string};
  timestamps: {createdAt: string; updatedAt: string; validUntil?: string};
  contentHash: string;
}
```
**Validaciones:** schema Zod strict, version, límites por campo, referencias canónicas, tenant match, hash, no secretos en short, clasificación JEV validada, TTL razonable. Un cambio de ACL requiere nueva revisión o revocación. El campo `classifier` NO implica autoridad.

## 4. Metadatos que Slow debe producir o enriquecer
`topics`, `entities`, `relations`, `intent`, `semanticKind`, `temporalScope`, `uncertainty`, `candidateEvidenceRefs`, `proposedPriority`, `recommendedNextAction` como sugerencia, `contradictionRefs`, `sourceThoughtIds`. Slow entrega JSON tipado con schema; el servidor no confía en sus referencias hasta resolverlas y comprobar permisos. No usar confianza autodeclarada por LLM como único score.

## 5. Clasificación JEV futura
Entrada mínima: tarjeta V2 con extracto redactado, nodos autorizados, esquema de categorías, policy context no secreto y referencias. Salida: `taxonomyLabels`, `cromoAffinity`, `attentionProposal`, `qualityFlags`, `contradictionCandidates`, `confidence`, `modelVersion`, `rationaleRef`. **No permite** cambiar tenantId, ampliar visibility, marcar verified, aprobar una remediación, alterar evidencia, inventar source IDs, asignarse un rol o escribir al kernel sin validación. Si JEV está ausente, adapter determinista devuelve `classifier:rules`; si está lento, encolar y publicar tarjeta factual mínima.

## 6. Cromos
Código actual reconoce `logic/physics/intent/memory/policy`. No inventar seis categorías por la metáfora de hexágono: documentar por separado la geometría conceptual y el enum efectivo. Cada cromo propuesto necesita `id,tenantId,kind,axioms,provenance,scope,revision`, enlaces a Thought/Entity/Memory, reglas de activación y prueba de consistencia. Un cromo `policy` es representación cognitiva de política, no el enforcement engine. Un cromo `physics` puede modelar restricciones del dominio, pero no autoriza efectos.

## 7. Grafo multicapa propuesto
G0 **Event provenance**: event→causation→task→receipt.
G1 **Business**: tenant→asset→finding→owner.
G2 **Thought**: pensamiento→atención→referencias.
G3 **Memory**: memoria→hecho→vigencia.
G4 **Cromo/ontology**: cromo→axioma→relación.
G5 **Cognitive cards**: card→thought/evidence→audience.
G6 **Session projection**: agent/session→snapshot→card revisions.
Estas capas son un **modelo lógico**; no declarar tablas físicas nuevas sin inventariar schema actual. Relaciones tipadas, versionadas y scoped. Evitar edges de otro tenant. No hacer graph traversal ilimitado durante turnos Fast.

## 8. Memorias
Se prevén cinco memorias en la arquitectura histórica, pero **no se dispone de un inventario verificado de sus nombres ni de sus contratos completos**. Antes de asignar cinco etiquetas, extraer las clases reales del código y export de conversación. Requisitos transversales: `MemoryRecord` con owner/tenant/subject, provenance, consent/retention, ACL, revision, epistemic status, TTL, deletion tombstone, relation refs, embedding ref opcional. Separar memoria de hechos de memoria de hipótesis; no promocionar una inferencia a hecho de negocio. Cada proyección de memoria al grafo conserva source y version.

## 9. Atención vectorial
Entrada: AttentionVector actual + actividad de tarea + sesión + recencia + perfil del agente + restricciones ACL. Output: `AttentionProjection(tenant,actor,agent,task,rankedNodeRefs,reasonCodes,version,expiresAt)`. Scoring configurable y auditable; reglas duras: filtrado de acceso primero, no subir prioridad a riesgo sin provenance, no hacer broadcast de contenido restringido, no usar ranking como autorización. Test: cambios de foco alteran ranking sin modificar hechos ni permisos.

## 10. Migración V1→V2
Paso 1: contrato `CardV2Envelope` en archivo nuevo y adapters V1→V2; V1 queda legible.
Paso 2: backfill controlado por tenant, sin exponer datos de otros owners.
Paso 3: dual-read y single-write V2 con feature flag; comparar hashes/provenance.
Paso 4: soporte delta/snapshot/reference, delivery ledger separado de card status.
Paso 5: retiro V1 solo tras tests, métricas y aprobación.
**Evitar:** agregar campos desconocidos a `cognitionCardSchema.strict()`; cambiar `consumed` a “caducada”; usar `markUseful` como permiso automático global.

## 11. Ejemplo de tarjeta
Una auditoría Cyber de activo A concluye `partial`. La tarjeta `cyber_job` declara `epistemic:verified` únicamente respecto a **estado parcial confirmado**; el resumen de hallazgos es `derived` si Slow lo redactó; `evidenceRefs` apunta a artefactos redactados; `delivery:snapshot`; visibility owner+Pedro+LAIA según política; revisión nueva al pasar a `completed`. La UI no convierte parcial en completo por completar la animación.
