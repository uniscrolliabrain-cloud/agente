# 09z — Fundamentos del kernel cognitivo

> v1 · 2026-10-06 · Estado: aplicado

## Qué se ha aplicado

Fase 1 de la remodelación del kernel. Solo estructura. Sin tocar runtime.

### Archivos nuevos

- `packages/domain/src/actions.ts` — 16 verbos de acción.
- `packages/domain/src/taxonomy.ts` — 15 familias de capacidad.
- `packages/domain/src/ontology.ts` — OntologyBundle + CapabilitySpec + validateAgainstMetamodel.
- `packages/domain/src/ontology-seed.ts` — vocabulario base.

### Fixes en archivos existentes

- `packages/domain/src/capability.ts` — `actionType` y `family` opcionales.
- `packages/domain/src/sop.ts` — `capabilityId` opcional en pasos.
- `packages/domain/src/agent.ts` — `ALLOWED_TASK_TRANSITIONS` + `canTransitionTask`.
- `apps/server/src/engine/capabilities/registry.ts` — `TenantScopedCapabilityRegistry` con cache TTL.

## Qué NO hace esta fase

- No toca el kernel.
- No toca autores, promoter, presenter, meta.
- No toca conversation.ts, model.ts, service.ts.

## Pendientes (para Fase 2)

- Migrar las 19 capacidades de `bootstrap.ts` a declarar `actionType` y `family`.
- Unificar `promote.ts:destination` con `ontology.ts:promotion.destination`.
- Añadir test `packages/domain/test/ontology.test.ts` con:
  - slug canónico,
  - colisión con base,
  - bundle congelado.
- Cablear `validateAgainstMetamodel` en el bootstrap del server.
- Añadir `capabilityId` a los pasos de SOP existentes.
- Usar `canTransitionTask` en `worker.ts` y `service.ts`.
- Wirear `TenantScopedCapabilityRegistry` con un resolver real.

## Filosofía

- El vocabulario es estático. Se compila. No se reescribe en runtime.
- Se valida en bootstrap. Falla rápido.
- El runtime solo consulta. Cero latencia por validación.