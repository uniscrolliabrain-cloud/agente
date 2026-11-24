# Patchsets granulares · 01-consolidacion

Anclas inspeccionadas o referenciadas por imports del código actual (paths engine/ y metrics/ relativos a apps/server/src salvo indicación). Confirmar SHA y consumidores antes de editar. Los nombres de tests nuevos son propuestas, no archivos existentes.

apps/server/src/agent.ts: makeRuntime; app.ts: montaje; engine/cognition/v2/runtime.ts: chat, identity, enabledForRequest; workers.ts: runCognitionWorkers

## P1 · Scaffold

Inventario SHA/patch-id por rama, matriz ruta×tenant×backend y prueba HTTP roja reproducible.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

## P2 · Coding y auditoría

Reconciliar factory y binding con C06.P02; probar selección V2/legacy/AGUI, cancelación y receipts; integrar P03b solo tras demostrar dedupe y anti-bucle.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

## P3 · Reauditoría y refactor

Revisar bypass por AGUI, pérdida de scope async, duplicación de consumidores y migraciones; comparar resultados por tenant.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

## P4 · Hardening

Postgres restringido A/B, revocación durante stream, restart y replay; archivar ramas solo con equivalencia y rollback.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

