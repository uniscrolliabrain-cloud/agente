# Auditoria de contratos del dominio

> Generado por `scripts/audits/contracts.ts` el 2026-10-18T13:01:49.681Z.

- Contratos totales: **250**
- Con implementacion real: **82**
- Marcados PENDING o STUB: **14**
- Sin implementacion y sin marca: **154** (esto es lo que hay que arreglar)

## Sin implementacion y sin marca PENDING

| Contrato | Fichero | Tipo |
|---|---|---|
| `actionSpecSchema` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | schema |
| `ActionType` | `/workspaces/agente/packages/domain/src/actions.ts` | type |
| `actionTypeSchema` | `/workspaces/agente/packages/domain/src/actions.ts` | schema |
| `AgentArchetype` | `/workspaces/agente/packages/domain/src/agent-persona.ts` | type |
| `agentArchetypeSchema` | `/workspaces/agente/packages/domain/src/agent-persona.ts` | schema |
| `AgentCapabilities` | `/workspaces/agente/packages/domain/src/agent-persona.ts` | type |
| `AgentFormality` | `/workspaces/agente/packages/domain/src/agent-persona.ts` | type |
| `agentFormalitySchema` | `/workspaces/agente/packages/domain/src/agent-persona.ts` | schema |
| `AgentGender` | `/workspaces/agente/packages/domain/src/agent-persona.ts` | type |
| `agentGenderSchema` | `/workspaces/agente/packages/domain/src/agent-persona.ts` | schema |
| `AgentMessage` | `/workspaces/agente/packages/domain/src/messaging.ts` | type |
| `AgentMessageIntent` | `/workspaces/agente/packages/domain/src/messaging.ts` | type |
| `AgentPersonality` | `/workspaces/agente/packages/domain/src/agent-persona.ts` | type |
| `AgentRoleInput` | `/workspaces/agente/packages/domain/src/agent.ts` | type |
| `AgentRoleMemoryPolicy` | `/workspaces/agente/packages/domain/src/agent.ts` | interface |
| `AgentRolePermission` | `/workspaces/agente/packages/domain/src/agent.ts` | interface |
| `AgentRolePublic` | `/workspaces/agente/packages/domain/src/agent.ts` | interface |
| `AgentRuntime` | `/workspaces/agente/packages/domain/src/runtime.ts` | type |
| `agentRuntimeSchema` | `/workspaces/agente/packages/domain/src/runtime.ts` | schema |
| `agentStatusSchema` | `/workspaces/agente/packages/domain/src/agent-persona.ts` | schema |
| `AgentValueRef` | `/workspaces/agente/packages/domain/src/agent-persona.ts` | type |
| `ApprovalRequest` | `/workspaces/agente/packages/domain/src/messaging.ts` | type |
| `ApprovalStatus` | `/workspaces/agente/packages/domain/src/messaging.ts` | type |
| `BaseVocabulary` | `/workspaces/agente/packages/domain/src/ontology-seed.ts` | type |
| `BusinessEntityDecl` | `/workspaces/agente/packages/domain/src/business.ts` | type |
| `businessEntityDeclSchema` | `/workspaces/agente/packages/domain/src/business.ts` | schema |
| `BusinessEntityPublic` | `/workspaces/agente/packages/domain/src/business.ts` | interface |
| `businessFieldSchema` | `/workspaces/agente/packages/domain/src/business.ts` | schema |
| `BusinessRelationDecl` | `/workspaces/agente/packages/domain/src/business.ts` | type |
| `businessRelationDeclSchema` | `/workspaces/agente/packages/domain/src/business.ts` | schema |
| `BusinessSchema` | `/workspaces/agente/packages/domain/src/business.ts` | type |
| `businessSchemaSchema` | `/workspaces/agente/packages/domain/src/business.ts` | schema |
| `BusinessSchemaV2` | `/workspaces/agente/packages/domain/src/business-schema.ts` | type |
| `businessSchemaV2Schema` | `/workspaces/agente/packages/domain/src/business-schema.ts` | schema |
| `capabilityContractSchema` | `/workspaces/agente/packages/domain/src/capability.ts` | schema |
| `CapabilityCost` | `/workspaces/agente/packages/domain/src/capability.ts` | type |
| `capabilityCostSchema` | `/workspaces/agente/packages/domain/src/capability.ts` | schema |
| `CapabilityRisk` | `/workspaces/agente/packages/domain/src/capability.ts` | type |
| `capabilityRiskSchema` | `/workspaces/agente/packages/domain/src/capability.ts` | schema |
| `CapabilitySideEffect` | `/workspaces/agente/packages/domain/src/capability.ts` | type |
| `capabilitySideEffectSchema` | `/workspaces/agente/packages/domain/src/capability.ts` | schema |
| `CapabilitySpec` | `/workspaces/agente/packages/domain/src/ontology.ts` | type |
| `capabilitySpecSchema` | `/workspaces/agente/packages/domain/src/ontology.ts` | schema |
| `cognitiveAttentionSchema` | `/workspaces/agente/packages/domain/src/ontology.ts` | schema |
| `cognitivePresentationSchema` | `/workspaces/agente/packages/domain/src/ontology.ts` | schema |
| `cognitiveProgressSchema` | `/workspaces/agente/packages/domain/src/ontology.ts` | schema |
| `cognitivePromotionSchema` | `/workspaces/agente/packages/domain/src/ontology.ts` | schema |
| `CognitiveSpec` | `/workspaces/agente/packages/domain/src/ontology.ts` | type |
| `cognitiveSpecSchema` | `/workspaces/agente/packages/domain/src/ontology.ts` | schema |
| `columnSpecSchema` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | schema |
| `CreateTaskInput` | `/workspaces/agente/packages/domain/src/agent.ts` | type |
| `dataSourceSpecSchema` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | schema |
| `EmailDraft` | `/workspaces/agente/packages/domain/src/index.ts` | type |
| `EntityCandidate` | `/workspaces/agente/packages/domain/src/entity-resolution.ts` | type |
| `entityCandidateSchema` | `/workspaces/agente/packages/domain/src/entity-resolution.ts` | schema |
| `EntityDefinition` | `/workspaces/agente/packages/domain/src/business-schema.ts` | type |
| `entityDefinitionSchema` | `/workspaces/agente/packages/domain/src/business-schema.ts` | schema |
| `EntityMatch` | `/workspaces/agente/packages/domain/src/entity-resolution.ts` | type |
| `entityMatchSchema` | `/workspaces/agente/packages/domain/src/entity-resolution.ts` | schema |
| `EventDraft` | `/workspaces/agente/packages/domain/src/index.ts` | type |
| `ExecutionBackend` | `/workspaces/agente/packages/domain/src/index.ts` | interface |
| `executionContextSchema` | `/workspaces/agente/packages/domain/src/execution-context.ts` | schema |
| `ExecutionRole` | `/workspaces/agente/packages/domain/src/execution-context.ts` | type |
| `executionRoleSchema` | `/workspaces/agente/packages/domain/src/execution-context.ts` | schema |
| `FailureLesson` | `/workspaces/agente/packages/domain/src/learning.ts` | type |
| `failureLessonSchema` | `/workspaces/agente/packages/domain/src/learning.ts` | schema |
| `FieldDefinition` | `/workspaces/agente/packages/domain/src/business-schema.ts` | type |
| `fieldDefinitionSchema` | `/workspaces/agente/packages/domain/src/business-schema.ts` | schema |
| `FieldPolicy` | `/workspaces/agente/packages/domain/src/policy-context.ts` | type |
| `fieldPolicySchema` | `/workspaces/agente/packages/domain/src/policy-context.ts` | schema |
| `FieldType` | `/workspaces/agente/packages/domain/src/business-schema.ts` | type |
| `fieldTypeSchema` | `/workspaces/agente/packages/domain/src/business-schema.ts` | schema |
| `formFieldSpecSchema` | `/workspaces/agente/packages/domain/src/form-spec.ts` | schema |
| `formFieldSpecSchema` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | schema |
| `formSpecSchema` | `/workspaces/agente/packages/domain/src/form-spec.ts` | schema |
| `formSpecSchema` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | schema |
| `GoalConstraint` | `/workspaces/agente/packages/domain/src/goal.ts` | type |
| `goalConstraintSchema` | `/workspaces/agente/packages/domain/src/goal.ts` | schema |
| `GoalPriority` | `/workspaces/agente/packages/domain/src/goal.ts` | type |
| `goalPrioritySchema` | `/workspaces/agente/packages/domain/src/goal.ts` | schema |
| `goalSchema` | `/workspaces/agente/packages/domain/src/goal.ts` | schema |
| `GoalStatus` | `/workspaces/agente/packages/domain/src/goal.ts` | type |
| `goalStatusSchema` | `/workspaces/agente/packages/domain/src/goal.ts` | schema |
| `Idea` | `/workspaces/agente/packages/domain/src/agent.ts` | interface |
| `KernelPort` | `/workspaces/agente/packages/domain/src/kernel.ts` | interface |
| `KernelThought` | `/workspaces/agente/packages/domain/src/kernel.ts` | interface |
| `KernelWriterPort` | `/workspaces/agente/packages/domain/src/kernel.ts` | interface |
| `KnowledgeKind` | `/workspaces/agente/packages/domain/src/truth.ts` | type |
| `knowledgeKindSchema` | `/workspaces/agente/packages/domain/src/truth.ts` | schema |
| `LearningFact` | `/workspaces/agente/packages/domain/src/learning.ts` | type |
| `learningFactSchema` | `/workspaces/agente/packages/domain/src/learning.ts` | schema |
| `LearningPattern` | `/workspaces/agente/packages/domain/src/learning.ts` | type |
| `learningPatternSchema` | `/workspaces/agente/packages/domain/src/learning.ts` | schema |
| `LiveKind` | `/workspaces/agente/packages/domain/src/live.ts` | type |
| `MemoryContext` | `/workspaces/agente/packages/domain/src/agent.ts` | interface |
| `Monitor` | `/workspaces/agente/packages/domain/src/agent.ts` | interface |
| `OntologyBundle` | `/workspaces/agente/packages/domain/src/ontology.ts` | type |
| `OutcomeEvidence` | `/workspaces/agente/packages/domain/src/outcome.ts` | type |
| `outcomeEvidenceSchema` | `/workspaces/agente/packages/domain/src/outcome.ts` | schema |
| `OutcomeMetric` | `/workspaces/agente/packages/domain/src/outcome.ts` | type |
| `outcomeMetricSchema` | `/workspaces/agente/packages/domain/src/outcome.ts` | schema |
| `outcomeSchema` | `/workspaces/agente/packages/domain/src/outcome.ts` | schema |
| `OutcomeStatus` | `/workspaces/agente/packages/domain/src/outcome.ts` | type |
| `outcomeStatusSchema` | `/workspaces/agente/packages/domain/src/outcome.ts` | schema |
| `PlanStatus` | `/workspaces/agente/packages/domain/src/plan.ts` | type |
| `PlanStepStatus` | `/workspaces/agente/packages/domain/src/plan.ts` | type |
| `PolicyActionV2` | `/workspaces/agente/packages/domain/src/policy-context.ts` | type |
| `policyContextSchema` | `/workspaces/agente/packages/domain/src/policy-context.ts` | schema |
| `ProceduralLearning` | `/workspaces/agente/packages/domain/src/learning.ts` | type |
| `proceduralLearningSchema` | `/workspaces/agente/packages/domain/src/learning.ts` | schema |
| `ProvenanceChip` | `/workspaces/agente/packages/domain/src/context-chips.ts` | type |
| `provenanceChipKindSchema` | `/workspaces/agente/packages/domain/src/context-chips.ts` | schema |
| `provenanceChipSchema` | `/workspaces/agente/packages/domain/src/context-chips.ts` | schema |
| `provenanceChipSchema` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | schema |
| `provenanceSchema` | `/workspaces/agente/packages/domain/src/business.ts` | schema |
| `ReactionAction` | `/workspaces/agente/packages/domain/src/policy-context.ts` | type |
| `reactionActionSchema` | `/workspaces/agente/packages/domain/src/policy-context.ts` | schema |
| `ReactionCondition` | `/workspaces/agente/packages/domain/src/policy-context.ts` | type |
| `reactionConditionSchema` | `/workspaces/agente/packages/domain/src/policy-context.ts` | schema |
| `reactionDefinitionSchema` | `/workspaces/agente/packages/domain/src/reaction.ts` | schema |
| `ReactionRule` | `/workspaces/agente/packages/domain/src/policy-context.ts` | type |
| `reactionRuleSchema` | `/workspaces/agente/packages/domain/src/policy-context.ts` | schema |
| `ReactionTarget` | `/workspaces/agente/packages/domain/src/reaction.ts` | type |
| `reactionTargetSchema` | `/workspaces/agente/packages/domain/src/reaction.ts` | schema |
| `ReactionTrigger` | `/workspaces/agente/packages/domain/src/reaction.ts` | type |
| `reactionTriggerSchema` | `/workspaces/agente/packages/domain/src/reaction.ts` | schema |
| `RelationDefinition` | `/workspaces/agente/packages/domain/src/business-schema.ts` | type |
| `relationDefinitionSchema` | `/workspaces/agente/packages/domain/src/business-schema.ts` | schema |
| `RuntimeCheckpoint` | `/workspaces/agente/packages/domain/src/runtime.ts` | type |
| `runtimeCheckpointSchema` | `/workspaces/agente/packages/domain/src/runtime.ts` | schema |
| `RuntimePhase` | `/workspaces/agente/packages/domain/src/runtime.ts` | type |
| `runtimePhaseSchema` | `/workspaces/agente/packages/domain/src/runtime.ts` | schema |
| `Section` | `/workspaces/agente/packages/domain/src/index.ts` | type |
| `SignupRequest` | `/workspaces/agente/packages/domain/src/signup.ts` | type |
| `sopStepSchema` | `/workspaces/agente/packages/domain/src/sop.ts` | schema |
| `StateDefinition` | `/workspaces/agente/packages/domain/src/business-schema.ts` | type |
| `stateDefinitionSchema` | `/workspaces/agente/packages/domain/src/business-schema.ts` | schema |
| `SuccessCriterion` | `/workspaces/agente/packages/domain/src/goal.ts` | type |
| `successCriterionSchema` | `/workspaces/agente/packages/domain/src/goal.ts` | schema |
| `TaxonomyFamily` | `/workspaces/agente/packages/domain/src/taxonomy.ts` | type |
| `taxonomyFamilySchema` | `/workspaces/agente/packages/domain/src/taxonomy.ts` | schema |
| `truthCandidateSchema` | `/workspaces/agente/packages/domain/src/truth.ts` | schema |
| `truthResolutionSchema` | `/workspaces/agente/packages/domain/src/truth.ts` | schema |
| `ValidateInput` | `/workspaces/agente/packages/domain/src/ontology.ts` | interface |
| `ValidateResult` | `/workspaces/agente/packages/domain/src/ontology.ts` | interface |
| `verificationResultSchema` | `/workspaces/agente/packages/domain/src/verification.ts` | schema |
| `ViewKind` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | type |
| `viewKindSchema` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | schema |
| `ViewKpi` | `/workspaces/agente/packages/domain/src/views.ts` | type |
| `ViewQueueItem` | `/workspaces/agente/packages/domain/src/views.ts` | type |
| `viewSpecSchema` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | schema |
| `WorkspaceMode` | `/workspaces/agente/packages/domain/src/index.ts` | type |
| `workspaceSectionSchema` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | schema |
| `workspaceSpecSchema` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | schema |

