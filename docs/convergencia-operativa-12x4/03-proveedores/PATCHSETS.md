# Patchsets granulares · 03-proveedores

Anclas inspeccionadas o referenciadas por imports del código actual (paths engine/ y metrics/ relativos a apps/server/src salvo indicación). Confirmar SHA y consumidores antes de editar. Los nombres de tests nuevos son propuestas, no archivos existentes.

engine/cognition/v2/provider.ts: CopilotInferenceProvider; inference.ts: InferenceLane; slow.ts: SemanticClassifier, SlowCognitionQueue; runtime.ts

## P1 · Scaffold

Matriz FAST/SLOW env, endpoints y secretos; localizar contratos JEV/media/Composio en ramas; fixtures de streaming y errores.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

## P2 · Coding y auditoría

Activar fast y slow por separado; conectar classifier JEV y adaptadores media bajo consentimiento; registrar Composio mediante capacidades existentes; no fallback cruzado.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

## P3 · Reauditoría y refactor

Auditar abort, timeout, cuotas, liberación de slots, egress y resultados no autorizados; comparar latencia fast con slow saturado.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

## P4 · Hardening

Pruebas sandbox autorizadas, expiración de sesión, revocación, barge-in, coste y kill switch; distinguir configured de verified.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

