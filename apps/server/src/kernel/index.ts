// KERNEL_INDEX_V1 — re-exporta el contrato publico del kernel.

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
  type TurnStatus,
} from "./graph/turn.ts";
export type { TurnStore } from "./graph/store.ts";
export { InMemoryTurnStore } from "./graph/in-memory-store.ts";
export type { TenantResolver } from "./tenancy/resolver.ts";
export { DefaultTenantResolver, DEFAULT_TENANT_ID } from "./tenancy/default-resolver.ts";
export {
  auditEntrySchema,
  type AuditAction,
  type AuditEntry,
} from "./audit/entry.ts";
export type { AuditAppendInput, AuditStore } from "./audit/store.ts";
export { InMemoryAuditStore } from "./audit/in-memory-store.ts";
export { StoreAuditStore } from "./audit/store-store.ts";
export {
  providerSpecSchema,
  type ProviderSpec,
  type TenantConfig,
  type TenantConfigResolver,
} from "./config/tenant-config.ts";
export { EnvTenantConfigResolver } from "./config/env-resolver.ts";

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

export {
  Meta,
  metaRuleSchema,
  metaHintSchema,
  type MetaRule,
  type MetaHint,
  type MetaInput,
  type MetaDeps,
} from "./observers/meta.ts";
