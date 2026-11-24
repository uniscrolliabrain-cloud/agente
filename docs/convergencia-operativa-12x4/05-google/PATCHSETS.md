# Patchsets granulares · 05-google

Anclas inspeccionadas o referenciadas por imports del código actual (paths engine/ y metrics/ relativos a apps/server/src salvo indicación). Confirmar SHA y consumidores antes de editar. Los nombres de tests nuevos son propuestas, no archivos existentes.

apps/server/src/google-auth.ts: GoogleAuth, GoogleConnection, READ_SCOPES, WRITE_SCOPES; app.ts; engine/service.ts

## P1 · Scaffold

Inventariar scopes por operación, adaptadores actuales y OAuth generation; Maps separado; localizar Docs y tests antes de editar.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

## P2 · Coding y auditoría

Cinco patchsets Maps, Calendar, Drive, Gmail, Docs; cada uno capability→policy→adapter→receipt; conservar CAS y membership; componer workflow con aprobación.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

## P3 · Reauditoría y refactor

Revisar refresh concurrente, scopes amplios, ACL, duplicación Composio y errores ambiguos.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

## P4 · Hardening

Revocar durante ejecución, dos tenants mismo usuario, cuota 429, permisos insuficientes y sandbox autorizado.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

