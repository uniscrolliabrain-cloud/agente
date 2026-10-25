# tests/campaign-3

Suite de E2E transversales. Estado: 1 implementado (e2e-06), 2 esqueleto con skip (e2e-01, e2e-04), 9 con skip (e2e-02, 03, 05, 07, 08, 09, 10, 11, 12).

## Implementados

- `e2e-06-all-skipped.test.ts`: plan con todos skipped devuelve `blocked` (no `succeeded`).

## Esqueleto (skip, requieren fixture de modelo)

- `e2e-01-conversacion.test.ts`: chat -> modelo -> kernel -> respuesta persistida. Requiere `modelFixture` de `tests/helpers/model.ts`.
- `e2e-04-cuota.test.ts`: cuota agotada no llama proveedor. Requiere mock de `GuardrailService`.

## Pendientes (skip, sin fixture)

- `e2e-02`: fallo kernel (degradación explícita).
- `e2e-03`: aislamiento multi-tenant.
- `e2e-05`: acción protegida (authz deniega → executor no se llama).
- `e2e-07`: acción repetida (idempotencia: dos ejecuciones, un efecto).
- `e2e-08`: worker interrumpido (lease vencido → recuperación).
- `e2e-09`: plan fallido + compensación (orden inverso).
- `e2e-10`: promoción (Promoter escribe memory/graph).
- `e2e-11`: aprendizaje (LearningObserver escribe learning-facts).
- `e2e-12`: KernelPort contract.

## Cómo implementar los pendientes

Cada uno necesita:
1. Un fixture (modelo, store, kernel, o worker).
2. Un escenario concreto.
3. Una aserción de contrato.

Ver `tests/helpers/model.ts` para modelo, `tests/helpers/lifecycle.ts` para limpieza, y `tests/setup.ts` para bloqueo de red.