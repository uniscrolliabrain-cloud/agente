# 17 · Places, selección y ficha comercial compartida

**Entrada:** el SHA integrado y aprobado de la campaña 16. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

GoogleMapsClient y /api/leads/discover existen; leads-routes.ts:95 deduplica bajo owner y persiste automáticamente.

[apps/server/src/leads-routes.ts](../../../apps/server/src/leads-routes.ts) · [packages/integrations/src/google-maps.ts](../../../packages/integrations/src/google-maps.ts)

## Superficie de trabajo

### Crear

- `apps/server/src/engine/leads.ts`
- `tests/vertical-slice-leads.test.ts`

### Modificar

- `apps/server/src/leads-routes.ts`
- `packages/integrations/src/google-maps.ts`
- `apps/server/src/app.ts`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **17.P1 · Contrato.** Reutilizar Places con FieldMask y presupuestos; separar resultados transitorios de fichas aceptadas y revisar políticas de datos.
2. **17.P2 · Conexión.** Introducir aceptación idempotente por tenant y referencia estable; dominio como señal y no clave de unicidad.
3. **17.P3 · Bordes y compatibilidad.** Migrar filas de owner con origen acreditado y sin perder notas; mantener contrato de callers o versionarlo.

**Cableado:** Places → candidatos → selección humana → ficha compartida → API.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/vertical-slice-leads.test.ts`
- `tests/tenant-http-e2e.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/vertical-slice-leads.test.ts tests/tenant-http-e2e.test.ts
git diff --check
```

**Aserción de cierre:** Dos comerciales de A aceptan una ficha; B puede aceptar otra propia; buscar no modifica el pipeline.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
