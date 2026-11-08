# 09 · Laia y Marcos operativos por empresa

**Entrada:** el SHA integrado y aprobado de la campaña 08. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

Registry de personas y ruta Laia ya existen; el bootstrap principal carga default/example.

[apps/server/src/app.ts](../../../apps/server/src/app.ts) · [apps/server/src/engine/agents/personas/routes.ts](../../../apps/server/src/engine/agents/personas/routes.ts)

## Superficie de trabajo

### Crear

- `clientes/_template/personas/marcos/persona.json`
- `tests/vertical-slice-personas.test.ts`

### Modificar

- `apps/server/src/app.ts`
- `apps/server/src/kernel/personas-bootstrap.ts`
- `apps/server/src/engine/agents/personas/registry.ts`
- `scripts/lib/agency-bootstrap.ts`
- `Dockerfile`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **09.P1 · Contrato.** Validar persona Marcos contra schema existente; asociar Laia/Marcos con roles, versión, tenant y catálogo autorizado.
2. **09.P2 · Conexión.** Cargar instancias desde la compilación en la misma registry que consume el chat; incluir plantillas necesarias en imagen.
3. **09.P3 · Bordes y compatibilidad.** Aplicar intersección humano/agente/SOP/tenant y rechazo de persona deshabilitada.

**Cableado:** bundle → registry → selector → role/tool policy.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/r03-a01-laia-bootstrap.test.ts`
- `tests/laia-hierarchy.test.ts`
- `tests/vertical-slice-personas.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/r03-a01-laia-bootstrap.test.ts tests/laia-hierarchy.test.ts tests/vertical-slice-personas.test.ts
git diff --check
```

**Aserción de cierre:** Imagen final resuelve cuatro instancias; Marcos deshabilitado no puede iniciar trabajo.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
