# 07 · Bundle versionado y plan de instalación

**Entrada:** el SHA integrado y aprobado de la campaña 06. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

provision-agntia.ts y bootstrap-agency.ts cubren partes del alta; el provisionador anterior copia skills al template global.

[scripts/provision-client.ts](../../../scripts/provision-client.ts) · [scripts/lib/agency-bootstrap.ts](../../../scripts/lib/agency-bootstrap.ts)

## Superficie de trabajo

### Crear

- `scripts/lib/vertical-slice-bundle.ts`
- `clientes/_template/vertical-slice.example.json`

### Modificar

- `scripts/lib/agency-bootstrap.ts`
- `scripts/provision-client.ts`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **07.P1 · Contrato.** Validar ID de plantilla, perfil, zona, tres membresías, dos personas, una automatización y referencias de conexión.
2. **07.P2 · Conexión.** Separar datos privados y secretos de la plantilla versionada; IDs opacos y clave de operación distinta del slug.
3. **07.P3 · Bordes y compatibilidad.** Calcular plan sin escrituras con diff de versión, divergencias locales y referencias faltantes; excluir copia global.

**Cableado:** bundle → esquema → plan → lista de operaciones identificables.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/agency-bootstrap.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/agency-bootstrap.test.ts
git diff --check
```

**Aserción de cierre:** Plan estable y sin escrituras; nombre duplicado no reasigna empresa y referencias inválidas se rechazan.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
