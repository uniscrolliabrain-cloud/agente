# Etapa 06 — Runtime empresarial integrado

## 1. Objetivo y alcance

Ejecutar la empresa compilada: procesos, tareas, agentes, trabajadores, dependencias, horarios, eventos, estado, verificación y recuperación. El runtime no compila: ejecuta lo compilado.

## 2. Subsistemas involucrados

- `apps/server/src/engine/worker.ts` — tareas durables.
- `apps/server/src/engine/orchestrator/orchestrator.ts` — `runGoal`.
- `apps/server/src/engine/execution/{executor,capability-runner}.ts`.
- `apps/server/src/kernel/kernel.ts` — turnos, thoughts, promoter, meta.
- `apps/server/src/engine/events/bus.ts` — eventos.
- `apps/server/src/engine/verification/{verifier,llm-verifier}.ts`.
- `apps/server/src/engine/learning/observer.ts`.
- `packages/domain/src/plan.ts`, `outcome.ts`, `verification.ts`.

## 3. Fases y tareas

- [ ] Fase 1 — Contrato de ejecución: qué recibe el runtime (proceso + inputs + contexto), qué produce (outcome + evidencia + estado).
- [ ] Fase 2 — Ejecución de procesos: `executeProcess(processGraph, inputs, ctx)`.
- [ ] Fase 3 — Coordinación: dependencias, concurrencia, bloqueos, horarios.
- [ ] Fase 4 — Persistencia + memoria + evidencia: qué se guarda, dónde, cómo se recupera.
- [ ] Fase 5 — Verificación: cómo se decide que un proceso terminó correctamente.
- [ ] Fase 6 — Recuperación: qué pasa si el worker se interrumpe, si un step falla, si el proceso queda a medias.
- [ ] Fase 7 — Aislamiento: tenant A no ve tenant B.

## 4. Criterios de auditoría

| # | Criterio | Cómo se audita |
|---|---|---|
| A1 | Existe `executeProcess` con contrato claro | `engine/runtime/execute-process.ts` (nuevo) |
| A2 | Un proceso se ejecuta de extremo a extremo | Test E2E |
| A3 | El outcome refleja verificación real, no `succeeded` del executor | `outcome.verified` |
| A4 | La recuperación funciona | Test crash-recovery |
| A5 | El aislamiento se cumple | Test multi-tenant |

## 5. Criterios de aceptación (tests)

| # | Test | Fichero | Casos |
|---|---|---|---|
| T1 | Un proceso con 3 steps termina `achieved` | `tests/roadmap/etapa-06.test.ts` | proceso válido + verifier |
| T2 | Un proceso con step fallido termina `failed` | idem | step lanza error |
| T3 | Un proceso con todos skipped termina `blocked` | idem | dependencias no resueltas |
| T4 | Un worker interrumpido recupera | idem | crash-recovery |
| T5 | Tenant A no ve proceso de B | idem | aislamiento |

## 6. Evidencia actual en el repo

| Subsistema | Estado | Evidencia |
|---|---|---|
| `TaskWorker` (leases, checkpoints, dead-letter) | `EXISTE` | `engine/worker.ts` |
| `BusinessOSOrchestrator.runGoal` | `EXISTE` | `engine/orchestrator/orchestrator.ts` |
| `Executor` con retry + compensación | `EXISTE` | `engine/execution/executor.ts` |
| `CapabilityRunner` con authz + idempotencia | `EXISTE` | `engine/execution/capability-runner.ts` |
| Kernel (turnos, thoughts, promoter) | `EXISTE` | `kernel/kernel.ts` |
| Event bus | `EXISTE` | `engine/events/bus.ts` |
| Verifier + LLM verifier | `EXISTE` | `engine/verification/*` |
| LearningObserver | `EXISTE` | `engine/learning/observer.ts` |
| `executeProcess` (proceso como grafo) | `NO_EXISTE` | — |
| Ejecución end-to-end de un proceso compilado | `NO_EXISTE` | — |
| Coordinación de procesos concurrentes | `NO_EXISTE` | — |
| Tests de recuperación de proceso compilado | `NO_EXISTE` | — |
| Tests de aislamiento de proceso compilado | `NO_EXISTE` | — |

## 7. Brecha

- [ ] `executeProcess(processGraph, inputs, ctx)`.
- [ ] Test E2E de proceso compilado.
- [ ] Coordinación concurrente de procesos.
- [ ] Tests de recuperación y aislamiento a nivel de proceso.

## 8. Handoff

- [ ] `executeProcess` → etapa 10 (piloto) y etapa 11 (validación).
- [ ] Tests E2E → etapa 11.

## 9. Miniroadmaps internos

`06-runtime-empresarial/` con fases 1–7.