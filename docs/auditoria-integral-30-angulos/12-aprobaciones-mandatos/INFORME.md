# 12 — Aprobaciones y mandatos

> Estado: diagnóstico inicial, pendiente de auditoría profunda y pruebas. Rama: `docs/audit-30-dominios-runtime-20261115`. Base: `54b8d5407a8576459448c4d059a877297d18ca7a`.

## Alcance
Aprobaciones y mandatos. Revisar el código real y sus tests antes de proponer modificaciones.

## Evidencia inicial a inspeccionar
- `packages/domain/src/assignments/approval.ts`
- `apps/server/src/engine/assignments/adapters/approval-adapter.ts`

## Diagnóstico / hipótesis
Aprobar payloadHash, versión, actor, tenant, expiración y acción concreta; no confiar en un sí conversacional.

## Diseño objetivo
El LLM conversacional comunica; el slow LLM propone; el kernel valida y autoriza; el runtime ejecuta SOPs/skills/pipelines; los eventos alimentan al presenter sin bloquear la voz. Aplicar solo las piezas relevantes a este ángulo.

## Trabajo de ampliación
1. Trazar entrypoints, consumidores y llamadas transversales con fichero y línea.
2. Clasificar existente / parcial / ausente / no comprobado.
3. Enumerar contratos Zod/TS, políticas, efectos, idempotencia y aislamiento tenant.
4. Especificar patchsets granulares sin duplicar implementaciones existentes.
5. Preparar unit, integración, smoke, E2E y fallos inyectados.

## Entregable y criterio de cierre
Máquina de estados de approval, CAS y pruebas de revocación.

## Informe de ejecución
- Cambios: ninguno en esta fase documental.
- Tests ejecutados: ninguno.
- Estado: abierto.
- Evidencias y métricas: pendientes.
