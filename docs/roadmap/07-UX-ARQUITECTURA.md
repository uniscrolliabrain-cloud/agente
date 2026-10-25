# Etapa 07 — Arquitectura UX/UI del OS

## 1. Objetivo y alcance

Definir la arquitectura de información y los recorridos de usuario del OS. No implementar pantallas: definir qué interfaces hacen falta, cómo se navega, qué muestra cada una. La etapa 08 implementa.

## 2. Subsistemas involucrados

- `apps/web/src/` — frontend React.
- `apps/web/src/workspaces/` — 35 workspaces existentes.
- `apps/web/src/components/` — componentes.
- `packages/domain/src/workspace-spec.ts` — contrato de presentación.

## 3. Fases y tareas

- [ ] Fase 1 — Mapa de interfaces: qué pantallas necesita el OS (compilador, vista holística, editor de procesos/SOPs, agentes, planificador, centro de operaciones, supervisión, datos/conectores, admin tenants).
- [ ] Fase 2 — Recorridos de usuario: alta de empresa, compilación, operación, supervisión, intervención.
- [ ] Fase 3 — Jerarquía de navegación: qué se ve en cada nivel.
- [ ] Fase 4 — Estados vacíos, errores, cargas, permisos.
- [ ] Fase 5 — Unificación visual: diseño, navegación, comportamiento.

## 4. Criterios de auditoría

| # | Criterio | Cómo se audita |
|---|---|---|
| A1 | Existe mapa de interfaces con jerarquía | `07-UX-ARQUITECTURA.md` §3.1 |
| A2 | Existen recorridos de usuario documentados | idem §3.2 |
| A3 | Cada interfaz mapea a un componente o workspace real | `apps/web/src/` |
| A4 | Los estados vacíos/error/carga están definidos | idem §3.4 |

## 5. Criterios de aceptación (tests)

| # | Test | Fichero | Casos |
|---|---|---|---|
| T1 | Cada interfaz del mapa tiene ruta o componente | `tests/roadmap/etapa-07.test.ts` | verifica `apps/web/src/` |
| T2 | Cada recorrido tiene pasos verificables | idem | alta de empresa end-to-end |

## 6. Evidencia actual en el repo

| Subsistema | Estado | Evidencia |
|---|---|---|
| Frontend React | `EXISTE` | `apps/web/src/` |
| 35 workspaces | `EXISTE` | `apps/web/src/workspaces/` |
| `WorkspaceSpec` | `PARCIAL` | `packages/domain/src/workspace-spec.ts` |
| Mapa de interfaces del OS | `NO_EXISTE` | — |
| Recorridos de usuario del OS | `NO_EXISTE` | — |
| Editor de procesos/SOPs | `NO_EXISTE` | — |
| Planificador visual | `NO_EXISTE` | — |
| Centro de operaciones | `PARCIAL` | `apps/web/src/components/CentroMandoWorkspace.tsx` |
| Panel de supervisión/errores | `PARCIAL` | `apps/web/src/components/` |
| Admin tenants | `PARCIAL` | `apps/web/src/components/AdminTenants` (si existe) |

## 7. Brecha

- [ ] Mapa de interfaces del OS (compilador, procesos, agentes, planificador, centro de operaciones, supervisión, admin).
- [ ] Recorridos de usuario documentados.
- [ ] Editor de procesos/SOPs (no existe).
- [ ] Planificador visual (no existe).

## 8. Handoff

- [ ] Mapa de interfaces + recorridos → etapa 08 (implementación).
- [ ] Contratos de presentación → etapa 11 (validación con usuarios).

## 9. Miniroadmaps internos

`07-ux-arquitectura/` con fases 1–5.