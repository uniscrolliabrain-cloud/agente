<!-- FIXES_07_MVP_V1 -->
# Fixes ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â aislamiento multi-tenant

> v2 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· 2026-10-17 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· Estado: MVP cerrado (clone-por-cliente)
> CampaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±a: 4 bloques, 11 patchsets. Ver `CIERRE-MVP.md` para criterios.
> Los documentos anteriores estÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡n archivados en `old/`.

## Leyenda de estados

- `confirmed`: bug verificado en el cÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³digo real.
- `false-positive`: el miniaudit lo listaba pero el cÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³digo ya lo resuelve.
- `implemented`: parche aplicado y con marca.
- `verified`: parche aplicado y test que lo cubre pasa.
- `out-of-mvp`: fuera del alcance de esta campaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±a, documentado en `fuera-de-mvp.md`.

## Fixes aplicados en el MVP

| ID | Hueco | Archivo | Estado | Marca | Test |
|---|---|---|---|---|---|
| 07-A1 | `files.import` con `"default"` hardcodeado (D3+D19) | `apps/server/src/app.ts` | implemented | `APP_FILES_IMPORT_TENANT_V1` | `tenant-http-e2e.test.ts` |
| 07-A2 | `scan()` usa solo el primer prefix de tenant (D30) | `apps/server/src/db-tenant.ts` | implemented | `TENANT_SCAN_ALL_PREFIXES_V1` | pendiente |
| 07-A3 | Sin validar `tenantId` de request vs owner (D10) | `apps/server/src/app.ts` | implemented | `APP_TENANT_REQUEST_VALIDATE_V1` | `tenant-http-e2e.test.ts` (tenant mismatch ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ 403) |
| 07-A4 | `/notifications` sin `tenantId` explÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­cito (D18) | `apps/server/src/engine/routes.ts` | implemented | `ROUTES_NOTIFICATIONS_TENANT_V1` | `tenant-http-e2e.test.ts` |
| 07-A5 | `withTenantRls` con `set_config` fuera de transacciÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n (D22) | `apps/server/src/db-rls.ts` | implemented | `DB_RLS_TX_CONTEXT_V1` | pendiente (requiere Postgres real) |
| 07-A6 | Test E2E multi-tenant (D16) | `tests/tenant-http-e2e.test.ts` | implemented (esqueleto) | `TENANT_HTTP_E2E_V1` | pendiente de ajuste |

## Falsos positivos confirmados

| ID | Hueco del miniaudit | Por quÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© es falso positivo |
|---|---|---|
| 07-FP1 | Files/Rag/Workspace con `db` crudo (D1) | `app.ts` ya pasa `tdbEarly` a los tres. Verificado en Repomix. |
| 07-FP2 | Falta ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­ndice `(owner, kind)` (D8) | `db.ts` ya crea `records_owner_kind_updated_idx ON records(owner, kind, updated_at DESC, id DESC)`. |
| 07-FP3 | `setMembership` no invalida cachÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© (D2) | `setMembership` hace `this.cache.set(owner, {tenantId, ...})` tras el `put`. La cachÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© queda actualizada. |

## Fuera del MVP

Los 21 aspectos restantes estÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡n documentados en `fuera-de-mvp.md` con motivo y fase futura.

## CÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³mo verificar

```powershell
Select-String -Path "apps/server/src/app.ts","apps/server/src/db-tenant.ts","apps/server/src/engine/routes.ts","apps/server/src/db-rls.ts" -Pattern "APP_FILES_IMPORT_TENANT_V1|TENANT_SCAN_ALL_PREFIXES_V1|APP_TENANT_REQUEST_VALIDATE_V1|ROUTES_NOTIFICATIONS_TENANT_V1|DB_RLS_TX_CONTEXT_V1"
pnpm --filter @openmuse/server exec tsc --noEmit
```

<!-- MULTITENANT_FIXES_A1_V1 -->
## A.1 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Los 20 huecos del miniaudit cruzados con cÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³digo real

> Verificado contra `repomix-inventario-07-definitivo.md` y cÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³digo real.

