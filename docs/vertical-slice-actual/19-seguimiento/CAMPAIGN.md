# 19 · Seguimiento elegible y cancelación durable

**Entrada:** el SHA integrado y aprobado de la campaña 18. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

Hay triggers de SOP y Gmail; el flujo diferido vacío queda excluido por campaña 06.

[apps/server/src/engine/sop-triggers.ts](../../../apps/server/src/engine/sop-triggers.ts) · [apps/server/src/actions-deferred.ts](../../../apps/server/src/actions-deferred.ts)

## Superficie de trabajo

### Crear

- `tests/vertical-slice-follow-up.test.ts`

### Modificar

- `apps/server/src/engine/leads.ts`
- `apps/server/src/engine/worker.ts`
- `apps/server/src/engine/sop-triggers.ts`
- `apps/server/src/actions.ts`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **19.P1 · Contrato.** Cerrar primero un seguimiento supervisado por lead e hilo con elegibilidad y lista de oposición.
2. **19.P2 · Conexión.** Después programar preparación durable por lead/paso con dedupe, próxima acción y límites; revalidar al despachar.
3. **19.P3 · Bordes y compatibilidad.** Detectar respuesta por hilo e identidad; cancelar por respuesta, baja, suspensión o resultado ambiguo; cita solo con recibo.

**Cableado:** ficha → trabajo durable → borrador → aprobación → Gmail → respuesta → Calendar.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/sop-triggers.test.ts`
- `tests/vertical-slice-follow-up.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/sop-triggers.test.ts tests/vertical-slice-follow-up.test.ts
git diff --check
```

**Aserción de cierre:** Respuesta durante aprobación y baja durante espera impiden envío; una respuesta de prueba termina en cita.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
