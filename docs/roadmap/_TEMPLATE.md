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

## 4. Contratos existentes que se reutilizan, amplían o sustituyen

**Antes de proponer un contrato nuevo**, identificar qué contrato existente cubre total o parcialmente la necesidad.

| Necesidad | Contrato existente | Decisión | Motivo |
|---|---|---|---|
| ... | `packages/domain/src/...` | REUTILIZAR / AMPLIAR / SUSTITUIR / NUEVO | ... |

**Regla**: no se introduce un contrato nuevo si uno existente puede cumplir. No se mantienen dos representaciones de la misma empresa. Si hay que sustituir, se documenta la migración.

## 5. Criterios de auditoría

Cómo se comprueba que esta etapa está hecha. Concretos y verificables. **Cada criterio evalúa uno de los 3 ejes** (implementación, integración, aceptación). Ver `_AUDIT-CRITERIA.md`.

| # | Criterio | Eje | Cómo se audita |
|---|---|---|---|
| A1 | ... | implementación | `scripts/audits/roadmap/etapa-NN.ts` |
| A2 | ... | integración | ... |
| A3 | ... | aceptación | ... |

El script `etapa-NN.ts` devuelve los 3 ejes por separado (`implementation`, `integration`, `acceptance`) y exit 0/1/2.

## 6. Criterios de aceptación (tests)

Qué tests deben pasar para declarar el eje de aceptación `DONE`. Nombres de fichero, casos, asserts.

| # | Test | Fichero | Casos | Aserción |
|---|---|---|---|---|
| T1 | ... | `tests/roadmap/etapa-NN.test.ts` | ... | ... |
| T2 | ... | `tests/roadmap/etapa-NN-e2e.test.ts` | ... | ... |

**Regla**: los tests se implementan cuando el código de la etapa existe. No se crean `test.skip` vacíos. El contrato queda aquí; el test se escribe cuando hay algo que testear.

## 7. Evidencia actual en el repo

Qué hay hoy. Para cada subsistema: `DONE` / `PARTIAL` / `MISSING` / `BLOCKED`, con fichero + línea + marca.

| Subsistema | Implementación | Integración | Aceptación | Evidencia | Marca |
|---|---|---|---|---|---|
| ... | `DONE`/`PARTIAL`/`MISSING` | `DONE`/`PARTIAL`/`MISSING` | `DONE`/`PARTIAL`/`MISSING` | `fichero:línea` | `_V1` |

## 8. Brecha

Qué falta para que los 3 ejes pasen a `DONE`. Concreto.

- [ ] Falta X en `fichero:línea` (implementación).
- [ ] Falta Y (integración).
- [ ] Falta Z (aceptación).

## 9. Handoff

Qué artefactos entrega esta etapa a la siguiente. **Cada artefacto con su contrato explícito**: qué consume la siguiente etapa, con qué forma, con qué validación.

- [ ] `Artefacto` (contrato: `packages/domain/src/...`) → consumido por etapa NN+1 en `...`.
- [ ] Test `...` → reutilizable por etapa NN+1.

## 10. Miniroadmaps internos

Si la etapa se descompone en fases más pequeñas, se enlazan aquí.

- [`NN-titulo/fase-01.md`](NN-titulo/fase-01.md) — ...
- [`NN-titulo/fase-02.md`](NN-titulo/fase-02.md) — ...