This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: scripts/audits/**, docs/audits/**
- Files matching these patterns are excluded: **/node_modules/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
docs/
  audits/
    _prep/
      hanging-before.txt
    00-coherencia/
      fixes.md
      miniaudit.md
      roadmap.md
    01-tests/
      miniaudit.md
      roadmap.md
    02-observabilidad/
      fixes.md
      miniaudit.md
      roadmap.md
    03-resiliencia/
      miniaudit.md
      roadmap.md
    04-multi-usuario-concurrente/
      miniaudit.md
      roadmap.md
    05-motor-tareas-durable/
      miniaudit.md
      roadmap.md
    06-aprobaciones-acciones/
      miniaudit.md
      roadmap.md
    07-aislamiento-multi-tenant/
      miniaudit.md
      roadmap.md
    08-bus-de-eventos/
      miniaudit.md
      roadmap.md
    09-kernel-cognitivo/
      miniaudit.md
      roadmap.md
    10-fast-slow-llm/
      miniaudit.md
      roadmap.md
    11-chat-con-llm/
      miniaudit.md
      roadmap.md
    12-contexto-memoria/
      miniaudit.md
      roadmap.md
    13-ui-servida-viewspec/
      miniaudit.md
      roadmap.md
    14-templates-reales/
      miniaudit.md
      roadmap.md
    15-frontend-react/
      miniaudit.md
      roadmap.md
    16-autenticacion/
      miniaudit.md
      roadmap.md
    17-seguridad-basica/
      miniaudit.md
      roadmap.md
    18-deploy-infra/
      miniaudit.md
      roadmap.md
    19-backups-restore/
      miniaudit.md
      roadmap.md
    20-computer-sandbox/
      miniaudit.md
      roadmap.md
    21-browser-worker/
      miniaudit.md
      roadmap.md
    22-google-drive-gmail/
      miniaudit.md
      roadmap.md
    23-whatsapp-stripe-gmb/
      miniaudit.md
      roadmap.md
    24-business-os-goals/
      miniaudit.md
      roadmap.md
    25-docs-operativos/
      miniaudit.md
      roadmap.md
    POLICY_REPO.md
    PROTOCOLO_FIXES.md
scripts/
  audits/
    blocks/
      README.md
    anchors.ts
    capture-log-samples.ps1
    check-secret-redaction.ps1
    contracts.ts
    find-hanging-before.ps1
    idempotency.ts
    tenant-default.ts
    test-coverage-report.ps1
```

# Files

## File: docs/audits/02-observabilidad/fixes.md
```markdown
# Fixes — 02 observabilidad

> v1 · 2026-10-05 · Estado: aplicado (23 fixes)

## Fixes aplicados

| # | Fix | Marca | Archivo | Estado |
|---|---|---|---|---|
| 01 | Sampling de logs INFO | LOG_SAMPLING_V1 | apps/server/src/log.ts | applied |
| 02 | LOG_LEVEL en todos los niveles | LOG_LEVEL_GLOBAL_V1 | apps/server/src/log.ts | applied |
| 03 | backgroundFailure retryable + stack + cause + contador | LOG_RETRYABLE_V1 | apps/server/src/log.ts | applied |
| 04 | Contadores background_failures_total + http_errors_by_route_total | METRIC_BG_FAILURES_V1 + METRIC_HTTP_ERRORS_V1 | apps/server/src/metrics/registry.ts | applied |
| 05 | Interfaz Histogram | HISTOGRAM_V1 | apps/server/src/metrics/registry.ts | applied |
| 06 | Campo histograms en MetricsRegistry | HISTOGRAM_FIELDS_V1 | apps/server/src/metrics/registry.ts | applied |
| 07 | Métodos histogram y observe | HISTOGRAM_METHODS_V1 | apps/server/src/metrics/registry.ts | applied |
| 08 | Render de histogramas | HISTOGRAM_RENDER_V1 | apps/server/src/metrics/registry.ts | applied |
| 09 | Registrar histograma HTTP | HISTOGRAM_HTTP_LATENCY_V1 | apps/server/src/metrics/registry.ts | applied |
| 10 | Errores por ruta + observación de latencia | HTTP_ERRORS_AND_HISTOGRAM_V1 | apps/server/src/middleware/request-logger.ts | applied |
| 11 | Activar alerta http_latency_p99 | LATENCY_P99_WIRE_V1 | apps/server/src/alerts/definitions.ts | applied |
| 12 | thoughtProvenance acepta correlationId | PROVENANCE_CORRELATION_V1 | apps/server/src/kernel/graph/thought.ts | applied |
| 13 | Kernel propaga correlationId a Thought | KERNEL_CORRELATION_PROPAGATE_V1 | apps/server/src/kernel/kernel.ts | applied |
| 14 | Parseo W3C de traceparent | TRACEPARENT_PARSE_V1 | apps/server/src/middleware/request-logger.ts | applied |
| 15 | Deduplicar quotaPerSpeed | CONFIG_QUOTA_DEDUP_V1 | apps/server/src/config.ts | applied |
| 16 | .strict() en thoughtProvenance | ATTENTION_STRICT_V1 | apps/server/src/kernel/graph/thought.ts | applied |
| 17 | Exponer p99 HTTP en /metrics | METRICS_P99_EXPOSE_V1 | apps/server/src/metrics-exporter.ts | applied |
| 18 | Método quantile en MetricsRegistry | HISTOGRAM_QUANTILE_V1 | apps/server/src/metrics/registry.ts | applied |
| 19 | Cablear AlertService en index.ts | ALERTS_WIRE_V1 | apps/server/src/index.ts | applied |
| 20 | snapshotHttp en MetricsRegistry | (no aplicado, sustituido por inline) | — | replaced |
| 21 | Fallback snapshotHttp inline | ALERTS_WIRE_FIX3_V1 | apps/server/src/index.ts | applied |
| 22 | Completar mock metricsSnapshot en test | ALERTS_TEST_MOCK_FIX_V1 | tests/alerts.test.ts | pending |
| 23 | Reparar snapshotHttp roto | ALERTS_WIRE_FIX3_V1 | apps/server/src/index.ts | applied |

## No aplicados (fuera de alcance o requieren decisión)

| # | Punto del miniaudit | Motivo |
|---|---|---|
| 3 | Rotación de logs | infra, no código |
| 4 | Separación por nivel | ya hecho con stdout/stderr |
| 7 | Log HTTP bodies | riesgo PII, requiere diseño |
| 11 | metrics_flush a storage | decisión de diseño |
| 12 | Dashboards Grafana | ops, no código |
| 20 | Retención de logs | infra, no código |
| 24 | console.log directos (27 sitios) | arranque/CLI/demo, caso por caso en bloque 00 |

## Notas

- AlertService se instancia al arrancar el server y evalúa las 8 alertas cada 30s.
- El histograma HTTP se puebla en request-logger; la alerta p99 se apoya en él.
- correlationId viaja del request HTTP al Thought.provenance.
```

## File: docs/audits/_prep/hanging-before.txt
```
# Tests que superan 10s (candidatos a before colgado)
# Se rellena ejecutando scripts/audits/find-hanging-before.ps1
# Formato de línea: <archivo> — <motivo>
```

## File: docs/audits/00-coherencia/fixes.md
```markdown
# Fixes - 00 coherencia del repo

> v1 - 2026-10-04 - Estado: fixed
> Meta-audit de disciplina, no de codigo.

## Fixes aplicados

