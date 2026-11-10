# Bloque 05 · Multi-usuario

> Campaña UX · 2026-11-10 · **11 hallazgos** (S0 0 · S1 4 · S2 4 · S3 3)
> Estado: informe recibido. Validación: parcial.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | Todos los límites son por proceso: N máquinas multiplican el techo por N. | Sin verificar |
| 2 | S1 | Cinco `RateLimiter` con ventanas y claves distintas, más uno creado por llamada en `service.ts:1266`. | Sin verificar |
| 3 | S1 | `checkTaskCreation(tenantId, 0)` en el orquestador: la cuota de goals nunca bloquea. | **Confirmado**: `orchestrator.ts:82` pasa `0` literal. |
| 4 | S1 | `MAX_PER_OWNER` cuenta sólo lo aceptado en el tick, no lo activo: un owner puede ocupar las 50. | Sin verificar |
| 5 | S2 | `DEFAULT_QUOTA.tasksActive = 10.000` frente a 500/h y `maxActive = 50`. | Sin verificar |
| 6 | S2 | No existe `maxConcurrent` (0 coincidencias) ni cuota de concurrencia por tenant. | Sin verificar |
| 7 | S2 | El tick corta en 20 tareas aunque haya 50 huecos. | Sin verificar |
| 8 | S2 | `checkTokens`, `checkCost` y `checkSpeedQuota` no se llaman en el camino de goal. | Sin verificar |
| 9 | S3 | Ventana fija, no deslizante: 500 llamadas al segundo 1 y 500 al 3601. | Sin verificar |
| 10 | S3 | `prune()` por `maxKeys` expulsa buckets legítimos bajo flood de claves. | Sin verificar |
| 11 | S3 | 121 `"default"` y ninguna prueba de dos tenants compitiendo. | Sin verificar |

## Arreglos propuestos

1. **Un solo limitador por dimensión.** Un `RateLimiter` para llamadas, uno para tokens, uno para coste; con la misma clave (`tenantId`) y la misma ventana. Cinco ventanas distintas no son cinco defensas, son cinco formas de no saber cuál actúa.
2. **Cuota con número real.** `checkTaskCreation(tenantId, activasReales)`: el `0` convierte la cuota en decorativa.
3. **`maxConcurrent` por tenant** (no existe hoy) y contabilidad de lo activo, no de lo aceptado en el tick.
4. **Límites compartidos entre instancias** (Redis o tabla con CAS). Mientras sean `Map` en memoria, el techo real es `N × límite`.
5. **Test de dos tenants compitiendo** por la misma cuota: hoy no hay ninguno.

## Plan

- **P1 (cuota real)**: `checkTaskCreation` con conteo activo + `maxConcurrent` + test de competencia.
- **P2 (unificar)**: consolidar los cinco limitadores y hacer que el de `service.ts:1266` no se cree por llamada.
- **P3 (distribuido)**: almacén compartido de cuotas; ventana deslizante.

---

## Revisión de destino

Los guardrails son parte del producto (coste por cliente), no un extra. Faltan arreglos que el informe deja implícitos:

- **Cuotas compartidas entre instancias**: mientras sean `Map` en memoria, el techo real es `N × límite` y el cliente paga la diferencia.
- Cuota de **concurrencia** por tenant (`maxConcurrent` no existe) además de la de creación.
- Un test de dos tenants compitiendo por la misma cuota, que hoy no hay.

## Conclusión

Con una sola máquina el defecto es invisible; en cuanto haya dos procesos, el límite deja de existir. **P1**, pero se vuelve **P0** el día que el cliente tenga más de una instancia o un pico de uso.
