# Pendientes â€” fixes que no entraron

> Doc vivo. Se actualiza cada vez que un mini script da MISS y no se resuelve en el momento.

## Bloque 05

| Marca | Archivo | Motivo | Estado |
|-------|---------|--------|--------|
| WORKER_STATUS_FIELD_V1 | apps/server/src/engine/worker.ts | Anchor con comentario intermedio no previsto | pendiente |
| WORKER_PLAN_EVENT_V1 | apps/server/src/engine/worker.ts | Anchor del compareAndSwap no coincide | pendiente |
| RUN_EVENT_CORRELATION_V1 | apps/server/src/engine/worker.ts | Anchor del put run-events no coincide | pendiente |
| WORKER_STATUS_THROTTLE_V1 | apps/server/src/engine/worker.ts | Anchor del if(this.running) no coincide | pendiente |
| CURSOR_VALIDATE_V1 | apps/server/src/db.ts | Anchor no coincide exacto | pendiente |
| IDEMPOTENCY_RESERVE_V1 | apps/server/src/engine/transaction.ts | Anchor no coincide exacto | pendiente |

## Bloque 04

| Marca | Archivo | Motivo | Estado |
|-------|---------|--------|--------|
| (fase 2) | varios | Requiere mÃ¡s archivos | pendiente |

## Bloque 03

| Marca | Archivo | Motivo | Estado |
|-------|---------|--------|--------|
| (ninguno) | â€” | â€” | â€” |

## Reglas

- Cada MISS se apunta aquÃ­ con archivo y motivo.
- Al cierre de cada bloque se revisan los pendientes y se deciden:
  - Aplicar con nuevo anchor.
  - Descartar (falso positivo).
  - Aparcar para otro bloque.
- El doc no se borra. Se actualiza.
---

## Bloque 06

### ACTION_EDIT_ENDPOINT_V1

- Archivo: `apps/server/src/engine/routes.ts` (o donde viva `/api/actions/:id/decide`)
- Anchor esperado: `// ACTIONS_AUDIT_ENDPOINT_V1 — audit trail de una acción.`
- Motivo: MISS. El endpoint `/decide` **no está en `engine/routes.ts`**. Hay que localizarlo (probablemente en `app.ts` o en otro router) y meter el `/edit` ahí.
- Replacement esperado:
      app.post("/actions/:id/edit", async (c) => {
        const owner = c.get("owner");
        const id = c.req.param("id");
        const body = z.object({
          data: z.record(z.string(), z.unknown()),
          expectedHash: z.string().length(64),
        }).parse(await c.req.json());
        return c.json(await service.actions.edit(owner, id, body.data, body.expectedHash));
      });
- Estado: pendiente

### USER_ID_REAL_V1 (route)

- Archivo: el que registre `/api/actions/:id/decide`.
- Motivo: MISS. El handler no está en `engine/routes.ts`.
- Replacement esperado: leer `x-user-id` del header y pasarlo a `service.actions.decide(owner, id, hash, decision, userId)`.
- Estado: pendiente

### 06-B17 attempts en ActionProposal

- Archivo: `packages/domain/src/index.ts` (schema `proposalSchema`).
- Motivo: falta el archivo.
- Replacement esperado: añadir `attempts: z.number().int().min(0).default(0)` al schema.
- Estado: pendiente

### 06-N1 kind whitelist

- Archivo: `apps/server/src/actions.ts`.
- Motivo: falta ver `proposalSchema.kind`.
- Replacement esperado: si el enum no cubre la lista, añadir whitelist explícita.
- Estado: pendiente

### 06-N7 attempts schema (duplicado de 06-B17)

- Mismo fix. Se unifica con 06-B17.
- Estado: pendiente

### 06-B12 windowMs por tenant

- Archivo: `apps/server/src/actions-deferred.ts` + `index.ts`.
- Motivo: requiere que `DeferredActions` consulte `TenantConfig` en runtime.
- Fix: cambiar `cfg.windowMs` fijo por callback que lea de `tenantService`.
- Estado: pendiente

### 06-B13 notificar firmantes

- Archivo: `apps/server/src/actions.ts`.
- Motivo: requiere `DeferredActions.get` (ya añadido) + lógica nueva.
- Fix: tras `approve`, si `record.needed > record.signers.length`, emitir notificación al siguiente firmante.
- Estado: pendiente

### 06-N4 modal usa ApprovalInbox

- Archivo: `apps/web/src/components/ApprovalModal.tsx`.
- Motivo: refactor grande (mover lógica al Inbox).
- Estado: pendiente

### 06-B9 / 06-B18 audit en modal

- Archivo: `apps/web/src/components/ApprovalModal.tsx`.
- Motivo: requiere fetch adicional y renderizado.
- Fix: añadir useEffect que llame a `/actions/:id/audit` y renderizar la lista.
- Estado: pendiente

### 06-N11 re-fetch modal cada 5s

- Archivo: `apps/web/src/components/ApprovalModal.tsx`.
- Motivo: mejora nueva, no es del miniaudit.
- Fix: `setInterval` que re-consulta la acción y actualiza estado si el hash cambió.
- Estado: pendiente
## Tanda 1 Fase 2 - MISS 2026-10-06 18:57

- F2-01-01 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-02 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-03 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-04 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-05 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-06 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-07 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-08 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-09 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-11 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-12 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-13 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-15 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-17 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-18 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-19 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-04-01 : MISS anchor en apps\server\src\engine\service.ts

## 09z Fase 3 - cierre (2026-10-07)

### Aplicados
- **Pipeline 1**: attention Zod, lifecycle, snapshot, health-deep.
- **Pipeline 2**: meta consumeHint, rules order, child turn.
- **Pipeline 3**: atencion real autores, presenter compose, views sin as any.
- **Pipeline 4**: consolidate O(n2) cap, views paged, getTurn cache.
- **Pipeline 5**: TenantScopedCapabilityRegistry wireado en service.ts.

### Pendientes (bloque 01 - tests)
- `packages/domain/test/ontology.test.ts` (slug, colision, bundle congelado).
- Test SSE que verifica que el Presenter decide el texto.
- Test `closeTurnAndChildren` con arbol profundo (N10).
- `kernel-meta-context.test.ts` con import en vez de require (N11).
- `kernel-presenter.test.ts` verifica persistencia (N12).

### Pendientes (bloque 19 - backups)
- `StoreAuditStore.verify` paginado con cursor keyset. Hoy fail-honest:
  devuelve `false` si el list llega a `KERNEL_AUDIT_MAX_LIST` (10.000).

## 09z Fase 3 - Pipeline 6 (2026-10-07)

- slow-author.ts: atencion real en reasoning y delegation (SLOW_AUTHOR_ATTENTION_V1 + SLOW_AUTHOR_DELEGATION_ATTENTION_V1).

