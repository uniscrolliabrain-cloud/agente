# 07 â€” Aislamiento multi-tenant

> v2 Â· 2026-10-04 Â· Estado: audited-deep
> Fuente: audit-tenant-default.txt, repodump db-tenant.ts, db-rls.ts, service.ts, app.ts, cÃ³digo real tras bloques 01-09

## OntologÃ­a

Tenant, Owner, Membership, TenantScopedStore, peel, scanByOwnerPrefix, RLS, MULTI_TENANT_SHARED.

## Estado real

TenantScopedStore envuelve Store y compone tenantId:owner. peel(owner) quita el prefijo al leer. Store.scanByOwnerPrefix filtra por prefijo en SQL. db-rls.ts con enableRls opcional. TenantService con cache de 5 min.

## Evidencia

De audit-tenant-default.txt: 63 ocurrencias permitidas, 2 prohibidas. Aislamiento mucho mÃ¡s limpio de lo que se suele asumir. Los 2 casos son puntos concretos, no estructurales.

## Huecos declarados

- RLS no activa por defecto.
- service.ts con scans globales (collectActiveTenants hasta 5000, maintainTenant hasta 500).
- Files y Rag con db crudo en algunos callers.
- Cache de 5 min de TenantService.
- Sin tests de fugas con N tenants.

## Huecos profundos (auditorÃ­a extendida)

1. **`Files`, `Rag`, `WorkspaceService` reciben `db` crudo en app.ts**: sus writes van con owner plano, los reads con tenantId:owner. Invisible hasta que los artifacts no aparecen.
2. **`TenantService.cache` sin invalidaciÃ³n por evento**: si un admin mueve un owner de tenant, la cache sigue vieja 5 min.
3. **`collectActiveTenants` escanea 5000 filas de `agent-settings`**: con 50 tenants son 50Ã—5000 = 250.000 filas/minuto.
4. **`maintainTenant` itera owners secuencialmente**: 50 owners Ã— 1s cada uno = 50s por tenant, 25 min con 30 tenants.
5. **Sin rate limit por tenant real**: `takeForTenant` existe pero solo se llama en createTask. Chat, RAG, files sin lÃ­mite.
6. **`tenantPrefixes` guardaba solo el Ãºltimo**: bug corregido en 07-01 pero documentado.
7. **`db.scanByOwnerPrefix` sin Ã­ndice dedicado**: el LIKE '%' no usa Ã­ndice. Con 1M filas, 1s por scan.
8. **Sin Ã­ndice `(owner, kind)` en `records`**: cada query filtra por owner+kind sin Ã­ndice compuesto. La PK es `(owner, kind, id)`, no sirve para scans por owner+kind.
9. **`db-rls.ts` no se activa salvo flag explÃ­cito**: 99% de deployments no usan RLS. La seguridad depende del cÃ³digo, no de la DB.
10. **Sin verificaciÃ³n de que el tenantId del request coincida con el tenantId del owner**: si un request autenticado pasa un tenantId distinto, nadie lo valida.
11. **Sin auditorÃ­a de accesos cross-tenant**: si un bug causa un leak, no hay log.
12. **`onboarding` no verifica tenant**: cualquier usuario de cualquier tenant puede listar los clientes.
13. **Sin `tenantId` en las respuestas HTTP**: el cliente no sabe en quÃ© tenant estÃ¡.
14. **Sin "elegir tenant activo"**: un usuario multi-tenant no puede cambiar de tenant.
15. **Sin migraciÃ³n segura de owner â†’ tenantId:owner**: `scripts/migrate-tenant-scope.ts` sin transacciÃ³n.
16. **Sin "fugas" test con N=500 tenants**: el test 07-13 cubre 50. Con 500 hay mÃ¡s presiÃ³n.
17. **`audit-entries` sin tenant check**: el `StoreAuditStore` escribe en `tenantId` como clave de tenant, pero si un tenantId es malicioso, contamina el namespace.
18. **`notifications` sin tenant filter**: las notificaciones van al owner sin verificar tenant.
19. **`Files.import` con `tenantId` opcional**: default "default". Un caller que olvide pasarlo escribe bajo "default".
20. **Sin "tenant switcher" en el frontend**: multi-tenant real no es usable.

## Ruta a multi-tenant real

> RUTA_MULTITENANT_REAL_V1 — inventario de que falta para pasar de
> clone-por-cliente a SaaS multi-tenant.

### Ya listo

TenantService, TenantScopedStore, ServiceTenantResolver, db-rls, auditor tenant-default, tests 50 tenants, backup-tenant, auth-signup con slug.

### Falta por capa

**Auth / JWT**
- Sesion sin tenantId. Falta /api/auth/switch-tenant. Falta rol por membresia.
- DatabaseTenantResolver espera tabla tenant_members que no existe.

**DB**
- records sin columna tenant_id separada. owner es string tenantId:owner.
- DatabaseTenantConfigResolver espera tabla tenant_configs que no existe.
- scanByStatus global.
- Faltan tablas usage_events y tenant_quotas.

**LLM keys por tenant**
- EnvTenantConfigResolver lee de .env. DatabaseTenantConfigResolver existe pero no se inyecta.

**Cuotas**
- takeForTenant solo en createTask. Chat, RAG, files sin limite.

**Billing**
- No existe. recordUsage escribe llm-usage por owner; se puede extender.

**Observabilidad**
- logContext sin tenantId. Metricas sin label tenant.

**Notificaciones**
- notification-prefs con id "default". notifications sin filtro tenant.

**Files / RAG / Workspace**
- Algunos callers usan db.put directo sin tdb.
- Files.import acepta tenantId opcional con default "default".

**Computer**
- computer-routes y computer-tools hardcodean "default".
- computerIdentity no incluye tenant.

**Backups**
- runTenantBackup busca dataDir/tenants/<id>/files pero Files escribe a dataDir/files.

**Tests**
- No hay test HTTP end-to-end multi-tenant.

**Frontend**
- No hay tenant switcher.

### Decisiones pendientes

1. Modelo: SaaS o clone-por-cliente.
2. Aislamiento: mismo Postgres con RLS o separado.
3. Facturacion: dia 1 o despues.
4. Membresia: varios tenants por usuario o uno.
5. API keys: del tenant o del deployment.

### Plan por fases

- Fase 1: preparar sin activar (tenant_id, tenant_members, tenant_configs, cablear DatabaseTenantConfigResolver).
- Fase 2: activar auth (tenantId en sesion, switch-tenant, rol por membresia, logContext.tenantId).
- Fase 3: cuotas y observabilidad (takeForTenant en chat/RAG/files, label tenant).
- Fase 4: billing (usage_events, agregacion, factura).
- Fase 5: tests end-to-end y tenant switcher.
- Fase 6: migrar cliente 1 a SaaS.

### Riesgos

- Bug de aislamiento = fuga entre clientes.
- TenantService cacheado: si admin mueve owner, cache vieja.
- Files/Rag/Workspace con db crudo: un fix que olvide tdb escribe bajo "default".
- scanByStatus global: si no se filtra, lee todo.
## InterrelaciÃ³n

Transversal al almacenamiento. Comparte db.ts con 04 y 05. Depende de 16.

## Riesgos

Fuga silenciosa. Cache desactualizada tras mover usuario. RLS desactivada.

## Tipo de fixes

MULTI_TENANT_SHARED=true por defecto. maintainTenant con scanByOwnerPrefix. Auditar this.db.list en service.ts. Files y Rag con tdb. Test de 50 tenants. Ãndice (owner, kind). RLS por defecto o doc. Tenant switcher. Rate limit por tenant en mÃ¡s sitios.
