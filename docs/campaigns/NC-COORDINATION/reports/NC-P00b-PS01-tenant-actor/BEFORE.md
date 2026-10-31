# BEFORE — NC-P00b / PS-01: contexto durable de tenant y actor

| Campo | Valor |
| --- | --- |
| Unidad | NC-P00b / PS-01 |
| Tipo | Informe previo y propuesta de alcance (**no** implementación) |
| Fecha | 2026-10-30 |
| Base | `main` **4f81f22** (sin commits posteriores al hacer `git fetch`) |
| Rama | `campaign/nc-p00b-ps01-tenant-actor` |
| Worktree | `C:\Users\Alfonso\Desktop\git hub repos\agente-nc-ps01` (sparse: solo docs) |
| Autor | Implementador Freebuff |
| Asignación de Codex | **No recibida**. Propuesta conforme a §4 del handoff |
| Estado | `proposal_pending_assignment` |

## 1. Objetivo y criterio de cierre

Cerrar el recorrido **creación → reclamación → reanudación → reinicio** de una tarea durable conservando `tenantId` y actor, sin reconstruirlos desde la membership primaria.

Cierre = una tarea creada en la empresa B por un usuario cuya membership primaria es A se ejecuta, escribe y emite eventos en B antes y después de un reinicio; una tarea antigua sin actor demostrado se ejecuta y se marca `legacy`; la ruta con la capacidad cognitiva apagada se comporta igual que hoy.

## 2. Asignación y reservas

- No hay asignación formal de Codex ni reserva activa. Este documento **no autoriza** a editar.
- Depende de que el jefe VS acepte NC-BR-001 y de que Codex asigne la unidad y confirme la base.
- Si Codex asigna otra unidad, este informe queda como propuesta y no consume ninguna reserva.

## 3. Alcance propuesto

**Allowlist (7 paths):**

- `apps/server/src/engine/worker.ts`
- `apps/server/src/engine/model.ts` ← **no estaba en NC-BR-001 original; ver §13**
- `apps/server/src/engine/service.ts`
- `packages/domain/src/agent.ts`
- `packages/domain/src/index.ts` (solo si se exporta el tipo nuevo)
- `tests/cognition/foundation/task-context.test.ts` (nuevo)
- `docs/campaigns/NC-COORDINATION/reports/NC-P00b-PS01-tenant-actor/{BEFORE,AFTER}.md`

**Fuera del alcance:** `app.ts`, `tenant-scope.ts`, `db.ts`, `db-tenant.ts`, `events/**`, `context/**`, `memory.ts`, kernel, auth, canales, OAuth, billing, UI, `package.json`, lockfiles.

No se cambia la firma de `createTask` ni la de `TaskWorker.run`; el contexto viaja por `AsyncLocalStorage`.

## 4. Comportamiento actual comprobado

Lectura estática en `4f81f22`.

1. **Creación.** `createTask` calcula `tenantIdForGuard = currentTenantScope()?.tenantId ?? tenantIdFor(owner) ?? owner` (`service.ts:1236`) y persiste `tenantId` (`:1274`). `assignedTo` cae a `owner` (`:1279`), así que casi toda tarea parece tener responsable.
2. **Ejecución.** `TaskWorker.tick` escanea `tasks` por estado (`worker.ts:181`) y `run` ejecuta sin abrir scope (`:242`). El actor se calcula como `assignedTo ?? task.state.roleId ?? owner` (`:372`) y `compat = task.assignedTo || task.assignedBy ? "real" : "legacy"` (`:374`). Como `assignedTo` siempre existe, **`compat` es siempre `"real"`**, incluso cuando la identidad es un fallback.
3. **Scope del Store.** `TenantScopedStore` resuelve `` `${tenantId}:${owner}` `` con `currentTenantScope()?.tenantId ?? tenantIdFor(owner)` (`app.ts:103`, `db-tenant.ts:18`). En el worker no hay scope, así que manda la membership; `TenantService` cae a `"default"` y lo cachea (`tenant.ts:92`).
4. **Kernel y cuotas.** `model.ts` construye el `KernelContext` con `tenantIdFor(owner)` (`model.ts:46`) e `initial.tenantId` **no se usa**; el actor del kernel es `assignedTo` (`:54`); las cuotas usan `tenantIdFor(owner)` (`:530`). Es decir, el turno cognitivo y el consumo se atribuyen a la membership, no a la tarea.
5. **Mantenimiento.** `maintainTenant(tenantId)` escanea owners bajo el prefijo del tenant, pero luego descarta los que no tienen ese tenant como membership primaria (`service.ts:2559-2563`). Un usuario con datos en B y membership primaria A **no se mantiene en B**.
6. **Creación en segundo plano.** Monitores e ideas crean tareas desde `maintain`/`refreshIdeas` (`service.ts:1634`, `:1827`) sin scope explícito; el tenant se resuelve por membership.
7. **Precedente correcto.** La gobernanza de SOP ya usa `task.tenantId` (`sop-executor.ts:537`), y `dead-letter.ts:45` también. El patrón existe; falta aplicarlo al resto del recorrido.

