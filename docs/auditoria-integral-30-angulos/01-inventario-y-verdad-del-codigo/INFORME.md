# 01 — Inventario verificable y trazabilidad

> Estado: diagnóstico inicial, pendiente de auditoría profunda y pruebas. Rama: `docs/audit-30-dominios-runtime-20261115`. Base: `54b8d5407a8576459448c4d059a877297d18ca7a`.

## Alcance
Inventario verificable y trazabilidad. Revisar el código real y sus tests antes de proponer modificaciones.

## Evidencia inicial a inspeccionar
- `package.json`
- `README.md`
- `docs/08-auditorias/latencia-anam-2026-11-11.md`

## Diagnóstico / hipótesis
Distinguir código, documentación, tests y despliegue; congelar SHA; localizar rutas y ramas sin presuponer su integración.

## Diseño objetivo
El LLM conversacional comunica; el slow LLM propone; el kernel valida y autoriza; el runtime ejecuta SOPs/skills/pipelines; los eventos alimentan al presenter sin bloquear la voz. Aplicar solo las piezas relevantes a este ángulo.

## Trabajo de ampliación
1. Trazar entrypoints, consumidores y llamadas transversales con fichero y línea.
2. Clasificar existente / parcial / ausente / no comprobado.
3. Enumerar contratos Zod/TS, políticas, efectos, idempotencia y aislamiento tenant.
4. Especificar patchsets granulares sin duplicar implementaciones existentes.
5. Preparar unit, integración, smoke, E2E y fallos inyectados.

## Entregable y criterio de cierre
Mapa de módulos, evidencias por archivo/línea, gaps y gate baseline.

## Informe de ejecución
- Cambios: ninguno en esta fase documental.
- Tests ejecutados: ninguno.
- Estado: abierto.
- Evidencias y métricas: pendientes.
