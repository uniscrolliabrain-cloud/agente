Tienes razón. Con el árbol real y los ficheros que he visto, puedo hacer ese mapa sin esperar a Copilot. Lo hago ahora, con lo que sé y marcando lo que no puedo confirmar.

**Nota importante:** lo que sigue es un mapa de "qué ficheros crea, wirea o modifica cada pieza" basado en el árbol real (`repotree-lastone.txt`) y los ficheros que he leído en este chat. Donde no he leído el fichero, lo marco como **"verificar"**. Donde el fichero no existe en el árbol, lo marco como **"crear"**. Donde el fichero existe y hay que tocarlo, lo marco como **"modificar"**. Donde existe y hay que cablearlo, lo marco como **"wire"**.

---

## 1. Modelo de actor (`Actor`, `HumanActor`, `AgentActor`, `ActorRegistry`)

**Crear:**
- `packages/domain/src/actor.ts` — `Actor`, `HumanActor`, `AgentActor`, `ActorRole`, `ActorKind`.
- `apps/server/src/engine/actors/registry.ts` — `ActorRegistry`.
- `apps/server/src/engine/actors/service.ts` — `ActorService` (get, list, findByRole, resolve).

**Modificar:**
- `packages/domain/src/agent.ts` — `AgentRole` gana `actorKind: "agent"`, `actorId`. `User` gana `actorKind: "human"`, `actorId`. **Verificar** el fichero actual.
- `apps/server/src/users.ts` — `UserService` gana `toActor(user): HumanActor`. **Verificar.**
- `apps/server/src/engine/tenant.ts` — `TenantService` ya resuelve `tenantId`. Se le añade `actorIdFor(owner)`. **Verificar.**
- `apps/server/src/auth.ts` — `Auth.owner` sigue igual. Se le añade `Auth.actor(token): Actor`. **Verificar.**
- `apps/server/src/app.ts` — el middleware de auth construye `c.set("ctx", { tenantId, owner, userId, role, sessionId, requestId })` en lugar de solo `c.set("owner", owner)`. **Modificar.**
- `apps/server/src/index.ts` — wire del `ActorRegistry` al `createApp`. **Modificar.**

**Wire:**
- `apps/server/src/engine/agents/personas/routes.ts` — usa `tenantIdFor(owner)`. Se le añade `actorIdFor(owner)`. **Modificar.**
- `apps/server/src/engine/agents/personas/registry.ts` — el `PersonaRegistry` ya carga personas. Se le añade `ActorRegistry` para que cada persona sea un `AgentActor`. **Modificar.**
- `apps/server/src/kernel/context/kernel-context.ts` — el `KernelContext` ya tiene `tenantId`, `owner`, `role`, `requestId`, `personaId`. Se le añade `actorId`, `actorKind`, `sessionId`. **Modificar.**
- `apps/server/src/kernel/kernel.ts` — `openTurn`, `appendThought`, `closeTurn` reciben `ctx`. Se les añade `actorId`. **Modificar.**

**Tests:**
- `tests/actor-registry.test.ts` — **crear**.
- `tests/actor-resolution.test.ts` — **crear**.

---

## 2. Permisos (`Policy`, PDP, PEP, `withRead`, `withWrite`)

**Crear:**
- `packages/domain/src/policy.ts` — `Policy`, `PolicyAction`, `PolicyCondition`, `PolicyDecision`.
- `apps/server/src/engine/authz/pdp.ts` — `PolicyDecisionPoint`.
- `apps/server/src/engine/authz/pep.ts` — `PolicyEnforcementPoint` (middleware).
- `apps/server/src/engine/authz/policies.ts` — políticas por defecto (owner, manager, employee, hr, compliance, agent).
- `apps/server/src/engine/authz/with-read.ts` — `withRead`.
- `apps/server/src/engine/authz/with-write.ts` — `withWrite`.
- `apps/server/src/engine/authz/field-filter.ts` — `FieldFilter`.

