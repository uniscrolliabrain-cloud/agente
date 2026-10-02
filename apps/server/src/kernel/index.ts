// KERNEL_INDEX_V2 — contrato publico del kernel.
//
// Arreglo K-ARREGLO-1:
//   - Se quita el doble export de TenantConfig (TS2308).
//   - Se quita el export de providerSpecSchema y ProviderSpec desde
//     tenant-config.ts (no existen ahi; TS2305). Cuando exista
//     config/provider-spec.ts, se exportaran desde ahi.
//   - Se quita el bloque duplicado que repetia tenantConfigSchema,
//     EnvTenantConfigResolver y TenantConfigResolver al final.

export { Kernel, type KernelDeps } from "./kernel.ts";
export {
  kernelContextSchema,
  kernelRoleSchema,
  systemContext,
  type KernelContext,
  type KernelRole,
} from "./context/kernel-context.ts";
export {
  attentionVectorSchema,
  thoughtSchema,
  type AttentionVector,
  type Thought,
  type ThoughtActor,
  type ThoughtContext,
  type ThoughtEdge,
  type ThoughtProvenance,
  type ThoughtRole,
} from "./graph/thought.ts";
export {
  turnSchema,
  type Turn,
  type TurnCloseReason,
  type TurnClosedBy,
  type TurnStatus,
} from "./graph/turn.ts";
export type { TurnStore } from "./graph/store.ts";
export { InMemoryTurnStore } from "./graph/in-memory-store.ts";
export { StoreTurnStore, type StorePort } from "./graph/store-store.ts";
export type { TenantResolver } from "./tenancy/resolver.ts";
export { DefaultTenantResolver, DEFAULT_TENANT_ID } from "./tenancy/default-resolver.ts";
export { DatabaseTenantResolver } from "./tenancy/database-resolver.ts";
// SERVICE_TENANT_RESOLVER_V1 - adapter que delega en TenantService.
export { ServiceTenantResolver } from "./tenancy/service-resolver.ts";
export {
  auditEntrySchema,
  type AuditAction,
  type AuditEntry,
} from "./audit/entry.ts";
export type { AuditAppendInput, AuditStore } from "./audit/store.ts";
export { InMemoryAuditStore } from "./audit/in-memory-store.ts";
export { StoreAuditStore } from "./audit/store-store.ts";
export {
  tenantConfigSchema,
  tenantCapabilitiesSchema,
  type TenantConfig,
  type TenantCapabilities,
  type TenantConfigResolver,
} from "./config/tenant-config.ts";
export { EnvTenantConfigResolver } from "./config/env-resolver.ts";
export { DatabaseTenantConfigResolver } from "./config/database-resolver.ts";

export {
  UserAuthor,
  FastAuthor,
  SlowAuthor,
  type UserAuthorDeps,
  type FastAuthorDeps,
  type SlowAuthorDeps,
} from "./authors/index.ts";

export {
  Presenter,
  type PresenterDeps,
  type Presentation,
} from "./observers/presenter.ts";

export {
  Meta,
  metaRuleSchema,
  metaHintSchema,
  type MetaRule,
  type MetaHint,
  type MetaInput,
  type MetaDeps,
} from "./observers/meta.ts";

export {
  Promoter,
  type PromotionDeps,
  type PromotionCounts,
  type PromotionResult,
} from "./graph/promote.ts";

export {
  topMatched,
  totalAttention,
  normalizedWeights,
  matchScore,
  isFocusedOn,
  attentionOverlap,
  divergence,
  toMetadata,
  fromMetadata,
  type AttentionMetadata,
} from "./graph/attention.ts";

export {
  RULES,
  classify,
  type PromotionRule,
  type RuleOutcome,
} from "./graph/rules.ts";

export {
  consolidate,
  type ConsolidationResult,
  type DuplicateGroup,
  type ContradictionPair,
} from "./graph/consolidate.ts";

export {
  progressEventSchema,
  progressKindSchema,
  progressStep,
  partialResult,
  readyResult,
  failedResult,
  type ProgressEvent,
  type ProgressKind,
} from "./graph/progress.ts";

export {
  Views,
  readViewScopeSchema,
  computeViewScopeSchema,
  type ViewsDeps,
  type ReadViewResult,
  type ComputeViewResult,
  type ReadViewScope,
  type ComputeViewScope,
} from "./graph/views.ts";

export { cromoSchema, type Cromo } from "./cromos/cromo.ts";
export { LOGIC_AXIOMS, checkContradiction } from "./cromos/logic/axioms.ts";
export { fieldEnergy, isHighEnergy } from "./cromos/physics/field.ts";