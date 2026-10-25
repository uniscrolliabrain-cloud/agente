# Etapa 10 — Digitalización y puesta en marcha de la empresa piloto

## 1. Objetivo y alcance

Reunir las piezas de las etapas 02–09 en una empresa concreta. Seleccionar un piloto, recopilar sus datos, preparar la definición, construir ontología/procesos, configurar agentes y herramientas, conectar integraciones, compilar, inicializar y ejecutar al menos un conjunto acordado de procesos de principio a fin.

## 2. Subsistemas involucrados

- Todo el repo. Es la primera prueba de producto integrado.
- `clientes/<piloto>/` — definición del piloto.
- `scripts/provision-client.ts` — bootstrap.
- `apps/server/src/app.ts` — composición.
- `apps/server/src/engine/worker.ts` — ejecución.
- `apps/server/src/engine/orchestrator/orchestrator.ts` — runGoal.

## 3. Fases y tareas

- [ ] Fase 1 — Seleccionar empresa piloto y acordar alcance (qué procesos entran, qué no).
- [ ] Fase 2 — Recopilar datos, documentos, servicios, reglas, procesos.
- [ ] Fase 3 — Preparar definición en el workspace (`clientes/<piloto>/`).
- [ ] Fase 4 — Construir ontología, procesos y caminos de ejecución.
- [ ] Fase 5 — Configurar agentes, trabajadores, herramientas, permisos.
- [ ] Fase 6 — Conectar integraciones necesarias (CRM, Holded, Stripe, etc.).
- [ ] Fase 7 — Compilar, inicializar, ejecutar.
- [ ] Fase 8 — Comparar resultados del OS con procesos reales del negocio.

## 4. Criterios de auditoría

| # | Criterio | Cómo se audita |
|---|---|---|
| A1 | Existe `clientes/<piloto>/` con definición completa | `Test-Path` de config, agentes, ontology, sops |
| A2 | El bundle del piloto valida (`validateBundle`) | Script de auditoría |
| A3 | El piloto se bootstrappea sin error | `bootstrapTenant` exitoso |
| A4 | Al menos un proceso se ejecuta de extremo a extremo | Test E2E |
| A5 | El resultado se verifica | `outcome.verified === true` |

## 5. Criterios de aceptación (tests)

| # | Test | Fichero | Casos |
|---|---|---|---|
| T1 | El bundle del piloto valida | `tests/roadmap/etapa-10.test.ts` | `validateBundle(clientes/piloto)` ok |
| T2 | El piloto se bootstrappea | idem | `bootstrapTenant` sin error |
| T3 | Un proceso del piloto termina `achieved` | idem | proceso real + verifier |
| T4 | El resultado es reproducible | idem | ejecutar dos veces, mismo outcome |

## 6. Evidencia actual en el repo

| Subsistema | Estado | Evidencia |
|---|---|---|
| `clientes/_example/` | `EXISTE` | Definición de ejemplo |
| `clientes/default/` | `EXISTE` | Ontología + personas |
| `scripts/provision-client.ts` | `PARCIAL` | Existe, pero ¿valida y bootstrappea? |
| `scripts/seed-agency.ts` | `PARCIAL` | Seed de agencia de ejemplo |
| `scripts/seed-demo.ts` | `PARCIAL` | Seed de demo |
| `scripts/beta-vertical.ts` | `PARCIAL` | Prueba vertical existente |
| Piloto real digitalizado | `NO_EXISTE` | — |
| Proceso real ejecutado end-to-end | `NO_EXISTE` | — |
| Resultado comparado con negocio real | `NO_EXISTE` | — |

## 7. Brecha

- [ ] Seleccionar piloto.
- [ ] Recopilar datos reales.
- [ ] Construir ontología, procesos, agentes del piloto.
- [ ] Conectar integraciones del piloto.
- [ ] Ejecutar un proceso real end-to-end.
- [ ] Comparar con negocio real.

## 8. Handoff

- [ ] Piloto operativo → etapa 11 (validación).
- [ ] Lecciones del piloto → etapa 12 (industrialización).

## 9. Miniroadmaps internos

`10-piloto/` con fases 1–8.