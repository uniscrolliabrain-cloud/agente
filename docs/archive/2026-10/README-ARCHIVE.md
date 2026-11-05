# Archive de Documentación OpenMuse

> v1 · 2026-10-27 · Estado: current

## Propósito

Este directorio conserva documentación histórica que ya cumplió su función. Se mantiene por trazabilidad, no como referencia activa. Ningún archivo se ha borrado: todos se movieron aquí con `git mv` desde `docs/` raíz o sus subcarpetas.

## Reglas del archive

1. **No se edita nada aquí**: los docs archivados son inmutables.
2. **Cada entrada tiene metadata**: archivo original, ruta archive, fecha, motivo, reemplazo.
3. **Si necesitas consultar algo del archive**: cópialo a `docs/` como un doc nuevo v2, no edites el archivado.

## Índice de archivos archivados

| # | Archivo original | Ruta archive | Fecha | Motivo | Reemplazo | Comando git mv |
|---|-----------------|--------------|-------|--------|-----------|----------------|
| 1 | `docs/ROADMAP.md` | `docs/archive/2026-10/ROADMAP.md` | 2026-10-27 | Obsoleto, sin cabecera válida, describe fases antiguas | `docs/02-producto/ROADMAP.md` (v2) | `git mv docs/ROADMAP.md docs/archive/2026-10/ROADMAP.md` |
| 2 | `docs/KNOWN_ISSUES.md` | `docs/archive/2026-10/KNOWN_ISSUES.md` | 2026-10-27 | Obsoleto, issues resueltos o movidos a auditorías | `docs/08-auditorias/gate-estado.md` | `git mv docs/KNOWN_ISSUES.md docs/archive/2026-10/KNOWN_ISSUES.md` |
| 3 | `docs/DEPLOY.md` | `docs/archive/2026-10/DEPLOY.md` | 2026-10-27 | Obsoleto, no refleja deploy actual | `docs/04-operaciones/DEPLOY.md` (v2) | `git mv docs/DEPLOY.md docs/archive/2026-10/DEPLOY.md` |
| 4 | `docs/DEPLOY-CLIENTE.md` | `docs/archive/2026-10/DEPLOY-CLIENTE.md` | 2026-10-27 | Obsoleto | `docs/04-operaciones/DEPLOY-CLIENTE.md` (v2) | `git mv docs/DEPLOY-CLIENTE.md docs/archive/2026-10/DEPLOY-CLIENTE.md` |
| 5 | `docs/PRODUCCION.md` | `docs/archive/2026-10/PRODUCCION.md` | 2026-10-27 | Cita "50 EUR/día" como real, el consumo es en caracteres | `docs/04-operaciones/PRODUCCION.md` (v2) | `git mv docs/PRODUCCION.md docs/archive/2026-10/PRODUCCION.md` |
| 6 | `docs/ONBOARDING-CLIENTE.md` | `docs/archive/2026-10/ONBOARDING-CLIENTE.md` | 2026-10-27 | Obsoleto | `docs/04-operaciones/ONBOARDING-CLIENTE.md` (v2) | `git mv docs/ONBOARDING-CLIENTE.md docs/archive/2026-10/ONBOARDING-CLIENTE.md` |
| 7 | `docs/CLIENTE.md` | `docs/archive/2026-10/CLIENTE.md` | 2026-10-27 | Obsoleto | `docs/04-operaciones/CLIENTE.md` (v2) | `git mv docs/CLIENTE.md docs/archive/2026-10/CLIENTE.md` |
| 8 | `docs/SECURITY.md` | `docs/archive/2026-10/SECURITY.md` | 2026-10-27 | Obsoleto | `docs/03-arquitectura/SECURITY.md` (v2) | `git mv docs/SECURITY.md docs/archive/2026-10/SECURITY.md` |
| 9 | `docs/WORK_LOG_2026_10_03.md` | `docs/archive/2026-10/WORK_LOG_2026_10_03.md` | 2026-10-27 | Log histórico de 2026-10-03 | Ninguno (histórico) | `git mv docs/WORK_LOG_2026_10_03.md docs/archive/2026-10/WORK_LOG_2026_10_03.md` |
| 10 | `docs/future_plans.md` | `docs/archive/2026-10/future_plans.md` | 2026-10-27 | Conceptos antiguos, consolidados en roadmap | `docs/02-producto/ROADMAP.md` (v2) | `git mv docs/future_plans.md docs/archive/2026-10/future_plans.md` |

## Cómo usar este archive

- Para consultar un doc histórico: léelo aquí, no lo modifies.
- Para resucitar contenido útil: crea un doc nuevo v2 en `docs/` con la misma información actualizada.
- Para saber por qué se archivó algo: lee la columna "Motivo" de esta tabla.
