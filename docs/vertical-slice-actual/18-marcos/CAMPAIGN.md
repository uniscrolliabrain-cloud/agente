# 18 · Delegación tipada y cualificación de Marcos

**Entrada:** el SHA integrado y aprobado de la campaña 17. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

delegate_task llama a createTask; existen SOPs de auditoría web y primer contacto.

[apps/server/src/engine/service.ts](../../../apps/server/src/engine/service.ts) · [apps/server/src/engine/conversation.ts](../../../apps/server/src/engine/conversation.ts)

## Superficie de trabajo

### Crear

- `tests/vertical-slice-marcos.test.ts`

### Modificar

- `apps/server/src/engine/conversation.ts`
- `apps/server/src/engine/service.ts`
- `apps/server/src/engine/worker.ts`
- `apps/server/src/engine/capabilities/bootstrap.ts`
- `clientes/agntia/sops.ts`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **18.P1 · Contrato.** Registrar trabajo investigar-leads con entradas, SOP/version, agente autorizado y salida tipada.
2. **18.P2 · Conexión.** Normalizar, puntuar encaje con criterios de empresa y persistir fuente y verificación por campo.
3. **18.P3 · Bordes y compatibilidad.** Devolver ficha revisable con datos faltantes y siguiente paso; correlacionar handoff Laia/Marcos con worker y artefacto.

**Cableado:** Laia/Comercial → createTask → Marcos/SOP → ficha → revisión.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/laia-hierarchy.test.ts`
- `tests/r02-a03-worker-identity.test.ts`
- `tests/vertical-slice-marcos.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/laia-hierarchy.test.ts tests/r02-a03-worker-identity.test.ts tests/vertical-slice-marcos.test.ts
git diff --check
```

**Aserción de cierre:** Rol deshabilitado se rechaza; resultado conserva solicitante y agente y no inventa un contacto ausente.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
