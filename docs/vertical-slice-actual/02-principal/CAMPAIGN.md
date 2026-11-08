# 02 · Principal canónico y selección de empresa

**Entrada:** el SHA integrado y aprobado de la campaña 01. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

app.ts:564 convierte fallo en default; service.ts combina scope activo y resoluciones por owner.

[apps/server/src/app.ts](../../../apps/server/src/app.ts) · [apps/server/src/engine/tenant.ts](../../../apps/server/src/engine/tenant.ts)

## Superficie de trabajo

### Crear

- `apps/server/src/tenant-principal.ts`

### Modificar

- `apps/server/src/app.ts`
- `apps/server/src/tenant-scope.ts`
- `apps/server/src/auth-routes.ts`
- `apps/server/src/engine/tenant.ts`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **02.P1 · Contrato.** Resolver tenant, actor, membership y requestId desde sesión/JWT verificado y comprobar selección.
2. **02.P2 · Conexión.** Distinguir sin sesión, sin membership y DB caída; acotar fallback al modo legacy existente.
3. **02.P3 · Bordes y compatibilidad.** Propagar el principal a CopilotKit y al store sin releer cabeceras para reconstruir identidad.

**Cableado:** sesión → autorización de membership → scope HTTP → consumidor.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/tenant-http-e2e.test.ts`
- `tests/tenant-cache.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/tenant-http-e2e.test.ts tests/tenant-cache.test.ts
git diff --check
```

**Aserción de cierre:** Dos pestañas A/B funcionan; tenant ajeno, scope alterado y DB caída fallan sin caer a default.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
