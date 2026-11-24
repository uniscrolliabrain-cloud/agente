# T01 · Baseline reproducible

Base del código `a48b79e93a2a0ddde88a9345853e42b928d80092`, rama local Trans04. Linux, Node 24.22.3 y pnpm 11.25.0. La matriz CI declara Node 22. Runtime de muestra y fixtures locales, `ALLOW_NETWORK=0` durante la ejecución. No se usaron DSN, credenciales de proveedores ni owner real.

| Comando | Exit | Evidencia |
|---|---|---|
| `pnpm install --frozen-lockfile` | 254 | ENOENT al crear store bajo home. |
| `XDG_CACHE_HOME=/tmp/trans04-cache XDG_DATA_HOME=/tmp/trans04-data pnpm install --store-dir /tmp/trans04-store --frozen-lockfile` | 0 | Instalación congelada de cuatro proyectos. |
| `pnpm typecheck` | 0 | TypeScript raíz y browser-worker. |
| `pnpm gate` | 1 | El launcher tsx intenta abrir socket Unix y recibe EPERM. |
| `node --import tsx scripts/gate-report.ts` | 1 | 9/10 pasos, incluida toda la auditoría. El subproceso test conserva launcher tsx y falla con EPERM antes de ejecutar casos. `artifacts/gate/report.json`, `artifacts/gate/logs/test.log`. |
| `node --import tsx --import ./tests/setup.ts --test --test-reporter=spec --test-timeout=30000 tests/worker-metrics.test.ts tests/vertical-slice-bundle.test.ts tests/vertical-slice-provision.test.ts` | 0 | Tres archivos de pruebas, sin archivos fallidos o saltados. |
| `node --import tsx scripts/verify-vertical-slice.ts --only smoke` | 0 | Sample, health 200, petición sin sesión 401 y acceso autenticado 200. |
| `pnpm test:cognition-v2` | 0 | 61 pasan, 0 fallan, 9 omisiones de Postgres nativo/restringido. |
| `pnpm gate:cognition-v2` | 1 | NO_GO, `repositoryGateOk=false`, bloqueos C05/C08/C13/C14/C15. `artifacts/cognition-v2/acceptance.json`. |
| `pnpm release:check`, `pnpm release:verify` | NOT_RUN | Los checks usan el launcher tsx y verificación posterior a deploy, respectivamente. Certificar posteriormente sobre entorno aprobado y SHA combinado. |

El worker baseline sólo comprueba presencia textual de métricas. Para T02 exigir delta exacta de sum/count tras un resultado durable, ausencia de éxito ante rollback y dedupe ante replay. El probe local siguiente verifica filtro básico y demuestra que el p99 actual es global aunque el render tenga filtro. Los números son datos de prueba, no SLO.

```sh
ALLOW_NETWORK=0 node --import tsx --input-type=module <<'NODE'
import { strict as assert } from "node:assert";
import { MetricsRegistry } from "./apps/server/src/metrics/registry.ts";
const registry = new MetricsRegistry();
registry.counter("baseline_events_total", "Synthetic events");
registry.histogram("baseline_latency_ms", "Synthetic latency", [10, 100]);
registry.inc("baseline_events_total", { tenant: "fixture-a" });
registry.inc("baseline_events_total", { tenant: "fixture-b" }, 2);
registry.observe("baseline_latency_ms", 5, { tenant: "fixture-a" });
registry.observe("baseline_latency_ms", 20, { tenant: "fixture-b" });
assert.match(registry.render({ tenant: "fixture-a" }), /baseline_events_total\{tenant="fixture-a"\} 1/);
assert.doesNotMatch(registry.render({ tenant: "fixture-a" }), /fixture-b/);
assert.equal(registry.quantile("baseline_latency_ms", 0.99), 100);
NODE
```

