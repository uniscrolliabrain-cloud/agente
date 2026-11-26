# Trans04 — quinta pasada: autonomía del ejecutor
## 1 Estrategia
Entrada técnica obligatoria después de handoff. Precedencia founder/barreras > 05 > 04 > 03 > 02 > 01 > histórico. No ejecución funcional autorizada aquí. El ejecutor debe avanzar lo independiente y detener solo activación dependiente, no improvisar arquitectura.
## 2 Diagnóstico final
ci.yml 7064e59c ejecuta listas manuales y release-gate needs unit/worker pero no web/integration; deploy.yml 94225e41 usa audit:coherence, no gate-report, dispatch environment string y else production para cualquier valor distinto de preview. No modificar deploy ni dispararlo en esta campaña documental. app.ts 96b0aaf5 L413 requestLogger() sin resolver tenant, L829–830 metricsRoutes(agent,users), L1221 return sin lifecycle telemetry. gate-report 2c85a553 L419–423 main guard permite import allSteps; tests/gate/gate-report.test.ts 1aa3791e ya prueba advisory y selección vacía. No duplicar. Tree verifica tests cognition-v2-rls, cognition-v2-rls-modules, vertical-slice-bundle, vertical-slice-provision, worker-metrics, trans04-observability-contract.
## 3 Diseño ejecutable P01–14
P01 registry aplicar helpers 02, cap 03, validate histogram buckets and reserved le; test existing registry callers before strict labels. P02 exporter global token-only in shared, local legacy explicitly authorized; app mount reserve. Do not change auth middleware by assumption. requestLogger L413 currently no tenant resolver: no pre-auth DB lookup; post-auth authorized scope capture requires owner of middleware. Preserve matchedRoutes template test. P03 H01 real hook import 02, register once per app lifecycle, unregister on shutdown; global registry multiple app instances risk duplicate count. Do not register globally on module import. If lifecycle cannot be bound, leave disabled until Trans01 app/index reservation. P04 H02 and P05 H03 structural candidates 04, no fake ABI. P06 bounded queue and exporter optional, SDK pinned after review. P07 dashboards use actual family names, rates and histogram aggregation, no SLO invented. P08 fixtures independent oracle, seed and manifest. P09 bounded JSON and digest. P10 remove authoritative read catches. P11 reservation helper and scalar CAS 03, no shared activation before lease and helper transaction proof. P12 full gate validator below. P13 CI single source gate + separate web and smoke; restricted PG job candidate after backend harness verified. P14 circuit matrix 04.
### P12 exact candidate insertion
In gate-cognition-v2.ts import allSteps from ./gate-report.ts (main guard verified). Replace weak presence check with runtime validation, then:
```ts
const expected=allSteps();
const steps=source.steps;
if(!source.git?.head||!Array.isArray(steps)||steps.length!==expected.length)
 throw Error("Full gate required");
for(const spec of expected){
 const matches=steps.filter(s=>s.name===spec.name);
 if(matches.length!==1)throw Error("Missing or duplicate gate step");
 const s=matches[0];
 if(s.kind!==spec.kind||s.blocking!==spec.blocking||
    s.ok!==(s.exitCode===0))throw Error("Invalid gate step");
}
const repositoryGateOk=steps.every(s=>!s.blocking||s.ok);
```
Extend parsed source schema to kind/blocking/counters/git.dirty before this hunk; validate boolean and exitCode types, logs and hashes per 04. Full gate may fail and still be valid evidence; never throw solely because step failed. Preserve NO_GO exit1 and malformed exit2. No overwrite historical acceptance with PASS. gate-report add run manifest and clean status incl untracked in isolated checkout, not break dev partial gate. Tests existing advisory plus new malformed/duplicate/stale/partial/zero-test.
### P13 CI candidate replacement
In ci.yml unit replace manual typecheck/test/audits block only after proving gate allSteps equivalent; preserve server explicit typecheck if distinct. Candidate YAML:
```yaml
      - name: repository gate
        run: pnpm gate
        env:
          ALLOW_NETWORK: "0"
      - name: vertical slice smoke
        run: pnpm verify:slice --only smoke
```
Keep worker/web jobs until equivalence measured; release-gate needs web and integration if main-only condition same, but do not claim release ready. Artifacts upload only after redaction review, no raw secret-bearing logs; pin action SHA after verification, no guessed SHA. CI network flag not actual sandbox. New restricted PG job must use disposable database, migration role separate runtime, no real secrets. deploy.yml environment input candidate type choice options preview/production and explicit shell case deny unknown, env interpolation via env not shell template; production approval separate founder decision. Do not change deployment workflow without explicit authorization. No tag or workflow dispatch.
## 4 Simulación
Executor without E03/H02/H03: independent P01/09/10/12 and fixtures proceed, no activation. Duplicate app instance: one sink per lifecycle, no global import. CI partial: valid dev evidence but not certification. Unknown deploy environment: deny, never production fallback. Gate advisory red: report separate. Missing web test: no release certification. PG owner: invalid evidence. Restore: outbound disabled. Complete provision replay: no writes. 
## 5 Feedback
Earlier CI plan assumed gate already wired; actual workflows still diverge. Earlier sink registration lacked lifecycle ownership. Earlier full gate validation conflated failed run with invalid evidence; separate. Earlier score does not prove runtime readiness. 
## 6 Ejecución y reauditoría
Wave A P01/P09/P10/P12 and P13 empty --only fix, focused tests. Wave B P02/P03 after mount reservation; P04/05 after ABI; P06/07 after metrics semantics. Wave C P08 fault harness then P11 local reservation and PG race; P13 CI isolated. Wave D P14 combined SHA, independent auditor. Commands from repo: pnpm typecheck; ALLOW_NETWORK=0 pnpm test:cognition-v2; pnpm gate; pnpm verify:slice; pnpm gate:cognition-v2. Focused candidate command node --import tsx --import ./tests/setup.ts --test tests/gate/gate-report.test.ts tests/trans04-observability-contract.test.ts tests/vertical-slice-bundle.test.ts tests/vertical-slice-provision.test.ts tests/worker-metrics.test.ts. Verify runner flags against package before use. Rollback disable sink/export/shared apply, preserve journals and receipts; no fallback dispatch. Record SHA/exit/backend/skips/artifacts. No tests executed, no functional edits. Remaining 48 README individual audit, exact helper transaction and external SDK, owner ABI and lease. Self-score architecture 9.5, granularity 9.1, anchors 9.4, code 9.0, wiring 9.2, tests 9.2, autonomy 9.2, rollback 9.3 = 9.2375. Documentary estimate, no independent certification.
