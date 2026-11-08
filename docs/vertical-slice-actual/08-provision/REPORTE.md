# 08 · Instalador reanudable y alta A/B — REPORTE

**Estado:** completa · **Entrada:** `0abb7a9` (campaña 07) · **Salida:** el commit de este reporte sobre `main`.

## Qué se ha implementado

### 08.P1 · Contrato (`scripts/provision-vertical-slice.ts`)

`plan` / `apply` / `check` sobre el bundle de la 07, reutilizando las escrituras que ya existían (`bootstrapAgency` para tenant, perfil y SOPs; `UserService` y `TenantService` para cuentas y memberships). No se ha añadido ningún proveedor ni formato nuevo.

- **Plan sin escrituras**: `planProvision` compone la foto real del deployment (registro del tenant + instalaciones ya hechas) y delega en `planVerticalSlice`. Un bundle roto o un nombre ya reclamado bloquea el plan (`NOMBRE_DUPLICADO`), y el CLI sale con 1 sin tocar la base.
- **Reserva antes de escribir empresa**: el primer `put` es `system/vertical-slice-installations/<operationKey>` en estado `incomplete` con un `reservationId` recién generado. Se relee después: si el `reservationId` no coincide, otro proceso ganó la reserva y el apply aborta con `RESERVA_PERDIDA`. La misma clave con otro slug aborta con `RESERVA_CONFLICTO`: una empresa nunca se reasigna a otra plantilla.
- **Diario por pasos**: `tenant` → `actors` → `complete`, cada paso persistido al terminar. Reanudar ejecuta solo lo que falta; un fallo a mitad deja el tenant y la instalación en `incomplete` con `error` guardado, y el apply siguiente lo cierra.

> Límite conocido: el `Store` no expone CAS, así que la reserva es atómica frente a un segundo proceso que relea después del `put`, no frente a dos `put` simultáneos en el mismo instante. Queda declarado como pendiente real (08.P4 en `limpieza-general/pendientes.md`).

### 08.P2 · Conexión y actores

Tres actores por empresa, seis para A/B: el owner de la cuenta más una cuenta por persona del bundle.

- Cada persona se busca por email antes de crear; si existe, se reutiliza (reanudar no crea identidades nuevas). El rol es el mayor de sus membresías (`owner` > `admin` > `member`), y solo el owner recibe membership primaria (`setMembership`) para que `switch-tenant` resuelva a su empresa.
- El owner de la cuenta queda como `owner` de la empresa, igual que hacía `provision-agntia.ts`.

### 08.P3 · Bordes y compatibilidad

- **Personalizaciones preservadas**: si el registro del tenant ya tiene `displayName` (renombrado a mano), el reapply lo conserva en vez de volver al nombre de la plantilla; memorias y SOPs siguen saltándose si existen (comportamiento de `bootstrapAgency`), y el `createdAt` del tenant no se mueve.
- **Versión nueva**: subir la versión del bundle reabre `tenant` y `complete` (perfil y cierre) y deja `actors` cerrado: no se recrean cuentas.
- **Informe de estado** (`check`): estado de la instalación, pasos que faltan, versiones, actores con su rol real en el tenant y `pendingConsent` con las conexiones OAuth (Google). La conexión se referencia, no se instala: el secreto y el consentimiento son del operador.
- `agency-bootstrap.ts` gana `options.status` para poder marcar el tenant `incomplete` durante el alta; es aditivo y no cambia el comportamiento por defecto.

### Cambios de superficie

- Creados: `scripts/provision-vertical-slice.ts`, `tests/vertical-slice-provision.test.ts`.
- Modificados: `scripts/lib/agency-bootstrap.ts` (opción `status`), `package.json` (`provision:slice`).
- `scripts/provision-agntia.ts` **no se toca**: sigue siendo el alta mínima de owner para un deployment vacío (el caso que cubre desde antes de la 07) y el instalador nuevo lo reutiliza a nivel de servicio, no de script. No se ha hecho el refactor de extraer sus helpers porque el contrato excluye refactors globales del diff.

## Evidencia

| Comprobación | Resultado |
| --- | --- |
| `tsc --noEmit` | 0 errores |
| `tests/agency-bootstrap.test.ts` + `tests/vertical-slice-provision.test.ts` | **12/12 pass, 0 fail** |
| `git diff --check` | limpio |
| Audits (`idempotency`, `anchors`, `tenant-default`, `coherence`, `layers`, `bridges`, `console`) | ver salida del commit |

Casos cubiertos por los tests:

1. `plan` no escribe: ni registry ni instalación.
2. A se instala completa: 3 actores, registro `complete`, owner resuelve a `agencia-a`, 2 memorias de perfil.
3. Doble apply: mismos `userId` por persona, cero usuarios nuevos, cero memorias nuevas, `createdAt` intacto.
4. A y B: **6 actores** entre las dos instalaciones; los actores de B resuelven a `agencia-b` y no ven memorias de A.
5. Fallo inyectado tras `actors`: instalación `incomplete`, tenant `incomplete`, `check` en rojo; reanudar cierra y **no duplica** usuarios (mismos ids), ni memorias.
6. Clave de operación reutilizada con otro slug → `RESERVA_CONFLICTO` y el tenant no se crea.
7. Nombre reclamado por otra plantilla → `NOMBRE_DUPLICADO` en apply y en plan; no se reasigna.

## Pendiente declarado

- **08.P4 · Reserva con CAS**: cuando el `Store` tenga compare-and-swap (o una tabla de reservas con `unique`), sustituir la relectura por una escritura condicional. Hoy hay ventana entre dos writers concurrentes.
- **Prueba real con dos cuentas de staging**: no ejecutada. Este entorno no tiene `DATABASE_URL` de staging ni las dos cuentas; el identificador de proveedor no procede todavía.
- **Consumo del plan por un runner HTTP**: el CLI aplica directo contra la DB; el panel sigue sin botón de "instalar cliente".
- Sin cambios en `DATABASE_URL`/secretos: el instalador exige `DATABASE_URL` explícita y falla en claro si falta.

## Punto de rollback

Revertir el commit de la 08 devuelve el repo a `0abb7a9`. Los datos escritos por un apply (`system/vertical-slice-installations/<operationKey>`, registro del tenant, cuentas y memberships) son idempotentes y no se borran solos: para deshacerlos hay que seguir el diario de la instalación, que ya nombra cada actor y cada paso.
