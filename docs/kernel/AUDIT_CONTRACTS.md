# Auditoria de contratos del dominio

> Generado por `scripts/audits/contracts.ts` el 2026-10-03T15:43:47.811Z.

- Contratos totales: **212**
- Con implementacion real: **78**
- Marcados PENDING o STUB: **13**
- Sin implementacion y sin marca: **121** (esto es lo que hay que arreglar)

## Sin implementacion y sin marca PENDING

| Contrato | Fichero | Tipo |
|---|---|---|
| `actionSpecSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | schema |
| `AgentMessage` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\messaging.ts` | type |
| `AgentMessageIntent` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\messaging.ts` | type |
| `AgentRoleInput` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | type |
| `AgentRoleMemoryPolicy` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | interface |
| `AgentRolePermission` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | interface |
| `AgentRuntime` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\runtime.ts` | type |
| `agentRuntimeSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\runtime.ts` | schema |
| `ApprovalRequest` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\messaging.ts` | type |
| `ApprovalStatus` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\messaging.ts` | type |
| `BusinessEntityDecl` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business.ts` | type |
| `businessEntityDeclSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business.ts` | schema |
| `BusinessEntityPublic` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business.ts` | interface |
| `businessFieldSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business.ts` | schema |
| `BusinessRelationDecl` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business.ts` | type |
| `businessRelationDeclSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business.ts` | schema |
| `BusinessSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business.ts` | type |
| `businessSchemaSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business.ts` | schema |
| `BusinessSchemaV2` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business-schema.ts` | type |
| `businessSchemaV2Schema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business-schema.ts` | schema |
| `capabilityContractSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\capability.ts` | schema |
| `CapabilityCost` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\capability.ts` | type |
| `capabilityCostSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\capability.ts` | schema |
| `CapabilityRisk` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\capability.ts` | type |
| `capabilityRiskSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\capability.ts` | schema |
| `CapabilitySideEffect` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\capability.ts` | type |
| `capabilitySideEffectSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\capability.ts` | schema |
| `columnSpecSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | schema |
| `CreateTaskInput` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | type |
| `dataSourceSpecSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | schema |
| `EmailDraft` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | type |
| `EntityCandidate` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\entity-resolution.ts` | type |
| `entityCandidateSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\entity-resolution.ts` | schema |
| `EntityDefinition` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business-schema.ts` | type |
| `entityDefinitionSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business-schema.ts` | schema |
| `EntityMatch` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\entity-resolution.ts` | type |
| `entityMatchSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\entity-resolution.ts` | schema |
| `EventDraft` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | type |
| `ExecutionBackend` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | interface |
| `executionContextSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\execution-context.ts` | schema |
| `ExecutionRole` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\execution-context.ts` | type |
| `executionRoleSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\execution-context.ts` | schema |
| `FailureLesson` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\learning.ts` | type |
| `failureLessonSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\learning.ts` | schema |
| `FieldDefinition` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business-schema.ts` | type |
| `fieldDefinitionSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business-schema.ts` | schema |
| `FieldPolicy` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\policy-context.ts` | type |
| `fieldPolicySchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\policy-context.ts` | schema |
| `FieldType` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business-schema.ts` | type |
| `fieldTypeSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business-schema.ts` | schema |
| `formFieldSpecSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\form-spec.ts` | schema |
| `formFieldSpecSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | schema |
| `formSpecSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\form-spec.ts` | schema |
| `formSpecSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | schema |
| `GoalConstraint` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\goal.ts` | type |
| `goalConstraintSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\goal.ts` | schema |
| `GoalPriority` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\goal.ts` | type |
| `goalPrioritySchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\goal.ts` | schema |
| `goalSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\goal.ts` | schema |
| `GoalStatus` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\goal.ts` | type |
| `goalStatusSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\goal.ts` | schema |
| `KernelPort` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\kernel.ts` | interface |
| `KernelThought` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\kernel.ts` | interface |
| `KernelWriterPort` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\kernel.ts` | interface |
| `KnowledgeKind` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\truth.ts` | type |
| `knowledgeKindSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\truth.ts` | schema |
| `LearningFact` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\learning.ts` | type |
| `learningFactSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\learning.ts` | schema |
| `LearningPattern` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\learning.ts` | type |
| `learningPatternSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\learning.ts` | schema |
| `OutcomeEvidence` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\outcome.ts` | type |
| `outcomeEvidenceSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\outcome.ts` | schema |
| `OutcomeMetric` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\outcome.ts` | type |
| `outcomeMetricSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\outcome.ts` | schema |
| `outcomeSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\outcome.ts` | schema |
| `OutcomeStatus` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\outcome.ts` | type |
| `outcomeStatusSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\outcome.ts` | schema |
| `PlanStatus` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\plan.ts` | type |
| `PlanStepStatus` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\plan.ts` | type |
| `PolicyActionV2` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\policy-context.ts` | type |
| `policyContextSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\policy-context.ts` | schema |
| `ProceduralLearning` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\learning.ts` | type |
| `proceduralLearningSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\learning.ts` | schema |
| `ProvenanceChip` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\context-chips.ts` | type |
| `provenanceChipKindSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\context-chips.ts` | schema |
| `provenanceChipSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\context-chips.ts` | schema |
| `provenanceChipSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | schema |
| `provenanceSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business.ts` | schema |
| `ReactionAction` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\policy-context.ts` | type |
| `reactionActionSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\policy-context.ts` | schema |
| `ReactionCondition` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\policy-context.ts` | type |
| `reactionConditionSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\policy-context.ts` | schema |
| `reactionDefinitionSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\reaction.ts` | schema |
| `ReactionRule` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\policy-context.ts` | type |
| `reactionRuleSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\policy-context.ts` | schema |
| `ReactionTarget` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\reaction.ts` | type |
| `reactionTargetSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\reaction.ts` | schema |
| `ReactionTrigger` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\reaction.ts` | type |
| `reactionTriggerSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\reaction.ts` | schema |
| `RelationDefinition` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business-schema.ts` | type |
| `relationDefinitionSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business-schema.ts` | schema |
| `RuntimeCheckpoint` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\runtime.ts` | type |
| `runtimeCheckpointSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\runtime.ts` | schema |
| `RuntimePhase` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\runtime.ts` | type |
| `runtimePhaseSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\runtime.ts` | schema |
| `Section` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | type |
| `SignupRequest` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\signup.ts` | type |
| `sopStepSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\sop.ts` | schema |
| `StateDefinition` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business-schema.ts` | type |
| `stateDefinitionSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business-schema.ts` | schema |
| `SuccessCriterion` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\goal.ts` | type |
| `successCriterionSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\goal.ts` | schema |
| `truthCandidateSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\truth.ts` | schema |
| `truthResolutionSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\truth.ts` | schema |
| `verificationResultSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\verification.ts` | schema |
| `ViewKind` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | type |
| `viewKindSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | schema |
| `viewSpecSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | schema |
| `WorkspaceMode` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | type |
| `workspaceSectionSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | schema |
| `workspaceSpecSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | schema |

