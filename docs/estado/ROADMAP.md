# Roadmap

## DONE Beta slice
- [x] Durable leases CAS, Action approval/idempotency, Computer isolated 512MB none, SOP runtime allowedTools cycle/depth ask_user, Skill bootstrap 8 skills workspace-template/skills, Business HTTP/PG/sample, Learning deduplicada sop:<taskId>, Smoke+vertical

## IN PROGRESS feat/cognitive-kernel d9d5066 32 archivos +2142
- [x] thought V2 AttentionVector Zod completo author/id/thoughtId/timestamp/metadata + matchReason 9 valores + ignoreReason 8 + matchedNode/ignoredNode kind/metadata + superRefine no-solape/no-duplicados + thoughtEdge weight/confidence/createdAt + roles critic/verifier/query/confirmation/correction
- [x] turn V2 parentTurnId/quiescentAt/quiescenceMs/closedBy/childTurnIds + store V2 tenantId en todos metodos + openChildTurn/listTurns + in-memory V2 + store-store V2 tenantId
- [x] attention.ts topMatched/totalAttention/normalizedWeights/matchScore/isFocusedOn/attentionOverlap/divergence/toMetadata/fromMetadata
- [x] rules.ts 5 reglas explicitas classify + promote V2 decisions + consolidate.ts duplicateGroups/contradictions determinista
- [x] progress.ts 4 kinds + views.ts readView fast vs computeView slow + meta.ts 4 reglas slow_ready_fast_idle slow_long_no_output 30s slow_failed_urgent nothing_to_report
- [x] authors V2 fast/slow/user adaptados + presenter V2 PRIORITY + kernel.ts V2 openChildTurn/closedBy + config V2 capabilities + tenancy database-resolver
- [x] engine conversation.ts KERNEL_TURN_OPEN_V1 + CLOSE_METHOD_V1 + SAMPLE_CLOSE_V1 + MODEL_CLOSE_V1 + tap import, model.ts TASK_OPEN_V1 + TASK_CLOSE_V1, app.ts inyecta kernel, service.ts kernel? optional fallback KERNEL_NONFATAL
- [ ] endpoint debug /api/kernel/turns/:turnId + /api/views/resolve

## NEXT Fase 2 Vistas servidas
- [ ] catalogo templates cerrado accepts(spec), ViewSpec/FormSpec, Intent Resolver, ViewRenderer, FormRenderer provenance chips auto-alta/media/sugerido/tu, POST /api/views/resolve usando readView, chips contextuales

## NEXT Pre-prod
- [ ] PG para GraphStore/AuditStore, skill provenance/signing, per-step retry+compensation, full nested-SOP stack persistence, multi-tenant hardening, observability