# 01 — Tests

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: docs/audits/_prep/test-full.txt, docs/audits/_prep/typecheck.txt, código real tests/*.test.ts, package.json

## Ontología

AgentTask, ActionProposal, Mail, CalendarEvent, BrowserSession, ComputerCommand, Thought, Turn, AuditEntry, CapabilityContract, Outcome, Goal, Verification.

## Estado real

218 casos en tests/*.test.ts. 11 con timeout a 20s. Los before hooks dependen de servicios externos que se cuelgan. 429 de Gemini en los tests que llaman al LLM. Los after hooks revientan con TypeError cuando el before falla. Tests unitarios (actions, computer, google, pdf, vault, event-bus, policy) pasan en <500ms.

## Evidencia

De test-full.txt: 11 tests con timeout, 3 before hooks colgados, 4 archivos con TypeError en el after, 429 de Gemini free tier (limit 5). Muchos tests muestran tiempos bajos pero el runner los marca como timeout.

## Huecos declarados

- before/after hooks no protegidos.
- Tests de integración sin aislar servicios externos (Gemini, PGlite, Docker, Playwright).
- Sin cobertura medida.
- Sin tests del kernel cognitivo.
- Sin test de crash-recovery.
- Sin test de 50 tenants concurrentes.

## Huecos profundos (auditoría extendida)

1. **Sin `test:watch` en package.json**: iterar sobre un test cuesta 3-5s cada vez. No hay atajo de desarrollo.
2. **`--test-timeout=20000` hardcodeado**: no hay override por test individual. Un test lento legítimo bloquea toda la suite.
3. **Sin per-test fixtures**: cada test crea su propio `createStore()`. 218 tests × 300ms = 65s solo en setup de DB.
4. **Sin `--test-concurrency` explícito**: por defecto node --test corre en serie. 4 CPUs disponibles sin usar.
5. **`tests/setup.ts` no existe** (aunque el fix 01-01 lo propone): sin él, cada test que llama a un proveedor externo tiene que mockear manualmente.
6. **No hay mock de `pglite`**: los tests usan PGlite real en disco. Cada test crea una DB nueva en `/tmp` y la borra. 4x más lento que in-memory.
7. **No hay `tests/helpers/db.ts`**: cada test copia el mismo patrón `mkdtemp + createStore + rm`. 30 líneas repetidas × 50 tests = 1500 líneas duplicadas.
8. **`tests/helpers/browser.ts` y `tests/helpers/computer.ts` existen pero no se usan consistentemente**: algunos tests montan su propio Docker runner en lugar de reusar el helper.
9. **Sin test de migración de DB**: `scripts/migrate-*` existen pero nadie los verifica contra una DB real.
10. **Sin test de las rutas HTTP**: `app.request("/api/...")` sí se usa, pero no hay un helper para hacer requests tipados. Cada test repite headers, auth, etc.
11. **No hay snapshot testing**: las respuestas de `/api/agent` cambian de shape sin test que detecte el cambio.
12. **Sin test de los schemas Zod del dominio**: si un schema cambia (añadir un campo obligatorio), ningún test lo detecta hasta que rompe en runtime.
13. **Sin test de idempotencia de rutas**: repetir un POST con la misma key no está cubierto salvo en actions.
14. **`tests/load/fifty-tenants.test.ts` hace 50 tenants secuenciales, no concurrentes**: el nombre miente.
15. **Sin `tests/fixtures/`**: los datos de prueba están inline en cada test. Imposible reusar.
16. **No hay `coverage/lcov.info` en CI**: aunque se mida cobertura, no se publica.
17. **Sin `test:all` que corra backend + worker + web**: cada uno tiene su comando. Un solo punto de entrada sería mejor.
18. **Sin test de retención del bus** (los eventos de auth se retienen 365 días, los de system.maintenance 7): implementado en retention.ts pero sin test que lo cubra.
19. **Sin test de la migración owner → tenant:owner**: `scripts/migrate-tenant-scope.ts` sin cobertura.
20. **Sin test de `recoverInterruptedTasks` con datos reales**: el test existe pero usa un store en memoria, no la DB.

## Interrelación

Transversal. Bloquea el cierre de cualquier rama. Comparte infraestructura con 14, 20, 21.

## Riesgos

Un fix en service.ts rompe tests ya colgados. Test pasa por razón equivocada. Suite tarda >3 min y nadie la corre.

## Tipo de fixes

Aislar tests de servicios externos. Proteger after hooks. Instrumentar cobertura (c8). Tests del kernel. Test de crash-recovery. Helper de DB reutilizable. Test de migración. Test de schemas Zod. Test de retención.