## Marcados PENDING o STUB

| Contrato | Fichero | Tipo |
|---|---|---|
| `agentAvatarSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | schema |
| `agentMemoryKindSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | schema |
| `agentMessageIntentSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\messaging.ts` | schema |
| `agentMessageSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\messaging.ts` | schema |
| `agentRoleMemorySchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | schema |
| `agentToneSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | schema |
| `approvalRequestSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\messaging.ts` | schema |
| `approvalStatusSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\messaging.ts` | schema |
| `handoffSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\messaging.ts` | schema |
| `planSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\plan.ts` | schema |
| `planStatusSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\plan.ts` | schema |
| `planStepSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\plan.ts` | schema |
| `planStepStatusSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\plan.ts` | schema |

## Con implementacion real

| Contrato | Fichero | Implementado en |
|---|---|---|
| `ActionProposal` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | `apps\server\src\actions.ts`, `apps\server\src\engine\service.ts`, `apps\server\src\workspace.ts`, `apps\web\src\api\actions.ts`, `apps\web\src\api\index.ts` |
| `ActionSpec` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | `apps\web\src\view\spec.ts` |
| `ActivityEntry` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | `apps\server\src\workspace.ts` |
| `AgentArtifact` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\service.ts`, `apps\server\src\projects-routes.ts`, `apps\web\src\api\index.ts`, `apps\web\src\types\api.ts` |
| `AgentAvatar` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\web\src\api\agents.ts` |
| `AgentIdentity` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\routes.ts`, `apps\server\src\engine\service.ts` |
| `AgentMemory` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\context\engine.ts`, `apps\server\src\engine\memory.ts`, `apps\server\src\engine\provenance.ts`, `apps\server\src\engine\routes.ts`, `apps\server\src\engine\service.ts` |
| `AgentMemoryKind` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\web\src\api\agents.ts` |
| `AgentNotification` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\routes.ts`, `apps\server\src\engine\service.ts`, `apps\web\src\hooks\useNotifications.ts` |
| `AgentRole` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\actions.ts`, `apps\server\src\admin-clients.ts`, `apps\server\src\admin-tenants.ts`, `apps\server\src\engine\agents\governance.ts`, `apps\server\src\engine\context\engine.ts` |
| `AgentRoleMemory` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\web\src\api\agents.ts`, `apps\web\src\components\AgentsView.tsx` |
| `AgentRolePublic` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\service.ts` |
| `agentRoleSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\routes.ts`, `apps\server\src\engine\service.ts` |
| `AgentTask` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\admin-clients.ts`, `apps\server\src\admin-tenants.ts`, `apps\server\src\engine\execution\tool-executors.ts`, `apps\server\src\engine\learning.ts`, `apps\server\src\engine\model.ts` |
| `AgentTone` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\web\src\api\agents.ts` |
| `AgentWorkspace` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\service.ts`, `apps\web\src\api\index.ts`, `apps\web\src\api\tasks.ts`, `apps\web\src\types\api.ts` |
| `Artifact` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | `apps\server\src\engine\service.ts`, `apps\server\src\files.ts`, `apps\server\src\projects-routes.ts`, `apps\server\src\workspace.ts` |
| `BrowserSession` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | `apps\server\src\browser.ts`, `apps\server\src\engine\service.ts`, `apps\server\src\workspace.ts` |
| `BusinessEntity` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business.ts` | `apps\server\src\engine\business\graph.ts`, `apps\server\src\engine\business\resolver.ts`, `apps\server\src\engine\business\truth.ts`, `apps\server\src\engine\context\engine.ts`, `apps\server\src\engine\provenance.ts` |
| `businessEntitySchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business.ts` | `apps\server\src\business-routes.ts`, `apps\server\src\engine\business\graph.ts` |
| `BusinessRelation` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\business.ts` | `apps\server\src\engine\business\graph.ts`, `apps\server\src\engine\context\engine.ts`, `apps\web\src\api\business.ts` |
| `CalendarEvent` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | `apps\server\src\actions.ts`, `apps\server\src\workspace.ts` |
| `CapabilityContract` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\capability.ts` | `apps\server\src\engine\capabilities\registry.ts` |
| `ColumnSpec` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | `apps\web\src\view\spec.ts` |
| `ComputerCommand` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\computer.ts` | `apps\server\src\computer.ts` |
| `ComputerDirectory` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\computer.ts` | `apps\server\src\computer.ts` |
| `ComputerSnapshot` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\computer.ts` | `apps\server\src\computer.ts` |
| `Connection` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | `apps\server\src\notifications-stream.ts` |
| `createTaskSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\conversation.ts`, `apps\server\src\engine\service.ts` |
| `DataSourceSpec` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | `apps\web\src\view\spec.ts` |
| `emailDraftSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | `apps\server\src\app.ts`, `apps\server\src\engine\model.ts`, `apps\server\src\engine\sop-executor.ts` |
| `Evidence` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\service.ts`, `apps\web\src\types\api.ts` |
| `ExecutionContext` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\execution-context.ts` | `apps\server\src\engine\execution\capability-runner.ts`, `apps\server\src\engine\execution\executor.ts`, `apps\server\src\engine\execution\tool-executors.ts`, `apps\server\src\engine\orchestrator\orchestrator.ts`, `apps\server\src\engine\reactions\engine.ts` |
| `FormFieldSpec` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\form-spec.ts` | `apps\server\src\engine\form-builder.ts` |
| `FormFieldSpec` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | `apps\server\src\engine\form-builder.ts` |
| `FormSpec` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\form-spec.ts` | `apps\server\src\engine\form-builder.ts`, `apps\web\src\forms\FormRenderer.tsx`, `apps\web\src\forms\spec.ts` |
| `FormSpec` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | `apps\server\src\engine\form-builder.ts`, `apps\web\src\forms\FormRenderer.tsx`, `apps\web\src\forms\spec.ts` |
| `Goal` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\learning\observer.ts`, `apps\server\src\engine\orchestrator\orchestrator.ts`, `apps\server\src\engine\planner\llm-planner.ts`, `apps\server\src\engine\planner\planner.ts`, `apps\server\src\engine\planner\replanner.ts` |
| `Goal` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\goal.ts` | `apps\server\src\engine\learning\observer.ts`, `apps\server\src\engine\orchestrator\orchestrator.ts`, `apps\server\src\engine\planner\llm-planner.ts`, `apps\server\src\engine\planner\planner.ts`, `apps\server\src\engine\planner\replanner.ts` |
| `goalInputSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\conversation.ts`, `apps\server\src\engine\service.ts` |
| `Handoff` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\messaging.ts` | `apps\server\src\engine\handoff\service.ts` |
| `Idea` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\service.ts` |
| `KernelContext` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\kernel.ts` | `apps\server\src\engine\conversation.ts`, `apps\server\src\engine\model.ts`, `apps\server\src\engine\service.ts`, `apps\server\src\engine\sop-executor.ts`, `apps\server\src\kernel\authors\fast-author.ts` |
| `KernelRole` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\kernel.ts` | `apps\server\src\kernel\context\kernel-context.ts`, `apps\server\src\kernel\index.ts` |
| `KernelTurn` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\kernel.ts` | `apps\server\src\engine\sop-executor.ts` |
| `Mail` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | `apps\server\src\demo\model.ts`, `apps\server\src\engine\conversation.ts`, `apps\server\src\engine\service.ts`, `apps\server\src\workspace.ts` |
| `MatchReason` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\entity-resolution.ts` | `apps\server\src\kernel\graph\thought.ts` |
| `matchReasonSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\entity-resolution.ts` | `apps\server\src\kernel\graph\thought.ts` |
| `MemoryCategory` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\context\engine.ts`, `apps\server\src\engine\memory.ts` |
| `Monitor` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\service.ts` |
| `Outcome` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\outcome.ts` | `apps\server\src\engine\learning\observer.ts`, `apps\server\src\engine\orchestrator\orchestrator.ts`, `apps\server\src\engine\verification\llm-verifier.ts`, `apps\server\src\engine\verification\verifier.ts` |
| `Plan` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\plan.ts` | `apps\server\src\engine\execution\executor.ts`, `apps\server\src\engine\learning\observer.ts`, `apps\server\src\engine\orchestrator\orchestrator.ts`, `apps\server\src\engine\planner\llm-planner.ts`, `apps\server\src\engine\planner\planner.ts` |
| `PlanStep` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\plan.ts` | `apps\server\src\engine\execution\capability-runner.ts`, `apps\server\src\engine\execution\executor.ts`, `apps\server\src\engine\planner\planner.ts` |
| `policyActionSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\policy-context.ts` | `apps\server\src\engine\policy\engine.ts` |
| `PolicyContext` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\policy-context.ts` | `apps\server\src\engine\policy\engine.ts` |
| `Project` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\memory.ts`, `apps\server\src\projects-routes.ts`, `apps\web\src\api\projects.ts`, `apps\web\src\hooks\useProjects.ts` |
| `ProjectBlock` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\projects-routes.ts`, `apps\web\src\api\projects.ts`, `apps\web\src\components\ProjectsView.tsx`, `apps\web\src\hooks\useProjects.ts` |
| `ProjectStatus` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\projects-routes.ts`, `apps\web\src\api\projects.ts`, `apps\web\src\components\ProjectsView.tsx`, `apps\web\src\hooks\useProjects.ts` |
| `ProposalInput` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | `apps\server\src\actions.ts`, `apps\server\src\engine\service.ts`, `apps\server\src\workspace.ts` |
| `proposalSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | `apps\server\src\actions.ts`, `apps\server\src\app.ts` |
| `ProvenanceChipKind` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\context-chips.ts` | `apps\server\src\engine\provenance.ts`, `apps\web\src\components\ProvenanceBadge.tsx`, `apps\web\src\forms\FormRenderer.tsx` |
| `ReactionDefinition` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\reaction.ts` | `apps\server\src\engine\reactions\engine.ts` |
| `RunEvent` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\server\src\engine\service.ts`, `apps\server\src\engine\worker.ts`, `apps\web\src\api\index.ts`, `apps\web\src\types\api.ts` |
| `signupRequestSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\signup.ts` | `apps\server\src\auth-signup.ts` |
| `SOP` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\sop.ts` | `apps\server\src\admin-clients.ts`, `apps\server\src\engine\capabilities\bootstrap.ts`, `apps\server\src\engine\conversation.ts`, `apps\server\src\engine\service.ts`, `apps\server\src\engine\sop-executor.ts` |
| `sopSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\sop.ts` | `apps\server\src\engine\sop-executor.ts`, `apps\server\src\skills\sop-routes.ts` |
| `SOPStep` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\sop.ts` | `apps\server\src\engine\sop-executor.ts` |
| `TaskStatus` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\web\src\api\index.ts`, `apps\web\src\lib\taskColumns.ts`, `apps\web\src\types\api.ts` |
| `TaskStep` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\agent.ts` | `apps\web\src\api\index.ts`, `apps\web\src\types\api.ts` |
| `TruthCandidate` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\truth.ts` | `apps\server\src\engine\business\truth-resolver.ts`, `apps\server\src\engine\business\truth.ts` |
| `TruthResolution` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\truth.ts` | `apps\server\src\engine\business\truth-resolver.ts` |
| `VerificationResult` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\verification.ts` | `apps\server\src\engine\orchestrator\orchestrator.ts`, `apps\server\src\engine\verification\disagreement.ts`, `apps\server\src\engine\verification\llm-verifier.ts`, `apps\server\src\engine\verification\verifier.ts` |
| `VerificationToken` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\signup.ts` | `apps\server\src\auth-signup.ts` |
| `verificationTokenSchema` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\signup.ts` | `apps\server\src\auth-signup.ts` |
| `ViewSpec` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | `apps\server\src\engine\views\resolver.ts`, `apps\web\src\templates\dashboard\DashboardTemplate.tsx`, `apps\web\src\templates\detail\DetailTemplate.tsx`, `apps\web\src\templates\form\FormTemplate.tsx`, `apps\web\src\templates\graph\GraphTemplate.tsx` |
| `Workspace` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\index.ts` | `apps\server\src\engine\workspace\generator.ts`, `apps\server\src\workspace.ts`, `apps\web\src\components\Login.tsx`, `apps\web\src\components\Onboarding.tsx`, `apps\web\src\components\ProfileModal.tsx` |
| `WorkspaceSection` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | `apps\server\src\engine\workspace\generator.ts` |
| `WorkspaceSpec` | `C:\Users\Alfonso\Desktop\git hub repos\agente\packages\domain\src\workspace-spec.ts` | `apps\server\src\engine\workspace\generator.ts` |
