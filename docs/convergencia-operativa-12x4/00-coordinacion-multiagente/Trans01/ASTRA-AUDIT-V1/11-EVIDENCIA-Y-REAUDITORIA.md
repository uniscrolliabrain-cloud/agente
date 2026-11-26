# Evidencia ejecutada

Rama Trans01, revisión `8967243326ccf5e22224e0693ac9155ea70d9765`. Node 24.22.3 y pnpm 11.19.0, dependencias instaladas desde el lockfile congelado de esta rama.

```bash
ALLOW_NETWORK=0 corepack pnpm exec tsx --import ./tests/setup.ts --test --test-concurrency=1 --test-timeout=90000 --test-force-exit tests/trans01-*.test.ts
```

| Descubiertas | Aprobadas | Fallidas | Canceladas | Omitidas | TODO |
|---:|---:|---:|---:|---:|---:|
| 101 | 99 | 0 | 0 | 2 | 0 |

La selección se limita a los archivos del comando. Los circuitos completos de producción y la ejecución concurrente con dos conexiones Postgres quedan pendientes.

## Reanudación sobre PostgreSQL

PostgreSQL 17.12 de Debian trixie, clúster temporal local, socket Unix privado y conexión como propietario de la base. Sobre el mismo árbol funcional, se repitió tests/trans01-replay-concurrency.test.ts con TEST_DATABASE_URL apuntando a ese clúster. Dos pruebas ejecutadas y aprobadas, cero omitidas. Se comprobaron inversión de inicio/commit y bloqueo del contador durante un append concurrente en el mismo tenant. Esta ejecución cubre las dos omisiones del run anterior. La identidad usada no acredita RLS de un rol restringido.

En ambos backends se reprodujo por separado la discordancia entre estado de acción y estado de intento. [Método, resultados y control](EXPERIMENTO-RECONCILIACION.md)
