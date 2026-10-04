# 24 — Business OS (goals)

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump engine/orchestrator/*, planner/*, verification/*, capabilities/*, BUSINESS_OS.md

## Ontología

BusinessOSOrchestrator, CapabilityRegistry, Planner, LlmPlanner, Replanner, LlmReplanner, Verifier, DeterministicVerifier, LlmVerifier, LearningObserver, Executor, CapabilityRunner, Goal, Outcome, Plan, CapabilityContract.

## Estado real

BusinessOSOrchestrator cableado. CapabilityRegistry con 12 tools + 4 composites. LlmPlanner con fallback a StubPlanner. LlmVerifier como segunda capa. LearningObserver conectado al orquestador. Executor con retry y compensación. Replanner LLM.

## Evidencia

Los 4 tests de business-os-contracts.test.ts pasan. Los 2 de business-os-orchestrator.test.ts pasan. Los 2 de business-os-slice.test.ts pasan. Los tests del orchestrator devuelven achieved y blocked según verificación. No hay test end-to-end con goal real persistido.

## Huecos declarados

- Más capabilities reales.
- Verificación externa (no solo LLM).
- Promoción de patrones a SOPs.
- Observabilidad por goal.

## Huecos profundos (auditoría extendida)

1. **`Goal` de `agent.ts` vs `Goal` de `goal.ts`**: dos tipos distintos con el mismo nombre. Adapter en createGoal.
2. **`createGoal` con orquestador en background sin retry**: si falla, el goal queda sin plan.
3. **`LlmPlanner` con fallback a `StubPlanner`**: el stub devuelve plan vacío. Silencioso.
4. **`parsePlannerResponse` con substring de `[` a `]`**: un LLM que devuelve texto antes del JSON falla.
5. **`validatePlanCapabilities` existe pero no se llama**: un plan con capabilityId inexistente se ejecuta.
6. **`enforcePlanBudget` con `MAX_PLAN_STEPS = 50`**: configurable no.
7. **`Executor` sin "step timeout"**: un step colgado bloquea el plan.
8. **`Executor` con compensation en orden inverso**: correcto, pero no verifica que la compensación haya funcionado.
9. **`DeterministicVerifier` solo evalúa `metrics`**: no evalúa `evidence`.
10. **`LlmVerifier` como segunda capa solo si `evidence.length > 0`**: si no hay evidence, no verifica.
11. **`LearningObserver.observe` con `goal.id` como key**: si un goal se reabre, se cuenta dos veces.
12. **`LearningObserver` sin TTL de patterns**: crecen sin tope.
13. **`LearningObserver` con `successCount >= 5` para proponer SOP**: umbral fijo.
14. **`proposedAsSop` sin generar el SOP real**: solo marca el pattern.
15. **`FeedbackCollector` sin agrupar por goalId**: cada feedback es una fila.
16. **`FeedbackScoring` con multiplicadores sin aplicar en ContextEngine**: se calculan pero no se usan.
17. **`MetricsCollector` sin export a Prometheus**: las métricas por tenant no están en `/metrics`.
18. **Sin "goal cancelable"**: una vez lanzado, no se puede abortar.
19. **Sin "goal paralelizable"**: los goals se ejecutan uno a uno.
20. **Sin "goal retomable"**: si el proceso muere a mitad de un goal, no se reanuda.

## Interrelación

Capa de negocio. Depende de 05, 08, 09, 12.

## Riesgos

Ciclo se ejecuta en bucle sin salida. LLM planifica mal y el executor falla. Nadie lee los aprendizajes.

## Tipo de fixes

LearningObserver que promueva patrones a SOPs tras N éxitos. Métrica openmuse_goals_total{status}. Test end-to-end con 1 goal persistido. Goal cancelable. Goal persistente. Validación de plan antes de ejecutar. Step timeout.
