# T02 · Evidencia y diagnóstico

Entorno local, datos sintéticos y `ALLOW_NETWORK=0`. Node 22.23.5 se usa para contrastar la familia de CI. Node 24.22.3 se conservó para contrastar con B1. Ningún efecto de proveedor.

| Evidencia | Resultado |
| --- | --- |
| Baseline `335e0d4a`, Node 24, siete archivos de acciones, kernel, receipts, transacciones y reasignación | 7/7 archivos, exit 0. El runner encapsula casos por archivo. La prueba de reasignación aislada en esta selección no reproduce el timeout del conjunto de Trans04. |
| Proyección de tenant antes de la corrección | El test local ejecutado directamente sobre una exportación de `335e0d4a` detectó `fixture-owner` en vez de `fixture-tenant`, exit 1. El mismo caso en el candidato pasó, exit 0. |
| C04 `c8293e8b`, Node 22 | Ejecución directa: 1 PASS, 4 CANCELLED, exit 1. El primer caso cancelado espera una interrupción entre coordinadores y Node informa que la promesa sigue pendiente cuando termina el bucle. El polling de epoch tiene `monitor.unref()` y la promesa pendiente no mantiene el proceso vivo. Un arnés temporal con timer referenciado de 20 s, limpiado al finalizar, obtuvo 5/5 con el mismo código. Es evidencia diagnóstica y el caso sin arnés sigue rojo. Proponer a trans02 probar el timing con un reloj controlado o plazo referenciado y medir la señal que recibe el proveedor falso. |
| Carrera entre decisión y claim | En `6228ce68`, la aprobación perdedora reemplazaba la decisión ganadora `rejected` por `approved` (exit 1). En el candidato prevalece el rechazo y el proveedor recibe cero llamadas. El fallo inyectado en la escritura de aprobación revierte el claim y permite procesar otra decisión. Tres regresiones locales PASS con Node 22, exit 0. |
| Suite focal del candidato, Node 22 | 8/8 archivos, exit 0, límite 30 s sin cambios. Incluye acciones, reasignación, ejecución idempotente y slices de aprobación, Calendar y Gmail. El archivo de regresión propio se ejecutó además directamente después de añadir la inyección de escritura. |
| TypeScript raíz del candidato | `tsc --noEmit`, exit 0 tras tipar la transacción en `ActionsStore`. |
| Retorno de `replayTenant` con tres eventos persistidos, cursor segundo, límite 2 | 0 eventos frente a 1 esperado. El límite se aplica al scan antes de filtrar el cursor. El probe falla intencionalmente y no se incorpora al gate verde. |
| C06 `6d4e7eb3` y C05 `54f7fbfe` | Evidencia de trans02 revisada. HTTP C06 rojo por callback sin receptor y candidato C05 verde en prueba aislada; gate del árbol combinado pendiente. |

## Comandos

Desde la raíz, seleccionar Node 22 del entorno CI para las comprobaciones del candidato.

```bash
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test \
  --test-concurrency=2 --test-timeout=30000 --test-force-exit \
  tests/{actions,actions-deferred-wire,deferred-actions,kernel,cognition-v2-transactions,cognition-v2-kernel-receipts,tasks-reassign}.test.ts

# En una exportación de c8293e8b con dependencias del lockfile, Node 22.
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts tests/cognition-v2-voice.test.ts

# Regresiones propias, modelo de Store real en PGlite con adaptador simulado.
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts \
  docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans01/T02-approval-scope.test.ts

node node_modules/typescript/lib/tsc.js --noEmit
```

### Probe rojo del cursor

```bash
ALLOW_NETWORK=0 node --import tsx --input-type=module <<'NODE'
import assert from "node:assert/strict";
import { EventBus } from "./apps/server/src/engine/events/bus.ts";
import { createStore } from "./apps/server/src/db.ts";
import { TenantScopedStore } from "./apps/server/src/db-tenant.ts";

const raw = await createStore();
try {
  const tenantId = "fixture-tenant";
  const bus = new EventBus(new TenantScopedStore(raw, async () => tenantId));
  const ids = [];
  for (let i = 0; i < 3; i++) {
    const outcome = await bus.emit(
      "fixture-owner", "system.maintenance", { kind: "system", id: String(i) },
      { tasks: i, monitors: 0 }, { tenantId },
    );
    assert.equal(outcome.persisted, true);
    ids.push(outcome.id);
  }
  assert.equal(await bus.replayTenant(tenantId, { limit: 2, sinceId: ids[1] }, () => {}), 1);
} finally {
  await raw.close();
}
NODE
```
