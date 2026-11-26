# Evidencia ejecutada

Rama Trans05, revisión `1a70bbc2c6f78c49fe6b51ed18297f27a9822149`. Node 24.22.3 y pnpm 11.19.0, dependencias instaladas desde el lockfile congelado de esta rama.

```bash
ALLOW_NETWORK=0 corepack pnpm exec tsx --import ./tests/setup.ts --test --test-concurrency=1 --test-timeout=90000 --test-force-exit tests/cognition-v2-context-cache.test.ts tests/trans02-attention.test.ts tests/trans02-fast-revocation.test.ts
```

| Descubiertas | Aprobadas | Fallidas | Canceladas | Omitidas | TODO |
|---:|---:|---:|---:|---:|---:|
| 3 | 3 | 0 | 0 | 0 | 0 |

La selección se limita a los archivos del comando. Los circuitos completos de producción y la ejecución concurrente con dos conexiones Postgres quedan pendientes.
