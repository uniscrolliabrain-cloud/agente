# Evidencia ejecutada

Rama Trans02, revisión `89c5925d7a30e70ff41cd81539408d8b0282b92c`. Node 24.22.3 y pnpm 11.19.0, dependencias instaladas desde el lockfile congelado de esta rama.

```bash
ALLOW_NETWORK=0 corepack pnpm exec tsx --import ./tests/setup.ts --test --test-concurrency=1 --test-timeout=90000 --test-force-exit tests/trans02-*.test.ts
```

| Descubiertas | Aprobadas | Fallidas | Canceladas | Omitidas | TODO |
|---:|---:|---:|---:|---:|---:|
| 13 | 13 | 0 | 0 | 0 | 0 |

La selección se limita a los archivos del comando. Los circuitos completos de producción y la ejecución concurrente con dos conexiones Postgres quedan pendientes.