## 5. Defecto concreto

Una tarea creada en B por un usuario cuya membership primaria es A:

- se reclama y ejecuta con el Store resuelto a A;
- escribe `run-events`, `runs`, `outcome` y eventos en A;
- abre el turno del kernel y consume cuota en A;
- etiqueta la identidad como `"real"` aunque sea un fallback.

Tras un reinicio, el worker no tiene forma de recuperar B: `task.tenantId` existe pero no se usa para el scope. Es el fallo que VS-01 describe literalmente (`CAMPANA-VERTICAL-AGNTIA.md:70`).

## 6. Solución mínima propuesta

1. **Contrato aditivo.** En `AgentTask`: `requestedBy?: string` y `requestedActorKind?: "human" | "agent" | "system"`. `tenantId` ya es obligatorio; no se renombra.
2. **Creación.** `createTask` persiste `requestedBy` desde `currentTenantScope()?.actorId`. No inventa actor: si no hay scope, queda ausente. No cambia la firma.
3. **Ejecución.** `TaskWorker.run` se invoca dentro de `runInTenantScope({ tenantId: task.tenantId, actorId })`, con `actorId = task.requestedBy ?? task.assignedTo ?? owner`. El scope se restaura desde la tarea, no desde la membership.
4. **Kernel y cuotas.** `model.ts` usa `initial.tenantId` para `KernelContext` y para las cuotas; si el registro es antiguo y no lo tiene, cae a `tenantIdFor(owner)` y lo marca `legacy` en el payload del evento.
5. **Identidad honesta.** `compat` pasa a depender de `requestedBy`/`requestedActorKind`, no de `assignedTo`. `assignedTo` conserva su significado actual (ejecutor), no se reutiliza como solicitante.
6. **Fondo.** `maintainTenant` deja de filtrar por membership primaria (las filas ya están bajo el prefijo del tenant) y envuelve `maintainOwner` en el scope del tenant con actor `system`; las rutas de creación de monitores/ideas heredan ese scope.

**Sin cambios** en bus, DB, auth, eventos, memoria ni contexto.

## 7. Contratos reutilizados y cambios de firma

- `KernelContext` (`kernel/context/kernel-context.ts:15-30`): ya tiene `tenantId`, `owner`, `actorId`, `correlationId`.
- `ExecutionContext` y `PersistedTaskContext` propuestos en `CONTRACT-CANDIDATES.md` §2-3; esta unidad solo materializa los campos de `AgentTask`.
- `runInTenantScope` (`tenant-scope.ts:21`) sin cambios.
- `AgentTask.id/version` para CAS, sin cambios.
- `createTask` y `TaskWorker.run`: **sin cambio de firma**.

## 8. Impacto

- **Núcleo:** el turno del kernel, la cuota y los eventos de una tarea quedan en el tenant correcto; base para NC-P02.
- **Vertical:** cierra el núcleo de VS-01; no duplica su trabajo, lo entrega como base común.
- **Datos existentes:** no se reescriben tareas. Las creadas con tenant incorrecto no se pueden corregir por inferencia; se documentará el límite.

## 9. Pruebas previstas