| # | Fix | Archivo | Estado |
|---|---|---|---|
| 00-01 | Protocolo de fixes | docs/audits/PROTOCOLO_FIXES.md | applied |
| 00-02 | Policy del repo | docs/audits/POLICY_REPO.md | applied |
| 00-03 | Meta-audit | docs/audits/00-coherencia/miniaudit.md | applied |
| 00-04 | Roadmap | docs/audits/00-coherencia/roadmap.md | applied |
| 00-05 | Miniaudits 01-25 reescritos | docs/audits/*/miniaudit.md | applied |
| 00-06 | Marcas repetidas documentadas | (por bloque) | pending |
| 00-07 | Huerfanos marcados PENDING | cromos/*, Database* | applied |
| 00-08 | Constantes no usadas documentadas | (por bloque) | pending |
| 00-09 | Contratos sin aplicar documentados | (por bloque) | pending |
| 00-10 | Config sin leer documentada | (por bloque) | pending |
| 00-11 | Timeouts hardcodeados documentados | (por bloque) | pending |
| 00-12 | console.log directo documentados | (por bloque) | pending |
| 00-13 | catch {} vacios documentados | (por bloque) | pending |
| 00-14 | TODO sin issue documentados | (por bloque) | pending |
| 00-15 | Docs sin cabecera documentados | (por bloque) | pending |
| 00-16 | Fixes sin test documentados | (por bloque) | pending |
| 00-17 | Ramas sin merge documentadas | (por bloque) | pending |
| 00-18 | Informe de coherencia por bloque | docs/audits/00-coherencia/report-<bloque>.md | pending |

## Notas

- El meta-audit no cambia codigo de runtime.
- Documenta, no corrige.
```

## File: docs/audits/00-coherencia/miniaudit.md
```markdown
# 00 - Coherencia del repo y disciplina de fixes

> v1 - 2026-10-04 - Estado: audited-deep
> Fuente: leer el repo como un todo, no modulo a modulo.

## Ontologia

Marcas de idempotencia, contratos Zod, adapters, constantes declaradas, archivos huerfanos, codigo muerto, dependencias entre bloques, docs vs realidad.

## Estado real

Cada miniaudit 01-25 declara 3-6 huecos. La auditoria profunda encuentra 3-5x mas. Los miniaudits estan reescritos con 20 huecos profundos cada uno. La coherencia horizontal (entre bloques) no esta auditada.

## Evidencia

- Bloques 01-09: aplicados y verificados.
- Fixes con anclas que no encontraban el punto: detectados en 04-13, 05-10/11/12, 06-09/10.
- Marcas repetidas: ENGINE_TENANT_V1 x4, KERNEL_NONFATAL_V1 x8.
- Constantes declaradas y no usadas: MAX_CHILD_DEPTH, TenantConfig.fastIdleMs.
- Adapters huerfanos: DatabaseTenantResolver, DatabaseTenantConfigResolver.

## Huecos declarados

- Sin protocolo de fixes.
- Sin policy de que no tocar.
- Sin auditoria de coherencia horizontal.
- Sin verificacion de marcas.
- Sin verificacion de huerfanos.

## Huecos profundos (auditoria extendida)

1. Marcas repetidas en el mismo archivo.
2. Marcas huerfanas.
3. Contratos Zod declarados sin aplicar.
4. Constantes declaradas y no usadas.
5. Adapters construidos y no inyectados.
6. Codigo cromos sin uso.
7. Funciones exportadas sin consumidor.
8. Rutas sin cliente.
9. Config declarada sin lectura.
10. Timeouts hardcodeados.
11. console.log directo.
12. catch {} vacios.
13. TODO sin issue-link.
14. Docs sin cabecera.
15. Fix sin test.
16. Bloque sin verificacion 15/15.
17. Rama sin merge tras 30 dias.
18. package.json sin script de coherencia.
19. Sin informe de coherencia.
20. Sin umbral de aceptable.

## Interrelacion

Transversal a los 25 bloques. Depende de todos. Todos dependen de este.

## Riesgos

El repo se desalinea bloque a bloque. Los docs mienten. Los huerfanos crecen.

## Tipo de fixes

Protocolo de fixes. Policy del repo. Auditoria de coherencia horizontal.
```

## File: docs/audits/00-coherencia/roadmap.md
```markdown
# Roadmap - 00 coherencia del repo

> v1 - 2026-10-04 - Estado: planned

## 1. Promesa del repo

Un repo que se puede tocar sin miedo. Cada fix se verifica, cada marca es unica, cada huerfano esta marcado.

## 2. Estado verificado

- 25 miniaudits reescritos con 20 huecos profundos cada uno.
- 9 bloques aplicados.
- Protocolo de fixes y policy escritos.

## 3. Huecos contra produccion

- Sin verificacion de coherencia entre bloques.
- Sin verificacion de marcas repetidas.
- Sin verificacion de huerfanos.

## 4. Objetivo

Cada bloque se cierra con verificacion de coherencia.

## 5. Fronteras

- No auto-fix. El meta-audit reporta, no corrige.

## 6. Conexiones

Transversal a los 25 bloques.

## 7. Principios del PRODUCT.md

Coherencia. Un repo desalineado no se puede operar.

## 8. Como se verifica el cierre

- Protocolo de fixes escrito y en vigor.
- Policy escrita y en vigor.
- Meta-audit escrito y aplicado.
- 25/25 miniaudits con audited-deep.
```

## File: docs/audits/01-tests/miniaudit.md
```markdown
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
```

## File: docs/audits/01-tests/roadmap.md
```markdown
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
```

## File: docs/audits/02-observabilidad/miniaudit.md
```markdown
# 02 — Observabilidad

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump log.ts, metrics-exporter.ts, app.ts, engine/events/*, código real tras bloques 01-09

## Ontología

SystemEvent, KernelContext.correlationId, RunEvent, health-deep, métricas Prometheus, backgroundFailure.

## Estado real

log.ts con emit(level, event, fields) que imprime JSON de una línea. metrics-exporter.ts con 6 métricas. /api/health-deep verifica DB, bus, worker, kernel, tenantService, capabilities, guardrails, metrics. backgroundFailure(phase, error) en log.ts.

## Evidencia

Los tests no muestran tracing. Los errores 429 de Gemini no se distinguen de errores de código en el log. metrics-exporter genera las métricas bajo demanda, no las acumula.

## Huecos declarados

- Sin traceId.
- Sin tracing distribuido (OTel).
- Sin alertas.
- Sin dashboards.
- backgroundFailure sin contexto (owner, tenantId, taskId).
- Sin redacción de secretos.

## Huecos profundos (auditoría extendida)

1. **`logInfo`/`logWarn`/`logError` no aceptan contexto estructurado**: hay que concatenar strings. Se pierden campos en el parseo JSON.
2. **Sin sampling**: en producción con 100 req/s, se escriben 100 líneas/s de log info. Ruido.
3. **Sin rotación de logs**: el archivo crece indefinidamente. En 1 mes, 10 GB.
4. **Sin separación por nivel**: errors y debug van al mismo stream. El operador no puede filtrar barato.
5. **`console.log` directo en algunos sitios**: `kernel/graph/store-store.ts`, `metrics-exporter.ts`, `admin-routes.ts` usan `console.warn` directo, saltándose `log.ts`.
6. **Sin `LOG_LEVEL` respetado en todos los sitios**: algunos logs son hardcoded, otros respetan el nivel. Inconsistente.
7. **Sin log de HTTP bodies**: cuando un request falla, no hay forma de saber qué envió el cliente sin tocar el código.
8. **Sin contador de errores por ruta**: `/metrics` no expone `http_errors_by_route_total`. Saber qué endpoint falla más es manual.
9. **Sin histograma de latencia**: `openmuse_http_requests_total` no tiene versión histogram. No hay p50/p95/p99.
10. **`metrics-exporter.ts` recalcula todo en cada GET**: con 50 tenants son 50×4 list = 200 queries por request a /metrics.
11. **Sin `metrics_flush` a storage**: las métricas viven solo en memoria. Reinicio = pierde histórico.
12. **Sin dashboards predefinidos**: ni Grafana, ni JSON de dashboards, ni nada.
13. **Sin alertas implementadas**: el AlertService existe (fix 02-09) pero solo 5 alertas definidas. Faltan: circuito abierto, DLQ creciendo, tenant con quota agotada, worker caído, error rate >5%.
14. **Sin logs de decisión**: cuando el kernel decide un destino (Promoter), no hay log. Debug imposible.
15. **Sin traceId propagado al kernel**: `correlationId` se propaga al HTTP pero no llega a `Thought.provenance`. Imposible correlacionar un turno con un request.
16. **`backgroundFailure` no distingue transitorio vs permanente**: un 503 de Google reintentable y un 400 determinista van al mismo log. El operador no sabe cuál priorizar.
17. **Sin contador de fallos por fase**: `backgroundFailure` loguea pero no incrementa un contador. No hay `background_failures_total{phase}`.
18. **Sin `traceparent` W3C**: no se acepta ni se emite el header estándar de tracing. Imposible integrarse con OTel.
19. **Sin logs estructurados de excepciones**: los errores se loguean como string, no como JSON con `name`, `message`, `stack`, `cause`.
20. **Sin retención de logs**: el log.jsonl crece sin tope. Debería rotarse por tamaño o por días.

## Interrelación

Transversal. Comparte system-events con 08.

## Riesgos

Fallo sin diagnosticar. system-events crece sin tope. /metrics bloquea la DB al calcularse en cada request.

## Tipo de fixes

Propagar correlationId a cada log. Añadir contexto a backgroundFailure. Redacción de campos sensibles. Alertas mínimas. Métricas acumulativas con flush a DB. Sampling. Rotación. Histograma de latencia.
```

## File: docs/audits/02-observabilidad/roadmap.md
```markdown
# Roadmap — 02 observabilidad

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
No puedes operar lo que no ves. Base de cualquier deploy a producción.

## 2. Estado verificado
- log.ts con JSON de una línea.
- 6 métricas Prometheus bajo demanda.
- health-deep con checks.
- Fuente: repodump apps/server/src/log.ts, metrics-exporter.ts.

## 3. Huecos contra producción
- Sin traceId global.
- backgroundFailure sin owner/tenantId/taskId.
- Sin alertas.
- Sin dashboards.
- Sin redacción de secretos.

## 4. Objetivo
Reconstruir una operación end-to-end (HTTP → task → turn → thought) desde
los logs. Un fallo en producción dispara una alerta.

## 5. Fronteras
- No dashboards Grafana.
- No tracing OTel todavía.

## 6. Conexiones
- Transversal.
- Depende de: 08 (bus).
- Dependen de esta: todas.

## 7. Principios del PRODUCT.md
Tareas durables, kernel cognitivo.

## 8. Cómo se verifica el cierre
- Un request HTTP con correlationId propaga el id a todas las líneas.
- 5 alertas definidas y probadas.
- Redacción de token, apiKey, authorization.
```

## File: docs/audits/03-resiliencia/miniaudit.md
```markdown
# 03 — Resiliencia

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump worker.ts, service.ts, computer.ts, model-chain.ts, google.ts, código real tras bloques 01-09

## Ontología

LostLeaseError, AbortSignal, ctx.guard(), ctx.checkpoint, outcome_unknown, recoverInterruptedTasks, recoverInterruptedActions, retryWithBackoff, CircuitBreaker, DeadLetterQueue.

## Estado real

TaskWorker con leases CAS, heartbeat cada leaseMs/3, AbortSignal propagado. ctx.guard() antes de cada tool. recoverInterruptedTasks() recupera tareas con lease expirado. recoverInterruptedActions() marca executing como outcome_unknown al arrancar. browser.ts con serial(id, fn).

## Evidencia

Los tests de computer.test.ts que prueban timeout, Stop, quarantine pasan. Los tests de actions.test.ts que prueban outcome_unknown pasan. No hay tests de retry con backoff. No hay tests de circuit breaker.

## Huecos declarados

- Sin retry con backoff.
- Sin circuit breaker.
- Sin dead letter queue.
- Timeouts inconsistentes (30s/45s/90s/300s).
- outcome_unknown no se reconcilia desde la UI.
- recoverInterruptedActions solo al arrancar.

## Huecos profundos (auditoría extendida)

1. **`model-chain.ts` retry sin jitter**: los reintentos entre specs son inmediatos. Con 100 tareas concurrentes, sincronizados.
2. **`firstByteTimeout` de 45s es fijo**: un proveedor lento legítimo tira fallback sin motivo. Configurable por modelo.
3. **Circuit breaker por spec, no por proveedor**: si Google cae, `google/gemini-3.6-flash` y `google/gemini-3.5-flash` tienen circuitos distintos. Falta agrupar por provider.
4. **`recoverInterruptedTasks` sin lock**: si dos procesos arrancan a la vez, ambos intentan recuperar la misma task. Idempotente pero ruidoso.
5. **No hay timeout de shutdown**: `worker.stop()` espera `this.active` vacío sin límite. Con un handler colgado, el proceso no termina.
6. **`child.kill("SIGKILL")` en `runDocker` sin `waitpid`**: el proceso queda zombie hasta que el padre termina.
7. **No hay detección de "proveedor caído globalmente"**: 10 tareas fallan por 500 de Google y no hay alerta.
8. **`ctx.guard()` con cache de 500ms**: si el lease se roba en la ventana, no se detecta hasta el siguiente guard. Bajar a 100ms.
9. **Sin retry selectivo por tool**: `prepare_email` no debería reintentar (efecto externo); `read_workspace` sí. Hoy se tratan igual.
10. **`DeadLetterQueue` sin TTL**: entradas antiguas nunca se limpian. `maintain()` debería purgarlas a los 90 días.
11. **Sin reconciliación automática de `outcome_unknown`**: hay endpoint manual pero nadie reconcilia por defecto. Debería haber un job que consulte al proveedor.
12. **Sin "bulkhead" por proveedor**: si Google tarda 30s, todas las tasks que lo usan se acumulan. Falta pool separado.
13. **`AbortSignal.timeout(30000)` en google.ts hardcodeado**: no respeta `config.toolTimeouts`.
14. **Sin retry de webhook (WhatsApp, Stripe)**: si el webhook falla, no hay reintento. Se pierde el evento.
15. **`process.exit(1)` en `shutdown` sin drain**: si el drain tarda, se mata el proceso. Debería haber timeout de drain.
16. **Sin "graceful degradation"**: cuando el LLM falla, `ConversationAgent` no ofrece un modo degradado (solo el fallback de modelChain).
17. **`recoverInterruptedActions` solo al arrancar**: hay que hacerlo periódico.
18. **Sin retry en `Files.import`**: un `readFile` transitorio no se reintenta.
19. **`retryWithBackoff` no acepta `maxTotalTimeMs`**: un operation con 8 intentos y backoff de 30s puede tardar 4 minutos. Falta tope duro.
20. **Sin test de "proveedor caído durante 5 minutos"**: no hay test que verifique que el sistema sigue funcionando sin Google.

## Interrelación

Depende de 05, 06, 20, 21, 22. Comparte worker.ts con 05, service.ts con 06.

## Riesgos

Proveedor caído tumba el worker por reintentos infinitos. outcome_unknown no reconciliado ejecuta dos veces. Worker muerto no libera el lease.

## Tipo de fixes

Retry con backoff por handler. Circuit breaker por dominio. Dead letter queue con TTL. Timeouts configurables por tool. Reconciliación de outcome_unknown periódica. Bulkhead por proveedor. Retry selectivo por tool. Drain con timeout.
```

## File: docs/audits/03-resiliencia/roadmap.md
```markdown
# Roadmap — 03 resiliencia

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Un fallo aislado no puede tumbar el sistema. "Recuperar sin duplicar".

## 2. Estado verificado
- Leases CAS, heartbeat, AbortSignal propagado.
- recoverInterruptedTasks y recoverInterruptedActions al arrancar.
- Fuente: repodump worker.ts, service.ts, computer.ts.

## 3. Huecos contra producción
- Sin retry con backoff.
- Sin circuit breaker.
- Sin dead letter queue.
- Timeouts inconsistentes (30/45/90/300s).
- outcome_unknown sin reconciliación.
- recoverInterruptedActions solo al arrancar.

## 4. Objetivo
Tres fallos consecutivos de un proveedor no rompen el sistema.
outcome_unknown reconciliable en <1 minuto.

## 5. Fronteras
- No chaos engineering.
- No multi-región.

## 6. Conexiones
- Depende de: 05, 06, 20, 21, 22.
- Dependen de esta: 06, 22.

## 7. Principios del PRODUCT.md
Tareas durables.

## 8. Cómo se verifica el cierre
- Mock con 500 en 10 llamadas: backoff y luego circuit breaker.
- Reconciliación de outcome_unknown con endpoint y UI.
- Dead letter queue con 10 tareas.
```

## File: docs/audits/04-multi-usuario-concurrente/miniaudit.md
```markdown
# 04 — Multi-usuario concurrente

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump db.ts, threads-routes.ts, projects-routes.ts, código real tras bloques 01-09

## Ontología

compareAndSwap, insertIfAbsent, updatedAt, conflict, sesión, presencia, edit lock.

## Estado real

compareAndSwap protege contra carreras a nivel de record. insertIfAbsent cierra carreras de creación. threads-routes.ts y projects-routes.ts exponen PUT que pueden pisarse. No hay detección de conflicto en el cliente.

## Evidencia

Los tests de actions.test.ts prueban "concurrent approval consumes the proposal only once" y "concurrent idempotent proposals retain a single persisted review". Ambos pasan. No hay tests de dos usuarios escribiendo el mismo thread.

## Huecos declarados

- Sin locks de edición.
- Sin avisos de "otro usuario está editando".
- Sin reconciliación de conflictos.
- Sin rate limit por usuario.
- Sin presence service.

## Huecos profundos (auditoría extendida)

1. **`conversations` PUT hace `db.put` sin CAS**: dos usuarios pisándose en el chat. Implementado en fix 04-01 pero solo si el cliente envía `expectedUpdatedAt`.
2. **`projects` PATCH hace `db.put` sin CAS**: fix 04-02 con la misma limitación.
3. **`blocks` PUT hace `db.put` sin CAS**: fix 04-03.
4. **`memories` POST hace `compareAndSwap({})`**: expected vacío = siempre gana. No protege contra carreras.
5. **`goals` PATCH usa `db.put`**: fix 04-02 no lo cubre.
6. **`agent-settings/identity` POST**: fix existe pero sin CAS real.
7. **Sin optimistic locking en `notifications`**: dos usuarios marcando leída la misma notificación es idempotente pero sin verificación.
8. **Sin ETag / If-Match HTTP estándar**: en vez de `expectedUpdatedAt` custom, se podría usar el header estándar.
9. **`presence` en proceso único**: el PresenceService es in-memory. Con 2 réplicas, dos usuarios en réplicas distintas no se ven.
10. **`edit-lock` in-process**: mismo problema. Con 2 réplicas, no hay coordinación.
11. **Sin Redis / store compartido para locks**: en producción multi-réplica, faltaría.
12. **Sin WebSocket para presence en vivo**: usa polling (no implementado aún). Latencia 3-5s.
13. **`rate-limit` por usuario in-process**: mismo problema multi-réplica.
14. **Sin quota compartida entre usuarios del mismo tenant**: 5 usuarios × 100 tareas = 500, sin límite del tenant.
15. **Sin notificación de "otro usuario cambió X"**: solo devuelve 409, no avisa proactivamente.
16. **Sin "ver qué cambió"**: el 409 no incluye diff. El usuario tiene que recargar y comparar visualmente.
17. **`threads-routes PUT` no valida que el usuario sea el dueño del thread**: cualquier usuario autenticado con el id puede escribirlo. Falta check de ownership explícito.
18. **`projects-routes PATCH` mismo problema**: falta ownership check.
19. **Sin auditoría de cambios por usuario**: `activity` no guarda quién hizo qué cambio.
20. **Sin "revertir a versión anterior"**: cuando hay 409, no hay forma de recuperar la versión previa del otro usuario.

## Interrelación

Transversal al estado compartido. Comparte db.ts con 05 y 07.

## Riesgos

Cliente con 5 usuarios ve corrupción de datos. Notificaciones duplicadas o perdidas entre usuarios del mismo owner. Presencia en vivo muestra lo que escribe otro.

## Tipo de fixes

updatedAt optimista en PUT. Cliente detecta 409 Conflict y muestra "recarga". Notificaciones dirigidas por userId. Presence service efímero con store compartido. Rate limit por usuario con store compartido. ETag HTTP. Diff en el 409. Ownership check en threads y projects.
```

## File: docs/audits/04-multi-usuario-concurrente/roadmap.md
```markdown
# Roadmap — 04 multi-usuario concurrente

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Dos usuarios a la vez no deben pisarse.

## 2. Estado verificado
- compareAndSwap a nivel de record.
- insertIfAbsent cierra carreras de creación.
- Fuente: repodump db.ts, threads-routes.ts, projects-routes.ts.

## 3. Huecos contra producción
- Sin locks de edición.
- Sin avisos de "otro usuario está editando".
- Sin reconciliación de conflictos.
- Sin rate limit por usuario.
- Sin presence service.

## 4. Objetivo
Dos usuarios en el mismo thread no corrompen estado. El segundo ve 409.

## 5. Fronteras
- No colaboración en tiempo real.

## 6. Conexiones
- Depende de: 05, 07.
- Dependen de esta: ninguna.

## 7. Principios del PRODUCT.md
Tareas durables, memoria curada.

## 8. Cómo se verifica el cierre
- Test con 2 usuarios concurrentes en el mismo thread.
- Notificaciones dirigidas por userId.
```

## File: docs/audits/05-motor-tareas-durable/miniaudit.md
```markdown
# 05 — Motor de tareas durable

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump worker.ts, service.ts, db.ts, código real tras bloques 01-09

## Ontología

TaskWorker, leaseId, leaseUntil, heartbeat, ctx.checkpoint, ctx.guard(), LostLeaseError, AgentTask.status, AgentTask.plan, run-events.

## Estado real

TaskWorker con lease CAS y heartbeat cada leaseMs/3. checkpoint(patch) hace compareAndSwap con { leaseId, status: "running" }. guard() verifica que el lease sigue vivo antes de cada tool. recoverInterruptedTasks() recupera tareas con lease expirado. Plan por defecto según kind (document 5, monitor 3, finance 3, agent 4). settled() al cerrar notifica al owner.

## Evidencia

Los tests de engine.test.ts "two workers claim one task only once", "cancellation invalidates a stale worker", "scheduled tasks wait for due time" pasan. El test "expired leases recover saved checkpoints" timeout a 20s. "pending reviews do not starve queued work" pasa.

## Huecos declarados

- `this.active` sin tope real.
- Sin cuotas por owner en la ejecución.
- Sin cancelación real del handler.
- Sin observabilidad por task como métricas.
- heartbeat no invalida guard cache siempre.

## Huecos profundos (auditoría extendida)

1. **`tick()` corre cada 1s sin backoff**: si la DB está lenta, 1 tick/s es 60 ticks/minuto todos fallando.
2. **`scanByStatus` sin filtro por tenant**: el worker escanea todos los tenants en cada tick. Con 50 tenants son 50× filas.
3. **`eligible.length === 3` hardcodeado**: 3 tareas por tick. Con 1000 tareas queued, tarda 333s en procesarlas.
4. **`MAX_ACTIVE` implementado pero `eligible` todavía limita a 3**: el fix 05-01 sube el límite pero el código deja `eligible.length === 3`. Hmm, ya se subió a 20 en el fix 05-04. Aún así, límite fijo.
5. **`plan` por kind sin detalle**: "Understand the outcome" es vago. El plan no cambia según el input real.
6. **`checkpoint` escribe el plan completo cada vez**: 5 steps + 500 bytes de plan por checkpoint. Con 10 checkpoints por task, 5 KB de escritura.
7. **`run-events` sin tope por task**: una task con 100 eventos acumula 100 filas. `maintain()` los purga a los 90 días, pero la task sigue viva.
8. **`settled` se llama sin verificar que la task no cambió**: entre el último checkpoint y el settled, otro proceso puede haber movido la task.
9. **No hay cancelación de sub-tareas**: una SOP con 50 steps no puede cancelar el step actual a mitad.
10. **`attempts` incrementa en cada `run`, incluso si es un recover**: una task que se recuperó 5 veces tiene attempts=5, sin distinguir recuperaciones de reintentos reales.
11. **`this.active` es un Map sin LRU**: con 50 tasks concurrentes y 500 liberadas, el Map crece sin límite hasta que el proceso termina.
12. **Sin timeout por task**: una task colgada puede durar 5 minutos sin abort. `leaseMs` es 60s, pero el handler no lo respeta.
13. **`worker.stop()` espera sin timeout**: si un handler está colgado, el shutdown nunca termina.
14. **`heartbeat` con `leaseMs/3` fijo**: con lease de 60s, heartbeat cada 20s. Si el DB tarda 21s, se pierde el lease.
15. **`recoverInterruptedTasks` sin notificar**: cuando recupera una task, no emite evento. El operador no lo sabe.
16. **Sin `task.metrics.lastRunDuration`**: no se persiste cuánto duró la última ejecución. Debug imposible.
17. **`scanByStatusWithCursor` sin validación del cursor**: si el cursor es inválido, salta silenciosamente al inicio.
18. **Sin "task takeover"**: si un worker muere y otro quiere tomar su task, no hay protocolo explícito. Solo funciona por el lease expirado.
19. **`plan` se puede modificar en runtime por el handler**: `ctx.checkpoint({plan})` cambia el plan sin auditoría.
20. **`run-events` sin `correlationId`**: cada evento no lleva el id de la request que lo generó.

## Interrelación

Corazón. Comparte worker.ts con 03, db.ts con 04 y 07. Depende de 08.

## Riesgos

Lease expira mientras el handler hace operación larga → duplicación de efecto. checkpoint falla → tarea inconsistente. this.active crece sin control.

## Tipo de fixes

Guard que verifique abort de operación externa cuando el lease se pierde. Tope real de concurrencia. Métrica task_duration_seconds. Test de crash-recovery. Retry con backoff a nivel de task. Timeout por task. Backoff del tick. Cursor validation. Audit del plan.
```

## File: docs/audits/05-motor-tareas-durable/roadmap.md
```markdown
# Roadmap — 05 motor de tareas durable

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Una tarea sobrevive reinicios, no se duplica, no se pierde.

## 2. Estado verificado
- TaskWorker con lease CAS, heartbeat, checkpoint.
- recoverInterruptedTasks al arrancar.
- Fuente: repodump worker.ts, service.ts.

## 3. Huecos contra producción
- this.active sin tope real.
- Sin cuotas por owner en ejecución.
- Sin cancelación real del handler.
- Sin métricas de task.

## 4. Objetivo
Cobertura 100% de casos de lease expirado sin duplicar efecto. Tope real
de concurrencia.

## 5. Fronteras
- No Kafka.
- No sharding entre procesos.

## 6. Conexiones
- Depende de: 08.
- Dependen de esta: 03, 06, 22, 24.
- Archivos compartidos: worker.ts, service.ts, db.ts.

## 7. Principios del PRODUCT.md
Tareas durables.

## 8. Cómo se verifica el cierre
- Test: matar el proceso a mitad, reiniciar, la tarea continúa.
- Tope MAX_ACTIVE respetado con 100 tareas largas.
- Métrica task_duration_seconds visible.
```

## File: docs/audits/06-aprobaciones-acciones/miniaudit.md
```markdown
# 06 — Aprobaciones / acciones

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump actions.ts, actions-deferred.ts, engine/routes.ts, ApprovalModal.tsx, código real tras bloques 01-09

## Ontología

ActionProposal, ActionService, propose, decide, hash, expiresAt, idempotencyKey, outcome_unknown, DeferredActions, signers, needed, executeAt.

## Estado real

ActionService.propose con hash SHA-256 y expiresAt 30 min. decide con compareAndSwap sobre status. ActionProposal con 9 estados. DeferredActions con undo de 8s y dualAt para doble firma.

## Evidencia

Los 12 tests de actions.test.ts pasan (approve, deny, expired, disconnected, concurrent, outcome_unknown, idempotent replay, review con version). Los 6 de deferred-actions.test.ts pasan.

## Huecos declarados

- Reconciliación de outcome_unknown desde la UI.
- Doble firma configurable expuesta.
- Undo de 8s integrado en UI.
- Auditoría visual.
- Reintento controlado.

## Huecos profundos (auditoría extendida)

1. **`propose` con `idempotencyKey` usa `hash(key)` como id**: dos proposals con la misma key en tenants distintos colisionan. Falta prefijo de tenant.
2. **`hash` del payload no incluye `connectionId`**: si el usuario cambia de cuenta Google, el hash sigue siendo el mismo pero la acción cambia de cuenta.
3. **`expiresAt` de 30 min hardcodeado**: no configurable por tenant.
4. **`decide("deny")` es CAS pero no incrementa attempts**: no hay penalización por denegar repetido.
5. **`decide` no permite "reabrir" una acción denegada**: una vez denegada, se crea una nueva.
6. **Sin edición de una acción propuesta**: si el usuario quiere cambiar el subject del email antes de aprobar, tiene que denegar y volver a proponer.
7. **`ApprovalModal` no muestra `expiresAt`**: el usuario no sabe cuándo expira la propuesta.
8. **`ApprovalModal` no muestra `hash`**: cuando cambia, no hay forma de verlo.
9. **Sin historial de acciones en el chat**: la propuesta aparece y desaparece. No hay contexto de "hace 3 días aprobé X".
10. **`DeferredActions.decide` con `dualAt` fijo por proceso**: `config.deferredAction.dualAt` no se usa, es un parámetro del constructor.
11. **`signers` no valida que sea el mismo usuario firmando dos veces con distinto id**: cualquier id sirve.
12. **`executeAt` con `windowMs` de 8s no es configurable por tenant**: hardcodeado.
13. **Sin "notificar al firmante X"**: la propuesta no avisa a los co-firmantes.
14. **`outcome_unknown` no se reconcilia automáticamente**: el job de maintain detecta "executing > 10 min" pero no consulta al proveedor.
15. **Sin "acción preparada por rol"**: `prepare` no guarda qué rol propuso la acción.
16. **`action.failed` no distingue error de negocio vs error de infra**: ambos van al mismo estado.
17. **Sin `retries` explícito**: cuando una acción falla, ¿cuántas veces se puede reintentar? Hoy 0.
18. **`action-audit` no se expone en la UI**: el endpoint existe pero el front no lo consume.
19. **Sin "acción programada visible"**: cuando una acción pasa a `scheduled`, no hay una vista del "va a ejecutarse en 5s".
20. **Sin "cancelar acción en curso"**: una vez ejecutando, no se puede cancelar.

## Interrelación

Depende de 05. Comparte actions.ts con 14, 22, 23. Depende de 08.

## Riesgos

Acción en executing para siempre. Dos usuarios aprueban y ejecuta dos veces. Usuario no ve botón de reconciliar.

## Tipo de fixes

Endpoint POST /api/actions/:id/reconcile. ApprovalModal con outcome_unknown. undoMs y dualAt expuestos por tenant. Test de aprobación concurrente extendido. Métrica outcome_unknown_total. Edición de propuesta. Notificación a firmantes. Config por tenant.
```

## File: docs/audits/06-aprobaciones-acciones/roadmap.md
```markdown
# Roadmap — 06 aprobaciones y acciones

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Nada externo se ejecuta sin aprobación humana.

## 2. Estado verificado
- ActionService con hash, expiresAt, idempotencyKey.
- 9 estados en ActionProposal.
- DeferredActions con undo de 8s.
- Fuente: repodump actions.ts, actions-deferred.ts.

## 3. Huecos contra producción
- outcome_unknown sin reconciliación UI.
- Doble firma no expuesta.
- Undo de 8s no visible.
- Auditoría visual incompleta.
- Sin endpoint de reintento.

## 4. Objetivo
100% de acciones externas con aprobación. outcome_unknown reconciliable
en <1 minuto.

## 5. Fronteras
- No firma criptográfica compleja.
- No multi-nivel de aprobación.

## 6. Conexiones
- Depende de: 05.
- Dependen de esta: 14, 22, 23.
- Archivos compartidos: actions.ts, service.ts.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Endpoint POST /api/actions/:id/reconcile.
- ApprovalModal muestra outcome_unknown con botón.
- Test de aprobación y rechazo por acción.
```

## File: docs/audits/07-aislamiento-multi-tenant/miniaudit.md
```markdown
# 07 — Aislamiento multi-tenant

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: audit-tenant-default.txt, repodump db-tenant.ts, db-rls.ts, service.ts, app.ts, código real tras bloques 01-09

## Ontología

Tenant, Owner, Membership, TenantScopedStore, peel, scanByOwnerPrefix, RLS, MULTI_TENANT_SHARED.

## Estado real

TenantScopedStore envuelve Store y compone tenantId:owner. peel(owner) quita el prefijo al leer. Store.scanByOwnerPrefix filtra por prefijo en SQL. db-rls.ts con enableRls opcional. TenantService con cache de 5 min.

## Evidencia

De audit-tenant-default.txt: 63 ocurrencias permitidas, 2 prohibidas. Aislamiento mucho más limpio de lo que se suele asumir. Los 2 casos son puntos concretos, no estructurales.

## Huecos declarados

- RLS no activa por defecto.
- service.ts con scans globales (collectActiveTenants hasta 5000, maintainTenant hasta 500).
- Files y Rag con db crudo en algunos callers.
- Cache de 5 min de TenantService.
- Sin tests de fugas con N tenants.

## Huecos profundos (auditoría extendida)

1. **`Files`, `Rag`, `WorkspaceService` reciben `db` crudo en app.ts**: sus writes van con owner plano, los reads con tenantId:owner. Invisible hasta que los artifacts no aparecen.
2. **`TenantService.cache` sin invalidación por evento**: si un admin mueve un owner de tenant, la cache sigue vieja 5 min.
3. **`collectActiveTenants` escanea 5000 filas de `agent-settings`**: con 50 tenants son 50×5000 = 250.000 filas/minuto.
4. **`maintainTenant` itera owners secuencialmente**: 50 owners × 1s cada uno = 50s por tenant, 25 min con 30 tenants.
5. **Sin rate limit por tenant real**: `takeForTenant` existe pero solo se llama en createTask. Chat, RAG, files sin límite.
6. **`tenantPrefixes` guardaba solo el último**: bug corregido en 07-01 pero documentado.
7. **`db.scanByOwnerPrefix` sin índice dedicado**: el LIKE '%' no usa índice. Con 1M filas, 1s por scan.
8. **Sin índice `(owner, kind)` en `records`**: cada query filtra por owner+kind sin índice compuesto. La PK es `(owner, kind, id)`, no sirve para scans por owner+kind.
9. **`db-rls.ts` no se activa salvo flag explícito**: 99% de deployments no usan RLS. La seguridad depende del código, no de la DB.
10. **Sin verificación de que el tenantId del request coincida con el tenantId del owner**: si un request autenticado pasa un tenantId distinto, nadie lo valida.
11. **Sin auditoría de accesos cross-tenant**: si un bug causa un leak, no hay log.
12. **`onboarding` no verifica tenant**: cualquier usuario de cualquier tenant puede listar los clientes.
13. **Sin `tenantId` en las respuestas HTTP**: el cliente no sabe en qué tenant está.
14. **Sin "elegir tenant activo"**: un usuario multi-tenant no puede cambiar de tenant.
15. **Sin migración segura de owner → tenantId:owner**: `scripts/migrate-tenant-scope.ts` sin transacción.
16. **Sin "fugas" test con N=500 tenants**: el test 07-13 cubre 50. Con 500 hay más presión.
17. **`audit-entries` sin tenant check**: el `StoreAuditStore` escribe en `tenantId` como clave de tenant, pero si un tenantId es malicioso, contamina el namespace.
18. **`notifications` sin tenant filter**: las notificaciones van al owner sin verificar tenant.
19. **`Files.import` con `tenantId` opcional**: default "default". Un caller que olvide pasarlo escribe bajo "default".
20. **Sin "tenant switcher" en el frontend**: multi-tenant real no es usable.

## Interrelación

Transversal al almacenamiento. Comparte db.ts con 04 y 05. Depende de 16.

## Riesgos

Fuga silenciosa. Cache desactualizada tras mover usuario. RLS desactivada.

## Tipo de fixes

MULTI_TENANT_SHARED=true por defecto. maintainTenant con scanByOwnerPrefix. Auditar this.db.list en service.ts. Files y Rag con tdb. Test de 50 tenants. Índice (owner, kind). RLS por defecto o doc. Tenant switcher. Rate limit por tenant en más sitios.
```

## File: docs/audits/07-aislamiento-multi-tenant/roadmap.md
```markdown
# Roadmap — 07 aislamiento multi-tenant

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Un tenant no ve a otro. Un deployment por cliente.

## 2. Estado verificado
- TenantScopedStore con peel y scanByOwnerPrefix.
- 2 ocurrencias prohibidas de "default".
- Fuente: repodump db-tenant.ts, db-rls.ts,
  docs/audits/_prep/audit-tenant-default.txt.

## 3. Huecos contra producción
- RLS no activa por defecto.
- service.ts con scans globales.
- Files y Rag con db crudo en algunos callers.
- Cache de 5 min de TenantService.
- Sin test de 50 tenants concurrentes.

## 4. Objetivo
Cero fugas verificables con 50 tenants concurrentes.

## 5. Fronteras
- No tenant por subdominio todavía.

## 6. Conexiones
- Depende de: 16.
- Dependen de esta: 04, 05.
- Archivos compartidos: db.ts, db-tenant.ts, db-rls.ts, service.ts.

## 7. Principios del PRODUCT.md
Memoria curada.

## 8. Cómo se verifica el cierre
- Test con 50 tenants concurrentes.
- 0 ocurrencias prohibidas de "default".
- RLS activa con MULTI_TENANT_SHARED=true.
```

## File: docs/audits/08-bus-de-eventos/miniaudit.md
```markdown
# 08 — Bus de eventos

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump engine/events/*, código real tras bloques 01-09

## Ontología

SystemEvent, SystemEventType, EventBus, EventSink, EventQuery, dedupeKey, correlationId, causationId.

## Estado real

EventBus.emit con Zod. 41 tipos en SYSTEM_EVENT_TYPES. StoreSink append-only con insertIfAbsent. StoreQuery.recent con filtros; aggregate con GROUP BY. dedupeKey opcional con TTL 60s.

## Evidencia

Los tests "todo SystemEventType tiene schema y payload", "EventBus.emit no lanza con ningun tipo", "todo SystemEventType aparece en algun bus.emit" pasan. No hay SSE en vivo. Solo polling cada 5s.

## Huecos declarados

- Sin SSE.
- Solo ReactionEngine lo lee.
- Retención uniforme 90 días.
- Faltan índices para agregados.

## Huecos profundos (auditoría extendida)

1. **`ulid` no expone `timestampOf(id)`**: para ordenar por ULID hace falta parsear el id manualmente.
2. **`dedupeKey` sin TTL variable**: siempre 60s. Un evento de "task status changed" puede repetirse en <60s y perderse.
3. **`dedupe-state` sin límite por owner**: LRU de 64 entradas. Con 100 eventos/s, se pierden claves.
4. **`emit` fire-and-forget con catch silencioso**: si el sink falla, nadie se entera. Debería incrementar un contador.
5. **`StoreSink.write` no valida tenantId**: cualquier tenantId vale. Un bug puede contaminar otro tenant.
6. **`StoreQuery.recent` filtra en memoria**: trae todos los eventos del owner y filtra por tipo/since. Con 100.000 eventos, es lento.
7. **`StoreQuery.recent` con `limit` tope 200**: con 1000 eventos por hora, solo se ven 200. Paginación real necesaria.
8. **`aggregate` con `GROUP BY` sin índice**: cada llamada escanea toda la tabla del owner.
9. **Sin `sinceId` en `recent`**: el cliente no puede hacer polling incremental eficiente.
10. **Sin `system-events` en el índice compuesto `(owner, kind, updated_at)`**: el índice existe pero no filtra por tipo. El agregado sigue lento.
11. **`schema-registry.ts` no se usa en runtime**: solo valida al emitir pero no se expone el registro. `GET /schemas` no lo consume.
12. **`payloadSchemas` con `Record<SystemEventType, ZodTypeAny>`**: si se añade un tipo sin schema, TS falla pero runtime no.
13. **Sin `causationId` consistente**: los emisores rara vez lo pasan. Sin cadena causal real.
14. **Sin `correlationId` propagado automáticamente**: cada emisor lo pasa o no. Inconsistente.
15. **`EventBus` sin dedupe por defecto**: los emisores tienen que acordarse de pasar dedupeKey. Ruido en `system-events`.
16. **Sin "replay" endpoint**: no hay forma de reprocesar eventos históricos.
17. **Sin "snapshot del bus" endpoint**: el operador no puede ver el estado agregado.
18. **Sin `BusSink` alternativo (Kafka, OTel)**: solo StoreSink. Frontera declarada pero sin stub funcional.
19. **Sin test de 1000 eventos/s**: no hay test de estrés del bus.
20. **Sin retención por tipo aplicada**: `retention.ts` existe tras fix 08-03 pero `maintain()` no lo usa hasta fix 08-14.

## Interrelación

Transversal. Alimenta 02, 09, 12.

## Riesgos

system-events crece sin tope. dedupeKey olvidado. Evento escrito y nadie lo lee.

## Tipo de fixes

GET /api/events/stream con SSE. Retención por tipo. Test de dedupe por tipo. Índices para agregados. `sinceId` en recent. `causationId` consistente. Dedupe por defecto. Replay endpoint. Snapshot endpoint. Sink alternativo stub.
```

## File: docs/audits/08-bus-de-eventos/roadmap.md
```markdown
# Roadmap — 08 bus de eventos

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Cada acción del sistema se registra y se puede reconstruir.

## 2. Estado verificado
- EventBus con Zod, 41 tipos, dedupe con TTL 60s.
- StoreSink append-only, StoreQuery con aggregate en SQL.
- Fuente: repodump engine/events/*.

## 3. Huecos contra producción
- Sin SSE en vivo (solo polling).
- Solo ReactionEngine lo lee.
- Retención uniforme 90 días.
- Faltan índices para agregados.

## 4. Objetivo
SSE en vivo. Consumidores reales además de ReactionEngine. Retención por
tipo.

## 5. Fronteras
- No Kafka ni OTel todavía.

## 6. Conexiones
- Transversal.
- Dependen de esta: 02, 09, 12.
- Archivos compartidos: engine/events/*, db.ts.

## 7. Principios del PRODUCT.md
Kernel cognitivo.

## 8. Cómo se verifica el cierre
- GET /api/events/stream con SSE.
- 3 consumidores reales del bus.
- Test de dedupe por tipo.
```

## File: docs/audits/09-kernel-cognitivo/miniaudit.md
```markdown
# 09 — Kernel cognitivo

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump kernel/*, KERNEL_SPEC.md

## Ontología

Kernel, KernelContext, Thought, Turn, AttentionVector, MatchReason,
IgnoreReason, ThoughtRole, Promoter, Rules, Consolidate, Meta, Presenter,
Views.

## Estado real

Kernel con openTurn/openChildTurn/appendThought/closeTurn/thoughtsOf.
StoreTurnStore con closeTurnAndChildren (fix de este pase). StoreAuditStore
con hash chain y CAS sobre anchor. Meta con 4 reglas. Promoter con destinos.
Views con readView.

## Evidencia

StoreAuditStore.verify falla al pasar 10.000 entradas (fix de este pase).
Presenter existe pero conversation.ts no lo llama. Meta.evaluate corre en
maintain() pero nadie lee los hints. Rules.classify no usa attention.

## Huecos

Presenter no wireado. Meta sin consumidor. Rules.ts sin atención.
consolidate no se llama en maintain.

## Interrelación

Depende de 05, 08, 10. Alimenta a 11 y 12.

## Riesgos

Kernel escribe más de lo que se lee. Presenter nunca se cablea. Meta
escribe run-events que nadie limpia.

## Tipo de fixes

Wire del Presenter al SSE. Wire de Meta.evaluate en el chat. Rules.classify
con isFocusedOn >= 0.7. consolidate en maintain cada 5 min. Test end-to-end.
```

## File: docs/audits/09-kernel-cognitivo/roadmap.md
```markdown
# Roadmap — 09 kernel cognitivo

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Cada turno se registra como Thought con AttentionVector. Audit con hash
chain. Grafo compartido.

## 2. Estado verificado
- Kernel con openTurn, appendThought, closeTurn, openChildTurn.
- StoreTurnStore con closeTurnAndChildren.
- StoreAuditStore con hash chain y CAS sobre anchor.
- Fuente: repodump kernel/*.

## 3. Huecos contra producción
- Presenter no wireado al SSE.
- Meta sin consumidor.
- Rules.ts sin atención.
- consolidate no se llama en maintain.

## 4. Objetivo
El kernel decide qué se muestra, no solo lo observa.

## 5. Fronteras
- No cromos ni polaridad todavía.

## 6. Conexiones
- Depende de: 05, 08, 10.
- Dependen de esta: 11, 12.
- Archivos compartidos: kernel/*, conversation.ts.

## 7. Principios del PRODUCT.md
Kernel cognitivo.

## 8. Cómo se verifica el cierre
- Test de SSE que verifica que el Presenter decide el texto.
- Meta hint inyectado en el siguiente turno.
- Rules.classify con isFocusedOn.
```

## File: docs/audits/10-fast-slow-llm/miniaudit.md
```markdown
# 10 — Fast / slow LLM

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump kernel/config/*, conversation.ts, model.ts, model-chain.ts, código real

## Ontología

TenantConfig, ProviderSpec, fast, slow, embeddings, EnvTenantConfigResolver, modelChain, runWithModelFallback, KernelContext.

## Estado real

EnvTenantConfigResolver lee FAST_LLM_* y SLOW_LLM_*. TenantConfig con fast, slow, embeddings. conversation.ts usa el fast (fix de este pase). modelChain con fallback global.

## Evidencia

model.ts no usa el slow. executeModelTask usa modelChain(config), no TenantConfig.slow. recordUsage guarda source pero no velocidad. Sin fallback cruzado.

## Huecos declarados

- model.ts no usa el slow.
- Cuotas por velocidad.
- Fallback cruzado.
- Elección por complejidad (hoy regex).

## Huecos profundos (auditoría extendida)

1. **`modelChain(config)` ignora el tenant config**: lee solo `config.model` global. El tenant no puede tener su propio modelo.
2. **`TenantConfig.fast` y `.slow` sin validación al arrancar**: si la apiKey está vacía, el error aparece en el primer mensaje, no al arrancar.
3. **`EnvTenantConfigResolver` lee envs cada vez**: no cachea. Con 100 turns/min, 100 lecturas de process.env.
4. **Sin caché de TenantConfig por tenant**: cada llamada a `kernel.config(ctx)` recalcula el objeto completo.
5. **Sin fallback fast → slow**: si el fast falla, salta al global, no al slow del tenant.
6. **Sin fallback slow → global**: si el slow falla, salta al global, no al fast del tenant.
7. **Sin medición de latencia por velocidad**: `recordUsage` no distingue fast vs slow. Métricas agregadas sin sentido.
8. **Sin cuotas por velocidad**: un tenant con cuota agotada en fast puede seguir usando slow.
9. **`shouldDelegateToSlow` con regex**: `/(analiza|investiga|prepara|resume|planifica|revisa|compara|estudia|calcula)/i`. Se olvida de idiomas y de contexto.
10. **Sin "cambio dinámico de modelo"**: no se puede empezar en fast y pasar a slow a mitad del turno si el fast no puede resolverlo.
11. **`provider-spec.ts` valida pero el resolver no parsea**: `providerEnv` cae a `"google"` silenciosamente si el valor es raro.
12. **Sin `baseUrl` por tenant**: `providerSpecSchema` lo soporta pero el resolver no lo lee del env.
13. **Sin "modelo por rol"**: un rol podría preferir un modelo distinto (ej. legal usa uno más caro). No implementado.
14. **`fastIdleMs` no se usa en conversation.ts**: `TenantConfig.fastIdleMs` declarado pero el chat no lo consulta.
15. **`quiescenceMs` no se usa en closeTurn**: `TenantConfig.quiescenceMs` declarado pero el kernel no lo aplica al cerrar turnos.
16. **`slowLongMs` no se usa en Meta**: `TenantConfig.slowLongMs` declarado pero Meta usa `longNoOutputMs` hardcodeado.
17. **`maxThoughtsPerTurn` no se usa en StoreTurnStore**: `TenantConfig.maxThoughtsPerTurn` declarado pero el store usa `MAX_THOUGHTS_PER_TURN` constante.
18. **Sin "modo degradado"**: si ambos modelos fallan, el chat devuelve un error técnico, no un mensaje humano.
19. **Sin test de que un tenant con config propia funciona**: no hay test que verifique que el fast del tenant se usa.
20. **`embeddings` en TenantConfig sin usar**: `TenantConfig.embeddings` declarado pero `RagService` usa `process.env.GEMINI_API_KEY` directo.

## Interrelación

Transversal a chat y tareas. Los embeddings usan un tercer modelo.

## Riesgos

Fast y slow comparten cuota. Task tarda 5 min en el slow. Fallback oculta fallos reales.

## Tipo de fixes

executeModelTask con KernelContext y TenantConfig.slow. recordUsage con speed. Fallback fast → slow → global. Cache de TenantConfig. Modelo por rol. Wire de los tiempos (fastIdleMs, quiescenceMs, slowLongMs, maxThoughtsPerTurn).
```

## File: docs/audits/10-fast-slow-llm/roadmap.md
```markdown
# Roadmap — 10 fast / slow LLM

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Dos velocidades con cuotas separadas. El fast habla, el slow trabaja.

## 2. Estado verificado
- EnvTenantConfigResolver lee FAST_LLM_* y SLOW_LLM_*.
- conversation.ts usa el fast (fix de este pase).
- Fuente: repodump kernel/config/*, conversation.ts, model.ts.

## 3. Huecos contra producción
- model.ts no usa el slow.
- recordUsage sin campo velocidad.
- Sin fallback cruzado fast → slow.
- Elección por complejidad es regex.

## 4. Objetivo
Tareas durables usan slow real. Cuotas por velocidad. Fallback explícito
fast → slow → global.

## 5. Fronteras
- No LLM local.

## 6. Conexiones
- Depende de: 09.
- Dependen de esta: 11, 24.
- Archivos compartidos: conversation.ts, model.ts, kernel/config/*.

## 7. Principios del PRODUCT.md
Tareas durables, kernel cognitivo.

## 8. Cómo se verifica el cierre
- Test que verifica que una task usa el slow.
- recordUsage con campo speed.
- Fallback fast → slow → global con mock.
```

## File: docs/audits/11-chat-con-llm/miniaudit.md
```markdown
# 11 — Chat con LLM

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump conversation.ts, prompt de tono, código real tras bloques 01-09

## Ontología

ConversationAgent, BuiltInAgent, Presenter, tools (browse_web, search_mail, read_mail_thread, delegate_task, create_briefing, remember_fact, prepare_whatsapp, create_goal, watch_page), urgentBlock.

## Estado real

Prompt con 8 reglas de tono. RAG como system message. urgentBlock de 3 líneas. delegateHint si el prompt parece complejo.

## Evidencia

Presenter no wireado. fullResponse directo al SSE. Historial limitado a 3 mensajes al RAG. Sin feedback durante slow. Sin timeout duro de primera respuesta.

## Huecos declarados

- Wire del Presenter.
- Timeout 2s para el fast.
- Feedback durante slow.
- Fallback visible.

## Huecos profundos (auditoría extendida)

1. **Prompt con 8 reglas de tono nunca se valida**: no hay test que verifique que el LLM respeta el tono. Solo el prompt.
2. **`urgentBlock` siempre inyecta "DELEGACION FORZADA"**: literal en el prompt aunque no aplique. Ruido.
3. **RAG inyectado al último mensaje del usuario**: contamina el mensaje. Debería ir como system.
4. **Historial limitado a 3 mensajes al RAG**: con conversaciones largas, pierde contexto.
5. **Sin "modo claro / oscuro" en el prompt**: no distingue cuando el usuario pide paso a paso vs respuesta directa.
6. **`Tools` sin límite de iteraciones**: `maxSteps: 6` hardcodeado. Un bucle puede agotar los 6 steps sin progreso.
7. **`browse_web` sin política de reintento**: si la primera URL falla, no intenta otra.
8. **`search_mail` sin límite de resultados configurables**: 20 hardcodeado.
9. **`delegate_task` sin visibilidad del estado**: el usuario delega pero no ve el progreso.
10. **`remember_fact` guarda sin deduplicar**: cada vez que el usuario dice algo, se escribe. Aunque sea lo mismo.
11. **Sin "cancelar desde el chat"**: el usuario no puede abortar la respuesta en curso.
12. **Sin "editar y reenviar"**: si la respuesta fue mala, no hay forma de iterar sin perder contexto.
13. **Sin "feedback implícito"**: si el usuario copia la respuesta, ¿fue útil? No se mide.
14. **Sin "chips de sugerencia" contextuales**: los chips son fijos (Resumen, Email, Documento). No se adaptan a la conversación.
15. **`prepare_whatsapp` sin verificar conversación previa**: puede sugerir escribir a alguien con quien ya se habló.
16. **Sin "resumen al cerrar el thread"**: cuando se cierra un thread, no hay summary persistido.
17. **`create_briefing` sin validar que el resumen no sea alucinación**: el LLM puede inventar.
18. **`watch_page` sin notificar al usuario del resultado**: crea monitor pero no avisa cuando dispara.
19. **Sin streaming token a token real**: el typewriter del frontend es simulado sobre el stream completo.
20. **Sin "message.edited" event**: si el usuario edita un mensaje, no hay evento en el bus.

## Interrelación

Puerta de entrada. Depende de 09 y 10.

## Riesgos

Prompt de tono se olvida. RAG mete ruido. Chat lento. Email malicioso se interpreta como instrucción.

## Tipo de fixes

Wire del Presenter. Timeout de 2s al fast. Feedback con SlowAuthor → ProgressEvent. Test de tono. Historial ampliado. Chips contextuales. Resumen al cerrar thread. Streaming real.
```

## File: docs/audits/11-chat-con-llm/roadmap.md
```markdown
# Roadmap — 11 chat con LLM

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Responde en <2s, con tono humano, sin alucinar.

## 2. Estado verificado
- Prompt con 8 reglas de tono.
- RAG como system message. urgentBlock de 3 líneas.
- Fuente: repodump conversation.ts.

## 3. Huecos contra producción
- Presenter no wireado.
- Sin timeout duro de primera respuesta.
- Historial limitado a 3 mensajes.
- Sin feedback durante slow.

## 4. Objetivo
El chat respeta al Presenter y responde en <2s o avisa.

## 5. Fronteras
- No streaming de audio.

## 6. Conexiones
- Depende de: 09, 10.
- Archivos compartidos: conversation.ts.

## 7. Principios del PRODUCT.md
Kernel cognitivo, UI servida.

## 8. Cómo se verifica el cierre
- Test de primera respuesta <2s.
- Test de tono: no "Perfecto", no "Capability".
- Presenter decide el texto del SSE.
```

## File: docs/audits/12-contexto-memoria/miniaudit.md
```markdown
# 12 — Contexto / memoria

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump memory.ts, context/engine.ts, context/assembly.ts, rag.ts, código real

## Ontología

MemoryService, AgentMemory, MemoryCategory, ContextEngine, ContextPackage, RecallResult, RagService, RagChunk, RagHit, IDF.

## Estado real

MemoryService.recall con reformulación de query. ContextEngine.assemble con budget. renderContext pinta rol, entidad, relaciones, eventos, RAG y learning (fix de este pase). RagService con coseno + BM25 sin IDF.

## Evidencia

computeIdf, bm25WithIdf, computeAvgLen exportados pero search usa bm25Score sin IDF. budget.ts existe pero renderContext no lo aplica. learning ya se pinta (fix de este pase).

## Huecos declarados

- IDF real.
- Memoria jerárquica.
- Olvido selectivo.
- Budget aplicado en renderContext.

## Huecos profundos (auditoría extendida)

1. **`MemoryService.recall` carga hasta 2000 memorias en memoria**: filtra por palabras en JS. Con 5000 memorias, lento.
2. **Reformulación de query con últimos 2 mensajes concatenados**: puede generar queries raras si los mensajes no son coherentes.
3. **`recall` sin filtro por categoría si no se pasa `categories`**: recupera de todas.
4. **`recall` sin filtro por rol si no se pasa `roleId`**: mezcla memorias de todos los roles.
5. **`formatRecall` con tope de 500 chars por memoria**: trunca el texto sin indicar truncamiento.
6. **`searchMemories` con score de "palabras compartidas"**: no usa TF-IDF ni embeddings. Solo substring.
7. **`remember` con dedupe por hash de texto normalizado**: "el cliente prefiere café" y "El Cliente Prefiere Café" colisionan. Correcto, pero pierde distinción de mayúsculas.
8. **`remember` sin validar categoría**: acepta cualquier string, no valida contra `MemoryCategory`.
9. **`dedupMemories` sin tope real**: recorre 5000 memorias y borra duplicados. Si hay 5000 duplicados, 5000 removes.
10. **`retryMissingEmbeddings` con tope de 50 por pasada**: con 10.000 chunks sin embedding, tarda 200 pasadas.
11. **`chunkText` con `CHUNK_SIZE = 900` hardcodeado**: no configurable por tipo de documento.
12. **`RagService.search` con `SEARCH_PAGE_SIZE = 500`**: con 100.000 chunks, 200 páginas por búsqueda.
13. **`searchVector` con cast a `vector(768)` hardcodeado**: si el modelo cambia, falla silenciosamente.
14. **`ingestText` con `maxChunks = 1000` hardcodeado**: un PDF grande se trunca sin aviso.
15. **`ContextEngine.assemble` sin tope de eventos**: carga hasta 20 eventos. Configurable no.
16. **`renderContext` sin ordenar por relevancia**: pinta en orden de carga, no por score.
17. **`learning-facts` sin TTL**: los facts aprendidos crecen sin tope.
18. **Sin "olvido selectivo"**: no hay forma de marcar una memoria como "obsoleta pero mantener histórico".
19. **Sin "jerarquía de memoria"**: todas las memorias son iguales. No hay "memoria de empresa" vs "memoria de cliente".
20. **`MemoryService.remember` sin `source` obligatorio**: se puede crear sin origen. Auditoría rota.

## Interrelación

Cimiento del kernel. Depende de 08, 09.

## Riesgos

RAG devuelve fragmentos irrelevantes. Memoria crece sin tope. learning-facts con ruido.

## Tipo de fixes

IDF real con computeIdf y bm25WithIdf. MemoryService.forget. budget.ts en renderContext. Paginación real de recall. Filtro por categoría y rol. TTL por categoría. Jerarquía de memoria. Source obligatorio.
```

## File: docs/audits/12-contexto-memoria/roadmap.md
```markdown
# Roadmap — 12 contexto y memoria

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
El agente recuerda lo relevante y olvida lo demás. Memoria curada.

## 2. Estado verificado
- MemoryService con dedupe.
- ContextEngine con budget.
- renderContext pinta learning (fix de este pase).
- Fuente: repodump memory.ts, context/*, rag.ts.

## 3. Huecos contra producción
- IDF real.
- Memoria jerárquica (tenant, owner, rol, sesión).
- Olvido selectivo.
- Budget aplicado en renderContext.

## 4. Objetivo
Memoria curada con relevancia medible. Un hecho se recupera 5 días después.

## 5. Fronteras
- No embeddings locales.

## 6. Conexiones
- Depende de: 08, 09.
- Dependen de esta: 24.
- Archivos compartidos: memory.ts, context/*, rag.ts.

## 7. Principios del PRODUCT.md
Memoria curada.

## 8. Cómo se verifica el cierre
- Test que verifica que un fragmento relevante gana a uno irrelevante
  con IDF.
- MemoryService.forget con TTL probado.
```

## File: docs/audits/13-ui-servida-viewspec/miniaudit.md
```markdown
# 13 — UI servida (ViewSpec)

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump packages/domain/src/views.ts, engine/views/resolver.ts, routes/views.ts, useViewResolver.ts, código real

## Ontología

RuntimeViewSpec, ViewResolver, intents, readView, computeView. Siete kinds: dashboard, queue, inbox, board, table, detail, form.

## Estado real

ViewResolver con regex de intenciones. runtimeViewSpecSchema con 7 kinds. Endpoint POST /api/views/resolve. useViewResolver en frontend. conversation.ts llama a resolveView en el turno (fix de este pase).

## Evidencia

Los tests de view-resolver.test.ts pasan. Panel contextual recibe el spec pero la UI no lo dibuja en la mayoría de los casos. ChatPanel llama a resolveView cada vez que el usuario escribe, sin cache.

## Huecos declarados

- Intenciones ricas.
- Wiring al chat con cache por thread.
- Panel contextual que se rellene.
- view.resolved al bus.

## Huecos profundos (auditoría extendida)

1. **`registerIntent` no se llama en ningún sitio**: el resolver tiene intenciones registradas solo en tests. En runtime, `resolveView` siempre devuelve `null`.
2. **Sin cache por thread**: cada mensaje del usuario dispara una llamada a `/api/views/resolve`. Con 10 mensajes/min, 10 requests.
3. **`resolveView` con regex case-insensitive sin normalizar acentos**: "factura" matchea, "facturá" no.
4. **Sin cache de specs resueltos**: la misma intención se re-resuelve. No hay LRU.
5. **Sin "el usuario puede elegir vista"**: solo hay resolución automática. El usuario no puede forzar un tipo de vista.
6. **Sin "vista anterior"**: cuando el panel se vacía, no hay historial.
7. **`RuntimeViewSpec` sin `provenance`**: no hay forma de saber de qué intención vino el spec.
8. **Sin validación estricta al servir**: `parseRuntimeViewSpec` valida pero no rechaza specs que pasan el schema pero son incoherentes.
9. **`view.resolved` se emite en conversation.ts (fix 09-15) pero nadie lo consume**: el frontend no lo recibe por SSE.
10. **Sin "preview" de la vista antes de abrirla**: el panel se abre directo, sin confirmación.
11. **Sin "vista por defecto" si no hay intención**: el panel queda vacío con "Escribe en el chat".
12. **Sin "vista persistida por usuario"**: cada sesión empieza de cero.
13. **Sin "vista compartida"**: un usuario no puede pasarle su vista a otro del mismo tenant.
14. **Sin "vista exportable"**: no hay "descargar la tabla como CSV".
15. **`useViewResolver` sin manejo de errores**: si el request falla, no hay retry ni fallback.
16. **Sin "loading state"**: el panel no sabe si está cargando o si no hay spec.
17. **Sin "vista cacheada"**: cada vez que el usuario escribe, se pide de nuevo.
18. **Sin "spec válido mínimo"**: el schema acepta specs vacíos. Un `dashboard` sin KPIs es válido pero inútil.
19. **Sin test de las 20 intenciones reales**: solo hay tests de 4 intenciones mock.
20. **`ViewResolver` con regex en cliente**: el resolver hace regex sobre el texto del usuario. Un usuario con input raro puede colgar el resolver (ReDoS).

## Interrelación

Promesa visual del PRODUCT. Depende de 09, 14.

## Riesgos

Resolver devuelve spec inválido. Panel se abre sin que el usuario lo pida. LLM en el resolver genera specs inesperados.

## Tipo de fixes

Registro de intenciones con regex + palabras clave + entidades. Cache por thread. Test de 20 intenciones. Emitir view.resolved al bus. Loading state. Persistencia por usuario. Exportar a CSV.
```

## File: docs/audits/13-ui-servida-viewspec/roadmap.md
```markdown
# Roadmap — 13 UI servida ViewSpec

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
El sistema sirve la vista correcta según la intención.

## 2. Estado verificado
- ViewResolver con regex.
- 7 kinds en runtimeViewSpecSchema.
- Endpoint POST /api/views/resolve.
- conversation.ts llama a resolveView (fix de este pase).
- Fuente: repodump packages/domain/src/views.ts,
  engine/views/resolver.ts.

## 3. Huecos contra producción
- Intenciones ricas.
- Wiring al chat con cache por thread.
- Panel contextual que se rellene.
- view.resolved al bus.

## 4. Objetivo
La intención del usuario sirve la vista correcta sin LLM libre.

## 5. Fronteras
- No plantillas dinámicas generadas por LLM.

## 6. Conexiones
- Depende de: 09.
- Dependen de esta: 14.
- Archivos compartidos: resolver.ts, views.ts.

## 7. Principios del PRODUCT.md
UI servida.

## 8. Cómo se verifica el cierre
- Test de 20 intenciones, cada una espera un spec.
- view.resolved emitido al bus.
```

## File: docs/audits/14-templates-reales/miniaudit.md
```markdown
# 14 — Templates reales

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump apps/web/src/templates/*, view/ViewRenderer.tsx, código real

## Ontología

ViewRenderer, DashboardTemplate, QueueTemplate, placeholders honestos para inbox, board, table, detail, form.

## Estado real

ViewRenderer con assertNever. DashboardTemplate y QueueTemplate reales. Los otros 5 kinds muestran un placeholder honesto.

## Evidencia

De los 7 kinds del schema, solo 2 tienen componente real. No hay tests de render por kind.

## Huecos declarados

- InboxTemplate, BoardTemplate, TableTemplate, DetailTemplate, FormTemplate.
- Test de render por kind.
- assertNever real.

## Huecos profundos (auditoría extendida)

1. **`assertNever` no se usa**: los 5 kinds faltantes caen a un `default` que devuelve un div con texto. No es exhaustividad real.
2. **DashboardTemplate con KPIs hardcodeados**: el spec trae KPIs pero el template no los pinta con formato (currency, percent).
3. **QueueTemplate sin agrupación por columna**: pinta items en lista plana, no por columnId.
4. **Sin soporte de `trend` en KPIs**: `DashboardSpec.kpis[].trend` existe pero el template no lo usa.
5. **Sin soporte de `actions` en QueueSpec**: cada item puede tener hasta 3 actions pero el template solo pinta botones sin onClick.
6. **Sin "estado vacío" en templates**: si el spec no tiene items, se pinta un div vacío sin mensaje.
7. **Sin "loading state"**: los templates reciben spec con datos o sin datos. Sin estado intermedio.
8. **Sin "error state"**: si un campo del spec no cuadra, el template crashea sin boundary.
9. **Sin lazy loading de templates**: todos los templates se importan al cargar la app. Bundle grande.
10. **CSS de templates inline con style={{}}: no hay hoja de estilos dedicada. Duplicación.
11. **Sin "responsive"**: los templates se rompen en móvil.
12. **Sin "dark mode"**: los colores están hardcodeados.
13. **Sin "accessibility"**: sin `role`, sin `aria-*`, sin keyboard navigation.
14. **Sin "focus management"**: al abrir el panel, el foco no va al template.
15. **Sin test de render con spec vacío**: no se prueba el caso de spec sin datos.
16. **Sin test de render con spec lleno**: no se prueba con 100 filas.
17. **Sin "vista de impresión"**: los templates no se pueden imprimir.
18. **Sin "export a PDF"**: no se puede exportar un DashboardSpec a PDF.
19. **Sin "compartir vista"**: un usuario no puede pasar su vista a otro.
20. **`ViewRenderer` recibe `spec: unknown`**: pierde tipado. Debería ser `RuntimeViewSpec | null`.

## Interrelación

Sin templates, la UI servida no muestra nada útil. Depende de 13.

## Riesgos

Spec cambia y template no lo soporta. Template falla con datos vacíos. CSS del template choca con el shell.

## Tipo de fixes

5 componentes. Test de render por kind. assertNever real. Loading/error/empty states. Responsive. Dark mode. Accessibility. Lazy loading.
```

## File: docs/audits/14-templates-reales/roadmap.md
```markdown
# Roadmap — 14 templates reales

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
7 templates cubren el 90% del trabajo de una pyme.

## 2. Estado verificado
- DashboardTemplate y QueueTemplate reales.
- 5 kinds con placeholder honesto.
- Fuente: repodump apps/web/src/templates/*.

## 3. Huecos contra producción
- InboxTemplate, BoardTemplate, TableTemplate, DetailTemplate,
  FormTemplate.
- Sin tests de render por kind.
- assertNever no garantiza exhaustividad.

## 4. Objetivo
Los 7 templates reales.

## 5. Fronteras
- No drag & drop complejo.

## 6. Conexiones
- Depende de: 13.
- Archivos compartidos: templates/*, view/ViewRenderer.tsx.

## 7. Principios del PRODUCT.md
UI servida.

## 8. Cómo se verifica el cierre
- 7 tests de render por kind.
- assertNever real.
```

## File: docs/audits/15-frontend-react/miniaudit.md
```markdown
# 15 — Frontend React

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump apps/web/src/*, código real

## Ontología

App, AppShell, SidebarV2, TopBarV2, MessageList, MessageBubble, ContextualPanel, CommandPalette, hooks, templates.

## Estado real

React 18 + Vite + Tailwind + Lucide. MessageList con slice 50. SuggestionChips sin BOM (fix de este pase). App.tsx con AppShell y ContextualPanel.

## Evidencia

Typecheck web limpio. Sin tests de frontend. Sin virtualización real. Sin aria-live en el chat.

## Huecos declarados

- Virtualización real.
- Accesibilidad.
- Estados vacíos honestos.
- Retry visual.
- Lazy loading de templates.

## Huecos profundos (auditoría extendida)

1. **Sin tests de frontend**: 0 tests. Ningún componente tiene cobertura.
2. **`slice 50` en MessageList**: parche para no reventar con 500 mensajes. Con 100, corta los últimos.
3. **Sin virtualización real**: cada mensaje renderiza su DOM. Con 1000, lag.
4. **`aria-live` solo en el chat**: falta en notificaciones, en el panel contextual, en las tareas.
5. **Sin `role="status"` en lugares de estado**: el usuario con lector de pantalla no sabe qué pasa.
6. **Sin focus trap en modales**: el tab va fuera del modal.
7. **Sin `Escape` para cerrar modales**: hay que hacer click fuera.
8. **Sin "skip links"**: navegación con teclado empieza en el logo.
9. **Contraste WCAG AA no verificado**: algunos textos grises sobre blanco no pasan.
10. **Sin `prefers-reduced-motion` en animaciones**: typewriter, cascada, panel slide se activan siempre.
11. **Sin ErrorBoundary global**: si un componente crashea, la app entera se rompe.
12. **Sin ErrorBoundary por vista**: chat vs tasks comparten boundary.
13. **Sin "retry visual" en errores de red**: el usuario ve error pero no puede reintentar.
14. **Sin skeleton screens**: mientras carga, ve "Cargando..." en texto plano.
15. **`ChatPanel` sin manejo de "conexión caída"**: si el SSE cae, el usuario no lo sabe.
16. **Sin "scroll to bottom" automático**: cuando llega un mensaje nuevo, hay que bajar manualmente.
17. **Sin "notificaciones en vivo" sin polling**: `useNotifications` hace polling cada 8s.
18. **Sin "offline mode"**: si la red cae, todo deja de funcionar.
19. **Sin "PWA"**: no se puede instalar en el móvil.
20. **Sin "internacionalización"**: textos hardcoded en español. No hay i18n.

## Interrelación

Cara del sistema. Depende de 13, 14.

## Riesgos

Chat con 500 mensajes a menos de 30fps. Panel rompe layout. Onboarding confuso.

## Tipo de fixes

Virtualización con react-window o slice. aria-live. ErrorBoundary por vista. Lighthouse >85. Tests con Playwright. i18n. PWA. Skeleton. Retry visual.
```

## File: docs/audits/15-frontend-react/roadmap.md
```markdown
# Roadmap — 15 frontend React

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Una app usable con 500 mensajes y 100 tareas.

## 2. Estado verificado
- React 18 + Vite + Tailwind + Lucide.
- MessageList con slice 50 (fix de este pase).
- SuggestionChips sin BOM (fix de este pase).
- Fuente: repodump apps/web/src/*.

## 3. Huecos contra producción
- Virtualización real en listas largas.
- Accesibilidad (aria-live, role=status, focus trap).
- Estados vacíos honestos.
- Retry visual de red.
- Lazy loading de templates.

## 4. Objetivo
60fps en scroll con 500 mensajes. Lighthouse performance >85.

## 5. Fronteras
- No React Native.

## 6. Conexiones
- Depende de: 13, 14.
- Archivos compartidos: apps/web/src/*.

## 7. Principios del PRODUCT.md
UI servida.

## 8. Cómo se verifica el cierre
- Lighthouse performance >85.
- aria-live="polite" en el chat.
- ErrorBoundary por vista.
```

## File: docs/audits/16-autenticacion/miniaudit.md
```markdown
# 16 — Autenticación

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump users.ts, auth.ts, auth-routes.ts, rate-limit.ts, código real

## Ontología

User, UserService, UserRecord, scrypt, session, token, role (admin | user), rate limit, signing key.

## Estado real

UserService con scrypt (64 bytes). Sesiones con SHA-256. Rate limit por IP y email. Rotación de signing key cifrada con AES-256-GCM. auth-routes.ts con login/register/logout/me/users.

## Evidencia

Los 5 tests de auth.test.ts pasan. Rate limit 20 IP, 5 email, 5 min. "login rate limit answers 429 with Retry-After" pasa.

## Huecos declarados

- OIDC / SSO.
- Scopes por rol.
- roleIds: string[].

## Huecos profundos (auditoría extendida)

1. **Sesión sin rotación**: un token válido 7 días no se rota. Si se filtra, vale 7 días.
2. **Sin "remember me"**: no hay opción de "recordar" vs "olvidar" al cerrar el navegador.
3. **Sin "logout de todos los dispositivos"**: el usuario no puede invalidar sus sesiones globalmente.
4. **`scrypt` sin parámetros configurables**: N=16384 hardcodeado. No se puede subir sin tocar código.
5. **Sin pepper en el hash**: si la DB se filtra, atacante puede rainbow tables (aunque scrypt lo hace caro).
6. **Sin validación de fortaleza de contraseña**: acepta "12345678" si tiene 8 chars.
7. **Sin "have i been pwned" check**: no verifica si la contraseña está en filtraciones.
8. **Sin `password_changed_at`**: no se puede invalidar sesiones tras cambio de contraseña.
9. **Sin `last_login_at`**: no se sabe cuándo se conectó un usuario.
10. **Sin `failed_login_count`**: no se bloquea una cuenta tras N intentos (solo rate limit por IP).
11. **Sin 2FA**: no hay TOTP, no hay WebAuthn.
12. **Sin recuperación de contraseña**: si el usuario la olvida, no hay flow.
13. **Sin verificación de email**: el registro no verifica que el email sea real.
14. **`role` de string a roleIds: string[]**: un usuario puede tener varios roles.
15. **`ensureAdmin` solo crea si no hay usuarios**: si hay 1 usuario no-admin, no crea admin.
16. **`verifyCredentials` sin timing-safe compare del hash**: aunque scrypt lo hace, mejor explícito.
17. **Sin "política de contraseñas por tenant"**: no se puede exigir más a unos clientes que a otros.
18. **Sin "auditoría de accesos"**: no hay log de quién entró, cuándo, desde dónde.
19. **Sin "SAML"**: solo password local. Enterprise pide SAML.
20. **Sin "session binding"**: el token no está atado a IP / user-agent.

## Interrelación

Puerta de entrada. Depende de 07, 04.

## Riesgos

Signup público con SIGNUP_ENABLED=true en single-tenant. Sesiones no expiran bien. Rotación de signing key olvidada.

## Tipo de fixes

OIDC opcional por tenant. Scopes declarativos. Migración a roleIds. Password strength. HIBP check. 2FA. Recuperación. Verificación de email. Session binding. SAML.
```

## File: docs/audits/16-autenticacion/roadmap.md
```markdown
# Roadmap — 16 autenticación

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Login seguro, sin fugas de sesión. SECURITY.md: un owner por deployment.

## 2. Estado verificado
- scrypt, sesiones SHA-256, rate limit IP+email.
- Rotación de signing key cifrada.
- Fuente: repodump users.ts, auth.ts, auth-routes.ts, rate-limit.ts.

## 3. Huecos contra producción
- Sin OIDC / SSO.
- Sin scopes por rol.
- roleIds: string[] pendiente.
- Rotación de signing key manual.

## 4. Objetivo
Auth con roles múltiples. OIDC opcional por tenant.

## 5. Fronteras
- No SSO corporativo todavía.

## 6. Conexiones
- Depende de: 07, 04.
- Archivos compartidos: users.ts, auth.ts.

## 7. Principios del PRODUCT.md
Tareas durables (verificación de quién ejecuta).

## 8. Cómo se verifica el cierre
- Test de sesión expirada bloqueada.
- Test de robo de token bloqueado.
- Migración de roleId a roleIds probada.
```

## File: docs/audits/17-seguridad-basica/miniaudit.md
```markdown
# 17 — Seguridad básica

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump SECURITY.md, app.ts, ci.yml, código real

## Ontología

Boundaries, bodyLimit, CORS, CSP, HSTS, webhook firma, rate limit distribuido.

## Estado real

SECURITY.md con boundaries. bodyLimit 12MB. CORS por origin. Zod en rutas. CSP no configurado. /api/whatsapp/incoming con timingSafeEqual. Tokens de Google cifrados.

## Evidencia

"API protects private data and rejects unrelated web origins" pasa. "vault encrypts with a fresh nonce" pasa. Sin test de CSP.

## Huecos declarados

- CSP y HSTS.
- Auditoría de dependencias.
- Rotación de secretos.
- Firma en más webhooks.
- Rate limit distribuido.

## Huecos profundos (auditoría extendida)

1. **Sin `Strict-Transport-Security`**: HTTP downgrade posible.
2. **Sin `X-Frame-Options` / `frame-ancestors`**: clickjacking posible.
3. **Sin `Referrer-Policy`**: fuga de URLs a terceros.
4. **Sin `Permissions-Policy`**: acceso a cámara/micrófono sin restricción.
5. **`Cache-Control: no-store` en todo**: bien, pero falta en `static
$ErrorActionPreference = "Stop"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

$path = "docs/audits/17-seguridad-basica/miniaudit.md"
$body = @'
# 17 — Seguridad básica

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump SECURITY.md, app.ts, ci.yml, código real

## Ontología

Boundaries, bodyLimit, CORS, CSP, HSTS, webhook firma, rate limit distribuido.

## Estado real

SECURITY.md con boundaries. bodyLimit 12MB. CORS por origin. Zod en rutas. CSP no configurado. /api/whatsapp/incoming con timingSafeEqual. Tokens de Google cifrados.

## Evidencia

"API protects private data and rejects unrelated web origins" pasa. "vault encrypts with a fresh nonce" pasa. Sin test de CSP.

## Huecos declarados

- CSP y HSTS.
- Auditoría de dependencias.
- Rotación de secretos.
- Firma en más webhooks.
- Rate limit distribuido.

## Huecos profundos (auditoría extendida)

1. **Sin `Strict-Transport-Security`**: HTTP downgrade posible.
2. **Sin `X-Frame-Options` / `frame-ancestors`**: clickjacking posible.
3. **Sin `Referrer-Policy`**: fuga de URLs a terceros.
4. **Sin `Permissions-Policy`**: acceso a cámara/micrófono sin restricción.
5. **`Cache-Control: no-store` en todo**: bien, pero falta en `static` (que sí cachea).
6. **CORS con wildcard `*` en algún endpoint**: si lo hay, rompe la seguridad. Verificar.
7. **Sin `pnpm audit --production` en CI**: vulnerabilidades conocidas pasan.
8. **Sin SAST (Semgrep, CodeQL)**: bugs de seguridad no detectados en código.
9. **Sin DAST (OWASP ZAP)**: no se prueba la app en runtime.
10. **Sin pentest anual**: no se descubre lo que los tests no ven.
11. **Sin `security.txt`**: sin canal de reporte de vulnerabilidades.
12. **Sin bug bounty**: no hay incentivo para reportar.
13. **Sin WAF**: ataques comunes (SQLi, XSS) dependen de validación propia.
14. **Sin DDoS protection**: capa 7 vulnerable.
15. **`OPENMUSE_ACCESS_KEY` solo validación en modo live**: en sample, no.
16. **`TOKEN_ENCRYPTION_KEY` sin rotación**: si se filtra, hay que re-encriptar todo manualmente.
17. **Sin cifrado en reposo de la DB**: si alguien accede al disco, lee todo.
18. **Sin separación de secretos por servicio**: misma env para API y worker.
19. **`WHATSAPP_WEBHOOK_TOKEN` sin rotación**: mismo problema.
20. **Sin "rate limit distribuido"**: el RateLimiter es in-process. Multi-réplica no funciona.

## Interrelación

Transversal. Depende de 16, 20, 21.

## Riesgos

dangerouslySetInnerHTML. Webhook sin firma. Error verboso filtra rutas.

## Tipo de fixes

CSP en HTML. Headers de seguridad. pnpm audit --production en CI. Rate limit compartido. Vault externo. Rotación de secretos. SAST/DAST. security.txt. WAF.
```

## File: docs/audits/17-seguridad-basica/roadmap.md
```markdown
# Roadmap — 17 seguridad básica

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
No exponer datos, no ejecutar código ajeno. SECURITY.md lo detalla.

## 2. Estado verificado
- boundaries en SECURITY.md.
- bodyLimit 12MB. CORS por origin. Zod en rutas.
- Tokens de Google cifrados.
- Fuente: repodump SECURITY.md, app.ts, ci.yml.

## 3. Huecos contra producción
- CSP y HSTS en el frontend servido.
- Auditoría de dependencias en CI.
- Rotación de secretos.
- Firma en más webhooks.
- Rate limit distribuido.

## 4. Objetivo
OWASP Top 10 básico cumplido. npm audit sin altos.

## 5. Fronteras
- No pentest externo.

## 6. Conexiones
- Depende de: 16, 20, 21.
- Archivos compartidos: app.ts, ci.yml, SECURITY.md.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- pnpm audit --production sin altos.
- CSP en el HTML servido.
- Headers de seguridad en cada respuesta.
```

## File: docs/audits/18-deploy-infra/miniaudit.md
```markdown
# 18 — Deploy / infra

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump Dockerfile, fly.toml, infra/compose.yaml, scripts/*, código real

## Ontología

Dockerfile multi-stage, fly.toml, docker-compose, DATA_DIR, volumen persistente, HEALTH, provision-client, dev.ps1.

## Estado real

Dockerfile multi-stage. fly.toml con mount /data. dev.ps1. scripts/provision-client.ts. infra/compose.yaml para browser worker.

## Evidencia

Dockerfile compila. fly.toml con healthcheck /api/health. provision-client requiere admin ya creado. Sin docker-compose.yml completo.

## Huecos declarados

- docker-compose.yml completo.
- Backups automáticos en host.
- Runbook de incidentes.
- Health checks por servicio.

## Huecos profundos (auditoría extendida)

1. **`Dockerfile` con `NODE_ENV=production` en runtime pero tests en build**: los tests se ejecutan en la imagen final, ocupando espacio.
2. **Sin `.dockerignore` para `docs/`**: la doc se copia a la imagen. +50 MB.
3. **Sin stage separado para `dist`**: la imagen incluye node_modules con devDeps.
4. **Sin "distroless"**: imagen final con shell completo. Superficie de ataque.
5. **Sin "read-only filesystem"** en la imagen del API: si un atacante escribe, persiste.
6. **Sin "non-root user"**: el API corre como root por defecto.
7. **Sin `HEALTHCHECK` en el Dockerfile**: solo fly.io lo tiene.
8. **`fly.toml` sin `[deploy] release_command`**: las migraciones no se ejecutan antes de arrancar.
9. **Sin "graceful shutdown" en el Dockerfile**: SIGTERM no se propaga.
10. **Sin "resource limits" en el Dockerfile**: fly.io los aplica, pero Docker local no.
11. **Sin `docker-compose.yml` completo**: solo hay el del browser worker.
12. **Sin "migración automática de DB"**: `scripts/migrate-*` se ejecutan a mano.
13. **Sin "rollback automático"**: si el deploy falla, no hay rollback.
14. **Sin "blue-green deploy"**: cada deploy es in-place con downtime.
15. **Sin "staging environment"**: todo va a producción.
16. **Sin "CI/CD completo"**: solo hay `pnpm test`, no hay build + deploy.
17. **Sin "k8s / k3s manifests"**: solo Docker + fly.io.
18. **Sin "Helm chart"**: no hay forma de distribuir la app a otros.
19. **Sin "auto-scaling"**: fly.io `auto_stop_machines` pero sin reglas de scale-up.
20. **Sin "runbook"**: docs/operacion/RUNBOOK.md no existe.

## Interrelación

Medio. Depende de 19.

## Riesgos

Deploy rompe el motor. Volumen se llena. Cliente no sabe reiniciar.

## Tipo de fixes

docker-compose.yml con healthchecks. Runbook.md. Backup automático documentado. deploy-client.sh. Non-root user. Read-only fs. Migration release_command. Rollback automático.
```

## File: docs/audits/18-deploy-infra/roadmap.md
```markdown
# Roadmap — 18 deploy e infra

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Desplegar a un cliente en menos de 1h. Un deployment por cliente.

## 2. Estado verificado
- Dockerfile multi-stage.
- fly.toml con mount /data.
- scripts/provision-client.ts.
- Fuente: repodump Dockerfile, fly.toml, infra/compose.yaml.

## 3. Huecos contra producción
- docker-compose.yml completo.
- Scripts de backup automático en host.
- Runbook de incidentes.
- Health checks por servicio.

## 4. Objetivo
Un cliente nuevo en 1h siguiendo un runbook.

## 5. Fronteras
- No k8s.

## 6. Conexiones
- Depende de: 19.
- Archivos compartidos: Dockerfile, fly.toml, compose.yaml, scripts/*.

## 7. Principios del PRODUCT.md
Tareas durables.

## 8. Cómo se verifica el cierre
- Deploy manual completo cronometrado <1h.
- docker-compose.yml con 5 servicios y healthchecks.
- Runbook.md en docs/operacion/.
```

## File: docs/audits/19-backups-restore/miniaudit.md
```markdown
# 19 — Backups / restore

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump backup.ts, backup-tenant.ts, scripts/*, código real

## Ontología

runBackup, runTenantBackup, retentionDays, manifest, backup por tenant, restore probado.

## Estado real

runBackup por deployment, runTenantBackup por tenant. Retención por días. restore.ts probado. Backups en dataDir/backups/<stamp>/ con manifest. Scheduler en index.ts.

## Evidencia

El script restore.ts funciona. Sin test del ciclo completo. Sin checksum. Sin alerta si >48h sin backup.

## Huecos declarados

- Backups incrementales.
- Verificación automática.
- Alerta si >48h.
- Backup remoto.
- Checksum.

## Huecos profundos (auditoría extendida)

1. **`runBackup` copia PGlite entero**: si la DB tiene 5 GB, cada backup ocupa 5 GB. Sin incremental.
2. **`runBackup` sin compresión**: 5 GB sin gzip son 5 GB en disco. Con gzip, 1 GB.
3. **Sin cifrado del backup**: si alguien accede al directorio, lee todo.
4. **Sin verificación post-backup**: no se verifica que el backup sea restaurable.
5. **`pruneOld` sin dry-run**: borra sin avisar.
6. **Sin "backup por tipo"**: todo o nada. No se puede respaldar solo `files/`.
7. **`runTenantRestore` sin validación de tenant**: restaura si el path existe. Sin verificar que el tenant sea correcto.
8. **Sin "restore parcial"**: no se puede restaurar solo un archivo.
9. **Sin "restore a punto en el tiempo"**: solo restore completo.
10. **Sin "backup off-site"**: todo en el mismo disco. Si el disco muere, todo muere.
11. **Sin "backup verificable"**: sin checksum, no se sabe si el backup está corrupto.
12. **Sin "notificación de backup fallido"**: si el scheduler falla, nadie se entera.
13. **Sin "backup retention policy"**: retentionDays hardcoded a 7. Configurable por env pero sin defaults sensatos.
14. **Sin "backup metrics"**: no hay `backup_size_bytes` ni `backup_last_success_timestamp`.
15. **Sin "backup pre-migration"**: antes de un migrate, no se hace backup automático.
16. **Sin "restore drill"**: no se prueba restaurar en staging.
17. **Sin "backup multi-región"**: no se copia a otra región.
18. **Sin "backup encriptado con KMS"**: el cifrado sería con la misma key del deployment.
19. **Sin "backup incremental"**: cada backup copia todo. Con PGlite, eso es lento.
20. **Sin "backup con WAL"**: PGlite no soporta WAL streaming. Con Postgres sí.

## Interrelación

Red de seguridad. Depende de 05, 18.

## Riesgos

Backup ocupa el disco. Backup corrupto descubierto al restaurar. Nadie verifica el restore.

## Tipo de fixes

restore.test.ts del ciclo completo. Checksum del backup. Notificación si falla. Backup a S3 opcional. Compresión. Cifrado. Off-site. Métricas. Drill trimestral.
```

## File: docs/audits/19-backups-restore/roadmap.md
```markdown
# Roadmap — 19 backups y restore

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Restaurar en <1h tras pérdida. Persistencia.

## 2. Estado verificado
- runBackup por deployment y por tenant.
- Retención por días. restore.ts probado.
- Fuente: repodump backup.ts, backup-tenant.ts.

## 3. Huecos contra producción
- Backups incrementales.
- Verificación automática del restore.
- Alerta si >48h sin backup.
- Backup remoto (S3, B2).
- Checksum.

## 4. Objetivo
Restaurar en <30 min verificado.

## 5. Fronteras
- No replica streaming.

## 6. Conexiones
- Depende de: 05, 18.
- Archivos compartidos: backup.ts, backup-tenant.ts.

## 7. Principios del PRODUCT.md
Tareas durables.

## 8. Cómo se verifica el cierre
- restore.test.ts del ciclo completo.
- Checksum del backup al crearlo y al restaurarlo.
- Notificación si un backup falla.
```

## File: docs/audits/20-computer-sandbox/miniaudit.md
```markdown
# 20 — Computer sandbox

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump computer.ts, apps/computer/*, COMPUTER.md, código real

## Ontología

ComputerService, ComputerCommand, DockerRunner, runDocker, aislamiento (readonly, cap-drop ALL, no-new-privileges, network none, 512MB, 1 CPU, 128 pids, tmpfs 64MB), files.py, /workspace persistente.

## Estado real

Docker sin red. 512MB. 1 CPU. 128 pids. --cap-drop ALL. no-new-privileges. --read-only. tmpfs 64MB. /workspace persistente. Timeout 30s. Output 128KB. files.py con rechazo de symlinks.

## Evidencia

Los 12 tests de computer.test.ts pasan (aislamiento, timeouts, Stop, quarantine, recuperación de lease, inyección argv, paths).

## Huecos declarados

- Cuotas de disco por volumen.
- Rotación de contenedores huérfanos.
- Telemetría de uso.
- Más lenguajes.

## Huecos profundos (auditoría extendida)

1. **`DockerRunner` no expone el container a métricas**: no se puede saber qué container usa qué RAM.
2. **Sin "disk quota por volumen"**: `/workspace` puede crecer hasta llenar el host.
3. **Sin "sweeper de huérfanos"**: si el API crashea, el container sigue vivo. Sin limpieza.
4. **Sin "log de comandos"**: no hay history de qué comandos se ejecutaron por task.
5. **`files.py` sin límite de profundidad**: un path con 100 niveles se procesa. Path traversal mitigation pero sin tope.
6. **`files.py` sin límite de files por directorio**: 1M files en /workspace hace el scandir lento.
7. **Sin "cache de imágenes"**: cada `docker run` puede descargar la imagen si no está local.
8. **`spawn("docker", ...)` sin verificar que docker sea el binario correcto**: si el PATH es raro, ejecuta otro.
9. **Sin "resource monitor"**: no se sabe si el container está cerca del límite.
10. **Sin "kill grace period configurable"**: 2s hardcoded.
11. **Sin "docker exec con timeout real"**: si el comando ignora SIGTERM, el kill tarda.
12. **Sin "fallback a shell nativo"**: correcto (no hay), pero documentar por qué.
13. **Sin "comandos permitidos / prohibidos"**: cualquier comando vale. Un rm -rf borra todo.
14. **Sin "audit de comandos peligrosos"**: no se registra si alguien intentó ejecutar algo destructivo.
15. **Sin "cuota de CPU seconds por tenant"**: un tenant puede consumir 100% del CPU.
16. **Sin "snapshot del workspace"**: no se puede "guardar el estado" del sandbox.
17. **Sin "restore del workspace"**: si el tenant lo rompe, no hay recuperación.
18. **Sin "multi-lenguaje"**: solo bash, python3, node, git. Falta go, rust, java.
19. **Sin "output streaming"**: el output se espera completo antes de devolverlo.
20. **Sin "environment variables aisladas"**: el container hereda HOME=/workspace pero podría heredar más.

## Interrelación

Sandbox externo. Depende de 06, 17.

## Riesgos

Comando llena el disco. Contenedor huérfano bloquea. Fallo de Docker deja tarea inconsistente.

## Tipo de fixes

Cuota de disco real. Sweeper de contenedores con lease expirado. Métricas de uso. Comandos prohibidos. Output streaming. Snapshot. Restore.
```

## File: docs/audits/20-computer-sandbox/roadmap.md
```markdown
# Roadmap — 20 computer sandbox

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Sandbox Linux aislado, sin fugas.

## 2. Estado verificado
- Docker sin red, 512MB, 1 CPU, 128 pids.
- --cap-drop ALL, no-new-privileges, --read-only, tmpfs 64MB.
- /workspace persistente. files.py rechaza symlinks.
- Fuente: repodump computer.ts, apps/computer/*.

## 3. Huecos contra producción
- Cuota de disco por volumen.
- Rotación de contenedores huérfanos.
- Telemetría de uso.
- Soporte para más lenguajes.

## 4. Objetivo
Sandbox con cuotas de disco y telemetría.

## 5. Fronteras
- No GUI.

## 6. Conexiones
- Depende de: 06, 17.
- Archivos compartidos: computer.ts, apps/computer/*.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Test que verifica límite de disco.
- Sweeper de contenedores con lease expirado.
```

## File: docs/audits/21-browser-worker/miniaudit.md
```markdown
# 21 — Browser worker

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump apps/worker/*, browser.ts, compose.yaml, código real

## Ontología

Playwright, BrowserService, BrowserSession, proxy egress, validatePublicUrl, isPublicIp, serial(id), WORKER_TOKEN.

## Estado real

Playwright 1.62.1 en contenedor aparte. Sin red privada. 3 sesiones. 20 perfiles. 30 min idle. Bearer de 32 chars. Uploads 64KB. Descargas 10MB. 20 PDFs. Proxy egress con DNS validation.

## Evidencia

Los 17 tests de browser.test.ts pasan (path traversal, URLs privadas, encoded IPs, DNS rebinding, serialización por sesión, downloads rechazados, egress proxy).

## Huecos declarados

- Self-healing.
- Rate limit por sesión.
- Auditoría de URLs bloqueadas.
- Más idiomas.

## Huecos profundos (auditoría extendida)

1. **Sin "auto-restart" del worker**: si Chromium crashea, el worker queda mudo.
2. **Sin "rate limit por sesión"**: un script puede hacer 1000 navegaciones/min.
3. **Sin "log de URLs bloqueadas"**: no se sabe qué intentó navegar el agente.
4. **Sin "user-agent rotation"**: Chromium firma siempre igual. Bot detection.
5. **Sin "CAPTCHA fallback"**: si una página tiene CAPTCHA, el agente se cuelga.
6. **Sin "screenshot OCR"**: la captura es PNG pero no se procesa texto.
7. **Sin "session recording"**: no se puede replay de lo que hizo el agente.
8. **Sin "cleanup de perfiles viejos"**: 20 perfiles máx, pero si no se usan, se acumulan.
9. **Sin "cleanup de downloads"**: 20 PDFs por sesión, pero si la sesión es vieja, no se borran.
10. **Sin "retry de navegación"**: si una URL falla, el step falla. Sin retry.
11. **Sin "cluster de workers"**: un worker único. Sin alta disponibilidad.
12. **Sin "anti-bot mitigations"**: Cloudflare, DataDome bloquean el agente.
13. **Sin "proxy rotativo"**: una IP. Fácil de bloquear.
14. **Sin "fingerprinting protection"**: Chromium estándar es detectable.
15. **Sin "PDF download con validación"**: descarga cualquier PDF sin comprobar contenido.
16. **Sin "multi-tenant worker pools"**: un worker para todos. Un tenant abusivo afecta a todos.
17. **`serial(id, fn)` sin timeout**: si una operación cuelga, toda la cola espera.
18. **Sin "session state externalizado"**: el estado vive en disco del worker. Sin failover.
19. **Sin "auth state export/import"**: no se puede migrar una sesión entre workers.
20. **Sin "screenshot con marca de tiempo"**: las capturas no indican cuándo se tomaron.

## Interrelación

Navegador del agente. Depende de 06, 17.

## Riesgos

Worker caído deja sesiones colgadas. CAPTCHA bloquea. URL privada se abre.

## Tipo de fixes

Health check y auto-restart. Rate limit por sesión y owner. Log de URLs bloqueadas. Cluster de workers. Proxy rotativo. OCR. Session recording. Cleanup.
```

## File: docs/audits/21-browser-worker/roadmap.md
```markdown
# Roadmap — 21 browser worker

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Navegador aislado, sin fugas. SECURITY.md y apps/worker/README.md.

## 2. Estado verificado
- Playwright 1.62.1 en contenedor aparte.
- Sin red privada (proxy egress con DNS validation).
- 3 sesiones, 20 perfiles, 30 min idle. Bearer de 32 chars.
- Fuente: repodump apps/worker/*, browser.ts.

## 3. Huecos contra producción
- Self-healing si el worker cae.
- Rate limit por sesión y owner.
- Auditoría de URLs bloqueadas.
- Soporte para más idiomas.

## 4. Objetivo
Browser worker con self-healing y rate limit por sesión.

## 5. Fronteras
- No Chrome extension.

## 6. Conexiones
- Depende de: 06, 17.
- Archivos compartidos: apps/worker/*, browser.ts.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Health check con auto-restart probado.
- Rate limit por sesión y owner.
- Log de URLs bloqueadas por el proxy.
```

## File: docs/audits/22-google-drive-gmail/miniaudit.md
```markdown
# 22 — Google / Drive / Gmail

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump google.ts, google-auth.ts, código real

## Ontología

GoogleClient, GoogleAuth, OAuth con PKCE, tokens AES-256-GCM, Gmail read y send, Calendar CRUD con ETag, Drive read y trash y rename.

## Estado real

OAuth completo con PKCE. Tokens cifrados AES-256-GCM. Gmail read+send con attachments. Calendar CRUD con ETag y reviews. Drive read+trash+rename. google-auth.ts con refresco de tokens.

## Evidencia

Los 30 tests de google.test.ts pasan (MIME anidado, CRLF, attachments, OAuth PKCE, ETag mismatch, recurrencia rechazada, red failure → outcome_unknown). Los 7 de oauth.test.ts pasan. Los 2 de vault.test.ts pasan.

## Huecos declarados

- Drive write completo.
- Sheets export CSV.
- Batch operations.
- Contactos.

## Huecos profundos (auditoría extendida)

1. **Drive write incompleto**: solo trash y rename. Falta create, update, delete.
2. **Sin Drive watch**: no se detectan cambios en archivos del usuario.
3. **Sin Gmail push notifications**: solo polling.
4. **Sin "Gmail label management"**: no se pueden crear labels.
5. **Sin "Gmail filter"**: no se pueden crear filters.
6. **Sin "Calendar reminders"**: no se configuran notificaciones de eventos.
7. **Sin "Calendar recurrence expansion"**: los eventos recurrentes no se expanden.
8. **Sin "Calendar attendees response"**: no se sabe si los invitados aceptaron.
9. **Sin "Drive permission management"**: no se puede compartir/descompartir archivos.
10. **Sin "Drive folder tree"**: solo se listan archivos, no carpetas.
11. **Sin "Sheets cell-level update"**: solo export CSV.
12. **Sin "Docs creation"**: no se pueden crear Docs.
13. **Sin "batch API usage"**: 1 request por archivo, no batch.
14. **Sin "quota management"**: si se agota la cuota, falla sin aviso previo.
15. **Sin "token rotation"**: el refresh token vive hasta que se revoca.
16. **Sin "revoked token detection"**: el token puede ser revocado por el usuario y no lo sabemos.
17. **Sin "Gmail search con labels"**: solo search básico.
18. **Sin "Gmail thread-level actions"**: solo read, no archive/mark.
19. **Sin "Drive shortcuts"**: no se pueden crear shortcuts.
20. **Sin "Workspace admin API"**: no se puede gestionar el dominio.

## Interrelación

Fuente de datos principal. Depende de 06, 05.

## Riesgos

Token revocado sin aviso. Email enviado dos veces por outcome_unknown. Cuota agotada.

## Tipo de fixes

Detección de token revocado con notificación. Batch endpoints. Cuota de Google en health-deep. Drive write completo. Calendar reminders. Sheets cell-level. Drive permissions.
```

## File: docs/audits/22-google-drive-gmail/roadmap.md
```markdown
# Roadmap — 22 Google Drive y Gmail

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Leer y escribir en Google con OAuth cifrado.

## 2. Estado verificado
- OAuth con PKCE, tokens AES-256-GCM.
- Gmail read+send, Calendar CRUD con ETag, Drive read+trash+rename.
- Fuente: repodump google.ts, google-auth.ts.

## 3. Huecos contra producción
- Drive write completo (create, copy, share).
- Sheets export a CSV.
- Batch operations.
- Contactos.

## 4. Objetivo
Integración completa de Google Workspace.

## 5. Fronteras
- No Google Chat.

## 6. Conexiones
- Depende de: 06, 05.
- Archivos compartidos: google.ts, google-auth.ts.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Test end-to-end de cada acción de Google.
- Detección de token revocado con notificación.
- Cuota visible en health-deep.
```

## File: docs/audits/23-whatsapp-stripe-gmb/miniaudit.md
```markdown
# 23 — WhatsApp / Stripe / GMB

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump integrations/src/stubs/*, whatsapp-routes.ts, billing-routes.ts, gmb-routes.ts

## Ontología

WhatsAppClient, StripeClient, GmbClient, stubs 503, whatsapp-drafts, stripe-events, webhook firmas.

## Estado real

WhatsAppClient con sendText sin endpoint público de envío. StripeClient con createCustomer y createPaymentLink reales sin webhook completo. GmbClient es stub 503. Los tres en packages/integrations/src/stubs/.

## Evidencia

whatsapp-routes.ts tiene /drafts y /drafts/:id/send pero el envío real no está cableado. billing-routes.ts tiene /webhook con HMAC Stripe. gmb-routes.ts devuelve 501 con mensaje honesto.

## Huecos declarados

- WhatsApp endpoint de envío.
- Stripe webhook completo y vinculación con invoices.
- GMB implementación real.

## Huecos profundos (auditoría extendida)

1. **WhatsApp sendText existe pero no hay endpoint**: no se puede enviar.
2. **WhatsApp sin webhook verificado**: acepta llamadas sin firma en algunos casos.
3. **WhatsApp sin plantillas HSM**: los mensajes fuera de 24h no se pueden enviar.
4. **WhatsApp sin media upload**: no se pueden enviar imágenes/PDFs.
5. **WhatsApp sin read receipts**: no se sabe si el mensaje se leyó.
6. **Stripe sin subscriptions**: solo payment links one-off.
7. **Stripe sin Stripe Tax**: no se calcula IVA.
8. **Stripe sin Stripe Connect**: no se puede actuar en nombre de otros.
9. **Stripe webhook incompleto**: solo invoice.paid, falta customer.subscription.*.
10. **Stripe sin idempotency keys completas**: solo en createCustomer.
11. **GMB stub devuelve 501**: el cliente no puede publicar.
12. **GMB sin OAuth**: no se conecta con la cuenta de Google.
13. **GMB sin locations**: no se listan las ubicaciones del negocio.
14. **GMB sin reviews**: no se leen reseñas.
15. **GMB sin posts scheduled**: no se programan.
16. **Sin "estado de conexión" en UI para cada canal**: el usuario no sabe qué está conectado.
17. **Sin "reintento de webhook"**: si falla, se pierde.
18. **Sin "rate limit de canales"**: un cliente puede spamear WhatsApp/Stripe.
19. **Sin "modo test" de canales**: hay que usar producción para probar.
20. **Sin "auditoría por canal"**: no hay log de qué mensaje se envió a quién.

## Interrelación

Canales externos. Depende de 06.

## Riesgos

WhatsApp sin aprobación. Stripe clientes duplicados. GMB 503 silencioso.

## Tipo de fixes

Endpoint de envío por canal con aprobación. Webhook firmado por canal. Idempotencia por idempotencyKey en Stripe. WhatsApp HSM. Stripe subscriptions. GMB OAuth + locations. Estado de conexión por canal.
```

## File: docs/audits/23-whatsapp-stripe-gmb/roadmap.md
```markdown
# Roadmap — 23 WhatsApp Stripe GMB

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Tres integraciones declaradas. No obligatorio para vender.

## 2. Estado verificado
- WhatsAppClient con sendText sin endpoint público de envío.
- StripeClient con createCustomer y createPaymentLink reales sin webhook.
- GmbClient es stub 503.
- Fuente: repodump integrations/src/stubs/*, whatsapp-routes.ts,
  billing-routes.ts, gmb-routes.ts.

## 3. Huecos contra producción
- WhatsApp: endpoint de envío con aprobación.
- Stripe: webhook completo y vinculación con invoices.
- GMB: implementación real.

## 4. Objetivo
Al menos una de las tres funcional end-to-end.

## 5. Fronteras
- No todas obligatorias.

## 6. Conexiones
- Depende de: 06.
- Archivos compartidos: stubs/*, whatsapp-routes.ts, billing-routes.ts,
  gmb-routes.ts.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Test end-to-end de la integración cableada.
- Webhook firmado por canal.
- Idempotencia por idempotencyKey en Stripe.
```

## File: docs/audits/24-business-os-goals/miniaudit.md
```markdown
# 24 — Business OS (goals)

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump engine/orchestrator/*, planner/*, verification/*, capabilities/*, BUSINESS_OS.md

## Ontología

BusinessOSOrchestrator, CapabilityRegistry, Planner, LlmPlanner, Replanner, LlmReplanner, Verifier, DeterministicVerifier, LlmVerifier, LearningObserver, Executor, CapabilityRunner, Goal, Outcome, Plan, CapabilityContract.

## Estado real

BusinessOSOrchestrator cableado. CapabilityRegistry con 12 tools + 4 composites. LlmPlanner con fallback a StubPlanner. LlmVerifier como segunda capa. LearningObserver conectado al orquestador. Executor con retry y compensación. Replanner LLM.

## Evidencia

Los 4 tests de business-os-contracts.test.ts pasan. Los 2 de business-os-orchestrator.test.ts pasan. Los 2 de business-os-slice.test.ts pasan. Los tests del orchestrator devuelven achieved y blocked según verificación. No hay test end-to-end con goal real persistido.

## Huecos declarados

- Más capabilities reales.
- Verificación externa (no solo LLM).
- Promoción de patrones a SOPs.
- Observabilidad por goal.

## Huecos profundos (auditoría extendida)

1. **`Goal` de `agent.ts` vs `Goal` de `goal.ts`**: dos tipos distintos con el mismo nombre. Adapter en createGoal.
2. **`createGoal` con orquestador en background sin retry**: si falla, el goal queda sin plan.
3. **`LlmPlanner` con fallback a `StubPlanner`**: el stub devuelve plan vacío. Silencioso.
4. **`parsePlannerResponse` con substring de `[` a `]`**: un LLM que devuelve texto antes del JSON falla.
5. **`validatePlanCapabilities` existe pero no se llama**: un plan con capabilityId inexistente se ejecuta.
6. **`enforcePlanBudget` con `MAX_PLAN_STEPS = 50`**: configurable no.
7. **`Executor` sin "step timeout"**: un step colgado bloquea el plan.
8. **`Executor` con compensation en orden inverso**: correcto, pero no verifica que la compensación haya funcionado.
9. **`DeterministicVerifier` solo evalúa `metrics`**: no evalúa `evidence`.
10. **`LlmVerifier` como segunda capa solo si `evidence.length > 0`**: si no hay evidence, no verifica.
11. **`LearningObserver.observe` con `goal.id` como key**: si un goal se reabre, se cuenta dos veces.
12. **`LearningObserver` sin TTL de patterns**: crecen sin tope.
13. **`LearningObserver` con `successCount >= 5` para proponer SOP**: umbral fijo.
14. **`proposedAsSop` sin generar el SOP real**: solo marca el pattern.
15. **`FeedbackCollector` sin agrupar por goalId**: cada feedback es una fila.
16. **`FeedbackScoring` con multiplicadores sin aplicar en ContextEngine**: se calculan pero no se usan.
17. **`MetricsCollector` sin export a Prometheus**: las métricas por tenant no están en `/metrics`.
18. **Sin "goal cancelable"**: una vez lanzado, no se puede abortar.
19. **Sin "goal paralelizable"**: los goals se ejecutan uno a uno.
20. **Sin "goal retomable"**: si el proceso muere a mitad de un goal, no se reanuda.

## Interrelación

Capa de negocio. Depende de 05, 08, 09, 12.

## Riesgos

Ciclo se ejecuta en bucle sin salida. LLM planifica mal y el executor falla. Nadie lee los aprendizajes.

## Tipo de fixes

LearningObserver que promueva patrones a SOPs tras N éxitos. Métrica openmuse_goals_total{status}. Test end-to-end con 1 goal persistido. Goal cancelable. Goal persistente. Validación de plan antes de ejecutar. Step timeout.
```

## File: docs/audits/24-business-os-goals/roadmap.md
```markdown
# Roadmap — 24 Business OS goals

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Ciclos Goal → Plan → Execute → Verify → Replan. No obligatorio para
vender, sí para madurar.

## 2. Estado verificado
- BusinessOSOrchestrator, CapabilityRegistry.
- LlmPlanner con fallback a StubPlanner.
- LlmVerifier como segunda capa. LearningObserver conectado.
- Fuente: docs/audits/_prep/audit-orchestrator.txt y repodump
  engine/orchestrator/*, planner/*, verification/*, capabilities/*.

## 3. Huecos contra producción
- Más capabilities reales.
- Verificación externa (no solo LLM).
- Promoción de patrones a SOPs.
- Observabilidad por goal.

## 4. Objetivo
Un goal completo ejecutado end-to-end con verificación real.

## 5. Fronteras
- No multi-agente todavía.

## 6. Conexiones
- Depende de: 05, 08, 09, 12.
- Archivos compartidos: engine/orchestrator/*, planner/*,
  verification/*, capabilities/*.

## 7. Principios del PRODUCT.md
Tareas durables, memoria curada.

## 8. Cómo se verifica el cierre
- Test end-to-end Goal → Outcome persistido.
- LearningObserver que promueva patrones a SOPs tras N éxitos.
- Métrica openmuse_goals_total{status}.
```

## File: docs/audits/25-docs-operativos/miniaudit.md
```markdown
# 25 — Docs operativos

> v1 · 2026-10-04 · Estado: audited
> Fuente: docs/README.md, PRODUCT.md, PROTOCOLO.md, docs/operacion/*

## Ontología

README (índice), PRODUCT (visión), PROTOCOLO (reglas de trabajo), estado/
(ROADMAP, KNOWN_ISSUES, FUTURE), operacion/ (DEPLOY, CLIENTE, ONBOARDING,
PRODUCCION, TODO-FOR-PROD), kernel/ (auditorías), ui/ (campaña), archive/
(12 docs históricos con fecha).

## Estado real

Reestructuración completa en este pase. README, PRODUCT, PROTOCOLO
nuevos. 12 docs históricos archivados con fecha. Basura borrada
(ROADMAP_112, AUDITORIA_TENANT.ps1, .lnk). Estructura por carpetas
temáticas. Cada doc con cabecera vN · YYYY-MM-DD · Estado.

## Evidencia

docs/README.md lista 8 docs canónicos en nivel 1. PRODUCT.md con visión
de producto. PROTOCOLO.md con reglas unificadas. archive/ con 12+ docs
históricos. audits/ con esta campaña de 25 ramas.

## Huecos

Runbook de incidentes. Glosario del cliente. FAQ operativa. Diagramas de
arquitectura (hoy ASCII). Verificación automática de cabeceras y enlaces.

## Interrelación

Cara del sistema para quien opera. Transversal a todas las ramas.

## Riesgos

Docs quedan obsoletos al día siguiente. Operador nuevo no sabe qué hacer
ante un fallo. Cliente pregunta lo mismo 100 veces.

## Tipo de fixes

docs/operacion/RUNBOOK.md con 10-15 escenarios. docs/CLIENTE.md con
glosario en lenguaje natural. FAQ. Diagramas Mermaid.
```

## File: docs/audits/25-docs-operativos/roadmap.md
```markdown
# Roadmap — 25 docs operativos

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Cualquiera puede operar el sistema leyendo los docs.

## 2. Estado verificado
- Reestructuración completa en este pase.
- README, PRODUCT, PROTOCOLO nuevos.
- 12 docs históricos archivados con fecha.
- Fuente: docs/README.md, PRODUCT.md, PROTOCOLO.md, docs/operacion/*.

## 3. Huecos contra producción
- Runbook de incidentes.
- Glosario del cliente (no del dev).
- FAQ operativa.
- Diagramas de arquitectura.
- Verificación automática de cabeceras y enlaces.

## 4. Objetivo
Runbook completo y glosario cliente.

## 5. Fronteras
- No curso de formación.

## 6. Conexiones
- Transversal.
- Archivos compartidos: docs/*.

## 7. Principios del PRODUCT.md
Los 5.

## 8. Cómo se verifica el cierre
- Operador nuevo ejecuta un incidente ficticio siguiendo el runbook.
- Glosario del cliente con 30 términos mínimo.
- Diagramas Mermaid de la arquitectura.
```

## File: docs/audits/POLICY_REPO.md
```markdown
# Policy del repo durante la campana de fixes

> v1 - 2026-10-04 - Estado: active
> Que NO se puede hacer mientras la campana de 25 bloques esta en marcha.

## 1. Archivos compartidos

| Archivo | Bloques que lo tocan |
|---|---|
| apps/server/src/app.ts | 02, 07, 09, 13 |
| apps/server/src/engine/service.ts | 03, 04, 05, 07, 08, 09, 12 |
| apps/server/src/engine/worker.ts | 03, 05 |
| apps/server/src/engine/conversation.ts | 03, 09, 11 |
| apps/server/src/engine/model.ts | 03, 10 |
| apps/server/src/kernel/kernel.ts | 09, 10, 12 |
| apps/server/src/db.ts | 07, 08, 12 |
| packages/domain/src/index.ts | 06, 08 |
| packages/domain/src/views.ts | 13, 14 |
| package.json | 01, 02 |

## 2. Archivos intocables sin justificacion

- apps/server/src/db.ts (motor durable).
- apps/server/src/kernel/audit/store-store.ts (hash chain).
- packages/domain/src/* (contratos).
- clientes/* (datos de clientes).
- apps/worker/* y apps/computer/* (sandboxes).

## 3. Prohibiciones absolutas

- No anadir dependencias nuevas sin justificar.
- No cambiar contratos Zod sin actualizar tests.
- No borrar codigo huerfano sin marcarlo PENDING durante 1 release.
- No mergear a main sin typecheck y test verdes.
- No cambiar packages/domain sin avisar a bloques 04-06.
- No subir .bak-fase0*, artifacts/, backups/, .openmuse/ al repo.
- No usar console.log directo en codigo de servidor.
- No hardcodear timeouts, modelos, paths, keys.
- No dejar catch {} vacios.
- No reutilizar marcas de idempotencia.
- No saltar fases: bloque A antes que B cuando hay dependencia.
- No anadir features que no esten en el roadmap.

## 4. Reglas de idempotencia y verificacion

- Cada fix idempotente. Aplicar dos veces no duplica codigo.
- Cada fix se verifica con Select-String de su marca.
- Cada bloque con tabla 15/15.
- Cada cambio TS con pnpm typecheck.

## 5. Reglas de anclas y edicion

- Anclas cortas y unicas. Maximo 10 lineas.
- Preservar line endings.
- UTF-8 sin BOM siempre.
- No usar -replace con regex sobre bloques largos.

## 6. Reglas de PowerShell

- No usar nombres de funcion de 1-2 letras.
- No usar here-strings de mas de 40 lineas.
- No usar Write-Host con -f fuera de parentesis.
- No usar exit dentro de bloques pegados.

## 7. Reglas de docs

- Cada doc empieza con: > vN - YYYY-MM-DD - Estado: <state>.
- Cada miniaudit/roadmap con marca audited-deep cuando se profundice.
- No duplicar docs.

## 8. Reglas de git

- Un bloque, un commit.
- Mensaje: feat(bloque-NN): descripcion.
- No force-push a main.
- No binarios grandes (>10 MB).
- No .env ni secretos.

## 9. Orden topologico de bloques

1. 01 (Tests).
2. 02, 08 (Observabilidad, Bus).
3. 03, 05, 06 (Resiliencia, Motor, Aprobaciones).
4. 04, 07 (Multi-usuario, Multi-tenant).
5. 09, 10, 11, 12 (Kernel, LLMs, Chat, Contexto).
6. 13, 14, 15 (UI servida, Templates, Frontend).
7. 16, 17 (Auth, Seguridad).
8. 18, 19 (Deploy, Backups).
9. 20, 21, 22, 23 (Sandboxes, Canales).
10. 24 (Business OS).
11. 25 (Docs).

## 10. Reglas de rollback

git revert <commit-del-bloque>. Comprobar que las marcas ya no aparecen.
Documentar en fixes.md como reverted.

## 11. Referencias

- docs/audits/PROTOCOLO_FIXES.md
- docs/audits/00-coherencia/miniaudit.md
```

## File: docs/audits/PROTOCOLO_FIXES.md
```markdown
# Protocolo de fixes

> v1 - 2026-10-04 - Estado: active
> Como se escribe un fix para no desalinear el repo.

## 1. Regla de oro

Un fix atomico. Una marca. Un archivo. Un proposito.

## 2. Marca unica obligatoria

Formato: XXX_VN en un comentario al principio del bloque.
Nunca reutilizar una marca ya usada en otro sitio con contenido distinto.

## 3. Ancla corta y unica

- Maximo 10 lineas.
- Debe existir exactamente una vez en el archivo.
- Comprobar con Select-String antes de aplicar.

## 4. Idempotencia obligatoria

Cada fix comprueba si ya se aplico antes de aplicar.

## 5. Preservar line endings

Detectar CRLF/LF antes de modificar y restaurar al escribir. UTF-8 sin BOM.

## 6. Errores de PowerShell ya cometidos

- R como nombre de funcion: es alias de Invoke-History. Usar Write-RepoFile.
- Here-strings de mas de 40 lineas se cortan al pegar. Usar array de strings.
- Write-Host con -f fuera de parentesis. Envolver en parentesis.

## 7. Verificacion obligatoria

Tras cada fix: comprobar la marca. Tras cada bloque: tabla 15/15.
Tras cada cambio en TS: pnpm typecheck (0 errores).

## 8. Que hacer si un fix no entra

1. No dejarlo para despues. Se reaplica con ancla mas corta.
2. No apilar parches.
3. No silenciar el fallo.

## 9. Que NO hacer

- No usar -replace sobre todo el archivo.
- No escribir un archivo completo sin leerlo antes.
- No modificar codigo de otro bloque sin avisar.
- No introducir dependencias nuevas sin justificar.
- No hardcodear timeouts, modelos, paths.
- No dejar catch {} vacios.
- No usar console.log en codigo de servidor.
- No borrar codigo huerfano sin marcarlo PENDING.
- No marcar un fix como aplicado sin verificar la marca.
- No commitear sin pnpm typecheck en 0.

## 10. Verificacion al cerrar un bloque

Ejecutar la tabla del bloque. Si hay SIN MARCA, reaplicar. Si hay FALTA, crear.

## 11. Referencias

- docs/audits/POLICY_REPO.md
- docs/audits/00-coherencia/miniaudit.md
```

## File: scripts/audits/blocks/README.md
```markdown
# Bloques pendientes de auditar

Mete aqui los bloques .ps1 que quieras revisar antes de aplicarlos.
El script `scripts/audits/anchors.ts` los lee y verifica que cada anclaje
existe en el fichero destino.

Uso:
    pnpm exec tsx scripts/audits/anchors.ts
    pnpm exec tsx scripts/audits/anchors.ts --file scripts/audits/blocks/mi-bloque.ps1

Cuando un bloque ya se aplico y esta verificado, se puede borrar de aqui.
```

## File: scripts/audits/anchors.ts
```typescript
// AUDIT_ANCHORS_V1 - verifica los anclajes de bloques PowerShell contra el
// repo real, antes de aplicarlos.
//
// Un bloque PowerShell del plan suele hacer:
//     $anchor = '...' o @'...'@
//     if ($t.Contains($anchor)) { $t = $t.Replace($anchor, $replacement) }
// Si el anchor no existe en el fichero real, el Replace no hace nada y el
// bloque sigue diciendo "OK". Este script detecta ese caso antes de aplicar.
//
// Uso:
//   pnpm exec tsx scripts/audits/anchors.ts                (revisa todos los bloques guardados)
//   pnpm exec tsx scripts/audits/anchors.ts --file X.ps1   (revisa un bloque concreto)
//   pnpm exec tsx scripts/audits/anchors.ts --stdin        (lee un bloque por stdin)
//
// Los bloques se buscan en scripts/audits/blocks/*.ps1. Se puede meter ahi
// cualquier bloque pegado antes de ejecutarlo.
//
// Salida: docs/AUDIT_ANCHORS.md + exit 1 si hay anclajes rotos.

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

interface AnchorCheck {
  blockFile: string;
  targetPath: string;
  anchorSnippet: string;
  found: boolean;
  reason: string;
}

const BLOCKS_DIR = resolve("scripts/audits/blocks");

/**
 * Extrae los pares ($path, $anchor) de un bloque PowerShell.
 * Formas soportadas:
 *     $path = "..."       (o "..." con comillas simples)
 *     $anchor = "..."     (o '...', o @'...'@)
 *     $anchor = 'texto'   con -replace "`r`n", "`n" al final
 *     $anchorImport = ...
 *     $anchorTenant = ...
 *     $anchor2 = ...
 */
