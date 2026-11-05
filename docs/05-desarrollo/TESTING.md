# Testing

> v1 · 2026-10-27 · Estado: current

## Estrategia de tests

OpenMuse usa **Vitest** (vía `tsx --test`) para tests de integración. El script principal es:

```
pnpm test          # tsx --import ./tests/setup.ts --test --test-timeout=5000 tests/*.test.ts
```

## Estructura de tests

| Patrón | Alcance |
|--------|---------|
| `tests/*.test.ts` | 78 archivos de test en la raíz (ejecutados por `pnpm test`) |
| `tests/**/*.test.ts` | 112 archivos de test en todo el árbol (incluidos anidados) |
| `apps/worker/tests/` | Tests del worker separado |
| `apps/computer/smoke.test.ts` | Test de smoke del computer Docker |

## Estado actual

- **~165 tests fallan de forma preexistente** (browser, auth, agent-api, ZodError en bus).
- No es una regresión de la Campaña 4. Es deuda conocida pendiente de limpieza post-Fase 9.
- `tests/tenant-http-e2e.test.ts` está `untracked`, no commiteado, falla. Referencia para Fase 6.

## Scripts de test

| Script | Comando | Descripción |
|--------|---------|-------------|
| `pnpm test` | `tsx --import ./tests/setup.ts --test --test-timeout=5000 tests/*.test.ts` | Tests de integración (78 archivos raíz) |
| `pnpm test:hanging` | `tsx --import ./tests/setup.ts --test --test-timeout=10000 tests/*.test.ts` | Tests con timeout más largo |
| `pnpm test:coverage` | `c8 --reporter=text --reporter=lcov pnpm test` | Tests con cobertura |
| `pnpm test:browser` | `node --experimental-strip-types --test apps/worker/tests/lifecycle.test.ts` | Test del browser worker |
| `pnpm test:computer` | `tsx --test apps/computer/smoke.test.ts` | Smoke test del computer |

## Typecheck

| Script | Comando |
|--------|---------|
| `pnpm typecheck` | `tsc --noEmit && npm --prefix apps/worker run typecheck` |
| `pnpm --filter @openmuse/web exec tsc --noEmit` | Typecheck del paquete web |

**Nota**: El typecheck raíz puede interrumpirse sin diagnóstico. No se declara verde ni rojo por defecto.

## Campañas de limpieza pendientes

- Limpieza de ~165 tests preexistentes fallando (post-Fase 9).
- Ejecutar los 34 tests anidados que no entran en `pnpm test` (incluido el compilador).
- Verificar que el typecheck raíz pase sin errores nuevos.

## Cómo ejecutar un test individual

```
pnpm test -- tests/tenant-isolation.test.ts
```
