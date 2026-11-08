# 11 · Conexión operativa Google y ciclo de credenciales

**Entrada:** el SHA integrado y aprobado de la campaña 10. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

GoogleAuth recibe tdb y state global; callback restaura tenant; credencial sigue direccionada por actor.

[apps/server/src/google-auth.ts](../../../apps/server/src/google-auth.ts) · [apps/server/src/oauth-login.ts](../../../apps/server/src/oauth-login.ts)

## Superficie de trabajo

### Crear

- `tests/vertical-slice-google-connection.test.ts`

### Modificar

- `apps/server/src/google-auth.ts`
- `apps/server/src/workspace.ts`
- `apps/server/src/app.ts`
- `apps/web/src/api/google.ts`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **11.P1 · Contrato.** Registrar conexión operativa con tenant, proveedor, cuenta, scopes, generación y autorizante.
2. **11.P2 · Conexión.** Reusar PKCE y CAS; revalidar membership y state en callback, refresh y desconexión; migrar solo credenciales atribuibles.
3. **11.P3 · Bordes y compatibilidad.** Separar login y consentimiento; mostrar cuenta/scopes, aplicar mínimo privilegio y documentar configuración OAuth.

**Cableado:** owner → consentimiento → callback → conexión → actor autorizado → WorkspaceService.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/oauth.test.ts`
- `tests/vertical-slice-google-connection.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/oauth.test.ts tests/vertical-slice-google-connection.test.ts
git diff --check
```

**Aserción de cierre:** Dos conexiones distintas; revocación durante callback y rotación invalidan operaciones antiguas.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
