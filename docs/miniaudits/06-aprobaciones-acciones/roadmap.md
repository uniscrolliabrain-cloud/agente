# Roadmap — 06 aprobaciones y acciones

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Nada externo se ejecuta sin aprobación humana.

## 2. Estado verificado
- ActionService con hash, expiresAt, idempotencyKey.
- 9 estados en ActionProposal.
- DeferredActions con undo de 8s.
- Fuente: repodump actions.ts, actions-deferred.ts.

## 3. Huecos contra producción
- outcome_unknown sin reconciliación UI.
- Doble firma no expuesta.
- Undo de 8s no visible.
- Auditoría visual incompleta.
- Sin endpoint de reintento.

## 4. Objetivo
100% de acciones externas con aprobación. outcome_unknown reconciliable
en <1 minuto.

## 5. Fronteras
- No firma criptográfica compleja.
- No multi-nivel de aprobación.

## 6. Conexiones
- Depende de: 05.
- Dependen de esta: 14, 22, 23.
- Archivos compartidos: actions.ts, service.ts.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Endpoint POST /api/actions/:id/reconcile.
- ApprovalModal muestra outcome_unknown con botón.
- Test de aprobación y rechazo por acción.
