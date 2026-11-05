# Estado del Gate de Auditoría

> v1 · 2026-10-27 · Estado: current

Estado medido de los 7 audits ejecutados con `pnpm audit:coherence`.

## Resumen

| Audit | Resultado | Detalle |
|-------|-----------|---------|
| `layers` | Verde (exit 0) | — |
| `bridges` | Verde (exit 0) | — |
| `console` | Verde (exit 0) | — |
| `anchors` | Verde (exit 0) | — |
| `tenant-default` | Verde (exit 0) | — |
| `contracts` | Rojo (exit 1) | 154 OK / 14 PENDING / **150 huérfanos** |
| `idempotency` | Rojo (exit 1) | **157 duplicadas** / 4 huérfanas / 138 repetidas mismo fichero |

## `audit:contracts` — 150 contratos huérfanos

250 contratos totales en `packages/domain/`. Solo 82 tienen implementación real en código. 150 no tienen implementación ni marca `PENDING`.

Los contratos huérfanos incluyen tipos, interfaces y schemas de:
- `agent.ts`, `agent-persona.ts`, `actions.ts`, `business.ts`, `business-schema.ts`
- `capability.ts`, `classification.ts`, `conflict.ts`, `context-chips.ts`
- `execution-context.ts`, `flow.ts`, `goal.ts`, `jwt.ts`, `kernel.ts`
- `live.ts`, `messaging.ts`, `ontology-seed.ts`, `outcome.ts`, `plan.ts`
- `policy.ts`, `reaction.ts`, `runtime.ts`, `signip.ts`, `sop.ts`
- `truth.ts`, `verification.ts`, `views.ts`, `workspace-spec.ts`

**Acción**: triaje en tres cubos (implementar / borrar / `PENDING(motivo, fecha)`). Ver FASE-02 y FASE-03.

## `audit:idempotency` — 157 marcas duplicadas

781 ficheros revisados, 1400 marcas encontradas, 1195 únicas.

| Problema | Cantidad |
|----------|----------|
| Marcas duplicadas con cuerpo distinto | 157 |
| Marcas huérfanas (sin código real debajo) | 4 |
| Marcas repetidas en el mismo fichero | 138 |

**Impacto**: `audit:idempotency` no audita idempotencia de verdad. Audita comentarios con forma de marca (`XXX_V1`) y falla cuando una marca aparece dos veces en el mismo fichero o en dos ficheros con cuerpo distinto. Esto puede bloquear un deploy aunque el código sea correcto.

**Acción**: separar índice de marcas (informativo) de duplicados revisados con allowlist (motivo y fecha). Implementar idempotencia de verdad: test de doble ejecución con la misma clave.

## `audit:coherence` — ejecuta los 7 seguidos

No cortocircuita: ejecuta los 7 audits incluso si algunos fallan. Resultado global: rojo (por `contracts` e `idempotency`).

## Cero marcas nuevas sin verificación

Cualquier nueva marca `XXX_V1` debe ser verificada que no duplique una existente. Ver `docs/05-desarrollo/PROTOCOLO.md` (sección Idempotencia).
