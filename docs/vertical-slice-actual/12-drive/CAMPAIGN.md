# 12 · Fuentes de Drive y ciclo de indexación

**Entrada:** el SHA integrado y aprobado de la campaña 11. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

workspace.ts:381 solo autoingiere lecturas de texto largo; RAG existe y tiene fallback.

[apps/server/src/workspace.ts](../../../apps/server/src/workspace.ts) · [apps/server/src/engine/rag.ts](../../../apps/server/src/engine/rag.ts)

## Superficie de trabajo

### Crear

- `tests/vertical-slice-drive.test.ts`

### Modificar

- `apps/server/src/workspace.ts`
- `apps/server/src/rag-routes.ts`
- `apps/server/src/engine/rag.ts`
- `apps/web/src/App.tsx`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **12.P1 · Contrato.** Separar leer de seleccionar para indexar; persistir fuente, conexión, revisión y estado.
2. **12.P2 · Conexión.** Indexar también documentos cortos admitidos; reingesta sustituye revisión y permite reintento observable.
3. **12.P3 · Bordes y compatibilidad.** Retirar acceso y chunks al revocar o borrar; citar fuentes verificadas y distinguir fallo de ausencia de coincidencia.

**Cableado:** Drive → selección autorizada → ingesta → RAG → cita en Laia.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/rag.test.ts`
- `tests/google.test.ts`
- `tests/vertical-slice-drive.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/rag.test.ts tests/google.test.ts tests/vertical-slice-drive.test.ts
git diff --check
```

**Aserción de cierre:** Documento corto en A se recupera tras reinicio; actualización y revocación cambian el resultado.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
