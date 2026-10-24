# PENDIENTES — F2 y F3 (Campaña 2 Multiusuario)

> Documento de deudas y pendientes. NO se escribe código aquí. Solo se anotan
> deudas con ID, descripción, impacto, acción, estado y precondición verificable.

## Deudas de F2

### PEND-F2-06 — TaskWorker no se instancia
- Descripción: `new TaskWorker` no aparece en `apps/server/src`. `TaskWorker` se referencia en `config.ts`, `db-tenant.ts`, `index.ts`, `engine/worker.ts`, pero no se instancia.
- Impacto: F2.23 y F2.24 no aplicables. `withWrite` no recibe `pdp`/`fieldFilter` en el worker.
- Acción: F5 worker wiring. Auditar `AgentService` (9º arg `undefined`). Cablear `{ pdp, fieldFilter }` en `options`. Envolver writes de `tasks` (L250, L290) y `run-events` (L357) con `withWrite`.
- Estado: ABIERTA.
- Precondición: `new TaskWorker` aparece 1× y typecheck verde.

### PEND-F2-07 — worker.ts no escribe activity
- Descripción: `db.put(owner, "activity", ...)` no aparece en `worker.ts`.
- Impacto: F2.23b SKIP. No hay write que envolver.
- Acción: ninguna mientras no exista.
- Estado: CERRADA (SKIP justificado).

### PEND-F2-08 — app.ts con mojibake (6.4 MB)
- Descripción: `app.ts` tiene 6.425.854 bytes por mojibake acumulado. WriteAllText con UTF8Encoding re-codifica y amplía.
- Impacto: válido TS (typecheck verde), ilegible en zonas corruptas.
- Acción: fase de limpieza. Reparar mojibake antes de F3.18 (wire assignments en app.ts).
- Estado: ABIERTA. NO bloquea F3 hasta F3.18.
- Precondición: bytes < 500 KB, `U+FFFD` = 0.

### PEND-F2-09 — new AgentService(..., undefined, ...)
- Descripción: `app.ts` L235-245, 9º arg `undefined`. Probablemente `worker`.
- Impacto: `agent.worker` debe tener default. Si no, L405 peta en runtime.
- Acción: F5. Auditar constructor de `AgentService`. Cablear `TaskWorker` en 9º slot.
- Estado: ABIERTA.
- Precondición: 9º arg tipado y cableado.

## Deudas de F3 (a rellenar cuando se ejecute)

### PEND-F3-01 — (pendiente)
- Estado: ABIERTA.

## Notas

- F2 cerrada con 33/37 marcas + 4 aplazadas (F2.23, F2.23b SKIP, F2.24, F2.24b).
- Commit F2: `b17170e`. Merge a main: `92b096b`.
- F1 cerrada 15/15. F2-core 14/14. F2-routes-part1 10/10. F2-routes-part2 9/13.