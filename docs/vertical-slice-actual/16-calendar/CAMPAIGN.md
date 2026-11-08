# 16 · Disponibilidad, reserva y recibo Calendar

**Entrada:** el SHA integrado y aprobado de la campaña 15. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

WorkspaceService.events ya consulta; prepare_event ya existe; crear evento requiere aprobación.

[apps/server/src/workspace.ts](../../../apps/server/src/workspace.ts) · [packages/integrations/src/google.ts](../../../packages/integrations/src/google.ts)

## Superficie de trabajo

### Crear

- `tests/vertical-slice-calendar.test.ts`

### Modificar

- `apps/server/src/engine/conversation.ts`
- `apps/server/src/workspace.ts`
- `apps/server/src/engine/execution/tool-executors.ts`
- `packages/integrations/src/google.ts`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **16.P1 · Contrato.** Resolver calendario autorizado, ventana, zona IANA y duración; exponer disponibilidad desde servicio existente.
2. **16.P2 · Conexión.** Preparar slot e invitados con aprobación; revalidar antes de escribir y coordinar peticiones concurrentes propias.
3. **16.P3 · Bordes y compatibilidad.** Persistir evento y enlace; conciliar timeout y tratar cancelación como operación aprobada separada.

**Cableado:** chat → disponibilidad → propuesta → Calendar → recibo → evidencia.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/google.test.ts`
- `tests/actions.test.ts`
- `tests/vertical-slice-calendar.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/google.test.ts tests/actions.test.ts tests/vertical-slice-calendar.test.ts
git diff --check
```

**Aserción de cierre:** A/B confirman evento real en su calendario; prueba de DST, conflicto y timeout sin duplicado.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
