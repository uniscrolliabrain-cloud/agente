This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: docs/PROTOCOLO_FIXES.md, docs/POLICY_REPO.md, docs/AUDIT_*.md, apps/server/src/kernel/tenancy/**, apps/server/src/kernel/config/**, apps/server/src/kernel/cromos/**
- Files matching these patterns are excluded: **/node_modules/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      kernel/
        config/
          database-resolver.ts
          env-resolver.ts
          provider-spec.ts
          tenant-config.ts
        cromos/
          logic/
            axioms.ts
          physics/
            field.ts
          cromo.ts
        tenancy/
          database-resolver.ts
          default-resolver.ts
          resolver.ts
          service-resolver.ts
docs/
  AUDIT_CONTRACTS.md
  AUDIT_IDEMPOTENCY.md
  AUDIT_TENANT_DEFAULT.md
```

# Files

## File: apps/server/src/kernel/config/provider-spec.ts
```typescript
// KERNEL_PROVIDER_SPEC_V1 — contrato de un proveedor LLM.
//
// Cada velocidad (fast, slow, embeddings) tiene su propio ProviderSpec:
// provider, model, apiKey, baseUrl opcional. tenant-config los importa y los
// expone dentro de TenantConfig. env-resolver los rellena desde .env.
//
// SOC-2: las apiKeys no viven aqui en claro en produccion; vienen resueltas
// desde el vault o desde la DB del tenant. Este tipo solo describe la forma.

import { z } from "zod";

export const providerSpecSchema = z.object({
  provider: z.enum(["google", "anthropic", "openai", "openrouter"]),
  model: z.string().min(1).max(200),
  apiKey: z.string().max(2000),
  baseUrl: z.string().max(2000).optional(),
});

export type ProviderSpec = z.infer<typeof providerSpecSchema>;
```

## File: apps/server/src/kernel/tenancy/default-resolver.ts
```typescript
// KERNEL_DEFAULT_TENANT_RESOLVER_V1 — single-tenant.
//
// Hoy todo el deployment es un unico tenant logico. Este resolver lo
// declara explicitamente para que el kernel no lo asuma.
//
// TODO(KERNEL_TENANT_DB_V1): cuando el repo pase a multi-tenant,
// DatabaseTenantResolver leera records kind "tenant-membership".

import type { TenantResolver } from "./resolver.ts";

export const DEFAULT_TENANT_ID = "default";

export class DefaultTenantResolver implements TenantResolver {
  async resolve(_owner: string): Promise<string> {
    return DEFAULT_TENANT_ID;
  }
}
```

## File: apps/server/src/kernel/tenancy/resolver.ts
```typescript
// KERNEL_TENANT_RESOLVER_V1 — como se resuelve el tenant de un owner.
//
// Hoy: siempre "default". Manana: lectura de la DB, del token o del
// subdominio. El kernel no sabe como se resuelve; solo pide el tenant
// y usa el resultado. Esa frontera es lo que permite migrar a multi-tenant
// sin tocar el kernel.

export interface TenantResolver {
  resolve(owner: string): Promise<string>;
}
```

## File: apps/server/src/kernel/tenancy/service-resolver.ts
```typescript
// SERVICE_TENANT_RESOLVER_V1 - adapter que delega en TenantService.
//
// Por que existe:
//   Kernel.openTurn() y el resto de operaciones del kernel resuelven el tenantId
//   llamando a this.deps.tenants.resolve(ctx.owner). Si inyectamos
//   DefaultTenantResolver, siempre devuelve "default" e ignora el tenantId del
//   contexto. Eso tiraba a la basura el trabajo de TenantService.
//
// Este adapter delega directamente en TenantService.tenantIdFor(owner), que
// resuelve el tenant real desde la DB (o "default" si no hay membership).

import type { TenantResolver } from "./resolver.ts";
import type { TenantService } from "../../engine/tenant.ts";

export class ServiceTenantResolver implements TenantResolver {
  constructor(private readonly service: TenantService) {}

  async resolve(owner: string): Promise<string> {
    return this.service.tenantIdFor(owner);
  }
}
```

## File: docs/AUDIT_CONTRACTS.md
```markdown
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
```

## File: docs/AUDIT_IDEMPOTENCY.md
```markdown
# Auditoria de idempotencia

> Generado por `scripts/audits/idempotency.ts` el 2026-10-03T15:43:49.518Z.

- Ficheros revisados: **284**
- Marcas encontradas: **535**
- Marcas unicas: **432**
- Marcas duplicadas con cuerpo distinto: **65**
- Marcas huerfanas (sin codigo real debajo): **2**
- Marcas repetidas en el mismo fichero: **53**

## Duplicadas con cuerpo distinto

La misma marca aparece en varios sitios con contenido distinto. Una de las dos aplicaciones puede ser erronea.

