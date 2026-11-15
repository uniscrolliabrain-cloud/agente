# 11 — Identidad, tenancy y RLS

> Estado: diagnóstico inicial, pendiente de auditoría profunda y pruebas. Rama: `docs/audit-30-dominios-runtime-20261115`. Base: `54b8d5407a8576459448c4d059a877297d18ca7a`.

## Alcance
Identidad, tenancy y RLS. Revisar el código real y sus tests antes de proponer modificaciones.

## Evidencia inicial a inspeccionar
- `apps/server/src/engine/tenant.ts`
- `apps/server/src/db-tenant.ts`
- `apps/server/src/tenant-scope.ts`

## Diagnóstico / hipótesis
Verificar propagación tenant/owner/actor entre chat, workers, repos hijos y eventos; denegar scope implícito.

## Diseño objetivo
El LLM conversacional comunica; el slow LLM propone; el kernel valida y autoriza; el runtime ejecuta SOPs/skills/pipelines; los eventos alimentan al presenter sin bloquear la voz. Aplicar solo las piezas relevantes a este ángulo.

## Trabajo de ampliación
1. Trazar entrypoints, consumidores y llamadas transversales con fichero y línea.
2. Clasificar existente / parcial / ausente / no comprobado.
3. Enumerar contratos Zod/TS, políticas, efectos, idempotencia y aislamiento tenant.
4. Especificar patchsets granulares sin duplicar implementaciones existentes.
5. Preparar unit, integración, smoke, E2E y fallos inyectados.

## Entregable y criterio de cierre
Matriz de aislamiento, pruebas cross-tenant y contratos de identidad confiable.

## Informe de ejecución
- Cambios: ninguno en esta fase documental.
- Tests ejecutados: ninguno.
- Estado: abierto.
- Evidencias y métricas: pendientes.
