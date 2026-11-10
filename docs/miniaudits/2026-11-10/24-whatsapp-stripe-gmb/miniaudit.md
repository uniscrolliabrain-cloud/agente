# Bloque 24 · WhatsApp, Stripe y GMB

> Campaña UX · 2026-11-10 · **15 hallazgos** (S0 0 · S1 8 · S2 5 · S3 2)
> Estado: informe recibido. Validación: parcial.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | El webhook de Stripe se monta después de `authzMiddleware`: Stripe no manda Bearer y recibe 401. | A confirmar: `app.ts:582` monta `authzMiddleware` sobre `/api/*` y el comentario de `:461` dice que el webhook lo llama el proveedor sin Bearer. |
| 2 | S1 | Aunque entre, sólo guarda el evento: no actualiza suscripción, cliente, cuota ni emite al bus. | Sin verificar |
| 3 | S1 | La firma de Stripe se acepta sin ventana temporal: un cuerpo capturado se reenvía. | Sin verificar |
| 4 | S1 | Dos `GET /api/billing/invoices`: la inline tapa a la de `billingRoutes`. | Sin verificar |
| 5 | S1 | Cualquier usuario autenticado crea clientes y enlaces de pago reales, sin rol ni aprobación. | Sin verificar |
| 6 | S1 | `createCustomer` devuelve el `cus_` del cliente que ya exista con ese email. | Sin verificar |
| 7 | S1 | GMB no tiene ruta de callback: conectar es imposible, `/status` siempre `false`. | Sin verificar |
| 8 | S1 | El `state` de GMB es el owner en claro, sin nonce ni caducidad. | Sin verificar |
| 9 | S2 | La firma de WhatsApp no incluye marca temporal: no hay ventana anti-repetición. | Sin verificar |
| 10 | S2 | `JSON.parse` sin `try` en el webhook: un cuerpo firmado con JSON roto da 502, no 400. | Sin verificar |
| 11 | S2 | En Evolution el binding se resuelve antes de autenticar: el error distingue instancia de secreto. | Sin verificar |
| 12 | S2 | El límite de 120/min es por proceso y por cuenta de proveedor. | Sin verificar |
| 13 | S2 | La salida de WhatsApp está apagada por defecto y el panel no explica por qué no envía. | Sin verificar |
| 14 | S3 | `gmb/publish` es un 501 fijo y no usa `GMB_API_KEY`. | Sin verificar |
| 15 | S3 | Los errores de Stripe reenvían 200 caracteres del cuerpo del proveedor al cliente. | Sin verificar |

## Arreglos propuestos

1. **Webhooks fuera de `authzMiddleware`** y autenticados por firma: Stripe y WhatsApp no mandan Bearer, es su naturaleza. Verificar firma con ventana temporal.
2. **El webhook de Stripe debe hacer algo**: actualizar suscripción/cliente/cuota y emitir el evento, no sólo guardar el evento recibido.
3. **Crear clientes y links de pago con rol y aprobación**: hoy cualquier usuario autenticado mueve dinero real.
4. **GMB conectable o declarado fuera de alcance**: sin callback, `publish` en 501 y `state` sin nonce, la integración está a medias y se presenta como disponible.
5. **Errores del proveedor sin filtrar cuerpo** al cliente y `JSON.parse` con `try` → 400.

## Plan

- **P1 (webhooks)**: orden respecto a authz, firma con timestamp, parseo seguro, efecto real.
- **P2 (dinero)**: rol + aprobación para clientes y links; un solo endpoint de facturas.
- **P3 (GMB y UX)**: callback real o retirada; explicar en el panel por qué WhatsApp no envía.

---

## Revisión de destino

Aquí se mueve dinero y se envían mensajes en nombre del cliente, que es justo lo que el producto promete hacer **con aprobación**:

- Webhooks fuera de `authzMiddleware`, con firma y ventana temporal.
- El webhook de Stripe debe actualizar suscripción, cliente y cuota, no sólo guardar el evento.
- Crear clientes y enlaces de pago con rol y aprobación.
- GMB: callback real o declararlo fuera de alcance.

## Conclusión

Es el bloque con más riesgo económico: hoy cualquier usuario autenticado puede crear un enlace de pago real y un webhook de Stripe puede no entrar. **P0** antes de facturar a nadie.