function extractAnchors(block: string): Array<{ path: string; anchor: string; raw: string }> {
  const out: Array<{ path: string; anchor: string; raw: string }> = [];
  // Encontrar todas las asignaciones $path = "..."
  const pathRe = /\$path\s*=\s*"([^"]+)"/g;
  const paths: Array<{ value: string; index: number }> = [];
  for (const m of block.matchAll(pathRe)) {
    paths.push({ value: m[1], index: m.index ?? 0 });
  }
  // Encontrar todas las asignaciones $anchor* = "..." o '...' o @'...'@
  const anchorSingleLine = /\$(anchor\w*)\s*=\s*(['"])((?:\\.|(?!\2).)*)\2/g;
  const anchorHereString = /\$(anchor\w*)\s*=\s*@'((?:[^']|'(?!@))*)'@/g;
  const anchors: Array<{ value: string; index: number }> = [];
  for (const m of block.matchAll(anchorSingleLine)) {
    anchors.push({ value: m[3], index: m.index ?? 0 });
  }
  for (const m of block.matchAll(anchorHereString)) {
    anchors.push({ value: m[2], index: m.index ?? 0 });
  }
  // Emparejar por proximidad: para cada anchor, el path mas cercano por encima.
  for (const a of anchors.sort((x, y) => x.index - y.index)) {
    const closestPath = paths
      .filter((p) => p.index < a.index)
      .sort((x, y) => y.index - x.index)[0];
    if (!closestPath) continue;
    // Excluir anchors que no son de reemplazo (por ejemplo $anchorImport vacio).
    if (a.value.trim().length < 5) continue;
    out.push({ path: closestPath.value, anchor: a.value, raw: a.value });
  }
  return out;
}

