# Bloque 04 · Resiliencia

> Campaña UX · 2026-11-10 · **14 hallazgos** (S0 1 · S1 4 · S2 7 · S3 2)
> Estado: informe recibido. Validación: parcial.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S0 | Un timeout de tarea se reencola sin límite: `attempts` no se compara con ningún máximo y nunca llega a DLQ. | **Confirmado**: no hay comparación de `attempts` contra techo en la ruta del worker; `maxAttempts` sólo existe en `retry.ts`/`executor.ts`, no en el reencolado. |
| 2 | S1 | El worker falla a la primera: `defaultIsRetryable` se importa y no se usa en el `catch`. | Sin verificar |
| 3 | S1 | `CircuitBreaker.call()` cuenta también los 4xx: cinco validaciones abren el circuito 30 s. | Sin verificar |
| 4 | S1 | El circuito abierto sólo deja `logWarn`; `circuitOpenCount` es constante 0. | Sin verificar |
| 5 | S1 | El circuito es un `Map` por proceso: dos máquinas, dos circuitos; un reinicio lo resetea. | Sin verificar |
| 6 | S2 | `half-open` no tiene temporizador: sólo avanza cuando llega otra llamada. | Sin verificar |
| 7 | S2 | Jitter completo puede dar 0 ms y sincronizar los reintentos. | Sin verificar |
| 8 | S2 | `maxTotalTimeMs` se evalúa al inicio de cada intento: una operación de 300 s no se corta. | Sin verificar |
| 9 | S2 | `retryWithBackoff` en 3 sitios (Google, embeddings, computer); no en bus, worker, modelo ni rutas. | Confirmado en parte: `files.ts:163` lo usa para embeddings. |
| 10 | S2 | DLQ sin drenaje, sin revisión y con alerta alimentada por 0. | Sin verificar |
| 11 | S2 | `resetForRequeue` no borra `dl-<taskId>`: duplicados lógicos. | Sin verificar |
| 12 | S2 | El drain de 10 s deja handlers vivos escribiendo tras `stop()`. | Sin verificar |
| 13 | S3 | `clearInterval` sobre un timer creado con `setTimeout`. | Sin verificar |
| 14 | S3 | Sin presupuesto de reintentos por tenant. | Sin verificar |

## Arreglos propuestos

1. **Techo de intentos (S0).** `attempts < TASK_MAX_ATTEMPTS` antes de reencolar; al superarlo, `failed` + entrada en DLQ + evento. Sin esto, un timeout es un bucle infinito de trabajo.
2. **Reintento tipado.** Usar `defaultIsRetryable` en el `catch` del worker: un 4xx no se reintenta, un 5xx sí.
3. **El circuito no se abre con 4xx.** Clasificar por status antes de contar; y `circuitOpenCount` debe ser una métrica de verdad (hoy es 0 por construcción).
4. **Presupuesto de tiempo total.** Comparar contra el reloj al empezar y al terminar cada intento; un `maxTotalTimeMs` que sólo se mira al principio no acota nada.
5. **DLQ con dueño.** Alerta que se alimente del tamaño real, drenaje documentado y `resetForRequeue` que borre la entrada de DLQ.

## Plan

- **P1 (S0)**: techo de intentos + DLQ. Test que demuestre que un timeout acaba en `failed` y no se reencola.
- **P2 (circuitos)**: 4xx fuera del conteo, métrica real, half-open por temporizador.
- **P3 (presupuesto)**: tiempo total por operación y por tenant; `retryWithBackoff` en el bus y el worker.

---

## Revisión de destino

"Tareas durables que sobreviven reinicios" es un diferencial declarado del producto, y el S0 de este bloque lo rompe: un timeout que se reencola sin techo convierte una tarea en un bucle de coste. Falta además:

- **Presupuesto de reintentos por tenant**, no sólo por operación: el coste lo paga el cliente.
- DLQ con drenaje y revisión, o no es una DLQ.
- Distinguir error transitorio de permanente en el `catch` del worker (usa `defaultIsRetryable`).

## Conclusión

Es el bloque con más impacto por línea de código: dos arreglos (techo de intentos y clasificación del error) cambian el comportamiento del motor de tareas. **P0** el S0 y el reintento tipado; el resto, P1.
