# 07 — Aislamiento multi-tenant

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: audit-tenant-default.txt, repodump db-tenant.ts, db-rls.ts, service.ts, app.ts, código real tras bloques 01-09

## Ontología

Tenant, Owner, Membership, TenantScopedStore, peel, scanByOwnerPrefix, RLS, MULTI_TENANT_SHARED.

## Estado real

TenantScopedStore envuelve Store y compone tenantId:owner. peel(owner) quita el prefijo al leer. Store.scanByOwnerPrefix filtra por prefijo en SQL. db-rls.ts con enableRls opcional. TenantService con cache de 5 min.

## Evidencia

De audit-tenant-default.txt: 63 ocurrencias permitidas, 2 prohibidas. Aislamiento mucho más limpio de lo que se suele asumir. Los 2 casos son puntos concretos, no estructurales.

## Huecos declarados

- RLS no activa por defecto.
- service.ts con scans globales (collectActiveTenants hasta 5000, maintainTenant hasta 500).
- Files y Rag con db crudo en algunos callers.
- Cache de 5 min de TenantService.
- Sin tests de fugas con N tenants.

## Huecos profundos (auditoría extendida)

1. **`Files`, `Rag`, `WorkspaceService` reciben `db` crudo en app.ts**: sus writes van con owner plano, los reads con tenantId:owner. Invisible hasta que los artifacts no aparecen.
2. **`TenantService.cache` sin invalidación por evento**: si un admin mueve un owner de tenant, la cache sigue vieja 5 min.
3. **`collectActiveTenants` escanea 5000 filas de `agent-settings`**: con 50 tenants son 50×5000 = 250.000 filas/minuto.
4. **`maintainTenant` itera owners secuencialmente**: 50 owners × 1s cada uno = 50s por tenant, 25 min con 30 tenants.
5. **Sin rate limit por tenant real**: `takeForTenant` existe pero solo se llama en createTask. Chat, RAG, files sin límite.
6. **`tenantPrefixes` guardaba solo el último**: bug corregido en 07-01 pero documentado.
7. **`db.scanByOwnerPrefix` sin índice dedicado**: el LIKE '%' no usa índice. Con 1M filas, 1s por scan.
8. **Sin índice `(owner, kind)` en `records`**: cada query filtra por owner+kind sin índice compuesto. La PK es `(owner, kind, id)`, no sirve para scans por owner+kind.
9. **`db-rls.ts` no se activa salvo flag explícito**: 99% de deployments no usan RLS. La seguridad depende del código, no de la DB.
10. **Sin verificación de que el tenantId del request coincida con el tenantId del owner**: si un request autenticado pasa un tenantId distinto, nadie lo valida.
11. **Sin auditoría de accesos cross-tenant**: si un bug causa un leak, no hay log.
12. **`onboarding` no verifica tenant**: cualquier usuario de cualquier tenant puede listar los clientes.
13. **Sin `tenantId` en las respuestas HTTP**: el cliente no sabe en qué tenant está.
14. **Sin "elegir tenant activo"**: un usuario multi-tenant no puede cambiar de tenant.
15. **Sin migración segura de owner → tenantId:owner**: `scripts/migrate-tenant-scope.ts` sin transacción.
16. **Sin "fugas" test con N=500 tenants**: el test 07-13 cubre 50. Con 500 hay más presión.
17. **`audit-entries` sin tenant check**: el `StoreAuditStore` escribe en `tenantId` como clave de tenant, pero si un tenantId es malicioso, contamina el namespace.
18. **`notifications` sin tenant filter**: las notificaciones van al owner sin verificar tenant.
19. **`Files.import` con `tenantId` opcional**: default "default". Un caller que olvide pasarlo escribe bajo "default".
20. **Sin "tenant switcher" en el frontend**: multi-tenant real no es usable.

## Interrelación

Transversal al almacenamiento. Comparte db.ts con 04 y 05. Depende de 16.

## Riesgos

Fuga silenciosa. Cache desactualizada tras mover usuario. RLS desactivada.

## Tipo de fixes

MULTI_TENANT_SHARED=true por defecto. maintainTenant con scanByOwnerPrefix. Auditar this.db.list en service.ts. Files y Rag con tdb. Test de 50 tenants. Índice (owner, kind). RLS por defecto o doc. Tenant switcher. Rate limit por tenant en más sitios.
