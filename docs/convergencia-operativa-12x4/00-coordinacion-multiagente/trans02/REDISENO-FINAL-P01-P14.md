# Trans02 — pasada final: entrada de ejecución consolidada
Estado documental candidato; código no aplicado. Precedencia: este documento > M3 P01/P02 > T4 > T3 > T2; los documentos históricos conservan evidencia. No altera canónica ni autoriza ejecución. Fast conversa, Slow propone, JEV clasifica, kernel autoriza, runtime ejecuta. Ningún dominio empresarial nuevo.
## Secuencia y barreras
P10 preflight + P09 fixtures → P03 → P02 → P01 → P04 → P06 → P05 → P07/P08/P11 → P12/P13 → P14. P01 puede prepararse en paralelo sin activación. Cada PR contiene test y rollback; no activar feature hasta gate. Dependencias externas se aíslan mediante puertos default deny; nunca simular éxito real.
## P01 selector
Aplicar M3 P01 factory sobre agent.ts 503e0c7e. AGUI explícito conserva prioridad; V2 opt-in requiere scope autenticado; legacy opt-out. No fallback tras inicio de stream. Persona LAIA actual, no crear registry de agentes ni aceptar persona del cliente. Test opt-in/opt-out/remote/anonymous/revoke. Rollback factory.
## P02 contexto y atención
Aplicar M3 P02 serializer, digest, TTL, exact refs, ledger pending-only. En attention.ts 45312a2f reemplazar read completo por candidato:
```ts
async read(identity: CognitiveIdentity, id: string) {
 await this.context.assertAuthorized(identity);
 const [row] = await this.context.projections.db.rawQuery<{data: unknown}>(
   "SELECT data FROM cognition_v2_attention WHERE tenant=$1 AND id=$2 AND actor=$3",
   [identity.tenantId,id,identity.actorId]);
 if (!row || !row.data || typeof row.data !== "object") return null;
 const d = row.data as Awaited<ReturnType<GlobalAttentionWorkspace["select"]>>;
 if (digest(d.identity)!==digest(identity) || d.algorithmVersion!=="attention-v2.2" ||
     typeof d.contextSnapshotId!=="string" || !Array.isArray(d.selected)) return null;
 const s=await this.context.readSnapshot(identity,d.contextSnapshotId);
 if (!s || d.expiresAt!==s.expiresAt || d.sourceWatermark!==s.watermark ||
     d.selected.length!==s.refs.length) return null;
 for (let i=0;i<s.refs.length;i++) {
   const ref=s.refs[i], item=d.selected[i];
   if (!item || item.id!==ref.id || item.revision!==ref.revision ||
       !Number.isFinite(item.score)) return null;
   const record=await this.context.resolve(identity,ref.id,ref.revision);
   if (!record || digest(item.signals)!==digest(record.signals) ||
       item.epistemic!==record.epistemic) return null;
 }
 if (digest({identity,algorithmVersion:d.algorithmVersion,contextDigest:s.digest,selected:d.selected})!==id) return null;
 return row.data;
}
```
Preserve public response shape (unknown typing may require existing DTO at route); structural parse before digest, no raw query persistence. Score is advisory, never authority. Test altered selected, reordered refs, revoke, expired, same scorer. Rollback attention feature off.
## P03 graph and evidence
Apply T4 graph and T3 storage/projector/presenter hunks. Exact kind/revision, bounded graph, no phantom edge, no hint on revoked apply. RuntimeOutcomeProjector 6bedfe59 remains slow-only. Other families must not call fromSlowReceipt or cast domain. Introduce local candidate port (no domain schema change until Trans01 reservation):
```ts
type EvidenceDecision = {state:"denied"} | {state:"reported"; receiptId:string; operationId:string; status:"accepted"|"unknown"|"failed_without_effect"|"confirmed"; evidenceDigest:string};
type ReceiptReader = (identity:CognitiveIdentity, receiptId:string)=>Promise<EvidenceDecision>;
const denyReceipt:ReceiptReader=async()=>({state:"denied"});
```
Even confirmed remains reported until family verifier approved; no verified_fact without existing verifier. Read receipt from durable Trans01 port, check tenant actor policy operation family and digest; no raw caller payload. P07/P12 reuse. Test forged/missing receipt, wrong tenant/revision, duplicate and revoke race. Rollback family adapter off, retain journal.
## P04 Slow
Apply T4 validation before persistence and output_context_digest additive migration. Existing slow-observation.ts 09c39a22 accepts arbitrary prompt with boolean grant: preserve manual compatibility default deny, automatic entry must render fixed server template, not accept prompt from Fast. Candidate new method on bridge:
```ts
async observeAuthorized(input:{identity:CognitiveIdentity;sourceId:string;sourceRevision:number;operationId:string}) {
 return this.observe({...input,prompt:"Analiza la evidencia autorizada. Distingue hechos, hipótesis e incertidumbre. Propón conocimiento; no ejecutes acciones."});
}
```
Mount only internal producer with verifier resolving persisted receipt and source digest; existing manual caller not mounted as automatic. OperationId from authoritative event, never Fast. Human intent admission separate from mutable threads; authenticated envelope via Trans01 outbox, consume in worker, no Fast tool. Until ABI agreed no auto consumer activation; manual analysis continues. Existing enqueue key prevents duplicates, require same tx inbox/job or replay idempotent enqueue before ACK. Tests prompt injection, repeated event, revoked source, fabricated evidence, output retry, lease fence. Rollback stop automatic consumer, preserve queue.
## P05 telemetry
Use T2 H02 port with no-op and isolate sink errors:
```ts
type Signal={lane:"fast"|"slow"|"projection"|"delivery"|"receipts"|"jev";outcome:"ok"|"denied"|"timeout"|"failed"|"uncertain";elapsedMs:number};
type Sink=(signal:Signal)=>void;
export function observeSafely(sink:Sink,signal:Signal):void {
 if(!Number.isFinite(signal.elapsedMs)||signal.elapsedMs<0)return;
 try{sink(signal);}catch{/* telemetry never changes execution outcome */}
}
```
Trans04 supplies bounded synchronous enqueue, not exporter. Instrument post-commit terminal transitions, attempts separately; no tenant/text labels. Do not register second registry. Test throw/saturation/replay/slow lane independence. Rollback no-op.
## P06 JEV and inference
Apply T4 egress lock and output validation. In inference.ts a1d8f645 move now/day/expires declarations inside transaction immediately after SELECT FOR UPDATE; recheck signal after lock, reject capacity/dailyLimit<=0 before admission. Prevent quota rollover from stale pre-lock clock. Do not release remote uncertainty as confirmed cancellation: retain slot on timeout/cancel until existing expiry, and require provider-side concurrency bound before production egress. Candidate change:
```ts
let uncertain=false;
// in outer try/catch before finally:
 // catch(error) { uncertain=controller.signal.aborted; throw error; }
// in finally:
 // if(!uncertain) await this.db.rawQuery(existingDelete,existingParams);
```
This bounds local admission only, not remote execution; no automatic retry on unknown provider effect. JEV tenant-specific gate and consent, fallback proposed only, no Fast/Slow fallback. Tests lock wait midnight, abort before dispatch, provider ignores abort, quota, late receipt. Rollback disable external JEV.
## P07 WhatsApp
Use P03 port, existing adapter only. Map accepted/unknown/confirmed to reported transport state; verified delivery requires approved receipt family. No second send. Fixture duplicate inbound→governed operation→receipt→card→Fast; forged receipt and unknown must not imply delivery. Rollback disable projection only.
## P08 RAG
rag.ts 1c90540f: change record ID to digest(["rag-v2.1",referenceId,hit.id,hit.text,identity.policyRevision]); replace signals.relevance with 0 (query ranking remains existing lexical scorer; evaluate recall before activation). Keep old IDs historical; exclude old prepared records from new selection via version-aware migration/revocation, never silently overwrite. Existing valid checks sourceVersion; add local ACL port default deny for external connection sources before activation. No remote search on Fast. Test same hit different scores, policy change, source revoke, cross tenant, repeated prepare. Rollback disable new prepare, preserve records.
## P09 fixtures
Reuse parseVerticalSliceBundle; deterministic fixture manifest digest of schema/seed/source SHA. Two tenants same actor/source IDs, contradictory cards, revoked refs, three receipt states. Use existing test fixture builders, no new provisioner. Assert deterministic digest, no network, no production import.
## P10 RLS
rls.ts cde12970: add read-only preflight candidate:
```ts
export async function assertCognitionRls(db:Store, modules:{voice?:boolean;cyber?:boolean}={}) {
 if(db.backend!=="postgres")throw Error("COGNITION_RLS_REQUIRES_POSTGRES");
 const [role]=await db.rawQuery<{rolsuper:boolean;rolbypassrls:boolean}>("SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user");
 if(!role||role.rolsuper||role.rolbypassrls)throw Error("COGNITION_UNSAFE_ROLE");
 for(const table of [...cognitionTables,...(modules.voice?voiceTables:[]),...(modules.cyber?cyberTables:[])]) {
  const [r]=await db.rawQuery<{enabled:boolean;forced:boolean;owns:boolean}>(
   "SELECT relrowsecurity AS enabled,relforcerowsecurity AS forced,pg_has_role(current_user,relowner,'MEMBER') AS owns FROM pg_class WHERE oid=to_regclass($1)",[table]);
  if(!r||!r.enabled||!r.forced||r.owns)throw Error("COGNITION_RLS_UNSAFE");
 }
}
```
Run as runtime role not migration owner; verify policy expressions and restricted PG two-tenant tests separately. Never enable shared mode on preflight alone. Rollback shared flag off, keep RLS.
## P11 cyber
Existing event-relay.ts 81bbd950: cognitive composition requires project callback before constructing relay; generic relay unchanged. Same Store transaction for inbox and journal, durable consumer lease/fence before cursor, ACK only after commit, no exactly-once claim. Test missing callback, rollback, lost ACK, concurrent consumer, revoked principal. Stop relay on rollback, keep cursor.
## P12 gestoría
No new adapter/domain in current core scope. P03 default deny port and synthetic receipt contract tests only; production family remains off until separately approved. No tax/payment action, no verified business outcome. This is scope isolation, not fake implementation.
## P13 memories
Apply T4 versioned autobiographical ID with ordered exact evidence and policy revision; preserve five memory kinds. Supersession filter before selection: group only aggregates of same actor and same logical episode IDs, select newest authorized revision set; incomparable sets remain distinct, no destructive rewrite. Test permutation, revision, revoke, replay. No enterprise recompiler in current scope. Rollback new aggregation off.
## P14 gate and handoff
Commands from existing T2 plan: pnpm typecheck; ALLOW_NETWORK=0 pnpm test:cognition-v2; pnpm gate; pnpm verify:slice; pnpm gate:cognition-v2. Run focused suites per changed symbol before full suite; capture SHA, exit, skips, backend, Node, artifact digest. Restricted PG required, sandbox provider gate separate. Fault matrix: duplicate, crash pre/post commit, stale fence, revoke midstream, Slow/JEV unavailable, exporter down, unknown provider, restore/replay. No weakening gate. Trans01 reviews authority, Trans03 provider ABI, Trans04 metrics and certification. Documentary candidate not runtime GO.
## Self-evaluation
Architecture 9.4; patchset granularity 8.8; real code references 9.2; concrete code 8.7; transversal wiring 8.6; tests 9.0; autonomy 8.7; rollback 9.1. Mean 8.9375. Candidate hunks not compiled, external ABI and several exact callsite diffs remain unverified. No claim of 9.2 or independent certification.
