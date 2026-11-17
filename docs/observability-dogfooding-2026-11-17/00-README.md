# Programa OBS — Observabilidad para dogfooding AgntiaPro
Fecha: 2026-11-17. Rama: docs/observability-dogfooding-audit-20261117. Estado: AUDITORÍA ESTÁTICA PARCIAL + CAMPAÑAS PROPUESTAS. No es una certificación de ejecución, tests, producción ni HEAD congelado.

## Objetivo
Reconstruir cada operación de 2–3 empresas propias: interacción (Fast LLM presenter LAIA, sin decisiones ni ejecución) -> activación de SOP -> step LLM operativo cuando corresponda -> propuesta no confiable -> validación del kernel -> aprobación -> efecto -> recibo/reconciliación. Separación tenant, identidad, roles, coste, latencia, errores, retención, alertas y replay sin efectos.

## Índice
- 01-AUDIT-CODIGO.md: hallazgos verificados y riesgos pendientes de prueba.
- 02-ARQUITECTURA-CONTRATOS.md: contratos, modelo de datos, OTel, seguridad y UX.
- 03-CAMPANAS-OBS00-OBS12.md: 13 campañas, patchsets, gates y dependencias.
- 04-HANDOFF-CODEX.md: instrucciones de ejecución y pruebas.

## Restricciones
- No tocar main ni desplegar sin aprobación.
- No confundir Fast LLM conversacional de LAIA con Slow/task LLM de steps.
- No convertir Grafana en fuente de verdad; Postgres/Event Bus y recibos verificables son la fuente de auditoría.
- No introducir un segundo runtime, motor de agentes ni planificador.
- No loguear secretos, payloads personales ni prompts completos por defecto.
- No afirmar que los hallazgos históricos de 2026-10-04 o 2026-11-10 siguen abiertos sin reproducirlos.
- Toda campaña comienza con baseline de SHA, árbol, wiring, tests, y deja informe de resultados.
