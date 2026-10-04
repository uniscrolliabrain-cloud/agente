# 09 — Kernel cognitivo

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump kernel/*, KERNEL_SPEC.md

## Ontología

Kernel, KernelContext, Thought, Turn, AttentionVector, MatchReason,
IgnoreReason, ThoughtRole, Promoter, Rules, Consolidate, Meta, Presenter,
Views.

## Estado real

Kernel con openTurn/openChildTurn/appendThought/closeTurn/thoughtsOf.
StoreTurnStore con closeTurnAndChildren (fix de este pase). StoreAuditStore
con hash chain y CAS sobre anchor. Meta con 4 reglas. Promoter con destinos.
Views con readView.

## Evidencia

StoreAuditStore.verify falla al pasar 10.000 entradas (fix de este pase).
Presenter existe pero conversation.ts no lo llama. Meta.evaluate corre en
maintain() pero nadie lee los hints. Rules.classify no usa attention.

## Huecos

Presenter no wireado. Meta sin consumidor. Rules.ts sin atención.
consolidate no se llama en maintain.

## Interrelación

Depende de 05, 08, 10. Alimenta a 11 y 12.

## Riesgos

Kernel escribe más de lo que se lee. Presenter nunca se cablea. Meta
escribe run-events que nadie limpia.

## Tipo de fixes

Wire del Presenter al SSE. Wire de Meta.evaluate en el chat. Rules.classify
con isFocusedOn >= 0.7. consolidate en maintain cada 5 min. Test end-to-end.
