# Compatibilidad entre árboles

Comparación de contenido por SHA de blob. Cada celda cuenta rutas diferentes entre dos puntas bajo `apps/server/src/`, `packages/domain/src/` y `tests/`, además de los manifiestos raíz y el lockfile. Una ruta ausente también cuenta. Los cambios convergentes cuentan una vez por pareja.

| Árbol | Trans01 | Trans02 | Trans03 | Trans04 | Trans05 | Trans06 | can |
|---|---:|---:|---:|---:|---:|---:|---:|
| Trans01 | 0 | 43 | 34 | 37 | 43 | 36 | 33 |
| Trans02 | 43 | 0 | 11 | 14 | 0 | 13 | 10 |
| Trans03 | 34 | 11 | 0 | 5 | 11 | 4 | 1 |
| Trans04 | 37 | 14 | 5 | 0 | 14 | 7 | 4 |
| Trans05 | 43 | 0 | 11 | 14 | 0 | 13 | 10 |
| Trans06 | 36 | 13 | 4 | 7 | 13 | 0 | 3 |
| can | 33 | 10 | 1 | 4 | 10 | 3 | 0 |

La columna can corresponde a `8672f8c1035067e77de76080aabbe8d4c8030fe5`. Igualdad en estas superficies permite reutilizar una observación estática sobre el mismo blob. Atribuir una prueba a otro commit exige reproducir su ejecución.

| Rama | Punta | Base con canónica |
|---|---|---|
| Trans01 | `8967243326ccf5e22224e0693ac9155ea70d9765` | `751eab413aef2ca124d42dcba602b91696b71c9d` |
| Trans02 | `89c5925d7a30e70ff41cd81539408d8b0282b92c` | `751eab413aef2ca124d42dcba602b91696b71c9d` |
| Trans03 | `24c232c8bf8239155d9afa45a234be1a2edf322e` | `751eab413aef2ca124d42dcba602b91696b71c9d` |
| Trans04 | `731604c865cb6193047ad6bd10bba204ca35f47d` | `751eab413aef2ca124d42dcba602b91696b71c9d` |
| Trans05 | `1a70bbc2c6f78c49fe6b51ed18297f27a9822149` | `751eab413aef2ca124d42dcba602b91696b71c9d` |
| Trans06 | `4905ec63c7de50d0ee34f2ae5e21f01dde80ee9d` | `12e535a264d0c4a5da17d7b049e04c82cbcc681c` |

## Rutas divergentes

Los números representan grupos de contenido idéntico dentro de cada fila. El guion indica ausencia. El orden de las columnas se mantiene fijo.

| Ruta | Trans01 | Trans02 | Trans03 | Trans04 | Trans05 | Trans06 | can |
|---|---:|---:|---:|---:|---:|---:|---:|
| `apps/server/src/actions.ts` | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `apps/server/src/app.ts` | 1 | 1 | 1 | 1 | 1 | 2 | 1 |
| `apps/server/src/db-tenant.ts` | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `apps/server/src/db.ts` | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `apps/server/src/engine/capabilities/bootstrap.ts` | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `apps/server/src/engine/cognition/v2/attention.ts` | 1 | 2 | 1 | 1 | 2 | 1 | 1 |
| `apps/server/src/engine/cognition/v2/chat-agent.ts` | — | 1 | — | — | 1 | — | — |
| `apps/server/src/engine/cognition/v2/context.ts` | 1 | 2 | 1 | 1 | 2 | 1 | 1 |
| `apps/server/src/engine/cognition/v2/runtime.ts` | 1 | 2 | 1 | 1 | 2 | 1 | 1 |
| `apps/server/src/engine/cognition/v2/slow-observation.ts` | — | 1 | — | — | 1 | — | — |
| `apps/server/src/engine/events/bus.ts` | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `apps/server/src/engine/events/index.ts` | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `apps/server/src/engine/events/service-principal.ts` | 1 | — | — | — | — | — | — |
| `apps/server/src/engine/events/sinks/store.ts` | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `apps/server/src/engine/events/types.ts` | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `apps/server/src/engine/execution/capability-runner.ts` | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `apps/server/src/engine/execution/outcome.ts` | 1 | — | — | — | — | — | — |
| `apps/server/src/engine/execution/tool-executors.ts` | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `apps/server/src/engine/observability/hooks.ts` | 1 | — | — | — | — | — | — |
| `apps/server/src/engine/service.ts` | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `apps/server/src/engine/sop-executor.ts` | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `apps/server/src/google-auth.ts` | 1 | 1 | 2 | 1 | 1 | 1 | 1 |
| `apps/server/src/metrics-exporter.ts` | 1 | 1 | 1 | 2 | 1 | 1 | 1 |
| `apps/server/src/metrics/registry.ts` | 1 | 1 | 1 | 2 | 1 | 1 | 1 |
| `apps/server/src/middleware/request-logger.ts` | 1 | 1 | 1 | 2 | 1 | 1 | 1 |
| `packages/domain/src/execution-context.ts` | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `packages/domain/src/index.ts` | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `pnpm-lock.yaml` | 1 | 1 | 1 | 1 | 1 | 2 | 1 |
| `tests/business-command-studio.test.ts` | — | — | — | — | — | 1 | — |
| `tests/gate/idempotency-execution.test.ts` | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| `tests/trans01-approval-binding.test.ts` | 1 | — | — | — | — | — | — |
| `tests/trans01-approval-hash-race.test.ts` | 1 | — | — | — | — | — | — |
| `tests/trans01-causal-envelope.test.ts` | 1 | — | — | — | — | — | — |
| `tests/trans01-claim-cas.test.ts` | 1 | — | — | — | — | — | — |
| `tests/trans01-dispatch-outbox.test.ts` | 1 | — | — | — | — | — | — |
| `tests/trans01-effect-boundary.test.ts` | 1 | — | — | — | — | — | — |
| `tests/trans01-emit-commit.test.ts` | 1 | — | — | — | — | — | — |
| `tests/trans01-event-page.test.ts` | 1 | — | — | — | — | — | — |
| `tests/trans01-governed-runner.test.ts` | 1 | — | — | — | — | — | — |
| `tests/trans01-outcome-semantics.test.ts` | 1 | — | — | — | — | — | — |
| `tests/trans01-replay-concurrency.test.ts` | 1 | — | — | — | — | — | — |
| `tests/trans01-replay-durable.test.ts` | 1 | — | — | — | — | — | — |
| `tests/trans01-service-principal.test.ts` | 1 | — | — | — | — | — | — |
| `tests/trans01-sop-authz.test.ts` | 1 | — | — | — | — | — | — |
| `tests/trans01-telemetry-hooks.test.ts` | 1 | — | — | — | — | — | — |
| `tests/trans02-attention.test.ts` | — | 1 | — | — | 1 | — | — |
| `tests/trans02-candidate-routing.test.ts` | — | 1 | — | — | 1 | — | — |
| `tests/trans02-chat-agent.test.ts` | — | 1 | — | — | 1 | — | — |
| `tests/trans02-fast-revocation.test.ts` | — | 1 | — | — | 1 | — | — |
| `tests/trans02-slow-observation.test.ts` | — | 1 | — | — | 1 | — | — |
| `tests/trans04-observability-contract.test.ts` | — | — | — | 1 | — | — | — |
