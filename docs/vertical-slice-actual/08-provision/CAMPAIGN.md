# 08 · Instalador reanudable y alta A/B

**Entrada:** el SHA integrado y aprobado de la campaña 07. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

bootstrapAgency escribe registro y semillas; provision-agntia.ts cubre owner y memberships.

[scripts/provision-agntia.ts](../../../scripts/provision-agntia.ts) · [scripts/lib/agency-bootstrap.ts](../../../scripts/lib/agency-bootstrap.ts)

## Superficie de trabajo

### Crear

- `scripts/provision-vertical-slice.ts`
- `tests/vertical-slice-provision.test.ts`

### Modificar

- `scripts/lib/agency-bootstrap.ts`
- `scripts/provision-agntia.ts`
- `package.json`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **08.P1 · Contrato.** Materializar plan/apply/check reutilizando escrituras existentes; reservar tenant e instalación de forma atómica.
2. **08.P2 · Conexión.** Crear owner y dos actores por empresa; marcar incompleto durante apply y registrar progreso para reanudación.
3. **08.P3 · Bordes y compatibilidad.** Preservar personalizaciones al reaplicar; emitir informe de estado y dejar credenciales Google pendientes de consentimiento.

**Cableado:** CLI → registro/membresías → semillas → check → login.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/agency-bootstrap.test.ts`
- `tests/vertical-slice-provision.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/agency-bootstrap.test.ts tests/vertical-slice-provision.test.ts
git diff --check
```

**Aserción de cierre:** A/B compiladas con seis actores; fallo intermedio, doble apply y reanudación no duplican ni pisan datos.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
