# 23 — WhatsApp / Stripe / GMB

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump integrations/src/stubs/*, whatsapp-routes.ts, billing-routes.ts, gmb-routes.ts

## Ontología

WhatsAppClient, StripeClient, GmbClient, stubs 503, whatsapp-drafts, stripe-events, webhook firmas.

## Estado real

WhatsAppClient con sendText sin endpoint público de envío. StripeClient con createCustomer y createPaymentLink reales sin webhook completo. GmbClient es stub 503. Los tres en packages/integrations/src/stubs/.

## Evidencia

whatsapp-routes.ts tiene /drafts y /drafts/:id/send pero el envío real no está cableado. billing-routes.ts tiene /webhook con HMAC Stripe. gmb-routes.ts devuelve 501 con mensaje honesto.

## Huecos declarados

- WhatsApp endpoint de envío.
- Stripe webhook completo y vinculación con invoices.
- GMB implementación real.

## Huecos profundos (auditoría extendida)

1. **WhatsApp sendText existe pero no hay endpoint**: no se puede enviar.
2. **WhatsApp sin webhook verificado**: acepta llamadas sin firma en algunos casos.
3. **WhatsApp sin plantillas HSM**: los mensajes fuera de 24h no se pueden enviar.
4. **WhatsApp sin media upload**: no se pueden enviar imágenes/PDFs.
5. **WhatsApp sin read receipts**: no se sabe si el mensaje se leyó.
6. **Stripe sin subscriptions**: solo payment links one-off.
7. **Stripe sin Stripe Tax**: no se calcula IVA.
8. **Stripe sin Stripe Connect**: no se puede actuar en nombre de otros.
9. **Stripe webhook incompleto**: solo invoice.paid, falta customer.subscription.*.
10. **Stripe sin idempotency keys completas**: solo en createCustomer.
11. **GMB stub devuelve 501**: el cliente no puede publicar.
12. **GMB sin OAuth**: no se conecta con la cuenta de Google.
13. **GMB sin locations**: no se listan las ubicaciones del negocio.
14. **GMB sin reviews**: no se leen reseñas.
15. **GMB sin posts scheduled**: no se programan.
16. **Sin "estado de conexión" en UI para cada canal**: el usuario no sabe qué está conectado.
17. **Sin "reintento de webhook"**: si falla, se pierde.
18. **Sin "rate limit de canales"**: un cliente puede spamear WhatsApp/Stripe.
19. **Sin "modo test" de canales**: hay que usar producción para probar.
20. **Sin "auditoría por canal"**: no hay log de qué mensaje se envió a quién.

## Interrelación

Canales externos. Depende de 06.

## Riesgos

WhatsApp sin aprobación. Stripe clientes duplicados. GMB 503 silencioso.

## Tipo de fixes

Endpoint de envío por canal con aprobación. Webhook firmado por canal. Idempotencia por idempotencyKey en Stripe. WhatsApp HSM. Stripe subscriptions. GMB OAuth + locations. Estado de conexión por canal.
