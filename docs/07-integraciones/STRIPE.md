# Integración Stripe

> v1 · 2026-10-27 · Estado: current

## Estado

Stripe tiene un cliente HTTP implementado (`packages/integrations/src/stubs/stripe.ts` o similar) con requests reales, pero **no tiene un lifecycle de pagos completo** con webhooks y reconciliación. Está en desarrollo parcial.

## Configuración

| Variable | Descripción |
|----------|-------------|
| `STRIPE_API_KEY` | API key de Stripe. |
| `STRIPE_HTTP_MS` | Timeout HTTP (default 20000 ms). |

## Qué está implementado

- Cliente HTTP para peticiones a Stripe API.
- Configuración de credenciales en `config.ts`.

## Qué falta

- Webhooks de Stripe para confirmación de pagos.
- Reconciliación de pagos con tareas internas.
- Lifecycle completo de checkout, suscripción, facturación.
