# 08 - Runbook de reproduccion

Ejecutar desde la raiz del repositorio, con Node 22 segun `package.json` y dependencias instaladas.

## Tests y typecheck

```sh
pnpm test
pnpm typecheck
```

Tests tenant acotados:

```sh
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=5000 \
  tests/tenant-isolation.test.ts \
  tests/tenant-isolation-extended.test.ts \
  tests/load/fifty-tenants.test.ts \
  tests/tenant-http-e2e.test.ts
```

## Auditorias

```sh
pnpm audit:layers
pnpm audit:bridges
pnpm audit:console
pnpm audit:tenant-default
pnpm audit:idempotency
pnpm audit:contracts
```

`pnpm audit:coherence` ejecuta la cadena. A fecha de este informe, `pnpm` puede bloquear el auto-install por la politica `allowBuilds` de `@scarf/scarf`; no aprobar scripts de dependencias como parte de esta tarea. Con dependencias ya disponibles se usaron los ejecutables locales `node_modules/.bin/tsx` y `node_modules/.bin/tsc`.

Los reportes se escriben en `docs/AUDIT_*.md`. Para actualizar esta documentacion, registrar fecha, conteos, comandos exactos, exit status y cualquier cambio del checkout. No eliminar findings para forzar un estado verde.
