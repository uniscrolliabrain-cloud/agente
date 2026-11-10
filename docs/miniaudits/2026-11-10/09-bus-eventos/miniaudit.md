# Bloque 09 · Bus de eventos

> Campaña UX · 2026-11-10 · **15 hallazgos** (S0 0 · S1 5 · S2 7 · S3 3)
> Estado: informe recibido. Validación pendiente.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | Un tipo fuera de `payloadSchemas` lanza `TypeError` y se convierte en `persisted: false` silencioso. | Sin verificar (el import de `payloadSchemas` está en `bus.ts:7` y se indexa en `:96`) |
| 2 | S1 | `globalSubscribers` es de módulo: el bus no entrega a otra máquina. | Sin verificar |
| 3 | S1 | Un subscriber que lanza cuenta como entregado; `delivered` mide llamadas, no éxito. | Sin verificar |
| 4 | S1 | `replayTenant`, `replayEvents` y `snapshotBus` no tienen llamadores. | Sin verificar |
| 5 | S1 | Los dos replays entregan en orden opuesto: uno ascendente y otro con `ORDER BY ... DESC` sin invertir. | Sin verificar |
| 6 | S2 | Los exporters de OTel y Kafka son interfaces vacías. | Sin verificar |
| 7 | S2 | La caché negativa del dedupe se lee y nunca se escribe. | Sin verificar |
| 8 | S2 | El dedupe se registra después de publicar: un reintento republica. | Sin verificar |
| 9 | S2 | La caché en memoria tiene 64 entradas globales para todos los tenants. | Sin verificar |
| 10 | S2 | `resolveTenant` cae al id del owner. | Sin verificar (cruce con 08) |
| 11 | S2 | Dos eventos con la misma `notify.key` producen una sola notificación. | Sin verificar |
| 12 | S2 | `snapshotBus` lee 5.000 eventos tras haber agregado en SQL. | Sin verificar |
| 13 | S3 | `sop.step_completed` y `sop.step.completed` conviven en el enum. | Sin verificar |
| 14 | S3 | Purgas separadas; `audit-entries` queda fuera de ambas. | Sin verificar |
| 15 | S3 | `sinceId` sólo se aplica en el fallback en memoria, no en SQL. | Sin verificar |

## Arreglos propuestos

1. **Tipo desconocido = error explícito**, no `TypeError` capturado: `emit` debe devolver `{ ok: false, reason: "unknown_type" }` y registrarlo; hoy el fallo se disfraza de `persisted: false`.
2. **Entrega real**: un subscriber que lanza no puede contar como entregado. `delivered` = éxito, `failed` = excepción, y ambos visibles.
3. **Dedupe antes de publicar** (reservar la clave y publicar después), no al revés: el orden actual permite republicar en un reintento.
4. **Un solo orden de replay**: si SQL devuelve `DESC`, invertir antes de entregar; dos replays con órdenes opuestos son dos bugs.
5. **Un solo nombre por evento**: `sop.step_completed` o `sop.step.completed`, no los dos en el enum.

## Plan

- **P1 (correctitud)**: tipo desconocido, entrega contada por éxito, dedupe antes de publicar.
- **P2 (orden y purga)**: replay consistente, `audit-entries` dentro de la purga, `sinceId` también en SQL.
- **P3 (transporte)**: decidir si `globalSubscribers` se queda (con documentación de que es local) o se sustituye por el bus persistido.

---

## Revisión de destino

El bus es la traza del producto: de él cuelgan auditoría, reacciones y aprendizaje. Faltan arreglos que el informe no propone:

- **Entrega con éxito medido**: `delivered` no puede contar un subscriber que lanza.
- Dedupe **antes** de publicar, para que un reintento no duplique.
- Un solo nombre por evento y un solo orden de replay.

## Conclusión

Con eventos poco fiables, la auditoría del kernel y el aprendizaje se construyen sobre arena. **P1**: no bloquea el vertical, pero sí la confianza en la traza cuando haya clientes reales.
