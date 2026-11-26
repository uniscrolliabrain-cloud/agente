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

## Ensayo RLS con PostgreSQL 17.12

Run sobre `80ff6cd5593e79d8ac79e4ba6d044c785f46eb37`, con los dos archivos de pruebas existentes y lockfile de Trans04. Clúster Debian de PostgreSQL 17.12 en directorio efímero, acceso por socket Unix privado. La conexión instaladora preparó esquema, datos sintéticos, permisos y rol de ensayo. Las operaciones bajo prueba utilizaron SET LOCAL ROLE con un rol NOLOGIN NOSUPERUSER NOBYPASSRLS y contexto de tenant local a la transacción.

```bash
# COGNITION_TEST_POSTGRES_URL identifica el clúster efímero de prueba.
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test --test-concurrency=1 --test-timeout=90000 --test-force-exit tests/cognition-v2-rls.test.ts tests/cognition-v2-rls-modules.test.ts
```

Dos pruebas aprobadas, cero omitidas, fallidas o canceladas. Sin tenant se observan cero filas. Con tenant A las consultas sobre referencias compartidas devolvieron solo A, la eliminación de filas de B afectó cero registros y el insert para B fue rechazado por RLS. Se ensayaron revocaciones cognitivas, sesiones de voz y cursores del módulo de seguridad. El caso de revocaciones comprueba también que el contexto no sobreviva a la transacción. Los tests verifican la lista de tablas cubiertas por las políticas esperadas. Para certificar una instalación compartida queda pendiente verificar la identidad de conexión efectiva del servidor desplegado y el aislamiento entre actores de una misma empresa en las rutas de aplicación.
