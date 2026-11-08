# 15 · Gmail real desde el chat

**Entrada:** el SHA integrado y aprobado de la campaña 14. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

ConversationAgent lee correo; prepare_email ya existe en ejecutores de tareas.

[apps/server/src/engine/conversation.ts](../../../apps/server/src/engine/conversation.ts) · [apps/server/src/engine/execution/tool-executors.ts](../../../apps/server/src/engine/execution/tool-executors.ts)

## Superficie de trabajo

### Crear

- `tests/vertical-slice-gmail.test.ts`

### Modificar

- `apps/server/src/engine/conversation.ts`
- `apps/server/src/engine/execution/tool-executors.ts`
- `apps/server/src/workspace.ts`
- `packages/integrations/src/google.ts`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **15.P1 · Contrato.** Exponer preparación estrecha al chat reutilizando ActionService y validadores de borrador.
2. **15.P2 · Conexión.** Conservar hilo, origen, destinatario y cuenta; bloquear instrucciones del correo que intenten cambiar una acción.
3. **15.P3 · Bordes y compatibilidad.** Aprobar y confirmar un envío A/B con ID real y releer su evidencia desde Laia.

**Cableado:** lectura → propuesta → aprobación → Gmail → recibo → hilo.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/google.test.ts`
- `tests/actions.test.ts`
- `tests/vertical-slice-gmail.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/google.test.ts tests/actions.test.ts tests/vertical-slice-gmail.test.ts
git diff --check
```

**Aserción de cierre:** Un correo por empresa conserva hilo y cuenta correctos; fixtures primero y luego smoke controlado.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
