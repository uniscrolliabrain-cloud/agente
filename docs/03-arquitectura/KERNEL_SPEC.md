# Kernel Spec V2 Zod

> v2 · 2026-10-27 · Estado: current

## Esquemas Zod

```
attentionVectorSchema
thoughtActor: user | fast-llm | slow-llm | worker | presenter | system
thoughtRole: intent | observation | reasoning | response | action | reflection | display | delegation | critic | verifier | query | confirmation | correction
attentionAuthor: user | fast | slow | presenter | worker | system
scope: turn | tenant | global
matchReason: explicit_subject | mentioned | direct_relation | policy | history | most_recent | context | inferred | explicit_reference
ignoreReason: not_related | not_mentioned | already_resolved | out_of_scope | low_confidence | duplicate | stale | privacy
matchedNode: node (1..300), weight (0..1), reason, kind, metadata
ignoredNode: node, reason, kind, metadata
attentionVector: id, author, thoughtId, primary (1..300), secondary (50), query (500), matched (50), ignored (50), intent, confidence, scope, timestamp, metadata
superRefine: no-solape, no-duplicados, overlap, duplicate
```

## Thought + Turn

```
thought: id, tenantId, turnId, owner, actor, role, content, attention, context, entities, policies, skills, priorThoughts, provenance, source, timestamp, parentId, edges, max200
turnStatus: open | closed | promoted
turn: id, tenantId, owner, parentTurnId, childTurnIds (100), startedAt, closedAt, quiescentAt, quiescenceMs (0..600k, default 10k), status, thoughtIds (500), triggers
```

## Store API

```
openTurn(tenantId, owner, trigger)
openChildTurn(parentTurnId)
append(thoughts)
thoughtsOf(turnId)
closeTurn(reason, closedBy)
getTurn(turnId)
listTurns(ctx, limit)
```

## Attention

```
topMatched (3), totalAttention, sum weights, normalizedWeights, matchScore, isFocusedOn (0.7), attentionOverlap, divergence, toMetadata, fromMetadata
```

## Meta (4 reglas)

| Regla | Condición | Urgencia |
|-------|-----------|----------|
| `slow_ready_fast_idle` | idle >1000ms | medium, slice 0..200 |
| `slow_long_no_output` | 30s sin salida | low |
| `slow_failed_urgent` | fallo urgente | high |
| `nothing_to_report` | nada relevante | low |

## Presenter (prioridades)

response | display | confirmation | correction | reasoning | critic | verifier | observation | action | reflection | delegation | query | intent

## Progreso

```
kind: progress | partial | ready | failed
step, totalSteps, message (1..1000), factories
```

## Vistas

```
readViewScope: turn.recent, thoughts, summary, user.tasks, notifications, tenant.turns
computeViewScope: graph.entities, neighborhood, timeline, memory.recall, policy.evaluate
```

## Consolidación

```
normalize: lower, trim, sha256
duplicateGroups: survivor, discarded, contradictions
isNegationPair: no X vs X
```

## Reglas de supervivencia

```
survive_actionable, survive_high_confidence (>=0.9), primary in matched
discard_delegation, discard_empty, discard_reasoning_noise
PromotionResult: decisions
```

## Auditoría

Hash chain SHA-256 con `previousHash`. Tenancy: `DatabaseResolver` en `tenant-membership`. Config V2 con capacidades `FAST`/`SLOW`.
