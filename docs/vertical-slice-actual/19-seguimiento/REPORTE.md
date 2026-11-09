# 19 · Seguimiento elegible y cancelación durable — REPORTE

**Estado:** completa con fixtures; envío real pendiente de staging · **Entrada:** `de170b5` (campaña 18).

## Qué se ha implementado

### 19.P1 · Contrato: seguimiento supervisado por lead e hilo

- `leads.ts` introduce `LeadFollowUp` (empresa, lead, paso, hilo, mensaje de origen, contacto, fecha y estado) con clave durable `${ref}:${paso}` en el pipeline. Reintentar la preparación devuelve el mismo paso: no duplica ni reinicia la cuenta.
- `followUpEligibility` es explícita y previa a escribir: ficha aceptada, negocio operativo, contacto válido, hilo y mensaje de origen, fecha futura, un solo seguimiento abierto, paso dentro de 1–3, paso anterior enviado y sin respuesta ni cita previas.
- **Lista de oposición** por empresa y lead (`lead-oppositions`). Una baja, una suspensión o un resultado ambiguo cierran el paso abierto (`opted_out`/`suspended`/`cancelled`) y bloquean cualquier alta posterior.
- `recordInbound` exige que el remitente sea el contacto del seguimiento: un mensaje de otra persona en el mismo hilo no responde por el lead.

### 19.P2 · Conexión: preparación durable, dedupe y revalidación al despachar

- `worker.ts` expone `prepareFollowUpDraft`: resuelve la empresa, comprueba la ficha, programa el paso y devuelve un borrador `email.send` en el hilo, con la línea de baja. La clave de idempotencia es `lead-follow-up:<ref>:<paso>`.
- `actions.propose` reconoce esa clave, ata el borrador al paso y al hilo, valida destinatario e hilo y pasa el seguimiento a `awaiting_approval` con el `actionId`. Un borrador que no responde a ese hilo o no va a ese contacto no se prepara.
- **Límites durables:** máximo 3 pasos, un seguimiento abierto por lead, sin salto de paso y sin reabrir tras respuesta/baja. El registro sobrevive al reinicio porque vive en el store de la empresa.

### 19.P3 · Bordes: respuesta, baja, suspensión y cita

- `SOPTriggerEvaluator.sweepFollowUps` detecta la respuesta **por hilo e identidad**, con fecha posterior al envío, tanto en la evaluación de triggers como de forma directa. Una palabra suelta en otra conversación no cancela nada.
- `ActionService.decide` y `dispatchScheduled` revalidan el seguimiento antes de reclamar la acción: si el contacto respondió o pidió la baja, la propuesta pasa a `denied` y no se llama al proveedor. Cubre respuesta durante la aprobación y baja durante la espera.
- El estado del seguimiento refleja el motivo (`replied`, `opted_out` con `cancelledReason: "baja"`, `suspended`, `cancelled`). Un resultado ambiguo previo no habilita el despacho.
- **Cita solo con recibo:** `bookAppointment` exige una respuesta previa y un `receiptId` no vacío; guarda evento, hora, hilo y recibo. Sin respuesta o sin recibo no hay cita.

**Cableado:** ficha aceptada → paso durable (`lead-follow-ups`) → borrador → aprobación → Gmail → respuesta/baja por hilo → cita con recibo.

## Cambios registrados

- `apps/server/src/engine/leads.ts`: modelo, elegibilidad, oposición, programación deduplicada, respuesta por identidad y cita con recibo.
- `apps/server/src/engine/worker.ts`: `prepareFollowUpDraft`, esquema de entrada y clave de idempotencia.
- `apps/server/src/engine/sop-triggers.ts`: `sweepFollowUps` y su llamada en la evaluación de triggers.
- `apps/server/src/actions.ts`: metadatos del seguimiento en la propuesta, guarda en aprobación y despacho, denegación sin envío y marca de enviado.
- `tests/vertical-slice-follow-up.test.ts`: nueva (5 casos).

## Evidencia

| Comprobación | Resultado |
| --- | --- |
| `tsc --noEmit` | 0 errores |
| Gate 19: `sop-triggers` + `vertical-slice-follow-up` | **12/12 pass, 0 fail** |
| Regresión: `vertical-slice-marcos`, `vertical-slice-leads`, `vertical-slice-approval`, `workflows`, `agency-bootstrap` | **24/24 pass, 0 fail** |
| Audits `idempotency`, `anchors`, `tenant-default`, `layers`, `bridges`, `no-console` | 0 |
| `git diff --check` | limpio |

Casos de `tests/vertical-slice-follow-up.test.ts`:

1. Programación durable: dedupe por lead/paso, límite de pasos, contacto obligatorio y oposición que cierra y bloquea.
2. Respuesta por hilo e identidad; remitente ajeno ignorado; baja detectada y persistida en la lista de oposición.
3. Respuesta durante la aprobación: la acción queda `denied`, no se envía y el seguimiento pasa a `replied`.
4. Baja durante la espera programada: el despacho devuelve `executed: false` con motivo de baja, la acción queda `denied` y no hay correo saliente.
5. Respuesta → cita: sin recibo se rechaza; con recibo queda `booked` con evento, hora, hilo y recibo; repetir sin respuesta se rechaza.

## Pendiente declarado

- **Sin ruta de alta:** programar un seguimiento desde HTTP/chat exigía tocar `app.ts` o `leads-routes.ts`, fuera de la superficie de la campaña. El dominio y el borrador están cableados y probados; la ruta queda para la campaña que conecte la UI.
- **Detección en el tick de triggers:** `sweepFollowUps` se ejecuta al evaluar SOPs y puede llamarse de forma directa. No hay temporizador propio porque el mantenimiento vive en `app.ts`.
- **Sin smoke real:** sin cuentas de staging no se ejercita Gmail/Calendar reales; el hilo, el recibo y la cita se prueban con el workspace local y fixtures.
- **Docker** sigue sin `docker.sock`; sin cuentas para el recorrido A/B.
- **`audit:contracts`** continúa en rojo heredado (79 huérfanos) y `coherence` 6/7 solo por eso.

## Rollback

Revertir el commit elimina la programación, la guarda de aprobación/despacho y la detección por hilo. Los registros `lead-follow-ups` y `lead-oppositions` quedan inertes y legibles; las acciones ya denegadas conservan el estado `denied`, válido para el resto del motor. No hay migración de datos que deshacer ni cambios de formato en acciones existentes.

## SHA por patchset

- **19.P1 + 19.P2 + 19.P3:** pendiente de commit (producto y pruebas sobre `de170b5`).
- **Punto de rollback:** `de170b5`.