/**
 * Normaliza CRLF a LF y recorta a la primera y ultima linea no vacias
 * del anchor para reducir el ruido.
 */
function normalizeAnchor(anchor: string): string {
  return anchor.replace(/\r\n/g, "\n").replace(/^\n+|\n+$/g, "");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const blocks: Array<{ file: string; content: string }> = [];

  if (args.includes("--stdin")) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
    blocks.push({ file: "<stdin>", content: Buffer.concat(chunks).toString("utf8") });
  } else {
    const fileIdx = args.indexOf("--file");
    if (fileIdx >= 0 && args[fileIdx + 1]) {
      const full = resolve(args[fileIdx + 1]);
      blocks.push({ file: full, content: await readFile(full, "utf8") });
    } else {
      if (!existsSync(BLOCKS_DIR)) {
        console.log(`[audit:anchors] No existe ${BLOCKS_DIR}. Nada que revisar.`);
        return;
      }
      for (const entry of await readdir(BLOCKS_DIR)) {
        if (!entry.endsWith(".ps1")) continue;
        const full = join(BLOCKS_DIR, entry);
        blocks.push({ file: full, content: await readFile(full, "utf8") });
      }
    }
  }

  if (blocks.length === 0) {
    console.log("[audit:anchors] No hay bloques para revisar.");
    return;
  }

  const checks: AnchorCheck[] = [];
  for (const block of blocks) {
    const anchors = extractAnchors(block.content);
    for (const a of anchors) {
      const targetPath = a.path.replace(/\\/g, "/");
      const check: AnchorCheck = {
        blockFile: block.file,
        targetPath,
        anchorSnippet: a.anchor.slice(0, 120),
        found: false,
        reason: "",
      };
      if (!existsSync(targetPath)) {
        check.reason = "fichero no existe";
        checks.push(check);
        continue;
      }
      const target = await readFile(targetPath, "utf8").catch(() => "");
      const normalizedTarget = target.replace(/\r\n/g, "\n");
      const normalizedAnchor = normalizeAnchor(a.anchor);
      if (normalizedTarget.includes(normalizedAnchor)) {
        check.found = true;
        check.reason = "OK";
      } else {
        // Intento alternativo: recortar espacios al inicio y fin de linea.
        const looseAnchor = normalizedAnchor
          .split("\n")
          .map((l) => l.trim())
          .join("\n");
        const looseTarget = normalizedTarget
          .split("\n")
          .map((l) => l.trim())
          .join("\n");
        if (looseTarget.includes(looseAnchor)) {
          check.found = true;
          check.reason = "OK (coincidencia con espacios normalizados)";
        } else {
          check.reason = "anclaje no coincide";
        }
      }
      checks.push(check);
    }
  }

  const missing = checks.filter((c) => !c.found);

  const lines: string[] = [
    "# Auditoria de anclajes",
    "",
    `> Generado por \`scripts/audits/anchors.ts\` el ${new Date().toISOString()}.`,
    "",
    `- Bloques revisados: **${blocks.length}**`,
    `- Anclajes verificados: **${checks.length}**`,
    `- Anclajes rotos: **${missing.length}**`,
    "",
  ];

  if (missing.length > 0) {
    lines.push("## Anclajes rotos");
    lines.push("");
    lines.push("El bloque intentara reemplazar estos fragmentos, pero no existen en el fichero real. El Replace no hara nada y el bloque seguira diciendo OK.");
    lines.push("");
    lines.push("| Bloque | Fichero | Motivo | Anchor (recortado) |");
    lines.push("|---|---|---|---|");
    for (const c of missing) {
      lines.push(`| \`${c.blockFile}\` | \`${c.targetPath}\` | ${c.reason} | \`${c.anchorSnippet.replace(/`/g, "\\`")}\` |`);
    }
    lines.push("");
  }

  if (checks.length > 0 && missing.length === 0) {
    lines.push("Todos los anclajes coinciden con el codigo real.");
    lines.push("");
  }

  await mkdir("docs", { recursive: true });
  await writeFile("docs/AUDIT_ANCHORS.md", lines.join("\n"), "utf8");
  console.log("[audit:anchors] Informe escrito en docs/AUDIT_ANCHORS.md");
  console.log(`[audit:anchors] OK: ${checks.length - missing.length}   ROTOS: ${missing.length}`);

  if (missing.length > 0) {
    console.error(`[audit:anchors] Hay ${missing.length} anclajes rotos.`);
    process.exit(1);
  }
}

