# 06 — Aprobaciones / acciones

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/server/src/actions.ts, actions-deferred.ts

## Ontología del área

Conceptos: `ActionProposal`, `ActionService`, `propose`, `decide`, `hash`,
`expiresAt`, `idempotencyKey`, `outcome_unknown`, `DeferredActions`,
`signers`, `needed`, `executeAt`.

Es el segundo corazón: todo lo externo (email, calendar, drive, WhatsApp,
Stripe, GMB) pasa por aquí.

## Estado real del código

- `ActionService.propose(owner, raw, idempotencyKey, taskId)` con hash
  SHA-256 y `expiresAt` 30 min.
- `decide(owner, id, hash, decision)` con `compareAndSwap` sobre `status`.
- `ActionProposal.status` con 9 estados: `awaiting_review`, `scheduled`,
  `executing`, `succeeded`, `failed`, `outcome_unknown`, `denied`,
  `cancelled`, `expired`.
- `actions-deferred.ts` con `DeferredActions` para undo de 8s, con
  `dualAt` para doble firma.

## Evidencia

- Los 12 tests de `actions.test.ts` **pasan**. Cubren:
  - "denying a persisted proposal never calls its adapter".
  - "concurrent approval consumes the proposal only once".
  - "wrong owner and stale hash cannot approve".
  - "expired and disconnected proposals never reach the provider".
  - "uncertain writes retain uncertainty and cannot be retried".
  - "another service instance sees persisted proposals".
  - "account switching and reconnecting invalidate a prepared action".
  - "review stores authoritative calendar details and binds execution".
  - "idempotent proposal replay returns a completed action".
  - "concurrent idempotent proposals retain a single persisted review".
  - "an expired stale review cannot overwrite a concurrently executing action".
- Los 6 tests de `deferred-actions.test.ts` **pasan**.
- `waiting_approval` se maneja en el worker (ver `engine.test.ts`).
- **No hay tests de la UI de ApprovalModal**.

## Huecos concretos

- **Reconciliación de `outcome_unknown` desde la UI**. Hoy
  `recoverInterruptedActions` marca el estado al arrancar, pero el usuario
  no ve un botón "ya lo revisé".
- **Doble firma configurable** expuesta por tenant. Existe `dualAt` en
  `actions-deferred.ts` pero no está expuesto en el endpoint.
- **Undo de 8s integrado en la UI**. El cliente no ve countdown.
- **Auditoría visual** de quién aprobó qué.
- **Reintento controlado**. Si una acción falla, no hay endpoint para reintentar.

## Interrelación

- Depende de `05-motor-tareas-durable` (el worker crea la acción y espera).
- Comparte `actions.ts` con `14-google-drive-gmail`, `22-google-drive-gmail`
  (antes 22 era otra), `23-whatsapp-stripe-gmb`.
- Depende de `08-bus-de-eventos` para emitir `action.*`.

## Riesgos

- Que una acción quede en `executing` para siempre (crash antes de escribir
  el resultado).
- Que dos usuarios aprueben la misma acción y se ejecute dos veces (el CAS
  lo previene, pero hay que verificar con test extendido).
- Que el usuario no vea el botón de reconciliar `outcome_unknown`.

## Tipo de fixes

1. Endpoint `POST /api/actions/:id/reconcile` con body
   `{ outcome: "was_executed" | "was_not_executed" }`.
2. `ApprovalModal` que muestre `outcome_unknown` con el botón.
3. `undoMs` y `dualAt` expuestos por tenant.
4. Test de aprobación concurrente extendido a 10.
5. Métrica `openmuse_action_outcome_unknown_total`.
