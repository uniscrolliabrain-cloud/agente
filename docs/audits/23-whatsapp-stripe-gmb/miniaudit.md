# 23 — WhatsApp / Stripe / GMB

## Que tiene

WhatsAppClient con sendText, StripeClient con createCustomer y
createPaymentLink, GmbClient es stub 503. Los tres viven en
packages/integrations/src/stubs/.

## Que le falta

- WhatsApp: endpoint POST /api/whatsapp/drafts/:id/send, webhook firmado,
  SOP que lo use.
- Stripe: webhook con verificacion de firma, vinculacion con records/invoices.
- GMB: implementacion real.

## Interrelacion con el macro

Canales externos que necesitan aprobacion. Todos deberian pasar por
ActionService.

## Riesgos

- Que WhatsApp se use sin aprobacion y envie mensajes por error.
- Que Stripe cree clientes duplicados por falta de idempotencia.
- Que GMB se use y devuelva 503 silencioso.

## Tipo de fixes que necesitara

- Un endpoint de envio por canal, con aprobacion.
- Webhook firmado por canal.
- Idempotencia por idempotencyKey en Stripe.
