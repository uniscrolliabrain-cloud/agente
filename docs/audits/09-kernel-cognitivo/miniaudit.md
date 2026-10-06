# 09 — Kernel cognitivo

> v2 · 2026-10-07 · Estado: audited-deep (post 09z Fases 1-3)
> Fuente: repo real, commits 59d675e, 7c9b936, 140c18d, 7a5b6fa, 69bbd01, 608cf07

## Ontología

Kernel, KernelContext, Thought, Turn, AttentionVector, ThoughtRole,
Promoter, Rules, Consolidate, Meta, Presenter, Views, Lifecycle,
Snapshot, Replay (pendiente).

## Estado real (post 09z)

El kernel ha sido remodelado en 3 fases:

- **Fase 1** (`59d675e`): fundamentos. 16 action verbs, 15 familias,
  OntologyBundle, CapabilitySpec, validateAgainstMetamodel, ALLOWED_TASK_TRANSITIONS.
- **Fase 2** (`7c9b936`): migración. 19 capacidades con actionType+family,
  validator wireado, canTransitionTask en worker+service, capabilityId en SOPs.
- **Fase 3** (4 commits: `140c18d`, `7a5b6fa`, `69bbd01`, `608cf07`): materialización.
  20 fixes en 4 pipelines.

## Huecos originales (miniaudit v1) — veredicto

| Hueco | Veredicto v2 | Evidencia |
|---|---|---|
| Presenter no wireado | **FALSO** | `conversation.ts` llama `presentText` → `presenter.presentTurn` |
| Meta sin consumidor | **FALSO** | `service.ts` `runMetaLoop` con `consumeHint`, hints al bus |
| Rules.ts sin atención | **FALSO** | `rules.ts` `survive_high_attention_focus` con `isFocusedOn >= 0.7` |
| consolidate no en maintain | **FALSO** | `service.ts` llama `runConsolidateLoop()` en `maintain()` |

## Problemas nuevos N1-N12 — veredicto v2

| ID | Problema | Veredicto |
|---|---|---|
| N1 | `lifecycle.auditChainValid = true` siempre | **RESUELTO** (P1.2) |
| N2 | `snapshot.ts` sin transacción | **RESUELTO** (P1.3) |
| N3 | `views.ts` con `as any` | **RESUELTO** (P3.5) |
| N4 | `attention.fromMetadata` sin validar | **RESUELTO** (P1.1) |
| N5 | `consolidate.key()` sin `tenantId` | **PARCIAL** (agrupa por tenant antes, no colisiona) |
| N6 | `rules.ts` orden de reglas | **RESUELTO** (P2.2) |
| N7 | `lifecycle.ts` no wireado | **RESUELTO** (P1.6) |
| N8 | `snapshot.ts` no wireado | **RESUELTO** (P1.5) |
| N9 | `views.ts` con `?? []` mal | **RESUELTO** (P3.5) |
| N10 | tests `closeTurnAndChildren` profundo | **APLAZADO** (bloque 01) |
| N11 | `kernel-meta-context.test.ts` usa `require` | **APLAZADO** (bloque 01) |
| N12 | `kernel-presenter.test.ts` no verifica persistencia | **APLAZADO** (bloque 01) |

## Pendientes reales

1. `TenantScopedCapabilityRegistry` **wireado** en `service.ts` (Pipeline 5, Fix A).
2. `StoreAuditStore.verify` — fail-honest (devuelve `false` si > `KERNEL_AUDIT_MAX_LIST`).
   Decisión: se deja así. Paginar con cursor keyset es trabajo del bloque 19 (backups).
3. Tests kernel (N10-N12) + `packages/domain/test/ontology.test.ts` — bloque 01.

## Interrelación

Depende de 05, 08, 10. Alimenta a 11 y 12.

## Riesgos

- Kernel escribe más de lo que se lee. **Mitigado**: presenter, meta, promoción
  y consolidación leen lo que escriben.
- Meta escribe run-events que nadie limpia. **Mitigado**: purge cada 90 días en
  `maintain()` (run-events en `purgeTargets`).

## Tipo de fixes aplicados

- Wire del Presenter al SSE. ✅
- Wire de Meta.evaluate en el chat + consumeHint. ✅
- Rules.classify con isFocusedOn >= 0.7. ✅
- consolidate en maintain cada minuto. ✅
- Atención real en los 3 autores. ✅
- Presenter compuesto (primary + secondary). ✅
- Child turn en runtime (model.ts). ✅
- Snapshot con transacción + endpoints admin. ✅
- Lifecycle wireado en `/health-deep`. ✅
- Audit con correlationId. ✅
- Latencias: consolidate O(n²) acotado, views paginado, getTurn cache. ✅

## Verificación

- Typecheck verde tras cada pipeline.
- 4 commits independientes, cada uno aprobable.
- Pendiente: test SSE que verifica que el Presenter decide el texto (bloque 01).