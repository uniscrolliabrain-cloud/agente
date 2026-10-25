# Etapa 14 — Desplegar y estabilizar las empresas 2–5

## 1. Objetivo y alcance

Captar clientes que encajen con el producto validado. Digitalizar cada negocio con el workspace y el procedimiento de la etapa 12. Identificar qué se reutiliza y qué se adapta. Medir tiempo de incorporación, incidencias, uso, rentabilidad.

## 2. Subsistemas involucrados

- `clientes/<empresa-2-5>/` — definiciones.
- `scripts/provision-client.ts` — bootstrap.
- `apps/server/src/app.ts` — composición.
- `docs/operacion/` — documentación.

## 3. Fases y tareas

- [ ] Fase 1 — Captar clientes 2–5 que encajen con el producto validado.
- [ ] Fase 2 — Digitalizar cada negocio con el workspace + procedimiento.
- [ ] Fase 3 — Identificar componentes reutilizables y adaptaciones.
- [ ] Fase 4 — Medir tiempo de incorporación, incidencias, uso, rentabilidad.
- [ ] Fase 5 — Mejorar plantillas, conectores, UX, soporte.
- [ ] Fase 6 — Evitar ramas especiales por cliente.

## 4. Criterios de auditoría

| # | Criterio | Cómo se audita |
|---|---|---|
| A1 | Cada empresa 2–5 tiene bundle válido | `validateBundle` |
| A2 | Cada empresa 2–5 está operativa | Test E2E |
| A3 | Tiempo de incorporación medido | Documento |
| A4 | Rentabilidad medida | Documento |
| A5 | No hay ramas especiales por cliente | `git branch` + revisión |

## 5. Criterios de aceptación (tests)

| # | Test | Fichero | Casos |
|---|---|---|---|
| T1 | Cada empresa 2–5 bootstrappea | `tests/roadmap/etapa-14.test.ts` | bundle válido |
| T2 | Cada empresa ejecuta un proceso | idem | proceso real |
| T3 | Aislamiento entre las 5 | idem | tenant A no ve B |
| T4 | Tiempo de incorporación < X horas | Documento | — |

## 6. Evidencia actual en el repo

| Subsistema | Estado | Evidencia |
|---|---|---|
| Multi-tenant | `EXISTE` | `engine/tenant.ts` |
| Bootstrap de tenant | `PARCIAL` | `provision-client.ts` |
| Empresas 2–5 digitalizadas | `NO_EXISTE` | — |
| Medición de tiempo | `NO_EXISTE` | — |
| Medición de rentabilidad | `NO_EXISTE` | — |
| Sin ramas especiales por cliente | `PARCIAL` | `main` única |

## 7. Brecha

- [ ] Captar 4 clientes.
- [ ] Digitalizar cada uno.
- [ ] Medir tiempo y rentabilidad.
- [ ] Mejorar plantillas tras cada cliente.
- [ ] Evitar ramas especiales.

## 8. Handoff

- [ ] 4 empresas operativas → etapa 15.
- [ ] Lecciones → etapa 15.

## 9. Miniroadmaps internos

`14-empresas-2-5/` con fases 1–6.