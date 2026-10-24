# Kernel Spec V2 Zod
KERNEL_SPEC V2 attentionVectorSchema
thoughtActor user fast-llm slow-llm worker presenter system
thoughtRole intent observation reasoning response action reflection display delegation critic verifier query confirmation correction
attentionAuthor user fast slow presenter worker system scope turn user tenant global
matchReason explicit_subject mentioned direct_relation policy history most_recent context inferred explicit_reference
ignoreReason not_related not_mentioned already_resolved out_of_scope low_confidence duplicate stale privacy
matchedNode node 1..300 weight 0..1 reason kind metadata
ignoredNode node reason kind metadata
attentionVector id author thoughtId primary 1..300 secondary 50 query 500 matched 50 ignored 50 intent confidence scope timestamp metadata
superRefine no-solape no-duplicados overlap duplicate
thoughtEdge toThoughtId kind refines decomposes resolves synthesizes contradicts depends_on responds supports weight confidence

## Thought + Turn
thought id tenantId turnId owner actor role content attention context entities policies skills priorThoughts provenance source timestamp parentId edges max200
turnStatus open closed promoted closeReason response timeout promotion quiescence closedBy presenter quiescence timeout user system
id tenantId owner parentTurnId childTurnIds 100 startedAt closedAt quiescentAt quiescenceMs 0..600k default10k status thoughtIds 500 triggers
store openTurn tenantId owner trigger openChildTurn parentTurnId append thoughtsOf closeTurn reason closedBy getTurn listTurns
attention topMatched 3 totalAttention sum weights normalizedWeights matchScore isFocusedOn 0.7 attentionOverlap divergence toMetadata fromMetadata
rules survive_actionable survive_high_confidence >=0.9 primary in matched discard_delegation discard_empty discard_reasoning_noise classify PromotionResult decisions
consolidate normalize lower trim sha256 role:actor:content duplicateGroups survivor discarded contradictions isNegationPair no X vs X
progress kind progress partial ready failed step totalSteps message 1..1000 factories
views readViewScope turn.recent thoughts summary user.tasks notifications tenant.turns computeViewScope graph.entities neighborhood timeline memory.recall policy.evaluate
meta 4 reglas slow_ready_fast_idle idle>1000ms slice0..200 medium slow_long_no_output 30s low slow_failed_urgent high nothing_to_report low urgency