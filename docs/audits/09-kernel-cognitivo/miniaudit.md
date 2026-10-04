# 09 — Kernel cognitivo

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/server/src/kernel/*, KERNEL_SPEC.md

## Ontología del área

Conceptos: `Kernel`, `KernelContext`, `Thought`, `Turn`, `AttentionVector`,
`MatchedNode`, `IgnoredNode`, `MatchReason`, `IgnoreReason`, `ThoughtRole`,
`Promoter`, `Rules`, `Consolidate`, `Meta`, `Presenter`, `Views`.

Es el centro cognitivo. Chat, tareas, SOPs y auditoría pasan por aquí.

## Estado real del código

- `Kernel` con `openTurn`, `openChildTurn`, `appendThought`, `closeTurn`,
  `thoughtsOf`, `listTurns`, `findOpenTurnForThread`.
- `StoreTurnStore` con `closeTurnAndChildren` (fix de este pase).
- `StoreAuditStore` con hash chain y CAS sobre anchor con id fijo.
- `Meta` con 4 reglas. `Promoter` con destinos (memory, business-graph,
  audit). `Views` con readView. `SlowAuthor`, `FastAuthor`, `UserAuthor`.

## Evidencia

- `StoreAuditStore.verify` falla al pasar 10.000 entradas (fix de este pase).
- El `Presenter` existe pero `conversation.ts` no lo llama.
- `Meta.evaluate` corre en `maintain()` pero nadie lee los hints.
- `Rules.classify` no usa `attention`.

## Huecos concretos

- Presenter no wireado al SSE.
- Meta sin consumidor.
- Rules.ts sin atención.
- `consolidate` no se llama en `maintain`.
- `verify` bloqueado a 10.000 entradas (fix de este pase).

## Interrelación

Centro cognitivo. Depende de `05`, `08`, `10`. Alimenta a `11`, `12`.

## Riesgos

- El kernel escribe más de lo que se lee.
- El Presenter nunca se cablea.
- Meta escribe `run-events` que nadie limpia.

## Tipo de fixes

1. Wire del Presenter al SSE en `conversation.ts`.
2. Wire de `Meta.evaluate` en el flujo del chat.
3. `Rules.classify` con `isFocusedOn(vector, node) >= 0.7`.
4. `consolidate` en `maintain()` cada 5 min.
5. Test end-to-end: chat → openTurn → appendThought → closeTurn → promote.
