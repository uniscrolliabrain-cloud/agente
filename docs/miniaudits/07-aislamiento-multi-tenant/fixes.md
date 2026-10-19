<!-- FIXES_07_MVP_V1 -->
# Fixes — aislamiento multi-tenant

> v2 · 2026-10-17 · Estado: MVP cerrado (clone-por-cliente)
> Campaña: 4 bloques, 11 patchsets. Ver `CIERRE-MVP.md` para criterios.
> Los documentos anteriores están archivados en `old/`.

## Leyenda de estados

- `confirmed`: bug verificado en el código real.
- `false-positive`: el miniaudit lo listaba pero el código ya lo resuelve.
- `implemented`: parche aplicado y con marca.
- `verified`: parche aplicado y test que lo cubre pasa.
- `out-of-mvp`: fuera del alcance de esta campaña, documentado en `fuera-de-mvp.md`.

## Fixes aplicados en el MVP

| ID | Hueco | Archivo | Estado | Marca | Test |
|---|---|---|---|---|---|
| 07-A1 | `files.import` con `"default"` hardcodeado (D3+D19) | `apps/server/src/app.ts` | implemented | `APP_FILES_IMPORT_TENANT_V1` | `tenant-http-e2e.test.ts` |
| 07-A2 | `scan()` usa solo el primer prefix de tenant (D30) | `apps/server/src/db-tenant.ts` | implemented | `TENANT_SCAN_ALL_PREFIXES_V1` | pendiente |
| 07-A3 | Sin validar `tenantId` de request vs owner (D10) | `apps/server/src/app.ts` | implemented | `APP_TENANT_REQUEST_VALIDATE_V1` | `tenant-http-e2e.test.ts` (tenant mismatch → 403) |
| 07-A4 | `/notifications` sin `tenantId` explícito (D18) | `apps/server/src/engine/routes.ts` | implemented | `ROUTES_NOTIFICATIONS_TENANT_V1` | `tenant-http-e2e.test.ts` |
| 07-A5 | `withTenantRls` con `set_config` fuera de transacción (D22) | `apps/server/src/db-rls.ts` | implemented | `DB_RLS_TX_CONTEXT_V1` | pendiente (requiere Postgres real) |
| 07-A6 | Test E2E multi-tenant (D16) | `tests/tenant-http-e2e.test.ts` | implemented (esqueleto) | `TENANT_HTTP_E2E_V1` | pendiente de ajuste |

## Falsos positivos confirmados

| ID | Hueco del miniaudit | Por qué es falso positivo |
|---|---|---|
| 07-FP1 | Files/Rag/Workspace con `db` crudo (D1) | `app.ts` ya pasa `tdbEarly` a los tres. Verificado en Repomix. |
| 07-FP2 | Falta índice `(owner, kind)` (D8) | `db.ts` ya crea `records_owner_kind_updated_idx ON records(owner, kind, updated_at DESC, id DESC)`. |
| 07-FP3 | `setMembership` no invalida caché (D2) | `setMembership` hace `this.cache.set(owner, {tenantId, ...})` tras el `put`. La caché queda actualizada. |

## Fuera del MVP

Los 21 aspectos restantes están documentados en `fuera-de-mvp.md` con motivo y fase futura.

## Cómo verificar

```powershell
Select-String -Path "apps/server/src/app.ts","apps/server/src/db-tenant.ts","apps/server/src/engine/routes.ts","apps/server/src/db-rls.ts" -Pattern "APP_FILES_IMPORT_TENANT_V1|TENANT_SCAN_ALL_PREFIXES_V1|APP_TENANT_REQUEST_VALIDATE_V1|ROUTES_NOTIFICATIONS_TENANT_V1|DB_RLS_TX_CONTEXT_V1"
pnpm --filter @openmuse/server exec tsc --noEmit
```
