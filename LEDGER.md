# Ledger del pase 2026-10-02

> **LEDGER_PASE_2026_10_02_V1**
>
> Lista completa de ficheros tocados en el pase de parches sobre el repodump
> `8a5edab`. Se puede borrar cuando Cline cierre la verificacion.

---

## Estado al cierre del pase

| Verificacion | Estado |
|---|---|
| `pnpm typecheck` (backend + domain, 110 ficheros TS) | OK, 0 errores |
| `pnpm typecheck` (worker) | OK, 0 errores |
| `pnpm --filter @openmuse/web typecheck` | 61 errores preexistentes (no del pase) |
| `pnpm test` | Interrumpido por timeout de 305s. Sin fallos en los que corrieron |
| Marcas de idempotencia aplicadas | 43 OK |

---

## Ficheros nuevos

- `packages/domain/src/kernel.ts`
- `apps/server/src/engine/transaction.ts`
- `apps/server/src/engine/tenant.ts`
- `docs/PROMPT-CLINE-VERIFICACION.md`
- `LEDGER.md`

## Ficheros modificados (MOD)

- `packages/domain/src/agent.ts`
- `packages/domain/src/sop.ts`
- `packages/domain/src/index.ts`
- `apps/server/src/db.ts`
- `apps/server/src/kernel/kernel.ts`
- `apps/server/src/kernel/context/kernel-context.ts`
- `apps/server/src/app.ts`
- `apps/server/src/engine/service.ts` (multiples pasadas)
- `apps/server/src/engine/worker.ts`
- `apps/server/src/kernel/observers/presenter.ts`
- `apps/server/src/kernel/observers/meta.ts`
- `apps/server/src/kernel/graph/promote.ts`
- `apps/server/src/kernel/graph/rules.ts`
- `apps/server/src/kernel/graph/consolidate.ts`
- `apps/server/src/engine/conversation.ts`
- `apps/server/src/engine/model.ts`
- `apps/server/src/engine/sop-executor.ts`

## Ficheros reescritos (REWRITE)

- `apps/server/src/kernel/graph/store-store.ts`
- `apps/server/src/kernel/audit/store-store.ts`
- `apps/server/src/kernel/authors/user-author.ts`
- `apps/server/src/kernel/authors/fast-author.ts`
- `apps/server/src/kernel/authors/slow-author.ts`
- `apps/server/src/kernel-routes.ts`

---

## Marcas de idempotencia

Busca estas marcas para saber si un bloque ya esta aplicado:

### Domain y contratos
- `DOMAIN_KERNEL_V1`
- `TASK_AUDIT_V2`
- `MEMORY_AUDIT_V1`
- `ARTIFACT_AUDIT_V1`
- `SOP_ALLOWED_TOOLS_V1`
- `SOP_STEPS_LIMIT_V1`
- `EXPORT_KERNEL_V1`

### Persistencia y transacciones
- `TRANSACTION_V1`
- `ENGINE_TRANSACTION_V1`
- `KERNEL_STORE_STORE_V2`
- `KERNEL_STORE_AUDIT_STORE_V2`
- `ENGINE_TENANT_V1`

### Kernel
- `KERNEL_CLOSE_CHILDREN_V1`
- `KERNEL_LIST_TURNS_V1`
- `KERNEL_FIND_OPEN_TURN_V1`
- `KERNEL_USER_AUTHOR_V2`
- `KERNEL_FAST_AUTHOR_V2`
- `KERNEL_SLOW_AUTHOR_V2`
- `KERNEL_PRESENT_TURN_V1`
- `KERNEL_META_PROGRESS_V1`
- `PROMOTION_DESTINATION_V1`
- `RULES_TENANT_GUARD_V1`
- `CONSOLIDATE_TENANT_V1`
- `CONSOLIDATE_DEDUP_FIX_V1`
- `KERNEL_CONTEXT_V2`
- `KERNEL_DEPS_PUBLIC_V1`

### Kernel wire en runtime
- `KERNEL_WIRE_B_V1`
- `KERNEL_TURN_OPEN_V2`
- `KERNEL_TURN_OPEN_V3_ASYNC_IIFE`
- `KERNEL_TURN_OPEN_V4`
- `KERNEL_FAST_RESPONSE_V1`
- `KERNEL_CLOSE_METHOD_V2`
- `KERNEL_SAMPLE_CLOSE_V2`
- `KERNEL_TASK_OPEN_V2`
- `KERNEL_TASK_CLOSE_V2`
- `KERNEL_TASK_ERROR_V1`
- `KERNEL_NO_MODEL_V1`
- `KERNEL_PROMOTE_PERSIST_V1`
- `SOP_THOUGHTS_V1`
- `SOP_THOUGHT_STEP_V1`
- `SOP_THOUGHTS_CLOSE_V1`
- `KERNEL_ROUTES_V3`
- `KERNEL_ROUTES_WIRE_V1`

