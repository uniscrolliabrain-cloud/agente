# Campaña 05 · Postgres, SQL de negocio, SSE y enlaces — REPORTE

**Fecha:** 2026-11-08T19:30Z
**Base:** `main` = `bc41eb9` (cierre de la campaña 04)
**Estado:** **05.P1 y 05.P3 cerrados y probados**; 05.P2 (RLS con rol de staging) queda pendiente y declarado

## El agujero que cierra la 05.P1

`config.ts` construía `businessDatabaseUrl` como `BUSINESS_DATABASE_URL || DATABASE_URL`. Cuando la variable dedicada faltaba, el SQL que escribe una SOP —interpolado, sin parámetros— se ejecutaba **contra la base de la aplicación**, con su rol de escritura y sin filtro por owner: cualquier `query_business` podía leer las filas de todos los tenants.

Ahora no hay fallback: sin `BUSINESS_DATABASE_URL` no se ejecuta SQL real. La consulta cae al dataset local **del owner de la petición**, que es el comportamiento que ya existía para `csv`/`sheets`.

## La 05.P3

`notifications-stream.ts` tomaba el usuario de la cabecera `x-user-id` y el tenant de `tenantIdFor(owner)` con fallback. Ahora usa el principal ya resuelto (`ctx.actorId`, `ctx.tenantId`); la cabecera no es autoridad. El filtro se extrajo a `notificationVisible()`, que se puede probar sin abrir un `ReadableStream`:

- aviso propio o general: visible;
- asignado a otro actor del mismo tenant: oculto;
- Laia (supervisora) ve los de su tenant, **pero no cruza de tenant**;
- fila legacy sin `tenantId`: se asume el del principal, no el de la fila.

## Qué se ha modificado

- `apps/server/src/config.ts` — `businessDatabaseUrl` sólo desde `BUSINESS_DATABASE_URL`.
- `apps/server/src/notifications-stream.ts` — `notificationVisible()` + filtro por principal, sin `x-user-id`.
- `tests/vertical-slice-postgres.test.ts` — 5 casos nuevos.

## Evidencia

```
typecheck                                 exit=0
tests/vertical-slice-postgres.test.ts     5/5 pass, exit=0
tests/concurrency.test.ts                 3/3 pass, exit=0
pnpm test                                 601 tests · 584 pass · 0 fail · 12 skipped, exit=0
audits (tenant-default, idempotency,
layers, bridges, no-console, anchors)     exit=0
pnpm verify:slice                         5/5 pasos OK, exit=0
pnpm audit:contracts                      exit=1 (79 huérfanos, heredado)
```

## Aserción de cierre

> A no lee filas, streams ni enlaces de B; SQL arbitrario bloqueado aunque lo pida una tool.

**Cumplida en lo verificable sin staging:** el SQL de negocio ya no puede tocar la base de la app (`Local business dataset`, filtrado por owner), el dataset local no devuelve filas de otro owner, la escritura sigue rechazada antes de ejecutar, y el SSE no sirve avisos de otro tenant ni de otro actor. La lectura de **filas reales de Postgres** con RLS y el filtro de **enlaces firmados** no se han podido acreditar aquí (ver abajo).

## Pendiente declarado (05.P2)

- **RLS con rol de staging**: `withTenantRls()` existe y aplica `SET LOCAL app.tenant_id`, pero probarlo de verdad exige un Postgres con `MULTI_TENANT_SHARED=true` y un rol real. El único `DATABASE_URL` disponible es el de la config `dev` de Doppler (Neon), sin `BUSINESS_DATABASE_URL` ni segundo tenant sembrado; forzarlo habría significado escribir en una base que no es de staging. Queda en `limpieza-general/pendientes.md` con la campaña que lo consumirá.
- **Enlaces firmados**: la ruta de descarga ya valida firma (`signedRoute`), pero retirar del todo `x-user-id` en presencia y locks de `threads`/`projects` es un cambio de UI+API que la 13 y la 20 consumen; no se toca aquí para no pisar su contrato.

## Entrega a la campaña 06

- `notificationVisible` como filtro de referencia para el worker y los eventos diferidos.
- La regla de "sin DSN dedicado no hay SQL" queda documentada en `config.ts` y en `.env.example` (ya avisaba; ahora el código lo cumple).
