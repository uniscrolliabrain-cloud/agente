# Campaña 07 · Bundle versionado y plan de instalación — REPORTE

**Fecha:** 2026-11-08T21:35Z
**Base:** `main` = `55a87a9` (cierre de la campaña 06)
**Estado:** **07.P1, 07.P2 y 07.P3 cerrados y probados**

## Qué se ha construido

`scripts/lib/vertical-slice-bundle.ts` define el bundle versionado y, sobre todo, separa tres cosas que antes iban juntas:

1. **Validación (07.P1).** `parseVerticalSliceBundle` revisa schema, versión entera, id de plantilla opaco (no el slug), slug legible, zona, perfil con nombre, **dos personas**, **tres membresías** (con `owner` obligatorio y roles válidos), **una automatización** con `sopId` y referencias de conexión con proveedor y tipo. Devuelve **todos** los errores, no el primero.
2. **Privacidad (07.P2).** `findSecretPaths` recorre el bundle y rechaza `apiKey`, `token`, `password`, `client_secret`, etc. en cualquier profundidad, y la clave `private` está prohibida: los secretos los pone el operador, el bundle sólo lleva referencias. `operationKey` debe ser opaca y **distinta del slug y del id de plantilla**, así dos clientes con el mismo slug no comparten clave.
3. **Plan (07.P3).** `planVerticalSlice(bundle, snapshot)` es una función pura: no recibe store ni escribe. Produce operaciones identificables (`tenant:`, `profile:`, `version:`, `membership:`, `automation:`, `connection:`), ordenadas, con `fromVersion`/`toVersion`, `divergences` (lo editado a mano se salta, no se pisa), `missingReferences` (SOP inexistente) y `errors`. Si hay nombre duplicado → `NOMBRE_DUPLICADO`, la operación de tenant queda en `skip` y **no se reasigna la empresa existente**. Si la instalación va por delante del bundle → `BUNDLE_OBSOLETO`.

## Cableado real (no módulo suelto)

- `agency-bootstrap.ts`: `BootstrapOptions.bundle` valida el bundle **antes de escribir**, exige que su slug coincida con el tenant del alta (`BUNDLE_TENANT_DIVERGENTE`) y deja `templateId`, `bundleVersion` y `operationKey` en el registro del tenant.
- `provision-client.ts`: nuevo `--bundle <ruta>` que imprime el plan y **no escribe**; sale con 1 si está bloqueado. Además dejó de copiar skills al template global (`PROVISION_NO_GLOBAL_SKILL_COPY_V1`): dos clientes dejaban de distinguirse. De paso arreglado `writeFile` que se usaba sin importar.
- `clientes/_template/vertical-slice.example.json`: ejemplo completo y sin secretos.

## Evidencia

```
typecheck                                                               exit=0
tests/vertical-slice-bundle.test.ts + tests/agency-bootstrap.test.ts    13/13 pass, exit=0
pnpm provision-client --bundle clientes/_template/…                     exit=0 · Plan OK (9 operaciones) · sin escrituras
pnpm test                                                               615 tests · 598 pass · 0 fail · 12 skipped, exit=0
audits (tenant-default, idempotency, layers, bridges, no-console, anchors)  exit=0
pnpm verify:slice                                                       5/5 pasos OK, exit=0
pnpm audit:contracts                                                    exit=1 (79 huérfanos, heredado)
```

Casos nuevos: bundle de ejemplo válido · secretos y `private` rechazados · conteos/ids/clave inválidos · referencias a personas inexistentes · plan determinista (mismo JSON dos veces) · versión igual/menor/mayor · nombre duplicado sin reasignación · referencias faltantes + divergencia local preservada · bootstrap registra plantilla y rechaza bundle roto o de otro tenant.

## Aserción de cierre

> Plan estable y sin escrituras; nombre duplicado no reasigna empresa y referencias inválidas se rechazan.

**Cumplida y probada.** El plan es puro y determinista (test de igualdad profunda), el CLI lo demuestra sin tocar almacenamiento, el duplicado bloquea con la operación de tenant en `skip`, y las referencias inválidas se rechazan tanto en la validación (persona inexistente) como en el plan (SOP ausente).

## Nota de compatibilidad

- El alta existente sin `--bundle` sigue funcionando igual: `bundle` es opcional y los tests heredados de agencia pasan sin cambios.
- Queda fuera del diff: el contrato de aplique real del plan (lo consume la 14) y el versionado de la imagen del computer.

## Entrega a la campaña 08

- `parseVerticalSliceBundle` como puerta única de entrada para cualquier alta por plantilla.
- `planVerticalSlice` con operaciones identificables: el runner de la 08/14 sólo necesita aplicar `kind:id` y respetar `skip` por divergencia.
