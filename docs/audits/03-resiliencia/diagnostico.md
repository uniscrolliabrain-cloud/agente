# Diagnóstico — 03 resiliencia

> v1 · 2026-10-05 · Estado: audited
> Fuente: repomix-bloque03 (worker.ts, model-chain.ts, retry.ts, circuit-breaker.ts, dead-letter.ts, service.ts, index.ts, computer.ts, google-auth.ts, bus.ts, app.ts).

## Estado actual del código

**Ya funciona:**
- TaskWorker con lease CAS, heartbeat, AbortSignal propagado.
- `retryWithBackoff` con full jitter y clasificación de errores.
- `CircuitBreaker` con 3 estados (closed/open/half-open).
- `DeadLetterQueue` con enqueue idempotente.
- `recoverInterruptedTasks` y `recoverInterruptedActions` al arrancar.

## Huecos del miniaudit — verificación real

| # | Hueco | Estado | Evidencia |
|---|-------|--------|-----------|
| B1 | Retry sin jitter en model-chain | **FALSO** | model-chain no reintenta; retry.ts usa full jitter |
| B2 | firstByte timeout 45s fijo | **CONFIRMADO** | model-chain.ts:96 |
| B3 | Circuit por spec, no provider | **FALSO** | ya agrupa por provider (CB_PER_PROVIDER_V1) |
| B4 | recoverInterruptedTasks sin lock | **CONFIRMADO** | service.ts:302 sin CAS de claim |
| B5 | Shutdown sin timeout | **CONFIRMADO** | worker.ts:112 |
| B6 | child.kill sin waitpid | **FALSO** | close handler resuelve correctamente |
| B7 | Sin alerta cuando circuit abre | **CONFIRMADO** | circuit-breaker.ts no notifica |
| B8 | guard cache 500ms | **CONFIRMADO** | worker.ts:159 |
| B9 | Sin retry selectivo por tool | **FALSO** | defaultIsRetryable cubre el caso |
| B10 | DLQ sin TTL | **CONFIRMADO** | purgeTargets no incluye dead-letter |
| B11 | outcome_unknown sin reconciliación | **PARCIAL** | maintain marca executing > 10min |
| B12 | Sin bulkhead por provider | **CONFIRMADO** | model-chain sin contador |
| B13 | google timeout hardcoded | **CONFIRMADO** | google-auth.ts usa 15000 |
| B14 | Webhook sin retry | **CONFIRMADO** | app.ts:248 sin retry |
| B15 | shutdown sin drain | **CONFIRMADO** | index.ts:220 |
| B16 | Sin graceful degradation | **CONFIRMADO** | conversation.ts sin mensaje humano |
| B17 | recoverInterruptedActions solo al arrancar | **CONFIRMADO** | index.ts:16 |
| B18 | Files.import sin retry | **CONFIRMADO** | files.ts |
| B19 | retry sin maxTotalTimeMs | **CONFIRMADO** | retry.ts no tiene tope |
| B20 | Test "proveedor caído 5min" | **DIFERIDO** | va al bloque 01 |

## Problemas nuevos detectados

### Graves
- **N1** — El circuit breaker nunca se abre porque `circuit.call()` no se llama en model-chain. Solo se consulta `getState()`. Ningún fallo llega al contador.
- **N20** — `recoverInterruptedTasks` corre en paralelo con `agent.start()`. Carrera real: el worker puede reclamar tareas antes de que recover las vea.
- **N29** — `CircuitBreaker.onFailure()` no distingue error transitorio de error de negocio. 5 errores 4xx abren el circuit.

### Medios
- **N2** — Timers de `firstByteTimeout` no se limpian al abortar el stream.
- **N16** — Listeners de AbortSignal se acumulan en `retryWithBackoff` tras resolve.
- **N21** — `result.status` del handler no se valida antes de `checkpoint`.
- **N8** — `recoverInterruptedTasks` procesa hasta 5000 tareas secuencialmente.

### Menores / aceptados
N3, N4, N5, N6, N7, N9, N10, N11, N12, N13, N14, N15, N17, N18, N19, N22, N23, N24, N25, N26, N27, N28, N30.

## Fixes aplicados en este bloque

22 fixes en scripts/fixes/bloque-03.ps1. Marcas:

- 03-B1 firstByte configurable
- 03-B2 recoverInterruptedTasks con CAS
- 03-B3 worker.stop con timeout
- 03-B4 alerta en circuit open
- 03-B5 guard cache 100ms
- 03-B6 DLQ purge 90d
- 03-B7 reconcile endpoint + STUCK_MS 5min
- 03-B8 bulkhead por provider
- 03-B9 google timeout config
- 03-B10 webhook retry
- 03-B11 shutdown drain timeout
- 03-B12 Files.import retry
- 03-B13 retry maxTotalTimeMs
- 03-B14 graceful degradation chat
- 03-B15 recoverInterruptedActions en maintain
- 03-C1 circuit recibe fallos reales
- 03-C2 recover antes de start
- 03-C3 circuit ignora 4xx
- 03-C4 firstByte timer limpia al abort
- 03-C5 retry signal listeners
- 03-C6 validar result.status
- 03-C7 recover paralelo por lotes