**Modificar:**
- `apps/server/src/app.ts` — `app.use("/api/*", authzMiddleware)` después del auth middleware. **Modificar.**
- `apps/server/src/engine/tenant.ts` — `TenantService` no cambia. **Verificar.**
- `apps/server/src/engine/routes.ts` — los handlers de `tasks`, `goals`, `monitors`, `memories`, `roles`, `identity`, `notifications` usan `withRead`/`withWrite`. **Modificar.**
- `apps/server/src/threads-routes.ts` — `withWrite` en `PUT /:id`, `PATCH /:id`, `DELETE /:id`. **Modificar.**
- `apps/server/src/projects-routes.ts` — `withWrite` en `PATCH /:id`, `PUT /:id/blocks`, `POST /:id/link-*`, `DELETE /:id`. **Modificar.**
- `apps/server/src/admin-routes.ts` — `withRead`/`withWrite` en `usage`, `feedback`, `business-schema`, `approvals`, `roles`, `audit-export`. **Modificar.**
- `apps/server/src/admin-tenants.ts` — `withRead`/`withWrite` en `suspend`, `resume`, `POST /`. **Modificar.**
- `apps/server/src/rag-routes.ts` — `withRead`/`withWrite` en `ingest`, `search`, `delete`. **Modificar.**
- `apps/server/src/computer-routes.ts` — `withRead`/`withWrite` en `commands`, `files/*`. **Modificar.**
- `apps/server/src/computer-tools.ts` — `withRead`/`withWrite` en `export_computer_pdf`. **Modificar.**
- `apps/server/src/skills/routes.ts` — `withRead`/`withWrite` en `POST`, `PUT`, `DELETE`. **Modificar.**
- `apps/server/src/skills/sop-routes.ts` — `withRead`/`withWrite` en `POST`, `PUT`, `DELETE`, `run`. **Modificar.**
- `apps/server/src/billing-routes.ts` — `withRead` en `invoices`. **Modificar.**
- `apps/server/src/notification-prefs.ts` — `withRead`/`withWrite` en `prefs`. **Modificar.**

**Wire:**
- `apps/server/src/engine/agents/governance.ts` — `AgentGovernance.canExecuteTool` y `canExecuteAction` ya existen. Se reescriben para llamar al PDP. **Modificar.**
- `apps/server/src/engine/agents/personas/routes.ts` — `tenantIdFor` se reemplaza por `actorIdFor`. **Modificar.**

**Tests:**
- `tests/pdp.test.ts` — **crear**.
- `tests/pep.test.ts` — **crear**.
- `tests/with-read.test.ts` — **crear**.
- `tests/with-write.test.ts` — **crear**.
- `tests/field-filter.test.ts` — **crear**.

---

## 3. Clasificación de información (`FieldClassification`, `FieldFilter`)

**Crear:**
- `packages/domain/src/classification.ts` — `FieldClassification`, `ClassifiedField`, `ClassifiedRecord`.
- `packages/domain/src/schemas/employee.ts` — schema de `Employee` con clasificación por campo.
- `packages/domain/src/schemas/payroll.ts` — schema de `Payroll` con clasificación.
- `packages/domain/src/schemas/invoice.ts` — schema de `Invoice` con clasificación.
- `packages/domain/src/schemas/document.ts` — schema de `Document` con clasificación.
- `packages/domain/src/schemas/task.ts` — schema de `Task` con clasificación.
- `packages/domain/src/schemas/agent.ts` — schema de `Agent` con clasificación.
- `packages/domain/src/schemas/audit.ts` — schema de `Audit` con clasificación.

**Modificar:**
- `packages/domain/src/agent.ts` — `AgentTask`, `AgentMemory`, `AgentArtifact`, `AgentNotification` ganan `fieldClassification`. **Verificar.**
- `packages/domain/src/business.ts` — `BusinessEntity` gana `fieldClassification`. **Verificar.**
- `packages/domain/src/sop.ts` — `SOP` gana `fieldClassification`. **Verificar.**
- `apps/server/src/users.ts` — `User` gana `fieldClassification`. **Verificar.**
- `apps/server/src/engine/agents/personas/registry.ts` — `AgentRole` gana `fieldClassification`. **Verificar.**