| Marca | Fichero:linea | Hash cuerpo |
|---|---|---|
| `APP_TENANT_DB_V1` | `apps\server\src\app.ts:17` | 838cc37fb323e104 |
| `APP_TENANT_DB_V1` | `apps\server\src\app.ts:66` | 78feba17f4ddb885 |
| `SERVICE_TENANT_RESOLVER_WIRE_V1` | `apps\server\src\app.ts:48` | e90b22cf31808909 |
| `SERVICE_TENANT_RESOLVER_WIRE_V1` | `apps\server\src\app.ts:140` | a51ad35f3d5dde48 |
| `ENGINE_TENANT_V1` | `apps\server\src\app.ts:52` | 3bebc31dccf80e3b |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\service.ts:73` | a0e5c80b3c88f7e5 |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\service.ts:129` | bb7f84da2fd4cc6e |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\service.ts:160` | 0a76c6525d209a11 |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\service.ts:211` | 147f11527faff0ce |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\tenant.ts:1` | b7ced222c76d3e96 |
| `POLICY_EARLY_V1` | `apps\server\src\app.ts:72` | 4f42b08795433e39 |
| `POLICY_EARLY_V1` | `apps\server\src\app.ts:96` | 3e612b1aa004bca6 |
| `HEALTH_DEEP_V2` | `apps\server\src\app.ts:262` | fa19ebb111ec5f95 |
| `HEALTH_DEEP_V2` | `apps\server\src\app.ts:266` | 50d38c3d34692d5c |
| `SIGNUP_RATE_LIMIT_V1` | `apps\server\src\auth-signup.ts:39` | 67a2bd22c6ec98a7 |
| `SIGNUP_RATE_LIMIT_V1` | `apps\server\src\auth-signup.ts:47` | b467a218d7f4acbc |
| `RUNTIME_TENANT_V1` | `apps\server\src\engine\agents\runtime.ts:10` | 73733152e3ca22ea |
| `RUNTIME_TENANT_V1` | `apps\server\src\engine\agents\runtime.ts:25` | 2a7854d832e09d08 |
| `GRAPH_RESOLVER_WIRE_V1` | `apps\server\src\engine\business\graph.ts:61` | 3ab6c9d117b3fc56 |
| `GRAPH_RESOLVER_WIRE_V1` | `apps\server\src\engine\business\graph.ts:65` | c533f3c9f239735b |
| `BUSINESS_SCHEMA_WIRE_V2` | `apps\server\src\engine\business\graph.ts:63` | 80b4cc15233254ae |
| `BUSINESS_SCHEMA_WIRE_V2` | `apps\server\src\engine\business\graph.ts:181` | a6c26bc3904f8bd8 |
| `BUSINESS_GRAPH_VERSION_V1` | `apps\server\src\engine\business\graph.ts:93` | 458076ddc515a731 |
| `BUSINESS_GRAPH_VERSION_V1` | `apps\server\src\engine\business\graph.ts:132` | 882994f6938136f0 |
| `BUSINESS_GRAPH_VERSION_V1` | `apps\server\src\engine\business\graph.ts:145` | 1e7a00639b72e8af |
| `CAPABILITY_REGISTRY_V1` | `apps\server\src\engine\capabilities\registry.ts:1` | 33ec34f5b1cdb9e3 |
| `CAPABILITY_REGISTRY_V1` | `apps\server\src\engine\service.ts:79` | a1f247354a577a8d |
| `CAPABILITY_REGISTRY_V1` | `apps\server\src\engine\service.ts:170` | a7b2d7356b8a8914 |
| `CONTEXT_BUDGET_V1` | `apps\server\src\engine\context\budget.ts:1` | 170528f19d8b239f |
| `CONTEXT_BUDGET_V1` | `apps\server\src\engine\context\engine.ts:36` | 3a4258d551ca4643 |
| `KERNEL_PROMOTER_IMPORT_V1` | `apps\server\src\engine\conversation.ts:14` | 80a92948e67acb2f |
| `KERNEL_PROMOTER_IMPORT_V1` | `apps\server\src\engine\model.ts:10` | 77c31aa64a3a4643 |
| `AGENT_RUNTIME_WIRE_V2` | `apps\server\src\engine\conversation.ts:50` | c7d55748d2e13c4c |
| `AGENT_RUNTIME_WIRE_V2` | `apps\server\src\engine\conversation.ts:73` | 12ba7518494e4dac |
| `VIEWS_READ_WIRE_V1` | `apps\server\src\engine\conversation.ts:85` | a0073b3db5936651 |
| `VIEWS_READ_WIRE_V1` | `apps\server\src\engine\conversation.ts:95` | ddeeb01795072b0f |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\conversation.ts:110` | 4fa5f134908d64ed |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\conversation.ts:635` | 0a924b8738b51c2d |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\conversation.ts:655` | 396719d8a3ca89ba |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\model.ts:72` | ad1942d90695bd2e |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\model.ts:525` | 58ae01a51619ff39 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\service.ts:1842` | 3ab7c0b82ce58e28 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\sop-executor.ts:134` | 5328598d0de0f838 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\sop-executor.ts:163` | 74f92dfad74c41b6 |
| `ROLE_PROMPT_V2` | `apps\server\src\engine\conversation.ts:489` | 5940f67351504a46 |
| `ROLE_PROMPT_V2` | `apps\server\src\engine\model.ts:402` | 117b72d8feef71cb |
| `KERNEL_FAST_RESPONSE_V1` | `apps\server\src\engine\conversation.ts:539` | c30791258ff99577 |
| `KERNEL_FAST_RESPONSE_V1` | `apps\server\src\engine\conversation.ts:639` | 4a117ea86672edb4 |
| `KERNEL_PROMOTE_PERSIST_V1` | `apps\server\src\engine\conversation.ts:613` | 7d4cbb7583b66cc6 |
| `KERNEL_PROMOTE_PERSIST_V1` | `apps\server\src\engine\service.ts:1808` | fd7746e62e674b7d |
| `EVENTBUS_DEDUPE_KEY_V1` | `apps\server\src\engine\events\bus.ts:27` | 504614834baf72f8 |
| `EVENTBUS_DEDUPE_KEY_V1` | `apps\server\src\engine\events\bus.ts:71` | d66bc1f71f66891c |
| `EVENTBUS_DEDUPE_KEY_V1` | `apps\server\src\engine\events\bus.ts:90` | fff740b9eb00bb5c |
| `VERIFICATION_EVENT_V1` | `apps\server\src\engine\events\schemas.ts:138` | 08c12161dd255ca9 |
| `VERIFICATION_EVENT_V1` | `apps\server\src\engine\events\types.ts:42` | bba8f658d840bfca |
| `GUARDRAILS_V1` | `apps\server\src\engine\guardrails\service.ts:1` | bce2c20d708f96d0 |
| `GUARDRAILS_V1` | `apps\server\src\engine\service.ts:75` | 1f6c607605e97fb9 |
| `GUARDRAILS_V1` | `apps\server\src\engine\service.ts:162` | 484fd59285062c01 |
| `HANDOFF_SERVICE_V1` | `apps\server\src\engine\handoff\service.ts:2` | e1da5c636b6e1301 |
| `HANDOFF_SERVICE_V1` | `apps\server\src\engine\service.ts:91` | c6a048accc0565db |
| `HANDOFF_SERVICE_V1` | `apps\server\src\engine\service.ts:178` | dab61fca6f617faf |
| `LEARNING_OBSERVER_V1` | `apps\server\src\engine\learning\observer.ts:2` | 98862962589ce015 |
| `LEARNING_OBSERVER_V1` | `apps\server\src\engine\service.ts:98` | 4e5aa52394e10400 |
| `LEARNING_OBSERVER_V1` | `apps\server\src\engine\service.ts:182` | 1711a54ae0fed4d5 |
| `LEARNING_OBSERVER_V2` | `apps\server\src\engine\learning\observer.ts:67` | 4d76da066ec2dda3 |
| `LEARNING_OBSERVER_V2` | `apps\server\src\engine\learning\observer.ts:95` | cc8430343b9c7095 |
| `BUSINESS_OS_ORCHESTRATOR_V1` | `apps\server\src\engine\orchestrator\orchestrator.ts:3` | 6572705574942fde |
| `BUSINESS_OS_ORCHESTRATOR_V1` | `apps\server\src\engine\service.ts:89` | 025f5f79ee0c8c78 |
| `BUSINESS_OS_ORCHESTRATOR_V1` | `apps\server\src\engine\service.ts:176` | ccf5bbe061cf53f7 |
| `ORCHESTRATOR_LEARNING_WIRE_V1` | `apps\server\src\engine\orchestrator\orchestrator.ts:17` | 53fc47accfaeab49 |
| `ORCHESTRATOR_LEARNING_WIRE_V1` | `apps\server\src\engine\orchestrator\orchestrator.ts:94` | 8a55bf62dd51703c |
| `PLANNER_V1` | `apps\server\src\engine\planner\planner.ts:2` | 0edef434acfa9f72 |
| `PLANNER_V1` | `apps\server\src\engine\service.ts:82` | 0258bc8811525e11 |
| `PLANNER_V1` | `apps\server\src\engine\service.ts:172` | 5d070e6a75ef9b0a |
| `STATEMACHINE_ENTITY_TYPE_V1` | `apps\server\src\engine\policy\state-machine.ts:48` | d33997f652bca616 |
| `STATEMACHINE_ENTITY_TYPE_V1` | `apps\server\src\engine\policy\state-machine.ts:71` | 609ac270c3cf70bc |
| `REACTION_ENGINE_V1` | `apps\server\src\engine\reactions\engine.ts:1` | 0ac8a6fd67fe5ec4 |
| `REACTION_ENGINE_V1` | `apps\server\src\engine\service.ts:93` | 46e58c69d77c7a94 |
| `REACTION_ENGINE_V1` | `apps\server\src\engine\service.ts:180` | f40a8b805a8746f0 |
| `REACTION_EVAL_EXEC_V1` | `apps\server\src\engine\reactions\engine.ts:33` | 91c83b5c2a4c1f12 |
| `REACTION_EVAL_EXEC_V1` | `apps\server\src\engine\reactions\engine.ts:51` | 4e078274255145fc |
| `SERVICE_TENANT_DB_V1` | `apps\server\src\engine\service.ts:46` | a3966b71d19c99da |
| `SERVICE_TENANT_DB_V1` | `apps\server\src\engine\service.ts:187` | c14f1c70e16912b8 |
| `SERVICE_RATE_LIMIT_TENANT_V1` | `apps\server\src\engine\service.ts:77` | 831ba9b5f7943456 |
| `SERVICE_RATE_LIMIT_TENANT_V1` | `apps\server\src\engine\service.ts:168` | 9ddbf1fde68f5559 |
| `SERVICE_RATE_LIMIT_TENANT_V1` | `apps\server\src\engine\service.ts:815` | c770600014ba1f3f |
| `VERIFIER_V1` | `apps\server\src\engine\service.ts:86` | 5d01191a7cb59cd1 |
| `VERIFIER_V1` | `apps\server\src\engine\service.ts:174` | 2936796a4e83482c |
| `VERIFIER_V1` | `apps\server\src\engine\verification\verifier.ts:1` | 40bc03a664c670e1 |
| `EXECUTOR_WIRE_V1` | `apps\server\src\engine\service.ts:100` | 12e58e9e1f32ed65 |
| `EXECUTOR_WIRE_V1` | `apps\server\src\engine\service.ts:184` | 51f633baaddb9e92 |
| `EXECUTOR_WIRE_V1` | `apps\server\src\engine\service.ts:270` | d3f8898fea5b0641 |
| `EVENTBUS_MONITOR_EMIT_V1` | `apps\server\src\engine\service.ts:112` | c14c063c1fa0c605 |
| `EVENTBUS_MONITOR_EMIT_V1` | `apps\server\src\engine\service.ts:113` | 24ea3254d09f3f4d |
| `KERNEL_WIRE_A_V1` | `apps\server\src\engine\service.ts:131` | 6ad3979ed0a17db7 |
| `KERNEL_WIRE_A_V1` | `apps\server\src\engine\service.ts:158` | 5f1c6b895fcb31e5 |
| `MAINTAIN_PURGE_V1` | `apps\server\src\engine\service.ts:143` | 2760c84dba9a950a |
| `MAINTAIN_PURGE_V1` | `apps\server\src\engine\service.ts:403` | 67916e54228abd6f |
| `SERVICE_METRICS_WIRE_V1` | `apps\server\src\engine\service.ts:164` | 6149db25fd7bfdf0 |
| `SERVICE_METRICS_WIRE_V1` | `apps\server\src\engine\service.ts:1609` | b8394f74eaa4f556 |
| `SERVICE_REACTIONS_LOAD_V1` | `apps\server\src\engine\service.ts:283` | f5448e9335cfe49d |
| `SERVICE_REACTIONS_LOAD_V1` | `apps\server\src\engine\service.ts:318` | 06cca3d46dc4d2ac |
| `MAINTAIN_TENANT_CURSOR_V1` | `apps\server\src\engine\service.ts:365` | 287e2784e6a7ad82 |
| `MAINTAIN_TENANT_CURSOR_V1` | `apps\server\src\engine\service.ts:1845` | 8317dec867cd76e9 |
| `SERVICE_ALERTS_V1` | `apps\server\src\engine\service.ts:381` | 0643b9e38604769a |
| `SERVICE_ALERTS_V1` | `apps\server\src\engine\service.ts:1857` | 849a71659f4f950b |
| `MATERIALIZE_ENTITY_ON_FINISH_V1` | `apps\server\src\engine\service.ts:1750` | 411001dd39cf47cd |
| `MATERIALIZE_ENTITY_ON_FINISH_V1` | `apps\server\src\engine\service.ts:1811` | 69eb667ff6175343 |
| `MAINTAIN_TENANT_REAL_V1` | `apps\server\src\engine\service.ts:1885` | aa8901385c0fc4f4 |
| `MAINTAIN_TENANT_REAL_V1` | `apps\server\src\engine\service.ts:1900` | 643903a9ce0ecf33 |
| `MATCHES_PRICE_PARSE_V1` | `apps\server\src\engine\service.ts:2258` | a1536e37660f1744 |
| `MATCHES_PRICE_PARSE_V1` | `apps\server\src\engine\service.ts:2270` | 20f026c03845297f |
| `SOP_THOUGHTS_V1` | `apps\server\src\engine\sop-executor.ts:22` | 6744c24173bfd2b0 |
| `SOP_THOUGHTS_V1` | `apps\server\src\engine\sop-executor.ts:174` | 45e0144e6282dc8e |
| `SOP_THOUGHT_STEP_V1` | `apps\server\src\engine\sop-executor.ts:101` | ee6d80e0fdbde66e |
| `SOP_THOUGHT_STEP_V1` | `apps\server\src\engine\sop-executor.ts:385` | 0d1fbe55f89090d5 |
| `SOP_OUTCOME_STRUCTURED_V1` | `apps\server\src\engine\sop-executor.ts:144` | caab453996a1ca61 |
| `SOP_OUTCOME_STRUCTURED_V1` | `apps\server\src\engine\sop-executor.ts:158` | ca12d4bfb7333267 |
| `VIEW_RESOLVER_V1` | `apps\server\src\engine\views\resolver.ts:1` | 8d98904ba4909ef6 |
| `VIEW_RESOLVER_V1` | `apps\web\src\view\resolver.ts:1` | b7726e0f3c62258d |
| `WORKER_GUARD_INVALIDATE_V1` | `apps\server\src\engine\worker.ts:165` | 76bafa57d20824ff |
| `WORKER_GUARD_INVALIDATE_V1` | `apps\server\src\engine\worker.ts:181` | 588d70b3a63973dc |
| `WORKER_GUARD_INVALIDATE_V1` | `apps\server\src\engine\worker.ts:257` | f486dab82263b7a7 |
| `WORKER_DEDUPE_PERSIST_V1` | `apps\server\src\engine\worker.ts:189` | 92912f431ff55c88 |
| `WORKER_DEDUPE_PERSIST_V1` | `apps\server\src\engine\worker.ts:212` | 6382f76520f64733 |
| `FILES_TENANT_STRICT_V2` | `apps\server\src\files.ts:83` | 005851472781f18d |
| `FILES_TENANT_STRICT_V2` | `apps\server\src\files.ts:130` | 2bc1355fcc9aa232 |
| `FILES_TENANT_STRICT_V2` | `apps\server\src\files.ts:184` | 102b9e31523f0aa3 |
| `AUTHOR_MATCHED_METADATA_V1` | `apps\server\src\kernel\authors\fast-author.ts:27` | 9e67e260c5eab203 |
| `AUTHOR_MATCHED_METADATA_V1` | `apps\server\src\kernel\authors\slow-author.ts:29` | 3e97afe3503c37a5 |
| `AUTHOR_METADATA_NORMALIZE_V1` | `apps\server\src\kernel\authors\fast-author.ts:42` | 0da02dd1c7816c45 |
| `AUTHOR_METADATA_NORMALIZE_V1` | `apps\server\src\kernel\authors\slow-author.ts:44` | 73571c0956e4b601 |
| `CONSOLIDATE_TENANT_V1` | `apps\server\src\kernel\graph\consolidate.ts:25` | 115cebfa1a88c05b |
| `CONSOLIDATE_TENANT_V1` | `apps\server\src\kernel\graph\consolidate.ts:33` | 1e52924bda1594b4 |
| `CONSOLIDATE_TENANT_V1` | `apps\server\src\kernel\graph\consolidate.ts:41` | bf74040f7e2726fe |
| `CONSOLIDATE_TENANT_V1` | `apps\server\src\kernel\graph\consolidate.ts:107` | 2d7c1ba77dbe806c |
| `SERVICE_TENANT_RESOLVER_V1` | `apps\server\src\kernel\index.ts:43` | 41cfe8612344daab |
| `SERVICE_TENANT_RESOLVER_V1` | `apps\server\src\kernel\tenancy\service-resolver.ts:1` | 387b265164fa8f6c |
| `STUB_112_V1` | `apps\web\src\components\AgentsView.tsx:1` | 90a6cefd4db306cc |
| `STUB_112_V1` | `apps\web\src\components\ContextualPanel.tsx:2` | c4129ccd8620bd08 |
| `UI_ANIMATED_NUMBER_V1` | `apps\web\src\components\AnimatedNumber.tsx:1` | ba69cc049d8fef26 |
| `UI_ANIMATED_NUMBER_V1` | `apps\web\src\components\ControlCenterView.tsx:1` | d5338bde60d93484 |
| `COMMAND_PALETTE_SEARCH_V1` | `apps\web\src\components\CommandPalette.tsx:23` | 8bd0183ea64d8802 |
| `COMMAND_PALETTE_SEARCH_V1` | `apps\web\src\components\CommandPalette.tsx:85` | 7b3c8f4e35aabce8 |
| `COMMAND_PALETTE_SEARCH_V1` | `apps\web\src\components\CommandPalette.tsx:100` | faf94234bf8a458d |
| `CONTEXT_CHIPS_V1` | `apps\web\src\components\ContextChips.tsx:1` | baa5a908be42a86d |
| `CONTEXT_CHIPS_V1` | `packages\domain\src\context-chips.ts:1` | 049374c04f507b6f |
| `MESSAGE_ATTACHMENT_PREVIEW_V1` | `apps\web\src\components\MessageBubble.tsx:5` | c44d4251dcb16b7c |
| `MESSAGE_ATTACHMENT_PREVIEW_V1` | `apps\web\src\components\MessageBubble.tsx:34` | ceca4264d3506d5e |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\dashboard\DashboardTemplate.tsx:1` | ad8643244569956d |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\detail\DetailTemplate.tsx:1` | 11e106ee378684db |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\form\FormTemplate.tsx:1` | 470c5b23a53e4bfb |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\graph\GraphTemplate.tsx:1` | 7c9467ff8e2d281d |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\kanban\KanbanTemplate.tsx:1` | e1ed55a7df6eb6fd |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\list\ListTemplate.tsx:1` | 018760f116844e25 |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\table\TableTemplate.tsx:1` | b7f86dee84374cf4 |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\timeline\TimelineTemplate.tsx:1` | 88ac3dcd3934ea0f |
| `OUTCOME_V1` | `packages\domain\src\agent.ts:55` | 0e04ebd65a68f716 |
| `OUTCOME_V1` | `packages\domain\src\outcome.ts:1` | ccf6b815b297d3da |
| `AGENT_ROLE_V2` | `packages\domain\src\agent.ts:113` | ffba90c2f53c111e |
| `AGENT_ROLE_V2` | `packages\domain\src\agent.ts:152` | 52099863e36fc9af |
| `AGENT_ROLE_V2` | `packages\domain\src\agent.ts:235` | dbc5fde69ee781f8 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:165` | e490f272dd9c0c5a |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:197` | 988ff224ee263077 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:199` | 6b2d7cfe4026a7b3 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:201` | 3f3bcff5ef8fade8 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:203` | 7d7353806027f4d9 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:245` | aed3a32cb6d07fb3 |

## Huerfanas

La marca aparece en un comentario pero debajo no hay codigo real. Probable marca puesta a mano sin aplicar el bloque.

| Marca | Fichero:linea | Lineas de codigo |
|---|---|---|
| `EXPORT_BUSINESS_WEB_V1` | `apps\web\src\api\index.ts:12` | 2 |
| `FALLBACK_V1` | `apps\web\src\view\fallback.tsx:1` | 1 |

## Repetidas en el mismo fichero

La misma marca aparece dos veces en el mismo fichero. Probable bloque aplicado dos veces.

| Marca | Fichero | Veces |
|---|---|---|
| `APP_TENANT_DB_V1` | `apps\server\src\app.ts` | 2 |
| `SERVICE_TENANT_RESOLVER_WIRE_V1` | `apps\server\src\app.ts` | 2 |
| `POLICY_EARLY_V1` | `apps\server\src\app.ts` | 2 |
| `HEALTH_DEEP_V2` | `apps\server\src\app.ts` | 2 |
| `SIGNUP_RATE_LIMIT_V1` | `apps\server\src\auth-signup.ts` | 2 |
| `RUNTIME_TENANT_V1` | `apps\server\src\engine\agents\runtime.ts` | 2 |
| `GRAPH_RESOLVER_WIRE_V1` | `apps\server\src\engine\business\graph.ts` | 2 |
| `BUSINESS_SCHEMA_WIRE_V2` | `apps\server\src\engine\business\graph.ts` | 2 |
| `BUSINESS_GRAPH_VERSION_V1` | `apps\server\src\engine\business\graph.ts` | 3 |
| `AGENT_RUNTIME_WIRE_V2` | `apps\server\src\engine\conversation.ts` | 2 |
| `VIEWS_READ_WIRE_V1` | `apps\server\src\engine\conversation.ts` | 2 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\conversation.ts` | 3 |
| `KERNEL_FAST_RESPONSE_V1` | `apps\server\src\engine\conversation.ts` | 2 |
| `EVENTBUS_DEDUPE_KEY_V1` | `apps\server\src\engine\events\bus.ts` | 3 |
| `LEARNING_OBSERVER_V2` | `apps\server\src\engine\learning\observer.ts` | 2 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\model.ts` | 2 |
| `ORCHESTRATOR_LEARNING_WIRE_V1` | `apps\server\src\engine\orchestrator\orchestrator.ts` | 2 |
| `STATEMACHINE_ENTITY_TYPE_V1` | `apps\server\src\engine\policy\state-machine.ts` | 2 |
| `REACTION_EVAL_EXEC_V1` | `apps\server\src\engine\reactions\engine.ts` | 2 |
| `SERVICE_TENANT_DB_V1` | `apps\server\src\engine\service.ts` | 2 |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\service.ts` | 4 |
| `GUARDRAILS_V1` | `apps\server\src\engine\service.ts` | 2 |
| `SERVICE_RATE_LIMIT_TENANT_V1` | `apps\server\src\engine\service.ts` | 3 |
| `CAPABILITY_REGISTRY_V1` | `apps\server\src\engine\service.ts` | 2 |
| `PLANNER_V1` | `apps\server\src\engine\service.ts` | 2 |
| `VERIFIER_V1` | `apps\server\src\engine\service.ts` | 2 |
| `BUSINESS_OS_ORCHESTRATOR_V1` | `apps\server\src\engine\service.ts` | 2 |
| `HANDOFF_SERVICE_V1` | `apps\server\src\engine\service.ts` | 2 |
| `REACTION_ENGINE_V1` | `apps\server\src\engine\service.ts` | 2 |
| `LEARNING_OBSERVER_V1` | `apps\server\src\engine\service.ts` | 2 |
| `EXECUTOR_WIRE_V1` | `apps\server\src\engine\service.ts` | 3 |
| `EVENTBUS_MONITOR_EMIT_V1` | `apps\server\src\engine\service.ts` | 2 |
| `KERNEL_WIRE_A_V1` | `apps\server\src\engine\service.ts` | 2 |
| `MAINTAIN_PURGE_V1` | `apps\server\src\engine\service.ts` | 2 |
| `SERVICE_METRICS_WIRE_V1` | `apps\server\src\engine\service.ts` | 2 |
| `SERVICE_REACTIONS_LOAD_V1` | `apps\server\src\engine\service.ts` | 2 |
| `MAINTAIN_TENANT_CURSOR_V1` | `apps\server\src\engine\service.ts` | 2 |
| `SERVICE_ALERTS_V1` | `apps\server\src\engine\service.ts` | 2 |
| `MATERIALIZE_ENTITY_ON_FINISH_V1` | `apps\server\src\engine\service.ts` | 2 |
| `MAINTAIN_TENANT_REAL_V1` | `apps\server\src\engine\service.ts` | 2 |
| `MATCHES_PRICE_PARSE_V1` | `apps\server\src\engine\service.ts` | 2 |
| `SOP_THOUGHTS_V1` | `apps\server\src\engine\sop-executor.ts` | 2 |
| `SOP_THOUGHT_STEP_V1` | `apps\server\src\engine\sop-executor.ts` | 2 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\sop-executor.ts` | 2 |
| `SOP_OUTCOME_STRUCTURED_V1` | `apps\server\src\engine\sop-executor.ts` | 2 |
| `WORKER_GUARD_INVALIDATE_V1` | `apps\server\src\engine\worker.ts` | 3 |
| `WORKER_DEDUPE_PERSIST_V1` | `apps\server\src\engine\worker.ts` | 2 |
| `FILES_TENANT_STRICT_V2` | `apps\server\src\files.ts` | 3 |
| `CONSOLIDATE_TENANT_V1` | `apps\server\src\kernel\graph\consolidate.ts` | 4 |
| `COMMAND_PALETTE_SEARCH_V1` | `apps\web\src\components\CommandPalette.tsx` | 3 |
| `MESSAGE_ATTACHMENT_PREVIEW_V1` | `apps\web\src\components\MessageBubble.tsx` | 2 |
| `AGENT_ROLE_V2` | `packages\domain\src\agent.ts` | 3 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts` | 6 |
```

## File: docs/AUDIT_TENANT_DEFAULT.md
```markdown
# Auditoria de default hardcodeado

