# Roadmap — 07 aislamiento multi-tenant

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Un tenant no ve a otro. Un deployment por cliente.

## 2. Estado verificado
- TenantScopedStore con peel y scanByOwnerPrefix.
- 2 ocurrencias prohibidas de "default".
- Fuente: repodump db-tenant.ts, db-rls.ts,
  docs/audits/_prep/audit-tenant-default.txt.

## 3. Huecos contra producción
- RLS no activa por defecto.
- service.ts con scans globales.
- Files y Rag con db crudo en algunos callers.
- Cache de 5 min de TenantService.
- Sin test de 50 tenants concurrentes.

## 4. Objetivo
Cero fugas verificables con 50 tenants concurrentes.

## 5. Fronteras
- No tenant por subdominio todavía.

## 6. Conexiones
- Depende de: 16.
- Dependen de esta: 04, 05.
- Archivos compartidos: db.ts, db-tenant.ts, db-rls.ts, service.ts.

## 7. Principios del PRODUCT.md
Memoria curada.

## 8. Cómo se verifica el cierre
- Test con 50 tenants concurrentes.
- 0 ocurrencias prohibidas de "default".
- RLS activa con MULTI_TENANT_SHARED=true.
