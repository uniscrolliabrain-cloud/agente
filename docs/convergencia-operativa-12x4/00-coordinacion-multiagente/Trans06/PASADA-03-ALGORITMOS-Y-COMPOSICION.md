# Trans06 — Pasada 03: algoritmos, polaridad contextual y composición
26-11-2026. Precedencia founder > CAMPAIGN > P3 > P2 > P1. Baseline funcional 93236a34. Documentación; no implementación ni pruebas ejecutadas.
## Estrategia
Reutilizar el modelo cromático REAL, separar proyección de decisión y diseñar algoritmos pequeños, puros y acotados. No crear un campo físico artificial, una ontología duplicada o una topología obligatoria 0–8. La espiral es iteración sobre estados distintos; no obliga a recursión computacional infinita.
## Diagnóstico y corrección de P2
- engine/cognition/chromatic/ontology-registry.ts ce5d5268: ChromaticOntologyRegistry.register parsea, verifica aprobación mediante digest({...ontology,status:"draft",approvalReceiptId:undefined}), id digest([ontologyId,version]), insertIfAbsent y reread; conflicto de contenido inmutable. runtime exige approved y revalida recibo. NO afirmar que registry no existe o que solo comprueba presencia de receipt. La inmutabilidad implica draft→approved/retired de misma versión no soportado por register; retiro vía revocación o nueva versión, no sobrescribir. Stored row no reparsea en runtime; proponer guard exacto y verificación de identity/digest, no reimplementar registry.
- normalizeChromaticVector existente acepta un escalar [-1,1] por eje, null/missing, round 1e-6, rechaza claves extra, rango y NaN. Comprueba status del objeto, no autoridad por sí solo. CardOntologyService usa pares [0,1] independientes: no colapsarlos a escalar, pues (.9,.9) y (0,0) comparten diferencia 0 pero no significado. Dos planos, no una conversión canónica. Axis approval no score approval.
- engine/cognition/chromatic/card-ontology.ts 4aa04bdc: approvedCardOntology 1.0.0, definitionDigest fijo, tres ejes/seis polos, approval literal founder-20261116-card-ontology-001, approvalDigest distinto del definitionDigest. CardOntologyService authority.verify exige id/hash esperados, lee system ontology-approval-decisions y revocations. install usa insertIfAbsent, annotate llama install/assertApproved y verifica evidencia/contextDigest, resuelve consensus. No copiar bootstrap founder para aprobar otros ejes. Distinguir digest definición (vocabulario) y digest envelope (receipt). P2 axisRef debe ligar ambos vía registry real, no asumir igualdad. El servicio existe y tests demuestran intención; montaje real se inspecciona P4.
- tests/cognition-v2-ontology.test.ts 5067c225: casos ambos polos .9, unknown, no permisos, NaN, conflict, receipt revocation, durable Slow→projector→snapshot, replay y ocultación por policy hook. No duplicar estos tests; nuevos casos focalizados en contextual/empresarial. No ejecutar ni afirmar PASS.
- kernel/graph/attention.ts cb526ccf: normalizedWeights, matchScore, isFocusedOn, attentionOverlap weighted Jaccard y divergence=1-overlap. Duplicate matches tienen semántica diferente en normalizedWeights (acumula) y overlap (parea uno a uno), matchScore first. Empty overlap=0/divergence=1 es ausencia de evidencia, no repulsión ni contradicción. Meta.detectAttentionConflict en kernel/observers/meta.ts 46be97c1 usa overlap<.3 frente a primer thought: divergencia de foco, no conflicto lógico; no reutilizar como verificador de incompatibilidad. No cambiar contratos legacy sin dueño.
- packages/domain/src/ontology.ts 55fc1781 OntologyBundle frozen version numeric tenantScope vocabulary; validateAgainstMetamodel bootstrap slug, colisiones, dedupe; CapabilitySpec/CognitiveSpec declarados pendientes. ontology-seed.ts 912b06f8 incluye resource/goal y belongs_to/uses/requires/governs/triggers; esto es vocabulario, no prueba instancia ni ACL. Reusar metamodelo empresarial existente, no usarlo para inferir pertenencia o permiso.
## A. Registry y compatibilidad
Patchset P03/P04 sobre registry, reservado con Trans02. Candidate runtime row read as unknown, parse schema, require id/version match, status approved, verify existing approval digest (exact original algorithm). New definition must have distinct poles and nonempty axes where required, nonambiguous normalized IDs; strict validation in new profile, preserve legacy approved definition. No recalc hardcoded definitionDigest until source document/hash canonicalization is confirmed. Candidate:
```ts
const parsed=chromaticOntologyV2Schema.safeParse(row?.ontology);
if(!parsed.success || parsed.data.ontologyId!==ontologyId ||
   parsed.data.version!==version || parsed.data.status!=="approved")
 throw Error("CHROMATIC_BLOCKED_DECISION");
const o=parsed.data;
if(!await this.authority.verify(o.approvalReceiptId!,
 digest({...o,status:"draft",approvalReceiptId:undefined})))
 throw Error("ONTOLOGY_APPROVAL_REVOKED");
return o;
```
Do not grant approval for 0–8 or new axes. For pure simulation use explicitly synthetic definition, not system receipt. Production allowed definitions whitelist resolved by authority. Retired/revoked sources invalidate future eligibility; historical receipts preserved. Register immutable version; no in-place status transition. No new store or endpoint.
## B. Polaridad contextual y afinidad
P2 draft retains independent positive/negative nullable. An assessment is tied to subject/whole/goal exact refs, axis version+definition digest and server context; not an intrinsic label. Inference from a parent/child never flips automatically. Same transformation across scales: evaluate independently against authorized evidence and goal. A lower-scale removal can have upper-scale benefit but that relation is a hypothesis until assessed, never an unconditional sign inversion. 
Candidate pure helper, new module in same proposed organizational-primitives.ts or kernel/cromos/logic (choose single location after ownership):
```ts
type PolePair={positive:number|null;negative:number|null};
type Direction="positive"|"negative"|"balanced"|"unknown";
export function describePair(p:PolePair,epsilon=0.05):
 {direction:Direction;intensity:number|null;balance:number|null} {
 const vals=[p.positive,p.negative];
 if(!Number.isFinite(epsilon)||epsilon<0||epsilon>1||
    vals.some(x=>x!==null&&(!Number.isFinite(x)||x<0||x>1)))
  throw Error("INVALID_POLARITY");
 if(p.positive===null||p.negative===null)
  return {direction:"unknown",intensity:null,balance:null};
 const d=p.positive-p.negative;
 return {direction:Math.abs(d)<=epsilon?"balanced":d>0?"positive":"negative",
         intensity:Math.max(p.positive,p.negative),balance:d};
}
```
Never persist derived pair as source evidence; descriptive projection only. Keep raw pair; balanced high vs balanced zero distinguished via intensity and original values. Epsilon .05 experimental, not ontology or business policy, version in experiment config. For missing pole, do not infer opposite or fabricate magnitude. No universal attraction law. Affinity means compatible under defined criterion; repulsion requires explicit incompatible evidence, not low overlap. 
Comparability key server uses tenant + exact subject + whole + goal/null + axis/version/digests + contextDigest; group only exact same key. Context may include common evidence snapshot; evaluator own refs may differ within allowed universe. P2 correction: contextDigest binds authorized evidence universe, not each evaluator's chosen subset (otherwise never compare disagreements); preserve each subset digest separately. Incompatible scores under same context disputed (use existing consensus exact semantics, no thresholds for truth); direction difference in different contexts is not conflict. 
## C. Selection with existing GlobalAttentionWorkspace
No second scorer. Use pure candidate optional feature, default OFF, only inside Trans02 common ranking facade, never before auth. Experimental affinity bonus from a pre-resolved approved assessment matching exact goal/whole, non-disputed, both scores present. Base rank current .5 relevance+.3 urgency+.2 novelty. 
```ts
export function candidateRank(base:number,pair:PolePair|undefined,
 enabled:boolean,weight=0.1):number {
 if(!Number.isFinite(base)||base<0||base>1||
    !Number.isFinite(weight)||weight<0||weight>0.1)
  throw Error("INVALID_RANK");
 if(!enabled||!pair)return base;
 const s=describePair(pair);
 if(s.balance===null)return base;
 return Math.max(0,Math.min(1,base+weight*s.balance));
}
```
Weight .1 provisional experimental cap; no production default. This is orientation alignment to explicitly configured criterion, not general priority. Negative safety/risk evidence must not disappear: critical evidence/mandatory anchors selected before affinity scoring, reserved by Trans02/05. Stable tie break exact ref key code-unit lexicographic (not locale-dependent); no change to current tie behavior without regression tests. Do not apply to legacy negative weight vectors. Base scores and budget accounting unchanged when off. Measure recall, conflict visibility, selection stability, latency and token cost with feature on/off; if no measurable value retire helper. 
## D. Composition and bounded propagation
Propagate representations via existing graph/projector; never propagate write or authorization. Traversal over a snapshot of authorized exact refs only. A path may discover candidate context, not infer transitive semantic claims. Reuse graph reader after Trans02 exact endpoints fix; no raw DB queries in pure helper. Proposed pure bounded traversal over materialized authorized adjacency (P09):
```ts
type RefKey=string; // server canonical JSON of tenant,kind,id,revision
export function boundedReach(root:RefKey,
 adjacency:ReadonlyMap<RefKey,readonly RefKey[]>,
 limits:{depth:number;nodes:number;edges:number}){
 for(const [k,v] of Object.entries(limits))
  if(!Number.isSafeInteger(v)||v<(k==="depth"?0:1)||
     v>(k==="depth"?3:k==="nodes"?50:100))
   throw Error("INVALID_TRAVERSAL_LIMIT");
 if(!adjacency.has(root))throw Error("ROOT_NOT_AUTHORIZED");
 const seen=new Set([root]),frontier=[{key:root,depth:0}];
 let examined=0,truncated=false;
 outer:for(let i=0;i<frontier.length;i++){
  const {key,depth}=frontier[i];
  if(depth>=limits.depth)continue;
  const next=adjacency.get(key)??[];
  // port guarantees deduped canonical order and bounded adjacency
  for(const other of next){
   if(examined>=limits.edges){truncated=true;break outer;}
   examined++;
   if(!adjacency.has(other))throw Error("UNAUTHORIZED_ENDPOINT");
   if(seen.has(other))continue;
   if(seen.size>=limits.nodes){truncated=true;break outer;}
   seen.add(other);frontier.push({key:other,depth:depth+1});
  }
 }
 return {refs:[...seen],examined,truncated};
}
```
Port limits actual DB rows/edges and wall clock BEFORE materialization; pure helper not IO safety. Depth 3/node50 existing graph limits, edge100 candidate; explicit coverage scope and depth bound; truncated flag signals cap exhaustion within scope, not all enterprise explored. Do not expose counts of denied refs; reject/return safe empty through auth facade. Dedupe exact refs, distinguish multiple relations for edge accounting at reader, deterministic order, cycle/diamond no extra projection. Watermark and source revisions rechecked at commit/serve; stale work obsolete. No recursive proposal on own derived event. Dedupe key includes tenant/actor/purpose/origin event/definition/criteria/subject/whole/goal/source watermark and approved algorithm version. Same key different digest conflict. No path-based authority.
## E. State transition and feedback
The spiral is discrete: new authoritative state/receipt→event→projection→new context; no clock-driven infinite iteration. Use event lineage and source watermark, coalesce per context, only reprocess when external authorized input or correction changes digest. Projector event derived from this same assessment not trigger. Any action returns to Trans01 admission and Trans03 binding; no automated cascading deletion or re-execution. For absent resource or removed process, latent opportunity requires fresh authorized evidence; no assumption resource automatically freed or opportunity created. 
## P01–P12 mapping and execution barriers
P01 audit registry now resolved, caller/mount P4. P02 exact drafts and checks. P03 pair helper/comparability and registry guard. P04 dormant cromos keep, no duplicate field; reconcile C05. P05 rank ablation via Trans02. P06 contextual binding with exact source subset and revocation. P07 authorized entity resolver via domain and Trans01. P08 effects only receipts. P09 bounded reach and dedupe. P10 slow/JEV and Trans05 selector/brief; no extra inference per node. P11 criteria manifest compiler with axis refs and explicit goal per enterprise; no universal override. P12 tests and ablation. W1 pure code candidates/fixtures independent after authorization; W2 registry/graph/attention reservation; W3 integrated events/read/receipt contracts; W4 cert. 
## Simulations / tests
1. (.9,.9) vs (0,0): balanced both but intensity .9 vs 0, no forced zero meaning. (.9,null) unknown, no rank change. NaN/Infinity invalid.
2. Same entity with local goal and company goal: different exact keys, no contradiction. Same context disjoint evaluator subsets preserve assessments; disagreement not averaged.
3. Registry forged stored row wrong id/version, malformed status, revoked receipt, draft→approved same version conflict: deny; existing approved 1.0.0 preserved.
4. Two empty vectors: legacy divergence1 but new semantic conflict unknown; no repulsion classification. Duplicate matched nodes test existing legacy semantics before any change.
5. Rank off exact equality for corpus; unknown/missing/unapproved unaffected; mandatory risk preserved even adverse orientation; weight bounds; no rank grants execution.
6. Directed cycle/diamond, duplicate refs, depth0, node/edge cap, inaccessible endpoint, malicious adjacency order and invalid limits; deterministic pure input→output. Reader test caps IO and revoked edge endpoint exact revision; no leakage.
7. Replayed receipt same revision/digest one projection, late receipt changes watermark only via real event; no duplicate effect. Feedback loop stops derived event; stale context never Fast serving.
8. Concurrent policy revocation between prepare/commit/serve, source deleted, goal changed, stale lease: deny/obsolete; no score-as-authority.
Suggested tests new trans06-polarity, trans06-propagation and trans06-ranking; existing cognition-v2-ontology, memory-attention, kernel-rules-attention plus Trans02 exact snapshot tests. Verify runner before execution. No actual code/test run.
## Feedback and rollback
P2 uncertainty about registry resolved; reuse exact receipt gate. Corrected digest distinction and context comparison. No physical energy simulation needed; current fieldEnergy can remain dormant or be removed after verified caller migration, founder decides. Numeric candidates optional, do not require new axes. All thresholds provisional, not axioms. Rollback disable experimental ranking/consumer, registry existing approved path unchanged, retain records/evidence. P4 must trace actual composition root, domain read service and business graph/installer; P5 simulation with three enterprise fixtures and measures. Remaining full caller scan and canonical 48 blocks, ABI/migration and real tests.
## Reaudit
Architecture 9.4 granularity 8.7 anchors 9.3 hunks 8.7 wiring 8.7 tests 8.8 autonomy 8.6 rollback 8.9 = 8.8875/10. Documentary self-score, not independent certification. No functional edits, no main/other branch writes.