> Generado por scripts/audits/tenant-default.ts el 2026-10-05T11:23:31.300Z

- Ficheros revisados: **324**
- Ocurrencias totales: **66**
- Permitidas: **64**
- Prohibidas: **2**

## Prohibidas

| Fichero | Linea | Snippet |
|---|---|---|
| apps\server\src\engine\events\bus.ts | 109 | .get<{ disabled: string[] }>(owner, "notification-prefs", "default") |
| packages\domain\src\views.ts | 20 | kind: z.enum(["primary", "default", "danger"]).default("default"), |
```

## File: apps/server/src/kernel/cromos/logic/axioms.ts
```typescript
// CROMOS_PENDING_V1 — código declarado pero NO cableado.
// El roadmap 09 marca "no cromos ni polaridad todavía" como frontera.
// Estos módulos existen pero nadie los importa en runtime.
// Cuando se implementen de verdad, mover esta marca a CROMOS_ACTIVE_V1.
// Ver: auditoría profunda 09.
// KERNEL_CROMOS_LOGIC_AXIOMS_V1 - axiomas base logica.
// No LLM. Reglas deterministas para promocion y consistencia.
export const LOGIC_AXIOMS=[
 "A->B and B->C implies A->C",
 "not(not(A)) = A",
 "A and not(A) => contradiction",
 "primary must be in matched for high confidence",
 "empty content => discard",
] as const;
export function checkContradiction(a:string,b:string):boolean{
 const al=a.trim().toLowerCase();const bl=b.trim().toLowerCase();
 return al===`no ${bl}`||bl===`no ${al}`
}
```

## File: apps/server/src/kernel/cromos/physics/field.ts
```typescript
// CROMOS_PENDING_V1 — código declarado pero NO cableado.
// El roadmap 09 marca "no cromos ni polaridad todavía" como frontera.
// Estos módulos existen pero nadie los importa en runtime.
// Cuando se implementen de verdad, mover esta marca a CROMOS_ACTIVE_V1.
// Ver: auditoría profunda 09.
// KERNEL_CROMOS_PHYSICS_FIELD_V1 - campo escalar de atencion.
// Calcula energia de un Thought en funcion de weights.
// E = sum(weight^2) / count. Alta energia = foco.
export function fieldEnergy(matched:{weight:number}[]):number{
 if(matched.length===0)return 0;
 let s=0;for(const m of matched)s+=m.weight*m.weight;
 return s/matched.length
}
export function isHighEnergy(matched:{weight:number}[],threshold=0.7):boolean{
 return fieldEnergy(matched)>=threshold
}
```

## File: apps/server/src/kernel/cromos/cromo.ts
```typescript
// CROMOS_PENDING_V1 — código declarado pero NO cableado.
// El roadmap 09 marca "no cromos ni polaridad todavía" como frontera.
// Estos módulos existen pero nadie los importa en runtime.
// Cuando se implementen de verdad, mover esta marca a CROMOS_ACTIVE_V1.
// Ver: auditoría profunda 09.
// KERNEL_CROMO_V1 - unidad cognitiva con axiomas + campo.
// Cromo = {id, tenantId, axioms, field, provenance}
import { z } from "zod";
export const cromoSchema=z.object({
 id:z.string().min(1).max(100),tenantId:z.string().min(1).max(100),
 kind:z.enum(["logic","physics","intent","memory","policy"]),
 axioms:z.array(z.string().max(1000)).default([]),
 field:z.record(z.string(),z.unknown()).default({}),
 provenance:z.object({source:z.string().min(1).max(200),createdAt:z.iso.datetime({offset:true})}),
});
export type Cromo=z.infer<typeof cromoSchema>;
```

## File: apps/server/src/kernel/config/database-resolver.ts
```typescript
// DATABASE_RESOLVER_PENDING_V1 — adaptador Supabase no cableado.
// En el repo actual, app.ts usa EnvTenantConfigResolver y
// ServiceTenantResolver. Este resolver se activa cuando Supabase
// esté desplegado (fase posterior).
// Ver: auditoría profunda 09.
// KERNEL_DATABASE_CONFIG_RESOLVER_V2 — TenantConfig desde Supabase.
//
// Supabase = Postgres + RLS + PostgREST. Este resolver lee la tabla
// tenant_configs. Si el tenant no tiene fila o el puerto no esta inyectado,
// delega al fallback (EnvTenantConfigResolver).
//
// Tabla esperada (SQL se crea en bloque aparte):
//
//   create table tenant_configs (
//     tenant_id text primary key,
//     fast_provider text not null,
//     fast_model text not null,
//     fast_api_key text not null,
//     slow_provider text not null,
//     slow_model text not null,
//     slow_api_key text not null,
//     embeddings_provider text,
//     embeddings_model text,
//     embeddings_api_key text,
//     capabilities jsonb not null default '{}'::jsonb,
//     quiescence_ms int not null default 10000,
//     fast_idle_ms int not null default 1000,
//     slow_long_ms int not null default 30000,
//     max_thoughts_per_turn int not null default 500,
//     updated_at timestamptz not null default now()
//   );
//   alter table tenant_configs enable row level security;
//
// RLS: cada tenant solo puede leer su propia fila. El service_role key
// (server-side) puede leer todas; el resolver corre con service_role.
//
// Hoy NADIE instancia este resolver: app.ts usa EnvTenantConfigResolver
// directamente. Se deja listo para cuando Supabase este desplegado.