Exit 0. Buckets HTTP del registry en ms: 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000 y +Inf. Series HTTP con método, ruta, estado y tenant si está disponible. Tareas con sum/count en segundos y gauges de concurrencia; LLM registra familias por velocidad/modelo; eventos kernel y bus tienen productores separados. Series de métricas viven en memoria por proceso, mientras que MetricsCollector usa Store. La migración de unidades o nombres necesita compatibilidad de scraping y dashboards.

## Regresión de cardinalidad pendiente de T02

Este probe en memoria se ejecutó con `ALLOW_NETWORK=0 LOG_LEVEL=error`. Exit 1, `2 !== 1`. Dos peticiones a una misma plantilla producen dos series de una misma familia. La corrección candidata debe preservar etiquetas compatibles y acotar rutas desconocidas; requiere reserva y revisión B1.

```sh
ALLOW_NETWORK=0 LOG_LEVEL=error node --import tsx --input-type=module <<'NODE'
import assert from "node:assert/strict";
import { Hono } from "hono";
import { requestLogger } from "./apps/server/src/middleware/request-logger.ts";
import { globalMetrics } from "./apps/server/src/metrics/registry.ts";

const app = new Hono();
app.use("*", requestLogger());
app.get("/baseline/:id", (c) => c.text("ok"));
for (const id of ["fixture-alpha", "fixture-beta"]) {
  assert.equal((await app.request("/baseline/" + id)).status, 200);
}
const series = globalMetrics.render().split("\n").filter((line) =>
  line.startsWith("agente_http_requests_total{") && line.includes("/baseline/"),
);
assert.equal(series.length, 1);
NODE
```

## Suite con launcher alternativo

`ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test --test-reporter=spec --test-timeout=30000 --test-force-exit 'tests/**/*.test.ts'` → exit 1, 196 archivos verdes y 7 fallidos de 203. Archivos rojos: browser, computer-runner, conversation-browser, crash-recovery, demo-model, gate/idempotency-cli y model-worker. El runner de este entorno agrega resultados por archivo. Este intento conserva el sandbox con restricciones de sockets y no sustituye el gate oficial.

`ALLOW_NETWORK=0 pnpm exec tsx --import ./tests/setup.ts --test tests/browser.test.ts` con capacidad de sockets del entorno → exit 0, 16 casos verdes. La reproducción sin esa capacidad registró `listen EPERM` sobre loopback. Esta evidencia explica el fallo de browser en la primera suite; no atribuye automáticamente los demás fallos a la misma causa.

## Gate oficial con sockets locales permitidos

`ALLOW_NETWORK=0 pnpm gate` → exit 1, 9/10 pasos verdes, 1090.6 s. Typechecks y siete auditorías pasaron. El proceso arrancó con `1c204623`; el reporte resolvió Git al cerrar y registró `c7919c00` y un fichero documental en edición. Las diferencias entre esos estados son exclusivamente documentación de Trans04.

El runner informó 901 casos/archivos, 872 verdes, 3 fallos, 21 skips, 5 todo y 0 cancelados. Los fallos fueron dos timeouts de 30 s en `tests/tasks-reassign.test.ts` y un error posterior de teardown (`agent` indefinido) del mismo archivo. El primer caso tardó 52 s en la suite. Repetición aislada con `ALLOW_NETWORK=0 pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/tasks-reassign.test.ts` → exit 0, ambos casos pasan. Esto no acredita el gate combinado ni establece la causa del timeout. Conservar el límite y repetir el gate sin otra suite concurrente en el SHA combinado.

`ALLOW_NETWORK=0 pnpm gate:cognition-v2` sobre ese informe → exit 1, `repositoryGateOk=false`, NO_GO con C05/C08/C13/C14/C15. No se neutralizó el exit ni se modificaron gates. Artefactos locales: `artifacts/gate/report.json`, `artifacts/gate/logs/test.log`, `artifacts/cognition-v2/acceptance.json`. Esta bitácora conserva los resultados sin publicar logs brutos.
