# Business OS

## Ciclo completo

    Goal
      ↓
    ContextEngine (con budget)
      ↓
    CapabilityRegistry (find by tag / kind)
      ↓
    Planner (LLM + determinista)
      ↓
    Executor (retry + compensacion)
      ↓
    Outcome
      ↓
    Verifier (determinista + LLM)
      ↓
    LearningObserver (facts, patterns, failure)
      ↓
    Replanner (si Verifier falla)
      ↓
    EventBus (todo lo anterior)

## Componentes

### Contratos del dominio (packages/domain/src/)

- goal.ts - objetivo con criterios de exito.
- outcome.ts - resultado estructurado.
- capability.ts - capacidad ejecutable con contrato.
- plan.ts - plan versionado.
- runtime.ts - runtime efimero.
- verification.ts - verificacion.
- messaging.ts - mensajes entre roles, handoffs, aprobaciones.
- policy-context.ts - politicas contextuales y reacciones.
- truth.ts - resolucion de verdad.
- entity-resolution.ts - resolucion de entidades.
- business-schema.ts - definicion declarativa de tipos.
- reaction.ts - reacciones a eventos.
- learning.ts - aprendizaje real.
- workspace-spec.ts - especificacion de workspace.
- execution-context.ts - contexto unificado.

### Servicios (apps/server/src/engine/)

- guardrails/service.ts - cuotas por tenant.
- capabilities/registry.ts + bootstrap.ts.
- planner/planner.ts (stub) + llm-planner.ts (segunda capa).
- planner/replanner.ts (stub).
- verification/verifier.ts + llm-verifier.ts.
- execution/executor.ts - ejecuta plan con retry/compensacion.
- execution/capability-runner.ts - ejecuta capabilities.
- orchestrator/orchestrator.ts - ciclo completo.
- learning/observer.ts - aprende de cada ejecucion.
- handoff/service.ts - pasa trabajo entre roles.
- reactions/engine.ts - reacciona a eventos.
- feedback/collector.ts - recoge feedback del usuario.
- feedback/scoring.ts - ajusta scoring segun feedback.
- context/budget.ts - presupuesto de tokens.

## Feedback loops

1. Cada ejecucion del orquestador genera un Outcome.
2. El Outcome se pasa al LearningObserver.
3. El observer guarda facts, patterns, failure lessons.
4. Los patterns con N exitos se proponen como SOPs.
5. Los failure lessons con N ocurrencias proponen reglas de prevencion.
6. El usuario deja feedback (useful/not_useful).
7. FeedbackScoring ajusta el scoring del contexto por fuente.

## Release checks

- pnpm release:check antes del deploy.
- pnpm release:verify despues del deploy.

## Guardrails

Cuotas por tenant configurables en records/guardrail-quotas/default:
- tokens/dia, tareas activas, tareas/hora, eventos/dia, turnos activos, coste/dia.

## Multi-tenant

- records.tenant_id con indices compuestos.
- SystemEvent.tenantId.
- ExecutionContext propagado.
- RateLimiter.takeForTenant.
- Ficheros por tenant en dataDir/tenants/<tenantId>/.

## Chat humano

- System prompt en espanol con 8 reglas de tono.
- Maximo 3 frases.
- Sin terminos internos.
- Sin emojis.

## Estado del wiring

- Planner: StubPlanner cableado; LlmPlanner pendiente de conectar al modelo.
- Executor: cableado al CapabilityRunner; runners por kind pendientes.
- Verifier: DeterministicVerifier activo; LlmVerifier segunda capa.
- LearningObserver: cableado al orquestador, guarda facts/patterns/failures.
- ReactionEngine: lee del bus, emite eventos derivados.
- HandoffService: persiste handoffs entre roles.
- FeedbackCollector: guarda feedback del usuario; FeedbackScoring ajusta scoring.
- Guardrails: activos en createTask y recordUsage.

## Endpoints

- GET /api/admin/system/status
- GET /api/admin/system/capabilities
- GET /api/admin/tenants/:tenantId/usage
- GET /api/admin/tenants/:tenantId/feedback
- POST /api/admin/tenants/:tenantId/feedback
- GET /api/admin/tenants/:tenantId/feedback/aggregate
- GET /api/admin/tenants/:tenantId/approvals
- POST /api/admin/guardrails/:tenantId/quota
- POST /api/agent/feedback