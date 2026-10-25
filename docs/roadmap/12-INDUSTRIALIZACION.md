# Etapa 12 — Industrializar el proceso de compilación y despliegue

## 1. Objetivo y alcance

Convertir los pasos manuales del piloto en procedimientos repetibles. Crear plantillas, catálogos, paquetes de capacidades. Automatizar validaciones, bootstrap, comprobaciones de integridad. Versionar empresas compiladas y gestionar cambios sin perder estado.

## 2. Subsistemas involucrados

- `scripts/provision-client.ts` — bootstrap repetible.
- `scripts/seed-*.ts` — seeds parametrizables.
- `clientes/_base/` — plantilla base.
- `packages/domain/src/` — contratos versionados.
- `apps/server/src/engine/` — compilador (etapa 05).
- `docs/roadmap/` — procedimientos.

## 3. Fases y tareas

- [ ] Fase 1 — Convertir los pasos manuales del piloto en procedimientos repetibles.
- [ ] Fase 2 — Crear plantillas: `clientes/_base/` con config, agentes, ontology, sops por defecto.
- [ ] Fase 3 — Catálogo de capabilities reutilizables.
- [ ] Fase 4 — Automatizar validaciones (`validateBundle`, `validateProcesses`, `validateAgents`).
- [ ] Fase 5 — Automatizar bootstrap (`bootstrapTenant`).
- [ ] Fase 6 — Versionado de empresas compiladas.
- [ ] Fase 7 — Mecanismos de actualización y reversión.
- [ ] Fase 8 — Medir horas necesarias para digitalizar una nueva empresa.
- [ ] Fase 9 — Separar lo común del OS de lo específico de cada cliente.

## 4. Criterios de auditoría

| # | Criterio | Cómo se audita |
|---|---|---|
| A1 | Existe `clientes/_base/` con plantilla completa | `Test-Path` |
| A2 | Existe `bootstrapTenant(bundle)` reproducible | Script |
| A3 | Existe versionado de bundles | Schema con `version` |
| A4 | Una segunda empresa se compila con menos trabajo que la primera | Documento de medición |
| A5 | Existe mecanismo de actualización/reversión | Script |

## 5. Criterios de aceptación (tests)

| # | Test | Fichero | Casos |
|---|---|---|---|
| T1 | Una empresa nueva desde `_base` se compila | `tests/roadmap/etapa-12.test.ts` | copia `_base` + personaliza + compila |
| T2 | Un bundle con versión antigua se actualiza | idem | migración |
| T3 | Un bundle roto se revierte | idem | rollback |

## 6. Evidencia actual en el repo

| Subsistema | Estado | Evidencia |
|---|---|---|
| `clientes/_base/` | `PARCIAL` | Existe, ¿completo? |
| `scripts/provision-client.ts` | `PARCIAL` | Existe, ¿reproducible? |
| Versionado de bundles | `NO_EXISTE` | — |
| Plantillas reutilizables | `NO_EXISTE` | — |
| Actualización/reversión | `NO_EXISTE` | — |
| Medición de horas | `NO_EXISTE` | — |
| Separación común/específico | `PARCIAL` | `clientes/_base` vs `clientes/default` |

## 7. Brecha

- [ ] Plantilla completa `clientes/_base/`.
- [ ] `bootstrapTenant` reproducible y testeado.
- [ ] Versionado de bundles.
- [ ] Migración y rollback.
- [ ] Medición de horas.
- [ ] Separación clara común vs cliente.

## 8. Handoff

- [ ] Plantillas + procedimiento → etapa 14 (empresas 2–5).
- [ ] Versionado → etapa 15 (10 empresas).

## 9. Miniroadmaps internos

`12-industrializacion/` con fases 1–9.