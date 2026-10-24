# Pendientes Campaña 2 — F3 + F4 + F5 + F6 + F7

## F3 — Delegacion controlada
- PEND-F3-01: `complete` de task mapea a `PolicyAction.execute`.
- PEND-F3-02: `approval` sin `taskId` -> owner con `assignedBy = null`.
- PEND-F3-03: `AgentActor.flow` computado, no persistido.
- PEND-F3-04: `Flow` desde `AgentPersona.reportsTo`/`peers` simplificado. Resolver contra `Actor` real.
- PEND-F3-05: `assigners`/`approvers`/`reviewers` no en `Flow`, resueltos desde `Policy`.
- PEND-F3-06: Adapters sin perdida de datos.
- PEND-F3-07: `Goal` duplicado (`goal.ts` Zod + `agent.ts` legacy).
- PEND-F3-08: `TaskStep`/`Evidence` son `interface`, no `z.object`.
- PEND-F3-09: `Assignment` como interfaz de lectura, no entidad persistida.
- PEND-F3-10: `AssignmentAdapter` anadido a `assignment.ts`.
- PEND-F3-11: `F3.19` SKIP (comportamiento ya existe).

## F4 — Consistencia e integridad
- PEND-F4-01: `version?: number` opcional en `AgentTask`/`Monitor`/`Project`/`Goal`. Migrar a obligatorio cuando todos los writers lo pongan.
- PEND-F4-02: `withWrite` acepta `expectedVersion?` opcional. Handlers no lo pasan todavia. Migrar.
- PEND-F4-03: `reconcile` de threads/projects usa `compareAndSwap` directo, no `withWrite`. Unificar.
- PEND-F4-04: `reconcileTask`/`reconcileGoal` inline en `engine/routes.ts`. Mover a `AgentService` si crece.

## F5 — Coordinacion
- PEND-F5-01: `PresenceStore`/`EditLockStore` in-memory por defecto. Multi-proceso pendiente.
- PEND-F5-02: `ReplayBuffer` in-memory. SSE replay condicional.
- PEND-F5-03: `notifications-stream` con `visibility`/`priority` aplicado pero sin tests E2E.

## F6 — Trazabilidad y auditoria
- PEND-F6-01: `AuditTrail` cableado via `deps.audit` en `withRead`. `withRead` no recibe `AuditTrail` explicito.
- PEND-F6-02: `RecordHistory` cableado via `deps.recordHistory` en `withWrite`. `WithWriteDeps` no declara `recordHistory`/`recordHistoryEnabled` todavia.
- PEND-F6-03: `worker.ts` ya tiene `actorId` (F1). F6.6 SKIP.
- PEND-F6-04: `store-store.ts` `payload` es `Record<string, unknown>`, no Zod. `superRefine` de F6.9 SKIP.
- PEND-F6-05: `audit-entries` retencion 365 dias. `AUDIT_RETENTION_DAYS` declarado pero `purgeKernelRetention` no lo usa todavia.
- PEND-F6-06: Tests de F6 son de schema, no de integracion E2E.

## F7 — Cierre
- PEND-F7-01: Tests de F7 (f4-*, f6-*) son de schema/contrato, no E2E. E2E de `reconcile` y `audit-trail` en F8 o posterior.
- PEND-F7-02: `KNOWN_ISSUES.md` y `CIERRE-MVP.md` no se crean. Van en este `-pendientes.md`.
- PEND-F7-03: `pnpm test` global no se ha ejecutado. Solo typecheck. Ejecutar antes de declarar F7 cerrada.

## Deudas transversales
- Basura untracked en el repo (`.bak`, `audit-fallos`, `repomix-*`, `fase*.txt`). Limpiar con `git clean -fd` cuando F7 este cerrada.
- `docs/miniaudits/04-multi-usuario-concurrente/` tiene muchos `.txt` de trabajo. Mover a `_archivo/` o borrar.
