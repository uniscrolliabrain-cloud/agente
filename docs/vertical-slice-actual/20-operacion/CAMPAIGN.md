# 20 · Panel, tarjetas y gate completo A/B

**Entrada:** el SHA integrado y aprobado de la campaña 19. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

Hay App, SidebarV2, ApprovalModal, selector de tarjetas y render fijo; falta comprobar integración final.

[apps/server/src/engine/published-card.ts](../../../apps/server/src/engine/published-card.ts) · [apps/web/src/App.tsx](../../../apps/web/src/App.tsx)

## Superficie de trabajo

### Crear

- `apps/web/src/components/VerticalSliceOperationsView.tsx`
- `tests/vertical-slice-dogfood.test.ts`

### Modificar

- `apps/web/src/App.tsx`
- `apps/web/src/components/SidebarV2.tsx`
- `apps/server/src/engine/conversation.ts`
- `apps/server/src/engine/published-card.ts`
- `apps/server/src/engine/context/fixed-card-renderer.ts`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **20.P1 · Contrato.** Mostrar automatizaciones, conexiones, leads, aprobaciones, recibos e incidencias con enlaces autorizados.
2. **20.P2 · Conexión.** Wirear tarjetas aprobadas y versionadas para una intención real; validar referencias, slots y permisos en fast/render fijo.
3. **20.P3 · Bordes y compatibilidad.** Ejecutar matriz A/B, restauración y retirada, métricas de coste y runbook de promoción con SHA y evidencia.

**Cableado:** panel → Laia → ejecución → evidencia → métricas/runbook.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/published-card.test.ts`
- `tests/fixed-card-renderer.test.ts`
- `tests/laia-vertical-acceptance.test.ts`
- `tests/vertical-slice-dogfood.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/published-card.test.ts tests/fixed-card-renderer.test.ts tests/laia-vertical-acceptance.test.ts tests/vertical-slice-dogfood.test.ts
git diff --check
```

**Aserción de cierre:** Seis humanos y cuatro agentes completan el recorrido con dos cuentas; explicación del día siguiente cita registros reales.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
