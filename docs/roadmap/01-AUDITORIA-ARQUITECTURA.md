# Etapa 01 — Auditoría holística + arquitectura objetivo

## 1. Objetivo y alcance

Auditar el repositorio completo y definir la arquitectura objetivo del compilador de empresas. Sin esta etapa, las siguientes construyen a ciegas.

## 2. Subsistemas involucrados

Todo el repo. Lectura, no modificación.

## 3. Fases y tareas

- [ ] Fase 1 — Mapa de flujo funcional: definición de negocio → ontología → datos → capacidades → procesos → pipelines → SOPs → workforce → planificación → bootstrap → runtime → verificación → persistencia. Cada flecha con fichero + línea o "no existe".
- [ ] Fase 2 — Matriz de los 12 bloques del compilador: existe / conectado / invocado / test / artefacto / brecha.
- [ ] Fase 3 — Arquitectura objetivo: qué contratos, qué interfaces, qué artefactos produce cada bloque.
- [ ] Fase 4 — Las 3 conclusiones: (1) qué empresa puede construir hoy el software, (2) qué recorrido falta, (3) cuál es el siguiente cambio de código que más acerca el producto.

## 4. Criterios de auditoría

| # | Criterio | Cómo se audita |
|---|---|---|
| A1 | Existe `01-AUDITORIA-ARQUITECTURA.md` con las 4 fases completas | Fichero + secciones |
| A2 | Cada flecha del flujo tiene evidencia (fichero:línea) o "no existe" | `Select-String` de cada fichero citado |
| A3 | La matriz de 12 bloques está rellena | Tabla completa |
| A4 | Las 3 conclusiones están escritas con evidencia | Secciones 4.1–4.3 |

## 5. Criterios de aceptación (tests)

| # | Test | Fichero | Casos |
|---|---|---|---|
| T1 | Cada fichero citado en el flujo existe | `scripts/audits/roadmap/etapa-01.ts` | Verifica `Test-Path` de cada fichero citado |
| T2 | La matriz tiene 12 filas | idem | Verifica 12 filas |

**El script se implementa cuando el documento esté completo.**

## 6. Evidencia actual en el repo

| Subsistema | Estado | Evidencia |
|---|---|---|
| Documento de auditoría | `NO_EXISTE` | Este fichero es el contrato |
| Mapa de flujo | `NO_EXISTE` | — |
| Matriz de bloques | `PARCIAL` | `00-BASELINE.md` tabla estimada |
| Arquitectura objetivo | `NO_EXISTE` | — |
| Las 3 conclusiones | `PARCIAL` | `README.md` sección "3 conclusiones" (estimación) |

## 7. Brecha

- [ ] Escribir el mapa de flujo con evidencia real (no estimación).
- [ ] Auditar los ~25 ficheros del compilador (`build-applier.ts`, `form-builder.ts`, `sop-executor.ts`, `assignments/*`, `workspaces/*`, `ontology.ts`, etc.) para convertir la matriz de `00-BASELINE.md` en evidencia verificable.
- [ ] Escribir la arquitectura objetivo con contratos e interfaces.
- [ ] Escribir las 3 conclusiones con evidencia, no con estimación.

## 8. Handoff

- [ ] `01-AUDITORIA-ARQUITECTURA.md` completo → desbloquea etapas 02–06.
- [ ] Arquitectura objetivo → contrato de las etapas 02–05.
- [ ] Las 3 conclusiones → decisión de qué construir primero.

## 9. Miniroadmaps internos

Cuando se descomponga, crear `01-auditoria-arquitectura/` con fases 1–4.