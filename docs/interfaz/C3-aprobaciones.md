# C3 - Inbox de aprobaciones con undo en servidor

> **UI_CAMPAIGN_C3_APROBACIONES_V1** · Última actualización: 2026-10-03.
> Estado: HECHO.

## Objetivo

Inbox de aprobaciones con cuenta atrás dirigida por el servidor. El undo vive en el servidor. `decide()` programa la ejecución 8s. `cancel` la cancela. Al arrancar se reconcilian.

## Ficheros nuevos (4)

- `apps/server/src/actions-deferred.ts`.
- `tests/deferred-actions.test.ts`.
- `apps/web/src/components/ApprovalItem.tsx`.
- `apps/web/src/components/ApprovalInbox.tsx`.

## Ficheros modificados (7)

- `packages/domain/src/index.ts` (`ActionProposal.status: "scheduled"` + signers + needed + executeAt).
- `apps/server/src/actions.ts`.
- `apps/server/src/index.ts` (tick).
- `apps/server/src/engine/routes.ts` (`POST /actions/:id/cancel`).
- `apps/web/src/components/TasksView.tsx`.
- `apps/web/src/index.css`.
- `apps/web/src/components/ApprovalModal.tsx`.

## Decisiones clave

- D06: `status: "scheduled"`.
- D14: undo en servidor.
- D15: doble firma configurable (`dualAt: number | null`, default `null`).

## Verificación

- `packages/domain/src/index.ts` tiene `C3_ACTION_SCHEDULED_V1`.
- `actions-deferred.ts` existe.
- `actions.ts` tiene `C3_ACTIONS_DEFERRED_V1`.
- `index.ts` (server) tiene `C3_TICK_DEFERRED_V1`.
- `engine/routes.ts` tiene `C3_CANCEL_V1`.
- `TasksView.tsx` tiene `C3_TASKSVIEW_APPROVALS_V1`.
- `index.css` tiene `C3_APPROVAL_CSS_V1`.

**Fin de C3.**