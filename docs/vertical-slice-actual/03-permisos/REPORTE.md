# Campaña 03 · Permisos por actor, revocación y suspensión — REPORTE

**Fecha:** 2026-11-08T18:05Z
**Base:** `main` = `909da27` (cierre de la campaña 02)
**Estado:** **gate de campaña cumplido**

## Qué se ha creado y modificado

### Crear

- `apps/server/src/engine/authz/tenant-permissions.ts` — matriz cerrada de permisos por rol de empresa (`owner`, `admin`, `member`), `assertPermission`, `assertTenantActive` y `tenantAccess` (membership fresca + estado + permiso en una sola decisión).
- `tests/tenant-permissions.test.ts` — 7 casos: matriz, denegación explícita, suspensión, decisión completa, administración cruzada, kill switch HTTP y revocación en caliente HTTP.

### Modificar

- `apps/server/src/engine/tenant.ts` — `findMembership()` (lectura **sin caché**), `removeMembership()`, `tenantState()`.
- `apps/server/src/tenant-principal.ts` — nuevo fallo `TENANT_SUSPENDED` (403); el estado de la empresa se consulta en **cada** petición, también con JWT.
- `apps/server/src/app.ts` — cablea `tenantState` al principal.
- `apps/server/src/auth-signup.ts` — el alta pública creaba el usuario con `role: "admin"`, que es el rol de **plataforma**.

## El agujero real que cerró la 03.P3

`user.role` (`admin` | `user`) es un rol de plataforma y la membership (`owner` | `admin` | `member`) es un rol de empresa. El alta pública concedía `admin`, así que **cualquiera que se registrara entraba en `/api/admin/tenants` y podía suspender o borrar otras empresas**. La 03 lo corta en el origen: el alta crea `user`, y el privilegio de plataforma sólo lo concede un operador.

El test lo acredita por HTTP: una cuenta con membership `owner` en su empresa recibe **403** al listar tenants y al intentar suspender otra empresa.

## Revocación en caliente

La decisión de permisos no usa el caché de `TenantService`: `findMembership()` lee el store. El caché sigue sirviendo para **enrutar** (resolver tenant), no para autorizar. El test añade a un usuario a `tenant-z`, comprueba `switch-tenant` 200, revoca la membership, y la siguiente llamada da **403**, igual que pedir el tenant por `x-tenant-id`.

## Evidencia

```
typecheck                        exit=0
tests/tenant-permissions.test.ts 7/7 pass, exit=0
tenant-cache + http-e2e + principal + isolation + auth + agent-api  38/38 pass, exit=0
pnpm test                        590 tests · 573 pass · 0 fail · 12 skipped, exit=0
```

## Aserción de cierre

> Revocación en caliente corta acceso y una cuenta de empresa no administra otras empresas.

**Cumplida y probada por HTTP**, no sólo por unidad: 403 al administrar otra empresa, 403 al cambiar a un tenant revocado, y el kill switch corta y devuelve el acceso al reanudar.

## Lo que la 03 deja a medias, a propósito

- `assertPermission("...", "actions.approve")` existe y está probado, pero **ninguna ruta lo exige todavía**: el despacho de acciones es la campaña 14. Aquí se entrega el contrato y su cableado en el principal.
- El alta pública sigue detrás de `SIGNUP_ENABLED`; sacarla del flujo de piloto es una decisión de operación, no de código.
- La UI no muestra permisos: el panel llega en la 20.

## Entrega a la campaña 04

- `tenantAccess()` como decisión única para operaciones sensibles: la 04 la usa para propiedad de registros.
- `findMembership()` como lectura de autorización sin caché.
- `TENANT_SUSPENDED` ya corta cualquier petición, así que la 04 no tiene que repetir el guard.
