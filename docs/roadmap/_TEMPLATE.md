# Etapa NN — Título

> Copia este fichero para cada etapa. No modifiques la estructura. Rellena las secciones.

## 1. Objetivo y alcance

Qué capacidad empresarial se construye. Qué entra y qué no entra en esta etapa.

## 2. Subsistemas involucrados

Qué partes del repo se modifican o conectan. Fichero, módulo, ruta.

- `apps/server/src/...`
- `packages/domain/src/...`
- `apps/web/src/...`
- `scripts/...`
- `clientes/...`

## 3. Fases y tareas

Qué se hace, en qué orden, de qué depende.

- [ ] Fase 1 — ...
- [ ] Fase 2 — ...
- [ ] Fase 3 — ...

Si una fase es grande, se descompone en un miniroadmap dentro de la carpeta de la etapa (ej. `docs/roadmap/NN-titulo/`).

## 4. Criterios de auditoría

Cómo se comprueba que esta etapa está hecha. Concretos y verificables. Cada criterio debe poder ejecutarse con un comando o un script de auditoría.

| # | Criterio | Cómo se audita | Comando / script |
|---|---|---|---|
| A1 | ... | ... | `scripts/audits/roadmap/etapa-NN.ts` |
| A2 | ... | ... | ... |

El script `etapa-NN.ts` devuelve:
- exit 0 si todos los criterios se cumplen (`OPERATIVA`).
- exit 1 si faltan criterios (`PARCIAL`).
- exit 2 si no existe código (`NO_EXISTE`).

## 5. Criterios de aceptación (tests)

Qué tests deben pasar para declarar la etapa cerrada. Nombres de fichero, casos, asserts.

| # | Test | Fichero | Casos | Aserción |
|---|---|---|---|---|
| T1 | ... | `tests/roadmap/etapa-NN.test.ts` | ... | ... |
| T2 | ... | `tests/roadmap/etapa-NN-e2e.test.ts` | ... | ... |

**Regla**: los tests se implementan cuando el código de la etapa existe. No se crean `test.skip` vacíos. El contrato queda aquí; el test se escribe cuando hay algo que testear.

## 6. Evidencia actual en el repo

Qué hay hoy. Para cada subsistema: `EXISTE` / `PARCIAL` / `NO_EXISTE`, con fichero + línea + marca.

| Subsistema | Estado | Evidencia | Marca |
|---|---|---|---|
| ... | `EXISTE` / `PARCIAL` / `NO_EXISTE` | `fichero:línea` | `_V1` |

## 7. Brecha

Qué falta para que la etapa pase de `NO_EXISTE`/`PARCIAL` a `OPERATIVA`. Concreto.

- [ ] Falta X en `fichero:línea`.
- [ ] Falta Y.
- [ ] Falta Z.

## 8. Handoff

Qué artefactos entrega esta etapa a la siguiente. Contratos, schemas, ficheros, tests.

- [ ] ...
- [ ] ...

## 9. Miniroadmaps internos

Si la etapa se descompone en fases más pequeñas, se enlazan aquí.

- [`NN-titulo/fase-01.md`](NN-titulo/fase-01.md) — ...
- [`NN-titulo/fase-02.md`](NN-titulo/fase-02.md) — ...