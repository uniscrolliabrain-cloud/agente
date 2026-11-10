# Bloque 08 · Aislamiento multi-tenant

> Campaña UX · 2026-11-10 · **sin informe**
> Estado: **hueco declarado**. El auditor no entregó el bloque 08; no se rellena con
> material inventado.

## Qué se sabe por otras fuentes

El aislamiento sí está cubierto, aunque no por este informe:

- **Campaña ACME (E15–E19)**: tenant siempre desde `ctx.tenantId`, 403
  `TENANT_REQUIRED` sin empresa, lecturas por `scanByPrefix(kind, tenantId)` y
  escrituras bajo prefijo `acme:` verificado en cada `put`.
- **Suites**: `tests/tenant-isolation.test.ts`, `tenant-isolation-extended`,
  `tenant-http-e2e`, `tenant-principal`, `tenant-permissions`,
  `tenant-acme-isolation` (6), `workspaces-tenant` (5), `analytics-overview` (5).
- **Hallazgos de otros bloques que tocan este área**: 01-2 (queries `ws-*` sin
  integrations), 06-5 (ya arreglado: `scanByStatusWithTenant`), 09-10
  (`resolveTenant` cae al owner), 14-4 (`?? owner` en `/api/views/resolve`),
  17-2 (sesión de usuario desactivado sigue viva), 18-4 (RLS condicionada a
  Postgres + `MULTI_TENANT_SHARED`).

## Auditoría propuesta (lo que debería contener el 08)

1. **Inventario de superficies**: toda ruta que lea o escriba datos, con la fuente
   del tenant anotada (ctx, ruta validada, body, owner). Cualquier `body` o `owner`
   es un hallazgo.
2. **Store**: claves `${tenantId}:${owner}`, `scanByPrefix` sin fuga entre
   prefijos (`acme` vs `acme-otro`), y qué pasa con `tenantId` vacío o con `:`.
3. **RLS**: cuándo se activa de verdad y qué garantiza cuando no.
4. **Sesiones**: cambio de empresa, usuario desactivado, token viejo tras
   `switch-tenant`.
5. **Prueba de dos tenants** por superficie, con datos cruzados y comprobación de
   que ninguno ve el id del otro.

## Plan

- **P1**: escribir el informe 08 con el inventario anterior, verificado contra
  `main` (`05126b1`).
- **P2**: convertir cada fila del inventario en un test de dos tenants.
- **P3**: añadir `audit:tenant-surfaces` al gate para que una ruta nueva sin tenant
  explícito falle en CI.

---

## Revisión de destino

El modelo vigente **no es un deployment por cliente**: es un deployment compartido con N tenants, resuelto en un único punto por `resolveTenantPrincipal` (`apps/server/src/tenant-principal.ts`): tenant del JWT, elección de sesión validada contra membership, membership durable, y `"default"` sólo con auth legacy (`session`) o modo sample. DB caída → 503, tenant ajeno → 403 `TENANT_MISMATCH`, empresa suspendida → 403. RLS (`MULTI_TENANT_SHARED=true`, `db-rls.ts`) es la defensa en profundidad. El "deployment por cliente" sobrevive en `PRODUCT.md`, `WHITEPAPER.md` y `TODO-FOR-PROD.md`, y contradice a `DEPLOY.md` §1 y al código. Con ese destino, faltan:

- **Que todas las rutas pasen por el principal**: hoy `/api/views/*` usa `tenantId ?? owner` y se salta el contrato que ya existe. Es el S0 real de este bloque.
- **PolicyEngine real**: hoy `canView: true` y `permissions: []`; el envelope promete permiso que el backend no comprueba.
- **Inventario de superficies** ruta por ruta, marcando cuáles resuelven tenant por principal y cuáles por parámetro.
- 404 —no 403— cuando el recurso es de otro tenant y no se quiere revelar su existencia; y RLS activo en el Postgres compartido, no opcional.

## Conclusión

El resolver ya distingue "sin membership", "DB caída" y "tenant ajeno"; el agujero es que las rutas de vistas no lo usan y toman el tenant del query string. Esa es la fuga real de un multitenant compartido, no un defecto teórico. **P0** antes de cualquier dato real; y el informe 08 debe escribirse con este alcance (una ruta, un tenant, un actor), no como listado de defectos.
