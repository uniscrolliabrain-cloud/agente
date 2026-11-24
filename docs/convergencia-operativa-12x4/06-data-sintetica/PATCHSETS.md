# Patchsets granulares · 06-data-sintetica

Anclas inspeccionadas o referenciadas por imports del código actual (paths engine/ y metrics/ relativos a apps/server/src salvo indicación). Confirmar SHA y consumidores antes de editar. Los nombres de tests nuevos son propuestas, no archivos existentes.

scripts/lib/vertical-slice-bundle.ts: parseVerticalSliceBundle, findSecretPaths, planVerticalSlice; package.json: demo:seed, verify:slice

## P1 · Scaffold

Identificar upstream exacto y licencia; mapear generador→bundle→schema; separar fixtures de demo protegida.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

## P2 · Coding y auditoría

Adaptar datos reproducibles con semilla y referencias válidas; validar con parser; integrar en tests sin tocar tenant real.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

## P3 · Reauditoría y refactor

Detectar deriva de schema, colisiones, secretos y dependencia del reloj; comparar hashes de fixtures.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

## P4 · Hardening

Reset limitado a entorno test, doble ejecución, dataset corrupto y prueba negativa de importación a producción.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

