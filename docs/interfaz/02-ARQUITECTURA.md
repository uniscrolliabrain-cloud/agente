# Arquitectura - Mapa de ficheros

> **UI_CAMPAIGN_02_ARQUITECTURA_V1** · Última actualización: 2026-10-03.

Inventario de ficheros del frontend y backend que la campaña UI/UX modifica o crea.

## Cómo leer esto

Cada fila lleva: **ruta**, **estado actual**, **branch que lo toca**, **tipo de cambio** (NEW, MOD, REWRITE, DELETE).

## Frontend: `apps/web/src/`

### API

| Fichero | Estado | Branch | Cambio |
|---|---|---|---|
| `api/index.ts` | Existe. No exporta agents, events, search. | — | — |
| `api/chat.ts` | Existe. `streamChat` con SSE. | — | — |
| `api/client.ts` | Existe. `apiFetch` con manejo 401. | — | — |
| `api/files.ts` | Existe. `uploadFile` sin progreso. | E2 | MOD |
| `api/rag.ts` | Existe. `ragReingest` server-side. | E2 | MOD (verificar contrato) |

### Components

| Fichero | Estado | Branch | Cambio |
|---|---|---|---|
| `App.tsx` (raíz) | Existe. Shell V2 con `v2-app-shell`. | B1 | MOD |
| `components/AppShell.tsx` | NO existe. | B1 | NEW |
| `components/SidebarV2.tsx` | Existe. Nav con 6 items + recientes. | B1, B3 | MOD |
| `components/TopBarV2.tsx` | Existe. Status pill + search + new chat. | B1 | MOD |
| `components/ChatPanel.tsx` | Existe. Duplicado de `streamBuf`. | B2, D3 | MOD |
| `components/ChatInput.tsx` | Existe. Adjuntos y voz. | — | — |
| `components/MessageList.tsx` | Existe. Pinta `streamBuf` + cursor. | B2 | MOD |
| `components/MessageBubble.tsx` | Existe. `toolCall` singular. | B2 | MOD |
| `components/ToolCallCard.tsx` | Existe. | B2 | (reemplazado por ToolCallsGroup) |
| `components/ToolCallsGroup.tsx` | NO existe. | B2 | NEW |
| `components/LiveItem.tsx` | NO existe (CSS `.live-item` en index.css). | B3 | NEW |
| `components/TasksView.tsx` | Existe. Vista V2 con 3 secciones. | C1, C3 | REWRITE |
| `components/TaskDetailModal.tsx` | Existe. Tabs plan/events/artifacts. | C1 | MOD |
| `components/TaskTimeline.tsx` | NO existe. | C1 | NEW |
| `components/ControlCenterView.tsx` | Existe. KPIs + procesos. | C2 | REWRITE |
| `components/KpiCard.tsx` | NO existe. | C2 | NEW |
| `components/Sparkline.tsx` | NO existe. | C2 | NEW |
| `components/ApprovalModal.tsx` | Existe. Aprobar/denegar. | C3 | (reemplazado por ApprovalInbox) |
| `components/ApprovalItem.tsx` | NO existe. | C3 | NEW |
| `components/ApprovalInbox.tsx` | NO existe. | C3 | NEW |
| `components/MemoryView.tsx` | Existe. Bug borrar category/tags. | A1, E1 | MOD/REWRITE |
| `components/MemoryBoard.tsx` | NO existe. | E1 | NEW |
| `components/DocumentsView.tsx` | Existe. Search RAG + grid. | E2 | REWRITE |
| `components/DocumentTree.tsx` | NO existe. | E2 | NEW |
| `components/MultiUpload.tsx` | NO existe. | E2 | NEW |
| `components/UsersView.tsx` | Existe. Cards de usuarios. | E3 | MOD |
| `components/PermissionMatrix.tsx` | NO existe. | E3 | NEW |
| `components/ContextualPanel.tsx` | Existe. Tabs con fetch manual. | D3 | REWRITE |
| `components/CommandPalette.tsx` | Existe. `<dialog>` con showModal. | — | (mejora incremental) |
| `components/Login.tsx` | Existe. | — | — |
| `components/ProfileModal.tsx` | Existe. | — | — |
| `components/Onboarding.tsx` | Existe. No está en el nav. | (fuera de campaña) | — |

### Hooks