import { z } from "zod";
import {
  tenantCapabilitiesSchema,
  tenantConfigSchema,
  type TenantConfig,
  type TenantConfigResolver,
} from "./tenant-config.ts";

export interface SupabasePort {
  query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[],
  ): Promise<{ rows: T[] }>;
}

const rowSchema = z.object({
  tenant_id: z.string().min(1),
  fast_provider: z.enum(["google", "anthropic", "openai", "openrouter"]),
  fast_model: z.string().min(1),
  fast_api_key: z.string(),
  slow_provider: z.enum(["google", "anthropic", "openai", "openrouter"]),
  slow_model: z.string().min(1),
  slow_api_key: z.string(),
  embeddings_provider: z
    .enum(["google", "anthropic", "openai", "openrouter"])
    .nullable()
    .optional(),
  embeddings_model: z.string().nullable().optional(),
  embeddings_api_key: z.string().nullable().optional(),
  capabilities: z.unknown(),
  quiescence_ms: z.number().int(),
  fast_idle_ms: z.number().int(),
  slow_long_ms: z.number().int(),
  max_thoughts_per_turn: z.number().int(),
});

export class DatabaseTenantConfigResolver implements TenantConfigResolver {
  constructor(
    private readonly db: SupabasePort,
    private readonly fallback: TenantConfigResolver,
  ) {}

