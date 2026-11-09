# 16 · Disponibilidad, reserva y recibo Calendar — REPORTE

**Estado:** completa con fixtures; smoke real pendiente de staging · **Entrada:** `a669f9a` (campaña 15).

## Qué se ha implementado

### 16.P1 · Contrato: disponibilidad real, no inventada

`WorkspaceService.events` solo consultaba y `prepare_event` existía únicamente para tareas: el chat no tenía forma de saber qué huecos había. Ahora:

- `WorkspaceService.availability(owner, { calendarId, timeMin, timeMax, durationMinutes })` resuelve el calendario autorizado, acota la ventana (máximo 31 días), exige duración entre 5 y 480 minutos y devuelve huecos libres de esa duración, en pasos de 15 minutos, en la zona IANA del calendario.
- Cada hueco se devuelve como hora local **con su offset explícito** (`zonedIso`), de modo que dos huecos a los lados de un cambio de hora no comparten offset. La zona declarada se valida con `Intl` (`ianaZone`): un nombre suelto no pasa.
- El chat expone `check_availability`, que solo lee. La disponibilidad sale del calendario, nunca de lo que afirme un correo o un documento.

### 16.P2 · Conexión: preparar slot e invitados con aprobación

- El chat expone `prepare_event`: crea una acción `awaiting_review` por `ActionService` (la misma puerta que todo lo demás) con calendario, ventana, zona, ubicación, descripción e invitados. Preparar no escribe ni invita.
- `WorkspaceService.prepare` para `calendar.create` resuelve el calendario contra `calendarList` de la conexión y exige permiso de escritura: un `calendarId` inventado o un calendario `reader`/`freeBusyReader` se rechaza con 409. Después comprueba el hueco contra los eventos reales y rechaza el solapamiento con 409 sin crear acción.
- El ejecutor `prepare_event` de las tareas construye el borrador campo a campo con `eventDraftSchema` (antes reenviaba los inputs crudos), de modo que las tareas pasan por la misma validación de calendario, zona y conflicto.
- **Revalidación y concurrencia:** al aprobar, `execute` vuelve a comprobar el hueco y escribe dentro de un turno serializado por dueño y calendario (`serialized`). Dos aprobaciones simultáneas del mismo hueco producen un solo evento: la segunda ve el primero y falla con 409.

### 16.P3 · Bordes: evento, enlace y timeout

- **Evento y enlace persistidos:** `createEvent` propaga el `htmlLink` que devuelve Google y el resultado de la ejecución lo incluye (`Google Calendar event · <id> · <enlace>`); el evento se guarda en `events` con su calendario.
- **Recibo re-legible:** `GoogleClient.eventReceipt(calendarId, eventId)` lee el evento y devuelve solo `id`, calendario, ventana y enlace (sin descripción ni invitados); `WorkspaceService.eventReceipt` lo expone con la conexión actual.
- **Timeout sin duplicado:** un fallo de red o un 5xx al crear sigue pasando por `providerWrite` y queda `outcome_unknown` con `reconciliationRequired`; no hay reintento automático, y una segunda aprobación devuelve el estado terminal sin volver a escribir. La conciliación se hace leyendo el evento por su id (`eventReceipt`) o refrescando `events`, nunca reenviando a ciegas.
- **Cancelación** sigue siendo una operación aprobada separada (`calendar.delete`, con ETag/`If-Match` de la campaña anterior); no se mezcla con la creación.

**Cableado:** chat → `check_availability` → `prepare_event` → aprobación → Calendar (con revalidación serializada) → recibo (`id` + enlace) → evidencia (`eventReceipt`).

## Cambios registrados

- `packages/integrations/src/google.ts`: `htmlLink` en el esquema de evento, `link` en `mapEvent`/`createEvent`, y `eventReceipt`.
- `apps/server/src/workspace.ts`: `availability`, `writableCalendar`, `busyEvent`, `serialized`, guard de `calendar.create` en `prepare`, creación serializada con revalidación y enlace en `execute`, `eventReceipt`.
- `apps/server/src/engine/conversation.ts`: herramientas `check_availability` y `prepare_event` y regla de prompt.
- `apps/server/src/engine/execution/tool-executors.ts`: `prepare_event` construye el borrador con `eventDraftSchema`.
- `tests/vertical-slice-calendar.test.ts`: nueva (5 casos). No se tocó el dominio, `actions.ts` ni `google-auth.ts`.

## Evidencia

| Comprobación | Resultado |
| --- | --- |
| `tsc --noEmit` | 0 errores |
| Gate 16: `google` + `actions` + `vertical-slice-calendar` | **42/42 pass, 0 fail** |
| Regresión: `vertical-slice-gmail`, `vertical-slice-approval`, `deferred-actions`, `vertical-slice-drive` | **18/18 pass, 0 fail** |
| Audits `idempotency`, `anchors`, `tenant-default`, `layers`, `bridges`, `no-console` | 0 |
| `git diff --check` | limpio |

Casos de `tests/vertical-slice-calendar.test.ts`:

1. **Disponibilidad con DST:** ventana `2026-03-08T00:00:00-08:00 → 06:00:00-07:00` con un ocupado de 01:00 a 01:30. El primer hueco es `00:00-08:00 → 01:00-08:00`; el siguiente empieza `01:30-08:00` y termina `03:30-07:00`; ningún hueco empieza a las 02:00 locales y todos duran 60 minutos reales.
2. **Preparar:** un hueco ocupado se rechaza con 409 y sin escritura; un hueco libre crea `awaiting_review` con `connectionId`, cuenta, calendario e invitados, y cero escrituras.
3. **Aprobar + A/B:** un solo `POST`, resultado con id y enlace, evento persistido y visible solo para A; B no ve nada; `eventReceipt` devuelve `{ id, start, link }`.
4. **Concurrencia:** dos propuestas del mismo hueco aprobadas en paralelo → un único evento real y estados `succeeded`/`failed`.
5. **Timeout:** el proveedor crea el evento pero la respuesta se pierde → `outcome_unknown`, un solo intento, `eventReceipt` concilia el id y una segunda aprobación no duplica.

## Pendiente declarado

- **Smoke real:** no ejecutado. Sin `GOOGLE_CLIENT_ID`/`SECRET` ni las dos cuentas de staging no hay evento real que registrar; los fixtures usan el mismo cliente de Google que producción. Cuando existan las cuentas, el smoke debe guardar solo el id del proveedor, la ventana y el enlace, nunca invitados ni descripción.
- **Alcance:** la revalidación cubre el calendario propio de la conexión; la disponibilidad de invitados externos (free/busy entre cuentas) no se consulta en este tramo.
- **Despacho diferido de la campaña 14** sigue sin cablear en `index.ts` (fuera de superficie, declarado allí).

## Rollback

Revertir este commit retira `check_availability`/`prepare_event` del chat y su prompt, `availability`/`writableCalendar`/`busyEvent`/`serialized`, el guard de `calendar.create` en `prepare`, la creación serializada con enlace, `eventReceipt` y `link` de Google. Los eventos ya escritos y las acciones pasadas se conservan; `createEvent`/`updateEvent`/`deleteEvent` mantienen su firma compatible.

## SHA por patchset

- **16.P1 + 16.P2 + 16.P3:** `a3af62b` (producto y pruebas en un único commit sobre `a669f9a`).
- **Punto de rollback:** `a669f9a`; revertir `a3af62b` deja las campañas 01–15 intactas.
