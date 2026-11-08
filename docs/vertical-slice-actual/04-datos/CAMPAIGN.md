# 04 · Propiedad de registros y migración

**Entrada:** el SHA integrado y aprobado de la campaña 03. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

app.ts:165–181 usa Store crudo para grafo, memoria y contexto; bootstrap siembra en zona scoped.

[apps/server/src/app.ts](../../../apps/server/src/app.ts) · [scripts/lib/agency-bootstrap.ts](../../../scripts/lib/agency-bootstrap.ts)

## Superficie de trabajo

### Crear

- `apps/server/src/engine/tenant-records.ts`
- `scripts/migrate-vertical-slice-records.ts`

### Modificar

- `apps/server/src/db-tenant.ts`
- `apps/server/src/app.ts`
- `apps/server/src/engine/memory.ts`
- `apps/server/src/engine/business/graph.ts`
- `apps/server/src/engine/context/engine.ts`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **04.P1 · Contrato.** Mapear kinds a plataforma, empresa, actor, conexión o ejecución; fijar claves y permisos por operación.
2. **04.P2 · Conexión.** Adaptar solo los consumidores del piloto y preservar comportamiento legacy; evitar owner sintético con fallback.
3. **04.P3 · Bordes y compatibilidad.** Inventariar en dry-run, migrar por lotes con origen acreditado, dedupe y diario; poner ambiguos en revisión.

**Cableado:** bootstrap/HTTP → repositorio scoped → recall/grafo/panel.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/tenant-migration.test.ts`
- `tests/tenant-isolation.test.ts`
- `tests/context-engine.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/tenant-migration.test.ts tests/tenant-isolation.test.ts tests/context-engine.test.ts
git diff --check
```

**Aserción de cierre:** Dos miembros comparten hechos de A; privado queda privado y B con IDs iguales queda aislada.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