  async resolve(tenantId: string): Promise<TenantConfig> {
    try {
      const result = await this.db.query(
        `select tenant_id,
                fast_provider, fast_model, fast_api_key,
                slow_provider, slow_model, slow_api_key,
                embeddings_provider, embeddings_model, embeddings_api_key,
                capabilities,
                quiescence_ms, fast_idle_ms, slow_long_ms, max_thoughts_per_turn
           from tenant_configs
          where tenant_id = $1
          limit 1`,
        [tenantId],
      );
      if (result.rows.length === 0) return this.fallback.resolve(tenantId);

      const parsed = rowSchema.safeParse(result.rows[0]);
      if (!parsed.success) return this.fallback.resolve(tenantId);
      const row = parsed.data;

      const capabilities = tenantCapabilitiesSchema.parse(
        row.capabilities && typeof row.capabilities === "object"
          ? row.capabilities
          : {},
      );

      return tenantConfigSchema.parse({
        tenantId: row.tenant_id,
        fast: {
          provider: row.fast_provider,
          model: row.fast_model,
          apiKey: row.fast_api_key,
        },
        slow: {
          provider: row.slow_provider,
          model: row.slow_model,
          apiKey: row.slow_api_key,
        },
        ...(row.embeddings_provider &&
        row.embeddings_model &&
        row.embeddings_api_key
          ? {
              embeddings: {
                provider: row.embeddings_provider,
                model: row.embeddings_model,
                apiKey: row.embeddings_api_key,
              },
            }
          : {}),
        capabilities,
        quiescenceMs: row.quiescence_ms,
        fastIdleMs: row.fast_idle_ms,
        slowLongMs: row.slow_long_ms,
        maxThoughtsPerTurn: row.max_thoughts_per_turn,
      });
    } catch {
      // Tabla no existe todavia, red caida o RLS bloqueando: cae al env.
      return this.fallback.resolve(tenantId);
    }
  }
}
```

## File: apps/server/src/kernel/config/tenant-config.ts
```typescript
// KERNEL_TENANT_CONFIG_V3 — config por tenant: LLM + capabilities + tiempos.
//
// Fusion de las dos versiones que circularon por el repo:
//   - ProviderSpec (fast, slow, embeddings) — el LLM del tenant. Vive en
//     provider-spec.ts y se importa aqui.
//   - TenantCapabilities — que partes del kernel estan activas. Idea valida
//     que aporto la otra IA: cada tenant puede tener caps distintas.
//   - tiempos — quiescenceMs, fastIdleMs, slowLongMs, maxThoughtsPerTurn.
//
// SOC-2: cada tenant puede tener sus propias keys, sus propios modelos y sus
// propias capacidades. Nada se asume global.