**Wire:**
- `apps/server/src/engine/authz/field-filter.ts` — usa `fieldClassification` para filtrar. **Crear (ya listado).**
- `apps/server/src/engine/authz/with-read.ts` — llama al `FieldFilter`. **Crear (ya listado).**

**Tests:**
- `tests/field-classification.test.ts` — **crear**.
- `tests/employee-classification.test.ts` — **crear**.
- `tests/payroll-classification.test.ts` — **crear**.

---

## 4. Asignación y flujo (`Assignment`, `Flow`, `AssignmentService`)

**Crear:**
- `packages/domain/src/assignment.ts` — `Assignment`, `AssignmentKind`, `AssignmentStatus`, `AssignmentPlan`, `AssignmentEvidence`, `AssignmentOutcome`.
- `packages/domain/src/flow.ts` — `Flow`, `FlowRelation`.
- `apps/server/src/engine/assignments/service.ts` — `AssignmentService` (assign, accept, reject, approve, escalate, complete).
- `apps/server/src/engine/assignments/registry.ts` — `AssignmentRegistry` (task, goal, monitor, approval, sop).

**Modificar:**
- `packages/domain/src/agent.ts` — `AgentTask` implementa `Assignment` (kind `task`). `Goal` implementa `Assignment` (kind `goal`). `Monitor` implementa `Assignment` (kind `monitor`). `AgentRole` gana `flow: Flow`. **Verificar.**
- `apps/server/src/engine/routes.ts` — `createTask`, `createGoal`, `createMonitor` usan `AssignmentService`. **Modificar.**
- `apps/server/src/actions.ts` — `ActionService` implementa `Assignment` (kind `approval`). **Verificar.**
- `apps/server/src/skills/sop-routes.ts` — `SOP` implementa `Assignment` (kind `sop`). **Modificar.**
- `apps/server/src/engine/agents/personas/registry.ts` — `AgentRole.flow` se rellena con `reportsTo`, `peers`. **Modificar.**
- `apps/server/src/engine/agents/personas/routes.ts` — `GET /:id` devuelve `flow`. **Modificar.**

**Wire:**
- `apps/server/src/engine/routes.ts` — `assign`, `escalate`, `reassign` usan `AssignmentService`. **Modificar.**
- `apps/server/src/engine/routes.ts` — `control` (pause, resume, cancel, retry) usa `AssignmentService`. **Modificar.**

**Tests:**
- `tests/assignment-service.test.ts` — **crear**.
- `tests/flow.test.ts` — **crear**.
- `tests/assignment-convergence.test.ts` — **crear**.

---

## 5. Presencia y lock compartidos (`Presence`, `EditLock`, `PresenceService`, `EditLockService`, GC)

**Crear:**
- `packages/domain/src/presence.ts` — `Presence`, `PresenceKind`.
- `packages/domain/src/edit-lock.ts` — `EditLock`, `EditLockKind`.
- `apps/server/src/engine/presence-service.ts` — `PresenceService` (touch, leave, list).
- `apps/server/src/engine/edit-lock-service.ts` — `EditLockService` (acquire, release, holder).
- `apps/server/src/engine/presence-gc.ts` — GC de presence y edit-lock.

**Modificar:**
- `apps/server/src/engine/presence.ts` — `globalPresence` se reemplaza por `PresenceService`. **Modificar.**
- `apps/server/src/engine/edit-lock.ts` — `globalEditLock` se reemplaza por `EditLockService`. **Modificar.**
- `apps/server/src/threads-routes.ts` — `POST /:id/presence`, `POST /:id/presence/leave`, `PUT /:id` usan `PresenceService` y `EditLockService`. **Modificar.**
- `apps/server/src/projects-routes.ts` — `POST /:id/presence`, `POST /:id/presence/leave`, `PATCH /:id`, `PUT /:id/blocks` usan `PresenceService` y `EditLockService`. **Modificar.**
- `apps/server/src/index.ts` — wire del GC al arranque. **Modificar.**

