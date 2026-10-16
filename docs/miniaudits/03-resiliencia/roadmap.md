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