| Prueba | Resultado exigido |
| --- | --- |
| Usuario en A y B crea tarea en B | `tasks`, `run-events`, `runs`, `outcome`, `llm-usage`, turno/thought y eventos bajo `B` |
| Reinicio simulado entre `createTask` y `claim` | la ejecución sigue en B; no consulta `tenantIdFor` para decidir |
| Tarea antigua sin `requestedBy` | ejecuta; `compat: "legacy"`; no se le atribuye identidad real |
| Evento de tarea | `actorId` = solicitante; `assignedTo` sigue siendo el ejecutor |
| Conexión de A | no se resuelve desde una tarea de B |
| `maintainTenant(B)` | incluye owners con datos en B aunque su membership primaria sea A |
| Flag cognitiva apagada | equivalencia con el comportamiento actual |

Las pruebas de aislamiento usarán Store real del repo (PGlite) y dos tenants sintéticos; no mocks de Store.

## 10. Compatibilidad y migración

- Campos nuevos opcionales; registros antiguos siguen ejecutando.
- `tenantId` existe desde `TASK_TENANT_REQUIRED_V1`, pero el backfill es `'default'`: no se puede distinguir un `'default'` legítimo de uno de relleno. No se migra por inferencia; se trata como `legacy`.
- Sin migración de datos en esta unidad.
- Los turnos ya abiertos conservan su tenant; no se reescriben.

## 11. Riesgos y rollback

| Riesgo | Mitigación |
| --- | --- |
| El scope se filtra a timers globales creados dentro de `run` | el `heartbeat` se crea dentro del run y se limpia en su cierre; probar que no afecta a ticks posteriores |
| Cambiar la atribución de cuotas altera límites existentes | es el comportamiento correcto; se documenta y se prueba con dos tenants |
| `assignedTo` no es el solicitante | no se usa como `requestedBy`; se mantiene como ejecutor |
| Tareas históricas en tenant incorrecto | no se reescriben; se marca el límite y se ofrece reasignación manual |
| `runInTenantScope` no cubre código que crea recursos antes del run | el scope se abre antes de `run`, no solo antes del handler |

**Rollback:** revertir el wrapper de scope, el uso de `initial.tenantId` en `model.ts`, los campos aditivos y el filtro de `maintainTenant`. Los datos escritos en el tenant correcto siguen siendo válidos.

## 12. Incertidumbres y decisiones para Codex

1. ¿Se acepta incluir `model.ts` en PS-01, o se separa en una unidad posterior? Sin él, el turno del kernel y la cuota siguen en la membership.
2. ¿El actor `system` para mantenimiento se representa con `requestedBy: "system"` o se deja ausente con `requestedActorKind: "system"`? Propongo lo segundo para no inventar un usuario.
3. ¿Se corrige también `maintainTenant` en esta unidad o se aplaza? Afecta al mismo recorrido de VS-01; propongo incluirlo.
4. ¿VS exige que las conexiones se resuelvan con `task.tenantId` en esta misma PR? `WorkspaceService.connection(owner)` ya usa el Store scoped, así que el scope del worker debería bastar; falta probarlo.
5. ¿La prueba de reinicio se simula cerrando y recreando `AgentService` sobre el mismo Store, o se exige un proceso aparte? Propongo lo primero para el test unitario y documentar que no es un reinicio de sistema.

## 13. Corrección respecto a NC-P00a

El mapa y NC-BR-001 se centraron en `worker.ts`. Al preparar esta unidad aparece un segundo punto obligatorio: `model.ts:46-54` reconstruye el tenant del `KernelContext` desde la membership e ignora `initial.tenantId`, y `model.ts:530` hace lo mismo con las cuotas. Además, `maintainTenant` filtra owners por membership primaria (`service.ts:2559-2563`).

No modifico la rama de NC-P00a, que está en revisión. Propongo que Codex actualice NC-BR-001 y la allowlist de PS-01 con `model.ts` y el ajuste de mantenimiento al revisar este BEFORE.

## 14. Hechos frente a hipótesis

- **Hechos:** todas las referencias `archivo:línea` de §4.
- **Hipótesis:** que envolver `run` en `runInTenantScope` cubre todo el árbol asíncrono del handler (comprobable con la prueba de dos tenants) y que `WorkspaceService.connection` queda aislada por ese mismo scope.
- **No comprobado:** el comportamiento exacto de tareas históricas con `tenantId: "default"` y el efecto de la corrección de cuotas en límites ya consumidos.
