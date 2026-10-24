# Known issues

> Deuda tecnica identificada durante el pase de reconciliacion (Fase 0).
> No bloquea la continuacion. Se resuelve en la fase indicada.

## FASE0_DEBT_FILES_TDB_V1

**Sintoma**: `apps/server/src/app.ts` construye `Files`, `RagService` y
`WorkspaceService` con `db` crudo, no con `tdb` (TenantScopedStore). Los
handlers que escriben artifacts (document, monitor, sop) escriben con clave
`owner` mientras el resto del sistema lee con `tenantId:owner`. Los artifacts
no aparecen en `agent.detail()`.

**Tests afectados**:
- `tests/workflows.test.ts` -> "cancelling a task denies its pending action"
- `tests/workflows.test.ts` -> "failed page checks back off..."

**Fix propuesto** (Fase 1):
1. Ampliar `Files` y `RagService` para aceptar `Store | TenantScopedStore`.
2. Reordenar `app.ts`: `tenantService` y `tdb` primero, luego el resto con `tdb`.
3. Verificar que `TenantScopedStore` expone todo lo que `Files`/`Rag` necesitan
   (`select`, `rawQuery`, `scan`, `scanByStatus`, etc.).

**No se aplica en Fase 0** porque los dos fixes intentados rompen el orden de
declaracion de `app.ts`. Se hace con calma en Fase 1 cuando se amplie el
contrato del TenantScopedStore.

## FASE0_DEBT_MONITOR_ERROR_V1

**Sintoma**: el test de monitor falla en `assert.ok(task.error)` porque el
segundo tick del worker ejecuta `observe` con exito (lastHash ya actualizado)
y escribe `error: null` encima del error previo.

**Fix propuesto** (Fase 1 o 2): el handler `observe` no deberia escribir
`error: null` cuando no hay error nuevo; solo cuando el error previo se
resuelve explicitamente. O el test deberia leer el task inmediatamente tras
el tick que falla.

**No se aplica en Fase 0** porque afecta al comportamiento del worker y hay
que decidir si el error persiste entre ticks o se limpia cuando se recupera.