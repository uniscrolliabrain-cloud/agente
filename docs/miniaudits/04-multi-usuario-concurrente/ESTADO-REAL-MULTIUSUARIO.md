# ESTADO_REAL_MULTIUSUARIO_V1

Estado real del codigo frente a la spec de la Campana 2 (Multiusuario), v5, 2026-10-22.

Verificado con Invoke-F0_VerificarHechos. 26 hechos comprobados, 0 errores.

## Identidad (F1)

| Elemento | Estado | Evidencia |
|---|---|---|
| User.authProviderId | NO EXISTE | users.ts: userSchema sin authProviderId |
| User.managerId | NO EXISTE | users.ts: userSchema sin managerId |
| User.fieldClassification | NO EXISTE | users.ts: userSchema sin fieldClassification |
| Auth.owner | EXISTE | auth.ts: async owner( confirmado |
| verifyJwtMiddleware | NO EXISTE | auth.ts no lo tiene |
| KernelContext.actorId | NO EXISTE | kernel-context.ts sin actorId |
| KernelContext.sessionId | NO EXISTE | kernel-context.ts sin sessionId |
| ExecutionContext.actorId | NO EXISTE | execution-context.ts sin actorId |
| x-user-id | EXISTE, NO AUTORIZA | 10 usos en apps/server/src/ |
| AgentPersona.reportsTo | EXISTE | agent-persona.ts con reportsTo |
| AgentPersona.peers | EXISTE | agent-persona.ts con peers |
| AgentRole.reportsTo | NO EXISTE | agent.ts: AgentRole sin reportsTo |
| AgentRole.peers | NO EXISTE | agent.ts: AgentRole sin peers |

## Acceso (F2)

| Elemento | Estado | Evidencia |
|---|---|---|
| Policy con effect | NO EXISTE | PolicyEngine.can sin effect |
| PolicyAction con execute | NO EXISTE | Enum sin execute |
| PolicyDecisionPoint | NO EXISTE | No hay engine/authz/pdp.ts |
| withRead/withWrite | NO EXISTE | No hay engine/authz/with-read.ts ni with-write.ts |
| FieldClassification | NO EXISTE | No hay classification.ts |
| FieldFilter | NO EXISTE | No hay engine/authz/field-filter.ts |

## Delegacion (F3)

| Elemento | Estado | Evidencia |
|---|---|---|
| Assignment | NO EXISTE | No hay assignment.ts |
| Flow | NO EXISTE | No hay flow.ts |
| AssignmentService | NO EXISTE | No hay engine/assignments/service.ts |
| AssignmentRegistry | NO EXISTE | No hay engine/assignments/registry.ts |
| 5 adapters | NO EXISTEN | No hay engine/assignments/adapters/ |
| AgentTask.assignedBy | NO EXISTE | agent.ts: AgentTask sin assignedBy |
| AgentTask.assignmentKind | NO EXISTE | agent.ts: AgentTask sin assignmentKind |

## Consistencia (F4)

| Elemento | Estado | Evidencia |
|---|---|---|
| AgentTask.version | NO EXISTE | agent.ts: AgentTask sin version |
| BusinessEntity.version | EXISTE | business.ts: version: z.number |
| ConflictDiff/ConflictVersion/ConflictResolution | NO EXISTE | No hay conflict.ts |
| withWrite con CAS | NO EXISTE | No hay with-write.ts |
| THREAD_CONFLICT_DIFF_V1 | EXISTE | threads-routes.ts con la marca |
| PROJECT_CONFLICT_DIFF_V1 | EXISTE | projects-routes.ts con la marca |
| db.compareAndSwap | EXISTE | db.ts con compareAndSwap |

## Coordinacion (F5)

| Elemento | Estado | Evidencia |
|---|---|---|
| globalPresence | EXISTE, IN-MEMORY | presence.ts con globalPresence |
| globalEditLock | EXISTE, IN-MEMORY | edit-lock.ts con globalEditLock |
| PresenceStore sobre Store | NO EXISTE | No hay presence-store.ts |
| EditLockStore sobre Store | NO EXISTE | No hay edit-lock-store.ts |
| ReplayBuffer | NO EXISTE | No hay engine/events/replay-buffer.ts |
| Notification.visibility/priority | NO EXISTE | notifications-stream.ts sin visibility ni priority |
| SSE Last-Event-ID | NO EXISTE | notifications-stream.ts sin Last-Event-ID |

## Trazabilidad (F6)

| Elemento | Estado | Evidencia |
|---|---|---|
| AuditTrail de reads sensibles | NO EXISTE | No hay engine/audit-trail/service.ts |
| RecordHistory | NO EXISTE | No hay engine/history/record-history.ts |
| action-audit con actorId | NO EXISTE | actions.ts: audit sin actorId |
| run-events con actorId | NO EXISTE | worker.ts: busEvent sin actorId |
| audit-entries con field/classification/allowed | NO EXISTE | store-store.ts: payload sin estos campos |
| retention-purge respeta audit-entries | NO | Purga audit-entries a 90 dias. Contradice SOC-2. |

## Cierre (F7)

| Elemento | Estado | Evidencia |
|---|---|---|
| tests/campaign-2/ | NO EXISTE | No hay directorio |
| KNOWN_ISSUES.md | NO EXISTE | No hay |
| CIERRE-MVP.md | NO EXISTE | No hay |

## Leyenda

- EXISTE: confirmado en codigo con Select-String o lectura directa.
- NO EXISTE: confirmado ausencia en el arbol.
- PARCIAL: existe pero no cumple el contrato completo.
- IN-MEMORY: existe pero no persiste (se pierde al reiniciar).
