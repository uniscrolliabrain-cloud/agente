# 14 · Aprobación exacta y evidencia del proveedor

**Entrada:** el SHA integrado y aprobado de la campaña 13. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

ActionService ya propone y decide; WorkspaceService ejecuta y distingue resultados inciertos.

[apps/server/src/actions.ts](../../../apps/server/src/actions.ts) · [apps/server/src/workspace.ts](../../../apps/server/src/workspace.ts)

## Superficie de trabajo

### Crear

- `tests/vertical-slice-approval.test.ts`

### Modificar

- `apps/server/src/actions.ts`
- `apps/server/src/workspace.ts`
- `apps/server/src/engine/service.ts`
- `apps/web/src/components/ApprovalModal.tsx`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **14.P1 · Contrato.** Adaptar propuesta existente a principal, conexión/generación, revisión, expiración y hash de payload.
2. **14.P2 · Conexión.** Revalidar antes de ejecutar y reservar con CAS; impedir que edición, revocación, suspensión o doble clic despachen.
3. **14.P3 · Bordes y compatibilidad.** Persistir proveedor, resultado confirmado o ambiguo y conciliación; UI distingue los estados.

**Cableado:** chat/SOP → propuesta → aprobación humana → reserva → proveedor → recibo.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/actions.test.ts`
- `tests/actions-deferred-wire.test.ts`
- `tests/vertical-slice-approval.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/actions.test.ts tests/actions-deferred-wire.test.ts tests/vertical-slice-approval.test.ts
git diff --check
```

**Aserción de cierre:** Una llamada en doble aprobación; timeout ambiguo no habilita reenvío automático.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