void main().catch((error) => {
  console.error("[audit:anchors] FALLO:", error instanceof Error ? error.message : error);
  process.exit(1);
});
```

## File: scripts/audits/capture-log-samples.ps1
```powershell
# CAPTURE_LOG_SAMPLES_V1 — arranca el API, hace un request, captura logs.
# Ver: docs/audits/02-observabilidad/roadmap.md §8.

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

$out = "docs/audits/_prep/log-samples.txt"
$correlation = "audit-corr-$(Get-Random -Maximum 99999)"

Write-Host "Arrancando API en background..." -ForegroundColor Cyan
$api = Start-Process -FilePath "pnpm" -ArgumentList "dev" -PassThru -NoNewWindow `
  -RedirectStandardOutput "artifacts/api-stdout.log" `
  -RedirectStandardError "artifacts/api-stderr.log" `
  -ErrorAction SilentlyContinue

Start-Sleep -Seconds 8

try {
  Write-Host "Haciendo request con correlationId=$correlation..." -ForegroundColor Cyan
  Invoke-WebRequest -Uri "http://127.0.0.1:8787/api/health" `
    -Headers @{ "X-Correlation-Id" = $correlation } -UseBasicParsing | Out-Null
  Start-Sleep -Seconds 2
} finally {
  $api.Kill()
}

