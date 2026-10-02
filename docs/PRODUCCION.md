# Produccion

## Release checks

Antes de cada deploy:

    pnpm release:check

Comprueba typecheck + tests.

## Post-deploy

    pnpm release:verify

Comprueba /api/health y /api/health-deep.

## Rollback

Si release:verify falla, revertir el deploy. El restore de DB esta probado.

## Guardrails

Limites por tenant configurables en `records/guardrail-quotas/default`.

Limites por defecto:
- 1M tokens/dia
- 10k tareas activas
- 500 tareas/hora
- 100k eventos/dia
- 100 turnos activos
- 50 EUR/dia

## Backups

Por tenant en `dataDir/tenants/<tenantId>/`. Restore probado en staging.

## Multi-proceso

API, worker, browser y computer en procesos separados. Todos hablan por DB + bus.