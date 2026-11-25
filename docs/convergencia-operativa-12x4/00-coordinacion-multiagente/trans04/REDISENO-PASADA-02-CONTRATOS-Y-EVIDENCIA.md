# Pasada 02 — perspectiva epistemológica: qué demuestra cada señal
## Marco 1 estrategia
No confundir observación con evidencia. Esta pasada cambia de diagnóstico de componentes a falsación de afirmaciones de certificación. Seis marcos operativos: estrategia, diagnóstico, diseño, simulación, feedback, ejecución documental y reaudit dentro del último. Prevalece sobre 01 en conflictos. 
## Marco 2 diagnóstico
Anclas nuevas: Trans01 hooks.ts 4d2d8c68; Trans04 registry 6e048687, request-logger 60a311c0, gate-report 2c85a553, verify-vertical-slice ec489e47. H01 real record puede devolver Promise y observeKernel invoca síncronamente: un sink CPU-bound sí bloquea; no prometer aislamiento por ausencia de await. Registry render interpola valores sin escape y permite le reservado. Request logger obtiene tenant antes de auth, y catch no registra histogram/counter; denominador sesgado. verify:slice --only vacío selecciona cero; smoke usa process.env heredado, no prueba ausencia de credenciales ni aislamiento de red. Gate gitInfo ignora untracked; informe de test parcial no full. 
## Marco 3 diseño P01–P14
P01 separar key y render, helper candidato:
```ts
function labelKey(labels:Labels):string {
 return JSON.stringify(Object.entries(labels).sort(([a],[b])=>a<b?-1:a>b?1:0));
}
function renderLabels(labels:Labels):string {
 return Object.entries(labels).map(([k,v])=>k+'="'+v.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/"/g,'\\"')+'"').join(",");
}
```
Reemplazar las tres interpolaciones render, validar nombres /^[a-zA-Z_][a-zA-Z0-9_]*$/, prohibir le en histogram, clone labels, reject nonfinite and negative increments, cap new series only. No borrar series existentes. Test escaped newline/quote/backslash, collision, mutation, cap existing increment. 
P02 exporter: no eliminar métricas tenant existentes hasta migrar consumidores. Scrape externo separado mediante render agregado sin tenant (sum counters/hist buckets; gauges requieren semántica por familia, no sumar indiscriminadamente). Default deny familias sin regla. Scope admin y token verificar app mount. p99 local no SLO global. Request logger: registrar una vez tras resolución de status real, no inventar 500 en catch si error handler produce 403; caracterizar Hono onError antes de diff. Tenant post-auth desde principal autorizado, no header. Método allowlist y template bounded. Correlation header client-controlled no trace authority, no external attribute. 
P03 H01 exacto:
```ts
import {registerKernelTelemetrySink,type KernelObservation} from "../engine/observability/hooks.ts";
```
Ruta candidata desde metrics/; montaje app reservado. Sink record solo valida stage/status/duration y enqueue bounded; descartar correlationId/capabilityId/errorClass hasta allowlist cerrada. No Promise por evento. Unregister al shutdown. No duplicar productor ni reconstruir eventos. H01 status ok no equivale a efecto confirmado.
P04 H02 candidate lane/outcome de Trans02, no contrato final; queue wait y durable lag requieren marcas distintas, no usar elapsed para ambos. Fast TTFT solo si token emitido, terminal sin token separado. ACK ledger no entrega negocio. P05 H03 de Trans03 P04, mapear accepted/confirmed/unknown/simulated separados; attempt dispatch no terminal; replay no segundo count. P03–05 mismo registry, tres families, no universal outcome mapping que pierda significado. 
P06 OTLP: enqueue O(1) bounded ring, background batch, timeout y drop; no raw event payload, no baggage. SDK/exporter version pendiente. Simular sink sync throw, rejected promise, saturation y shutdown. No prometer aislamiento CPU sin worker/process separado; sink local limitado a operaciones acotadas.
P07 SLO: denominador requests terminales, errores de auth separados de availability; histograms por lane y units ms; p99 sin datos omitido. Unknown ratio por dispatch settled, no por todos requests. Drop ratio explícito. No alertar cero traffic como éxito. 
P08 fixtures A/B con oracle expected receipt/card/snapshot; deterministic seed no secret, synthetic source marker; virtual clock solo simulator. Test mutation of expected oracle independent of actual. P09 bundle bounded traversal previo a findSecretPaths, reject depth/cycle/size; no leak paths arbitrarios a logs. P10 authoritative reads fail closed; no catch-null para outages. P11 reservation CAS/fence Trans01; two-worker simulation and no apply real. 
P12 gate: allSteps export real; confirmar import main guard. Validate names unique exact, kind/blocking match spec, exit code/ok consistency, test counters present and tests>0, skipped/cancelled/todo separately. gitInfo dirty untracked ignored: certification uses clean isolated checkout and before/after SHA/status including untracked nonignored. Partial gate still useful for dev but cannot certify. No trust caller JSON alone; manifest hashes and CI provenance. 
P13 verify:slice empty --only candidate:
```ts
if(pedidos.length===0){console.error("verify:slice requires a step");process.exit(2);}
```
before desconocidos. Smoke separate child with env allowlist (PATH, HOME isolated, runtime essentials), no DATABASE_URL/provider keys, temporary dir, sample explicit, egress denied by sandbox not flag alone. Preserve existing focal tests; add smoke scope A/B. CI no secrets untrusted PR, pinned dependencies, artifacts redacted. P14 evidence matrix static/local/PG restricted/provider sandbox/restore independent, NO_GO if missing required evidence. 
## Marco 4 simulación adversarial
S1 malicious label newline -> parser still one series; S2 same labels mutated -> old sample stable; S3 100k novel labels -> bounded drops; S4 sink CPU heavy -> reject design, only O(1) enqueue; S5 403 thrown -> exactly one actual status after handler; S6 admin A query B -> deny; S7 partial test-only gate -> PARTIAL; S8 zero tests -> NOT_RUN; S9 smoke inherited real key -> isolated child no key; S10 synthetic accepted -> no live certification; S11 storage outage -> zero writes; S12 two resume workers -> fence required. 
## Marco 5 feedback
P01 previous key fix alone insufficient; render separate. P02 aggregation must distinguish gauge semantics. H01 existing hook comments overpromise nonblocking; enforce producer sink budget. P12 report hash is integrity not authenticity. P13 ALLOW_NETWORK=0 not sandbox. P08 oracle must independent. 
## Marco 6 ejecución y reaudit
Wave A P01/P09/P10/P12/P13 empty-selection independent, P02 after auth caller inventory. Wave B P03–05 owner ABI, P06 SDK review, P07 metrics semantics. Wave C P08 fixtures/P11 lease and isolated smoke. Wave D P14. Tests existing trans04-observability-contract, gate/gate-report, vertical-slice-bundle/provision/postgres, worker-metrics; new candidate tests for injection/cap/partial/empty selection/isolated env. Rollback disable sink/export and governed apply, retain journals and evidence. No code functional or tests executed. Canonical 48 README and app auth mount pending; no certification. Score architecture 9.3, granularity 8.4, anchors 9.1, code 8.4, wiring 8.5, tests 8.7, autonomy 8.4, rollback 8.9 = 8.7125.