**Wire:**
- `apps/server/src/app.ts` — `createApp` instancia `PresenceService` y `EditLockService` con `db`. **Modificar.**

**Tests:**
- `tests/presence-service.test.ts` — **crear**.
- `tests/edit-lock-service.test.ts` — **crear**.
- `tests/presence-gc.test.ts` — **crear**.
- `tests/presence-multi-process.test.ts` — **crear** (requiere dos procesos, puede ser mock).

---

## 6. Eventos y notificaciones (`EventBus` con replay, `Notification` dirigida, `NotificationService`, SSE con `Last-Event-ID`)

**Crear:**
- `packages/domain/src/notification.ts` — `Notification`, `NotificationVisibility`, `NotificationPriority`.
- `apps/server/src/engine/notifications/service.ts` — `NotificationService` (notify, list, markRead, stream).
- `apps/server/src/engine/events/replay-buffer.ts` — buffer por actor.

**Modificar:**
- `apps/server/src/engine/events/bus.ts` — `EventBus.emit` guarda en `sse-buffer`. **Modificar.**
- `apps/server/src/engine/events/subscriber.ts` — `EventSubscriberRegistry` filtra por `actorId` y `visibility`. **Modificar.**
- `apps/server/src/notifications-stream.ts` — `stream` lee `Last-Event-ID`, busca en buffer, emite, suscribe. **Modificar.**
- `apps/server/src/notification-prefs.ts` — `prefs` gana `visibility` y `priority`. **Modificar.**
- `apps/server/src/engine/routes.ts` — `notifications/direct` usa `NotificationService`. **Modificar.**
- `apps/server/src/engine/routes.ts` — `notifications/:id/read` usa `NotificationService.markRead` (CAS ya existe, `NOTIF_READ_CAS_V1`). **Modificar.**

**Wire:**
- `apps/server/src/app.ts` — `createApp` instancia `NotificationService`. **Modificar.**
- `apps/server/src/notifications-stream.ts` — `stream` usa `NotificationService`. **Modificar.**

**Tests:**
- `tests/notification-service.test.ts` — **crear**.
- `tests/sse-replay.test.ts` — **crear**.
- `tests/notification-directed.test.ts` — **crear**.

---

## 7. Auditoría y reconciliación (`RecordHistory`, `AuditTrail`, `ConflictDiff`, `Reconcile`, `ConflictVersion`)

**Crear:**
- `packages/domain/src/record-history.ts` — `RecordHistoryEntry`, `RecordHistoryDiff`.
- `packages/domain/src/audit-trail.ts` — `AuditTrailEntry`, `AuditTrailAction`.
- `apps/server/src/engine/history/service.ts` — `RecordHistoryService` (append, list, diff).
- `apps/server/src/engine/audit-trail/service.ts` — `AuditTrailService` (append, list).
- `apps/server/src/engine/reconcile/service.ts` — `ReconcileService` (reconcile, conflictVersion).

**Modificar:**
- `apps/server/src/engine/authz/with-write.ts` — escribe `RecordHistory` y `AuditTrail`. **Crear (ya listado).**
- `apps/server/src/engine/authz/with-read.ts` — escribe `AuditTrail` si el campo es `restricted` o `secret`. **Crear (ya listado).**
- `apps/server/src/engine/routes.ts` — `activity` gana `actorId`, `sessionId`, `requestId`. **Modificar.**
- `apps/server/src/engine/worker.ts` — `run-events` gana `actorId`. **Modificar.**
- `apps/server/src/kernel/audit/store-store.ts` — `audit-entries` gana `field`, `classification`, `allowed`. **Modificar.**
- `apps/server/src/threads-routes.ts` — `THREAD_CONFLICT_DIFF_V1` devuelve `diff` por campo. **Modificar.**
- `apps/server/src/projects-routes.ts` — `PROJECT_CONFLICT_DIFF_V1` devuelve `diff` por campo. **Modificar.**
- `apps/server/src/app.ts` — wire de `RecordHistoryService`, `AuditTrailService`, `ReconcileService`. **Modificar.**
- `apps/server/src/app.ts` — rutas `GET /api/history/:kind/:id`, `GET /api/audit/:actorId`, `POST /api/:kind/:id/reconcile`, `GET /api/:kind/:id/conflict`. **Modificar.**

