# Etapa 04 — Sistema de creación, configuración y asignación de agentes

## 1. Objetivo y alcance

Definir cómo se crean, configuran y asignan los agentes de una empresa: catálogo de roles, competencias, límites, responsabilidades, relación con SOPs/procesos/herramientas, memoria, supervisión, delegación.

## 2. Subsistemas involucrados

- `packages/domain/src/agent.ts` — `AgentRole`, `AgentPersona`.
- `packages/domain/src/actor.ts` — `Actor`.
- `apps/server/src/engine/agents/personas/{registry,bootstrap,routes}.ts` — personas.
- `apps/server/src/engine/assignments/*` — asignaciones.
- `apps/server/src/engine/agents/governance.ts` — permisos.
- `clientes/<tenant>/agentes.json`, `personas/*.json`.

## 3. Fases y tareas

- [ ] Fase 1 — Catálogo de roles: qué roles existen (comercial, atención, finanzas, etc.), sus competencias y límites.
- [ ] Fase 2 — Contrato de agente: schema Zod de `AgentRole` + `AgentPersona` + `Actor` con relación explícita.
- [ ] Fase 3 — Configuración: memoria, contexto, acceso a datos, tools permitidas, cuotas.
- [ ] Fase 4 — Asignación: relación agente ↔ proceso ↔ SOP ↔ tarea.
- [ ] Fase 5 — Supervisión, delegación, escalado a humano.

## 4. Criterios de auditoría

| # | Criterio | Cómo se audita |
|---|---|---|
| A1 | Cada agente del bundle referencia un `AgentRole` válido | `validateAgents(bundle)` |
| A2 | Cada `AgentRole` tiene `allowedTools` o `permissions` | Schema Zod |
| A3 | Cada asignación referencia agente + proceso + SOP existentes | `validateAssignments(bundle)` |
| A4 | La gobernanza consulta el rol real (no ficticio) | `governance.canExecuteTool(actor, owner, role, tool)` |

## 5. Criterios de aceptación (tests)

| # | Test | Fichero | Casos |
|---|---|---|---|
| T1 | Un agente válido pasa la validación | `tests/roadmap/etapa-04.test.ts` | rol + persona + actor coherentes |
| T2 | Un agente sin rol válido falla | idem | `agentes.json` referencia rol inexistente |
| T3 | Una asignación a proceso inexistente falla | idem | assignment → proceso-inexistente |

## 6. Evidencia actual en el repo

| Subsistema | Estado | Evidencia |
|---|---|---|
| `AgentRole` schema | `EXISTE` | `packages/domain/src/agent.ts` |
| `AgentPersona` schema | `EXISTE` | `packages/domain/src/agent-persona.ts` |
| `Actor` schema | `EXISTE` | `packages/domain/src/actor.ts` |
| `PersonaRegistry` | `EXISTE` | `engine/agents/personas/registry.ts` |
| `bootstrapPersonas` | `EXISTE` | `engine/agents/personas/bootstrap.ts` |
| `AssignmentService` | `PARCIAL` | `engine/assignments/service.ts` |
| `AgentGovernance` | `EXISTE` | `engine/agents/governance.ts` |
| `validateAgents(bundle)` | `NO_EXISTE` | — |
| `validateAssignments(bundle)` | `NO_EXISTE` | — |
| Relación agente ↔ proceso ↔ SOP ↔ tarea | `PARCIAL` | `assignments/adapters/*` |

## 7. Brecha

- [ ] `validateAgents(bundle)` y `validateAssignments(bundle)`.
- [ ] Contrato explícito de relación agente ↔ proceso.
- [ ] Test de aceptación con agentes válidos, sin rol y con asignación rota.

## 8. Handoff

- [ ] `validateAgents` + `validateAssignments` → etapa 05.
- [ ] Catálogo de roles por tenant → etapa 06 (runtime usa roles reales).

## 9. Miniroadmaps internos

`04-agentes/` con fases 1–5.