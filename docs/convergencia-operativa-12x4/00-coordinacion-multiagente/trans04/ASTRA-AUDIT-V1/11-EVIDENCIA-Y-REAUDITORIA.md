# Evidencia ejecutada

Rama Trans04, revisión `731604c865cb6193047ad6bd10bba204ca35f47d`. Node 24.22.3 y pnpm 11.19.0, dependencias instaladas desde el lockfile congelado de esta rama.

```bash
ALLOW_NETWORK=0 corepack pnpm exec tsx --import ./tests/setup.ts --test --test-concurrency=1 --test-timeout=90000 --test-force-exit tests/trans04-observability-contract.test.ts tests/gate/gate-report.test.ts
```

| Descubiertas | Aprobadas | Fallidas | Canceladas | Omitidas | TODO |
|---:|---:|---:|---:|---:|---:|
| 11 | 11 | 0 | 0 | 0 | 0 |

Experimento separado en directorio temporal. Se invocó el consumidor scripts/gate-cognition-v2.ts con un informe que contenía solo el paso test, ok=true, exitCode=0, logFile=null y el identificador ficticio fixture-local. Resultado observado: repositoryGateOk=true y decision=NO_GO, exit 1. Queda demostrada la aceptación del indicador parcial.

La selección se limita a los archivos del comando. Los circuitos completos de producción y la ejecución concurrente con dos conexiones Postgres quedan pendientes.
