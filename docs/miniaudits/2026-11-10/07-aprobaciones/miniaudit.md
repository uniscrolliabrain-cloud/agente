# Bloque 07 · Aprobaciones

> Campaña UX · 2026-11-10 · **13 hallazgos** (S0 0 · S1 5 · S2 5 · S3 3)
> Estado: informe recibido. Validación pendiente.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | El `ApprovalRequest` se persiste antes del `claim()`: quedan decisiones que nunca se ejecutaron. | Sin verificar |
| 2 | S1 | El estado `scheduled` se escribe con `put` tras el `claim`, sin CAS: revive una acción expirada. | Sin verificar |
| 3 | S1 | `edit()` cambia `hash` y no recalcula `revision`. | Sin verificar |
| 4 | S1 | `provider: "google"` está fijado para cualquier acción, incluidas Stripe, WhatsApp y GMB. | **Confirmado**: `apps/server/src/actions.ts:266`, `:493` y `:516` escriben `provider: "google"` literal. |
| 5 | S1 | `decide()` sobre una acción ya decidida devuelve 200 sin conflicto. | Sin verificar |
| 6 | S2 | `retry()` no limpia `executedAt`, `providerResult` ni `settledAt`. | Sin verificar |
| 7 | S2 | `outcome_unknown` no tiene camino de conciliación. | Sin verificar |
| 8 | S2 | La conexión se lee dos veces (`connected` y `connection`) sin transacción. | Sin verificar |
| 9 | S2 | `expiresAt` se comprueba al decidir, no al ejecutar ni en la rama diferida. | Sin verificar |
| 10 | S2 | El hash no cubre `principal`, `revision` ni `connectionGeneration`. | Sin verificar |

## Arreglos propuestos

1. **Orden correcto de la decisión**: `claim()` (CAS) y sólo después persistir la solicitud; si el claim falla, no hay decisión que enseñar.
2. **`scheduled` con CAS**, no `put`: una acción expirada no puede revivir porque el worker llegue tarde.
3. **`revision` derivada del contenido** (hash + conexión + principal) y `edit()` que la recalcule. Un hash que cambia sin revisión rompe la idempotencia.
4. **`provider` desde la acción**, nunca literal: `google` para Gmail/Calendar/Drive, `stripe`, `whatsapp`, `gmb`. Es el dato que decide quién ejecuta y hoy miente.
5. **`decide()` idempotente y conflictivo**: segunda decisión → 409 con el estado actual, no 200.

## Plan

- **P1 (integridad)**: orden claim/persistencia, CAS en `scheduled`, `decide()` 409.
- **P2 (proveedor y hash)**: `provider` real por acción; hash que cubra principal, revisión y generación de conexión.
- **P3 (cierre)**: conciliación de `outcome_unknown` y `action.expired` en el bus.

---

## Revisión de destino

"Aprobaciones para todo lo externo" es el corazón del producto (`PRODUCT.md`: "el agente prepara; el humano aprueba"). Eso exige más de lo que propone el informe:

- **Recibo de ejecución**: que la aprobación quede ligada a lo que de verdad se ejecutó (resultado, proveedor, momento), no sólo a la decisión.
- **`provider` desde la acción** (Google, Stripe, WhatsApp, GMB): hoy el dato miente y con él la traza.
- Revisor humano identificado (`decidedBy` obligatorio) y conflicto explícito al decidir dos veces.

## Conclusión

Sin esto, una aprobación no garantiza que se ejecutara lo aprobado, que es la única promesa que el cliente compra. **P0**: orden claim/persistencia, CAS en `scheduled`, `provider` real y `decide()` con 409.