| ID | Hueco | Estado real | Evidencia | Fix propuesto |
|---|---|---|---|---|
| D1 | Files/Rag/Workspace con db crudo | FALSO POSITIVO | app.ts pasa tdbEarly a los 3 | ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â |
| D2 | TenantService.cache sin invalidaciÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n | FALSO POSITIVO | setMembership hace cache.set tras put | ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â |
| D3 | 2 usos prohibidos de default | CONFIRMADO | bus.ts:109, views.ts:20 | F04.2, F04.3 |
| D4 | collectActiveTenants escanea 5000 | NO VERIFICABLE | service.ts no en Repomix | pendiente |
| D5 | maintainTenant secuencial | NO VERIFICABLE | service.ts no en Repomix | pendiente |
| D6 | takeForTenant solo en createTask | CONFIRMADO | rate-limit.ts no en Repomix | F04.16-F04.18 |
| D7 | scanByOwnerPrefix sin ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­ndice | CONFIRMADO | db.ts usa LIKE sin ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­ndice | F04.7 |
| D8 | Falta ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­ndice (owner, kind) | FALSO POSITIVO | records_owner_kind_updated_idx existe | ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â |
| D9 | RLS opcional | CONFIRMADO | MULTI_TENANT_SHARED !== 'true' | F03.30, F03.38 |
| D10 | Sin verificar tenantId request vs owner | PARCIAL | PS05 query/header, no body | F03.35 |
| D11 | Sin auditorÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a cross-tenant | CONFIRMADO | no hay log | F03.31 |
| D12 | onboarding sin verificar tenant | NO VERIFICABLE | onboarding*.ts no en Repomix | pendiente |
| D13 | Sin tenantId en respuestas HTTP | PARCIAL | PS06 solo /notifications | F04.21 |
| D14 | Sin elegir tenant activo | CONFIRMADO | no hay /switch-tenant | CampaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±a 2 |
| D15 | MigraciÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n ownerÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢tenant sin transacciÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n | NO VERIFICABLE | scripts/migrate-tenant-scope.ts | F04.11 |
| D16 | Sin test N=500 | CONFIRMADO | solo N=50 | F05.1 |
| D17 | audit-entries sin tenant check | NO VERIFICABLE | kernel/audit/ no en Repomix | F03.11 |
| D18 | notifications sin tenant filter | PARCIAL | tdb compone tenantId:owner | F04.21 |
| D19 | Files.import tenantId opcional | PARCIAL | PS02 quitÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³ default, files.ts acepta opcional | F02.19 |
| D20 | Sin tenant switcher frontend | CONFIRMADO | client.ts sin tenant | CampaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±a 2 |

<!-- MULTITENANT_FIXES_A2_V1 -->
## A.2 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Los 12 fixes del 127-audit con estado aplicado/verificado

| ID | Fix propuesto | Estado | Marca | Verificado |
|---|---|---|---|---|
| 07-A1 | Auditar cableado Store en app.ts | FALSO POSITIVO | ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â | Repomix |
| 07-A2 | Completar cobertura TenantScopedStore | NO | ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â | ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â |
| 07-A3 | Revisar rutas Files/RAG/Workspace | PARCIAL | APP_FILES_IMPORT_TENANT_V1 | no |
| 07-A4 | Invalidar cachÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© al cambiar membresÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a | FALSO POSITIVO | ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â | Repomix |
| 07-A5 | Acotar scans y mantenimiento | PARCIAL | TENANT_SCAN_ALL_PREFIXES_V1 | no |
| 07-A6 | PolÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­tica RLS y activaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n por despliegue | PARCIAL | DB_RLS_TX_CONTEXT_V1 | no |
| 07-A7 | Cuotas en chat/RAG/files | NO | ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â | ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â |
| 07-A8 | Propagar tenant a workers | NO | ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â | ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â |
| 07-A9 | Corregir 2 usos prohibidos de default | PARCIAL | APP_FILES_IMPORT_TENANT_V1 + ROUTES_NOTIFICATIONS_TENANT_V1 | no |
| 07-A10 | Revisar ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­ndices con planes reales | FALSO POSITIVO | ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â | Repomix |
| 07-A11 | Pruebas de aislamiento E2E | PARCIAL | TENANT_HTTP_E2E_V1 | no (esqueleto) |
| 07-A12 | Documentar fixes.md con marcas | SÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â | MULTITENANT_FIXES_A1_V1 | este documento |