if (Test-Path "artifacts/api-stdout.log") {
  $matches = Select-String -Path "artifacts/api-stdout.log" -Pattern $correlation
  "=== Líneas con correlationId $correlation ===" | Out-File -FilePath $out -Encoding utf8
  if ($matches) {
    $matches | ForEach-Object { $_.Line } | Out-File -FilePath $out -Append -Encoding utf8
    Write-Host "OK: $($matches.Count) líneas encontradas" -ForegroundColor Green
  } else {
    "FALLO: ninguna línea con el correlationId" | Out-File -FilePath $out -Append -Encoding utf8
    Write-Host "FALLO: el correlationId no se propagó" -ForegroundColor Red
  }
}
```

## File: scripts/audits/check-secret-redaction.ps1
```powershell
# CHECK_SECRET_REDACTION_V1 — verifica que los logs no contienen secretos.
# Ver: docs/audits/02-observabilidad/roadmap.md §8.

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

$out = "docs/audits/_prep/secret-redaction-check.txt"
New-Item -ItemType Directory -Force -Path (Split-Path $out) | Out-Null

$patterns = @(
  "Bearer\s+[A-Za-z0-9_\-\.]{20,}",         # authorization
  "sk-[A-Za-z0-9]{20,}",                    # api key estilo OpenAI
  "AIza[A-Za-z0-9_\-]{30,}",                # api key Google
  '"password"\s*:\s*"[^"]+"',               # password en JSON
  '"token"\s*:\s*"[^"]+"'                   # token en JSON
)

