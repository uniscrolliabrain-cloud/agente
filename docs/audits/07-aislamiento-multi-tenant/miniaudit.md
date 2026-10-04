# 07 — Aislamiento multi-tenant

> v1 · 2026-10-04 · Estado: audited
> Fuente: audit-tenant-default.txt, repodump db-tenant.ts, db-rls.ts

## Ontología del área

Conceptos: `Tenant`, `Owner`, `Membership`, `TenantScopedStore`, `peel`,
`scanByOwnerPrefix`, RLS, `MULTI_TENANT_SHARED`.

## Estado real del código

- `TenantScopedStore` envuelve `Store` y compone `tenantId:owner`.
- `peel(owner)` quita el prefijo al leer.
- `Store.scanByOwnerPrefix(kind, prefix, limit)` filtra por prefijo en SQL.
- `db-rls.ts` con `enableRls` opcional.
- `TenantService` con cache de 5 min.

## Evidencia

De `audit-tenant-default.txt`:
- 63 ocurrencias permitidas (comentarios, fallbacks declarados, tests).
- **2 ocurrencias prohibidas**. Casi nada.

Traducción ontológica: **el aislamiento multi-tenant está mucho más limpio
de lo que se suele asumir**. Los 2 casos prohibidos son puntos concretos,
no un problema estructural.

## Huecos concretos

- **RLS no activa por defecto**. `MULTI_TENANT_SHARED` debe estar en `true`.
- **`service.ts` con scans globales**: `collectActiveTenants` escanea
  `tenant-membership` hasta 5000; `maintainTenant` escanea `agent-settings`
  hasta 500.
- **`Files` y `Rag` reciben `db` crudo en algunos callers**. Los artifacts
  no aparecen en `agent.detail()` cuando se crean desde SOPs.
- **Cache de 5 min** de `TenantService`. Si se mueve a un usuario de tenant,
  sigue escribiendo en el viejo hasta 5 min.
- **No hay tests de fugas cruzadas con N tenants concurrentes**. Solo
  `tenant-isolation.test.ts` con 2.

## Interrelación

- Transversal a todo el almacenamiento.
- Comparte `db.ts` con `04-multi-usuario-concurrente`,
  `05-motor-tareas-durable`.
- Depende de `16-autenticacion` para resolver el owner real.

## Riesgos

- Fuga silenciosa: un tenant ve filas de otro y nadie lo nota.
- Cache de `TenantService` desactualizada tras mover un usuario.
- RLS desactivada por defecto.

## Tipo de fixes

1. `MULTI_TENANT_SHARED=true` por defecto en multi-tenant.
2. Reescribir `maintainTenant` para usar `scanByOwnerPrefix`.
3. Auditar todos los `this.db.list` en `service.ts`.
4. `Files` y `Rag` con `tdb` en todos los callers.
5. Test de 50 tenants concurrentes.
