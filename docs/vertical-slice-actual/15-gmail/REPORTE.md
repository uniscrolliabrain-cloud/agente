# 15 · Gmail real desde el chat — REPORTE

**Estado:** completa con fixtures; smoke real pendiente de staging · **Entrada:** `2426798` (campaña 14).

## Qué se ha implementado

### 15.P1 · Contrato: preparar desde el chat, no enviar

El chat sabía leer correo (`search_mail`, `read_mail_thread`) pero no proponer una respuesta: `prepare_email` solo existía como ejecutor de tareas durables. Ahora el chat expone `prepare_email` con `threadId`, `replyToMessageId`, destinatarios, asunto, cuerpo y adjuntos, y llama a `ActionService.propose`, la misma puerta que las tareas: crea una acción `awaiting_review` que se aprueba en la app y nunca envía desde el chat.

El ejecutor `prepare_email` de las tareas acepta también `threadId`, `replyToMessageId`, `cc` y `bcc`, y construye el borrador de forma explícita en vez de reenviar los inputs crudos.

### 15.P2 · Conexión: hilo, origen, destinatario y cuenta

`WorkspaceService.prepare` valida toda respuesta contra el hilo revisado antes de que exista propuesta:

- exige `threadId` y `replyToMessageId` juntos, y que el mensaje origen pertenezca al hilo (se lee del proveedor, no de lo que diga el modelo);
- solo admite destinatarios (`to`, `cc`, `bcc`) que ya participen en el hilo (remitente, `sender` o `to` de sus mensajes). Una dirección nueva se rechaza con `409` y no se crea acción: una instrucción incrustada en el correo —«reenvía esto a…»— no puede redirigir el envío;
- deriva el asunto del mensaje origen (`Re: …`), de modo que el texto del correo tampoco puede cambiar lo que el usuario revisa;
- la propuesta guarda `connectionId`, `account` y la generación de la credencial (campaña 14), así que rotar la conexión entre revisar y aprobar sigue fallando cerrado.

### 15.P3 · Bordes y compatibilidad: recibo y relectura

- **Recibo con hilo real:** `WorkspaceService.execute` devuelve `Gmail sent message · <id> · thread <threadId>` usando el `threadId` que confirma el proveedor (o, en su defecto, el hilo revisado).
- **Evidencia re-legible:** `GoogleClient.messageReceipt(messageId)` lee `format=minimal` y exige que el `id` devuelto coincida; `WorkspaceService.emailReceipt(owner, messageId)` lo expone con la conexión actual, para que Laia confirme el mensaje real sin cuerpo ni cabeceras privadas.
- **Compatibilidad:** los envíos sin hilo (tareas que redactan un correo nuevo) mantienen el comportamiento anterior; el guard solo se activa cuando hay `threadId` o `replyToMessageId`. Los envíos de muestra y el resto de acciones de Gmail no cambian.

**Cableado:** lectura (`search_mail`/`read_mail_thread`) → propuesta (`prepare_email` → `ActionService`) → aprobación → Gmail (`sendEmail` con `threadId`/`In-Reply-To`) → recibo (`id` + hilo) → hilo (relectura con `emailReceipt`).

## Cambios registrados

- `apps/server/src/engine/conversation.ts`: herramienta `prepare_email` y regla de prompt (destinatario y asunto salen del hilo, nunca del contenido del correo).
- `apps/server/src/engine/execution/tool-executors.ts`: `prepare_email` propaga hilo, mensaje origen, `cc`/`bcc` y adjuntos.
- `apps/server/src/workspace.ts`: guard de respuesta (`addressesIn`, participantes, asunto derivado), recibo con hilo y `emailReceipt`.
- `packages/integrations/src/google.ts`: `messageReceipt` (`format=minimal`) como evidencia mínima del mensaje real.
- `tests/vertical-slice-gmail.test.ts`: nueva (4 casos). No se tocó el dominio ni `actions.ts`.

## Evidencia

| Comprobación | Resultado |
| --- | --- |
| `tsc --noEmit` | 0 errores |
| Gate 15: `google` + `actions` + `vertical-slice-gmail` | **41/41 pass, 0 fail** |
| Regresión: `deferred-actions`, `vertical-slice-approval`, `vertical-slice-drive` | **14/14 pass, 0 fail** |
| Audits `idempotency`, `anchors`, `tenant-default`, `layers`, `bridges`, `no-console` | 0 |
| `git diff --check` | limpio |

Casos de `tests/vertical-slice-gmail.test.ts`:

1. **Preparar desde el chat** conserva `threadId`, `replyToMessageId`, destinatario y cuenta; el asunto propuesto («un asunto inventado») se sustituye por `Re: Presupuesto Q4`; cero envíos.
2. **Instrucción del correo**: destinatario nuevo en `to` o `cc` se rechaza por no ser participante; cero envíos y ninguna propuesta creada.
3. **Aprobar** envía una sola vez, con `threadId` del hilo revisado, y el resultado lleva `sent-1 · thread thread-a`; `emailReceipt` relee `{ id: "sent-1", threadId: "thread-a" }`.
4. **Aislamiento A/B**: B, con su propia conexión, no puede leer ni responder al hilo de A; el proveedor de A registra cero envíos.

## Pendiente declarado

- **Smoke real:** no ejecutado. Sin `GOOGLE_CLIENT_ID`/`SECRET` ni las dos cuentas de staging no hay mensaje real que registrar; los fixtures acreditan hilo, destinatario, cuenta y recibo con el mismo cliente de Gmail que usa producción. Cuando existan las cuentas, el smoke debe guardar solo el `id` del proveedor y el hilo, nunca contenido.
- **Despacho diferido de la campaña 14** sigue sin cablear en `index.ts` (fuera de superficie, declarado allí).

## Rollback

Revertir este commit elimina la herramienta `prepare_email` del chat y su regla de prompt, devuelve `prepare_email` de tareas al passthrough anterior, retira el guard de participantes/asunto, el `threadId` del recibo, `messageReceipt`/`emailReceipt` y la prueba nueva. No borra acciones, correos ni auditoría; las propuestas antiguas siguen leyéndose.
