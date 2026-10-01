# Beta readiness + Cognitive Kernel d9d5066

## Enterprise ejecutable
- kind=sop first-class, validacion Zod, durable sopStepIndex/results/version/stack, allowedTools, cycle+depth, ask_user pause/resume, prepare_email/event approval+idempotency
- Skills bootstrap apps/computer/workspace-template/skills (8 skills)
- query_business HTTP/PG/sample
- Learning deduplicada provenance sop:<taskId>

## Kernel ejecutable d9d5066 32 archivos +2142
- fast-author sync Views readView turn.thoughts, slow-author async ProgressEvent progress|partial|ready|failed
- AttentionVector V2 author/id/thoughtId/timestamp/metadata + MatchReason 9 + IgnoreReason 8 + kind/metadata + superRefine overlap/duplicate error
- Turn V2 parentTurnId/quiescentAt/quiescenceMs/closedBy/childTurnIds
- Store V2 tenantId en todos metodos openChildTurn listTurns, in-memory V2, store-store V2 cognitive-turns/cognitive-thoughts tenantId owner
- Meta 4 reglas: slow_ready_fast_idle fast idle >1000ms medium slice 0..200, slow_long_no_output 30s low, slow_failed_urgent high, nothing_to_report low
- Presenter PRIORITY response/display/confirmation/correction/reasoning/critic/verifier/observation/action/reflection/delegation/query/intent
- Audit hash chain SHA-256 previousHash, Tenancy DatabaseResolver tenant-membership, Config V2 capabilities FAST/SLOW

## Smoke
pnpm beta:smoke
docker build -t openmuse-computer:local apps/computer
COMPUTER_ENABLED=true pnpm beta:vertical

## Limites honestos
- pip no network sandbox falla honesto
- Kernel stores in-memory StoreTurnStore listo pero no activado, falta PG
- Presenter no wireado intencional bloque D