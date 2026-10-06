# 09z — Fundamentos del kernel cognitivo

> v2 · 2026-10-07 · Estado: Fases 1-3 aplicadas

## Qué se ha aplicado

### Fase 1 — Fundamentos (`59d675e`)

Archivos nuevos:
- `packages/domain/src/actions.ts` — 16 verbos de acción.
- `packages/domain/src/taxonomy.ts` — 15 familias de capacidad.
- `packages/domain/src/ontology.ts` — OntologyBundle + CapabilitySpec + validateAgainstMetamodel.
- `packages/domain/src/ontology-seed.ts` — vocabulario base.

Fixes:
- `packages/domain/src/capability.ts` — `actionType` y `family` opcionales.
- `packages/domain/src/sop.ts` — `capabilityId` opcional en pasos.
- `packages/domain/src/agent.ts` — `ALLOWED_TASK_TRANSITIONS` + `canTransitionTask`.
- `apps/server/src/engine/capabilities/registry.ts` — `TenantScopedCapabilityRegistry`.

### Fase 2 — Migración (`7c9b936`)

- 19 capacidades de `bootstrap.ts` con `actionType` + `family`.
- `validateAgainstMetamodel` wireado en bootstrap del server.
- `canTransitionTask` en `worker.ts` y `service.ts`.
- `capabilityId` en pasos de SOP (38 coincidencias en seed).

### Fase 3 — Materialización (4 commits)

**Pipeline 1 — Fundaciones** (`140c18d`):
- `attention.ts` — `fromMetadata` con Zod real.
- `lifecycle.ts` — quitado `auditChainValid = true` siempre.
- `snapshot.ts` — import con transacción por lotes.
- `kernel-routes.ts` — endpoints `/api/kernel/snapshot/export` e `/import`.
- `app.ts` — `/api/health-deep` llama a `checkKernelHealth`.

**Pipeline 2 — Materialización core** (`7a5b6fa`):
- `service.ts` — `runMetaLoop` con `consumeHint`.
- `rules.ts` — `discard_reasoning_noise` después de atención.
- `model.ts` — `openChildTurn` si slow termina tras cerrar padre.

**Pipeline 3 — Comportamiento** (`69bbd01`):
- `user-author.ts`, `fast-author.ts`, `slow-author.ts` — atención real.
- `presenter.ts` — `composeFromThoughts`.
- `views.ts` — sin `as any` en `tenant.turns`.
- `consolidate.ts` — marca CONSOLIDATE_ACTION_V1.

**Pipeline 4 — Latencias** (`608cf07`):
- `consolidate.ts` — cap 200 thoughts por tenant.
- `views.ts` — `readView` con tope 200.
- `store-store.ts` — cache `getTurn` TTL 1s.

**Pipeline 5 — Cierre**:
- `service.ts` — `TenantScopedCapabilityRegistry` wireado con resolver real.

## Qué NO hace esta fase

- No cromos ni polaridad.
- No specs cognitivos por capacidad (estructura declarada, sin poblar).
- No tests (bloque 01).

## Pendientes (bloque 01)

- Test `packages/domain/test/ontology.test.ts`:
  - slug canónico aceptado,
  - colisión con base rechazada,
  - bundle congelado devuelto.
- Test SSE que verifica que el Presenter decide el texto.
- Tests N10-N12 del kernel.

## Pendientes (bloque 19)

- `StoreAuditStore.verify` paginado con cursor keyset.
  Hoy: fail-honest (devuelve `false` si > `KERNEL_AUDIT_MAX_LIST`).

## Filosofía

- El vocabulario es estático. Se compila. No se reescribe en runtime.
- Se valida en bootstrap. Falla rápido.
- El runtime solo consulta. Cero latencia por validación.
- Materializar lo existente, no inventar abstracciones.