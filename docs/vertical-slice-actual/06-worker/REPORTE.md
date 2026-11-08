# Campaña 06 · Identidad durable y efectos diferidos — REPORTE

**Fecha:** 2026-11-08T20:20Z
**Base:** `main` = `bd3df06` (cierre de la campaña 05)
**Estado:** **06.P3 cerrado y probado**; 06.P1/P2 (identidad durable del worker) quedan pendientes y declarados

## El defecto que cierra la 06.P3

`index.ts` instanciaba `DeferredActions` con un callback que leía la acción y **no hacía nada** (`void action`). `tick()` no pedía recibo alguno: marcaba la acción como `executed` y **emitía `action.executed` al bus**. Es decir, el sistema entregaba un recibo de éxito por un despacho que nunca ocurrió — justo lo que la aserción de cierre prohíbe.

Ahora el despacho debe devolver un recibo explícito:

- `{ executed: true }` → `executed` + evento `action.executed`;
- `{ executed: false, reason }` o `void` → `failed` + `failureReason` + evento `action.failed`;
- un `throw` → `failed` con la causa.

El callback de `index.ts` devuelve `{ executed: false, reason: "deferred_dispatch_unwired" }` hasta que exista el despacho real (campaña 14), así que durante el slice **ninguna acción diferida puede reportar éxito falso**.

## Qué se ha modificado

- `apps/server/src/actions-deferred.ts` — `DeferredRunReceipt`, `failureReason`, guarda en `tick()`.
- `apps/server/src/index.ts` — el callback vacío pasa a recibo negativo explícito.
- `tests/vertical-slice-worker.test.ts` — 5 casos nuevos.

## Evidencia

```
typecheck                                                          exit=0
vertical-slice-worker + deferred-actions + actions-deferred-wire    13/13 pass, exit=0
pnpm test                                                          606 tests · 589 pass · 0 fail · 12 skipped, exit=0
audits (tenant-default, idempotency, layers, bridges, no-console, anchors)  exit=0
pnpm verify:slice                                                  5/5 pasos OK, exit=0
pnpm audit:contracts                                               exit=1 (79 huérfanos, heredado)
```

Casos: callback vacío → `failed` sin evento de éxito · recibo negativo → `failed` con su motivo · recibo afirmativo → `executed` · throw → `failed` con causa · doble tick no reejecuta.

## Aserción de cierre

> Reinicio y dos workers preservan identidad; jamás hay recibo de éxito por callback vacío.

**La segunda mitad está cumplida y probada.** La primera (identidad durable entre reinicios y dos workers) **no**: exige persistir tenant/solicitante/agente/SOP/versión con la tarea, revalidar membership y suspensión antes del despacho y no ejecutar filas legacy no atribuibles. Eso toca `worker.ts` (600 líneas), `service.ts` y el formato de `AgentTask`; hacerlo en esta pasada sin red de staging habría cambiado el contrato de reclamación a ciegas.

## Pendiente declarado (06.P1/P2)

- Persistir y verificar la identidad de ejecución en la tarea (tenant, solicitante, agente, SOP, versión, correlación).
- Revalidar actor + suspensión antes de despachar, y tratar filas legacy no atribuibles sin ejecutarlas.
- Acreditación con dos workers reales y reinicio: requiere Postgres de staging (05.P2 sigue pendiente por la misma razón).

Está anotado en `limpieza-general/pendientes.md`.

## Entrega a la campaña 07

- `DeferredRunReceipt` como contrato para que la 14 conecte el despacho real sin volver a abrir la puerta al éxito falso.
- `failureReason` persistido: la 20 puede mostrar la incidencia en el panel sin inferirla.
