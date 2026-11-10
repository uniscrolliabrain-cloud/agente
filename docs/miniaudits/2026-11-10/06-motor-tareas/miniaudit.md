# Bloque 06 · Motor de tareas

> Campaña UX · 2026-11-10 · **14 hallazgos** (S0 1 · S1 4 · S2 6 · S3 3)
> Estado: informe recibido. Validación: parcial.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S0 | El timeout reencola en lugar de fallar (mismo defecto que 04-01). | **Confirmado**: ver 04-01; no hay techo de `attempts` en el reencolado. |
| 2 | S1 | `db.put("worker-status")` en cada tick: ~86.400 escrituras diarias por instancia. | Sin verificar |
| 3 | S1 | `perOwnerCount` se calcula por lote, no sobre las tareas activas. | Sin verificar |
| 4 | S1 | El tick sólo considera 20 tareas (`break` en 20) con `maxActive = 50`. | Sin verificar |
| 5 | S1 | Sin `scanByStatusWithTenant`, `tenantId` es null y se ejecuta sin scope: tarea de una empresa con el scope de otra. | **Ya arreglado**: `db-tenant.ts:164` implementa `scanByStatusWithTenant` y el comentario de `:202` documenta que antes se llamaba al `scanByStatus` crudo. |
| 6 | S2 | Sin retry por tarea ni backoff; `attempts` no tiene techo. | Sin verificar |
| 7 | S2 | Un fallo de DB en el heartbeat aborta el handler y reencola con el lease válido. | Sin verificar |
| 8 | S2 | `guard()` cachea 100 ms: una tool puede ejecutarse con el lease ya robado. | Sin verificar |
| 9 | S2 | `recentEvents` guarda 100 en memoria y 64 en disco: duplicados tras reinicio. | Sin verificar |
| 10 | S2 | Una transición ilegal se registra, pero el checkpoint ya escribió el estado nuevo. | Sin verificar |
| 11 | S2 | `stop()` con drain de 10 s deja handlers vivos. | Sin verificar |
| 12 | S3 | `running` se deriva de `Boolean(timer)` y oscila dentro del tick. | Sin verificar |
| 13 | S3 | Sin métrica de antigüedad de cola. | Sin verificar |
| 14 | S3 | DLQ con retención de 90 días y ninguna revisión. | Sin verificar |

## Arreglos propuestos

1. **Cerrar el S0 junto con 04-01**: techo de intentos, `failed` terminal y entrada en DLQ. Es el mismo arreglo y debe hacerse una vez.
2. **Estado del worker fuera del tick caliente.** `worker-status` cada 30 s o por cambio, no por vuelta; y `running` como campo, no como `Boolean(timer)`.
3. **Tamaño del tick = `maxActive`.** Procesar 20 con capacidad 50 deja 30 huecos muertos en cada vuelta.
4. **Conteo por owner sobre lo activo**, no sobre el lote aceptado.
5. **Antigüedad de cola como métrica** (p50/p95): es el indicador que dice si el motor va sobrado o ahogado.

## Plan

- **P1 (S0)**: techo de intentos + DLQ + test de timeout.
- **P2 (coste)**: `worker-status` por intervalo, tick a `maxActive`, `perOwnerCount` correcto.
- **P3 (señal)**: métrica de antigüedad y revisión de DLQ con retención explícita.

---

## Revisión de destino

El motor es el que hace "durables" las tareas y el que alimenta el ciclo del Business OS. Además de los arreglos listados, faltan:

- **Cierre del ciclo**: una tarea que agota intentos debe terminar en `failed` y en DLQ, no volver a la cola.
- Métrica de **antigüedad de cola** para saber si el motor va sobrado (la necesita Fase 2).
- Estado `running` como dato, no como `Boolean(timer)`.

## Conclusión

Comparte el S0 con resiliencia: es el mismo arreglo y debe hacerse una vez. Sin techo de intentos, el motor no puede prometer durabilidad, y sin antigüedad de cola no se puede operar. **P0** el techo; **P1** el resto.
