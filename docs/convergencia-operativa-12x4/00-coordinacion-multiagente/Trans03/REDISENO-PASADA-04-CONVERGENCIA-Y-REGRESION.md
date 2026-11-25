# Pasada 04 — convergencia, regresión y contratos
Prevalece sobre P01–03 en conflictos. Leídos los doce PATCHSETS canónicos, contrato c791643d, wiring faa6834b, Trans01 V3 0ef3132b y handoff Trans04 46a704d4. No afirmar lectura de los 48 README individuales. No modificar canónica. 
## Estrategia y feedback
La pasada 03 separó efecto y cache, pero dejó un agujero: un wrapper legacy execute que pierde discriminante puede seguir siendo llamado por ActionService. La solución no es cambiar todos los callers a ciegas: composición explícita por perfil y gate que demuestra que governed nunca usa wrapper. E03 es propuesta, no ABI existente. H03 tampoco confirmado. Canonical permite Fast propuestas tipadas, founder reserva propuesta a Slow; bloquear esa ruta sin alterar legacy hasta decisión. No sustituir scopes existentes por un mapa que inadvertidamente amplíe acceso.
## Matriz 48 requisitos (P1/P2/P3/P4 por fase)
01 f9c35e86: inventario SHA/tenant/backend P13; factory P11 con Trans02; bypass/scope P02–03 y P06; PG/replay P14.
02 1d7a6450: inventario labels P13; spans H03; doble conteo P13; collector fail P14.
03 2543813d: FAST/SLOW perfiles P11; JEV/media/Composio P11 BLOCKED_EXTERNAL cuando no ABI; abort/cuota P11; sandbox/kill switch P14.
04 4680b534: bindings y firmas P01/P05; inbox→SOP→approval→receipt P05/P06; dedupe/accepted vs delivered P06; falsificación/replay/timeout P14.
05 e17ca977: scopes/Docs P02/P03/P09; cinco slices P07–10 (Docs export existente, create/update BLOCKED_SCOPE); ACL/refresh/Composio P02/P03/P09/P11; revocación/429/sandbox P14.
06 2157880a: upstream/licencia P13 Trans04; fixture seed/parser P13; schema/secret/clock P13; aislamiento y replay P14.
07 28a8883c: bundle owner real Trans04; provision y consent Trans04; carreras Trans04; sandbox P14, no apply real.
08 21b94c1d: tarball/SBOM P12; registry y evidence P12; egress y permisos P12; aislamiento/rollback P14.
09 e6edf467: señales P13; dashboards H03; denominadores P13; incidentes P14.
10 b21f3b3d: upstream/contratos deferred founder; adaptador/SOP deferred; precisión/periodo fixture conceptual sin dominio; no pago ni declaración. No marcar PASS.
11 0ea3e481: inventario dominio deferred; recompilación deferred; referencias/ACL regression P14 sin nuevo SOP; rollback existing only.
12 cfed6550: gates P14; ejecutar P14; auditor independiente P14; PG/canary/restore P14. Cada fase conserva P1–P4; scope deferred no equivale a cobertura implementada.
## P01/P04: corrección de compatibilidad
No modificar error message usado por UI sin buscar consumidores. Transport returns existing typed result, unknown marker wins over status. Introducir prueba table-driven (candidate):
```ts
for(const status of [408,429,500,503]){
 // mock fetch returns Response with status, count calls
 // assert.rejects(write(), e=>e.code==="outcome_unknown")
 // assert.equal(calls,1)
}
```
No cambiar read retry global; validate redirect/allowlist on provider-config boundary, not user inputs. P01 preserve Meta/Evolution existing APIs and ID normalization; no markRead as delivery.
## P02/P03: recheck no widening
Keep existing exact write scopes for legacy. New operation-specific check is intersection of existing grant and new required map, not replacement. GoogleAuth accessTokenFor candidate private server closure: check expected connection and generation from connection(owner), await accessToken, recheck current connection, scope and actor. No generation comparison to token expiry. Singleflight process-local only; multi-process refresh token rotation requires Store CAS or distributed serialization owned by Trans01. Never overwrite newer refresh token with stale result. If no CAS revision, block shared refresh rotation until contract. Tests two workers, token rotated, disconnect/reconnect, stale credential, membership outage. Do not hold DB lock over HTTP.
## P05/P06: WhatsApp replay boundary
Same provider ID across accounts/tenants must be distinct; same account binding reused by two tenants must deny configuration, not route first match. Webhook batch partial accepted response requires replay-safe each item. Guard immutable payload before queue. Reconcile unknown only via original operation binding; operator statement reported. Existing sender ledger remains authority; E03 references attempt ID. No fallback Meta→Evolution on unknown. Test same ID cross-account, ambiguous binding, partial batch, sender switch after timeout, no duplicate.
## P07–09: E03 proposed bridge and regression
Trans01 V3 business receipt requires operation, tenant/owner/actor, capability, policyRevision, binding generation, input digest, state and evidence. Trans03 supplies family payload only; never constructs authoritative envelope from model input.
```ts
type FamilyEvidence =
 | {family:"gmail";messageId:string;threadId?:string}
 | {family:"calendar";calendarId:string;eventId:string;operation:"create"|"update"|"delete"}
 | {family:"drive";fileId:string;operation:"rename"|"trash"}
 | {family:"whatsapp";provider:"meta"|"evolution";providerId:string;attemptId:string};
type AdapterEffect =
 | {state:"simulated";summary:string}
 | {state:"accepted";evidence:FamilyEvidence;summary:string};
```
Candidate discriminant only, validate provider names against actual types before merge. Failed/unknown are classified by existing kernel boundary, not successful return. No summary in authoritative evidence digest; canonicalize typed fields and envelope. Receipt verifier checks original binding, scope, operation, exact IDs; accepted not confirmed. Gmail no delivery; Calendar create/update resource readback can confirm existence/revision not invite delivery; delete/trash need stronger provenance than 404; WhatsApp status webhook only if verified and matched original attempt; Drive RAG ACL current. Sample never accepted. Preserve execute wrapper for legacy, but governed composition must bind executeEffect explicitly and typecheck. Test compile-time adapter assignment and runtime spy wrapper=0. If E03 not merged, do not enable governed effect. Cache failure after remote acceptance emits bounded degraded signal and recovery from receipt, no second dispatch.
## P10 Places
No leads verified; read result only. Reject invalid limit/shape, dedup stable placeId, preserve empty semantics verified upstream. Quota/egress before call; no contact. Test provider empty/malformed and two tenants.
## P11 profile/media/JEV
No fallback cross-lane or tenant. ProviderSpec existing enum, use existing tenant config resolver; Trans04 owns secrets and allowlist. JEV gate existing, Trans02 owns evidence/quota. Voice coordinator existing consent/epoch, media absent. Composio absent verified ABI, no generic proxy. Simulate slow saturation and revoke: Fast still responds from authorized snapshot, no stale media, no cross-lane secret. No new provider until sandbox evidence.
## P12 cyber
Require production project callback and same Store tx, safe cursor, one-use grant no retry, lease/fence Trans02. SDK provenance SBOM Trans04. No remediation. Tests missing project, hash conflict, ACK loss, unsafe sequence, scope mismatch, revoke. Existing reported_fact remains reported.
## P13 H03 proposed ABI
Do not add second metrics registry. Proposed payload for owner review:
```ts
type IntegrationSignal={provider:"google"|"meta"|"evolution"|"jev"|"media"|"cyber";
 stage:"admission"|"dispatch"|"settlement"|"reconcile"|"cache";
 outcome:"denied"|"accepted"|"confirmed"|"unknown"|"failed"|"degraded"|"simulated";
 elapsedMs:number};
```
No IDs, URL, message, token, arbitrary labels. Validate finite elapsed; sink exception cannot affect execution. Attempt counter at dispatch, terminal counter only winning CAS postcommit; receipt replay not another effect. Trans04 owns names/buckets/OTLP; until H03 agreed use no-op test port, no production metric claim. P13 fixtures deterministic seed/clock, two tenants, no real credentials; parser owned Trans04.
## P14 regression and rollout
Wave A transport/binding/Places + fixtures, no new effect. Wave B WhatsApp and Workspace structured result behind explicit governed profile, E03/A02/A03 prerequisite. Wave C profiles/cyber with Trans02 and Trans04. Wave D PG restricted, sandbox approved, gate. Negative gates: no Fast effect, no persona permission, no cross-tenant receipt, no false fact, no replay effect, no fallback. Existing tests focal plus new fault matrix. Record SHA, command, backend, exit, skips, artifacts. Rollback disable governed profile and stop new dispatch; preserve ledger/receipt, reconcile unknown; never auto-fallback. Legacy sample behavior preserved. 
## Autocrítica
New angle caught scope widening, multi-process refresh, ambiguous provider binding, legacy wrapper bypass, and family evidence vs kernel envelope. 48 patchset requirements mapped, individual block README not audited. No compilation/test execution or upstream verification. E03/H03 proposals remain owner-dependent; no GO.
Scores architecture 9.5, granularity 8.9, anchors 9.2, hunks 8.8, wiring 9.1, tests 9.0, autonomy 8.9, rollback 9.2; mean 9.075.
