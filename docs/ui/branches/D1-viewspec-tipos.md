# D1 - ViewSpec tipos y schemas

> **UI_CAMPAIGN_D1_VIEWSPEC_V1** · Última actualización: 2026-10-03.
> Estado: HECHO.

## Objetivo

Tipos y schemas de ViewSpec con discriminated union validado con Zod. Cada `kind` con sus campos. Sin HTML libre del LLM.

## Ficheros nuevos (2)

- `packages/domain/src/views.ts`.
- `tests/view-spec.test.ts`.

## Ficheros modificados (2)

- `packages/domain/src/index.ts` (export).
- `apps/web/src/view/spec.ts` (marca de deprecación).

## Decisiones clave

- D10: discriminated union.
- D11: solo `dashboard` y `queue` al principio.

## Verificación

- `views.ts` existe y exporta `viewSpecSchema`, `parseViewSpec`, `ViewSpec`.
- `index.ts` (domain) exporta `views`.
- `view/spec.ts` tiene `D1_VIEWSPEC_DEPRECATED_V1`.
- `tests/view-spec.test.ts` existe.

**Fin de D1.**