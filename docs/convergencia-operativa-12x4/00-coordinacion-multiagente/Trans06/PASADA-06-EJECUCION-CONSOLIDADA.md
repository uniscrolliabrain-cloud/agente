# Trans06 — Pasada 06: ejecución consolidada, cierre documental y barreras
26-11-2026. Baseline funcional main 93236a34b2d636debb340bba70cd9c9bbf9cf441. Founder validó el mandato conceptual y el inicio documental, no despliegue ni cambios funcionales. Precedencia founder > CAMPAIGN > este documento > P5 > P4 > P3 > P2 > P1. Mantener todas las pasadas como evidencia y detalles de pruebas. No declarar finalizados los 48 bloques de implementación.
## 1. Decisión arquitectónica definitiva de esta campaña documental
El núcleo inicial es el founder. Todo, positivo y negativo son relaciones de perspectiva; estado manifiesto y latente, atracción/repulsión, retirada/creación de espacio y espiral 0–8 son hipótesis de organización, no ley física ni requisitos de runtime. El lenguaje profesional sigue siendo lenguaje; las representaciones estructuradas y las operaciones se vinculan mediante contratos. La compilación personaliza las empresas, no el kernel. Preservar el experimento futuro de las tres empresas propias. No fijar nueve axiomas, nuevos ejes ni umbrales como verdad. No duplicar el sistema.
Elección concreta para primera implementación autorizada: PURE FIRST, NO NEW STORAGE. Emplear seis polos aprobados de CardOntologyService y ChromaticOntologyRegistry existentes. Mantener CROMOS_PENDING_V1 hasta demostrar necesidad y migración; no activar fieldEnergy ni cromo contenedor genérico. No usar scores como policy. P2 draft y P3 funciones son scaffolding puro experimental, no campos persistidos en CognitiveRecord ni nuevos tipos de evento. La versión mínima podrá concluir que no hace falta sidecar. Si se demuestra utilidad de evaluación multiwhole que no cabe en la card, presentar ADR y reserva Trans02/05/04, antes de persistencia. Así se evita que una hipótesis abierta bloquee las otras cinco ramas.
## 2. Preflight y evidencia exacta
Releídos CAMPAIGN y P1–P5, especificaciones finales de las otras ramas: Trans01 blob 0ef3132b, Trans02 cb2476af, Trans03 f44858ae, Trans04 3c022080, Trans05 c863ac77. Baseline neutral main: app.ts 6bdb5675, runtime.ts 32a65f0b, attention.ts 9342866a, context.ts 539e6bed no se deben sustituir por hunks sobre otros blobs sin rebase auditado. Canonical CONTRATO c791643d y WIRING faa6834b, Fast propone en WIRING diverge del founder: Fast comunica, Slow propone. No modificar canónica. Root AGENTS.md no encontrado (404), localizar instrucciones aplicables por árbol antes de escribir código, no inventarlas.
Anclas reales: domain/cognitive-reference.ts b5b3e5a1, cognition-v2.ts 9a65f5f0, card-ontology.ts e6f496d4, registry ce5d5268, CardOntologyService 4aa04bdc, business/graph fc6bcd22, business-routes ffe2f9e2, business-read 314cc808, projector 4e173086, storage af4a25c9, db-tenant 581b242b, RLS cde12970, bundle 6e74c61b, package 8e490918. TenantScopedStore.compareAndSwap exists and resolves owner key, transaction delegates fn(this); no proof all BusinessGraph callers use it (app mounts raw db), no transplant. StateMachineRegistry apply roleId mismatch with patch.actor remains Trans01 reservation. Shared RLS tenant only; actor ACL still necessary. 
## 3. Matriz ejecutable P01–P12 y 48 bloques
Cada fila A/B/C/D define trabajo, no evidencia ejecutada. Cada bloque requiere inventory/diff/test/rollback; B solo con autorización funcional. No modificar código de otro propietario.
| Fase | A diseño y baseline | B patch/test candidato | C reauditoría | D hardening/aceptación |
|---|---|---|---|---|
| P01 | pin integrated SHA, C05 y reglas reales | inventario imports/callers y tests | reconciliar diferencias por blob y ownership | no duplicate engines; baseline artifact |
| P02 | separar 5 dimensiones | new pure module draft/check P2 + exact negative tests | refactor tipos redundantes; parse strict | unknown fail closed, no allow result |
| P03 | registry existing, contextual binding | describePair + comparability P3; guard registry owner | both high vs zero, null vs zero, relative scale | approval exact/version/revoked, no forged receipt |
| P04 | CROMOS_PENDING y C05 | no activation; pure seam only; migration proposal if justified | compare reuse vs retirement | no old callers broken; founder decision |
| P05 | current ranking facade Trans02 | candidateRank optional only after reservation | A1/C/D ablation and mandatory refs | disabled equality; latency/budget, no risk suppression |
| P06 | card schema strict + evidence | reuse existing ontology; ephemeral draft only; persistence ADR if needed | exact refs, parent/source lifecycle | revoke/expiry, no verified_fact or new kind |
| P07 | graph/domain/ACL and exact versions | governed exact entity reader P4, unavailable default | role vs actor, no raw export or phantom refs | restricted PG + field ACL; no cross tenant |
| P08 | existing SOP/capability/approval | effectInterpretation helper, connect approved ABI only | stale CAS, unknown effect, compensation separate | one governed dispatch or reconciliation |
| P09 | exact graph edge/read port | boundedReach pure P3, derived context only | cycles, diamond, cap, no self-trigger | IO bounds, replay/fence, no cascading writes |
| P10 | Slow/JEV/Trans05/serving | reuse existing job/annotation/selector contracts; no new event | context/goal/thread binding + cache/ledger | Fast no tools, no synchronous graph/Slow, revoke |
| P11 | bundle compiler criteria | pure manifest plan validator only | 3 fixtures same core, differing criteria | exact manifest digest and authority; no auto apply |
| P12 | oracle, A1 comparator, holdout | P5 focused/PG/gate tests | faults, performance, independent audit | NOT_CERTIFIED until actual integrated evidence and founder GO |
## 4. Concrete patch instructions and corrections
### Independent P02/P03/P09
Candidate files packages/domain/src/organizational-primitives.ts for schemas and pure checks, apps/server/src/kernel/cromos/logic/organization.ts for pure algorithm helpers only if no duplicate implementation; choose one pure module as preferred first patch (domain module) to avoid fragmentation. Tests tests/trans06-primitives.test.ts and tests/trans06-composition.test.ts. Copy P2 organizationalAssessmentDraftSchema and summarizeChecks, P3 describePair/boundedReach and P5 coverage; no barrel exports until caller approved. All numbers finite/safe bounds, parse input at boundary, no model contextDigest or authority. Use existing cognitiveRefSchema exact refs; additionally reject unsafe integer revision at experiment seam without changing global schema. Required list server-owned and exhaustive; no empty acceptance. Do not treat evaluated axis as approved by schema alone.
Correction to P3 traversal: compare/canonicalize adjacency once in authorized reader (unique exact ref keys, code-unit ordering); count actual edges at reader before dedupe, pure helper receives ordered unique targets; enforce max input size before allocation, depth limit explicit coverage, node/edge cap truncated. Do not throw details to Fast; translate error to safe unavailable. 
Candidate unit assertions:
```ts
assert.deepEqual(describePair({positive:.9,negative:.9}),{direction:"balanced",intensity:.9,balance:0});
assert.deepEqual(describePair({positive:0,negative:0}),{direction:"balanced",intensity:0,balance:0});
assert.equal(describePair({positive:.9,negative:null}).direction,"unknown");
assert.equal(summarizeChecks([],[]),"unknown");
assert.equal(summarizeChecks([{id:"scope",state:"satisfied"}],["scope","revision"]),"unknown");
assert.equal(candidateRank(.6,undefined,true),.6);
assert.equal(candidateRank(.6,{positive:1,negative:0},false),.6);
```
Add all P2/P3 adversarial examples. Pure module never imports db, runtime, LLM, policy, routes or telemetry; no side effects. CandidateRank must only be called by existing Trans02 rank seam with validated preselected authorized assessment, mandatory anchors handled before scoring. If base invalid, reject in experimental seam; disabled path must not call new helper if it could change legacy behavior. Experimental code no mount initially.
### Registry P03: shared patch
On ce5d5268 runtime method after db.get replace unparsed row check with P3 safeParse + id/version/status check and existing authority.verify digest exact. Preserve current approved 1.0.0 definition and bootstrap receipt, no auto-approve or draft mutation. Test wrong stored identity, malformed row, revoked receipt, same version conflict. New axes require founder separate approval. Do not change digest definition semantics without verified original hash source.
### P07/P08: owner boundary
Do not edit raw BusinessGraph from Trans06. ExactBusinessRead P4 signature as candidate; port default null, authorized field allowlist and recheck at prepare/commit/serve. Owner Trans02 with Trans01 supplies actual entity reader and CAS/outbox. Use no entity revision mapping until proven. Relation reference via authorized endpoint refs and event evidence, no new kind. BusinessGraph update optional version/put, delete cascade, relation loser returns candidate, and full list neighborhood remain risks, not proofs. Tests actual two transactions and exact evidence winner. P4 effectInterpretation pure helper only with verified server receipt; confirmed effect does not confirm benefit. No external write, no compensation from negative sign. 
### P06/P10: persistence decision and conditional design
First integrated profile uses existing card ontology and existing cognitive record proposal, no new columns, kinds, events or workers. Evaluate P2 multiwhole drafts transiently in controlled experiments; no durable production claims. Only if ablation demonstrates distinct contextual assessments needed in durable context, authorize ADR for a sidecar owned by Trans02 with Trans05 and Trans04. Proposed DDL for review (not migration to run):
```sql
CREATE TABLE cognition_v2_organization_assessments (
 tenant text NOT NULL, id text NOT NULL, actor text NOT NULL,
 card_id text NOT NULL, card_revision integer NOT NULL CHECK(card_revision>0),
 source_watermark bigint NOT NULL CHECK(source_watermark>=0),
 binding_digest text NOT NULL, payload_digest text NOT NULL, data jsonb NOT NULL,
 PRIMARY KEY(tenant,id)
);
CREATE INDEX cognition_v2_org_assessment_parent
 ON cognition_v2_organization_assessments(tenant,actor,card_id,card_revision);
```
Immutable append, id=hash canonical binding/evaluator/origin; same id different digest conflict via insertIfAbsent-equivalent SQL/reread, same tx as existing projector inbox. No second head: latest eligible parent revision from authoritative context, current policy/criteria/definition and evidence revalidate. Revocation via existing source lifecycle plus explicit dependency index/coverage ADR before install; no bypass if sidecar not included in revoke path. FORCE RLS static inventory addition only after installed, actor ACL explicit. Do not enable until actual DB tx/fence/ACL proof. No new event names defined; Trans01/02 own closed schema and migration. Snapshot rederive approved compact fields and digest including source/goal/criteria scope; no direct Fast fetch or raw provider content. 
### P11 criteria manifest 
Pure test candidate versioned data referencing template ID, approved axis identity/version/digest, goal selectors to be resolved by installer, limits and policy refs; no new tenant domains or capability definitions. No secrets or executable strings. Keep in fixture initially, do not change VERTICAL_SLICE_BUNDLE_V1 silently; Trans04 approves version extension and validates plan. Same template + changed criteria must produce explicit new reviewed revision, not overwrite.
## 5. Dependencies and parallel execution
W0 supervisor approves scope/authority ADR, pins common integration SHA and reserves shared files. W1 six agents independently prepare pure/test candidates; Trans06 P02/P03/P09 and P5 fixtures independent. W2 Trans01 A01–03,E01–03,S01 authoritative claim, outbox, receipt; Trans02 P02/P03/P04 exact context/graph/journal and P06 JEV; Trans06 registry patch only with owner. W3 Trans03 binding and receipt families, Trans04 RLS/metrics/gate, Trans05 longitudinal P02–P10. Trans06 P07/P08/P10 consumes agreed ABI, no cast, no parallel edits. W4 integrated A1 baseline vs C/D, owner review for P11 and optional sidecar; W5 combined gate then founder GO. No requirement that Trans06 blocks core closure. If dependencies unavailable, continue pure and leave disabled adapter. 
| Dependency | Owner | Required proof before Trans06 activation |
|---|---|---|
| Authority and effects | Trans01 | A02/A03/E03 approved exact operation, claim, receipt; one causal path |
| Semantic context and graph | Trans02 | P02 snapshot integrity and P03 exact evidence, P04 authenticated intent, P06 JEV |
| Provider binding | Trans03 | P07–09 family evidence, accepted/confirmed/unknown separation |
| Infra and gate | Trans04 | P08 fixtures, P12/P14 combined evidence, RLS, bounded H02/H03 |
| Longitudinal scope | Trans05 | exact thread/head/watermark, skills/brief, no duplicate selector |
| Axiomatic semantics | Trans06 | pure predicates/relative poles, optional experiment, no independent authority |
## 6. Simulation and acceptance
P5 3 synthetic enterprises, 3 seeds + holdout, A0/A1/B/C/D/E, 16 faults. Execute all applicable tests, independent oracle and paired A1 comparator. Discard bonus if no measurable utility. Missing data N/A, no skip-as-pass. Verify feature off exact, cross tenant/ACL/revocation zero leaks, no unauthorized or duplicate effect, no false confirmation, mandatory evidence preserved or degraded explicit, p95 <=1.10 A1 candidate. Distinct local/global perspectives no contradiction. Real dogfood founder after separate approval, preserve experimental axioms.
Commands from package.json:
```sh
pnpm typecheck
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test --test-isolation=none --test-timeout=90000 tests/trans06-*.test.ts
ALLOW_NETWORK=0 pnpm test:cognition-v2
pnpm test
pnpm gate
pnpm gate:cognition-v2
```
New test glob only once files created; no empty selection accepted. Explicit existing business-graph/kernel-rules-attention/kernel-consolidate/cognition-v2-ontology/security-context/rls/worker-metrics tests from P5. Verify network isolation independently. Restricted nonowner PG two processes for shared mode. Record SHA/dirty including untracked, exact command, backend, exits, counts/skips, artifact digest and reviewer. Gate currently C05 PARTIAL and NO_GO; no fake PASS. 
## 7. Rollback and closure
Disable experimental rank/consumer/serving and compiler plan feature; retain history, approval receipts, outbox and claims. Stop new writes; reconcile unknown outcomes, no re-dispatch. Optional migration additive only after ADR; rollback feature off and preserve tables until safe retention decision. No destructive reverse migration. 
Self-score architecture9.5 granularity9.3 anchors9.4 hunks9.2 wiring9.3 tests9.4 autonomy9.3 rollback9.4 = 9.35/10 documentary. Scores are internal design estimates, not audit grade of implementation. Six documentary passes completed; no functional files changed, no tests executed, no deploy. Open: full caller/import scan and 48 individual canonical blocks, shared owner ABI/actual transaction proof, optional persistence ADR, combined PG/ablation and dogfood. These are execution preflight/barriers, not silently completed work. Founder definitive 0–8 remains open.
