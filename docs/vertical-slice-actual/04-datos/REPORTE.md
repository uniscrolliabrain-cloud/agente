# Campaña 04 · Propiedad de registros y migración — REPORTE

**Fecha:** 2026-11-08T18:55Z
**Base:** `main` = `f5c6051` (cierre de la campaña 03)
**Estado:** **contrato e inventario/migración cerrados**; el cableado de consumidores (04.P2) queda parcial y se declara abajo

## Qué se ha creado y modificado

### Crear

- `apps/server/src/engine/tenant-records.ts` — contrato de propiedad: `scopeOfKind`, `recordOwner`, `parseRecordOwner`, `assertRecordAccess`, `planRecordMigration`, `applyRecordMigration`.
- `scripts/migrate-vertical-slice-records.ts` — inventario (`--dry-run` por defecto) y `--apply` con diario append-only, `--limit`, `--kinds`.
- `tests/tenant-migration.test.ts` — **7 casos**: 6 nuevos de la 04 y el test heredado de `migrate-tenant-scope` conservado tal cual (el fichero existía; se amplió, no se reescribió).

## El contrato

Cada kind declara su dueño: `platform` (registro de empresas, usuarios, sesiones, kill switch, uso LLM), `tenant` (SOPs, grafo, schema, roles, fichas), `actor` (memoria privada, ficheros, credenciales Google, meta-hints), `connection` (RAG) y `execution` (tareas, hilos, acciones y recibos).

La clave se compone por scope: `system`, `<tenant>:t`, `<tenant>:u:<actor>`, `<tenant>:c:<conexión>`, `<tenant>:e:<ejecución>`. Dos empresas con el mismo `userId` **no comparten clave**, que es el fallo que la campaña 04 tenía que cerrar. `assertRecordAccess` es fail-closed: plataforma exige admin de plataforma, y un scope de actor comprueba el actor, no sólo la empresa.

## Migración

`planRecordMigration` clasifica cada fila, deduplica por `(kind, id, tenant)` y manda a `review` lo que no puede atribuir — sin inventar tenantId ni mover filas entre empresas. `applyRecordMigration` sólo escribe el `tenantId` que la clave **ya declara**, con diario por fila; una fila sin `id` va al diario como `sin-id` y no se toca.

Verificado sobre un store real: dos filas con el mismo `id` en A y B reciben su `tenantId` correcto y no se pisan; la fila huérfana conserva su contenido y sigue sin `tenantId`.

## Evidencia

```
typecheck                                        exit=0
tests/tenant-migration.test.ts                   7/7 pass, exit=0
pnpm test                                        596 tests · 579 pass · 0 fail · 12 skipped, exit=0
audits (tenant-default, idempotency, layers,
bridges, no-console, anchors)                    exit=0
pnpm verify:slice                                5/5 pasos OK, exit=0
pnpm exec tsx scripts/migrate-vertical-slice-records.ts   dry-run OK, 0 escrituras
pnpm audit:contracts                             exit=1 (79 huérfanos, heredado)
```

## Aserción de cierre

> Dos miembros comparten hechos de A; privado queda privado y B con IDs iguales queda aislada.

**Cumplida en el contrato:** el mismo actor/registro en A y B produce claves distintas y el acceso cruzado es 403; el registro de empresa es compartido por dos actores de A. La lectura HTTP end-to-end de esa aserción la sostienen `tenant-http-e2e` e `tenant-isolation` (22 casos, en verde).

## Pendiente declarado (más de tres intentos no hizo falta, pero el alcance es parcial)

- **04.P2 — cablear consumidores**: `MemoryService`, `BusinessGraph`, `ContextEngine` y `app.ts` siguen usando el `Store` crudo con la clave legacy. El contrato existe y está probado, pero sustituir el acceso en esos cuatro puntos sin tocar el comportamiento legacy es trabajo de otra tanda; forzarlo aquí habría cambiado la semántica de recall y grafo sin red de seguridad. Queda listado en `limpieza-general/pendientes.md`.
- La migración de owners legacy (`<tenant>:<userId>` → `<tenant>:u:<userId>`) no se aplica: exige decidir actor por fila y hoy se limita a revisión.

## Entrega a la campaña 05

- `scopeOfKind` + `assertRecordAccess` para filtrar SQL, SSE y enlaces por principal vigente.
- `planRecordMigration` reutilizable para el inventario de Postgres de la 05.
- El guion de migración ya escribe diario: la 05 puede apoyarse en él para su propio paso de datos.
