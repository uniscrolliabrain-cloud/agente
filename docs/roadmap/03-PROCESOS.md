# Etapa 03 — Sistema holístico de procesos y caminos de ejecución

## 1. Objetivo y alcance

Definir cómo se representa la operación global de una empresa: procesos, subprocesos, entradas, salidas, estados, dependencias, bifurcaciones, handoffs. La empresa se ve como una red de operaciones, no como automatizaciones sueltas.

## 2. Subsistemas involucrados

- `packages/domain/src/sop.ts` — SOPs.
- `packages/domain/src/plan.ts` — planes.
- `packages/domain/src/flow.ts` — flujos.
- `apps/server/src/engine/task-plans.ts` — planes de tarea.
- `apps/server/src/engine/sop-executor.ts` — ejecución de SOPs.
- `apps/server/src/engine/sop-triggers.ts` — triggers cron/email.

## 3. Fases y tareas

- [ ] Fase 1 — Inventario de procesos: qué procesos tiene una empresa, entradas, salidas, responsables.
- [ ] Fase 2 — Contrato de proceso: schema Zod con `id`, `entrada`, `salida`, `steps`, `dependeDe`, `bifurcaciones`, `handoffs`.
- [ ] Fase 3 — Grafo de procesos: representación como red, no como lista.
- [ ] Fase 4 — Validación de caminos: cada camino tiene las capabilities y recursos necesarios.
- [ ] Fase 5 — Coordinación concurrente: procesos simultáneos, bloqueos, dependencias.

## 4. Criterios de auditoría

| # | Criterio | Cómo se audita |
|---|---|---|
| A1 | Existe schema Zod de proceso completo | `packages/domain/src/process.ts` (nuevo) |
| A2 | Los procesos referencian SOPs/capabilities válidas | `validateProcess` |
| A3 | El grafo de procesos detecta ciclos | `detectCycles(processes)` |
| A4 | Cada camino tiene sus dependencias resueltas | `validatePaths(processes, capabilities)` |

## 5. Criterios de aceptación (tests)

| # | Test | Fichero | Casos |
|---|---|---|---|
| T1 | Un proceso válido se compila a grafo | `tests/roadmap/etapa-03.test.ts` | proceso con 3 steps + 2 deps |
| T2 | Un proceso con ciclo falla | idem | A→B→A |
| T3 | Un proceso con capability inexistente falla | idem | step referencia cap-inexistente |

## 6. Evidencia actual en el repo

| Subsistema | Estado | Evidencia |
|---|---|---|
| SOP schema | `PARCIAL` | `packages/domain/src/sop.ts` |
| Plan schema | `EXISTE` | `packages/domain/src/plan.ts` |
| Flow schema | `PARCIAL` | `packages/domain/src/flow.ts` |
| SOP executor | `EXISTE` | `engine/sop-executor.ts` |
| SOP triggers | `EXISTE` | `engine/sop-triggers.ts` |
| Schema de proceso completo | `NO_EXISTE` | — |
| Grafo de procesos | `NO_EXISTE` | — |
| Validación de caminos | `NO_EXISTE` | — |
| Detección de ciclos | `NO_EXISTE` | — |

## 7. Brecha

- [ ] `packages/domain/src/process.ts` con schema Zod.
- [ ] `compileProcesses(bundle): ProcessGraph`.
- [ ] `detectCycles(graph)`.
- [ ] `validatePaths(graph, capabilities)`.
- [ ] Tests de aceptación.

## 8. Handoff

- [ ] `ProcessGraph` → etapa 05 (compilador→runtime).
- [ ] `validatePaths` → etapa 06 (runtime valida antes de ejecutar).

## 9. Miniroadmaps internos

`03-procesos/` con fases 1–5.