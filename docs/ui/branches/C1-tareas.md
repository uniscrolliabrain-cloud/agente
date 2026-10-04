# C1 - Tareas con timeline

> **UI_CAMPAIGN_C1_TAREAS_V1** · Última actualización: 2026-10-03.
> Estado: HECHO.

## Objetivo

Vista de tareas con timeline vertical del plan. El paso activo late. Los completados con check. Los fallidos con rojo. Filtro por rol.

## Ficheros nuevos (2)

- `apps/web/src/components/TaskTimeline.tsx`.
- `tests/tasks-reassign.test.ts`.

## Ficheros modificados (5)

- `packages/domain/src/agent.ts` (`TaskStep.durationMs`).
- `apps/server/src/engine/service.ts` (`assignedTo`).
- `apps/server/src/engine/routes.ts` (`POST /tasks/:id/reassign`).
- `apps/web/src/components/TasksView.tsx`.
- `apps/web/src/components/TaskDetailModal.tsx`.
- `apps/web/src/index.css`.

## Verificación

- `agent.ts` tiene `C1_TASKSTEP_DURATION_V1`.
- `routes.ts` tiene `C1_REASSIGN_V1`.
- `TasksView.tsx` tiene `WIRE_TASKTIMELINE_V1`.
- `TaskDetailModal.tsx` tiene `WIRE_TASKDETAIL_TIMELINE_V1`.
- `index.css` tiene `C1_TIMELINE_CSS_V1`.

**Fin de C1.**