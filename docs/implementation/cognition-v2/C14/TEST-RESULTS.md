# Pruebas C14 ejecutadas

Fecha: 2026-11-15. Datos sintéticos; ningún scanner ni servicio externo.

| Comando | Resultado | Alcance |
|---|---|---|
| `node --import tsx --test --test-isolation=none --test-timeout=90000 tests/cognition-v2-cyber-bridge.test.ts` con SDK alpha.2 | exit 0; 5 pass / 0 fail / 0 skip, 12.590 s | SDK real, fetch sintético, permisos, minimización, rollback proyección, idempotencia/ACK perdido, hashes y ACK nativo después de commit |
| `npm test --prefix typescript` en hijo alpha.2 | exit 0; checker y 7 pass / 1 skip | El caso live se ejecuta desde Python, no se acredita con el skip |
| `CI=1 python -m unittest tests.contracts.test_python_ts tests.integration.test_budget_concurrency` en hijo alpha.2 | exit 0; 9 pass / 0 skip, 5.884 s | SDK real→FastAPI loopback, RBAC viewer/reviewer, cross-tenant, ACK duplicate, outbox/budget rollback sintético |

El comando Python sin permisos de loopback había devuelto exit 0 con 1 skip. Se reejecutó con `CI=1` y loopback autorizado: el resultado acreditado arriba no tiene skips. No se presenta un skip como contrato validado.

`node node_modules/typescript/bin/tsc --noEmit --pretty false` en padre: exit 0, sin diagnósticos. Este resultado incluye los imports reales de `@agntia/ciberseguridad` alpha.2 y las fuentes del puente; no certifica integración productiva ni el resto de los gates C15.
