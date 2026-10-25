# Contrato de auditoría y test por etapa

Este documento define **qué significa que una etapa esté hecha** y **cómo se demuestra contra el repo**. Es el contrato que cumplen todos los documentos de etapa.

## Los 3 ejes de una etapa

Una etapa no se reduce a una etiqueta única. Se evalúa en **3 ejes separados**, cada uno con su propia evidencia:

| Eje | Pregunta | Cómo se audita |
|---|---|---|
| **Implementación** | ¿Existe el código que cubre la capacidad? | `grep` / `Select-String` de fichero + línea. |
| **Integración** | ¿Está conectado al arranque y se invoca en un flujo real? | `Select-String` del punto de inyección (`app.ts`, `service.ts`, routes, worker) y del call site. |
| **Aceptación** | ¿El comportamiento esperado se ha demostrado con un test verde y produce un artefacto consumible por la siguiente etapa? | Ejecutar test, exit 0. Verificar que la siguiente etapa lo referencia. |

**Una etapa puede estar implementada y conectada, pero no aceptada.** Eso da más información que una sola etiqueta.

## Estados por eje

Cada eje devuelve uno de estos estados:

| Estado | Significado |
|---|---|
| `DONE` | El eje se cumple con evidencia. |
| `PARTIAL` | Parte del eje se cumple, pero falta algo. |
| `MISSING` | No hay evidencia del eje. |
| `BLOCKED` | Depende de decisión de producto o de etapa anterior sin cerrar. |

## Cómo se combinan los 3 ejes

Una etapa es `OPERATIVA` **solo si los 3 ejes están `DONE`**. Si falta uno, la etapa es `PARCIAL`. Si faltan dos o más, `NO_EXISTE`. Si alguno es `BLOCKED`, la etapa es `BLOQUEADA`.

| Implementación | Integración | Aceptación | Estado de la etapa |
|---|---|---|---|
| `DONE` | `DONE` | `DONE` | `OPERATIVA` |
| `DONE` | `DONE` | `PARTIAL` / `MISSING` | `PARCIAL` |
| `DONE` | `PARTIAL` / `MISSING` | cualquiera | `PARCIAL` |
| `PARTIAL` / `MISSING` | cualquiera | cualquiera | `NO_EXISTE` |
| `BLOCKED` (cualquiera) | — | — | `BLOQUEADA` |

## Cómo audita cada eje: 2 niveles

**Nivel 1 — Auditoría estática** (inventario). Busca implementaciones, registros, dependencias, llamadas, tests. **Señala dónde mirar.** No demuestra que funcione.

**Nivel 2 — Verificación funcional** (demostración). Ejecuta un flujo y comprueba que cada componente recibe sus entradas y entrega los resultados que el siguiente necesita. **Demuestra que funciona.**

**Regla**: el nivel 1 sin nivel 2 es ruido. El nivel 2 sin nivel 1 es caro. **Ambos son necesarios.** Una etapa no es `DONE` en el eje de aceptación solo porque el script estático diga que hay un test. **Tiene que ejecutarse y pasar.**

## Scripts de auditoría por etapa

Cada etapa tiene un script en `scripts/audits/roadmap/etapa-NN.ts`. **No se crea hasta que la etapa tenga código.** El contrato del script está en el documento de la etapa; el script se implementa cuando hay algo que auditar.

El script **devuelve los 3 ejes por separado**, no una etiqueta única:

```
{ implementation: "DONE"|"PARTIAL"|"MISSING", integration: "...", acceptance: "...", evidence: [...], missing: [...] }
```

Exit code:
- 0 si los 3 ejes son `DONE` (`OPERATIVA`).
- 1 si alguno es `PARTIAL`/`MISSING` (`PARCIAL` o `NO_EXISTE`).
- 2 si no existe código (`NO_EXISTE`).

**Nunca** un script devuelve exit 0 si hay `PARTIAL` o `MISSING`. Si lo hace, no es una barrera de CI.

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
5. Se cambian los 3 ejes en `README.md` y el estado de la etapa.

**El documento no se reescribe. Se actualiza la evidencia.** El contrato (objetivo, criterios, handoff) es estable.

## Regla anti-falso-verde

- Un `typecheck` limpio no es una etapa `OPERATIVA`.
- Un `test` verde no es una etapa `OPERATIVA` si no cubre el flujo real.
- Un fichero que existe no es una etapa `OPERATIVA` si no está conectado.
- Un componente conectado no es una etapa `OPERATIVA` si no se invoca en un flujo real.
- Un componente invocado no es una etapa `OPERATIVA` si no produce un artefacto válido para la siguiente etapa.

**Sin los 3 ejes en `DONE`, no es `OPERATIVA`.**