$logs = Get-ChildItem -Path "artifacts" -Recurse -Include "*.log" -ErrorAction SilentlyContinue
if (-not $logs) {
  "=== No hay logs en artifacts/ para analizar ===" | Out-File -FilePath $out -Encoding utf8
  Write-Host "SKIP: no hay logs en artifacts/" -ForegroundColor Yellow
  return
}

$findings = @()
foreach ($log in $logs) {
  foreach ($pattern in $patterns) {
    $hits = Select-String -Path $log.FullName -Pattern $pattern -ErrorAction SilentlyContinue
    if ($hits) {
      $findings += [pscustomobject]@{
        File = $log.Name
        Pattern = $pattern
        Count = $hits.Count
      }
    }
  }
}

"=== Resultado de la verificación de redacción ===" | Out-File -FilePath $out -Encoding utf8
if ($findings.Count -eq 0) {
  "OK: no se han encontrado secretos en claro en los logs." | Out-File -FilePath $out -Append -Encoding utf8
  Write-Host "OK: redacción funciona" -ForegroundColor Green
} else {
  "FALLO: los siguientes archivos contienen posibles secretos:" | Out-File -FilePath $out -Append -Encoding utf8
  $findings | Format-Table -AutoSize | Out-String | Out-File -FilePath $out -Append -Encoding utf8
  Write-Host "FALLO: hay $($findings.Count) hallazgos" -ForegroundColor Red
}
```

## File: scripts/audits/contracts.ts
```typescript
// AUDIT_CONTRACTS_V1 - audita los contratos del dominio contra el codigo real.
//
// Recorre packages/domain/src/*.ts, extrae los schemas Zod y sus tipos
// inferidos, y verifica que cada uno tiene al menos una implementacion real
// en apps/server o apps/web. Si no la tiene, comprueba que esta marcado
// explicitamente como PENDING o STUB.
//
// Uso: pnpm exec tsx scripts/audits/contracts.ts
// Salida: docs/AUDIT_CONTRACTS.md + exit 1 si hay contratos sin implementar
//         y sin marca PENDING.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

interface Contract {
  name: string;
  file: string;
  kind: "schema" | "interface" | "type" | "enum";
  exported: boolean;
  pending: boolean;
  implemented: boolean;
  implementedIn: string[];
}

const DOMAIN_DIR = resolve("packages/domain/src");
const SEARCH_DIRS = ["apps/server/src", "apps/web/src", "packages/catalog"];

async function listFiles(dir: string, ext: string[]): Promise<string[]> {
  const out: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist") continue;
      const full = join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (ext.some((e) => entry.name.endsWith(e))) out.push(full);
    }
  }
  await walk(dir);
  return out;
}

/**
 * Extrae los contratos exportados de un fichero del dominio.
 * Detecta:
 *   export const fooSchema = z.object({...})
 *   export interface Foo {...}
 *   export type Foo = ...
 *   export const FOO = z.enum([...])
 */
