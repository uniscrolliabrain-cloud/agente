# 06 · Identidad durable y efectos diferidos

**Entrada:** el SHA integrado y aprobado de la campaña 05. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

worker.ts restaura scope desde la fila; index.ts:178 deja un callback diferido vacío.

[apps/server/src/engine/worker.ts](../../../apps/server/src/engine/worker.ts) · [apps/server/src/index.ts](../../../apps/server/src/index.ts)

## Superficie de trabajo

### Crear

- `tests/vertical-slice-worker.test.ts`

### Modificar

- `apps/server/src/engine/worker.ts`
- `apps/server/src/engine/service.ts`
- `apps/server/src/index.ts`
- `apps/server/src/actions-deferred.ts`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **06.P1 · Contrato.** Guardar tenant, solicitante, agente, SOP y versión, correlación y origen; verificar concordancia al reclamar.
2. **06.P2 · Conexión.** Revalidar actor, suspensión y permiso antes del despacho; tratar filas legacy no atribuibles sin ejecutarlas.
3. **06.P3 · Bordes y compatibilidad.** Impedir que el callback vacío registre éxito en el slice; conservar claims, leases y recuperación actuales.

**Cableado:** tarea persistida → lease → scope restaurado → executor → evento.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/tenant-worker-claim.test.ts`
- `tests/r02-a03-worker-identity.test.ts`
- `tests/actions-deferred-wire.test.ts`
- `tests/vertical-slice-worker.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/tenant-worker-claim.test.ts tests/r02-a03-worker-identity.test.ts tests/actions-deferred-wire.test.ts tests/vertical-slice-worker.test.ts
git diff --check
```

**Aserción de cierre:** Reinicio y dos workers preservan identidad; jamás hay recibo de éxito por callback vacío.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
