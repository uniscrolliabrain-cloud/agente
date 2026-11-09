# Integración WhatsApp

> v1 · 2026-10-27 · Estado: draft

## Arquitectura

Laia usa **Evolution API** como proveedor de WhatsApp Business para el piloto AGNTIA. No es un cliente Meta Cloud directo, aunque el webhook puede recibir mensajes con formato de Meta.

El panel y la API comparten `https://www.agntiapro.com` como destino acordado.

## Cliente (`packages/integrations/src/stubs/whatsapp.ts`)

| Método | Descripción | Estado |
|--------|-------------|--------|
| `sendText(to, text)` | Envía texto de WhatsApp. Valida número (`+?[0-9]{6,20}`) y texto (1–4000 chars). | Implementado, no conectado a cuenta real |
| `configured` | `true` solo si `apiKey`, `baseUrl` e `instance` están definidos. | Implementado |

Si no está configurado, lanza `AppError 503` honesto. Nunca devuelve éxito falso.

## Rutas (`apps/server/src/whatsapp-routes.ts`)

| Método | Path | Auth | Descripción | Estado |
|--------|------|------|-------------|--------|
| GET | `/api/whatsapp/drafts` | Sesión | Lista drafts pendientes de revisión por tenant. | Implementado |
| POST | `/api/whatsapp/drafts/:id/send` | Sesión | Aprueba y envía un draft vía Evolution. Crea tarea SOP si viene de webhook. | Implementado |
| POST | `/api/whatsapp/drafts/:id/reject` | Sesión | Rechaza un draft. | Implementado |
| POST | `/api/whatsapp/webhook` | Firma HMAC | Webhook público de Evolution API. Verifica firma antes de aceptar. | Implementado |

## Webhook público

El webhook **no acepta peticiones sin secreto configurado**. La verificación es obligatoria:

1. Lee `WHATSAPP_APP_SECRET` de entorno (secreto de la app Meta/Evolution para la instancia).
2. Calcula HMAC SHA-256 del body crudo + secreto.
3. Compara con `x-hub-signature-256` o `x-signature` del header.
4. Si no coincide o falta el secreto, lanza `AppError "Invalid webhook signature" 401`.

El handshake de Meta usa `WHATSAPP_VERIFY_TOKEN` para el desafío de verificación del webhook (GET con `hub.mode`, `hub.verify_token`, `hub.challenge`).

Evolution API autentica por instancia mediante `apikey` header + `WHATSAPP_BASE_URL` + `WHATSAPP_INSTANCE`.

## Flujo de mensaje entrante

1. Webhook recibe mensaje de Evolution autenticado por firma HMAC.
2. Extrae `from` (remoteJid) y `text` (conversation).
3. Resuelve el tenant vinculado al número/instancia (binding canal → tenant).
4. Crea una tarea SOP: `kind: "sop"`, `prompt: "Responder WhatsApp de {from}: {text}"`, `sopId: "responder-whatsapp"`, tenantId vinculado.
5. Devuelve `{ ok: true, taskId }` solo tras autenticación exitosa.

## Flujo de envío (con aprobación humana)

1. El agente prepara un draft en `whatsapp-drafts` con `status: "awaiting_review"` y tenantId del propietario.
2. El humano revisa y aprueba (`POST /drafts/:id/send`) o rechaza (`POST /drafts/:id/reject`).
3. Al aprobar: envía vía Evolution, actualiza estado a `sent`/`failed`/`outcome_unknown`.
4. `outcome_unknown` se usa cuando la petición pudo haber salido pero no se confirmó (timeout, error de red). No se reenvía a ciegas.

## Inbox y bindings

- Cada canal de WhatsApp está vinculado a un tenant y responsable mediante binding persistente.
- El inbox almacena mensajes entrantes por tenant/instancia para trazabilidad y deduplicación.
- La identidad de tarea es estable: un mismo mensaje no genera dos tareas.

## Variables de entorno

| Variable | Descripción | Obligatoria |
|----------|-------------|-------------|
| `WHATSAPP_API_KEY` | API key de Evolution API para la instancia. | Sí (producción) |
| `WHATSAPP_BASE_URL` | URL base de Evolution API (ej: `http://evolution:8080`). | Sí (producción) |
| `WHATSAPP_INSTANCE` | Nombre de la instancia de Evolution. | Sí (producción) |
| `WHATSAPP_APP_SECRET` | Secreto de la app Meta/Evolution para verificar firma del webhook. | Sí (producción) |
| `WHATSAPP_VERIFY_TOKEN` | Token para handshake de verificación de Meta (GET webhook). | Sí (producción) |

## Límites del envío actual

- Timeout de request: 20 segundos.
- `redirect: "error"` (no seguir redirecciones).
- Número debe tener 6–20 dígitos.
- Texto entre 1 y 4000 caracteres.
- No hay conexión real a proveedor verificada; el envío real está pendiente de credenciales en Doppler y entorno de prueba autorizado.
