# Etapa 02 — Workspace compilador de empresas

## 1. Objetivo y alcance

Construir el entorno en el que se define una empresa y se generan sus artefactos (ontología, entidades, relaciones, capacidades, procesos, SOPs, workforce, configuración). Al principio es manual/asistido por ti; después se automatiza.

## 2. Subsistemas involucrados

- `clientes/<tenant>/` — definición de la empresa (config, agentes, memorias, ontology, sops).
- `packages/domain/src/ontology.ts`, `ontology-seed.ts`, `business.ts`, `business-schema.ts` — contratos.
- `apps/server/src/engine/build-applier.ts`, `form-builder.ts`, `finance.ts` — compiladores parciales de artefactos.
- `scripts/seed-business-schema.ts`, `seed-agency.ts`, `provision-client.ts` — bootstrap de tenants.

## 3. Fases y tareas

- [ ] Fase 1 — Definir el contrato de entrada: qué ficheros/JSON/API recibe el workspace (`config.json`, `agentes.json`, `memorias.json`, `ontology.json`, `sops/*.json`).
- [ ] Fase 2 — Validación de entrada: schemas Zod por fichero, referencias cruzadas, dependencias.
- [ ] Fase 3 — Generación de artefactos: ontología validada, entidades, relaciones, catálogo de capacidades, catálogo de procesos.
- [ ] Fase 4 — Versionado y aprobación manual.
- [ ] Fase 5 — Empaquetado: qué se entrega al runtime (`tenant-bundle`).

## 4. Criterios de auditoría

| # | Criterio | Cómo se audita |
|---|---|---|
| A1 | Existe un contrato de entrada documentado | `02-WORKSPACE-COMPILADOR.md` §3.1 |
| A2 | Cada fichero de entrada tiene schema Zod | `packages/domain/src/*.ts` |
| A3 | La validación de referencias cruzadas existe | Función `validateBundle` |
| A4 | Se produce un `tenant-bundle` consumible | Fichero o schema |

## 5. Criterios de aceptación (tests)

| # | Test | Fichero | Casos |
|---|---|---|---|
| T1 | Un bundle válido pasa la validación | `tests/roadmap/etapa-02.test.ts` | config válido + ontology válida |
| T2 | Un bundle con referencia rota falla | idem | ontología referencia entidad inexistente |
| T3 | Un bundle incompleto falla | idem | falta `config.json` |

## 6. Evidencia actual en el repo

| Subsistema | Estado | Evidencia |
|---|---|---|
| `clientes/<tenant>/config.json` | `EXISTE` | `clientes/_example/config.json` |
| `clientes/<tenant>/agentes.json` | `EXISTE` | `clientes/_example/agentes.json` |
| `clientes/<tenant>/ontology.json` | `EXISTE` | `clientes/default/ontology.json` |
| `clientes/<tenant>/sops/` | `EXISTE` | `clientes/_example/sops/` |
| Schema Zod de ontology | `PARCIAL` | `packages/domain/src/ontology.ts` |
| Schema Zod de business | `PARCIAL` | `packages/domain/src/business.ts`, `business-schema.ts` |
| Validación de bundle | `NO_EXISTE` | — |
| `tenant-bundle` empaquetado | `NO_EXISTE` | — |
| `scripts/provision-client.ts` | `PARCIAL` | Existe, pero ¿valida todo el bundle? |

## 7. Brecha

- [ ] Contrato de entrada documentado y validado.
- [ ] Función `validateBundle(clientDir): { ok, errors }`.
- [ ] Función `compileBundle(clientDir): TenantBundle` que produce el artefacto.
- [ ] Test de aceptación con bundle válido, roto e incompleto.

## 8. Handoff

- [ ] `TenantBundle` (schema + ejemplo) → etapa 03 (procesos) y etapa 05 (compilador→runtime).
- [ ] `validateBundle` → usada por etapa 05 (validación previa a bootstrap).

## 9. Miniroadmaps internos

`02-workspace-compilador/` con fases 1–5.