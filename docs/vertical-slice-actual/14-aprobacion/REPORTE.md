# 14 · Aprobación exacta y evidencia del proveedor — REPORTE

**Estado:** completa a nivel de producto y pruebas; falta cablear el despacho programado en `index.ts` (declarado abajo) · **Entrada:** `d34414b` (campaña 13).

## Qué se ha implementado

### 14.P1 · Contrato: la propuesta queda atada a lo que se revisó

La propuesta guardaba el payload, la conexión y el hash, pero no quién la pidió, con qué generación de credencial, cuál era la revisión exacta ni qué proveedor iba a ejecutarla. Ahora `ActionService.propose` persiste además:

```
{ principal, provider: "google", revision, connectionGeneration?, expiresAt, hash }
```

- `principal` es el actor que originó la propuesta (`ctx.actor` o el owner), separado de quien aprueba.
- `revision` es el SHA-256 del payload revisado (input + target + targetVersion), sin la conexión, que ya tiene su propio campo: cambiar de cuenta y editar el contenido son cosas distintas.
- `connectionGeneration` viene de `WorkspaceService.connection`, que ahora publica la generación de la credencial de Google.

### 14.P2 · Conexión: revalidar antes de reservar

`decide` ya comprobaba conexión, cuenta, expiración y hash antes de reservar con CAS. Ahora además:

- **Rotación de credencial**: si la generación de la conexión no es la misma con la que se revisó, la aprobación es `409 Google connection rotated` y la propuesta sigue `awaiting_review` (no se consume ni se ejecuta).
- La reserva sigue siendo el `claim` atómico: una doble aprobación, secuencial o concurrente, produce **una sola** llamada al proveedor; la segunda recibe el estado ya resuelto.
- El despacho de una acción programada (ventana de undo) pasa por `dispatchScheduled`, que **revalida la conexión antes** del CAS `scheduled → executing`. Si la credencial cambió, la acción pasa a `failed` con motivo y **no se llama al proveedor**; si dos despachos compiten, solo uno gana la reserva.

### 14.P3 · Bordes: proveedor, recibo y ambigüedad

- La ejecución vive ahora en una única puerta (`ActionService.run`), compartida por la aprobación y el despacho programado. Al terminar persiste `provider`, `executedAt` y, si fue bien, `providerResult` y `settledAt`; si fue mal, `error` y `errorKind`.
- **Ambigüedad explícita**: un timeout, un corte de red o un 5xx del proveedor se convierten en `outcome_unknown` con `reconciliationRequired: true` y `errorKind: "outcome_unknown"`. Un 4xx sigue siendo un rechazo definitivo (`business`). Ese estado **no** se reintenta: `retry()` lo rechaza antes incluso del filtro de estados, una nueva aprobación devuelve el estado tal cual sin llamar al proveedor y `dispatchScheduled` responde `reconcile_previous_outcome`.
- `WorkspaceService.execute` envuelve cada escritura real (Gmail, Drive, Calendar) en `providerWrite`: lo que no es un 4xx se marca ambiguo en lugar de propagarse como fallo determinista, porque no se puede afirmar que el proveedor no ejecutó.
- La UI (`ApprovalModal`) muestra proveedor y recibo, avisa de que una revisión caducada o fallida no se aprueba (solo se cierra) y, en `outcome_unknown`, dice explícitamente que no se reintenta automáticamente hasta conciliar.

## Cambios registrados

- `ActionProposal` (persistido) gana `principal`, `provider`, `revision`, `connectionGeneration`, `providerResult`, `settledAt`, `executedAt`, `approvedBy`, `reconciliationRequired`; son campos aditivos y los registros antiguos siguen leyéndose (el contexto del tipo vive en `actions.ts`, no se ha tocado el dominio).
- `WorkspaceService.connection` añade `generation` en modo live; el modo sample sigue devolviendo solo `{ id, account }`.
- `ActionService.dispatchScheduled(owner, actionId)` es nuevo y público.
- `engine/service.ts` no se ha modificado: `control("retry")` ya rechaza cualquier acción no `succeeded` y `resume` deja la tarea en `waiting_approval`, donde `decide` no vuelve a despachar un `outcome_unknown`.

**Pendiente declarado:** el callback de `DeferredActions` vive en `apps/server/src/index.ts` (fuera de la superficie de esta campaña) y hoy devuelve `{ executed: false, reason: "deferred_dispatch_unwired" }`. Para cerrar el circuito real basta que ese callback llame a `actions.dispatchScheduled(owner, actionId)`: el método ya revalida, reserva, ejecuta una sola vez y devuelve el recibo que `DeferredActions` exige. No se ha tocado `index.ts` para respetar la superficie.

## Evidencia

| Comprobación | Resultado |
| --- | --- |
| `tsc --noEmit` | 0 errores |
| Gate 14: `actions` + `actions-deferred-wire` + `vertical-slice-approval` | **18/18 pass, 0 fail** |
| Regresión: `google`, `vertical-slice-google-connection`, `deferred-actions` | **36/36 pass, 0 fail** |
| Audits `idempotency`, `anchors`, `tenant-default`, `layers`, `bridges`, `no-console` | 0 |
| `git diff --check` | limpio |

Casos de `tests/vertical-slice-approval.test.ts`:

1. **Doble aprobación, una llamada**: dos `decide` con el mismo hash ejecutan el proveedor una sola vez; la propuesta queda `succeeded` con `provider: "google"`, `providerResult` y `settledAt`.
2. **Timeout ambiguo**: `outcome_unknown` con `reconciliationRequired`; `retry` rechazado, segunda aprobación sin llamada y `dispatchScheduled` sin reenvío. Una sola llamada al proveedor en total.
3. **Rotación**: cambiar la generación entre revisar y aprobar produce `409` con cero llamadas y la revisión intacta en `awaiting_review`.
4. **Despacho programado**: dos despachos concurrentes dejan una sola llamada (CAS); con la conexión rotada el despacho falla cerrado, marca `failed` y tampoco llama.

## Pendiente adicional

- **Proveedor real**: no ejecutado. Sin `GOOGLE_CLIENT_ID`/`SECRET` ni cuentas de staging no hay operación real que registrar; la ambigüedad se acredita forzando el error del adaptador con `outcomeUnknown`, y la rotación con una generación distinta. No se guardan secretos ni contenido privado.

## Rollback

Revertir este commit devuelve la ejecución al bloque original de `decide`, elimina `dispatchScheduled`, el wrapper `providerWrite` y los campos nuevos de la propuesta (los registros escritos con ellos quedan inertes: nadie los exige), y la UI vuelve a su versión anterior. No se borran acciones, recibos ni auditoría.
