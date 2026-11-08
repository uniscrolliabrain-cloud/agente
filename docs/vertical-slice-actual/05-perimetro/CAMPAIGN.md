# 05 · Postgres, SQL de negocio, SSE y enlaces

**Entrada:** el SHA integrado y aprobado de la campaña 04. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

business.ts:176 consulta pool directo; db-rls.ts aplica su ruta condicionalmente; hay dos implementaciones de notificaciones.

[apps/server/src/engine/business.ts](../../../apps/server/src/engine/business.ts) · [apps/server/src/db-rls.ts](../../../apps/server/src/db-rls.ts)

## Superficie de trabajo

### Crear

- `tests/vertical-slice-postgres.test.ts`

### Modificar

- `apps/server/src/db-rls.ts`
- `apps/server/src/engine/business.ts`
- `apps/server/src/notifications-stream.ts`
- `apps/server/src/events-routes.ts`
- `apps/server/src/threads-routes.ts`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **05.P1 · Contrato.** Bloquear query_business en capacidades y ejecución del slice, incluida delegación por SOP.
2. **05.P2 · Conexión.** Verificar RLS con el rol de staging y transacción del pool; comprobar que alternar A/B no deja estado residual.
3. **05.P3 · Bordes y compatibilidad.** Filtrar SSE y enlaces por principal vigente; retirar x-user-id como fuente de autoridad.

**Cableado:** principal → SQL/stream/descarga → filtro persistente → resultado.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/tenant-http-e2e.test.ts`
- `tests/vertical-slice-postgres.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/tenant-http-e2e.test.ts tests/vertical-slice-postgres.test.ts
git diff --check
```

**Aserción de cierre:** A no lee filas, streams ni enlaces de B; SQL arbitrario bloqueado aunque lo pida una tool.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
