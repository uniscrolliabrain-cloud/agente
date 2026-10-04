# Roadmap — 01 tests

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Sin tests, ningún otro estado es confiable. El HANDOFF archivado lo
menciona: "un test que falla es un hecho; un sistema sin tests es una
hipótesis".

## 2. Estado verificado
- 218 casos. 11 con timeout. 3 before hooks colgados. 4 after hooks con
  TypeError. 1 test skipped (Windows .cmd). 429 de Gemini.
- Fuente: docs/audits/_prep/test-full.txt.

## 3. Huecos contra producción
- before/after hooks no protegidos.
- Tests de integración sin aislar servicios externos.
- Sin cobertura medida.
- Sin tests del kernel cognitivo.
- Sin test de crash-recovery.
- Sin test de 50 tenants concurrentes.

## 4. Objetivo
Suite verde en CI, cero flakes, cobertura >50% en caminos críticos, y un
test que mate el proceso a mitad de tarea y verifique la recuperación.

## 5. Fronteras
- No tests de UI (pertenecen a 15).
- No tests de browser reales en CI (pertenecen a 21).
- No chaos engineering (pertenece a 03).

## 6. Conexiones
- Depende de: ninguna. Es la base.
- Dependen de esta: las 24 restantes.
- Archivos compartidos: tests/*.test.ts, tests/helpers/*, package.json.

## 7. Principios del PRODUCT.md
Los 5. Sin tests, ninguno se puede verificar.

## 8. Cómo se verifica el cierre
- pnpm test verde, con exit 0.
- Cobertura >50% en los 6 módulos críticos.
- Un test que mata el proceso a mitad y verifica la recuperación.
- CI con pnpm test bloqueante.
