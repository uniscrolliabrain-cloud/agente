# Contrato de auditoría y test por etapa

Este documento define **qué significa que una etapa esté hecha** y **cómo se demuestra contra el repo**. Es el contrato que cumplen todos los documentos de etapa.

## Los 5 criterios de una etapa `OPERATIVA`

Una etapa solo se marca `OPERATIVA` si cumple **los 5**:

| # | Criterio | Evidencia | Cómo se audita |
|---|---|---|---|
| 1 | **Existe** | Fichero + línea que implementa la capacidad. | `grep` / `Select-String` del fichero. |
| 2 | **Conectado** | Inyectado en `app.ts` / `service.ts` / routes / worker. | `Select-String` del punto de inyección. |
| 3 | **Invocado** | Ruta HTTP, worker tick, test E2E, CLI. | `Select-String` del call site. |
| 4 | **Test verde** | `node --test` con nombre de fichero y caso. | Ejecutar el test, exit 0. |
| 5 | **Artefacto consumible** | Schema, contrato, test, o datos que la siguiente etapa usa. | Verificar que la siguiente etapa lo referencia. |

Si falta 1, es `PARCIAL`. Si faltan 3 o más, es `NO_EXISTE`. Si depende de decisión de producto, es `BLOQUEADA`.

## Qué significa `OPERATIVA` vs `PARCIAL` vs `NO_EXISTE`

| Estado | Definición | Cómo se detecta |
|---|---|---|
| `OPERATIVA` | Los 5 criterios se cumplen con evidencia. | Script de auditoría exit 0. Test de aceptación verde. |
| `PARCIAL` | 1–2 criterios faltan. | Script exit 1, con lista de criterios faltantes. |
| `NO_EXISTE` | 3+ criterios faltan. No hay código que cubra la etapa. | Script exit 2. |
| `BLOQUEADA` | Depende de decisión de producto o de etapa anterior sin cerrar. | Nota en el documento de etapa. |

## Scripts de auditoría por etapa

Cada etapa tiene un script en `scripts/audits/roadmap/etapa-NN.ts`. **No se crea hasta que la etapa tenga código.** El contrato del script está en el documento de la etapa; el script se implementa cuando hay algo que auditar.

El script:
1. Lee los ficheros de la etapa (los que el documento declara).
2. Comprueba los 5 criterios.
3. Devuelve un informe con `PASS` / `FAIL` / `PARTIAL` / `NOT_FOUND` por criterio.
4. Exit 0 si todos PASS, 1 si alguno FAIL/PARTIAL, 2 si NOT_FOUND (no existe).

**Nunca** un script de auditoría devuelve exit 0 si hay `FAIL`. Si lo hace, no es una barrera de CI.

## Tests de aceptación por etapa

Cada etapa tiene tests en `tests/roadmap/etapa-NN.test.ts`. **No se crean `test.skip` vacíos.** El test se escribe cuando el código existe, con casos reales:

- Preparar datos aislados.
- Ejecutar la acción por la vía real.
- Observar el resultado (HTTP, worker, estado persistido).
- Verificar efectos secundarios.
- Verificar que no hubo efectos prohibidos.
- Limpiar.

**Regla**: un test que no se ejecuta no es un test aprobado. `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`. Sin excepciones.

## Integración con CI

Cuando una etapa esté `OPERATIVA`, su script de auditoría y sus tests deben estar en `.github/workflows/ci.yml` como **bloqueantes**. Si fallan, la CI falla. Sin `continue-on-error`.

## Cómo se actualiza la evidencia

Cuando una etapa se construye:
1. Se actualiza la sección "Evidencia actual" del documento con fichero + línea + marca `_V1`.
2. Se crea el script de auditoría (`scripts/audits/roadmap/etapa-NN.ts`).
3. Se crea el test de aceptación (`tests/roadmap/etapa-NN.test.ts`).
4. Se añade a CI como bloqueante.
5. Se cambia el estado en `README.md` de `PARCIAL`/`NO_EXISTE` a `OPERATIVA`.

**El documento no se reescribe. Se actualiza la evidencia.** El contrato (objetivo, criterios, handoff) es estable.

## Regla anti-falso-verde

- Un `typecheck` limpio no es una etapa `OPERATIVA`.
- Un `test` verde no es una etapa `OPERATIVA` si no cubre el flujo real.
- Un fichero que existe no es una etapa `OPERATIVA` si no está conectado.
- Un componente conectado no es una etapa `OPERATIVA` si no se invoca en un flujo real.

**Sin los 5 criterios, no es `OPERATIVA`.**