import { z } from "zod";
import { providerSpecSchema, type ProviderSpec } from "./provider-spec.ts";

export const tenantCapabilitiesSchema = z.object({
  fastChain: z.boolean().default(true),
  slowChain: z.boolean().default(true),
  rag: z.boolean().default(false),
  businessGraph: z.boolean().default(false),
  memory: z.boolean().default(false),
  policy: z.boolean().default(false),
  views: z.boolean().default(true),
  progress: z.boolean().default(true),
  meta: z.boolean().default(true),
  cromos: z.boolean().default(false),
});

export const tenantConfigSchema = z.object({
  tenantId: z.string().min(1).max(100),
  fast: providerSpecSchema,
  slow: providerSpecSchema,
  embeddings: providerSpecSchema.optional(),
  capabilities: tenantCapabilitiesSchema,
  quiescenceMs: z.number().int().min(0).max(600_000).default(10_000),
  fastIdleMs: z.number().int().min(0).max(60_000).default(1_000),
  slowLongMs: z.number().int().min(0).max(300_000).default(30_000),
  maxThoughtsPerTurn: z.number().int().min(1).max(5_000).default(500),
});

export type TenantCapabilities = z.infer<typeof tenantCapabilitiesSchema>;
export type TenantConfig = z.infer<typeof tenantConfigSchema>;