**Wire:**
- `apps/server/src/threads-routes.ts` — `POST /:id/reconcile`, `GET /:id/conflict`. **Modificar.**
- `apps/server/src/projects-routes.ts` — `POST /:id/reconcile`, `GET /:id/conflict`. **Modificar.**

**Tests:**
- `tests/record-history.test.ts` — **crear**.
- `tests/audit-trail.test.ts` — **crear**.
- `tests/conflict-diff.test.ts` — **crear**.
- `tests/reconcile.test.ts` — **crear**.
- `tests/conflict-version.test.ts` — **crear**.

---

## 8. `x-user-id` deja de ser fuente de verdad

**Modificar:**
- `apps/server/src/middleware/user-header.ts` — el `x-user-id` se valida contra el `owner` del token. Si no coincide, 403. **Modificar.**
- `apps/server/src/threads-routes.ts` — `const userId = c.req.header("x-user-id") ?? owner` se reemplaza por `const userId = c.get("ctx").userId`. **Modificar.**
- `apps/server/src/projects-routes.ts` — igual. **Modificar.**
- `apps/server/src/notifications-stream.ts` — `const userId = c.req.header("x-user-id") ?? owner` se reemplaza por `c.get("ctx").userId`. **Modificar.**
- `apps/server/src/app.ts` — `app.use("/api/*", userHeaderMiddleware())` valida contra el token. **Modificar.**

**Tests:**
- `tests/user-header-validation.test.ts` — **crear**.

---

## 9. Resumen de ficheros por tipo

**Crear (nuevos ficheros):**
- `packages/domain/src/actor.ts`
- `packages/domain/src/policy.ts`
- `packages/domain/src/classification.ts`
- `packages/domain/src/assignment.ts`
- `packages/domain/src/flow.ts`
- `packages/domain/src/presence.ts`
- `packages/domain/src/edit-lock.ts`
- `packages/domain/src/notification.ts`
- `packages/domain/src/record-history.ts`
- `packages/domain/src/audit-trail.ts`
- `packages/domain/src/schemas/*.ts` (employee, payroll, invoice, document, task, agent, audit)
- `apps/server/src/engine/actors/registry.ts`
- `apps/server/src/engine/actors/service.ts`
- `apps/server/src/engine/authz/pdp.ts`
- `apps/server/src/engine/authz/pep.ts`
- `apps/server/src/engine/authz/policies.ts`
- `apps/server/src/engine/authz/with-read.ts`
- `apps/server/src/engine/authz/with-write.ts`
- `apps/server/src/engine/authz/field-filter.ts`
- `apps/server/src/engine/assignments/service.ts`
- `apps/server/src/engine/assignments/registry.ts`
- `apps/server/src/engine/presence-service.ts`
- `apps/server/src/engine/edit-lock-service.ts`
- `apps/server/src/engine/presence-gc.ts`
- `apps/server/src/engine/notifications/service.ts`
- `apps/server/src/engine/events/replay-buffer.ts`
- `apps/server/src/engine/history/service.ts`
- `apps/server/src/engine/audit-trail/service.ts`
- `apps/server/src/engine/reconcile/service.ts`
- Los 15 tests de aceptación (`tests/*.test.ts`).

