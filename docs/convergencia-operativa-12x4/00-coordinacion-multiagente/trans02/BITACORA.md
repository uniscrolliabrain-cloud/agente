# Bitácora trans02

Estado: W0 PENDING. Base común 751eab413aef2ca124d42dcba602b91696b71c9d. Tests NOT_RUN. Ownership exacto pendiente de confirmación. Registrar entradas append-only por patchset según HANDOFF.md.

## 2026-11-24 · T01 / B1 · P1, W0–W5

- Rama verificada `trans02`. Base probada `217ef7423853a5f9d68eada476a4cf45427ac2f1`; campaña consultada en lectura `52dcd7ac`. Entorno Linux, Node 24.22.3 y pnpm 11.25.0; dependencias instaladas con lockfile congelado y store temporal.
- Inventario, ownership, patchsets y contratos propuestos en [T01-INVENTARIO.md](T01-INVENTARIO.md) y [T01-CONTRATOS.md](T01-CONTRATOS.md), commit `e368b42a`. T01 sin cambios funcionales, migraciones, despliegues ni efectos de proveedores. El alcance de escritura se verificó con el diff contra la campaña. Las reservas de T02 y solicitudes T02-01 a T02-04 quedan pendientes de revisión.
- `pnpm typecheck` → 0, incluyendo browser-worker. `pnpm test:cognition-v2` → 0, 61 aprobadas, 9 omitidas. Los casos omitidos incluyen los que requieren Postgres con rol restringido; no hay certificación de ese modo.
- Reproducción en exportaciones Git temporales de los SHA congelados, con el mismo lock instalado. `node --import tsx --import ./tests/setup.ts --test --test-isolation=none --test-timeout=45000 tests/cognition-v2-http.test.ts` → 1 en `6d4e7eb3`: SSE `RUN_ERROR`, `INCOMPLETE_STREAM`, `Cannot read properties of undefined (reading 'chat')`; falló la aserción de `conversation.turn.persisted`. Mismo comando en `54f7fbfe` → 0, 1 aprobada. En esa rama, mismo runner con `tests/cognition-v2-chat-agent.test.ts` → 0, 4 aprobadas. Resultado del candidato, pendiente de integración en la rama de trabajo.
- `pnpm gate` → 1, IPC de tsx denegado por el sandbox. `node --import tsx scripts/gate-report.ts` → 1, 9/10 pasos correctos; el paso `test` falló al abrir el socket IPC de tsx (`EPERM`). La alternativa directa de la suite general se inició y su resultado no forma parte de la aceptación B1.
- Veredicto B1: inventario y contrato listos para revisión; gate combinado pendiente. Decisión del supervisor antes de T02: confirmar ownership y contrato de selector/receipts con Trans01. Siguiente acción tras autorización: reconciliar el binding C06 y acordar el montaje de la observación durable.