## Marcados PENDING o STUB

| Contrato | Fichero | Tipo |
|---|---|---|
| `agentAvatarSchema` | `/workspaces/agente/packages/domain/src/agent.ts` | schema |
| `agentMemoryKindSchema` | `/workspaces/agente/packages/domain/src/agent.ts` | schema |
| `agentMessageIntentSchema` | `/workspaces/agente/packages/domain/src/messaging.ts` | schema |
| `agentMessageSchema` | `/workspaces/agente/packages/domain/src/messaging.ts` | schema |
| `agentRoleMemorySchema` | `/workspaces/agente/packages/domain/src/agent.ts` | schema |
| `agentToneSchema` | `/workspaces/agente/packages/domain/src/agent.ts` | schema |
| `approvalRequestSchema` | `/workspaces/agente/packages/domain/src/messaging.ts` | schema |
| `approvalStatusSchema` | `/workspaces/agente/packages/domain/src/messaging.ts` | schema |
| `handoffSchema` | `/workspaces/agente/packages/domain/src/messaging.ts` | schema |
| `planSchema` | `/workspaces/agente/packages/domain/src/plan.ts` | schema |
| `planStatusSchema` | `/workspaces/agente/packages/domain/src/plan.ts` | schema |
| `planStepSchema` | `/workspaces/agente/packages/domain/src/plan.ts` | schema |
| `planStepStatusSchema` | `/workspaces/agente/packages/domain/src/plan.ts` | schema |
| `runtimeViewSpecSchema` | `/workspaces/agente/packages/domain/src/views.ts` | schema |

