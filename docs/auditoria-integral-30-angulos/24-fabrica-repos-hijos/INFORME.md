# 24 — Contrato de instalación de los 15 repos

> Estado: diagnóstico inicial, pendiente de auditoría profunda y pruebas. Rama: `docs/audit-30-dominios-runtime-20261115`. Base: `54b8d5407a8576459448c4d059a877297d18ca7a`.

## Alcance
Contrato de instalación de los 15 repos. Revisar el código real y sus tests antes de proponer modificaciones.

## Evidencia inicial a inspeccionar
- `packages/domain/src/capability.ts`
- `apps/server/src/engine/capabilities/registry.ts`

## Diagnóstico / hipótesis
No asumir inventario ni madurez de 14 hijos; auditar cada repo, ramas y commits antes de integrarlo.

## Diseño objetivo
El LLM conversacional comunica; el slow LLM propone; el kernel valida y autoriza; el runtime ejecuta SOPs/skills/pipelines; los eventos alimentan al presenter sin bloquear la voz. Aplicar solo las piezas relevantes a este ángulo.

## Trabajo de ampliación
1. Trazar entrypoints, consumidores y llamadas transversales con fichero y línea.
2. Clasificar existente / parcial / ausente / no comprobado.
3. Enumerar contratos Zod/TS, políticas, efectos, idempotencia y aislamiento tenant.
4. Especificar patchsets granulares sin duplicar implementaciones existentes.
5. Preparar unit, integración, smoke, E2E y fallos inyectados.

## Entregable y criterio de cierre
CapabilityBundle manifest, SDK, matriz de versiones y handoff por hijo.

## Informe de ejecución
- Cambios: ninguno en esta fase documental.
- Tests ejecutados: ninguno.
- Estado: abierto.
- Evidencias y métricas: pendientes.
