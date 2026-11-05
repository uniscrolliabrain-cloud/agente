# Scripts

> v1 · 2026-10-27 · Estado: current

Catálogo de scripts de utilidad en `/scripts` y `apps/server/src/scripts/`.

## Scripts de desarrollo

| Script | Comando | Descripción |
|--------|---------|-------------|
| `demo:seed` | `tsx scripts/seed-demo.ts` | Sembrar datos de demo. |
| `demo:dev` | `tsx scripts/run-demo.ts` | Ejecutar demo en dev. |
| `dev:worker` | `tsx apps/server/src/worker-entry.ts` | Ejecutar worker de tareas separado. |
| `provision-client` | `tsx scripts/provision-client.ts` | Provisión de cliente. |

## Scripts de backup

| Script | Comando | Descripción |
|--------|---------|-------------|
| `backup:create` | `tsx scripts/backup.ts` | Crear backup global. |
| `backup:tenant` | `tsx scripts/backup-tenant.ts` | Backup por tenant. |
| `backup:restore` | `tsx scripts/restore.ts` | Restaurar backup. |

## Scripts de beta

| Script | Comando | Descripción |
|--------|---------|-------------|
| `beta:smoke` | `tsx scripts/beta-smoke.ts` | Smoke test de beta. |
| `beta:vertical` | `tsx scripts/beta-vertical.ts` | Test vertical de beta. |

## Scripts de release

| Script | Comando | Descripción |
|--------|---------|-------------|
| `release:check` | `tsx scripts/release-check.ts` | Verificación previa a release. |
| `release:verify` | `tsx scripts/release-verify.ts` | Verificación de release. |

## Scripts de migración

| Script | Comando | Descripción |
|--------|---------|-------------|
| `migrate:tenant` | `tsx scripts/migrate-tenant-id.ts` | Migrar tenant ID. |
| `migrate:tenant-scope` | `tsx scripts/migrate-tenant-scope.ts` | Migrar scope de tenant. |
| `migrate:drop-tenant-id` | `tsx scripts/drop-tenant-id-column.ts` | Eliminar columna tenant_id. |

## Scripts de admin

| Script | Comando | Descripción |
|--------|---------|-------------|
| `admin:create` | `tsx scripts/admin-create.ts` | Crear admin. |
| `roles:export` | `tsx scripts/export-roles-public.ts` | Exportar roles públicos. |

## Scripts de auditoría

| Script | Comando | Descripción |
|--------|---------|-------------|
| `audit:contracts` | `tsx scripts/audits/contracts.ts` | Auditar contratos de dominio vs implementación. |
| `audit:idempotency` | `tsx scripts/audits/idempotency.ts` | Auditar marcas de idempotencia. |
| `audit:anchors` | `tsx scripts/audits/anchors.ts` | Auditar anclas. |
| `audit:tenant-default` | `tsx scripts/audits/tenant-default.ts` | Auditar uso de 'default' hardcodeado. |
| `audit:coherence` | `pnpm audit:layers && pnpm audit:bridges && pnpm audit:console && pnpm audit:anchors && pnpm audit:contracts && pnpm audit:idempotency && pnpm audit:tenant-default` | Ejecutar todos los audits seguidos. |
| `audit:layers` | `tsx scripts/audits/layers.ts` | Auditar capas. |
| `audit:bridges` | `tsx scripts/audits/bridges.ts` | Auditar puentes. |
| `audit:console` | `tsx scripts/audits/no-console.ts` | Auditar uso de console. |

## Scripts eliminados

| Script | Motivo |
|--------|--------|
| `seed-agents.ts` | Eliminado (`SEED_AGENTS_REMOVED` en package.json). |

## Convenciones para scripts

- Los scripts no viven en `docs/`, viven en `scripts/`.
- Cada script debe ser ejecutable con `tsx`.
- Los scripts de auditoría generan documentación en `docs/audits/`.
