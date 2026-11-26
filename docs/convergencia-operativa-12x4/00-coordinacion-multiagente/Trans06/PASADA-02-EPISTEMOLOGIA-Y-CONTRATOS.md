# Trans06 — Pasada 02: epistemología, identidad y contratos
Mandato CAMPAIGN.md; precedencia sobre candidatos de pasada 01. Baseline funcional main 93236a34. Documental, no GO.
## Estrategia
Reducir primitivas, separar invariantes, polaridad, epistemología, criterios empresariales y autoridad. Todo/positivo/negativo relativo a escala, no verdad booleana universal. 0–8 abierto. No segundo registro de cromos, PDP, grafo o memoria.
## Diagnóstico anclado
- cognition-v2.ts 9a65f5f0: CognitiveIdentity tenantId/actorId/owner/policyRevision/purpose, sin thread. CognitiveVisibility private/tenant, allowedActorIds, policyRevision. CognitiveRecord strict, revision, evidence, sourceEventId/sourceRevision, lifecycle. verified_fact requiere receipt; runtimeOutcome exige card verified y no ontology, receipt exacto. SlowOutput solo hypothesis/inference/unknown. Edge relation supports/contradicts/derived_from/about/supersedes/attends_to, cerrado.
- El mismo archivo contiene chromaticOntologyV2Schema: schemaVersion 2.0, ontologyId/version, draft/approved/retired, definitionDigest opcional, axes id/positivePole/negativePole max20, dimensions, approvalReceiptId opcional. Approved requiere receipt presente pero no prueba autenticidad ni digest; polos no necesariamente distintos. Reusar contrato, no otro registro. Verificar callers/persistencia en P3. Approved real debe ligar receipt y digest exacto, no solo presencia.
- card-ontology.ts e6f496d4: seis scores independientes, approvalDecisionId founder-20261116-card-ontology-001, review proposed. resolveCardAssessments ignora null; conflicto exacto produce null/disputed; outcome no se resuelve por consenso. No imponer suma uno, reinterpretar polos ni introducir otros por cast.
- cognitive-reference.ts b5b3e5a1: siete kinds, revision exacta. Ni relation ni SOP ni tenant son kinds propios. Entity version != cognitive revision salvo resolver probado. No inventar refs para empresa/departamento. Whole es perspectiva contextual, no necesariamente árbol.
- context.ts 539e6bed L24–56 revoca por id, verifica owner/policy y dependencias card/memory latest; resolve id/revision retorna null si denegado. No resolver universal entity/receipt. L77–80 incluye perfil ontology y outcome, no sidecar. Trans02 P02/P03 y Trans05 scope/thread son barreras.
- graph.ts d895576f: neighbors resuelve otherId latest, no exact endpoint revision, edges antes del límite de nodos; evidence solo subset kinds. Corregir por dueño Trans02; no usar como resolver universal.
- business-read.ts 314cc808: solo read_workspace, strict {}, actor human self, PDP read project, low risk; retorna receipt ID, no datos. No ampliar arbitrariamente capabilities.
- kernel-context.ts 86197c25 actor obligatorio, thread opcional, persona no principal. policy-context.ts 5538fb38 legacy sin actorId; authz/pdp.ts 44e84885 deny-overrides/default deny L91. PolicyEngine legacy allow empty permissions no significa todo sistema allow. Trans01 controla perfil gobernado.
- business-schema.ts f86fc0d3: campos, estados, relaciones/cardinalidad; comentario estados/relaciones v2 no persistidos en instalador. No asumir cobertura. business.ts versioned entities; graph.ts fc6bcd22 mantiene riesgos P1.
- storage.ts af4a25c9 digest canónico, apply conflict revisión, revoke transitive logical ID, projector inbox/fence. Reusar invalidación; sidecar no activo hasta cobertura equivalente.
## Contrato mínimo candidato
Subject, whole, goal y evidence son exact refs. Whole puede ser subject de otra evaluación, no implica jerarquía absoluta ni transitividad. Goal opcional solo para ejes independientes de objetivo. Subject=whole solo si definición lo permite. No referencia inventada; missing/denied bloquea serving. Axioma verificable no se confunde con proposición lingüística. Latencia = hipótesis explícita, no hecho oculto.
Candidate pure module packages/domain/src/organizational-primitives.ts (ruta propuesta; no implementado):
```ts
import { z } from "zod";
import { cognitiveRefSchema } from "./cognitive-reference.ts";
const id=z.string().min(1).max(200);
const hex=z.string().regex(/^[a-f0-9]{64}$/);
const score=z.number().finite().min(0).max(1).nullable();
const refKey=(r:z.infer<typeof cognitiveRefSchema>)=>
 JSON.stringify([r.tenantId,r.kind,r.id,r.revision]);
export const organizationalAssessmentDraftSchema=z.strictObject({
 subject:cognitiveRefSchema, whole:cognitiveRefSchema,
 goal:cognitiveRefSchema.optional(),
 axis:z.strictObject({ontologyId:id,version:id,definitionDigest:hex,id}),
 positive:score,negative:score,
 evidence:z.array(cognitiveRefSchema).min(1).max(30)
}).superRefine((v,ctx)=>{
 const refs=[v.subject,v.whole,...(v.goal?[v.goal]:[]),...v.evidence];
 if(refs.some(r=>r.tenantId!==v.subject.tenantId))
  ctx.addIssue({code:"custom",message:"cross tenant"});
 if(new Set(v.evidence.map(refKey)).size!==v.evidence.length)
  ctx.addIssue({code:"custom",message:"duplicate evidence"});
});
export type OrganizationalAssessmentDraft=z.infer<typeof organizationalAssessmentDraftSchema>;
```
Correction P1: contextDigest NOT model field. Server binds identity, purpose, policyRevision, thread only from authenticated journal, source watermark, exact resolved refs and digests, criteriaRevision, axis digest, evaluator/version, timestamp, origin persisted job/event. Canonical digest not authority. Verify before preparation, commit and serving. Expiry min of sources and policy. No user intent or verified fact from model. Reuse ontology annotation when sufficient; sidecar only if needed, not approved storage ABI.
## Predicates and authority
Finite typed predicates: sameTenant, exactRevision, evidenceAvailable, definitionActive, contextMatches; reuse owner checks. No arbitrary executable axiom strings, no new expression engine. No contradiction only genuinely incompatible values at same subject/predicate/context/time/revision. No general double negation for unknown, no unconditional transitivity. Candidate summary:
```ts
type Check={id:string;state:"satisfied"|"violated"|"unknown"};
export function summarizeChecks(checks:readonly Check[],required:readonly string[]){
 const expected=new Set(required),actual=new Set(checks.map(c=>c.id));
 if(!required.length||expected.size!==required.length||
    actual.size!==checks.length||actual.size!==expected.size||
    checks.some(c=>!expected.has(c.id)))
  return "unknown" as const;
 if(checks.some(c=>c.state==="violated"))return "violated" as const;
 if(checks.some(c=>c.state==="unknown"))return "unknown" as const;
 return "satisfied" as const;
}
```
Boundary parses enum and required list is server-owned. Never returns allow. Unknown blocks governed effects but may support analysis. Trans01 PDP, exact approval, claim and receipt required even all satisfied. Semantic score never a permission. Postcondition from verified receipt; accepted/unknown not confirmed.
## Lifecycle
Definition: use existing chromatic ontology id/version/digest; server verifies receipt binding, retired not eligible, never mutate historical definition. Tenant criteria manifest independent, versioned, cannot override invariant. Founder research approval != activation. Assessments compare only same exact subject/whole/goal/axis/context digest. Preserve contradictory evaluator records, mark disputed, no average; differing perspectives are not contradictory. Both scores high possible; null != zero. 
Admission parse draft→auth identity→read refs and approved definition→server bind→existing projection event approved by owner→transaction/inbox→authorized snapshot. Replay same key/digest no-op, different digest conflict. Use authoritative CAS/fence; no last-write-wins. Source revocation, policy change or retirement removes future eligibility, preserves historical evidence under retention. No custom bus event/DDL yet. 
## Ownership and twelve-phase delta
P01 baseline C05 + contracts. P02 pure schema/check set and negative fixtures. P03 axis registry lifecycle/relative perspective, no arbitrary transitivity. P04 CROMOS_PENDING adapter only if useful; logical checks not inference engine. P05 unknown-aware scoring integrated with Trans02 only. P06 annotation sidecar decision after proof; preserve strict ontology. P07 governed read port, no direct Store; entity exact version bridge. P08 no effect from assessment; Trans01/03 approval and receipt. P09 bounded propagation, no write or inferred authority. P10 Slow draft and JEV classification nonauthority; no Fast tools. P11 versioned compiler criteria separate domain; no new SOPs. P12 fixtures + owner gate.
## Simulation and test oracle
A) same entity evaluated against department goal vs company goal: distinct bindings, no disputed. B) same context opposing evaluators: preserve both, disputed, no inferred fact. C) null vs 0, 0/0 and 1/1 allowed, NaN/Infinity rejected. D) wrong tenant in any ref, missing resolver, policy changed during await, retired definition, fabricated receipt/digest: no serving/dispatch. E) duplicate evidence, same id different revision, wrong kind, stale entity version, self assessment disallowed: rejected or unknown as contract. F) exact required set missing/extra/duplicate/empty: unknown; all satisfied but PDP deny: zero dispatch. G) unknown result from provider: no verified fact/retry. H) stale proposal replay with same operation/different content: conflict, no overwrite.
Test existing cognition-v2-ontology, security-context, kernel-rules-attention, business-graph; new pure trans06-primitives and contracts fixture, integration only after owner ABI. Test input mutated between digest/commit, revocation after prepare, both PG processes; no actual tests run.
## Feedback/rollback/score
P1 proposed arbitrary axis strings and model digest: corrected by registry binding and server context. P1 under-described legacy policy vs PDP: corrected. No proof current chromatic registry mounted; P3 must search usages. No all 48 canonical blocks audited yet; no changes to functional code or other branches. Rollback no new feature enabled, future deactivate registry/consumer and preserve journal. Self-score architecture 9.3 granularity 8.3 anchors 9.0 hunks 8.0 wiring 8.4 tests 8.5 autonomy 8.2 rollback 8.7 = 8.55/10, documentary only.
