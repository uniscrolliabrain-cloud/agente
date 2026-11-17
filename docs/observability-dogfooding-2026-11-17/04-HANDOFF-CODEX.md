# Handoff para Codex / Freebuff
Objetivo: implementar OBS-00 a OBS-12 desde el programa de este folder, en ramas separadas, sin merge a main ni deploy sin aprobación. Lee primero README, AUDIT, ARQUITECTURA, CAMPAÑAS y el árbol real de HEAD. La auditoría del 17-11-2026 fue lectura estática, no sustituye el baseline.

1. Empezar SOLO OBS-00: capturar SHA, inventario real, wiring, suites, métricas y reporte reproducible. No ejecutar OBS-01 hasta cerrar incertidumbres y presentar plan de patchsets.
2. Para cada campaña: definir paths exclusivos y contrato de compatibilidad, tests antes/después, implementación mínima, reporte, gate, rollback.
3. Mantener LAIA como presenter Fast, sin propuesta ni ejecución. Steps LLM del runtime son datos no confiables; kernel autoriza efectos.
4. No alterar contratos SystemEvent, Zod, RLS ni Event Bus sin migración/versionado y tests. No crear otro orquestador.
5. Usar OTel como telemetría técnica; Postgres/Event Bus como auditoría de negocio. No depender de Grafana para decisiones.
6. Redactar datos sensibles y no enviar prompts/PII a terceros por defecto. No crear cuentas ni secretos inventados.
7. Verificar comportamiento de audit-consumer, health, auth, traceparent, fallback, retries, outcome_unknown y multi-tenancy; diferenciar confirmed, historical, suspected y fixed.
8. Requerir aprobación antes de desplegar, mezclar ramas, cambiar políticas de autorización o ejecutar acciones externas.
9. Terminar cada campaña con un resumen de riesgos restantes y evidencia reproducible, no afirmaciones genéricas.
10. Prioridad operativa: primero capacidad de reconstruir una sola operación end-to-end; después instrumentar más rutas y finalmente dashboards.

Prompt de arranque:
«Trabaja en uniscrolliabrain-cloud/agente. Lee íntegramente docs/observability-dogfooding-2026-11-17/00-README.md, 01-AUDIT-CODIGO.md, 02-ARQUITECTURA-CONTRATOS.md, 03-CAMPANAS-OBS00-OBS12.md y este handoff. Ejecuta OBS-00 con mediciones reales, tests, matriz de rutas con efectos y reporte versionado en una rama nueva. No hagas merge ni despliegues. No asumas que los hallazgos históricos siguen abiertos. Solicita aprobación para continuar con OBS-01 tras entregar evidencias».