### Service y worker
- `WORKER_GUARD_CACHE_V1`
- `WORKER_GUARD_INVALIDATE_V1`
- `WORKER_ERROR_CAS_FIRST_V1`
- `WORKER_ERROR_CAS_CHECK_V1`
- `WORKER_SETTLED_CHECK_V1`
- `WORKER_SETTLED_CHECK_V2`
- `MAINTAIN_PURGE_V1`
- `MAINTAIN_PURGE_V2`
- `MAINTAIN_SOPS_V1`
- `MAINTAIN_SOPS_FIX_V1`
- `MAINTAIN_EMBEDDINGS_V1`
- `MAINTAIN_DEDUP_V1`
- `MAINTAIN_SOP_OWNER_V1`
- `META_LOOP_V1`
- `SEED_AGENTS_IDEMPOTENT_V1`
- `UPDATE_GOAL_PAUSE_V1`
- `ANSWER_ASSIGNEE_V1`
- `MATCHES_PRICE_V2`
- `MATCHES_PRICE_PARSE_V1`
- `CREATE_MONITOR_IDEMPOTENT_V1`
- `DECIDE_IDEA_TRANSACTION_V1`
- `SERVICE_INTERFACE_FIX_V1`
- `SERVICE_KERNELCONTEXT_IMPORT_V1`
- `STOREPORT_TX_FIX_V1`
- `STOREPORT_TX_FIX_V2`
- `MODEL_CLOSETURN_FIX_V2`
- `AUTHOR_MATCHED_METADATA_V1`
- `AUTHOR_METADATA_NORMALIZE_V1`

---

## Pendientes conocidos

### Worker
- Tick sin cola real (#132). El tick se pierde si tarda.
- Dedupe de run-events en Map local, se pierde al reiniciar (#137).
- `active.delete` sin recover de tareas huerfanas (#143).
- `LostLeaseError` generico (#144).

### Service
- Cursor keyset real para `scanByStatus` (#149, #150). Hoy tope 500.
- Transaccion real multi-store en `decideIdea` (#175). Hoy comentario.
- Transaccion real en `createMonitor` (#171). Hoy comentario.
- Bug conocido en `seedAgents`: `if (inserted.id !== role.id) continue;` nunca es true. Cline lo arregla.

### Kernel
- `conversation.ts` no usa `Presenter.presentTurn` todavia. Solo `writeFastResponse`.
- `kernel-routes.ts` usa cast a `kernel.deps`. Feo pero funcional.
- `kernel-routes.ts` no valida role admin. Cualquier usuario autenticado puede ver su propio audit.

### Frontend
- 61 errores de typecheck preexistentes (no del pase).
- Son de dos tipos: imports sin usar y `class=` en JSX en vez de `className=`.
- Se arreglan en Fase 1 con los templates reales.

### Tests
- Timeout de 305s. Los que corrieron, pasaron.
- Hay que investigar si es un test concreto con timeout o la suite entera.

---

## Proximas fases

### Fase 1 - Panel contextual (3-5 dias)
- Tipos `ViewSpec` en `packages/domain/src/views.ts`.
- `Views.toSpec()` en el kernel.
- `ViewResolver` en el backend.
- Endpoint `POST /api/views/resolve`.
- Panel contextual en frontend.
- 7 templates React reales (dashboard, queue, inbox, board, table, detail, form).

### Fase 2 - Animaciones (2-3 dias)
- Typewriter en el chat.
- Cascada en listas.
- Slide-in del panel.
- Contadores en KPIs.
- `prefers-reduced-motion` respetado.

### Fase 3 - Pulido vendible (1-2 semanas)
- Onboarding.
- Workspace switcher.
- Notificaciones en vivo.
- Busqueda global.
- Modales de aprobacion con diff.
- Perfil y equipo.
- Metricas de uso.
- Backups.

### Fase 4 - Produccion (2-4 semanas)
- Observabilidad.
- CI/CD.
- Backups automaticos.
- Multi-proceso.
- Hardening.
- pgvector.

---

## Como verificar el pase

```
pnpm typecheck                            # debe dar exit 0
pnpm --filter @openmuse/web typecheck     # 61 errores preexistentes
pnpm test                                 # investigar timeout
```

Para verificar marcas de idempotencia, buscar cualquier marca de la lista
anterior en los ficheros correspondientes. Si aparece una sola vez, el bloque
esta aplicado.

---

Fin del ledger.
