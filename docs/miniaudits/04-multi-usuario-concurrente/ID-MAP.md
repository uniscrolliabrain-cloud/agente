# ID_MAP_MULTIUSUARIO_V1

Mapa de identificadores de la Campana 2 (Multiusuario).

## Identificadores

| ID | Que es | Donde vive | Generado por | Consumido por |
|---|---|---|---|---|
| User.id | UUID interno del usuario humano | system/users (Store) | randomUUID en UserService.create | Auth.owner, ActorService.resolve, TenantService.tenantIdFor |
| User.email | Email unico del usuario | system/users | UserService.create (lowercase) | UserService.getByEmail, verifyCredentials |
| User.authProviderId | sub de Supabase vinculado al User | system/users (nuevo en F1) | Backfill controlado (no por email) | UserService.getByAuthProviderId, ActorService.resolve |
| Actor.id | ID de la vista derivada Actor | No persiste | ActorService.resolve | ctx.actor.id, withRead/withWrite, audit.append |
| Actor.kind | human o agent | No persiste | ActorService.resolve | PDP, withRead/withWrite |
| AgentActor.id | runtimeId de la instancia del agente | No persiste | AgentRuntimeManager (randomUUID por spawn) | AuditTrail, AssignmentService, worker |
| AgentActor.roleId | AgentRole.id que ejecuta | No persiste | ActorService.resolveAgent | AgentGovernance, PolicyEngine |
| AgentActor.personaId | AgentPersona.id si aplica | No persiste | ActorService.resolveAgent | Flow, personas/routes.ts |
| tenantId | ID del tenant | system/tenant-membership | TenantService.setMembership | TenantScopedStore, KernelContext.tenantId, ExecutionContext.tenantId |
| owner | Ambito de almacenamiento | Compuesto por TenantScopedStore | TenantScopedStore.peel | db.get, db.put, db.list |
| requestId | ID de la peticion HTTP | KernelContext.requestId, ExecutionContext.requestId | Middleware de request | audit.append, run-events |
| sessionId | ID de la sesion JWT | KernelContext.sessionId (nuevo en F1) | jwtPayload.session_id | audit.append, withRead/withWrite |
| correlationId | Agrupa operaciones de un mismo flujo | KernelContext.correlationId | Middleware o cliente | audit.append, run-events, events |
| executingActorId | Actor que ejecuta (agente) | AgentTask.assignedTo o task.state.roleId | TaskWorker | bus.emit, audit.append, run-events |
| requestingActorId | Actor que delego (humano) | AgentTask.assignedBy (nuevo en F3) | AgentService.createTask | bus.emit, audit.append, run-events |
| Assignment.id | kind:recordId | No persiste | toAssignment del adapter | GET /api/assignments/:kind/:id |
| ActionProposal.id | UUID o hash de idempotencyKey | actions (Store) | ActionService.propose | ActionService.decide, action-audit |
| AuditEntry.id | ID del registro de auditoria | audit-entries (Store) | StoreAuditStore.append | GET /actions/:id/audit |

## Reglas

- owner no es actor.id. owner es ambito de almacenamiento. actor.id es identidad.
- User.id no es sub. Se vinculan con User.authProviderId. Sin JIT: sub sin User devuelve 401.
- AgentActor.id = runtimeId, no roleId. Dos ejecuciones del mismo rol son dos actores distintos.
- executingActorId no es requestingActorId. El primero ejecuta, el segundo delega.
- Assignment.id = kind:recordId. Unico entre kinds, reconstruible desde el record.
- tenantId se resuelve en servidor, no se confia del cliente.
- requestId, sessionId y correlationId se propagan, no se inventan.