<!-- MULTITENANT_FIXES_A3_V1 -->
## A.3 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Las 10 pruebas mÃƒÆ’Ã‚Â­nimas del 127-audit con estado existe/pasa

| Test | Existe | Pasa | Fichero |
|---|---|---|---|
| A. Aislamiento de lectura | SÃƒÆ’Ã‚Â | NO EJECUTADO | tests/tenant-isolation.test.ts |
| B. Aislamiento de escritura | SÃƒÆ’Ã‚Â | NO EJECUTADO | tests/tenant-isolation.test.ts |
| C. EnumeraciÃƒÆ’Ã‚Â³n | NO | ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â | ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â |
| D. Files y RAG | PARCIAL | NO EJECUTADO | tests/tenant-http-e2e.test.ts (esqueleto) |
| E. Cambio de membresÃƒÆ’Ã‚Â­a | NO | ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â | ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â |
| F. Workers | NO | ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â | ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â |
| G. RLS | NO | ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â | ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â |
| H. Scans y rendimiento | NO | ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â | ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â |
| I. Usos de default | NO | ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â | auditor no ejecutado |
| J. Cuotas | NO | ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â | ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â |

**Existen: 2 (+1 parcial). Pasan: 0. Ejecutados: 0.**

<!-- MULTITENANT_FIXES_A4_V1 -->
## A.4 Ã¢â‚¬â€ Las 5 P0 del multitenant-gpt con estado

| # | ImplementaciÃƒÂ³n | Estado | Evidencia | Fix propuesto |
|---|---|---|---|---|
| 01 | Contexto de tenant obligatorio e inmutable | PARCIAL | PS05 query/header, no body | F03.35 |
| 02 | Eliminar accesos que se saltan el aislamiento | FALSO POSITIVO | ya estÃƒÂ¡n con tdb | Ã¢â‚¬â€ |
| 03 | RLS PostgreSQL corregida y operativa | PARCIAL | PS07 transaction, no activa | F03.30, F03.38 |
| 07 | Pruebas adversariales a escala | NO | Ã¢â‚¬â€ | F05.1 |
| 10 | Pruebas HTTP end-to-end | ESQUELETO | TENANT_HTTP_E2E_V1 | F05.1 |

**Parciales: 2. Falso positivo: 1. No: 2.**

<!-- MULTITENANT_FIXES_A6_V1 -->
## A.6 â€” Las 6 marcas de la campaÃ±a 07, verificadas contra cÃ³digo

| Marca | Archivo | Estado | Hace lo que dice |
|---|---|---|---|
| APP_FILES_IMPORT_TENANT_V1 | app.ts | OK (1) | parcial: files.ts sigue aceptando tenantId opcional |
| TENANT_SCAN_ALL_PREFIXES_V1 | db-tenant.ts | OK (1) | parcial: scanByStatus no filtra (F02.5) |
| APP_TENANT_REQUEST_VALIDATE_V1 | app.ts | OK (1) | parcial: solo query/header, no body (F03.35) |
| ROUTES_NOTIFICATIONS_TENANT_V1 | engine/routes.ts | OK (1) | OK: respuesta incluye tenantId |
| DB_RLS_TX_CONTEXT_V1 | db-rls.ts | OK (1) | OK: withTenantRls usa transaction |
| TENANT_HTTP_E2E_V1 | tests/tenant-http-e2e.test.ts | OK (1) | esqueleto, no ejecutado (F05.1) |

**Todas las marcas existen. Ninguna estÃ¡ verificada por ejecuciÃ³n (tsc/test/audit).**

<!-- MULTITENANT_FIXES_A7_V1 -->
## A.7 — Los 3 falsos positivos del miniaudit, verificados

| ID | Hueco del miniaudit | ¿Sigue siendo FP? | Evidencia |
|---|---|---|---|
| D1 | Files/Rag/Workspace con db crudo | SÍ | app.ts pasa tdbEarly a los 3 (Repomix) |
| D8 | Falta índice (owner, kind) | SÍ | records_owner_kind_updated_idx existe en db.ts |
| D2 | setMembership no invalida caché | SÍ | setMembership hace cache.set tras put |

**Los 3 siguen siendo falsos positivos. No requieren fix.**
