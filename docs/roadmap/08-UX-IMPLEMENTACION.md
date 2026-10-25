# Etapa 08 — Implementación e iteración de la experiencia de usuario

## 1. Objetivo y alcance

Convertir el mapa de interfaces y los recorridos de la etapa 07 en producto utilizable. Implementar pantallas prioritarias, estados vacíos/error/carga, recorridos guiados, y probar con usuarios reales.

## 2. Subsistemas involucrados

- `apps/web/src/` — componentes React.
- `apps/web/src/workspaces/` — workspaces.
- `apps/web/src/hooks/` — `useChat`, `useTasks`, `useThreads`, etc.
- `apps/web/src/api/` — clientes HTTP.
- `packages/domain/src/workspace-spec.ts` — contrato de presentación.

## 3. Fases y tareas

- [ ] Fase 1 — Implementar interfaces prioritarias del mapa 07 (compilador, vista holística, agentes, planificador, centro de operaciones, supervisión).
- [ ] Fase 2 — Estados vacíos, errores, cargas, permisos, confirmaciones.
- [ ] Fase 3 — Recorridos guiados: alta de empresa, compilación, operación, intervención.
- [ ] Fase 4 — Configurar y supervisar agentes sin editar código.
- [ ] Fase 5 — Probar con usuarios reales y corregir fricción.
- [ ] Fase 6 — Unificar diseño visual, navegación, comportamiento.

## 4. Criterios de auditoría

| # | Criterio | Cómo se audita |
|---|---|---|
| A1 | Cada interfaz del mapa 07 tiene componente o ruta | `apps/web/src/` |
| A2 | Cada recorrido del mapa 07 tiene flujo implementado | Test E2E de UI o manual documentado |
| A3 | Estados vacíos/error/carga existen en las pantallas prioritarias | `Select-String` de estados |
| A4 | Un usuario puede completar alta de empresa sin editar código | Test manual documentado |

## 5. Criterios de aceptación (tests)

| # | Test | Fichero | Casos |
|---|---|---|---|
| T1 | Alta de empresa end-to-end | `tests/roadmap/etapa-08.test.ts` | formulario + validación + bootstrap |
| T2 | Supervisión de agente desde UI | idem | ver estado + logs |
| T3 | Error de compilación se muestra al usuario | idem | bundle inválido → error legible |

## 6. Evidencia actual en el repo

| Subsistema | Estado | Evidencia |
|---|---|---|
| Frontend React | `EXISTE` | `apps/web/src/` |
| 35 workspaces | `EXISTE` | `apps/web/src/workspaces/` |
| `useChat`, `useTasks`, `useThreads` | `EXISTE` | `apps/web/src/hooks/` |
| Centro de mando | `PARCIAL` | `apps/web/src/workspaces/35-centro-mando/` |
| Editor de procesos/SOPs | `NO_EXISTE` | — |
| Planificador visual | `NO_EXISTE` | — |
| Alta de empresa desde UI | `NO_EXISTE` | — |
| Compilador desde UI | `NO_EXISTE` | — |
| Supervisión de agentes desde UI | `PARCIAL` | `apps/web/src/components/` |
| Estados vacíos/error unificados | `PARCIAL` | dispersos |
| Recorridos guiados | `NO_EXISTE` | — |

## 7. Brecha

- [ ] Pantallas prioritarias del mapa 07.
- [ ] Alta de empresa desde UI.
- [ ] Compilador desde UI.
- [ ] Editor de procesos/SOPs.
- [ ] Planificador visual.
- [ ] Estados unificados.
- [ ] Recorridos guiados.

## 8. Handoff

- [ ] Pantallas + recorridos → etapa 10 (piloto) y etapa 11 (validación con usuarios).
- [ ] Componentes reutilizables → etapa 12 (industrialización).

## 9. Miniroadmaps internos

`08-ux-implementacion/` con fases 1–6.