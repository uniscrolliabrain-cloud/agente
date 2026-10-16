# Roadmap — 24 Business OS goals

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Ciclos Goal → Plan → Execute → Verify → Replan. No obligatorio para
vender, sí para madurar.

## 2. Estado verificado
- BusinessOSOrchestrator, CapabilityRegistry.
- LlmPlanner con fallback a StubPlanner.
- LlmVerifier como segunda capa. LearningObserver conectado.
- Fuente: docs/audits/_prep/audit-orchestrator.txt y repodump
  engine/orchestrator/*, planner/*, verification/*, capabilities/*.

## 3. Huecos contra producción
- Más capabilities reales.
- Verificación externa (no solo LLM).
- Promoción de patrones a SOPs.
- Observabilidad por goal.

## 4. Objetivo
Un goal completo ejecutado end-to-end con verificación real.

## 5. Fronteras
- No multi-agente todavía.

## 6. Conexiones
- Depende de: 05, 08, 09, 12.
- Archivos compartidos: engine/orchestrator/*, planner/*,
  verification/*, capabilities/*.

## 7. Principios del PRODUCT.md
Tareas durables, memoria curada.

## 8. Cómo se verifica el cierre
- Test end-to-end Goal → Outcome persistido.
- LearningObserver que promueva patrones a SOPs tras N éxitos.
- Métrica openmuse_goals_total{status}.
