# Trans04 — pasada 01, diagnóstico integral y estrategia
Rama activa Trans04 (mayúscula), carpeta trans04. Handoff histórico casing incorrecto; no editar rama histórica. Core generalista, no nuevos dominios/SOPs/UX. Solo documentación. Anclas: registry 6e048687, exporter ca222271, gate-report 2c85a553, gate-cognition d8b92400, provision 3ae48b168, bundle 6e74c61b, T01 contratos 0ba151ce, T02 reconciliación 86b98cb5. Preservar correcciones HTTP template y p99 existentes, verificar tests trans04-observability-contract.
## Estrategia
Infra no es autoridad: medir transición ya decidida, no alterar receipt. Tres planos independientes: evidencia durable ACL, métricas operativas agregadas, trazas técnicas efímeras. Certificación solo evidencia reproducible SHA combinado, no dashboard verde. Fixture virtual clock nunca controla leases/TTL reales. Plan no escribe; apply real fuera de alcance. 
## P01 registry
labelKey L13 concatena valores sin escaping: colisión entre etiquetas y texto con comillas/comas. Candidato sustituir por JSON.stringify(Object.entries(labels).sort(([a],[b])=>a<b?-1:a>b?1:0)); render debe usar escape Prometheus independiente, no reutilizar key. Validar finite values, nonnegative counter, buckets sorted unique finite, label names; clone labels al insertar para evitar mutación externa. No cambiar métricas existentes sin inventario de callers. Limitar series por familia y reportar drops con contador fijo sin recursión. Tests collision, newline, backslash, mutable labels, NaN, cap, scrape unchanged.
## P02 exporter
metricsRoutes usa token o admin y query tenant; admin de empresa no equivale a platform admin. Verificar montaje y principal antes de cambiar. Separar scrape global con token dedicado y vista tenant autorizada con scope server-derived; nunca confiar query para autorización. No exportar tenant IDs al collector externo. Preservar filtro p99 y tests existentes. Token comparison constant-time candidato, no log token. Test admin A solicita B, no token, valid token, empty registry, repeated scrape.
## P03 H01
Trans01 owns hooks after commit; no second bus. Kernel decision/attempt/terminal separately; trace links across durable boundaries, not event ID as span ID. Sink sync no-op on failure; no business IDs in external labels. Confirm actual hook ABI before registration.
## P04 H02
Trans02 owns fast/slow/projection/delivery/receipts/jev signals. Distinguish first token, terminal, queue wait, lag durable, rendered/ACK not user receipt. No tenant IDs. Measure durations monotonic, lag wall timestamps with negative clock skew invalid. No await exporter.
## P05 H03
Trans03 pasada 04 proposed IntegrationSignal provider google/meta/evolution/jev/media/cyber; stage admission/dispatch/settlement/reconcile/cache; outcome denied/accepted/confirmed/unknown/failed/degraded/simulated. Accept bounded finite elapsed, no payload; separate attempt and terminal winning CAS, no replay double count. Owner ABI still proposed. No-op until confirmed.
## P06 OTLP
Existing globalMetrics only Prometheus; traces SDK separate, batch bounded, timeout, loss counter, flush deadline, disabled default. No lockfile change until SDK version/license/security confirmed. W3C validate traceparent, no baggage; no arbitrary headers. Collector down must not block Fast/runtime. No exporter network from tests. 
## P07 dashboards/SLO
Use histogram_quantile over summed buckets, not average p99 gauges. Distinguish availability/latency/unknown/lag and denominator zero no data. T02 PromQL baseline preserve names; verify actual registry and units. Alert unknown and queue lag independently, no PII. SLO targets proposed only after baseline.
## P08 fixtures
ACME upstream T01 recorded no generator/license; don't import. Local deterministic A/B fixtures, schema parse, stable IDs, fake provider receipts, event duplicate/contradiction/revoke/unknown. No demo import or real credentials. Seed and virtual clock isolated. 
## P09 bundle validation
findSecretPaths depth>8 returns []; deeply nested secret silently missed. Add bounded preflight before parser, reject too deep/large/cycle rather than skip; strict unknown fields after compatibility inventory. Candidate:
```ts
function boundedTree(value:unknown,depth=0,seen=new WeakSet<object>(),budget={n:0}):boolean{
 if(++budget.n>10000||depth>8)return false;
 if(value===null||typeof value!=="object")return true;
 if(seen.has(value))return false;
 seen.add(value);
 return Object.values(value).every(v=>boundedTree(v,depth+1,seen,budget));
}
```
JSON byte cap before parse in CLI, avoid getters/non-JSON inputs; test deep secret, cycle, oversize, invalid references, duplicate IDs. No secret value in error.
## P10 provision read safety
readInstallation L113 catch null, readClaimedNames L123 catch []; storage outage looks absent. Remove catches for authoritative reads, distinguish genuine null from error. Audit remaining catches L152/180/204/360/436. No writes after failed plan. Tests failing store get/list, no tenant/user mutation. Keep read-only plan and pending consent.
## P11 provision concurrency
applyProvision reservationId reused existing; reread reservation alone doesn't fence two resume workers. Need Trans01 Store CAS/lease contract, operationKey+tenant/name unique reservation, generation fence per step, idempotent actor create. No DB lock across remote effects. Restrict current apply to authorized single runner until contract. Simulate two processes same key, different key same normalized name, crash after actor before checkpoint; no duplicate membership or overwrite customizations. F07 real apply not authorized.
## P12 gate integrity
gate-cognition-v2 checks only source.git.head and presence test; --only=test report accepted as full evidence (still NO_GO, but misleading). Validate full step set from allSteps, unique names, exit codes, clean HEAD, logs/hash, report schema; partial report explicitly PARTIAL, no certification. Candidate:
```ts
const required=allSteps().map(s=>s.name).sort();
const actual=source.steps.map(s=>s.name).sort();
if(JSON.stringify(required)!==JSON.stringify(actual))throw Error("Full gate required");
```
Import allSteps only after confirming main guard. Require current SHA for local acceptance, CI artifact manifest for historical report; no stale report reuse. Keep NO_GO exit1 and NOT_RUN exit2. Tests partial, duplicate, dirty, stale, missing log, skipped PG.
## P13 CI and supply chain
Freeze Node/pnpm lock, audit existing workflows before patch. Separate static/local/PG restricted/provider sandbox; no secrets on untrusted PR; artifacts redacted, retention, hashes. SBOM cyber tarball pinned and license check; no redistributing UNLICENSED. No deploy. 
## P14 certification
Canonical F01 P12/13, F02 P01–06, F03 P03–06/13, F04/05 P05/08/14, F06 P08/09, F07 P10/11 sandbox, F08 P05/13, F09 P07, F10/11 deferred founder except existing regression, F12 P12–14. Four stages each scaffold/coding/reaudit/hardening. Gate pnpm typecheck, gate, test:cognition-v2, verify:slice, gate:cognition-v2; inspect actual scripts. PG restricted two tenants, crash/replay/restore, collector down, Slow saturation, provider unknown, no Fast effect. No PASS from skipped tests. Rollback disable export/activation, preserve durable evidence and installation journal. 
## Simulación y feedback
Collector outage -> drop telemetry only. Malicious label -> bounded reject, not new series. Store outage -> plan fails before writes. Two resume workers -> block shared until fence. Partial gate -> not full evidence. Synthetic accepted -> no live confirmation. Stale report -> no GO. 
## Orden
Wave A P01/02/08/09/10/12 independent; Wave B P03–05 contracts; Wave C P06/07/11/13; Wave D P14. Reserve shared paths. No functional changes or tests executed. Full 48 README and callers pending. Autoevaluation architecture 9.1, granularity 8.1, anchors 8.9, code 8.0, wiring 8.0, tests 8.4, autonomy 8.0, rollback 8.7; mean 8.4. 
