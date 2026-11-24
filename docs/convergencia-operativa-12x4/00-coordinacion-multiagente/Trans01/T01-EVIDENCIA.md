# T01 · Evidencia reproducible

| Prueba | SHA y entorno | Resultado |
| --- | --- | --- |
| Suite focal kernel, acciones, SOP, permisos, receipts y transacciones | `a70e2da4`, Node 24.22.3, dependencias disponibles, PGlite | 39 PASS, 0 FAIL, 1 SKIP, exit 0. La omitida requiere Postgres. |
| Postgres loopback desechable | `a70e2da4`, PostgreSQL 17.9, incluye rol restringido sintético | 5 PASS, 0 FAIL, 0 SKIP, exit 0. Aislamiento RLS, rollback, orden y receipts. No certifica producción compartida. |
| C04, prueba de render concurrente seleccionada | `c8293e8`, Node 24.22.3, PGlite, archivo consultado en snapshot de solo lectura | 1 PASS, exit 0. |
| C04, archivo completo de voz | `c8293e8`, Node 22.23.5, PGlite, snapshot de solo lectura | 1 PASS, 0 FAIL de aserción, 4 CANCELLED, exit 1. La primera cancelación es la prueba entre coordinadores. Node indica que terminó el bucle con una promesa pendiente. Coincide con el job de GitHub. |
| Preparación del gate base | `a70e2da4`, pnpm 11.25.0 | El primer intento falló con ENOENT y exit 254 al crear el store bajo el home. El lockfile congelado instaló con `--store-dir /tmp/agente-c02-pnpm-store`, exit 0. |

| Gate completo del árbol base | `b04e184756b97725d1ceee9773e5de33e7934fbf`, Node 24.22.3, `ALLOW_NETWORK=0` | Exit 0, 10/10 pasos. Suite de 900 tests: 874 PASS, 0 FAIL, 0 CANCELLED, 21 SKIP, 5 TODO. La bitácora era el único archivo con cambios locales. El código coincide con `a70e2da4`. |

Pasaron TypeScript raíz/worker y las auditorías de capas, bridges (16/16), consola, anchors, contratos, idempotencia y tenant por defecto. El gate combinado queda pendiente.

## Comandos

```bash
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test \
  --test-concurrency=2 --test-timeout=30000 --test-force-exit \
  tests/{kernel,actions,sop-contract,sop-triggers,tenant-http-e2e,cognition-v2-kernel-receipts,kernel-persona-isolation,cognition-v2-transactions}.test.ts

COGNITION_TEST_POSTGRES_URL="$TRANS01_TEST_POSTGRES_URL" ALLOW_NETWORK=0 \
  node --import tsx --import ./tests/setup.ts --test --test-isolation=none \
  --test-timeout=45000 --test-force-exit \
  tests/{cognition-v2-rls,cognition-v2-postgres,cognition-v2-kernel-receipts}.test.ts

# Sobre archivo de c8293e8 y un binario Node 22.
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test \
  --test-force-exit tests/cognition-v2-voice.test.ts

pnpm install --frozen-lockfile --store-dir /tmp/agente-c02-pnpm-store
ALLOW_NETWORK=0 node --import tsx scripts/gate-report.ts
```

La prueba de C04 reproduce una cancelación del test, sin evidenciar un fallo de cancelación del proveedor productivo. El candidato debe esperar la señal con una referencia temporal acotada que mantenga vivo el proceso. La corregirá el propietario de la prueba tras reserva. [CI global de C04](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44945470616/job/136971704133)
