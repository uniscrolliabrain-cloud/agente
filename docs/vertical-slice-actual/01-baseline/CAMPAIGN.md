# 01 · Baseline ejecutable y superficie autorizada

**Entrada:** el SHA auditado más este commit documental. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

HEAD contiene engine/service.ts pese a .gitignore; package.json ya usa test-force-exit.

[package.json](../../../package.json) · [apps/server/src/engine/service.ts](../../../apps/server/src/engine/service.ts)

## Superficie de trabajo

### Crear

- `scripts/verify-vertical-slice.ts`

### Modificar

- `package.json`
- `.github/workflows/ci.yml`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **01.P1 · Contrato.** Fijar Node/pnpm y SHA en el informe; ejecutar instalación congelada y build desde árbol limpio.
2. **01.P2 · Conexión.** Añadir comando del slice que encadene build, smoke autenticado y tests focalizados sin sustituir el gate general.
3. **01.P3 · Bordes y compatibilidad.** Clasificar fallos heredados con comando, exit y reproducción; comprobar imagen final y modo live.

**Cableado:** checkout → CI → servidor y worker → smoke sin proveedores reales.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/tenant-http-e2e.test.ts`
- `tests/model-worker.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/tenant-http-e2e.test.ts tests/model-worker.test.ts
git diff --check
```

**Aserción de cierre:** Un checkout limpio arranca o deja un fallo reproducible con ruta exacta; CI devuelve el exit real.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
