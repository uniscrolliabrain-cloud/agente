# 03 · Permisos por actor, revocación y suspensión

**Entrada:** el SHA integrado y aprobado de la campaña 02. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

admin-tenants.ts ya tiene alta y baja de miembros; signup asigna un rol global que debe distinguirse del rol de empresa.

[apps/server/src/admin-tenants.ts](../../../apps/server/src/admin-tenants.ts) · [apps/server/src/auth-signup.ts](../../../apps/server/src/auth-signup.ts)

## Superficie de trabajo

### Crear

- `apps/server/src/engine/authz/tenant-permissions.ts`

### Modificar

- `apps/server/src/admin-tenants.ts`
- `apps/server/src/engine/tenant.ts`
- `apps/server/src/auth-signup.ts`
- `apps/server/src/engine/service.ts`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **03.P1 · Contrato.** Mapear Owner, Operaciones y Comercial a administración, lectura, preparación y aprobación.
2. **03.P2 · Conexión.** Invalidar selección y caché al revocar; consultar vigencia en operaciones sensibles y cuando el tenant se suspende.
3. **03.P3 · Bordes y compatibilidad.** Probar que alta asistida no otorga privilegio de plataforma y dejar alta pública fuera del flujo de piloto.

**Cableado:** membership → política → ruta/acción → denegación auditable.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/tenant-cache.test.ts`
- `tests/tenant-http-e2e.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/tenant-cache.test.ts tests/tenant-http-e2e.test.ts
git diff --check
```

**Aserción de cierre:** Revocación en caliente corta acceso y una cuenta de empresa no administra otras empresas.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