export interface TenantConfigResolver {
  resolve(tenantId: string): Promise<TenantConfig>;
}

// Reexport del tipo para que quien importe de tenant-config.ts tenga
// ProviderSpec a mano sin tener que saltar a provider-spec.ts.
export type { ProviderSpec };
```

## File: apps/server/src/kernel/config/env-resolver.ts
```typescript
// KERNEL_ENV_RESOLVER_V3 — TenantConfig completo desde .env.
//
// Lee:
//   - FAST_LLM_PROVIDER, FAST_LLM_MODEL, FAST_LLM_API_KEY
//   - SLOW_LLM_PROVIDER, SLOW_LLM_MODEL, SLOW_LLM_API_KEY
//   - EMBEDDINGS_LLM_PROVIDER, EMBEDDINGS_LLM_MODEL, EMBEDDINGS_LLM_API_KEY
//   - FAST_CHAIN, SLOW_CHAIN, RAG, BUSINESS_GRAPH, MEMORY, POLICY, VIEWS,
//     PROGRESS, META, CROMOS
//   - QUIESCENCE_MS, FAST_IDLE_MS, SLOW_LONG_MS, MAX_THOUGHTS_PER_TURN
//
// Fallback de keys: si FAST_LLM_API_KEY esta vacio, cae a SLOW_LLM_API_KEY.
// Si ambas estan vacias, queda vacio y el kernel no llamara al LLM (los
// autores fallan honestos). Sin default silencioso: si no hay key, no hay key.

import type {
  TenantCapabilities,
  TenantConfig,
  TenantConfigResolver,
} from "./tenant-config.ts";