| Fichero | Estado | Branch | Cambio |
|---|---|---|---|
| `hooks/useAuth.ts` | Existe. | — | — |
| `hooks/useChat.ts` | Existe. `activeTool` singular + `streamBuf`. | B2 | MOD |
| `hooks/useTypewriter.ts` | Existe. Velocidad fija, no usado. | B2 | REWRITE |
| `hooks/useTasks.ts` | Existe. Polling 3s. | — | — |
| `hooks/useThreads.ts` | Existe. | — | — |
| `hooks/useNotifications.ts` | Existe. Polling 8s. | — | — |
| `hooks/useWorkspaceData.ts` | Existe. Polling 5s. | — | — |
| `hooks/useProjects.ts` | Existe. | — | — |
| `hooks/useAgents.ts` | Existe. | — | — |
| `hooks/useEvents.ts` | Existe. No usado por ningún componente. | (reemplazado por useLiveActivity) | — |
| `hooks/useCascade.ts` | Existe. No usado. | (reemplazado por CSS cascade) | — |
| `hooks/useLiveActivity.ts` | NO existe. | A2 | NEW |
| `hooks/useNow.ts` | NO existe. | A3 | NEW |
| `hooks/useReducedMotion.ts` | NO existe. | A3 | NEW |
| `hooks/useHotkeys.ts` | NO existe. | A3 | NEW |
| `hooks/usePanel.ts` | NO existe. | A3 | NEW |
| `hooks/useViewResolver.ts` | NO existe. | D3 | NEW |

### Libs

| Fichero | Estado | Branch | Cambio |
|---|---|---|---|
| `lib/format.ts` | Existe. `formatBytes`, `relativeTime`. | A3 | MOD (añadir `fmtDur`) |
| `lib/taskColumns.ts` | Existe. `groupTasks` con 4 columnas. | — | — |
| `lib/applyEvent.ts` | NO existe. | A2 | NEW |
| `lib/toolsReducer.ts` | NO existe. | B2 | NEW |
| `lib/groupMemories.ts` | NO existe. | E1 | NEW |

### Views y templates

| Fichero | Estado | Branch | Cambio |
|---|---|---|---|
| `view/ViewRenderer.tsx` | Existe. Stub que no renderiza. | D3 | REWRITE |
| `view/spec.ts` | Existe. Zod inline. | D1 | MOD |
| `view/resolver.ts` | Existe. Stub. | D2 | REWRITE |
| `view/fallback.tsx` | Existe. | — | — |
| `templates/registry.ts` | Existe. 8 templates. | D3 | MOD (solo 2 reales) |
| `templates/dashboard/DashboardTemplate.tsx` | Existe. Stub. | D3 | REWRITE |
| `templates/queue/QueueTemplate.tsx` | NO existe. | D3 | NEW |
| `templates/kanban/KanbanTemplate.tsx` | Existe. Stub. | (fuera) | — |
| `templates/list/ListTemplate.tsx` | Existe. Stub. | (fuera) | — |
| `templates/table/TableTemplate.tsx` | Existe. Stub. | (fuera) | — |
| `templates/timeline/TimelineTemplate.tsx` | Existe. Stub. | (fuera) | — |
| `templates/graph/GraphTemplate.tsx` | Existe. Stub. | (fuera) | — |
| `templates/detail/DetailTemplate.tsx` | Existe. Stub. | (fuera) | — |
| `templates/form/FormTemplate.tsx` | Existe. Stub. | (fuera) | — |

### Types y CSS

| Fichero | Estado | Branch | Cambio |
|---|---|---|---|
| `types/api.ts` | Existe. `ChatMessage.toolCall` singular. | B2 | MOD |
| `index.css` | Existe. V2, V3, UI-REDESIGN, animaciones. | B1, B3, C2 | MOD |
| `main.tsx` | Existe. | — | — |

## Backend: `apps/server/src/`

### Engine

| Fichero | Estado | Branch | Cambio |
|---|---|---|---|
| `engine/routes.ts` | Existe. Schema de memorias no acepta null. | A1, C1, C3 | MOD |
| `engine/service.ts` | Existe. `createTask` no puebla `assignedTo`. | C1 | MOD |
| `engine/events/types.ts` | Existe. 40 tipos. | A2, C3, D2 | MOD |
| `engine/events/schemas.ts` | Existe. Schemas Zod por tipo. | A2, C3, D2 | MOD |
| `engine/events/bus.ts` | Existe. `emit`, `list`, `aggregate`. | (fuera: SSE real) | — |
| `engine/views/resolver.ts` | Existe. Stub con regex. | D2 | REWRITE |
| `engine/conversation.ts` | Existe. Chat con fast LLM. | D2 | MOD |
| `engine/rag.ts` | Existe. Reingesta server-side. | E2 | verificar |
| `events-routes.ts` | Existe. Filtro sin `since`. | A2 | MOD |
| `engine/events/sinks/store.ts` | Existe. `recent` sin `since`. | A2 | MOD |
| `notifications-stream.ts` | Existe. Polling 3s a notifications. | (fuera: SSE del bus) | — |