function extractContracts(file: string, source: string): Contract[] {
  const out: Contract[] = [];
  const pendingFile = /PENDING|STUB|TODO_IMPLEMENT/i.test(source);

  // Schemas Zod
  const zodSchemaRe = /export\s+const\s+(\w+Schema)\s*=\s*z\./g;
  for (const match of source.matchAll(zodSchemaRe)) {
    out.push({
      name: match[1],
      file,
      kind: "schema",
      exported: true,
      pending: pendingFile || /PENDING|STUB/i.test(source.slice(match.index ?? 0, (match.index ?? 0) + 400)),
      implemented: false,
      implementedIn: [],
    });
  }

  // Interfaces
  const interfaceRe = /export\s+interface\s+(\w+)/g;
  for (const match of source.matchAll(interfaceRe)) {
    const idx = match.index ?? 0;
    out.push({
      name: match[1],
      file,
      kind: "interface",
      exported: true,
      pending: /PENDING|STUB/i.test(source.slice(idx, idx + 400)),
      implemented: false,
      implementedIn: [],
    });
  }

  // Types
  const typeRe = /export\s+type\s+(\w+)\s*=/g;
  for (const match of source.matchAll(typeRe)) {
    const idx = match.index ?? 0;
    out.push({
      name: match[1],
      file,
      kind: "type",
      exported: true,
      pending: /PENDING|STUB/i.test(source.slice(idx, idx + 400)),
      implemented: false,
      implementedIn: [],
    });
  }

  // Zod enum const
  const enumRe = /export\s+const\s+(\w+(?:Types|Enum|_TYPES)?)\s*=\s*z\.enum\(/g;
  for (const match of source.matchAll(enumRe)) {
    if (out.some((c) => c.name === match[1])) continue;
    out.push({
      name: match[1],
      file,
      kind: "enum",
      exported: true,
      pending: false,
      implemented: false,
      implementedIn: [],
    });
  }

  return out;
}

/**
 * Busca un contrato por nombre en los directorios de implementacion.
 * Se considera "implementado" si el nombre aparece en un fichero del
 * servidor o del frontend fuera de comentarios.
 */
async function findImplementation(name: string, sources: Map<string, string>): Promise<string[]> {
  const found: string[] = [];
  const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
  for (const [file, source] of sources) {
    // Excluir lineas de comentario puro para no confundir.
    const lines = source.split("\n").filter((l) => !/^\s*(\/\/|\*)/.test(l));
    if (lines.some((l) => pattern.test(l))) found.push(file);
  }
  return found;
}

async function main(): Promise<void> {
  console.log("[audit:contracts] Recorriendo dominios...");

  const domainFiles = await listFiles(DOMAIN_DIR, [".ts"]);
  const contracts: Contract[] = [];
  for (const file of domainFiles) {
    const source = await readFile(file, "utf8");
    contracts.push(...extractContracts(file, source));
  }

  console.log(`[audit:contracts] Contratos encontrados: ${contracts.length}`);

  console.log("[audit:contracts] Cargando implementaciones...");
  const implSources = new Map<string, string>();
  for (const dir of SEARCH_DIRS) {
    const files = await listFiles(dir, [".ts", ".tsx"]);
    for (const file of files) {
      implSources.set(file, await readFile(file, "utf8"));
    }
  }
  console.log(`[audit:contracts] Ficheros de implementacion: ${implSources.size}`);

  console.log("[audit:contracts] Buscando implementaciones...");
  for (const contract of contracts) {
    const hits = await findImplementation(contract.name, implSources);
    contract.implemented = hits.length > 0;
    contract.implementedIn = hits.slice(0, 5);
  }

  // Informe
  const missing = contracts.filter((c) => !c.implemented && !c.pending);
  const ok = contracts.filter((c) => c.implemented);
  const pending = contracts.filter((c) => c.pending && !c.implemented);

  const lines: string[] = [
    "# Auditoria de contratos del dominio",
    "",
    `> Generado por \`scripts/audits/contracts.ts\` el ${new Date().toISOString()}.`,
    "",
    `- Contratos totales: **${contracts.length}**`,
    `- Con implementacion real: **${ok.length}**`,
    `- Marcados PENDING o STUB: **${pending.length}**`,
    `- Sin implementacion y sin marca: **${missing.length}** (esto es lo que hay que arreglar)`,
    "",
  ];

  if (missing.length > 0) {
    lines.push("## Sin implementacion y sin marca PENDING");
    lines.push("");
    lines.push("| Contrato | Fichero | Tipo |");
    lines.push("|---|---|---|");
    for (const c of missing.sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(`| \`${c.name}\` | \`${c.file}\` | ${c.kind} |`);
    }
    lines.push("");
  }

  if (pending.length > 0) {
    lines.push("## Marcados PENDING o STUB");
    lines.push("");
    lines.push("| Contrato | Fichero | Tipo |");
    lines.push("|---|---|---|");
    for (const c of pending.sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(`| \`${c.name}\` | \`${c.file}\` | ${c.kind} |`);
    }
    lines.push("");
  }

  lines.push("## Con implementacion real");
  lines.push("");
  lines.push("| Contrato | Fichero | Implementado en |");
  lines.push("|---|---|---|");
  for (const c of ok.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 300)) {
    const where = c.implementedIn.map((f) => `\`${f}\``).join(", ") || "-";
    lines.push(`| \`${c.name}\` | \`${c.file}\` | ${where} |`);
  }
  lines.push("");

  if (!(await safeMkdir("docs"))) return;
  await writeFile("docs/AUDIT_CONTRACTS.md", lines.join("\n"), "utf8");
  console.log(`[audit:contracts] Informe escrito en docs/AUDIT_CONTRACTS.md`);
  console.log(`[audit:contracts] OK: ${ok.length}   PENDING: ${pending.length}   HUERFANOS: ${missing.length}`);

  if (missing.length > 0) {
    console.error(`[audit:contracts] Hay ${missing.length} contratos sin implementar y sin marca PENDING.`);
    process.exit(1);
  }
}

async function safeMkdir(dir: string): Promise<boolean> {
  try {
    await readdir(dir);
    return true;
  } catch {
    try {
      const { mkdir } = await import("node:fs/promises");
      await mkdir(dir, { recursive: true });
      return true;
    } catch {
      return false;
    }
  }
}

void main().catch((error) => {
  console.error("[audit:contracts] FALLO:", error instanceof Error ? error.message : error);
  process.exit(1);
});
```

## File: scripts/audits/find-hanging-before.ps1
```powershell
# FIND_HANGING_BEFORE_V1 — localiza los tests cuyo `before` se cuelga.
# Ejecuta cada archivo de tests por separado con timeout de 10s.
# Los que salen por timeout son candidatos.
# Salida: docs/audits/_prep/hanging-before.txt

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

$out = "docs/audits/_prep/hanging-before.txt"
New-Item -ItemType Directory -Force -Path (Split-Path $out) | Out-Null

$files = Get-ChildItem tests -Filter "*.test.ts" -File
$hanging = @()

"# Tests que superan 10s (candidatos a before colgado)" | Out-File -FilePath $out -Encoding utf8
"# Generado: $(Get-Date -Format o)" | Out-File -FilePath $out -Append -Encoding utf8

foreach ($f in $files) {
  $start = Get-Date
  $proc = Start-Process -FilePath "pnpm" -ArgumentList "exec","tsx","--test","--test-timeout=10000",$f.FullName -PassThru -NoNewWindow -RedirectStandardOutput "NUL" -RedirectStandardError "NUL"
  $done = $proc.WaitForExit(15000)
  if (-not $done) {
    $proc.Kill()
    $hanging += $f.Name
    "$($f.Name) — TIMEOUT >15s" | Out-File -FilePath $out -Append -Encoding utf8
    Write-Host "HANG: $($f.Name)" -ForegroundColor Red
  } else {
    $elapsed = ((Get-Date) - $start).TotalSeconds
    if ($elapsed -gt 8) {
      "$($f.Name) — lento: $([math]::Round($elapsed,1))s" | Out-File -FilePath $out -Append -Encoding utf8
      Write-Host "SLOW: $($f.Name) $([math]::Round($elapsed,1))s" -ForegroundColor Yellow
    }
  }
}

"" | Out-File -FilePath $out -Append -Encoding utf8
"Total candidatos: $($hanging.Count)" | Out-File -FilePath $out -Append -Encoding utf8
Write-Host "Informe: $out" -ForegroundColor Green
```

## File: scripts/audits/idempotency.ts
```typescript
// AUDIT_IDEMPOTENCY_V1 - audita las marcas de idempotencia del repo.
//
// Recorre apps/server/src, apps/web/src, packages y scripts buscando
// comentarios con forma de marca (XXX_V1, XXX_V2, XXX_V3) y comprueba
// que la marca no esta huerfana: que el simbolo que menciona existe en
// el fichero, o que el comentario no esta solo en una cabecera sin
// implementacion real.
//
// Detecta dos categorias:
//   1. Marcas duplicadas: dos ficheros con la misma marca y contenido
//      distinto (el caso tool-executors.ts vs worker.ts).
//   2. Marcas huerfanas: una marca en cabecera sin codigo real debajo.
//
// Uso: pnpm exec tsx scripts/audits/idempotency.ts
// Salida: docs/AUDIT_IDEMPOTENCY.md + exit 1 si hay huerfanas.

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";

interface Mark {
  name: string;
  file: string;
  line: number;
  contextLines: number;
  bodyHash: string;
}

const SEARCH_DIRS = ["apps/server/src", "apps/web/src", "packages", "scripts"];
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "artifacts", "backups", ".openmuse", "audits"]);

const MARK_RE = /\b([A-Z][A-Z0-9_]{2,}_V\d+)\b/;

async function listFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
      if (entry.name.startsWith(".")) continue;
      const full = join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
    }
  }
  await walk(dir);
  return out;
}

/**
 * Extrae las marcas de un fichero. Una marca cuenta como "real" si esta en
 * una linea de comentario seguida de al menos 10 lineas de codigo no
 * comentado en las 100 lineas siguientes.
 */
function extractMarks(file: string, source: string): Mark[] {
  const lines = source.split("\n");
  const out: Mark[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(MARK_RE);
    if (!m) continue;
    // Solo cuenta si es comentario.
    const trimmed = lines[i].trim();
    if (!trimmed.startsWith("//") && !trimmed.startsWith("*") && !trimmed.startsWith("/*")) continue;

    // Medir codigo real en las siguientes 100 lineas.
    let realLines = 0;
    const max = Math.min(i + 100, lines.length);
    for (let j = i + 1; j < max && realLines < 20; j++) {
      const l = lines[j].trim();
      if (!l) continue;
      if (l.startsWith("//") || l.startsWith("*") || l.startsWith("/*")) continue;
      realLines++;
    }
    const bodySource = lines.slice(i + 1, i + 30).join("\n").trim();
    out.push({
      name: m[1],
      file,
      line: i + 1,
      contextLines: realLines,
      bodyHash: createHash("sha256").update(bodySource).digest("hex").slice(0, 16),
    });
  }
  return out;
}

async function main(): Promise<void> {
  console.log("[audit:idempotency] Recorriendo ficheros...");
  const files: string[] = [];
  for (const dir of SEARCH_DIRS) {
    files.push(...(await listFiles(dir)));
  }
  console.log(`[audit:idempotency] Ficheros: ${files.length}`);

  const marks: Mark[] = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    marks.push(...extractMarks(file, source));
  }
  console.log(`[audit:idempotency] Marcas encontradas: ${marks.length}`);

  // 1. Marcas duplicadas con body distinto.
  const byName = new Map<string, Mark[]>();
  for (const m of marks) {
    const list = byName.get(m.name) ?? [];
    list.push(m);
    byName.set(m.name, list);
  }
  const duplicatesWithConflict: Array<{ name: string; marks: Mark[] }> = [];
  for (const [name, list] of byName) {
    if (list.length < 2) continue;
    const hashes = new Set(list.map((m) => m.bodyHash));
    if (hashes.size > 1) duplicatesWithConflict.push({ name, marks: list });
  }

  // 2. Marcas huerfanas (menos de 3 lineas de codigo real).
  const orphan: Mark[] = marks.filter((m) => m.contextLines < 3);

  // 3. Marcas repetidas en el mismo fichero (probable doble aplicacion).
  const sameFileDup: Array<{ file: string; name: string; count: number }> = [];
  const fileMap = new Map<string, Map<string, number>>();
  for (const m of marks) {
    const inner = fileMap.get(m.file) ?? new Map<string, number>();
    inner.set(m.name, (inner.get(m.name) ?? 0) + 1);
    fileMap.set(m.file, inner);
  }
  for (const [file, inner] of fileMap) {
    for (const [name, count] of inner) {
      if (count > 1) sameFileDup.push({ file, name, count });
    }
  }

  // Informe
  const lines: string[] = [
    "# Auditoria de idempotencia",
    "",
    `> Generado por \`scripts/audits/idempotency.ts\` el ${new Date().toISOString()}.`,
    "",
    `- Ficheros revisados: **${files.length}**`,
    `- Marcas encontradas: **${marks.length}**`,
    `- Marcas unicas: **${byName.size}**`,
    `- Marcas duplicadas con cuerpo distinto: **${duplicatesWithConflict.length}**`,
    `- Marcas huerfanas (sin codigo real debajo): **${orphan.length}**`,
    `- Marcas repetidas en el mismo fichero: **${sameFileDup.length}**`,
    "",
  ];

  if (duplicatesWithConflict.length > 0) {
    lines.push("## Duplicadas con cuerpo distinto");
    lines.push("");
    lines.push("La misma marca aparece en varios sitios con contenido distinto. Una de las dos aplicaciones puede ser erronea.");
    lines.push("");
    lines.push("| Marca | Fichero:linea | Hash cuerpo |");
    lines.push("|---|---|---|");
    for (const { name, marks: list } of duplicatesWithConflict) {
      for (const m of list) {
        lines.push(`| \`${name}\` | \`${m.file}:${m.line}\` | ${m.bodyHash} |`);
      }
    }
    lines.push("");
  }

  if (orphan.length > 0) {
    lines.push("## Huerfanas");
    lines.push("");
    lines.push("La marca aparece en un comentario pero debajo no hay codigo real. Probable marca puesta a mano sin aplicar el bloque.");
    lines.push("");
    lines.push("| Marca | Fichero:linea | Lineas de codigo |");
    lines.push("|---|---|---|");
    for (const m of orphan.slice(0, 200)) {
      lines.push(`| \`${m.name}\` | \`${m.file}:${m.line}\` | ${m.contextLines} |`);
    }
    lines.push("");
  }

  if (sameFileDup.length > 0) {
    lines.push("## Repetidas en el mismo fichero");
    lines.push("");
    lines.push("La misma marca aparece dos veces en el mismo fichero. Probable bloque aplicado dos veces.");
    lines.push("");
    lines.push("| Marca | Fichero | Veces |");
    lines.push("|---|---|---|");
    for (const d of sameFileDup.slice(0, 200)) {
      lines.push(`| \`${d.name}\` | \`${d.file}\` | ${d.count} |`);
    }
    lines.push("");
  }

  await mkdir("docs", { recursive: true });
  await writeFile("docs/AUDIT_IDEMPOTENCY.md", lines.join("\n"), "utf8");
  console.log("[audit:idempotency] Informe escrito en docs/AUDIT_IDEMPOTENCY.md");
  console.log(
    `[audit:idempotency] DUPLICADAS: ${duplicatesWithConflict.length}   HUERFANAS: ${orphan.length}   REPETIDAS: ${sameFileDup.length}`,
  );

  const fatal = duplicatesWithConflict.length > 0 || sameFileDup.length > 0;
  if (fatal) {
    console.error("[audit:idempotency] Hay marcas conflictivas o repetidas.");
    process.exit(1);
  }
}

void main().catch((error) => {
  console.error("[audit:idempotency] FALLO:", error instanceof Error ? error.message : error);
  process.exit(1);
});
```

## File: scripts/audits/test-coverage-report.ps1
```powershell
# TEST_COVERAGE_REPORT_V1 — % de cobertura por bloque de la campaña.
# Los 6 módulos críticos del roadmap 01: worker, service, actions,
# kernel, rag, tenant. Este script los mide.

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

Write-Host "Corriendo pnpm test:coverage..." -ForegroundColor Cyan
pnpm test:coverage 2>&1 | Out-Host

$summary = "coverage/coverage-summary.json"
if (-not (Test-Path $summary)) {
  Write-Host "FALLO: no hay $summary. ¿Instalaste c8?" -ForegroundColor Red
  return
}

$data = Get-Content $summary -Raw | ConvertFrom-Json

$critical = @{
  "worker.ts"   = "apps/server/src/engine/worker.ts"
  "service.ts"  = "apps/server/src/engine/service.ts"
  "actions.ts"  = "apps/server/src/actions.ts"
  "kernel/*"    = "apps/server/src/kernel/"
  "rag.ts"      = "apps/server/src/engine/rag.ts"
  "tenant.ts"   = "apps/server/src/engine/tenant.ts"
}

Write-Host "`n=== Cobertura por módulo crítico ===" -ForegroundColor Cyan
foreach ($name in $critical.Keys) {
  $path = $critical[$name]
  $matches = $data.PSObject.Properties | Where-Object { $_.Name -like "*$path*" }
  if ($matches) {
    $sum = $matches | ForEach-Object { $_.Value.lines.pct } | Measure-Object -Average
    $pct = [math]::Round($sum.Average, 1)
    $color = if ($pct -ge 50) { "Green" } else { "Yellow" }
    Write-Host ("  {0,-15} {1,6}%" -f $name, $pct) -ForegroundColor $color
  } else {
    Write-Host ("  {0,-15} sin datos" -f $name) -ForegroundColor DarkGray
  }
}
```

## File: scripts/audits/tenant-default.ts
```typescript
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

interface Hit {
  file: string;
  line: number;
  snippet: string;
  allowed: boolean;
  reason: string;
}

const SEARCH_DIRS = ["apps/server/src", "apps/web/src", "packages/domain/src", "scripts"];
const SKIP_DIRS = new Set([
  "node_modules", "dist", ".git", "artifacts", "backups", ".openmuse",
  "audits", "e2e", "load",
]);

const ALLOWED_FILES = [
  "apps/server/src/engine/tenant.ts",
  "apps/server/src/files.ts",
  "apps/server/src/kernel-routes.ts",
  "apps/server/src/db-rls.ts",
  "apps/server/src/admin-routes.ts",
  "apps/server/src/gmb-routes.ts",
  "apps/server/src/notification-prefs.ts",
  "apps/server/src/engine/business/graph.ts",
  "apps/server/src/engine/form-builder.ts",
  "apps/server/src/engine/guardrails/service.ts",
  "apps/server/src/engine/orchestrator/orchestrator.ts",
  "apps/server/src/engine/service.ts",
  "apps/server/src/engine/sop-executor.ts",
  "apps/server/src/engine/model.ts",
  "apps/server/src/engine/conversation.ts",
  "apps/server/src/engine/workspace/generator.ts",
  "apps/server/src/kernel/tenancy/default-resolver.ts",
  "scripts/backfill-task-tenant.ts",
  "scripts/migrate-tenant-id.ts",
  "scripts/migrate-tenant-scope.ts",
  "scripts/seed-business-schema.ts",
  "scripts/seed-sops-agency.ts",
];

async function listFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
      if (entry.name.startsWith(".")) continue;
      const full = join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
    }
  }
  await walk(dir);
  return out;
}

function isAllowed(file: string, line: string): { allowed: boolean; reason: string } {
  const normalized = file.split("\\").join("/");
  for (const allowed of ALLOWED_FILES) {
    if (normalized.endsWith(allowed)) return { allowed: true, reason: "fichero permitido" };
  }
  const trimmed = line.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
    return { allowed: true, reason: "comentario" };
  }
  if (/cursor:\s*["']default["']/.test(line)) return { allowed: true, reason: "css cursor" };
  if (/FALLBACK_TENANT_V1/.test(line)) return { allowed: true, reason: "fallback marcado" };
  return { allowed: false, reason: "ocurrencia fuera de contexto" };
}

async function main(): Promise<void> {
  console.log("[audit:tenant-default] Recorriendo ficheros...");
  const files: string[] = [];
  for (const dir of SEARCH_DIRS) files.push(...(await listFiles(dir)));
  console.log("[audit:tenant-default] Ficheros: " + files.length);

  const hits: Hit[] = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const lines = source.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hasDefault = line.indexOf("\u0027default\u0027") >= 0 || line.indexOf("\u0022default\u0022") >= 0;
      if (!hasDefault) continue;
      const { allowed, reason } = isAllowed(file, line);
      hits.push({ file, line: i + 1, snippet: line.trim().slice(0, 180), allowed, reason });
    }
  }

  // TENANT_DEFAULT_AUDIT_V2 — verificado como parte del bloque 07.
  // Ver: docs/audits/07-aislamiento-multi-tenant/roadmap.md §8.
  const forbidden = hits.filter((h) => !h.allowed);
  const report: string[] = [
    "# Auditoria de default hardcodeado",
    "",
    "> Generado por scripts/audits/tenant-default.ts el " + new Date().toISOString(),
    "",
    "- Ficheros revisados: **" + files.length + "**",
    "- Ocurrencias totales: **" + hits.length + "**",
    "- Permitidas: **" + (hits.length - forbidden.length) + "**",
    "- Prohibidas: **" + forbidden.length + "**",
    "",
  ];
  if (forbidden.length > 0) {
    report.push("## Prohibidas");
    report.push("");
    report.push("| Fichero | Linea | Snippet |");
    report.push("|---|---|---|");
    for (const h of forbidden) {
      const safe = h.snippet.split("|").join("\\|");
      report.push("| " + h.file + " | " + h.line + " | " + safe + " |");
    }
  }
  await mkdir("docs", { recursive: true });
  await writeFile("docs/AUDIT_TENANT_DEFAULT.md", report.join("\n"), "utf8");
  console.log("[audit:tenant-default] Informe en docs/AUDIT_TENANT_DEFAULT.md");
  console.log(
    "[audit:tenant-default] PERMITIDAS: " +
      (hits.length - forbidden.length) +
      "   PROHIBIDAS: " +
      forbidden.length,
  );
  if (forbidden.length > 0) process.exit(1);
}

void main().catch((error) => {
  console.error("[audit:tenant-default] FALLO:", error instanceof Error ? error.message : error);
  process.exit(1);
});
```
