# Roadmap — 23 WhatsApp Stripe GMB

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Tres integraciones declaradas. No obligatorio para vender.

## 2. Estado verificado
- WhatsAppClient con sendText sin endpoint público de envío.
- StripeClient con createCustomer y createPaymentLink reales sin webhook.
- GmbClient es stub 503.
- Fuente: repodump integrations/src/stubs/*, whatsapp-routes.ts,
  billing-routes.ts, gmb-routes.ts.

## 3. Huecos contra producción
- WhatsApp: endpoint de envío con aprobación.
- Stripe: webhook completo y vinculación con invoices.
- GMB: implementación real.

## 4. Objetivo
Al menos una de las tres funcional end-to-end.

## 5. Fronteras
- No todas obligatorias.

## 6. Conexiones
- Depende de: 06.
- Archivos compartidos: stubs/*, whatsapp-routes.ts, billing-routes.ts,
  gmb-routes.ts.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Test end-to-end de la integración cableada.
- Webhook firmado por canal.
- Idempotencia por idempotencyKey en Stripe.
