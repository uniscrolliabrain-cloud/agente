# Campaña 02 · Principal canónico y selección de empresa — REPORTE

**Fecha:** 2026-11-08T17:15Z
**Base:** `main` = `480769a` (cierre de la campaña 01)
**Estado:** **gate de campaña CUMPLIDO**, con una decisión de diseño documentada abajo

## Qué se ha creado y modificado

### Crear

- `apps/server/src/tenant-principal.ts` — resolución única de tenant, actor, membership y requestId. Distingue 403 `NO_MEMBERSHIP`, 403 `TENANT_MISMATCH` y 503 `DB_UNAVAILABLE`.
- `tests/tenant-principal.test.ts` — 11 casos, incluido el de DB caída contra el `TenantService` real.

### Modificar

- `apps/server/src/app.ts` — el middleware deja de hacer `tenantIdFor(owner).catch(() => "default")` y llama al principal. El guard `?tenantId=` vive ahora dentro del principal, no duplicado.
- `apps/server/src/engine/tenant.ts` — nuevo `resolveStrict()`: misma resolución (membership + migración legacy) **sin tragarse** el fallo del store. `resolve()` conserva el comportamiento previo.

## La decisión que cambió el diseño

El primer intento cortaba el fallback a `default` en todo modo `live`. Eso tumbó un test heredado de `tests/agent-api.test.ts`: un usuario sin membership en `live` recibía **403** donde esperaba **404** de un endpoint oculto.

El test tenía razón. El plan dice "acotar el fallback al **modo legacy existente**", y el modo legacy es `AUTH_PROVIDER=session` (single-tenant), no `mode: live` (que sólo distingue sample de producción). Con el corte por `mode`, cualquier despliegue single-tenant que pasara a live se quedaba fuera de su propia API.

Solución: `legacyFallbackAllowed = mode === "sample" || authProvider === "session"`. El fallback sobrevive donde el single-tenant existe y desaparece en cuanto el despliegue es multitenant. **El test no se ha tocado.**

## Evidencia

```
typecheck                      exit=0
tests/tenant-principal.test.ts 11/11 pass, exit=0
tenant-http-e2e + tenant-cache + tenant-isolation + agent-api   22/22 pass, exit=0
pnpm test                      583 tests · 566 pass · 0 fail · 12 skipped, exit=0
pnpm verify:slice              5/5 pasos OK, exit=0
pnpm audit:tenant-default      140 permitidas · 0 prohibidas, exit=0
layers / bridges / console / anchors / idempotency              exit=0
pnpm audit:contracts           exit=1 (79 huérfanos, heredado)
```

Casos cubiertos por el test nuevo: membership resuelve tenant y sintetiza actor · el JWT manda y conserva su actor · JWT con tenant ajeno → 403 sin caer a default · tenant de sesión usado si sigue siendo miembro · tenant de sesión ignorado si le revocaron el acceso · sin membership con auth multitenant → 403 · sin membership en modo legacy → `default` · DB caída → 503 · tenant pedido distinto → 403 · tenant propio no rompe · `TenantService.resolveStrict` propaga la caída real.

## Aserción de cierre

> Dos pestañas A/B funcionan; tenant ajeno, scope alterado y DB caída fallan sin caer a `default`.

**Cumplida en lo verificable sin staging:** tenant ajeno → 403 `TENANT_MISMATCH`; scope alterado (`?tenantId=`/`x-tenant-id` distinto) → 403; DB caída → 503 `DB_UNAVAILABLE`. Las dos pestañas A/B siguen acreditadas por `tests/tenant-http-e2e.test.ts` (login con dos cuentas y aislamiento de tareas).

## Alcance real de P3 (honesto)

El principal se propaga por el `ctx` de la petición (`tenantId`, `actor`, `actorId`, `owner`) y por el `AsyncLocalStorage` de `tenant-scope`, que es lo que consumen servicios, store y engine. **No** se ha añadido un canal nuevo hacia CopilotKit: su runtime ya lee del mismo ctx y del scope. Si la 13/20 necesita un campo propio en el runtime, se añade allí con su test.

## No verificado

- Las dos pestañas A/B contra staging con Postgres real (no hay credenciales en este sandbox).
- El modo `AUTH_PROVIDER=supabase` de punta a punta: la lógica está cubierta por el test unitario, pero no hay proyecto Supabase configurado aquí.

## Rollback

1. Revertir `app.ts` al bloque `FALLBACK_TENANT_V1` anterior.
2. Borrar `tenant-principal.ts` y `tests/tenant-principal.test.ts`.
3. `resolveStrict()` puede quedarse: es aditivo y no cambia `resolve()`.

## Entrega a la campaña 03

- `resolveTenantPrincipal` como punto único: la 03 añade permisos por actor encima, sin volver a leer cabeceras.
- `principal.actor` y `principal.source` disponibles en el middleware para la política de permisos.
- Pendiente que la 03 hereda: hoy el rol global de `signup` no se distingue del rol de empresa.