## Con implementacion real

| Contrato | Fichero | Implementado en |
|---|---|---|
| `ActionProposal` | `/workspaces/agente/packages/domain/src/index.ts` | `apps/server/src/actions.ts`, `apps/server/src/workspace.ts`, `apps/web/src/api/actions.ts`, `apps/web/src/api/index.ts`, `apps/web/src/components/ApprovalModal.tsx` |
| `ActionSpec` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | `apps/web/src/view/spec.ts` |
| `ActivityEntry` | `/workspaces/agente/packages/domain/src/index.ts` | `apps/server/src/workspace.ts` |
| `AgentArtifact` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/server/src/projects-routes.ts`, `apps/web/src/api/index.ts`, `apps/web/src/types/api.ts` |
| `AgentAvatar` | `/workspaces/agente/packages/domain/src/agent-persona.ts` | `apps/web/src/api/agents.ts` |
| `AgentAvatar` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/web/src/api/agents.ts` |
| `AgentIdentity` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/server/src/engine/routes.ts` |
| `AgentMemory` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/server/src/engine/agents/personas/node.ts`, `apps/server/src/engine/agents/personas/types.ts`, `apps/server/src/engine/context/engine.ts`, `apps/server/src/engine/memory.ts`, `apps/server/src/engine/provenance.ts` |
| `AgentMemoryKind` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/web/src/api/agents.ts` |
| `AgentNotification` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/server/src/engine/routes.ts`, `apps/web/src/hooks/useNotifications.ts` |
| `AgentPersona` | `/workspaces/agente/packages/domain/src/agent-persona.ts` | `apps/server/src/engine/agents/personas/loader.ts`, `apps/server/src/engine/agents/personas/registry.ts`, `apps/server/src/engine/agents/personas/types.ts` |
| `AgentRole` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/server/src/actions.ts`, `apps/server/src/admin-clients.ts`, `apps/server/src/admin-tenants.ts`, `apps/server/src/engine/agents/governance.ts`, `apps/server/src/engine/context/engine.ts` |
| `AgentRoleMemory` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/web/src/api/agents.ts` |
| `agentRoleSchema` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/server/src/engine/routes.ts` |
| `AgentStats` | `/workspaces/agente/packages/domain/src/agent-persona.ts` | `apps/server/src/engine/agents/personas/loader.ts`, `apps/server/src/engine/agents/personas/registry.ts`, `apps/server/src/engine/agents/personas/stats.ts`, `apps/server/src/engine/agents/personas/types.ts` |
| `AgentStatus` | `/workspaces/agente/packages/domain/src/agent-persona.ts` | `apps/server/src/engine/agents/personas/stats.ts` |
| `AgentTask` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/server/src/admin-clients.ts`, `apps/server/src/admin-tenants.ts`, `apps/server/src/engine/agents/personas/activity.ts`, `apps/server/src/engine/agents/personas/stats.ts`, `apps/server/src/engine/dead-letter.ts` |
| `AgentTone` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/web/src/api/agents.ts` |
| `AgentWorkspace` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/web/src/api/index.ts`, `apps/web/src/api/tasks.ts`, `apps/web/src/types/api.ts` |
| `Artifact` | `/workspaces/agente/packages/domain/src/index.ts` | `apps/server/src/files.ts`, `apps/server/src/projects-routes.ts`, `apps/server/src/workspace.ts` |
| `BrowserSession` | `/workspaces/agente/packages/domain/src/index.ts` | `apps/server/src/browser.ts`, `apps/server/src/workspace.ts` |
| `BusinessEntity` | `/workspaces/agente/packages/domain/src/business.ts` | `apps/server/src/engine/business/graph.ts`, `apps/server/src/engine/business/resolver.ts`, `apps/server/src/engine/business/truth.ts`, `apps/server/src/engine/context/engine.ts`, `apps/server/src/engine/provenance.ts` |
| `businessEntitySchema` | `/workspaces/agente/packages/domain/src/business.ts` | `apps/server/src/business-routes.ts`, `apps/server/src/engine/business/graph.ts` |
| `BusinessRelation` | `/workspaces/agente/packages/domain/src/business.ts` | `apps/server/src/engine/business/graph.ts`, `apps/server/src/engine/context/engine.ts`, `apps/web/src/api/business.ts` |
| `CalendarEvent` | `/workspaces/agente/packages/domain/src/index.ts` | `apps/server/src/actions.ts`, `apps/server/src/workspace.ts` |
| `CapabilityContract` | `/workspaces/agente/packages/domain/src/capability.ts` | `apps/server/src/engine/capabilities/registry.ts` |
| `ColumnSpec` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | `apps/web/src/view/spec.ts` |
| `ComputerCommand` | `/workspaces/agente/packages/domain/src/computer.ts` | `apps/server/src/computer.ts` |
| `ComputerDirectory` | `/workspaces/agente/packages/domain/src/computer.ts` | `apps/server/src/computer.ts` |
| `ComputerSnapshot` | `/workspaces/agente/packages/domain/src/computer.ts` | `apps/server/src/computer.ts` |
| `Connection` | `/workspaces/agente/packages/domain/src/index.ts` | `apps/server/src/engine/notifications-stream.ts`, `apps/server/src/events-routes.ts`, `apps/server/src/notifications-stream.ts` |
| `createTaskSchema` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/server/src/engine/conversation.ts` |
| `DataSourceSpec` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | `apps/web/src/view/spec.ts` |
| `emailDraftSchema` | `/workspaces/agente/packages/domain/src/index.ts` | `apps/server/src/app.ts`, `apps/server/src/engine/model.ts`, `apps/server/src/engine/sop-executor.ts` |
| `Evidence` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/web/src/types/api.ts` |
| `ExecutionContext` | `/workspaces/agente/packages/domain/src/execution-context.ts` | `apps/server/src/engine/execution/capability-runner.ts`, `apps/server/src/engine/execution/executor.ts`, `apps/server/src/engine/execution/tool-executors.ts`, `apps/server/src/engine/orchestrator/orchestrator.ts`, `apps/server/src/engine/reactions/engine.ts` |
| `FormFieldSpec` | `/workspaces/agente/packages/domain/src/form-spec.ts` | `apps/server/src/engine/form-builder.ts` |
| `FormFieldSpec` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | `apps/server/src/engine/form-builder.ts` |
| `FormSpec` | `/workspaces/agente/packages/domain/src/form-spec.ts` | `apps/server/src/engine/form-builder.ts`, `apps/web/src/forms/FormRenderer.tsx` |
| `FormSpec` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | `apps/server/src/engine/form-builder.ts`, `apps/web/src/forms/FormRenderer.tsx` |
| `Goal` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/server/src/engine/learning/observer.ts`, `apps/server/src/engine/orchestrator/orchestrator.ts`, `apps/server/src/engine/planner/llm-planner.ts`, `apps/server/src/engine/planner/planner.ts`, `apps/server/src/engine/planner/replanner.ts` |
| `Goal` | `/workspaces/agente/packages/domain/src/goal.ts` | `apps/server/src/engine/learning/observer.ts`, `apps/server/src/engine/orchestrator/orchestrator.ts`, `apps/server/src/engine/planner/llm-planner.ts`, `apps/server/src/engine/planner/planner.ts`, `apps/server/src/engine/planner/replanner.ts` |
| `goalInputSchema` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/server/src/engine/conversation.ts` |
| `Handoff` | `/workspaces/agente/packages/domain/src/messaging.ts` | `apps/server/src/engine/handoff/service.ts` |
| `KernelContext` | `/workspaces/agente/packages/domain/src/kernel.ts` | `apps/server/src/engine/agents/personas/node.ts`, `apps/server/src/engine/agents/personas/routes.ts`, `apps/server/src/engine/conversation.ts`, `apps/server/src/engine/model.ts`, `apps/server/src/engine/sop-executor.ts` |
| `KernelRole` | `/workspaces/agente/packages/domain/src/kernel.ts` | `apps/server/src/kernel/context/kernel-context.ts`, `apps/server/src/kernel/index.ts` |
| `KernelTurn` | `/workspaces/agente/packages/domain/src/kernel.ts` | `apps/server/src/engine/sop-executor.ts` |
| `LiveActivity` | `/workspaces/agente/packages/domain/src/live.ts` | `apps/web/src/components/LiveItem.tsx` |
| `Mail` | `/workspaces/agente/packages/domain/src/index.ts` | `apps/server/src/demo/model.ts`, `apps/server/src/engine/conversation.ts`, `apps/server/src/workspace.ts`, `apps/web/src/workspaces/02-whatsapp/components/ContextPanel.tsx` |
| `MatchReason` | `/workspaces/agente/packages/domain/src/entity-resolution.ts` | `apps/server/src/kernel/graph/thought.ts` |
| `matchReasonSchema` | `/workspaces/agente/packages/domain/src/entity-resolution.ts` | `apps/server/src/kernel/graph/thought.ts` |
| `MemoryCategory` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/server/src/engine/context/engine.ts`, `apps/server/src/engine/memory.ts` |
| `ontologyBundleSchema` | `/workspaces/agente/packages/domain/src/ontology.ts` | `apps/server/src/app.ts` |
| `Outcome` | `/workspaces/agente/packages/domain/src/outcome.ts` | `apps/server/src/engine/learning/observer.ts`, `apps/server/src/engine/orchestrator/orchestrator.ts`, `apps/server/src/engine/verification/llm-verifier.ts`, `apps/server/src/engine/verification/verifier.ts`, `apps/web/src/components/ApprovalModal.tsx` |
| `Plan` | `/workspaces/agente/packages/domain/src/plan.ts` | `apps/server/src/engine/execution/executor.ts`, `apps/server/src/engine/learning/observer.ts`, `apps/server/src/engine/orchestrator/orchestrator.ts`, `apps/server/src/engine/planner/llm-planner.ts`, `apps/server/src/engine/planner/planner.ts` |
| `PlanStep` | `/workspaces/agente/packages/domain/src/plan.ts` | `apps/server/src/engine/execution/capability-runner.ts`, `apps/server/src/engine/execution/executor.ts`, `apps/server/src/engine/planner/planner.ts` |
| `policyActionSchema` | `/workspaces/agente/packages/domain/src/policy-context.ts` | `apps/server/src/engine/policy/engine.ts` |
| `PolicyContext` | `/workspaces/agente/packages/domain/src/policy-context.ts` | `apps/server/src/engine/policy/engine.ts` |
| `Project` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/server/src/engine/memory.ts`, `apps/server/src/projects-routes.ts`, `apps/web/src/api/projects.ts`, `apps/web/src/hooks/useProjects.ts`, `apps/web/src/workspaces/35-centro-mando/components/ActiveProjectsPanel.tsx` |
| `ProjectBlock` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/server/src/projects-routes.ts`, `apps/web/src/api/projects.ts`, `apps/web/src/components/ProjectsView.tsx`, `apps/web/src/hooks/useProjects.ts` |
| `ProjectStatus` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/server/src/projects-routes.ts`, `apps/web/src/api/projects.ts`, `apps/web/src/components/ProjectsView.tsx`, `apps/web/src/hooks/useProjects.ts` |
| `ProposalInput` | `/workspaces/agente/packages/domain/src/index.ts` | `apps/server/src/actions.ts`, `apps/server/src/workspace.ts` |
| `proposalSchema` | `/workspaces/agente/packages/domain/src/index.ts` | `apps/server/src/actions.ts`, `apps/server/src/app.ts` |
| `ProvenanceChipKind` | `/workspaces/agente/packages/domain/src/context-chips.ts` | `apps/server/src/engine/provenance.ts`, `apps/web/src/components/ProvenanceBadge.tsx`, `apps/web/src/forms/FormRenderer.tsx` |
| `ReactionDefinition` | `/workspaces/agente/packages/domain/src/reaction.ts` | `apps/server/src/engine/reactions/engine.ts` |
| `RunEvent` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/server/src/engine/worker.ts`, `apps/web/src/api/index.ts`, `apps/web/src/types/api.ts` |
| `RuntimeViewSpec` | `/workspaces/agente/packages/domain/src/views.ts` | `apps/server/src/engine/views/resolver.ts`, `apps/web/src/components/ContextualPanel.tsx`, `apps/web/src/hooks/useViewResolver.ts`, `apps/web/src/templates/dashboard/DashboardTemplate.tsx`, `apps/web/src/templates/queue/QueueTemplate.tsx` |
| `signupRequestSchema` | `/workspaces/agente/packages/domain/src/signup.ts` | `apps/server/src/auth-signup.ts` |
| `SOP` | `/workspaces/agente/packages/domain/src/sop.ts` | `apps/server/src/admin-clients.ts`, `apps/server/src/engine/capabilities/bootstrap.ts`, `apps/server/src/engine/conversation.ts`, `apps/server/src/engine/sop-executor.ts`, `apps/server/src/engine/sop-triggers.ts` |
| `sopSchema` | `/workspaces/agente/packages/domain/src/sop.ts` | `apps/server/src/engine/sop-executor.ts`, `apps/server/src/skills/sop-routes.ts` |
| `SOPStep` | `/workspaces/agente/packages/domain/src/sop.ts` | `apps/server/src/engine/sop-executor.ts` |
| `TaskStatus` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/web/src/api/index.ts`, `apps/web/src/types/api.ts` |
| `TaskStep` | `/workspaces/agente/packages/domain/src/agent.ts` | `apps/web/src/api/index.ts`, `apps/web/src/components/TaskTimeline.tsx`, `apps/web/src/types/api.ts` |
| `TruthCandidate` | `/workspaces/agente/packages/domain/src/truth.ts` | `apps/server/src/engine/business/truth-resolver.ts`, `apps/server/src/engine/business/truth.ts` |
| `TruthResolution` | `/workspaces/agente/packages/domain/src/truth.ts` | `apps/server/src/engine/business/truth-resolver.ts` |
| `VerificationResult` | `/workspaces/agente/packages/domain/src/verification.ts` | `apps/server/src/engine/orchestrator/orchestrator.ts`, `apps/server/src/engine/verification/disagreement.ts`, `apps/server/src/engine/verification/llm-verifier.ts`, `apps/server/src/engine/verification/verifier.ts` |
| `VerificationToken` | `/workspaces/agente/packages/domain/src/signup.ts` | `apps/server/src/auth-signup.ts` |
| `verificationTokenSchema` | `/workspaces/agente/packages/domain/src/signup.ts` | `apps/server/src/auth-signup.ts` |
| `ViewSpec` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | `apps/web/src/view/spec.ts` |
| `Workspace` | `/workspaces/agente/packages/domain/src/index.ts` | `apps/server/src/engine/workspace/generator.ts`, `apps/server/src/workspace.ts`, `apps/web/src/components/Login.tsx`, `apps/web/src/components/ProfileModal.tsx`, `apps/web/src/workspaces/14-zendesk/components/ZendeskSidebar.tsx` |
| `WorkspaceSection` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | `apps/server/src/engine/workspace/generator.ts` |
| `WorkspaceSpec` | `/workspaces/agente/packages/domain/src/workspace-spec.ts` | `apps/server/src/engine/workspace/generator.ts` |