**Modificar (ficheros existentes):**
- `packages/domain/src/agent.ts`
- `packages/domain/src/business.ts`
- `packages/domain/src/sop.ts`
- `apps/server/src/users.ts`
- `apps/server/src/auth.ts`
- `apps/server/src/app.ts`
- `apps/server/src/index.ts`
- `apps/server/src/middleware/user-header.ts`
- `apps/server/src/threads-routes.ts`
- `apps/server/src/projects-routes.ts`
- `apps/server/src/rag-routes.ts`
- `apps/server/src/computer-routes.ts`
- `apps/server/src/computer-tools.ts`
- `apps/server/src/skills/routes.ts`
- `apps/server/src/skills/sop-routes.ts`
- `apps/server/src/billing-routes.ts`
- `apps/server/src/notification-prefs.ts`
- `apps/server/src/notifications-stream.ts`
- `apps/server/src/admin-routes.ts`
- `apps/server/src/admin-tenants.ts`
- `apps/server/src/actions.ts`
- `apps/server/src/engine/routes.ts`
- `apps/server/src/engine/presence.ts`
- `apps/server/src/engine/edit-lock.ts`
- `apps/server/src/engine/agents/governance.ts`
- `apps/server/src/engine/agents/personas/routes.ts`
- `apps/server/src/engine/agents/personas/registry.ts`
- `apps/server/src/engine/events/bus.ts`
- `apps/server/src/engine/events/subscriber.ts`
- `apps/server/src/engine/worker.ts`
- `apps/server/src/kernel/kernel.ts`
- `apps/server/src/kernel/context/kernel-context.ts`
- `apps/server/src/kernel/audit/store-store.ts`

**Wire (cableado en `app.ts` o `index.ts`):**
- `ActorRegistry` → `createApp`.
- `PolicyDecisionPoint` → `authzMiddleware` → `app.use("/api/*", ...)`.
- `PresenceService` y `EditLockService` → `createApp`.
- `NotificationService` → `createApp` y `notifications-stream.ts`.
- `RecordHistoryService`, `AuditTrailService`, `ReconcileService` → `createApp`.
- `PresenceGC` → `index.ts` (arranque).

---

## 10. Lo que no puedo confirmar sin leer los ficheros

Estos los marco como **"verificar"** porque no los he leído en este chat y el árbol no me da su contenido:

- `apps/server/src/users.ts` — no lo he leído. Asumo que existe y que `UserService` tiene `getById`, `list`, `create`, `update`, `verifyCredentials`. Si no, hay que ajustar.
- `apps/server/src/auth.ts` — no lo he leído. Asumo `owner`, `verify`, `session`. Si no, hay que ajustar.
- `apps/server/src/engine/presence.ts` — no lo he leído. Asumo `globalPresence` con `touch`, `leave`, `list`. Si no, hay que ajustar.
- `apps/server/src/engine/edit-lock.ts` — no lo he leído. Asumo `globalEditLock` con `acquire`, `release`. Si no, hay que ajustar.
- `apps/server/src/engine/agents/personas/registry.ts` — no lo he leído. Asumo `PersonaRegistry` con `resolve`, `resolveAllSkins`. Si no, hay que ajustar.
- `apps/server/src/engine/agents/personas/activity.ts` — no lo he leído. Asumo `activityForPersona`. Si no, hay que ajustar.
- `apps/server/src/actions.ts` — no lo he leído. Asumo `ActionService` con `propose`, `decide`, `retry`. Si no, hay que ajustar.
- `apps/server/src/engine/routes.ts` — lo he visto parcialmente. Asumo los handlers de `tasks`, `goals`, `monitors`, `memories`, `roles`, `identity`, `notifications`. Si no, hay que ajustar.
- `packages/domain/src/business.ts` — no lo he leído. Asumo `BusinessEntity`, `BusinessRelation`. Si no, hay que ajustar.
- `apps/server/src/kernel/context/kernel-context.ts` — no lo he leído. Asumo `KernelContext` con `tenantId`, `owner`, `role`, `requestId`, `personaId`. Si no, hay que ajustar.

Cuando Copilot termine el audit, contrasta esto con lo suyo. Si coincide en lo que existe y en lo que hay que crear, el mapa es bueno. Si Copilot encuentra algo que yo no he visto (porque el árbol está incompleto o porque el fichero tiene otra estructura), su audit gana. Y con el suyo y el mío, el `PLAN-CAMPANA-2.md` sale con ficheros reales, no con suposiciones.