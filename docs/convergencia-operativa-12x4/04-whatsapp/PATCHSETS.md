# Patchsets granulares · 04-whatsapp

Anclas inspeccionadas o referenciadas por imports del código actual (paths engine/ y metrics/ relativos a apps/server/src salvo indicación). Confirmar SHA y consumidores antes de editar. Los nombres de tests nuevos son propuestas, no archivos existentes.

apps/server/src/whatsapp-routes.ts: whatsappWebhookRoutes, whatsappRoutes; engine/whatsapp-inbound.ts y whatsapp-outbound.ts (imports); packages/integrations/src/stubs/whatsapp.ts: WhatsAppClient

## P1 · Scaffold

Inventariar bindings proveedor/tenant, firmas, mensajes y estados; decidir Evolution vs Cloud API con evidencia.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

## P2 · Coding y auditoría

Cablear recepción→enqueue→SOP→aprobación→sendText→receipt→proyección; persistir ID proveedor y estado ambiguo; no retry ciego.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

## P3 · Reauditoría y refactor

Revisar duplicados, orden, tenant binding, aprobaciones y diferencias entre aceptación y entrega.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

## P4 · Hardening

Webhook falso, replay, timeout tras aceptación, revocación y recuperación; sandbox con número autorizado.

- Entregar inventario de archivos tocados y contratos productor/consumidor.
- Añadir prueba focalizada por cada comportamiento descrito; registrar caso positivo, negativo y recuperación cuando aplique.
- Ejecutar pnpm typecheck y pruebas focalizadas con runner existente; pnpm gate al cerrar pasada; registrar SHA, comando, exit code y artefactos.
- Si falta contrato externo, marcar BLOCKED_EXTERNAL con puerto fail-closed; no simular éxito.
- Rollback: revertir patchset sin perder eventos ni datos; migraciones expand/contract y compensación de efectos externos.