type Provider = "google" | "anthropic" | "openai" | "openrouter";

function boolEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return raw === "1" || raw.toLowerCase() === "true";
}

function numEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function providerEnv(name: string, fallback: Provider): Provider {
  const raw = process.env[name]?.trim().toLowerCase();
  if (raw === "google" || raw === "anthropic" || raw === "openai" || raw === "openrouter") {
    return raw;
  }
  return fallback;
}

// ENV_RESOLVER_VALIDATE_V1 — parsea con tenantConfigSchema antes de
  // devolver. Antes, un valor raro caía silenciosamente al default.
  // Ver: auditoría profunda 09.
  import { tenantConfigSchema } from "./tenant-config.ts";

  // CONFIG_CACHE_V1 - cache de TenantConfig por tenant (TTL 5 min).
export class EnvTenantConfigResolver implements TenantConfigResolver {
  async resolve(tenantId: string): Promise<TenantConfig> {
    const fastKey = process.env.FAST_LLM_API_KEY?.trim() ?? "";
    const slowKey = process.env.SLOW_LLM_API_KEY?.trim() ?? "";
    const embeddingsKey =
      process.env.EMBEDDINGS_LLM_API_KEY?.trim() ?? fastKey ?? "";

    const capabilities: TenantCapabilities = {
      fastChain: boolEnv("FAST_CHAIN", true),
      slowChain: boolEnv("SLOW_CHAIN", true),
      rag: boolEnv("RAG", false),
      businessGraph: boolEnv("BUSINESS_GRAPH", false),
      memory: boolEnv("MEMORY", false),
      policy: boolEnv("POLICY", false),
      views: boolEnv("VIEWS", true),
      progress: boolEnv("PROGRESS", true),
      meta: boolEnv("META", true),
      cromos: boolEnv("CROMOS", false),
    };

    const candidate = {
      tenantId,
      fast: {
        provider: providerEnv("FAST_LLM_PROVIDER", "google"),
        model: process.env.FAST_LLM_MODEL?.trim() ?? "gemini-3.6-flash",
        apiKey: fastKey,
      },
      slow: {
        provider: providerEnv("SLOW_LLM_PROVIDER", "google"),
        model: process.env.SLOW_LLM_MODEL?.trim() ?? "gemini-3.6-flash",
        apiKey: slowKey,
      },
      embeddings: {
        provider: providerEnv("EMBEDDINGS_LLM_PROVIDER", "google"),
        model: process.env.EMBEDDINGS_LLM_MODEL?.trim() ?? "text-embedding-004",
        apiKey: embeddingsKey,
      },
      capabilities,
      quiescenceMs: numEnv("QUIESCENCE_MS", 10_000),
      fastIdleMs: numEnv("FAST_IDLE_MS", 1_000),
      slowLongMs: numEnv("SLOW_LONG_MS", 30_000),
      maxThoughtsPerTurn: numEnv("MAX_THOUGHTS_PER_TURN", 500),
    };
    // ENV_RESOLVER_VALIDATE_V1 — parse; si falla, log y fallback.
    const parsed = tenantConfigSchema.safeParse(candidate);
    if (parsed.success) return parsed.data;
    console.warn(
      `[kernel/env-resolver] tenant ${tenantId} config inválido: ${parsed.error.issues[0]?.message ?? "unknown"}`,
    );
    return candidate as unknown as TenantConfig;
  }
}
```

## File: apps/server/src/kernel/tenancy/database-resolver.ts
```typescript
// DATABASE_RESOLVER_PENDING_V1 — adaptador Supabase no cableado.
// En el repo actual, app.ts usa EnvTenantConfigResolver y
// ServiceTenantResolver. Este resolver se activa cuando Supabase
// esté desplegado (fase posterior).
// Ver: auditoría profunda 09.
// KERNEL_DATABASE_TENANT_RESOLVER_V2 — TenantResolver desde Supabase.
//
// Supabase = Postgres + RLS + PostgREST. Este resolver lee la tabla
// tenant_members. Cada owner (user_id) puede pertenecer a uno o varios
// tenants. El primer tenant devuelto es el activo por defecto.
//
// Tabla esperada (SQL se crea en bloque aparte):
//
//   create table tenant_members (
//     user_id text not null,
//     tenant_id text not null,
//     role text not null default 'member',
//     is_default boolean not null default false,
//     created_at timestamptz not null default now(),
//     primary key (user_id, tenant_id)
//   );
//   create index on tenant_members (user_id);
//   alter table tenant_members enable row level security;
//
// RLS: cada usuario solo puede leer sus propias filas. El service_role key
// (server-side) puede leer todas; el resolver corre con service_role.
//
// Fallback: si el owner no tiene fila, se devuelve "default" (single-tenant).
// Eso permite arrancar en un deployment single-tenant sin tocar el kernel.
//
// Hoy NADIE instancia este resolver: app.ts usa DefaultTenantResolver
// directamente. Se deja listo para cuando Supabase este desplegado.

import type { TenantResolver } from "./resolver.ts";
import { DEFAULT_TENANT_ID } from "./default-resolver.ts";

export interface SupabasePort {
  query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[],
  ): Promise<{ rows: T[] }>;
}

export class DatabaseTenantResolver implements TenantResolver {
  constructor(
    private readonly db: SupabasePort,
    private readonly fallback: TenantResolver,
  ) {}

  async resolve(owner: string): Promise<string> {
    try {
      const result = await this.db.query<{ tenant_id: string }>(
        `select tenant_id
           from tenant_members
          where user_id = $1
          order by is_default desc, created_at asc
          limit 1`,
        [owner],
      );
      if (result.rows.length === 0) {
        const fb = await this.fallback.resolve(owner);
        return fb || DEFAULT_TENANT_ID;
      }
      return result.rows[0].tenant_id;
    } catch {
      const fb = await this.fallback.resolve(owner);
      return fb || DEFAULT_TENANT_ID;
    }
  }

  async resolveAll(owner: string): Promise<string[]> {
    try {
      const result = await this.db.query<{ tenant_id: string }>(
        `select tenant_id
           from tenant_members
          where user_id = $1
          order by is_default desc, created_at asc`,
        [owner],
      );
      if (result.rows.length === 0) return [DEFAULT_TENANT_ID];
      return result.rows.map((row) => row.tenant_id);
    } catch {
      return [DEFAULT_TENANT_ID];
    }
  }
}
```
