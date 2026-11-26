# Evidencia ejecutada

Rama Trans02, revisión `89c5925d7a30e70ff41cd81539408d8b0282b92c`. Node 24.22.3 y pnpm 11.19.0, dependencias instaladas desde el lockfile congelado de esta rama.

```bash
ALLOW_NETWORK=0 corepack pnpm exec tsx --import ./tests/setup.ts --test --test-concurrency=1 --test-timeout=90000 --test-force-exit tests/trans02-*.test.ts
```

| Descubiertas | Aprobadas | Fallidas | Canceladas | Omitidas | TODO |
|---:|---:|---:|---:|---:|---:|
| 13 | 13 | 0 | 0 | 0 | 0 |

La selección se limita a los archivos del comando. Los circuitos completos de producción y la ejecución concurrente con dos conexiones Postgres quedan pendientes.

## Suite cognitiva y experimentos adicionales

Run en `20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa`, Node 24.22.3, pnpm 11.19.0, con PostgreSQL 17.12 efímero disponible mediante COGNITION_TEST_POSTGRES_URL. La mayoría de los archivos elige PGlite. Los casos condicionados a PostgreSQL usan una base temporal exclusiva de esta prueba.

```bash
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test --test-concurrency=1 --test-timeout=90000 --test-force-exit tests/cognition-v2-*.test.ts tests/trans02-*.test.ts
```

83 pruebas aprobadas, cero fallidas, canceladas, omitidas o TODO. Se incluyen los archivos de durabilidad, HTTP sintético, RLS, recuperación, workers, proveedor simulado, memorias, grafo, ontología y Fast/Slow. Los 13 casos de Trans02 del run anterior también forman parte de esta selección. Son ejecuciones solapadas y no se suman como cobertura distinta.

El experimento nuevo detectó dos divergencias de selección pese a este resultado de la suite. [Entradas, intercalación y oráculos](EXPERIMENTO-CURSOR-Y-PRESUPUESTO.md)
