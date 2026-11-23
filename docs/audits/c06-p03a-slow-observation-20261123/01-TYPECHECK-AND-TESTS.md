# Evidencia de pruebas

Snapshot: `4f426ca79b6b865e064103b02ca3c28c3e321bec`. Inspección estática de `tests/cognition-v2-slow-observation.test.ts` (dos tests) y `.github/workflows/c05-voice.yml`. El workflow tiene paso `C06 slow observation boundary` con comando `pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/cognition-v2-slow-observation.test.ts`; además `pnpm typecheck`.

**Ejecutados en esta auditoría:** 0 tests TypeScript. **Pasados:** 0 verificados. **Fallidos:** 0 observados. **No ejecutados/bloqueados:** typecheck, dos tests originales y tests nuevos, integración Postgres. El conector GitHub no ejecuta procesos de repo y no hay checkout local del snapshot. No asignar duración ficticia ni código de salida. La presencia del paso CI no certifica su resultado.

Comandos a ejecutar en runner con el SHA fijo: `corepack pnpm install --frozen-lockfile`; `pnpm typecheck`; `pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/cognition-v2-slow-observation.test.ts`; suites slow/context relacionadas según listado del repo. El push a esta rama de auditoría no dispara automáticamente el workflow `c05-voice.yml` porque su filtro push solo contempla la rama del implementador; crear PR o añadir workflow de auditoría separado con aprobación.
