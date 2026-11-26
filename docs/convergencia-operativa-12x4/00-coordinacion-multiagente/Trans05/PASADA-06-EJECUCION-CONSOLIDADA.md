# Trans05 — pasada final / contrato de ejecución
## Estrategia y precedencia
Founder CAMPAIGN + P10 compiler > este documento > P5 > P4 > P3 > P2 > P1. Trans01–04 contracts must be reconciled against integrated SHA, not assumed implemented. No new runtime, agents, domain SOPs or UX. All changes here documentary. Twelve phases x four blocks: each phase execute diagnosis, patch, independent review, hardening; evidence per block, not four simultaneous edits. 
## Final diagnosis
domain cognition-v2.ts 9a65f5f0 strict identity lacks thread; slowOutput only hypothesis/inference/unknown; record verified_fact requires receipt, not enough to verify actual effect; edge enum already supports supports/contradicts/derived_from/about/supersedes/attends_to. Reuse these rather than invent extracted_from/approved_as; publication lineage in sidecar. rls.ts cde12970 static table inventory, FORCE RLS tenant only, actor/thread authorization still required; add explicit optional module migration after install. No shared activation until restricted-role PG gate. Earlier P5 budget 4000 bytes is conservative starting experiment, not guaranteed 120 words or complete coverage. 
## Execution matrix (all 12 phases)
P01 baseline: pin integrated SHA, read canonical 12x4 and Trans01–04 final, enumerate actual callers and test runner; output inventory, baseline corpus, no code before authorization. P02 domain new longitudinal.ts candidate schemas, strict anchor sidecar and narrative draft, do not modify existing strict schema in place. P03 storage/projector/graph exact revision edges, scoped index, immutable annotations; use existing relation enum. P04 pure catalog twelve skills plus composite, version/digest, typed trigger and output, no tools. P05 pure selector P3 with correction precedence and bounded budgets, deterministic tests. P06 versioned Slow variant, authenticated intent journal Trans02 P04, coalescing, raw output binding, projector head CAS and cursor; reuse queue lifecycle, no direct Slow publication. P07 existing JEV fixed ontology, null/dispute preserved; no external calls without egress. P08 brief projection source-backed slots, exact refs, head/watermark, expiry. P09 thread-scoped snapshot and cache, anchor retrieval before cap, P5 pack, rederive digest/segments Trans02 P02; no network Fast. P10 source manifest/segment/extract/review/publish/match/revoke per P4; private drafts until policy and source rights certified; role/section server derived. P11 H02/H03 bounded telemetry and readiness, independent backlog and freshness. P12 corpus, ablation, security and performance gates; no deploy.
## Concrete candidate patch anchors
New packages/domain/src/longitudinal.ts (candidate path): import cognitiveRefSchema and cognitiveIdentitySchema from existing modules; keep strict schemas. 
```ts
import {z} from "zod";
import {cognitiveRefSchema,cognitiveIdentitySchema} from "./cognition-v2.ts";
const id=z.string().min(1).max(200);
export const longitudinalScope=z.strictObject({identity:cognitiveIdentitySchema,threadId:id});
export const deltaSchema=z.strictObject({
 expectedRevision:z.number().int().nonnegative(),
 watermark:z.string().regex(/^(0|[1-9][0-9]*)$/),
 skillId:id,skillVersion:id,
 proposals:z.array(z.strictObject({
  op:z.enum(["add","refine","dispute","supersede"]),
  target:cognitiveRefSchema.optional(),
  body:z.string().min(1).max(4000),
  evidence:z.array(cognitiveRefSchema).min(1).max(30)
 }).refine(p=>p.op==="add"?!p.target:!!p.target)).max(8)
});
```
Server binds expectedRevision/watermark/skill identity from job, not model authority; compare exact refs and scope, model cannot assert user correction. Separate user-authored event projection. 
New storage migration candidate (Postgres only, adapt existing Store test backend explicitly):
```sql
CREATE TABLE IF NOT EXISTS cognition_v2_longitudinal_heads (
 tenant text NOT NULL, actor text NOT NULL, thread text NOT NULL,
 revision bigint NOT NULL CHECK(revision>=0),
 watermark bigint NOT NULL CHECK(watermark>=0),
 data jsonb NOT NULL, PRIMARY KEY(tenant,actor,thread)
);
UPDATE cognition_v2_longitudinal_heads
 SET revision=revision+1,watermark=$5,data=$6::jsonb
 WHERE tenant=$1 AND actor=$2 AND thread=$3 AND revision=$4
 AND watermark<=$5 RETURNING revision;
```
Initial insert revision 0 ON CONFLICT DO NOTHING; CAS only inside projector inbox transaction, verify transaction propagation before wiring. No numeric JS conversion of bigint; decimal strings. Head data contains refs not transcript. Separate append-only annotation and source manifest tables require exact schema design in implementation; index tenant/actor/thread/state, immutable revision keys. Extend rls.ts static inventory only when installed; FORCE RLS and restricted nonowner role tests. 
Runtime.ts chat insertion: authorize thread from journal before prepared; pass explicit scope to new preparedLongitudinal method, no optional fallback to actor-only when enabled. Existing prepared unchanged. Cache key includes policy/head/source/narrative/assignment revisions and budgets. Before dispatch validate exact source and snapshot digest; abort future stream on revocation. Voice uses same authorized serving boundary after adapter certification. 
Slow.ts terminal lock already exists; new variant emits validated proposal event in same tx, projector CAS publishes head after source refs visible; stale proposal records obsolete, bounded recompute, no feedback self-trigger. Preserve old slowOutputSchema and old queue jobs. No invented event names added to closed bus without schema/owner approval. 
P10 implementation order: authorized source manifest, provenance segmentation P4, extraction draft parser, dedup proposals, reviewer CAS, published head, deterministic eligibility then semantic ranking, snapshot integration, revocation. Existing RAG top5 not extraction engine; no raw PDF decoding or live voice consent reuse. 
## Dependency barriers
B1 pure schemas/catalog/selector/segmentation/fixtures independent; B2 Trans02 authenticated journal and snapshot integrity, Trans01 event/outbox and authority contracts; B3 Trans03 source/media/receipt ports and Trans04 RLS/H02/H03; B4 integrated synthetic gate. Missing ABI -> implement pure tests and blocked adapter, no fake success or cast. No cross-branch edits without owner reservation. 
## Simulation and adversarial feedback
Trace early axiom→journal→skill→proposal→projector→head→brief→snapshot→Fast; correction wins stale CAS; revoked source denies old brief; same query other thread cannot reuse; accepted receipt never delivered; source book conflicting enterprise fact omitted; compiler overload does not starve chat; crash replay no duplicate head; unknown JEV trigger-only; disabled feature preserves legacy. P3 selector must validate input and correction precedence before score; P4 segmenter test Unicode and offset mapping; P5 pack framing overhead and mandatory coverage explicit. No tests actually executed.
## Certification and rollback
Use existing root runner after verifying scripts; add focused tests only following repository convention. Test pure schema/selector/segment/pack, PG concurrent CAS/RLS, journal replay, snapshot integrity, revocation, source publication, role spoof, provider timeout, 10k/50k/100k/500k synthetic corpus, baseline and ablation, compiler concurrency. Record exact SHA, commands, logs, counts, skipped and blocked; PASS only actual evidence. Proposed P5 thresholds subject to baseline approval. Disable admission, serving and publication independently; drain/cancel new jobs, retain immutable revisions/tombstones; never destructive rollback. 
## Final self-assessment
Architecture 9.5; granularity 9.2; anchors 9.4; code hunks 9.0; wiring 9.2; tests design 9.3; autonomy 9.1; rollback 9.3; mean 9.25. Documentary score only, not independent certification. Remaining exact migration DDL for all sidecars, provider ABI, integrated branch tests, individual canonical 48 block audit. No functional code modified. 
