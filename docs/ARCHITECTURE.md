# Architecture V2

## Capas
1 API Hono auth threads business computer rag events
2 AgentService dispatch kind=sop -> SOPExecutor else agent.ts
3 SOPExecutor step index results version stack allowedTools cycle depth ask_user approval
4 Kernel openTurn openChildTurn appendThought thoughtsOf tenantId turnId closeTurn tenantId turnId reason closedBy
5 TurnStore tenantId owner + StoreTurnStore cognitive-turns thoughts
6 Computer DockerRunner no-new-privileges 512MB none tmpfs 64MB noexec files.py FS workspace volumen owner
7 BusinessDataService HTTP PG sample + LearningService provenance sop:taskId

## Flujo Kernel
User -> user-author intent primary owner -> fast-author response inmediato readView turn.thoughts
-> slow-author background ProgressEvent progress partial ready failed
-> Meta.evaluate thoughts lastFastActivityAt now -> hints
  slow_ready_fast_idle medium fast idle >1000ms slice 0..200
  slow_long_no_output low 30s
  slow_failed_urgent high
  nothing_to_report low
-> Presenter PRIORITY response display confirmation correction reasoning critic verifier
-> GraphStore attention promote consolidate rules -> AuditStore hash chain SHA-256 previousHash

## Garantia
service.kernel opcional if undefined fallback chat estandar
KERNEL_NONFATAL try catch conversation.ts model.ts

## Persistencia
pglite dev pg prod InMemoryTurnStore ahora StoreTurnStore listo 1 linea app.ts para SOC-2 multi-pod