### Actions

| Fichero | Estado | Branch | Cambio |
|---|---|---|---|
| `actions.ts` | Existe. `decide` ejecuta inmediatamente. | C3 | MOD |
| `actions-deferred.ts` | NO existe. | C3 | NEW |
| `index.ts` | Existe. | C3 | MOD (arrancar tick) |

### Routes

| Fichero | Estado | Branch | Cambio |
|---|---|---|---|
| `routes/views.ts` | Existe. Stub. | D2 | REWRITE |

## Domain: `packages/domain/src/`

| Fichero | Estado | Branch | Cambio |
|---|---|---|---|
| `live.ts` | NO existe. | A2 | NEW |
| `views.ts` | NO existe. | D1 | NEW |
| `agent.ts` | Existe. `AgentTask.plan[]`, `TaskStep.status`, `AgentMemory.category/tags`. | C1 | MOD |
| `index.ts` | Existe. `ActionProposal.status` sin `scheduled`. | C3 | MOD |
| `workspace-spec.ts` | Existe. `viewSpecSchema` plano. | D1 | MOD |

## Tests: `tests/`

| Fichero | Estado | Branch |
|---|---|---|
| `tests/memory.test.ts` | Existe (A1). | A1 |
| `tests/live.test.ts` | NO existe. | A2 |
| `tests/apply-event.test.ts` | NO existe. | A2 |
| `tests/format.test.ts` | NO existe. | A3 |
| `tests/tools-reducer.test.ts` | NO existe. | B2 |
| `tests/tasks-reassign.test.ts` | NO existe. | C1 |
| `tests/deferred-actions.test.ts` | NO existe. | C3 |
| `tests/view-spec.test.ts` | NO existe. | D1 |
| `tests/view-resolver.test.ts` | NO existe. | D2 |
| `tests/registry.test.ts` | NO existe. | D3 |
| `tests/memory-board.test.ts` | NO existe. | E1 |
| `tests/reingest.test.ts` | NO existe. | E2 |
| `tests/permissions.test.ts` | NO existe. | E3 |

## Totales por área

| Área | Nuevos | Modificados | Total |
|---|---|---|---|
| Frontend components | 10 | 14 | 24 |
| Frontend hooks | 6 | 3 | 9 |
| Frontend libs | 3 | 1 | 4 |
| Frontend views/templates | 1 | 5 | 6 |
| Frontend types/css | 0 | 3 | 3 |
| Backend engine | 0 | 6 | 6 |
| Backend actions | 1 | 2 | 3 |
| Backend routes | 0 | 2 | 2 |
| Domain | 2 | 3 | 5 |
| Tests | 13 | 0 | 13 |
| TOTAL | 36 | 39 | 75 |

## Ficheros intocables

- `apps/server/src/kernel/**` - kernel cognitivo.
- `apps/server/src/db.ts` - store.
- `packages/domain/src/business.ts`, `sop.ts`, `kernel.ts` - contratos.
- `apps/worker/**`, `apps/computer/**` - fuera de scope.
- `packages/integrations/**` - fuera de scope.

Si un branch necesita tocar uno, se para y se discute.

## Grafo de dependencias

```
A1 -------> independiente
A2 -------> cimientos para A3, B3, C2, C3
A3 -------> cimientos para B1, B2, B3, C1, C2, C3, D3
B1 -------> base para B3, C1, C2, C3, D3, E1, E2, E3
B2 -------> independiente de B1
B3 -------> depende de A2 + B1
C1 -------> depende de B1 + A3
C2 -------> depende de A2 + B1 + A3
C3 -------> depende de A2 + B1 + A3
D1 -------> independiente
D2 -------> depende de D1
D3 -------> depende de D1 + D2 + B1
E1 -------> depende de B1
E2 -------> depende de B1
E3 -------> depende de B1
```

## Orden recomendado de ejecución

1. A1, A2, A3 (cimientos).
2. B1, B2 (shell + chat).
3. B3, C1, C2 (liveitem + vistas core).
4. C3 (aprobaciones).
5. D1, D2, D3 (UI servida).
6. E1, E2, E3 (vistas secundarias).

**Fin del mapa de arquitectura.**
