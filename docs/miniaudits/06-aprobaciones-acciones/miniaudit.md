# 06 — Aprobaciones / acciones

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump actions.ts, actions-deferred.ts, engine/routes.ts, ApprovalModal.tsx, código real tras bloques 01-09

## Ontología

ActionProposal, ActionService, propose, decide, hash, expiresAt, idempotencyKey, outcome_unknown, DeferredActions, signers, needed, executeAt.

## Estado real

ActionService.propose con hash SHA-256 y expiresAt 30 min. decide con compareAndSwap sobre status. ActionProposal con 9 estados. DeferredActions con undo de 8s y dualAt para doble firma.

## Evidencia

Los 12 tests de actions.test.ts pasan (approve, deny, expired, disconnected, concurrent, outcome_unknown, idempotent replay, review con version). Los 6 de deferred-actions.test.ts pasan.

## Huecos declarados

- Reconciliación de outcome_unknown desde la UI.
- Doble firma configurable expuesta.
- Undo de 8s integrado en UI.
- Auditoría visual.
- Reintento controlado.

## Huecos profundos (auditoría extendida)

1. **`propose` con `idempotencyKey` usa `hash(key)` como id**: dos proposals con la misma key en tenants distintos colisionan. Falta prefijo de tenant.
2. **`hash` del payload no incluye `connectionId`**: si el usuario cambia de cuenta Google, el hash sigue siendo el mismo pero la acción cambia de cuenta.
3. **`expiresAt` de 30 min hardcodeado**: no configurable por tenant.
4. **`decide("deny")` es CAS pero no incrementa attempts**: no hay penalización por denegar repetido.
5. **`decide` no permite "reabrir" una acción denegada**: una vez denegada, se crea una nueva.
6. **Sin edición de una acción propuesta**: si el usuario quiere cambiar el subject del email antes de aprobar, tiene que denegar y volver a proponer.
7. **`ApprovalModal` no muestra `expiresAt`**: el usuario no sabe cuándo expira la propuesta.
8. **`ApprovalModal` no muestra `hash`**: cuando cambia, no hay forma de verlo.
9. **Sin historial de acciones en el chat**: la propuesta aparece y desaparece. No hay contexto de "hace 3 días aprobé X".
10. **`DeferredActions.decide` con `dualAt` fijo por proceso**: `config.deferredAction.dualAt` no se usa, es un parámetro del constructor.
11. **`signers` no valida que sea el mismo usuario firmando dos veces con distinto id**: cualquier id sirve.
12. **`executeAt` con `windowMs` de 8s no es configurable por tenant**: hardcodeado.
13. **Sin "notificar al firmante X"**: la propuesta no avisa a los co-firmantes.
14. **`outcome_unknown` no se reconcilia automáticamente**: el job de maintain detecta "executing > 10 min" pero no consulta al proveedor.
15. **Sin "acción preparada por rol"**: `prepare` no guarda qué rol propuso la acción.
16. **`action.failed` no distingue error de negocio vs error de infra**: ambos van al mismo estado.
17. **Sin `retries` explícito**: cuando una acción falla, ¿cuántas veces se puede reintentar? Hoy 0.
18. **`action-audit` no se expone en la UI**: el endpoint existe pero el front no lo consume.
19. **Sin "acción programada visible"**: cuando una acción pasa a `scheduled`, no hay una vista del "va a ejecutarse en 5s".
20. **Sin "cancelar acción en curso"**: una vez ejecutando, no se puede cancelar.

## Interrelación

Depende de 05. Comparte actions.ts con 14, 22, 23. Depende de 08.

## Riesgos

Acción en executing para siempre. Dos usuarios aprueban y ejecuta dos veces. Usuario no ve botón de reconciliar.

## Tipo de fixes

Endpoint POST /api/actions/:id/reconcile. ApprovalModal con outcome_unknown. undoMs y dualAt expuestos por tenant. Test de aprobación concurrente extendido. Métrica outcome_unknown_total. Edición de propuesta. Notificación a firmantes. Config por tenant.
