This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

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
- Only files matching these patterns are included: packages/domain/src/assignment.ts, packages/domain/src/flow.ts, packages/domain/src/assignments/task.ts, packages/domain/src/assignments/goal.ts, packages/domain/src/assignments/monitor.ts, packages/domain/src/assignments/approval.ts, packages/domain/src/assignments/sop.ts, packages/domain/src/agent.ts, packages/domain/src/goal.ts, packages/domain/src/sop.ts, packages/domain/src/index.ts, packages/domain/src/actor.ts, packages/domain/src/policy.ts, packages/domain/src/classification.ts, packages/domain/src/outcome.ts, packages/domain/src/agent-persona.ts, packages/domain/src/execution-context.ts, apps/server/src/actions.ts, apps/server/src/engine/routes.ts, apps/server/src/skills/sop-routes.ts, apps/server/src/engine/agents/personas/registry.ts, apps/server/src/engine/agents/personas/routes.ts, apps/server/src/engine/orchestrator/orchestrator.ts, apps/server/src/engine/authz/pdp.ts, apps/server/src/engine/authz/pep.ts, apps/server/src/engine/authz/with-read.ts, apps/server/src/engine/authz/with-write.ts, apps/server/src/engine/authz/field-filter.ts, apps/server/src/engine/authz/policies.ts, apps/server/src/engine/actors/service.ts, apps/server/src/engine/events/bus.ts, apps/server/src/engine/state-machines.ts, apps/server/src/engine/agents/personas/bootstrap.ts
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      engine/
        actors/
          service.ts
        agents/
          personas/
            bootstrap.ts
            registry.ts
            routes.ts
        authz/
          field-filter.ts
          pdp.ts
          pep.ts
          policies.ts
          with-read.ts
          with-write.ts
        events/
          bus.ts
        orchestrator/
          orchestrator.ts
        routes.ts
        state-machines.ts
      skills/
        sop-routes.ts
      actions.ts
packages/
  domain/
    src/
      assignments/
        approval.ts
        goal.ts
        monitor.ts
        sop.ts
        task.ts
      actor.ts
      agent-persona.ts
      agent.ts
      assignment.ts
      classification.ts
      execution-context.ts
      flow.ts
      goal.ts
      index.ts
      outcome.ts
      policy.ts
      sop.ts
```

# Files

## File: apps/server/src/engine/actors/service.ts
```typescript
// ACTOR_SERVICE_RESOLVE_V1 - resuelve el Actor desde el JwtPayload verificado.
// Fail-closed: sub sin User -> 401; User inactive -> 403; sin tenant -> 401.
// El tenantId se resuelve via TenantService. Sin JIT provisioning.
import type { HumanActor } from "../../../../../packages/domain/src/actor.ts";
import type { JwtPayload } from "../../../../../packages/domain/src/jwt.ts";
import type { User, UserService } from "../../users.ts";
import type { TenantService } from "../tenant.ts";
import { AppError } from "../../../../../packages/domain/src/errors.ts";

export interface ActorServiceDeps {
  users: UserService;
  tenants: TenantService;
}

export class ActorService {
  constructor(private readonly deps: ActorServiceDeps) {}

  async resolve(jwtPayload: JwtPayload): Promise<HumanActor> {
    const sub = jwtPayload.sub.trim();
    if (!sub) throw new AppError("Invalid JWT: missing sub", 401);

    const user: User | null = await this.deps.users.getByAuthProviderId(sub);
    if (!user) throw new AppError("Actor not found for sub", 401);

    if (user.active === false) {
      throw new AppError("Actor is inactive", 403);
    }

    const tenantId = await this.deps.tenants.tenantIdFor(user.id).catch(() => "default");
    if (!tenantId) throw new AppError("Actor has no tenant", 401);

    return {
      kind: "human",
      id: user.id,
      tenantId,
      userId: user.id,
      roles: [user.role === "admin" ? "owner" : "employee"],
      profile: {
        name: user.name,
        email: user.email,
        language: "es",
      },
      active: user.active !== false,
    };
  }
}
```

## File: packages/domain/src/assignments/approval.ts
```typescript
// ASSIGNMENT_IMPL_V1 - ActionProposal como Assignment (kind approval).
// 2.1: sin z.any(). Tipos reales del dominio.
import { z } from "zod";
import { assignmentSchema } from "../assignment.ts";

export const approvalSignerAssignmentSchema = z.object({
  userId: z.string().min(1).max(200),
  signedAt: z.string(),
});

export const approvalAssignmentSchema = assignmentSchema.extend({
  kind: z.literal("approval"),
  hash: z.string().min(1).max(200),
  signers: z.array(approvalSignerAssignmentSchema).max(10).default([]),
  needed: z.number().int().min(1).max(10).default(1),
  executeAt: z.string().nullable().optional(),
  result: z.string().max(4000).nullable().optional(),
  error: z.string().max(4000).nullable().optional(),
  errorKind: z.enum(["business", "infra", "outcome_unknown"]).optional(),
});

export type ApprovalAssignment = z.infer<typeof approvalAssignmentSchema>;
```

## File: packages/domain/src/assignments/goal.ts
```typescript
// ASSIGNMENT_IMPL_V1 - Goal (goal.ts, Zod) como Assignment (kind goal).
// 2.1: sin z.any(). Tipos reales del dominio.
import { z } from "zod";
import { assignmentSchema } from "../assignment.ts";

const goalMilestoneAssignmentSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  done: z.boolean(),
});

export const goalAssignmentSchema = assignmentSchema.extend({
  kind: z.literal("goal"),
  category: z.string().min(1).max(80).optional(),
  milestones: z.array(goalMilestoneAssignmentSchema).max(100).default([]),
});

export type GoalAssignment = z.infer<typeof goalAssignmentSchema>;
```

## File: packages/domain/src/assignments/monitor.ts
```typescript
// ASSIGNMENT_IMPL_V1 - Monitor como Assignment (kind monitor).
// 2.1: sin z.any(). Tipos reales del dominio.
import { z } from "zod";
import { assignmentSchema } from "../assignment.ts";

export const monitorAssignmentSchema = assignmentSchema.extend({
  kind: z.literal("monitor"),
  url: z.string().max(4096),
  condition: z.enum(["change", "contains", "price_below"]),
  value: z.string().max(300),
  intervalMinutes: z.number().int().min(1).max(10080),
  nextCheckAt: z.string(),
  lastCheckedAt: z.string().optional(),
  lastValue: z.string().max(1000).optional(),
  lastHash: z.string().max(200).optional(),
  checks: z.number().int().min(0).default(0),
});

export type MonitorAssignment = z.infer<typeof monitorAssignmentSchema>;
```

## File: packages/domain/src/assignments/sop.ts
```typescript
// ASSIGNMENT_IMPL_V1 - SOP como Assignment (kind sop).
// 2.1: sin z.any(). Tipos reales del dominio.
import { z } from "zod";
import { assignmentSchema } from "../assignment.ts";

export const sopStepAssignmentSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  prompt: z.string().max(12000).optional(),
  allowedTools: z.array(z.string().max(200)).max(100).default([]),
});

export const sopAssignmentSchema = assignmentSchema.extend({
  kind: z.literal("sop"),
  steps: z.array(sopStepAssignmentSchema).max(200).default([]),
  allowedTools: z.array(z.string().max(200)).max(100).default([]),
  trigger: z.string().max(200).optional(),
  skillId: z.string().max(200).optional(),
  active: z.boolean().default(true),
});

export type SopAssignment = z.infer<typeof sopAssignmentSchema>;
```

## File: packages/domain/src/assignments/task.ts
```typescript
// ASSIGNMENT_IMPL_V1 - AgentTask como Assignment (kind task).
// 2.1: sin z.any(). Tipos reales del dominio, declarados localmente
//      porque TaskStep y Evidence son interface, no schema Zod.
import { z } from "zod";
import { assignmentSchema } from "../assignment.ts";

const taskStepAssignmentSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  status: z.enum(["pending", "running", "succeeded", "failed", "waiting"]),
  detail: z.string().max(2000).optional(),
  durationMs: z.number().int().nonnegative().optional(),
});

const evidenceAssignmentSchema = z.object({
  id: z.string().min(1).max(200),
  kind: z.enum(["mail", "file", "web", "user"]),
  title: z.string().min(1).max(300),
  excerpt: z.string().max(4000),
  url: z.string().max(4096).optional(),
});

const outcomeAssignmentSchema = z.object({
  status: z.enum(["achieved", "partial", "blocked", "failed", "unknown"]),
  summary: z.string().max(8000),
  evidence: z.array(evidenceAssignmentSchema).max(200).default([]),
  metrics: z.array(z.object({
    key: z.string().min(1).max(200),
    value: z.number(),
    unit: z.string().max(50).optional(),
  })).max(200).default([]),
  verified: z.boolean().default(false),
  verifiedAt: z.string().optional(),
  verificationNote: z.string().max(2000).optional(),
});

export const agentTaskAssignmentSchema = assignmentSchema.extend({
  kind: z.literal("task"),
  plan: z.array(taskStepAssignmentSchema).max(200).optional(),
  evidence: z.array(evidenceAssignmentSchema).max(50).default([]),
  outcome: outcomeAssignmentSchema.optional(),
  attempts: z.number().int().min(0).default(0),
  actionId: z.string().max(200).nullable().optional(),
  leaseId: z.string().nullable().optional(),
  leaseUntil: z.string().nullable().optional(),
});

export type AgentTaskAssignment = z.infer<typeof agentTaskAssignmentSchema>;
```

## File: packages/domain/src/actor.ts
```typescript
// ACTOR_MODEL_V1 - actor como vista derivada del JWT + User.
// Sin persistencia. Sin ActorRegistry. Se computa en cada request.
// HumanActor desde User. AgentActor desde AgentRole.
// ActorFlow es F3, no F1.
// B1 aplicada: AgentActor.id = runtimeId, runtimeId obligatorio.
import { z } from "zod";

export const actorKindSchema = z.enum(["human", "agent"]);

export const actorRoleSchema = z.enum([
  "owner", "manager", "employee", "hr", "compliance", "agent",
]);

export const actorProfileSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.email().optional(),
  avatar: z.string().max(2000).optional(),
  timezone: z.string().max(100).optional(),
  language: z.string().min(2).max(10).default("es"),
});

export const actorRolesSchema = z.array(actorRoleSchema).min(1).max(10);

export const humanActorSchema = z.object({
  kind: z.literal("human"),
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  userId: z.string().min(1).max(200),
  roles: actorRolesSchema,
  profile: actorProfileSchema,
  active: z.boolean(),
});

// B1 aplicada: id = runtimeId (instancia estable). roleId es el rol
// que ejecuta. personaId es la persona funcional si aplica. runtimeId
// es obligatorio: sin el, el actor no se construye (fail-closed).
export const agentActorSchema = z.object({
  kind: z.literal("agent"),
  id: z.string().min(1).max(200),          // = runtimeId
  tenantId: z.string().min(1).max(100),
  roleId: z.string().min(1).max(200),
  personaId: z.string().min(1).max(200).optional(),
  runtimeId: z.string().min(1).max(200),   // obligatorio
  kernelTurnId: z.string().max(200).optional(),
  roles: actorRolesSchema,
  profile: actorProfileSchema,
  active: z.boolean(),
});

export const actorSchema = z.discriminatedUnion("kind", [
  humanActorSchema,
  agentActorSchema,
]);

export type ActorKind = z.infer<typeof actorKindSchema>;
export type ActorRole = z.infer<typeof actorRoleSchema>;
export type ActorProfile = z.infer<typeof actorProfileSchema>;
export type HumanActor = z.infer<typeof humanActorSchema>;
export type AgentActor = z.infer<typeof agentActorSchema>;
export type Actor = z.infer<typeof actorSchema>;
```

## File: packages/domain/src/assignment.ts
```typescript
// ASSIGNMENT_MODEL_V1 - interfaz de lectura unificada de asignación.
// AgentTask (task), Goal (goal), Monitor (monitor), ActionProposal (approval),
// SOP (sop) son implementaciones. NO se persiste como entidad propia.
// Se computa on-the-fly desde el record original usando el adapter.
//
// B-N1: Assignment.id = `${kind}:${recordId}`. Estable entre llamadas,
//       único entre kinds, reconstruible desde el record.
// B-N2: assignmentStatusSchema es la unión de los estados reales de los
//       5 kinds. Cada Assignment lleva nativeStatus con el estado nativo
//       del record original.
// B-N3: assignmentOutcomeSchema reusa outcomeStatusSchema de outcome.ts.
// 2.3:  assignedTo es opcional; null representa bandeja de pendientes.
// 2.2:  metadata está declarado y validado; no es un cajón de sastre.
import { z } from "zod";
import { outcomeStatusSchema } from "./outcome.ts";

export const assignmentKindSchema = z.enum(["task", "goal", "monitor", "approval", "sop"]);

// Unión de estados reales de los 5 kinds:
// - task: queued, running, waiting_input, waiting_approval, scheduled, paused, succeeded, failed, cancelled
// - goal: active, paused, completed
// - monitor: active, paused, stopped
// - approval: awaiting_review, scheduled, executing, succeeded, failed, outcome_unknown, denied, cancelled, expired
// - sop: active, inactive
export const assignmentStatusSchema = z.enum([
  "queued", "running", "waiting_input", "waiting_approval", "scheduled", "paused",
  "succeeded", "failed", "cancelled",
  "active", "completed",
  "stopped",
  "awaiting_review", "executing", "outcome_unknown", "denied", "expired",
  "inactive",
]);

export const assignmentPlanStepSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  status: z.enum(["pending", "running", "succeeded", "failed", "waiting"]).default("pending"),
  detail: z.string().max(2000).optional(),
  durationMs: z.number().int().nonnegative().optional(),
});

export const assignmentPlanSchema = z.array(assignmentPlanStepSchema).max(200);

export const assignmentEvidenceSchema = z.object({
  id: z.string().min(1).max(200),
  kind: z.enum(["mail", "file", "web", "user"]),
  title: z.string().min(1).max(300),
  excerpt: z.string().max(4000),
  url: z.string().max(4096).optional(),
});

// B-N3: reusa outcomeStatusSchema de outcome.ts. No lo redefine.
export const assignmentOutcomeSchema = z.object({
  status: outcomeStatusSchema,
  summary: z.string().max(8000),
  evidence: z.array(assignmentEvidenceSchema).max(50).default([]),
  metrics: z.array(z.object({
    key: z.string().min(1).max(200),
    value: z.number(),
    unit: z.string().max(50).optional(),
  })).max(200).default([]),
  completedAt: z.string(),
});

// 2.2: metadata declarado y validado. Solo claves string, valores JSON.
export const assignmentMetadataSchema = z.record(z.string().max(200), z.unknown());

export const assignmentSchema = z.object({
  // B-N1: id = `${kind}:${recordId}`.
  id: z.string().min(1).max(400).regex(/^(task|goal|monitor|approval|sop):[^:]+$/),
  tenantId: z.string().min(1).max(100),
  kind: assignmentKindSchema,
  // 2.3: assignedTo opcional. null = bandeja de pendientes.
  assignedTo: z.string().min(1).max(200).nullable(),
  assignedBy: z.string().min(1).max(200).nullable(),
  // B-N2: status es la vista normalizada; nativeStatus es el estado del record.
  status: assignmentStatusSchema,
  nativeStatus: z.string().min(1).max(100),
  plan: assignmentPlanSchema.optional(),
  evidence: z.array(assignmentEvidenceSchema).max(50).default([]),
  outcome: assignmentOutcomeSchema.optional(),
  // 2.2: metadata declarado. Solo si el adapter lo necesita.
  metadata: assignmentMetadataSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AssignmentKind = z.infer<typeof assignmentKindSchema>;
export type AssignmentStatus = z.infer<typeof assignmentStatusSchema>;
export type AssignmentPlan = z.infer<typeof assignmentPlanSchema>;
export type AssignmentEvidence = z.infer<typeof assignmentEvidenceSchema>;
export type AssignmentOutcome = z.infer<typeof assignmentOutcomeSchema>;
export type Assignment = z.infer<typeof assignmentSchema>;
```

## File: packages/domain/src/flow.ts
```typescript
// FLOW_MODEL_V1 - estructura formal de flujo organizacional.
// Construido desde AgentPersona.reportsTo y AgentPersona.peers.
// NO desde AgentRole (AgentRole no tiene reportsTo ni peers).
// reportsTo: a quién reporta el actor.
// peers: pares simétricos.
// assigners/approvers/reviewers NO se persisten en Flow.
// Se resuelven desde Policy (F2).
//
// 3: FlowRelation resuelve personaId contra un Actor real del mismo
//    tenant. No asume personaId === actorId. Rechaza cruces de tenant.
//    Ser par no implica poder asignar, aprobar o escalar.
import { z } from "zod";

export const flowRelationSchema = z.object({
  // 3: actorId es el id del Actor resuelto, no el personaId.
  actorId: z.string().min(1).max(200),
  // 3: personaId es el id original de AgentPersona, para trazabilidad.
  personaId: z.string().min(1).max(80),
  kind: z.enum(["human", "agent"]),
  role: z.enum(["owner", "manager", "employee", "hr", "compliance", "agent"]),
  // 3: tenantId valida que la relación no cruza tenants.
  tenantId: z.string().min(1).max(100),
});

export const flowSchema = z.object({
  reportsTo: flowRelationSchema.optional(),
  peers: z.array(flowRelationSchema).max(50).default([]),
});

export type FlowRelation = z.infer<typeof flowRelationSchema>;
export type Flow = z.infer<typeof flowSchema>;
```

## File: apps/server/src/engine/agents/personas/bootstrap.ts
```typescript
// PERSONAS_BOOTSTRAP_V1 - carga personas desde disco al arrancar.
//
// El bootstrap del server llama a bootstrapPersonas() una vez por tenant
// activo. Carga todos los persona.json + stats.json, los valida, y los
// registra en el PersonaRegistry.
//
// Fail-soft por persona: si una no valida, esa se salta y las demas
// cargan.

import { join } from "node:path";
import type { PersonaRegistry } from "./registry.ts";
import { loadTenantPersonas } from "./loader.ts";

export interface BootstrapResult {
  tenantId: string;
  loaded: number;
  failed: number;
  errors: string[];
}

export async function bootstrapPersonas(
  registry: PersonaRegistry,
  tenantId: string,
  clientsDir: string,
): Promise<BootstrapResult> {
  const tenantDir = join(clientsDir, tenantId, "personas");
  const loaded = await loadTenantPersonas(tenantDir);
  for (const persona of loaded.personas) {
    const stats = loaded.stats[persona.id];
    if (!stats) continue;
    registry.register(tenantId, persona, stats);
  }
  return {
    tenantId,
    loaded: loaded.personas.length,
    failed: loaded.errors.length,
    errors: loaded.errors,
  };
}

export async function bootstrapAllPersonas(
  registry: PersonaRegistry,
  tenants: string[],
  clientsDir: string,
): Promise<BootstrapResult[]> {
  const results: BootstrapResult[] = [];
  for (const tenantId of tenants) {
    results.push(await bootstrapPersonas(registry, tenantId, clientsDir));
  }
  return results;
}
```

## File: apps/server/src/engine/authz/field-filter.ts
```typescript
// FIELD_FILTER_V1 - filtra campos por clasificacion usando el mapa servidor.
// Se aplica en withRead, withWrite, serializadores, listados, busquedas, agregaciones.
import type { PolicyDecisionPoint, PolicyContext, PolicyTarget } from "./pdp.ts";
import {
  DEFAULT_CLASSIFICATION,
  type FieldClassification,
} from "../../../../../packages/domain/src/classification.ts";

export class FieldFilter {
  constructor(
    private readonly pdp: PolicyDecisionPoint,
    private readonly classification: Record<string, Record<string, FieldClassification>> = DEFAULT_CLASSIFICATION,
  ) {}

  async filter<T extends Record<string, unknown>>(
    ctx: PolicyContext,
    resource: string,
    record: T,
    target: PolicyTarget,
  ): Promise<T> {
    const map = this.classification[resource];
    if (!map) return record;
    const out: Record<string, unknown> = { ...record };
    for (const [field, classification] of Object.entries(map)) {
      if (!(field in out)) continue;
      if (classification === "public" || classification === "internal") continue;
      const decision = await this.pdp.can(
        ctx,
        "read",
        resource as never,
        field,
        { ...target, classification },
      );
      if (decision === "deny") {
        out[field] = "[REDACTED]";
      }
    }
    return out as T;
  }

  async filterList<T extends Record<string, unknown>>(
    ctx: PolicyContext,
    resource: string,
    records: T[],
    target: PolicyTarget,
  ): Promise<T[]> {
    const out: T[] = [];
    for (const r of records) {
      out.push(await this.filter(ctx, resource, r, target));
    }
    return out;
  }
}
```

## File: apps/server/src/engine/authz/pdp.ts
```typescript
// POLICY_DECISION_POINT_V1 - ABAC fail-closed con deny-overrides y tenant.
// El PDP resuelve el AgentRole real, no construye role = { id }.
import type {
  Policy, PolicyAction, PolicyCondition, PolicyDecision, PolicyEffect, PolicyResource, PolicySubject,
} from "../../../../../packages/domain/src/policy.ts";
import type { Actor } from "../../../../../packages/domain/src/actor.ts";
import type { AgentRole } from "../../../../../packages/domain/src/agent.ts";

export interface PolicyContext {
  tenantId: string;
  actor: Actor;
  sessionId?: string;
  requestId?: string;
}

export interface PolicyTarget {
  ownerId?: string;
  taskScope?: string;
  assignedBy?: string;
  classification?: "public" | "internal" | "confidential" | "restricted" | "secret";
}

export interface PolicyDeps {
  engine?: { can: (owner: string, role: { id: string; permissions?: Array<{ resource: string; actions: string[] }> }, resource: string, action: string) => Promise<{ allowed: boolean; reason?: string }> };
  getAgentRole?: (tenantId: string, roleId: string) => Promise<AgentRole | null>;
}

export class PolicyDecisionPoint {
  constructor(
    private readonly policies: Policy[],
    private readonly deps: PolicyDeps = {},
  ) {}

  async can(
    ctx: PolicyContext,
    action: PolicyAction,
    resource: PolicyResource,
    field: string | undefined,
    target: PolicyTarget,
  ): Promise<PolicyDecision> {
    const applicable = this.policies.filter((p) =>
      p.resource === resource
      && p.action === action
      && (p.tenantId === undefined || p.tenantId === ctx.tenantId)
      && this.subjectMatches(p.subject, ctx.actor)
      && this.fieldMatches(p.field, field)
    );
    let sawAllow = false;
    for (const p of applicable) {
      const decision = this.decide(p, ctx, target);
      if (decision === "deny") return "deny";
      if (decision === "allow") sawAllow = true;
    }
    if (ctx.actor.kind === "agent" && "roleId" in ctx.actor) {
      const roleId = (ctx.actor as { roleId: string }).roleId;
      if (!this.deps.getAgentRole) return "deny";
      const role = await this.deps.getAgentRole(ctx.tenantId, roleId);
      if (!role) return "deny";
      const verdict = await this.deps.engine?.can(ctx.actor.id, role, resource, action);
      if (verdict && !verdict.allowed) return "deny";
    }
    return sawAllow ? "allow" : "deny";
  }

  private decide(p: Policy, ctx: PolicyContext, target: PolicyTarget): PolicyEffect {
    if (!p.condition) return p.effect;
    const allowed = this.evaluateCondition(p.condition, ctx, target);
    return allowed ? p.effect : (p.effect === "allow" ? "deny" : "allow");
  }

  private subjectMatches(subject: PolicySubject, actor: Actor): boolean {
    if (subject.actorId && subject.actorId !== actor.id) return false;
    if (subject.kind && subject.kind !== actor.kind) return false;
    if (subject.role && !actor.roles.includes(subject.role)) return false;
    return true;
  }

  private fieldMatches(policyField: string | undefined, field: string | undefined): boolean {
    if (!policyField) return true;
    if (!field) return false;
    return policyField === field || policyField === "*";
  }

  private evaluateCondition(condition: PolicyCondition, ctx: PolicyContext, target: PolicyTarget): boolean {
    switch (condition.kind) {
      case "ownedBy":
        return target.ownerId === ctx.actor.id;
      case "inTaskScope":
        return target.taskScope === condition.value;
      case "assignedBy":
        return target.assignedBy === condition.value;
      case "hasClassification":
        return target.classification === condition.value;
      default:
        return false;
    }
  }
}
```

## File: apps/server/src/engine/authz/pep.ts
```typescript
// POLICY_ENFORCEMENT_POINT_V1 - middleware HTTP que adjunta ctx al request.
// No es la unica defensa: los handlers usan withRead/withWrite.
import type { Context, Next } from "hono";
import type { PolicyDecisionPoint, PolicyContext } from "./pdp.ts";

export function authzMiddleware(pdp: PolicyDecisionPoint) {
  return async (c: Context, next: Next) => {
    const actor = c.get("actor");
    const ctx = c.get("ctx");
    if (!actor || !ctx) {
      c.set("authz", { pdp, ctx: null });
      await next();
      return;
    }
    const policyCtx: PolicyContext = {
      tenantId: ctx.tenantId,
      actor,
      sessionId: ctx.sessionId,
      requestId: ctx.requestId,
    };
    c.set("authz", { pdp, ctx: policyCtx });
    await next();
  };
}
```

## File: apps/server/src/engine/authz/policies.ts
```typescript
// POLICIES_DEFAULT_V1 - traduce AgentRole a Policy con effect: allow.
// Anade politicas por defecto con effect: deny donde el owner no debe ser root.
import type { AgentRole } from "../../../../../packages/domain/src/agent.ts";
import type { Policy, PolicyAction, PolicyResource } from "../../../../../packages/domain/src/policy.ts";

const RESOURCE_MAP: Record<string, PolicyResource> = {
  task: "task", goal: "goal", monitor: "monitor", memory: "memory",
  artifact: "artifact", sop: "sop", role: "role", action: "action",
  computer: "computer", file: "file", rag: "rag", audit: "audit",
  presence: "presence", lock: "lock", notification: "notification",
  thread: "thread", project: "project",
};

export function buildPoliciesFromAgentRole(tenantId: string, role: AgentRole): Policy[] {
  const out: Policy[] = [];
  for (const perm of role.permissions ?? []) {
    const resource = RESOURCE_MAP[perm.resource] ?? (perm.resource as PolicyResource);
    for (const action of perm.actions as PolicyAction[]) {
      out.push({ id: `${tenantId}:${role.id}:${resource}:${action}`, subject: { role: "agent", kind: "agent" }, action, resource, effect: "allow", tenantId });
    }
  }
  for (const tool of role.allowedTools ?? []) {
    out.push({ id: `${tenantId}:${role.id}:tool:${tool}`, subject: { role: "agent", kind: "agent" }, action: "execute", resource: "action", effect: "allow", tenantId });
  }
  return out;
}

export function defaultPolicies(): Policy[] {
  return [
    { id: "default:deny:secret:read", subject: { kind: "human" }, action: "read", resource: "task", effect: "deny", field: "outcome", condition: { kind: "hasClassification", value: "secret" } },
  ];
}
```

## File: apps/server/src/engine/authz/with-read.ts
```typescript
// WITH_READ_V1 - wrapper de lectura con PDP + FieldFilter + AuditTrail.
// Separa actor.id, owner del store y tenantId. No los sustituye.
import type { PolicyDecisionPoint, PolicyContext, PolicyTarget } from "./pdp.ts";
import type { FieldFilter } from "./field-filter.ts";
import type { Store } from "../../db.ts";
import type { StoreAuditStore } from "../../kernel/audit/store-store.ts";
import { AppError } from "../../errors.ts";

export interface WithReadDeps {
  pdp: PolicyDecisionPoint;
  fieldFilter: FieldFilter;
  db: Store;
  audit?: StoreAuditStore;
}

export async function withRead<T extends Record<string, unknown>>(
  deps: WithReadDeps,
  ctx: PolicyContext,
  kind: string,
  id: string,
  fn: (record: T) => Promise<T> | T,
): Promise<T> {
  // owner del store se resuelve con ctx.tenantId + actor.id, no se sustituye.
  const owner = `${ctx.tenantId}:${ctx.actor.id}`;
  const record = await deps.db.get<T>(owner, kind, id);
  if (!record) throw new AppError("Not found", 404);
  const target: PolicyTarget = { ownerId: ctx.actor.id };
  const decision = await deps.pdp.can(ctx, "read", kind as never, undefined, target);
  if (decision === "deny") {
    if (deps.audit) {
      await deps.audit.append({
        tenantId: ctx.tenantId,
        owner,
        action: "read.denied",
        actor: { kind: ctx.actor.kind, id: ctx.actor.id },
        payload: {
          resource: kind,
          field: null,
          classification: null,
          allowed: false,
          timestamp: new Date().toISOString(),
        },
      });
    }
    throw new AppError("Forbidden", 403);
  }
  const filtered = await deps.fieldFilter.filter(ctx, kind, record, target);
  return fn(filtered as T);
}
```

## File: apps/server/src/engine/authz/with-write.ts
```typescript
// WITH_WRITE_V1 - wrapper de escritura con PDP + CAS (sin version, F4) + AuditTrail.
// Separa actor.id, owner del store y tenantId. No los sustituye.
import type { PolicyDecisionPoint, PolicyContext, PolicyTarget } from "./pdp.ts";
import type { Store } from "../../db.ts";
import type { StoreAuditStore } from "../../kernel/audit/store-store.ts";
import { AppError } from "../../errors.ts";

export interface WithWriteDeps {
  pdp: PolicyDecisionPoint;
  db: Store;
  audit?: StoreAuditStore;
}

export async function withWrite<T extends Record<string, unknown>>(
  deps: WithWriteDeps,
  ctx: PolicyContext,
  kind: string,
  id: string,
  fn: (record: T | null) => Promise<T> | T,
  useCompareAndSwap = false,
): Promise<T> {
  const owner = `${ctx.tenantId}:${ctx.actor.id}`;
  const target: PolicyTarget = { ownerId: ctx.actor.id };
  const decision = await deps.pdp.can(ctx, "update", kind as never, undefined, target);
  if (decision === "deny") {
    if (deps.audit) {
      await deps.audit.append({
        tenantId: ctx.tenantId,
        owner,
        action: "write.denied",
        actor: { kind: ctx.actor.kind, id: ctx.actor.id },
        payload: {
          resource: kind,
          field: null,
          classification: null,
          allowed: false,
          timestamp: new Date().toISOString(),
        },
      });
    }
    throw new AppError("Forbidden", 403);
  }
  const current = await deps.db.get<T>(owner, kind, id);
  const next = await fn(current);
  // WITH_WRITE_CAS_V1 - si useCompareAndSwap, CAS sobre {} para no perder updates concurrentes.
  if (useCompareAndSwap && deps.db.compareAndSwap) {
    const updated = await deps.db.compareAndSwap<T>(owner, kind, id, {}, next as Record<string, unknown>);
    if (!updated) throw new AppError("Conflict", 409);
  } else {
    await deps.db.put(owner, kind, next);
  }
  if (deps.audit) {
    await deps.audit.append({
      tenantId: ctx.tenantId,
      owner,
      action: "write.ok",
      actor: { kind: ctx.actor.kind, id: ctx.actor.id },
      payload: {
        resource: kind,
        allowed: true,
        timestamp: new Date().toISOString(),
      },
    });
  }
  return next;
}
```

## File: apps/server/src/engine/state-machines.ts
```typescript
import { AppError } from "../errors.ts";
import {
  StateMachineEngine,
  stateMachineSchema,
  type StateMachine,
} from "./policy/state-machine.ts";
import type { Store } from "../db.ts";
import type { EventBus } from "./events/index.ts";

// STATE_MACHINES_REGISTRY_V1 — CRUD de maquinas de estado por owner. La definicion
// vive en records con kind "state-machines". El StateMachineEngine solo ejecuta la
// transicion; aqui se persiste, se lista y se valida el schema.

const KIND = "state-machines";

export class StateMachineRegistry {
  constructor(
    private readonly db: Store,
    private readonly engine: StateMachineEngine,
    private readonly bus?: EventBus,
  ) {}

  async get(owner: string, id: string): Promise<StateMachine | null> {
    return this.db.get<StateMachine>(owner, KIND, id);
  }

  async list(owner: string): Promise<StateMachine[]> {
    return this.db.list<StateMachine>(owner, KIND);
  }

  async upsert(owner: string, raw: unknown): Promise<StateMachine> {
    const parsed = stateMachineSchema.parse(raw);
    await this.db.put(owner, KIND, parsed);
    return parsed;
  }

  async remove(owner: string, id: string): Promise<void> {
    const existing = await this.db.get<StateMachine>(owner, KIND, id);
    if (!existing) throw new AppError("State machine not found", 404);
    await this.db.remove(owner, KIND, id);
  }

  /**
   * Aplica una transicion sobre una entidad. Delega la validacion al StateMachineEngine.
   */
  async apply(
    owner: string,
    machineId: string,
    entityId: string,
    from: string,
    to: string,
    roleId?: string,
  ) {
    const machine = await this.get(owner, machineId);
    if (!machine) throw new AppError(`State machine not found: ${machineId}`, 404);
    return this.engine.transition(owner, machine, entityId, from, to, roleId);
  }
}
```

## File: packages/domain/src/classification.ts
```typescript
// FIELD_CLASSIFICATION_V1 - clasificacion por campo, mapa servidor.
// No se guarda en el registro. El FieldFilter consulta este mapa.
import { z } from "zod";

export const fieldClassificationSchema = z.enum([
  "public", "internal", "confidential", "restricted", "secret",
]);

export const classifiedFieldSchema = z.object({
  field: z.string().min(1).max(200),
  classification: fieldClassificationSchema,
});

export const classifiedRecordSchema = z.object({
  fields: z.array(classifiedFieldSchema).max(200),
});

export type FieldClassification = z.infer<typeof fieldClassificationSchema>;
export type ClassifiedField = z.infer<typeof classifiedFieldSchema>;
export type ClassifiedRecord = z.infer<typeof classifiedRecordSchema>;

// Mapa por defecto. Controlado por servidor, no por cliente.
export const DEFAULT_CLASSIFICATION: Record<string, Record<string, FieldClassification>> = {
  user: { email: "internal", name: "internal", setup: "confidential" },
  agentRole: { permissions: "restricted", memories: "confidential", allowedTools: "restricted" },
  agentTask: { prompt: "confidential", plan: "internal", outcome: "internal" },
  agentMemory: { text: "confidential" },
  businessEntity: { properties: "internal" },
  sop: { steps: "internal" },
};
```

## File: packages/domain/src/execution-context.ts
```typescript
// EXECUTION_CONTEXT_V1 - contexto unificado que viaja por todas las APIs internas.

import { z } from "zod";

export const executionRoleSchema = z.enum(["admin", "user", "agent", "system"]);

export const executionContextSchema = z.object({
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  role: executionRoleSchema,
  roleId: z.string().max(200).optional(),
  requestId: z.string().min(1).max(100),
  correlationId: z.string().max(200).optional(),
  runtimeId: z.string().max(200).optional(),
  goalId: z.string().max(200).optional(),
  taskId: z.string().max(200).optional(),
  threadId: z.string().max(200).optional(),
  turnId: z.string().max(200).optional(),
  // EXECUTION_CONTEXT_ACTOR_V1 - opcional en F1, obligatorio en F2.
  actorId: z.string().max(200).optional(),
  sessionId: z.string().max(200).optional(),
});

export type ExecutionRole = z.infer<typeof executionRoleSchema>;
export type ExecutionContext = z.infer<typeof executionContextSchema>;
```

## File: packages/domain/src/goal.ts
```typescript
// GOAL_V1 - objetivo empresarial con estado deseado y criterios de exito.

import { z } from "zod";

export const goalStatusSchema = z.enum([
  "draft",
  "active",
  "waiting",
  "achieved",
  "partial",
  "blocked",
  "failed",
  "cancelled",
]);

export const goalPrioritySchema = z.enum(["low", "medium", "high", "critical"]);

export const successCriterionSchema = z.object({
  id: z.string().min(1).max(100),
  kind: z.enum(["metric", "boolean", "count", "state"]),
  key: z.string().min(1).max(200),
  operator: z.enum([">=", "<=", "==", "!=", ">", "<"]),
  value: z.unknown(),
  description: z.string().max(500).optional(),
});

export const goalConstraintSchema = z.object({
  id: z.string().min(1).max(100),
  kind: z.enum(["budget", "deadline", "policy", "custom"]),
  value: z.unknown(),
  description: z.string().max(500).optional(),
});

export const goalSchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  roleId: z.string().max(200).optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(4000).default(""),
  desiredState: z.record(z.string(), z.unknown()).default({}),
  successCriteria: z.array(successCriterionSchema).max(50).default([]),
  constraints: z.array(goalConstraintSchema).max(50).default([]),
  priority: goalPrioritySchema.default("medium"),
  deadline: z.iso.datetime({ offset: true }).optional(),
  status: goalStatusSchema.default("draft"),
  parentGoalId: z.string().max(100).optional(),
  entityId: z.string().max(200).optional(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
  achievedAt: z.iso.datetime({ offset: true }).optional(),
});

export type GoalStatus = z.infer<typeof goalStatusSchema>;
export type GoalPriority = z.infer<typeof goalPrioritySchema>;
export type SuccessCriterion = z.infer<typeof successCriterionSchema>;
export type GoalConstraint = z.infer<typeof goalConstraintSchema>;
export type Goal = z.infer<typeof goalSchema>;
```

## File: packages/domain/src/outcome.ts
```typescript
// OUTCOME_V1 - resultado estructurado de una ejecucion.

import { z } from "zod";

export const outcomeStatusSchema = z.enum([
  "achieved",
  "partial",
  "blocked",
  "failed",
  "unknown",
]);

export const outcomeEvidenceSchema = z.object({
  id: z.string().min(1).max(100),
  kind: z.enum(["fact", "inference", "user_assertion", "observation"]),
  source: z.string().min(1).max(300),
  excerpt: z.string().max(4000).optional(),
  url: z.string().max(2000).optional(),
  timestamp: z.iso.datetime({ offset: true }),
  confidence: z.number().min(0).max(1).optional(),
});

export const outcomeMetricSchema = z.object({
  key: z.string().min(1).max(200),
  value: z.number(),
  unit: z.string().max(50).optional(),
});

export const outcomeSchema = z.object({
  status: outcomeStatusSchema,
  summary: z.string().max(8000),
  evidence: z.array(outcomeEvidenceSchema).max(200).default([]),
  metrics: z.array(outcomeMetricSchema).max(200).default([]),
  verified: z.boolean().default(false),
  verifiedAt: z.iso.datetime({ offset: true }).optional(),
  verificationNote: z.string().max(2000).optional(),
});

export type OutcomeStatus = z.infer<typeof outcomeStatusSchema>;
export type OutcomeEvidence = z.infer<typeof outcomeEvidenceSchema>;
export type OutcomeMetric = z.infer<typeof outcomeMetricSchema>;
export type Outcome = z.infer<typeof outcomeSchema>;
```

## File: packages/domain/src/policy.ts
```typescript
// POLICY_MODEL_V1 - modelo ABAC declarativo con effect explicito.
// Fail-closed. Deny-overrides. Solo recursos reales del codigo.
import { z } from "zod";

export const policyActionSchema = z.enum([
  "read", "create", "update", "delete", "approve", "export", "assign", "escalate", "execute",
]);

export const policyResourceSchema = z.enum([
  "task", "goal", "monitor", "memory", "artifact", "sop", "role",
  "action", "computer", "file", "rag", "audit", "presence", "lock",
  "notification", "thread", "project",
]);

export const policySubjectSchema = z.object({
  actorId: z.string().min(1).max(200).optional(),
  role: z.enum(["owner", "manager", "employee", "hr", "compliance", "agent"]).optional(),
  kind: z.enum(["human", "agent"]).optional(),
});

export const policyConditionSchema = z.object({
  kind: z.enum(["ownedBy", "inTaskScope", "assignedBy", "hasClassification"]),
  value: z.string().min(1).max(200).optional(),
});

export const policyEffectSchema = z.enum(["allow", "deny"]);

export const policySchema = z.object({
  id: z.string().min(1).max(200),
  subject: policySubjectSchema,
  action: policyActionSchema,
  resource: policyResourceSchema,
  effect: policyEffectSchema,
  field: z.string().min(1).max(200).optional(),
  condition: policyConditionSchema.optional(),
  tenantId: z.string().min(1).max(100).optional(),
});

export const policyDecisionSchema = z.enum(["allow", "deny"]);

export type PolicyAction = z.infer<typeof policyActionSchema>;
export type PolicyResource = z.infer<typeof policyResourceSchema>;
export type PolicySubject = z.infer<typeof policySubjectSchema>;
export type PolicyCondition = z.infer<typeof policyConditionSchema>;
export type PolicyEffect = z.infer<typeof policyEffectSchema>;
export type Policy = z.infer<typeof policySchema>;
export type PolicyDecision = z.infer<typeof policyDecisionSchema>;
```

## File: apps/server/src/engine/agents/personas/registry.ts
```typescript
// PERSONAS_REGISTRY_V1 - registro en memoria de personas por tenant.
//
// Estructura:
//   Map<tenantId, Map<personaId, { persona, stats }>>
//
// Es un cache de lectura. Se carga al arrancar el server desde disco
// (bootstrap.ts). Si el owner edita una persona, se recarga (endpoint
// en Macro D).

import type {
  AgentPersona,
  AgentStats,
} from "../../../../../../packages/domain/src/agent-persona.ts";

interface RegisteredPersona {
  persona: AgentPersona;
  stats: AgentStats;
}

export class PersonaRegistry {
  private readonly byTenant = new Map<string, Map<string, RegisteredPersona>>();

  register(tenantId: string, persona: AgentPersona, stats: AgentStats): void {
    let tenantMap = this.byTenant.get(tenantId);
    if (!tenantMap) {
      tenantMap = new Map();
      this.byTenant.set(tenantId, tenantMap);
    }
    tenantMap.set(persona.id, { persona, stats });
  }

  get(tenantId: string, personaId: string): RegisteredPersona | undefined {
    return this.byTenant.get(tenantId)?.get(personaId);
  }

  // PERSONAS_REGISTRY_TENANT_INDEX_V1
  list(tenantId: string): RegisteredPersona[] {
    const tenantMap = this.byTenant.get(tenantId);
    if (!tenantMap) return [];
    return [...tenantMap.values()];
  }

  has(tenantId: string, personaId: string): boolean {
    return this.byTenant.get(tenantId)?.has(personaId) ?? false;
  }

  updateStats(tenantId: string, personaId: string, stats: AgentStats): boolean {
    const entry = this.byTenant.get(tenantId)?.get(personaId);
    if (!entry) return false;
    entry.stats = stats;
    return true;
  }

  clear(): void {
    this.byTenant.clear();
  }

  clearTenant(tenantId: string): void {
    this.byTenant.delete(tenantId);
  }
}
```

## File: apps/server/src/skills/sop-routes.ts
```typescript
import { Hono } from "hono";
import { sopSchema, type SOP } from "../../../../packages/domain/src/sop.ts";
import type { Store } from "../db.ts";
import type { AgentService } from "../engine/service.ts";
import { AppError } from "../errors.ts";

const TERMINAL = new Set(["succeeded", "failed", "cancelled"]);

export function sopRoutes(
  db: Store,
  agent: AgentService,
  authz?: { pdp: { can: (...args: unknown[]) => Promise<"allow" | "deny"> }; fieldFilter: { filter: (...args: unknown[]) => Promise<unknown> } },
) {
  const app = new Hono<{ Variables: { owner: string } }>();
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/", async (c) => c.json(await db.list(c.get("owner"), "sops")));
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/:id", async (c) => {
    const s = await db.get<SOP>(c.get("owner"), "sops", c.req.param("id"));
    if (!s) throw new AppError("SOP not found", 404);
    return c.json(s);
  });
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/", async (c) => {
    const parsed = sopSchema.parse(await c.req.json());
    const sop = { ...parsed, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await db.put(c.get("owner"), "sops", sop);
    return c.json(sop, 201);
  });
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.put("/:id", async (c) => {
    const id = c.req.param("id");
    const ex = await db.get<SOP>(c.get("owner"), "sops", id);
    if (!ex) throw new AppError("SOP not found", 404);
    const patch = sopSchema.partial().omit({ id: true }).parse(await c.req.json());
    const up = { ...ex, ...patch, id, updatedAt: new Date().toISOString() };
    await db.put(c.get("owner"), "sops", up);
    return c.json(up);
  });
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.delete("/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const tasks = await db.list<{ id: string; status: string; state?: { sopId?: string } }>(owner, "tasks");
    const active = tasks.filter((t) => !TERMINAL.has(t.status) && t.state?.sopId === id);
    if (active.length > 0)
      throw new AppError(`Cannot delete SOP: ${active.length} active task(s) still reference it`, 409);
    await db.remove(owner, "sops", id);
    return c.json({ ok: true });
  });
  // Real "api" trigger: external callers start this SOP by POSTing here.
  // ?force=1 lets an operator start a SOP whose trigger is manual, cron or email_subject.
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/:id/run", async (c) => {
    const owner = c.get("owner");
    const sopId = c.req.param("id");
    const sop = await db.get<SOP>(owner, "sops", sopId);
    if (!sop) throw new AppError("SOP not found", 404);
    if (!sop.active) throw new AppError("SOP is inactive", 409);
    const forced = c.req.query("force") === "1";
    if (sop.trigger.type !== "api" && !forced)
      throw new AppError(
        `SOP trigger is "${sop.trigger.type}"; only "api" SOPs can be started from this endpoint. ` +
          `Append ?force=1 to start it anyway.`,
        409,
      );
    const body = ((await c.req.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
    const userInput =
      body.input && typeof body.input === "object" ? (body.input as Record<string, unknown>) : {};
    const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : undefined;
    const task = await agent.createTask(
      owner,
      {
        kind: "sop",
        title: sop.name,
        prompt: `API trigger for ${sop.name}`,
        // Records the SOP's real trigger so a forced run is not logged as an api trigger.
        input: { sopId: sop.id, ...userInput, trigger: { type: sop.trigger.type, forced } },
      },
      idempotencyKey ? `sop-api:${sop.id}:${idempotencyKey}` : undefined,
    );
    return c.json(task, 201);
  });
  return app;
}
```

## File: packages/domain/src/agent-persona.ts
```typescript
// AGENT_PERSONA_V1 - schema base de personas funcionales del sistema.
//
// Una AgentPersona NO es un prompt. Es la descripcion estatica de una
// persona funcional: quien es, como habla, que arquetipo tiene, que
// valores la guian, que stats tiene. El prompt se ensambla en runtime.
//
// Ver: docs/audits/09-kernel-cognitivo/09z-personas.md (a crear)

import { z } from "zod";

// ---------------------------------------------------------------------
// Arquetipos y estado
// ---------------------------------------------------------------------

export const agentArchetypeSchema = z.enum([
  "orchestrator",
  "hunter",
  "guardian",
  "strategist",
  "architect",
  "assistant",
]);

export const agentStatusSchema = z.enum([
  "online",
  "idle",
  "working",
  "standby",
  "offline",
]);

export const agentGenderSchema = z.enum([
  "female",
  "male",
  "non-binary",
  "unspecified",
]);

export const agentFormalitySchema = z.enum(["tu", "usted", "neutral"]);

// ---------------------------------------------------------------------
// Personalidad
// ---------------------------------------------------------------------

export const agentPersonalitySchema = z
  .object({
    traits: z.array(z.string().min(1).max(80)).max(20).default([]),
    tone: z.string().min(1).max(120),
    formality: agentFormalitySchema.default("tu"),
    quirks: z.array(z.string().min(1).max(300)).max(20).default([]),
  })
  .strict();

// ---------------------------------------------------------------------
// Capacidades
// ---------------------------------------------------------------------

export const agentCapabilitiesSchema = z
  .object({
    domains: z.array(z.string().min(1).max(80)).max(20).default(["all"]),
    scope: z.string().min(1).max(120),
    knowsEveryone: z.boolean().default(false),
    crossTenant: z.boolean().default(false),
  })
  .strict();

// ---------------------------------------------------------------------
// Valores (referencias al catalogo universal)
// ---------------------------------------------------------------------

export const agentValueRefSchema = z
  .object({
    id: z.string().min(1).max(80),
    weight: z.number().min(0).max(1),
  })
  .strict();

// ---------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------

export const agentAvatarSchema = z
  .object({
    kind: z.enum(["generated-portrait", "initials", "image", "sand", "lilac", "sky"]).default("initials"),
    seed: z.string().max(120).optional(),
    url: z.string().url().max(2000).optional(),
    style: z.string().max(120).optional(),
  })
  .strict();

// ---------------------------------------------------------------------
// Stats (gamificacion)
// ---------------------------------------------------------------------

export const agentStatsSchema = z
  .object({
    level: z.number().int().min(1).max(99).default(1),
    archetype: agentArchetypeSchema,
    totalTasks: z.number().int().nonnegative().default(0),
    precision: z.number().min(0).max(1).default(0),
    avgTimeMs: z.number().int().nonnegative().default(0),
    uptime: z.number().min(0).max(1).default(0),
    status: agentStatusSchema.default("idle"),
    currentTask: z.string().max(300).optional(),
  })
  .strict();

// ---------------------------------------------------------------------
// AgentPersona
// ---------------------------------------------------------------------

export const agentPersonaSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .max(80)
      .regex(/^[a-z][a-z0-9-]*$/, "id must be kebab-case lowercase"),
    displayName: z.string().min(1).max(80),
    role: z.string().min(1).max(200),
    age: z.number().int().min(18).max(99).optional(),
    gender: agentGenderSchema.optional(),
    personality: agentPersonalitySchema,
    capabilities: agentCapabilitiesSchema,
    values: z.array(agentValueRefSchema).max(20).default([]),
    reportsTo: z.string().min(1).max(80).optional(),
    peers: z.array(z.string().min(1).max(80)).max(50).default([]),
    avatar: agentAvatarSchema.optional(),
    language: z.string().min(2).max(10).default("es"),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

// ---------------------------------------------------------------------
// Tipos inferidos
// ---------------------------------------------------------------------

export type AgentArchetype = z.infer<typeof agentArchetypeSchema>;
export type AgentStatus = z.infer<typeof agentStatusSchema>;
export type AgentGender = z.infer<typeof agentGenderSchema>;
export type AgentFormality = z.infer<typeof agentFormalitySchema>;
export type AgentPersonality = z.infer<typeof agentPersonalitySchema>;
export type AgentCapabilities = z.infer<typeof agentCapabilitiesSchema>;
export type AgentValueRef = z.infer<typeof agentValueRefSchema>;
export type AgentAvatar = z.infer<typeof agentAvatarSchema>;
export type AgentStats = z.infer<typeof agentStatsSchema>;
export type AgentPersona = z.infer<typeof agentPersonaSchema>;
// ---------------------------------------------------------------------
// Metadatos de arquetipos (para UI)
// ---------------------------------------------------------------------

export const ARCHETYPE_META = {
  orchestrator: {
    name: "Orquestador",
    description: "Coordina y delega al squad",
    color: "#7C5CFC",
  },
  hunter: {
    name: "Cazador",
    description: "Busca oportunidades",
    color: "#5C9CFC",
  },
  guardian: {
    name: "Guardian",
    description: "Protege y resuelve problemas",
    color: "#5CFC8C",
  },
  strategist: {
    name: "Estratega",
    description: "Planifica a largo plazo",
    color: "#FCD45C",
  },
  architect: {
    name: "Arquitecto",
    description: "Construye sistemas",
    color: "#FC9C5C",
  },
  assistant: {
    name: "Asistente",
    description: "Asiste transversalmente",
    color: "#C45CFC",
  },
} as const satisfies Record<AgentArchetype, { name: string; description: string; color: string }>;
```

## File: apps/server/src/engine/orchestrator/orchestrator.ts
```typescript
// ORCHESTRATOR_REAL_DEPS_V2 - planner y replanner reales con fallback.
// ORCHESTRATOR_GUARDRAILS_V1 - cada paso pasa por GuardrailService.
// BUSINESS_OS_ORCHESTRATOR_V1 - ciclo completo Goal -> Verify -> Replan.

import type {
  ExecutionContext,
  Goal,
} from "../../../../../packages/domain/src/index.ts";

export interface GoalResult {
  status: "achieved" | "partial" | "blocked" | "failed";
  summary: string;
}

export interface OrchestratorDeps {
  guardrails?: { checkTaskCreation: (tenantId: string, current: number) => Promise<void> };
  // ORCHESTRATOR_LEARNING_WIRE_V1 - observador opcional.
  observer?: {
    observe(input: {
      tenantId: string;
      goal: Goal;
      plan: import("../../../../../packages/domain/src/plan.ts").Plan;
      outcome: import("../../../../../packages/domain/src/outcome.ts").Outcome;
    }): Promise<void>;
  };
  context: {
    assemble(
      owner: string,
      input: { roleId: string; entityId?: string; query: string; actorId?: string; sessionId?: string },
    ): Promise<Record<string, unknown>>;
  };
  capabilities: { list(filter?: { tag?: string }): Promise<Array<{ id: string; kind: string }>> };
  planner: { plan(input: { goal: Goal; context: Record<string, unknown>; capabilities: Array<{ id: string; kind: string }> }): Promise<import("../../../../../packages/domain/src/plan.ts").Plan> };
  executor: {
    execute(
      ctx: ExecutionContext,
      plan: import("../../../../../packages/domain/src/plan.ts").Plan,
    ): Promise<{ status: "succeeded" | "failed"; steps: Array<{ id: string; status: string }> }>;
  };
  verifier: {
    verify(goal: Goal, outcome: import("../../../../../packages/domain/src/outcome.ts").Outcome): Promise<import("../../../../../packages/domain/src/verification.ts").VerificationResult>;
  };
  replanner: {
    replan(input: {
      goal: Goal;
      previousPlan: import("../../../../../packages/domain/src/plan.ts").Plan;
      failedStepId: string;
      error: string;
    }): Promise<import("../../../../../packages/domain/src/plan.ts").Plan | null>;
  };
}

export class BusinessOSOrchestrator {
  constructor(private readonly deps?: OrchestratorDeps) {}

  async runGoal(
    ctx: ExecutionContext,
    goal: Goal,
  ): Promise<GoalResult> {
    // ORCHESTRATOR_REAL_V1 - ciclo completo si hay deps cableadas.
    if (!this.deps) {
      return {
        status: "blocked",
        summary: `Orquestador sin deps (goal ${goal.id})`,
      };
    }

    // ORCHESTRATOR_ACTOR_PROPAGATE_V1 - propaga actorId y sessionId si estan.
    const context = await this.deps.context.assemble(ctx.owner, {
      roleId: ctx.roleId ?? "default",
      query: goal.description || goal.title,
      ...(ctx.actorId ? { actorId: ctx.actorId } : {}),
      ...(ctx.sessionId ? { sessionId: ctx.sessionId } : {}),
    });

    const capabilities = await this.deps.capabilities.list();

    const plan = await this.deps.planner.plan({ goal, context, capabilities });

    // ORCHESTRATOR_GUARDRAILS_CALL_V1 - verifica cuota antes de ejecutar.
    if (this.deps.guardrails) {
      await this.deps.guardrails.checkTaskCreation(ctx.tenantId, 0);
    }
    const execution = await this.deps.executor.execute(ctx, plan);

    // Por ahora sintetizamos un Outcome simple desde la ejecuciÃ³n.
    const outcome: import("../../../../../packages/domain/src/outcome.ts").Outcome = {
      status: execution.status === "succeeded" ? "achieved" : "failed",
      summary: `Ejecutados ${execution.steps.length} pasos`,
      evidence: [],
      metrics: [],
      verified: false,
    };

    const verification = await this.deps.verifier.verify(goal, outcome);

    // ORCHESTRATOR_LEARNING_WIRE_V1 - observar el resultado.
    if (this.deps.observer) {
      await this.deps.observer
        .observe({ tenantId: ctx.tenantId, goal, plan, outcome })
        .catch(() => {});
    }

    if (verification.verified) {
      return { status: "achieved", summary: verification.reason };
    }

    // Replanificar
    const failed = execution.steps.find((s) => s.status === "failed");
    if (failed) {
      const nextPlan = await this.deps.replanner.replan({
        goal,
        previousPlan: plan,
        failedStepId: failed.id,
        error: "step failed",
      });
      if (nextPlan) {
        return {
          status: "partial",
          summary: `Replanificado a plan ${nextPlan.id}`,
        };
      }
    }

    return { status: "blocked", summary: verification.reason };
  }
}
```

## File: packages/domain/src/sop.ts
```typescript
import { z } from "zod";

export const sopStepSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  tool: z.enum(["read_mail_thread","read_workspace","import_pdf","inspect_pdf","fill_pdf","prepare_email","prepare_event","read_web","save_artifact","ask_user","computer_command","query_business","recall_memory","llm_generate","transition_entity"]).default("ask_user"),
  prompt: z.string().max(5000).default(""),
  params: z.record(z.string(), z.unknown()).default(() => ({ type: "manual" as const, value: "" })),
  when: z.string().max(500).optional(),
  required: z.boolean().default(true),
  /** STATE_MACHINE_STEP_V1 â€” id de la maquina en el kind "state-machines". Solo si tool = transition_entity. */
  stateMachine: z.string().min(1).max(100).optional(),
});

export const sopSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(160),
  description: z.string().max(4000).default(""),
  category: z.string().max(100).default("General"),
  trigger: z.object({ type: z.enum(["manual","api","cron","email_subject","email_body_match"]).default("manual"), value: z.string().max(500).default("") }).default(() => ({ type: "manual" as const, value: "" })),
  // SOP_STEPS_LIMIT_V1 - subido de 12 a 50. 12 era arbitrario y bloqueaba SOPs
  // reales con validacion + preparacion + ejecucion.
  steps: z.array(sopStepSchema).min(1).max(50).superRefine((steps, ctx) => {
    const ids = new Set<string>();
    steps.forEach((step, index) => {
      if (ids.has(step.id)) ctx.addIssue({ code: "custom", path: [index, "id"], message: `Duplicate SOP step id: ${step.id}` });
      ids.add(step.id);
    });
  }),
  // SOP_ALLOWED_TOOLS_V1 - enum cerrado. Antes era z.string() libre:
  // una tool inventada pasaba la validacion y reventaba en runtime.
  // El enum tiene que coincidir con sopStepSchema.tool.
  allowedTools: z
    .array(
      z.enum([
        "read_mail_thread",
        "read_workspace",
        "import_pdf",
        "inspect_pdf",
        "fill_pdf",
        "prepare_email",
        "prepare_event",
        "read_web",
        "save_artifact",
        "ask_user",
        "computer_command",
        "query_business",
        "recall_memory",
        "llm_generate",
        "transition_entity",
      ]),
    )
    .min(1),
  skillId: z.string().min(1).max(100).optional(),
  active: z.boolean().default(true),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type SOP = z.infer<typeof sopSchema>;
export type SOPStep = z.infer<typeof sopStepSchema>;
```

## File: apps/server/src/engine/agents/personas/routes.ts
```typescript
// PERSONAS_ROUTES_V1 - endpoints HTTP de personas.
//
//   GET /api/agent-personas             -> lista de personas del tenant
//   GET /api/agent-personas/:id         -> detalle con stats + activity
//   GET /api/agent-personas/:id/activity -> solo activity
//
// El owner viene del middleware de auth de app.ts (c.set("owner")).
// El tenant se resuelve con el TenantService.

import { Hono } from "hono";
import { AppError } from "../../../errors.ts";
import type { PersonaRegistry } from "./registry.ts";
import { resolveAllSkins, resolveSkin } from "./resolver.ts";
import { activityForPersona } from "./activity.ts";
import type { Store } from "../../../db.ts";
import type { TenantService } from "../../tenant.ts";

// PERSONA_ROUTES_KERNEL_V1 - kernel para leer turns/thoughts de la persona.
export interface PersonaRoutesDeps {
  registry: PersonaRegistry;
  db: Store;
  kernel?: import("../../../kernel/index.ts").Kernel;
  tenantService?: TenantService;
  authz?: { pdp: { can: (...args: unknown[]) => Promise<"allow" | "deny"> }; fieldFilter: { filter: (...args: unknown[]) => Promise<unknown> } };
}

export function personasRoutes(deps: PersonaRoutesDeps) {
  const app = new Hono<{ Variables: { owner: string } }>();

  const tenantIdFor = async (owner: string): Promise<string> => {
    if (!deps.tenantService) return "default";
    try {
      return await deps.tenantService.tenantIdFor(owner);
    } catch {
      return "default";
    }
  };

  // GET /api/agent-personas
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    const skins = resolveAllSkins(deps.registry, tenantId);
    return c.json({
      tenantId,
      total: skins.length,
      personas: skins.map((skin) => ({
        personaId: skin.personaId,
        displayName: skin.persona.displayName,
        role: skin.persona.role,
        // PERSONAS_ARCHETYPE_FIX_V1 - devuelve el arquetipo real (stats), no el tono.
        archetype: skin.stats.archetype,
        stats: skin.stats,
        avatar: skin.persona.avatar ?? null,
        reportsTo: skin.persona.reportsTo ?? null,
        peers: skin.persona.peers,
      })),
    });
  });

  // GET /api/agent-personas/:id
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/:id", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    const personaId = c.req.param("id");
    const skin = await resolveSkin(deps.registry, tenantId, personaId, {
      refreshStats: true,
      db: deps.db,
      owner,
    });
    if (!skin) {
      throw new AppError(`Persona not found: ${personaId}`, 404);
    }
    const activity = await activityForPersona(deps.db, owner, personaId, 20);
    return c.json({
      tenantId,
      persona: {
        id: skin.persona.id,
        displayName: skin.persona.displayName,
        role: skin.persona.role,
        age: skin.persona.age ?? null,
        gender: skin.persona.gender ?? null,
        personality: skin.persona.personality,
        capabilities: skin.persona.capabilities,
        values: skin.persona.values,
        peers: skin.persona.peers,
        reportsTo: skin.persona.reportsTo ?? null,
        avatar: skin.persona.avatar ?? null,
        language: skin.persona.language,
      },
      stats: skin.stats,
      state: skin.state,
      activity,
    });
  });

  // PERSONAS_ALL_NODES_V1 - informe agregado de todos los agentes del tenant.
  // Laia (supervisora) puede pedir turnos + thoughts + memory de los 12 de golpe.
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/all/nodes", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    if (!deps.kernel) {
      return c.json({ tenantId, total: 0, nodes: [], note: "kernel not wired" });
    }
    const { loadAgentNode } = await import("./node.ts");
    const skins = resolveAllSkins(deps.registry, tenantId);
    const nodes = [];
    for (const skin of skins) {
      if (skin.personaId === "laia") continue;
      try {
        const node = await loadAgentNode(deps.db, deps.kernel, tenantId, owner, skin, 50);
        nodes.push(node);
      } catch {
        nodes.push({ personaId: skin.personaId, tenantId, owner, turns: [], thoughts: [], memory: [] });
      }
    }
    return c.json({ tenantId, total: nodes.length, nodes });
  });

  // PERSONAS_REFRESH_STATS_LOG_V1
  // PERSONAS_STATS_REFRESH_BUTTON_V1 - recalcula stats de todas las personas.
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/refresh-stats", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    const skins = resolveAllSkins(deps.registry, tenantId);
    let refreshed = 0;
    const errors: string[] = [];
    for (const skin of skins) {
      try {
        await resolveSkin(deps.registry, tenantId, skin.personaId, {
          refreshStats: true,
          db: deps.db,
          owner,
        });
        refreshed += 1;
      } catch (err) {
        errors.push(`${skin.personaId}: ${err instanceof Error ? err.message : "unknown"}`);
      }
    }
    return c.json({ tenantId, refreshed, errors });
  });

  // PERSONAS_ATTENTION_V1 - atencion agregada de una persona.
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/:id/attention", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    const personaId = c.req.param("id");
    const skin = await resolveSkin(deps.registry, tenantId, personaId);
    if (!skin) throw new AppError(`Persona not found: ${personaId}`, 404);
    if (!deps.kernel) {
      return c.json({ personaId, tenantId, attention: null, note: "kernel not wired" });
    }
    const ctx: import("../../../kernel/context/kernel-context.ts").KernelContext = {
      tenantId,
      owner,
      role: "system",
      requestId: `attention:${personaId}:${Date.now()}`,
      personaId,
    };
    // PERSONAS_ATTENTION_ENDPOINT_WIRE_V1
    const attention = await deps.kernel.attentionOfPersona(ctx, personaId);
    return c.json({ personaId, tenantId, attention });
  });

  // PERSONAS_ATTENTION_PAIRS_ENDPOINT_V1
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/:a/attention-pairs/:b", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    const a = c.req.param("a");
    const b = c.req.param("b");
    if (!deps.kernel) return c.json({ a, b, pairs: null, note: "kernel not wired" });
    const ctx: import("../../../kernel/context/kernel-context.ts").KernelContext = {
      tenantId,
      owner,
      role: "system",
      requestId: `attention-pairs:${a}:${b}:${Date.now()}`,
    };
    const pairs = await deps.kernel.attentionPairs(ctx, a, b);
    return c.json({ a, b, pairs });
  });

  // PERSONA_ROUTES_NODE_V1 - turns + thoughts de la persona.
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/:id/node", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    const personaId = c.req.param("id");
    const skin = await resolveSkin(deps.registry, tenantId, personaId);
    if (!skin) throw new AppError(`Persona not found: ${personaId}`, 404);
    if (!deps.kernel) {
      return c.json({ personaId, tenantId, owner, turns: [], thoughts: [], memory: [], note: "kernel not wired" }); // NODE_FALLBACK_OWNER_V1
    }
    const { loadAgentNode } = await import("./node.ts");
    const node = await loadAgentNode(deps.db, deps.kernel, tenantId, owner, skin);
    return c.json(node);
  });

  // PERSONAS_ACTIVITY_LIMIT_V1
  // GET /api/agent-personas/:id/activity
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/:id/activity", async (c) => {
    const owner = c.get("owner");
    const personaId = c.req.param("id");
    const limitRaw = c.req.query("limit");
    const limit = limitRaw ? Number(limitRaw) : 20;
    if (!Number.isFinite(limit) || limit < 1 || limit > 200) {
      throw new AppError("limit must be between 1 and 200", 422);
    }
    const activity = await activityForPersona(deps.db, owner, personaId, limit);
    return c.json({ personaId, total: activity.length, activity });
  });

  return app;
}
```

## File: packages/domain/src/agent.ts
```typescript
import { z } from "zod";

export type TaskStatus =
  | "queued"
  | "running"
  | "waiting_approval"
  | "waiting_input"
  | "scheduled"
  | "paused"
  | "succeeded"
  | "failed"
  | "cancelled";
// TASK_TRANSITIONS_V1 - tabla explicita de transiciones permitidas.
// Guard: canTransitionTask(from, to).
export const ALLOWED_TASK_TRANSITIONS: Record<TaskStatus, ReadonlySet<TaskStatus>> = {
  queued: new Set(["running", "cancelled", "paused"]),
  running: new Set(["succeeded", "failed", "waiting_input", "waiting_approval", "paused", "cancelled"]),
  waiting_input: new Set(["queued", "cancelled"]),
  waiting_approval: new Set(["queued", "succeeded", "failed", "cancelled"]),
  scheduled: new Set(["running", "paused", "cancelled"]),
  paused: new Set(["queued", "cancelled"]),
  succeeded: new Set(),
  failed: new Set(["queued"]),
  cancelled: new Set(),
};

export function canTransitionTask(from: TaskStatus, to: TaskStatus): boolean {
  return ALLOWED_TASK_TRANSITIONS[from].has(to);
}

export interface Evidence {
  id: string;
  kind: "mail" | "file" | "web" | "user";
  title: string;
  excerpt: string;
  url?: string;
}
export interface TaskStep {
  id: string;
  title: string;
  status: "pending" | "running" | "succeeded" | "failed" | "waiting";
  detail?: string;
  // C1_TASKSTEP_DURATION_V1 - duracion en ms cuando esta disponible.
  durationMs?: number;
}
export interface AgentTask {
  id: string;
  title: string;
  prompt: string;
  kind: "agent" | "document" | "monitor" | "finance" | "plan" | "sop";
  status: TaskStatus;
  goalId?: string;
  plan: TaskStep[];
  evidence: Evidence[];
  input: Record<string, unknown>;
  state: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  nextRunAt?: string;
  leaseId?: string | null;
  leaseUntil?: string | null;
  attempts: number;
  actionId?: string | null;
  result?: string;
  error?: string | null;
  question?: string;
  artifactIds: string[];
  assignedTo?: string;
  // TASK_TENANT_REQUIRED_V1 - tenantId obligatorio. Backfill: 'default'.
  tenantId: string;
  threadId?: string;
  requestId?: string;
  parentTaskId?: string;
  lastCheckpointAt?: string;
  // OUTCOME_V1 - resultado estructurado. Reemplaza progresivamente a `result`.
  outcome?: import("./outcome.ts").Outcome;
  // GOAL_LINK_V1 - goal al que pertenece la tarea.
  // Nota: `goalId` ya existe arriba, este comentario es solo documental.
}
export interface RunEvent {
  id: string;
  taskId: string;
  date: string;
  kind: "plan" | "step" | "observation" | "approval" | "result" | "error" | "status";
  title: string;
  detail: string;
}
export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "active" | "paused" | "completed";
  milestones: { id: string; title: string; done: boolean }[];
  createdAt: string;
}
export interface Monitor {
  id: string;
  taskId: string;
  title: string;
  url: string;
  condition: "change" | "contains" | "price_below";
  value: string;
  intervalMinutes: number;
  status: "active" | "paused" | "stopped";
  nextCheckAt: string;
  lastCheckedAt?: string;
  lastValue?: string;
  lastHash?: string;
  error?: string;
  checks: number;
}
export interface Idea {
  id: string;
  title: string;
  reason: string;
  evidence: Evidence[];
  prompt: string;
  kind: AgentTask["kind"];
  input: Record<string, unknown>;
  status: "new" | "dismissed" | "accepted";
  taskId?: string;
  createdAt: string;
}
export type MemoryCategory =
  | "empresa"
  | "cliente"
  | "proceso"
  | "preferencia"
  | "rrhh"
  | "producto"
  | "otro"
  // AGENT_ROLE_V2 Ã¢â‚¬â€ categorias que usan las memorias de rol al seedear.
  | "rol-identidad"
  | "rol-dominio"
  | "rol-preferencias"
  | "rol-historial";

// FIX_12_4_MEMORY_CONTEXT_V1 - jerarquia de memoria: tenant, owner, rol, sesion.
export interface MemoryContext {
  tenantId?: string;
  owner?: string;
  roleId?: string;
  sessionId?: string;
}

export interface AgentMemory {
  id: string;
  text: string;
  source: string;
  category?: MemoryCategory;
  tags?: string[];
  createdAt: string;
  roleId?: string;
  // MEMORY_AUDIT_V1 - dedupe y aislamiento. Opcionales.
  dedupeKey?: string;
  tenantId?: string;
  // FIX_12_4_MEMORY_CONTEXT_V1 - jerarquia opcional.
  context?: MemoryContext;
  // FIX_12_4_MEMORY_CONTEXT_V1 - TTL suave: si existe, la memoria se considera obsoleta tras esta fecha.
  expiresAt?: string;
}
export interface AgentArtifact {
  id: string;
  taskId: string;
  kind: "plan" | "comparison" | "finance" | "report";
  title: string;
  summary: string;
  data: Record<string, unknown>;
  createdAt: string;
  // ARTIFACT_AUDIT_V1 - tenant, tamano efectivo y dedupe. Opcionales.
  tenantId?: string;
  sizeBytes?: number;
  dedupeKey?: string;
}
export interface AgentNotification {
  id: string;
  taskId?: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}
// AGENT_ROLE_V2 Ã¢â‚¬â€ un rol es un personaje del equipo: nombre, tono, avatar y
// memoria propia. Los 4 tipos de memoria son semanticamente distintos:
// identidad (el personaje, canon publico), dominio (su oficio), preferencias
// (como le gusta al dueno) e historial (lo aprendido currando).
export type AgentTone = "warm" | "concise" | "thoughtful";
export type AgentAvatar = "sky" | "sand" | "lilac";
export type AgentMemoryKind = "identidad" | "dominio" | "preferencias" | "historial";

export interface AgentRoleMemory {
  kind: AgentMemoryKind;
  text: string;
}

// AGENT_ROLE_V3 Ã¢â‚¬â€ ampliacion del rol con campos tecnicos opcionales.
// Un rol sin estos campos se comporta como hoy (todo permitido dentro de
// sus sops). Un rol con ellos es una allowlist adicional.
export interface AgentRolePermission {
  resource: string;
  actions: Array<"read" | "create" | "update" | "delete" | "execute" | "approve">;
}

export interface AgentRoleMemoryPolicy {
  read: boolean;
  write: boolean;
  categories: string[];
  maxRecall: number;
}

export interface AgentRole {
  id: string;
  /** Nombre del personaje: Alex, Leo, Sofia. La cara que ve el dueno. */
  name: string;
  /** Como habla: warm tutea y es cercano; concise va al grano; thoughtful explica el porque. */
  tone: AgentTone;
  avatar: AgentAvatar;
  /** Saludo de bienvenida cuando el dueno abre el chat con este rol. Opcional. */
  greeting?: string;
  /** Que le ahorra al dueno. Es el gancho de venta, va tambien en redes. */
  roi?: string;
  /** El personaje completo. Canon publico, sirve para app y para redes. */
  objetivo: string;
  sops: string[];
  active: boolean;
  /** Las 4 memorias vivas. Se materializan como AgentMemory al seedear. */
  memories: AgentRoleMemory[];
  /** AGENT_ROLE_V3 Ã¢â‚¬â€ allowlist adicional. Ausente = sin restriccion. */
  permissions?: AgentRolePermission[];
  /** AGENT_ROLE_V3 Ã¢â‚¬â€ politica de memoria. Ausente = defaults permisivos. */
  memoryPolicy?: AgentRoleMemoryPolicy;
  /** AGENT_ROLE_V3 Ã¢â‚¬â€ skills que puede usar este rol. */
  skills?: string[];
  /** AGENT_ROLE_V3 Ã¢â‚¬â€ tools permitidas. Ausente = las de sus sops. */
  allowedTools?: string[];
  createdAt?: string;
}

export interface AgentIdentity {
  name: string;
  tone: "warm" | "concise" | "thoughtful";
  avatar?: "sky" | "sand" | "lilac";
  showChatUpdates?: boolean;
}
export interface AgentWorkspace {
  tasks: AgentTask[];
  goals: Goal[];
  monitors: Monitor[];
  ideas: Idea[];
  memories: AgentMemory[];
  artifacts: AgentArtifact[];
  notifications: AgentNotification[];
  identity: AgentIdentity;
  worker: { running: boolean; lastTickAt?: string };
}
export const agentToneSchema = z.enum(["warm", "concise", "thoughtful"]);
export const agentAvatarSchema = z.enum(["sky", "sand", "lilac"]);
export const agentMemoryKindSchema = z.enum(["identidad", "dominio", "preferencias", "historial"]);
export const agentRoleMemorySchema = z.object({
  kind: agentMemoryKindSchema,
  text: z.string().trim().min(1).max(1000),
});
export const agentRoleSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().trim().min(1).max(120),
  // tone y avatar llevan default a proposito: los roles guardados antes de AGENT_ROLE_V2 no
  // tienen estos campos, y sin default un parse de esos registros reventaria en vez de rellenarlos.
  tone: agentToneSchema.default("warm"),
  avatar: agentAvatarSchema.default("sky"),
  greeting: z.string().max(2000).optional(),
  roi: z.string().max(500).optional(),
  objetivo: z.string().max(2000).default(""),
  sops: z.array(z.string().max(200)).max(50).default([]),
  active: z.boolean().default(true),
  memories: z.array(agentRoleMemorySchema).max(8).default([]),
  // AGENT_ROLE_V3 Ã¢â‚¬â€ campos tecnicos opcionales.
  permissions: z
    .array(
      z.object({
        resource: z.string().min(1).max(200),
        actions: z
          .array(z.enum(["read", "create", "update", "delete", "execute", "approve"]))
          .min(1)
          .max(20),
      }),
    )
    .max(100)
    .optional(),
  memoryPolicy: z
    .object({
      read: z.boolean().default(true),
      write: z.boolean().default(false),
      categories: z.array(z.string().max(100)).max(50).default([]),
      maxRecall: z.number().int().min(0).max(50).default(10),
    })
    .optional(),
  skills: z.array(z.string().max(200)).max(100).optional(),
  allowedTools: z.array(z.string().max(200)).max(100).optional(),
  createdAt: z.string().optional(),
});
export type AgentRoleInput = z.infer<typeof agentRoleSchema>;

/** Ficha publica del personaje: lo que lee el repo de redes. Sin SOPs ni preferencias. */
export interface AgentRolePublic {
  id: string;
  name: string;
  tone: AgentTone;
  avatar: AgentAvatar;
  objetivo: string;
  roi?: string;
  identidad: string;
}
export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  prompt: z.string().trim().min(1).max(12000),
  kind: z.enum(["agent", "document", "monitor", "finance", "plan", "sop"]).default("agent"),
  goalId: z.string().optional(),
  assignedTo: z.string().optional(),
  roleId: z.string().max(100).optional(),
  input: z.record(z.string(), z.unknown()).default(() => ({})),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export const monitorInputSchema = z
  .object({
    title: z.string().min(1).max(160),
    url: z.url().max(4096),
    condition: z.enum(["change", "contains", "price_below"]).default("change"),
    value: z.string().max(300).default(""),
    intervalMinutes: z.number().int().min(1).max(10080).default(15),
  })
  .superRefine((v, c) => {
    if (v.condition !== "change" && !v.value.trim())
      c.addIssue({ code: "custom", message: "Enter a condition value" });
    if (
      v.condition === "price_below" &&
      (!Number.isFinite(Number(v.value)) || Number(v.value) <= 0)
    )
      c.addIssue({ code: "custom", message: "Enter a positive price" });
  });
export const goalInputSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().max(4000).default(""),
  category: z.string().max(80).default("Personal"),
  milestones: z.array(z.string().min(1).max(200)).max(20).default([]),
});

export type ProjectStatus = "active" | "paused" | "completed" | "archived";

export interface ProjectBlock {
  id: string;
  type: "text" | "heading" | "checklist" | "timeline" | "note";
  text: string;
  checked?: boolean;
  date?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId?: string;
  description: string;
  status: ProjectStatus;
  tags: string[];
  blocks: ProjectBlock[];
  linkedMemoryIds: string[];
  linkedArtifactIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

## File: packages/domain/src/index.ts
```typescript
import { z } from "zod";

export type WorkspaceMode = "sample" | "live";
export type Section =
  | "today"
  | "chat"
  | "mail"
  | "calendar"
  | "browser"
  | "files"
  | "activity"
  | "connections"
  | "ideas"
  | "goals"
  | "apps";
export interface Mail {
  id: string;
  threadId: string;
  from: string;
  sender: string;
  to: string[];
  subject: string;
  body: string;
  date: string;
  unread: boolean;
  label: string;
  attachments: string[];
}
export interface CalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  timeZone: string;
  location: string;
  description: string;
  attendees: string[];
}
export interface Artifact {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  pageCount: number;
  url: string;
  createdAt: string;
  source: string;
  parentId?: string;
  fields?: { name: string; value: string; type: "text" | "checkbox" | "unsupported" }[];
}
export interface BrowserSession {
  id: string;
  title: string;
  url: string;
  status: "idle" | "active" | "closed" | "error";
  updatedAt: string;
  previewUrl?: string;
  consoleUrl?: string;
}
export const emailDraftSchema = z.object({
  to: z.array(z.email()).min(1).max(50),
  cc: z.array(z.email()).max(50).default([]),
  bcc: z.array(z.email()).max(50).default([]),
  subject: z
    .string()
    .trim()
    .min(1)
    .max(998)
    .refine((s) => !/[\r\n]/.test(s), "Subject must be a single line"),
  body: z.string().min(1).max(100000),
  attachmentIds: z.array(z.string()).max(10).default([]),
  threadId: z.string().optional(),
  replyToMessageId: z.string().optional(),
});
export const eventDraftSchema = z
  .object({
    calendarId: z.string().default("primary"),
    title: z.string().trim().min(1).max(500),
    start: z.string().min(1),
    end: z.string().min(1),
    allDay: z.boolean().default(false),
    timeZone: z.string().default("America/Los_Angeles"),
    location: z.string().max(2000).default(""),
    description: z.string().max(10000).default(""),
    attendees: z.array(z.email()).max(50).default([]),
  })
  .superRefine((value, ctx) => {
    if (
      !Number.isFinite(Date.parse(value.start)) ||
      !Number.isFinite(Date.parse(value.end)) ||
      Date.parse(value.end) <= Date.parse(value.start)
    ) {
      ctx.addIssue({ code: "custom", message: "End must be after a valid start", path: ["end"] });
    }
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
    const timed = /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/;
    if (
      !(value.allDay ? dateOnly : timed).test(value.start) ||
      !(value.allDay ? dateOnly : timed).test(value.end)
    ) {
      ctx.addIssue({
        code: "custom",
        message: value.allDay
          ? "All-day events need date-only values"
          : "Timed events need an explicit offset",
        path: ["start"],
      });
    }
    try {
      new Intl.DateTimeFormat("en", { timeZone: value.timeZone });
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid time zone", path: ["timeZone"] });
    }
  });
export const proposalSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("email.send"), data: emailDraftSchema }),
  z.object({ kind: z.literal("calendar.create"), data: eventDraftSchema }),
  z.object({
    kind: z.literal("calendar.update"),
    data: eventDraftSchema.and(z.object({ eventId: z.string().min(1) })),
  }),
  z.object({
    kind: z.literal("calendar.delete"),
    data: z.object({ calendarId: z.string(), eventId: z.string().min(1), title: z.string() }),
  }),
  z.object({
    kind: z.literal("drive.trash"),
    data: z.object({ fileId: z.string().min(1).max(500), name: z.string().min(1).max(400) }),
  }),
  z.object({
    kind: z.literal("drive.rename"),
    data: z.object({ fileId: z.string().min(1).max(500), name: z.string().min(1).max(400) }),
  }),
]);
export type EmailDraft = z.infer<typeof emailDraftSchema>;
export type EventDraft = z.infer<typeof eventDraftSchema>;
export type ProposalInput = z.infer<typeof proposalSchema>;
export interface ActionProposal {
  target?: CalendarEvent;
  targetVersion?: string;
  taskId?: string;
  account?: string;
  connectionId?: string;
  id: string;
  title: string;
  kind: ProposalInput["kind"];
  data: Record<string, unknown>;
  // C3_ACTION_SCHEDULED_V1 - estado intermedio para undo en servidor.
  status:
    | "awaiting_review"
    | "scheduled"
    | "executing"
    | "succeeded"
    | "failed"
    | "outcome_unknown"
    | "denied"
    | "cancelled"
    | "expired";
  signers?: string[];
  needed?: number;
  executeAt?: string | null;
  hash: string;
  createdAt: string;
  expiresAt: string;
  result?: string;
  error?: string;
  // ACTION_PROPOSAL_ATTEMPTS_SCHEMA_V1
  attempts?: number;
}
export interface ActivityEntry {
  id: string;
  title: string;
  detail: string;
  date: string;
  status: string;
  actionId?: string;
}
export interface Connection {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "sample" | "unconfigured" | "unavailable";
  account?: string;
  capabilities: string[];
}
export interface Workspace {
  mode: WorkspaceMode;
  profile: { name: string; email: string };
  mail: Mail[];
  events: CalendarEvent[];
  files: Artifact[];
  browsers: BrowserSession[];
  actions: ActionProposal[];
  activity: ActivityEntry[];
  connections: Connection[];
  runtime: {
    provider: "sample" | "model" | "openbot";
    configured: boolean;
    openbotConfigured: boolean;
    richThreads?: boolean;
  };
}

/** Provider-independent boundary: OpenBot/AG-UI runs never dictate presentation. */
export interface ExecutionBackend {
  readonly kind: "standalone" | "openbot";
  readonly capabilities: readonly string[];
  health(): Promise<{ available: boolean; detail: string }>;
}

export type { ComputerCommand, ComputerDirectory, ComputerSnapshot } from "./computer.ts";



export * from "./sop.ts";
export * from "./errors.ts";
// EXPORT_BUSINESS_V1
export * from "./business.ts";
// EXPORT_KERNEL_V1 - contrato del kernel para el engine.
export * from "./kernel.ts";
// EXPORT_BUSINESS_OS_V1 - contratos del Business OS.
export * from "./execution-context.ts";
export * from "./goal.ts";
export * from "./outcome.ts";
export * from "./capability.ts";
export * from "./plan.ts";
export * from "./runtime.ts";
export * from "./verification.ts";
export * from "./messaging.ts";
export * from "./policy-context.ts";
// EXPORT_BUSINESS_OS_V2 - contratos de segunda capa.
export * from "./truth.ts";
export * from "./entity-resolution.ts";
export * from "./business-schema.ts";
export * from "./reaction.ts";
export * from "./learning.ts";
export * from "./workspace-spec.ts";
export * from "./live.ts";
export * from "./views.ts";

// AGENT_PERSONA_V1 - personas funcionales del sistema.
export * from "./agent-persona.ts";
// DOMAIN_INDEX_POLICY_V1 - exporta policy.ts y classification.ts (F2).
export * from "./policy.ts";
export * from "./classification.ts";
// DOMAIN_INDEX_ACTOR_V1 - exporta actor.ts y jwt.ts (F1).
export * from "./actor.ts";
export * from "./jwt.ts";
```

## File: apps/server/src/engine/routes.ts
```typescript
import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import type {
  AgentIdentity,
  AgentMemory,
  AgentNotification,
} from "../../../../packages/domain/src/agent.ts";
// AGENT_ROLE_V2_ROUTE ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â el schema vive en el dominio para que ruta y tipo no divergan.
import { agentRoleSchema } from "../../../../packages/domain/src/agent.ts";
import { AppError } from "../errors.ts";
import type { AgentService } from "./service.ts";

const text = z.string().trim().min(1).max(4000);
// MEMORY_FULL_SCHEMA ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â la UI edita category y tags; el route debe aceptarlos.
const memoryCategories = z.enum(["empresa","cliente","proceso","preferencia","rrhh","producto","otro"]);
// A1_MEMORY_PATCH_V2 - category y tags aceptan null para borrar; text opcional para patch parcial.
const memorySchema = z.object({
  text: text.optional(),
  source: z.string().trim().min(1).max(200).optional(),
  category: memoryCategories.nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(60)).max(30).nullable().optional(),
});
const goalPatchSchema = z.object({
  status: z.enum(["active", "paused", "completed"]).optional(),
  milestones: z
    .array(
      z.object({
        id: z.string().min(1).max(200),
        title: z.string().trim().min(1).max(200),
        done: z.boolean(),
      }),
    )
    .max(100)
    .optional(),
});

/** Minimal RFC 4180-style CSV parser: quoted fields with "" escapes, commas, CR/LF. */
const parseCsv = (csv: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const source = csv.replace(/^\uFEFF/, "");
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\r") continue;
    else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
};

export function agentRoutes(
  service: AgentService,
  authz?: { pdp: { can: (...args: unknown[]) => Promise<"allow" | "deny"> }; fieldFilter: { filter: (...args: unknown[]) => Promise<unknown> } },
): Hono<{ Variables: { owner: string } }> {
  const app = new Hono<{ Variables: { owner: string } }>();
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/", async (c) => c.json(await service.snapshot(c.get("owner"))));
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/tasks", async (c) =>
    c.json(await service.createTask(c.get("owner"), await c.req.json()), 201),
  );
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/tasks/:id", async (c) =>
    c.json(await service.detail(c.get("owner"), c.req.param("id"))),
  );
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/tasks/:id/control", async (c) => {
    const { action } = z
      .object({ action: z.enum(["pause", "resume", "cancel", "retry"]) })
      .parse(await c.req.json());
    return c.json(await service.control(c.get("owner"), c.req.param("id"), action));
  });
  // C1_REASSIGN_V1 - reasignar tarea a otro rol o usuario.
  // RECONCILE_ENDPOINT_V1 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â reconciliar una acciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n en outcome_unknown.
  // El operador confirma si la acciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n externa se ejecutÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ o no.
  // Ver: docs/audits/03-resiliencia/roadmap.md ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§8.
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/actions/:id/reconcile", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const body = z
      .object({
        outcome: z.enum(["executed", "not_executed"]),
        note: z.string().max(2000).optional(),
      })
      .parse(await c.req.json());

    const action = await service.db.get<{
      id: string;
      status: string;
      taskId?: string;
    }>(owner, "actions", id);
    if (!action) throw new AppError("Action not found", 404);
    if (action.status !== "outcome_unknown") {
      throw new AppError(
        `Only outcome_unknown actions can be reconciled (current: ${action.status})`,
        409,
      );
    }

    const nextStatus = body.outcome === "executed" ? "succeeded" : "failed";
    const note = body.note?.slice(0, 2000) ?? "";
    const result =
      body.outcome === "executed"
        ? `Reconciled by operator: executed${note ? ` ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ${note}` : ""}`
        : `Reconciled by operator: not executed${note ? ` ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ${note}` : ""}`;

    const updated = await service.db.compareAndSwap(
      owner,
      "actions",
      id,
      { status: "outcome_unknown" },
      { status: nextStatus, result, error: null },
    );
    if (!updated) throw new AppError("Action changed; refresh and retry", 409);

    await service.db.put(owner, "activity", {
      id: `reconcile-${id}-${Date.now()}`,
      actionId: id,
      title: "Action reconciled",
      detail: result,
      date: new Date().toISOString(),
      status: nextStatus,
    });

    if (action.taskId) {
      const task = await service.db.get<{ status: string }>(owner, "tasks", action.taskId);
      if (task?.status === "waiting_approval") {
        await service.db.compareAndSwap(
          owner,
          "tasks",
          action.taskId,
          { status: "waiting_approval" },
          { status: nextStatus === "succeeded" ? "queued" : "failed" },
        );
      }
    }

    return c.json(updated);
  });

  // C3_CANCEL_V1 - cancelar una accion programada.
  // ACTIONS_CANCEL_VERIFY_V1 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â verificado como parte del bloque 06.
  // ACTIONS_RETRY_ENDPOINT_V1 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â reintento controlado.
  // Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
  // FORCE_CANCEL_EXECUTING_V1 - cancelar accion en executing pasa a outcome_unknown.
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/actions/:id/force-cancel", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const action = await service.db.get<{ id: string; status: string }>(owner, "actions", id);
    if (!action) throw new AppError("Action not found", 404);
    if (action.status !== "executing") {
      throw new AppError("Only executing actions can be force-cancelled", 409);
    }
    const updated = await service.db.compareAndSwap(
      owner,
      "actions",
      id,
      { status: "executing" },
      { status: "outcome_unknown", error: "Force-cancelled by user. Verify with provider." },
    );
    if (!updated) throw new AppError("Action changed", 409);
    return c.json(updated);
  });

  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/actions/:id/retry", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const action = await service.actions.retry(owner, id);
    return c.json(action);
  });

  // ACTIONS_AUDIT_ENDPOINT_V1 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â audit trail de una acciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n.
  // Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/actions/:id/audit", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const action = await service.db.get(owner, "actions", id);
    if (!action) throw new AppError("Action not found", 404);
    const entries = await service.db.list<{ actionId: string }>(owner, "action-audit", {
      limit: 200,
    });
    return c.json({
      actionId: id,
      audit: entries.filter((e) => e.actionId === id),
    });
  });
  // El endpoint cancela una acciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n scheduled si el usuario firmÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³.
  // Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/actions/:id/cancel", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const action = await service.db.get<{ id: string; status: string }>(owner, "actions", id);
    if (!action) throw new AppError("Action not found", 404);
    if (action.status !== "awaiting_review" && action.status !== "scheduled") {
      throw new AppError("Action cannot be cancelled", 409);
    }
    const cancelled = await service.db.compareAndSwap(
      owner,
      "actions",
      id,
      { status: action.status },
      { status: "cancelled" },
    );
    if (!cancelled) throw new AppError("Action cannot be cancelled", 409);
    return c.json({ ok: true });
  });
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/tasks/:id/reassign", async (c) => {
    const body = z
      .object({ roleId: z.string().max(200).optional() })
      .parse(await c.req.json());
    if (!body.roleId) throw new AppError("roleId required", 422);
    const updated = await service.db.compareAndSwap<{
      id: string;
      assignedTo?: string;
      state?: { roleId?: string };
    }>(
      c.get("owner"),
      "tasks",
      c.req.param("id"),
      {},
      { assignedTo: body.roleId, state: { roleId: body.roleId } },
    );
    if (!updated) throw new AppError("Task not found", 404);
    return c.json(updated);
  });
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/tasks/:id/escalate", async (c) => {
    const body = z
      .object({
        toUserId: z.string().min(1).max(200),
        reason: z.string().trim().min(1).max(2000),
      })
      .parse(await c.req.json());
    return c.json(
      await service.escalateTask(
        c.get("owner"),
        c.req.param("id"),
        body.toUserId,
        body.reason,
      ),
    );
  });
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/tasks/:id/input", async (c) => {
    const body = z
      .object({
        answer: z.string().trim().min(1).max(12000),
        fields: z
          .record(z.string().min(1).max(300), z.union([z.string().max(12000), z.boolean()]))
          .optional(),
      })
      .parse(await c.req.json());
    return c.json(
      await service.answer(c.get("owner"), c.req.param("id"), body.answer, body.fields),
    );
  });
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/goals", async (c) =>
    c.json(await service.createGoal(c.get("owner"), await c.req.json()), 201),
  );
  // GOAL_RUN_ENDPOINT_V1 - dispara el ciclo del orquestador.
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/goals/:id/run", async (c) => {
    const owner = c.get("owner");
    const goalId = c.req.param("id");
    const goal = await service.db.get<import("../../../../packages/domain/src/goal.ts").Goal>(owner, "goals", goalId);
    if (!goal) throw new AppError("Goal not found", 404);
    const tenantId = await service.tenantService?.tenantIdFor(owner) ?? owner;
    const result = await service.orchestrator.runGoal(
      { tenantId, owner, role: "user", requestId: "goal-run:" + goalId, goalId },
      goal,
    );
    return c.json(result);
  });
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/goals/:id", async (c) => {
    const body = goalPatchSchema.parse(await c.req.json());
    return c.json(await service.updateGoal(c.get("owner"), c.req.param("id"), body));
  });
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/monitors", async (c) =>
    c.json(await service.createMonitor(c.get("owner"), await c.req.json()), 201),
  );
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/monitors/:id/control", async (c) => {
    const { action } = z
      .object({ action: z.enum(["pause", "resume", "stop", "check"]) })
      .parse(await c.req.json());
    return c.json(await service.controlMonitor(c.get("owner"), c.req.param("id"), action));
  });
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/ideas/refresh", async (c) => c.json(await service.refreshIdeas(c.get("owner"))));
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/ideas/:id", async (c) => {
    const body = z
      .object({
        action: z.enum(["accept", "dismiss"]),
        prompt: z.string().trim().min(1).max(12000).optional(),
      })
      .parse(await c.req.json());
    return c.json(
      await service.decideIdea(c.get("owner"), c.req.param("id"), body.action, body.prompt),
    );
  });
  // A1_MEMORY_PATCH_V2 - crear memoria normaliza tags a lowercase.
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/memories", async (c) => {
    const body = memorySchema.parse(await c.req.json());
    if (body.text === undefined) throw new AppError("Text is required", 422);
    const memory: AgentMemory = {
      id: randomUUID(),
      text: body.text,
      source: body.source ?? "You",
      ...(body.category !== undefined && body.category !== null
        ? { category: body.category }
        : {}),
      ...(body.tags !== undefined && body.tags !== null
        ? { tags: [...new Set(body.tags.map((x) => x.toLowerCase()))] }
        : {}),
      createdAt: new Date().toISOString(),
    };
    return c.json(await service.db.put(c.get("owner"), "memories", memory), 201);
  });
  // A1_MEMORY_PATCH_V2 - solo compareAndSwap, patch parcial, null -> undefined para no mentir al tipo.
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/memories/:id", async (c) => {
    const body = memorySchema.parse(await c.req.json());
    const patch: Record<string, unknown> = {};
    if (body.text !== undefined) patch.text = body.text;
    if (body.source !== undefined) patch.source = body.source;
    if (body.category !== undefined) {
      if (body.category === null) delete patch.category;
      else patch.category = body.category;
    }
    if (body.tags !== undefined) {
      if (body.tags === null) delete patch.tags;
      else patch.tags = [...new Set(body.tags.map((x) => x.toLowerCase()))];
    }
    if (Object.keys(patch).length === 0) {
      throw new AppError("Empty memory patch", 422);
    }
    const memory = await service.db.compareAndSwap<AgentMemory>(
      c.get("owner"),
      "memories",
      c.req.param("id"),
      {},
      patch,
    );
    if (!memory) throw new AppError("Memory not found", 404);
    return c.json(memory);
  });
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/memories/:id/forget", async (c) => {
    if (!(await service.db.take(c.get("owner"), "memories", c.req.param("id"))))
      throw new AppError("Memory not found", 404);
    return c.json({ ok: true });
  });
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/roles", async (c) => c.json(await service.listAgents(c.get("owner"))));

  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/roles", async (c) => {
    // AGENT_ROLE_V2_ROUTE ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â se usa agentRoleSchema del dominio en vez de un z.object inline:
    // el inline solo aceptaba id/name/objetivo/sops/active, asi que un rol creado por aqui se
    // guardaba sin tone/avatar/memories mientras AgentRole los exige. Con el schema compartido,
    // la ruta y el tipo no pueden volver a divergir.
    const body = agentRoleSchema.parse(await c.req.json());
    const owner = c.get("owner");
    const existing = await service.db.get(owner, "agent-roles", body.id);
    if (existing) throw new AppError("Agent role ya existe", 409);
    await service.db.put(owner, "agent-roles", body);
    return c.json(body, 201);
  });

  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/identity", async (c) => {
    const body = z
      .object({
        name: z.string().trim().min(1).max(80),
        tone: z.enum(["warm", "concise", "thoughtful"]),
        avatar: z.enum(["sky", "sand", "lilac"]).optional(),
        showChatUpdates: z.boolean().optional(),
      })
      .parse(await c.req.json());
    const owner = c.get("owner");
    await service.ensure(owner);
    const identity = await service.db.compareAndSwap<AgentIdentity>(
      owner,
      "agent-settings",
      "identity",
      {},
      body,
    );
    if (!identity) throw new AppError("Agent identity changed; refresh and try again", 409);
    return c.json(identity);
  });
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/notifications", async (c) =>
    c.json((await service.snapshot(c.get("owner"))).notifications),
  );
  // NOTIF_ASSIGN_V1 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â crear una notificaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n dirigida a un usuario concreto.
  // Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md.
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/notifications/direct", async (c) => {
    const owner = c.get("owner");
    const body = z
      .object({
        userId: z.string().min(1).max(200),
        title: z.string().min(1).max(200),
        body: z.string().min(1).max(2000),
        taskId: z.string().max(200).optional(),
      })
      .parse(await c.req.json());
    const notification = {
      id: `notif-direct-${crypto.randomUUID()}`,
      taskId: body.taskId,
      title: body.title,
      body: body.body,
      createdAt: new Date().toISOString(),
      read: false,
      assignedTo: body.userId,
    };
    await service.db.put(owner, "notifications", notification);
    return c.json(notification, 201);
  });

  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/notifications/:id/read", async (c) => {
    // NOTIF_READ_CAS_V1 - solo si no estaba leida.
    const notification = await service.db.compareAndSwap<AgentNotification>(
      c.get("owner"),
      "notifications",
      c.req.param("id"),
      { read: false },
      { read: true },
    );
    if (!notification) throw new AppError("Notification not found", 404);
    return c.json(notification);
  });
  /**
   * Panel maestro de clientes: lista los directorios en `clientes/` con un resumen de
   * lo que provisionaria (SOPs, skills, memorias, usuarios). Solo lectura: los clientes
   * viven en el repo, no en la DB. No ejecuta provisioning ni toca la API.
   */
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/admin/clients", async (c) => {
    const { readdir, readFile, stat } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const root = join(process.cwd(), "clientes");
    let entries: string[] = [];
    try {
      const dirents = await readdir(root, { withFileTypes: true });
      entries = dirents.filter((d) => d.isDirectory() && !d.name.startsWith("_")).map((d) => d.name);
    } catch {
      return c.json({ clients: [] });
    }
    const clients = [];
    for (const name of entries) {
      const dir = join(root, name);
      const summary: Record<string, unknown> = { name };
      try {
        const config = JSON.parse(await readFile(join(dir, "config.json"), "utf8"));
        summary.displayName = config.name ?? name;
        summary.adminEmail = config.adminEmail ?? null;
      } catch {
        summary.configMissing = true;
      }
      for (const [folder, kind] of [
        ["sops", "sops"],
        ["skills", "skills"],
        ["docs", "docs"],
      ] as const) {
        try {
          const files = await readdir(join(dir, folder));
          summary[kind] = files.length;
        } catch {
          summary[kind] = 0;
        }
      }
      for (const file of ["memorias.json", "agentes.json", "users.json"]) {
        try {
          const value = JSON.parse(await readFile(join(dir, file), "utf8"));
          const key = file.replace(".json", "");
          summary[key] = Array.isArray(value) ? value.length : 0;
        } catch {
          summary[file.replace(".json", "")] = 0;
        }
      }
      try {
        const s = await stat(dir);
        summary.updatedAt = s.mtime.toISOString();
      } catch {}
      clients.push(summary);
    }
    return c.json({ clients });
  });
  // PUBLIC_ROLES_ENDPOINT ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â canon publico de los personajes para el repo de redes.
  // Solo expone id, name, tone, avatar, objetivo, roi e identidad. Nada interno.
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/roles/public", async (c) => c.json(await service.publicRoles(c.get("owner"))));
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/usage", async (c) => c.json(await service.usageSummary(c.get("owner"))));
  // TENANT_CACHE_ENDPOINT_V1 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â debug de la cache de TenantService.
  // Ver: docs/audits/07-aislamiento-multi-tenant/miniaudit.md.
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/tenant/cache-stats", async (c) => {
    const ts = service.tenantService as unknown as {
      cacheSize?: () => number;
      invalidateAll?: () => void;
    };
    return c.json({
      cacheSize: typeof ts?.cacheSize === "function" ? ts.cacheSize() : null,
      ttlMs: Number(process.env.TENANT_CACHE_TTL_MS ?? "300000"),
    });
  });

  // TENANT_CACHE_ENDPOINT_V1 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â invalidaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n explÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­cita.
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/tenant/cache-invalidate", async (c) => {
    const ts = service.tenantService as unknown as {
      invalidateAll?: () => void;
    };
    if (typeof ts?.invalidateAll === "function") ts.invalidateAll();
    return c.json({ ok: true });
  });
  // WORKER_STATUS_ENDPOINT_V1 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â estado del worker para operador.
  // Ver: docs/audits/05-motor-tareas-durable/roadmap.md ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§8.
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/worker-status", async (c) => {
    const worker = service.worker as unknown as {
      running: boolean;
      lastTickAt?: string;
      activeSize?: () => number;
      getMaxActive?: () => number;
    };
    const activeCount =
      typeof worker.activeSize === "function" ? worker.activeSize() : null;
    const maxActive =
      typeof worker.getMaxActive === "function"
        ? worker.getMaxActive()
        : Number(process.env.WORKER_MAX_ACTIVE ?? "50");
    return c.json({
      running: worker.running,
      lastTickAt: worker.lastTickAt,
      active: activeCount,
      maxActive,
      leaseMs: Number(process.env.WORKER_LEASE_MS ?? "60000"),
      maxPerOwner: Number(process.env.WORKER_MAX_PER_OWNER ?? "10"),
    });
  });
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/search", async (c) => {
    const q = z.string().min(2).max(200).parse(c.req.query("q"));
    const limit = Math.min(Number(c.req.query("limit") ?? "30") || 30, 100);
    return c.json(await service.globalSearch(c.get("owner"), q, limit));
  });
  // FEEDBACK_ROUTE_V1 - el usuario deja feedback sobre un outcome.
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/feedback", async (c) => {
    const owner = c.get("owner");
    const body = z.object({
      goalId: z.string().max(200).optional(),
      taskId: z.string().max(200).optional(),
      rating: z.enum(["useful", "not_useful", "neutral"]),
      comment: z.string().max(2000).optional(),
    }).parse(await c.req.json());
    const entry = {
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tenantId: owner,
      owner,
      ...body,
      createdAt: new Date().toISOString(),
    };
    await service.db.put(owner, "feedback", entry);
    return c.json(entry, 201);
  });

  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/sample-page", async (c) => {
    if (service.config.mode !== "sample") throw new AppError("Not found", 404);
    const body = z.object({ text: z.string().max(100000) }).parse(await c.req.json());
    await service.db.put(c.get("owner"), "sample-pages", { id: "availability", text: body.text });
    return c.json({ ok: true });
  });
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/sample-business-records", async (c) => {
    if (service.config.mode !== "sample") throw new AppError("Not found", 404);
    const rows = z.array(z.record(z.string(), z.unknown())).max(500).parse(await c.req.json());
    for (const row of rows) await service.db.put(c.get("owner"), "business-records", { id: String(row.id ?? randomUUID()), ...row });
    return c.json({ ok: true, count: rows.length });
  });
  // Owner-scoped business records, available in sample AND live modes.
  const businessRecordSchema = z.looseObject({
    id: z.string().trim().min(1).max(200),
  });
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/business-records", async (c) =>
    c.json(await service.db.list(c.get("owner"), "business-records")),
  );
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/business-records", async (c) => {
    const body = z
      .union([businessRecordSchema, z.array(businessRecordSchema).max(500)])
      .parse(await c.req.json());
    const rows = Array.isArray(body) ? body : [body];
    for (const row of rows)
      await service.db.put(c.get("owner"), "business-records", { ...row, id: row.id });
    return c.json({ ok: true, count: rows.length }, 201);
  });
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.delete("/business-records/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    if (!(await service.db.get(owner, "business-records", id)))
      throw new AppError("Business record not found", 404);
    await service.db.remove(owner, "business-records", id);
    return c.json({ ok: true });
  });
  // CSV import: the first row is the header; every record gets a fresh uuid id and the body kind.
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/business-records/import", async (c) => {
    const body = z
      .object({
        csv: z.string().min(1).max(4_000_000),
        kind: z.string().trim().min(1).max(100),
      })
      .parse(await c.req.json());
    const [header, ...data] = parseCsv(body.csv);
    const columns = header?.map((name) => name.trim()).filter((name) => name.length > 0) ?? [];
    if (!columns.length)
      throw new AppError("CSV must start with a header row of column names", 422);
    if (data.length > 1000) throw new AppError("CSV import accepts at most 1000 rows", 422);
    const owner = c.get("owner");
    let count = 0;
    for (const cells of data) {
      if (!cells.some((value) => value.trim() !== "")) continue;
      const values: Record<string, unknown> = {};
      columns.forEach((name, index) => {
        values[name] = cells[index] ?? "";
      });
      const record = { ...values, id: randomUUID(), kind: body.kind };
      await service.db.put(owner, "business-records", record);
      count++;
    }
    return c.json({ ok: true, count, kind: body.kind }, 201);
  });
  return app;
}
```

## File: apps/server/src/actions.ts
```typescript
// BUG05_ACTIONS_DEFERRED_V2 - integrar DeferredActions en decide().
// C3_ACTIONS_DEFERRED_V1 - integrar DeferredActions en decide() cuando este listo.
// EVENTBUS_ACTION_EMIT_V1
import { createHash, randomUUID } from "node:crypto";
import {
  type ActionProposal,
  type CalendarEvent,
  type ProposalInput,
  proposalSchema,
} from "../../../packages/domain/src/index.ts";
import type { Store } from "./db.ts";
import type { EventBus } from "./engine/events/index.ts";
import type { DeferredActions } from "./actions-deferred.ts";
import type { PolicyEngine } from "./engine/policy/engine.ts";
import type { AgentRole } from "../../../packages/domain/src/agent.ts";
import { AppError } from "./errors.ts";

interface Options {
  // TYPE_FIX_DEFERRED_V1 - campo deferred.
  deferred?: import("./actions-deferred.ts").DeferredActions;
  execute: (
    owner: string,
    input: ProposalInput,
    connectionId?: string,
    targetVersion?: string,
  ) => Promise<string>;
  prepare?: (
    owner: string,
    input: ProposalInput,
    connectionId?: string,
  ) => Promise<{
    input: ProposalInput;
    target?: CalendarEvent;
    targetVersion?: string;
  }>;
  connected: (owner: string) => Promise<boolean>;
  connection?: (owner: string) => Promise<{ id: string; account: string } | null>;
  now?: () => number;
}
// APPROVAL_REQUEST_PRIMITIVE_V1 - la propuesta actual es un ApprovalRequest
// informal. En la proxima fase se envuelve como primitiva formal con
// runtimeId + capabilityId + risk, sin cambiar la firma.
export class ActionService {
  private readonly now: () => number;
  private readonly bus?: EventBus;
  private readonly policy?: PolicyEngine;
  constructor(
    private readonly db: Store,
    private readonly options: Options,
    bus?: EventBus,
    policy?: PolicyEngine,
  ) {
    this.bus = bus;
    this.policy = policy;
    this.now = options.now ?? Date.now;
  }
  /**
   * ACTIONS_RETRY_V1 Ã¢â‚¬â€ reintenta una acciÃƒÂ³n que fallÃƒÂ³ con error determinista.
   * Solo permitido si el status es "failed" y el error no es outcome_unknown.
   * Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
   */
  // ACTION_EDIT_V1 - editar propuesta antes de aprobar. Cambia el hash.
  // ACTION_SERVICE_EDIT_HASH_V1
  async edit(
    owner: string,
    actionId: string,
    newData: Record<string, unknown>,
    expectedHash: string,
  ): Promise<ActionProposal> {
    // ACTION_SERVICE_EDIT_ENDPOINT_MARK_V1
    const action = await this.db.get<ActionProposal>(owner, "actions", actionId);
    if (!action) throw new AppError("Action not found", 404);
    if (action.status !== "awaiting_review") {
      throw new AppError("Only awaiting_review actions can be edited", 409);
    }
    if (action.hash !== expectedHash) {
      throw new AppError("Action changed. Reload and retry.", 409);
    }
    const nextHash = createHash("sha256")
      .update(JSON.stringify({ data: newData, connectionId: action.connectionId }))
      .digest("hex");
    const updated = await this.db.compareAndSwap<ActionProposal>(
      owner,
      "actions",
      actionId,
      { status: "awaiting_review", hash: action.hash },
      { data: newData as ActionProposal["data"], hash: nextHash },
    );
    if (!updated) throw new AppError("Action changed. Reload and retry.", 409);
    await this.audit(owner, updated, "edited", "Edited by user");
    return updated;
  }

  // ACTION_SERVICE_RETRY_GUARD_V1
  async retry(owner: string, actionId: string): Promise<ActionProposal> {
    const action = await this.db.get<ActionProposal>(owner, "actions", actionId);
    if (!action) throw new AppError("Action not found", 404);
    // RETRY_DENIED_V1 - permite reintentar failed y denied.
    if (action.status !== "failed" && action.status !== "denied") {
      throw new AppError(
        `Only failed or denied actions can be retried (current: ${action.status})`,
        409,
      );
    }
    if (action.error && /outcome_unknown|uncertain/i.test(action.error)) {
      throw new AppError(
        "Cannot retry an action with uncertain outcome. Reconcile it first.",
        409,
      );
    }
    // Reset a awaiting_review para que el usuario vuelva a aprobar.
    const reset = await this.db.compareAndSwap<ActionProposal>(
      owner,
      "actions",
      actionId,
      { status: action.status },
      { status: "awaiting_review", error: null, result: null },
    );
    if (!reset) throw new AppError("Action changed; refresh and retry", 409);
    await this.audit(owner, reset, "retried", "Retried by user");
    return reset;
  }

  async propose(
    owner: string,
    raw: unknown,
    idempotencyKey?: string,
    taskId?: string,
  ): Promise<ActionProposal> {
    const id =
      idempotencyKey === undefined
        ? randomUUID()
        : createHash("sha256").update(idempotencyKey).digest("hex");
    if (idempotencyKey !== undefined) {
      const existing = await this.db.get<ActionProposal>(owner, "actions", id);
      if (existing) return existing;
    }
    const parsed = proposalSchema.parse(raw);
    const connection = await this.options.connection?.(owner);
    if (this.options.connection && !connection)
      throw new AppError("Connect Google before preparing an action", 409);
    const prepared = await this.options.prepare?.(owner, parsed, connection?.id);
    const input = proposalSchema.parse(prepared?.input ?? parsed);
    const title =
      input.kind === "email.send"
        ? `Send Ã¢â‚¬Å“${input.data.subject}Ã¢â‚¬Â`
        : input.kind === "calendar.delete"
          ? `Delete ${input.data.title}`
          : input.kind === "drive.trash"
            ? `Move Ã¢â‚¬Å“${input.data.name}Ã¢â‚¬Â to trash`
            : input.kind === "drive.rename"
              ? `Rename file to Ã¢â‚¬Å“${input.data.name}Ã¢â‚¬Â`
              : `${input.kind === "calendar.create" ? "Create" : "Update"} ${input.data.title}`;
    const createdAt = new Date(this.now()).toISOString();
    const proposal: ActionProposal = {
      id,
      taskId,
      title,
      kind: input.kind,
      data: input.data,
      account: connection?.account,
      connectionId: connection?.id,
      target: prepared?.target,
      targetVersion: prepared?.targetVersion,
      status: "awaiting_review",
      hash: createHash("sha256")
        .update(
          JSON.stringify({
            input,
            connection,
            target: prepared?.target,
            targetVersion: prepared?.targetVersion,
          }),
        )
        .digest("hex"),
      createdAt,
      // ACTION_EXPIRES_V1 - configurable por env.
      expiresAt: new Date(
        this.now() + (Number(process.env.ACTION_EXPIRES_MS ?? "1800000") || 1800000),
      ).toISOString(),
    };
    const saved =
      idempotencyKey === undefined
        ? await this.db.put(owner, "actions", proposal)
        : await this.db.insertIfAbsent(owner, "actions", proposal);
    if (!saved) {
      const existing = await this.db.get<ActionProposal>(owner, "actions", id);
      if (!existing) throw new AppError("Prepared action could not be loaded", 409);
      return existing;
    }
    await this.record(owner, saved, "Ready for your review");
    await this.audit(owner, saved, "proposed", `Ready for review: ${saved.title}`);
    // ACTION_SERVICE_PROPOSE_EMIT_V1
    await this.bus?.emit(owner, "action.proposed", { kind: "action", id: saved.id }, {
      actionId: saved.id,
      title: saved.title.slice(0, 300),
      kind: saved.kind,
    });
    return saved;
  }
  // USER_ID_REAL_V1 - userId opcional para doble firma real.
  async decide(
    owner: string,
    id: string,
    hash: string,
    decision: "approve" | "deny",
    userId?: string,
  ): Promise<ActionProposal> {
    // ACTION_SERVICE_DECIDE_USER_ID_V1
    const proposal = await this.db.get<ActionProposal>(owner, "actions", id);
    if (!proposal) throw new AppError("Action not found", 404);
    if (proposal.hash !== hash)
      throw new AppError("This proposal changed. Open its latest review before deciding.", 409);
    if (proposal.status !== "awaiting_review") return proposal;
    if (decision === "approve" && proposal.taskId) {
      const task = await this.db.get<{ status: string }>(owner, "tasks", proposal.taskId);
      if (!task || !["running", "waiting_approval"].includes(task.status))
        throw new AppError(
          "Resume the task before approving this action. Cancelled tasks cannot execute.",
          409,
        );
    }
    if (Date.parse(proposal.expiresAt) <= this.now()) {
      const expired = await this.db.compareAndSwap<ActionProposal>(
        owner,
        "actions",
        id,
        { status: "awaiting_review", hash, expiresAt: proposal.expiresAt },
        { status: "expired" },
      );
      if (!expired) {
        const current = await this.db.get<ActionProposal>(owner, "actions", id);
        if (!current) throw new AppError("Action not found", 404);
        return current;
      }
      throw new AppError("This review expired. Create a fresh proposal.", 409);
    }
    if (decision === "approve" && !(await this.options.connected(owner)))
      throw new AppError("Google is disconnected. Reconnect before approving this action.", 409);
    if (decision === "approve" && this.options.connection) {
      const connection = await this.options.connection(owner);
      if (
        !connection ||
        connection.id !== proposal.connectionId ||
        connection.account !== proposal.account
      )
        throw new AppError(
          "Google account or connection changed. Prepare a new action for the connected account.",
          409,
        );
    }
    // POLICY_GATE_V1 Ã¢â‚¬â€ si la accion esta vinculada a una tarea con rol activo,
    // consultamos PolicyEngine antes de aprobar. Deny es siempre libre.
    if (decision === "approve" && this.policy && proposal.taskId) {
      const task = await this.db.get<{ state?: { roleId?: string } }>(owner, "tasks", proposal.taskId);
      const roleId = typeof task?.state?.roleId === "string" ? task.state.roleId : undefined;
      if (roleId) {
        const role = await this.db.get<AgentRole>(owner, "agent-roles", roleId).catch(() => null);
        if (role) {
          const verdict = await this.policy.can(owner, role, `action:${proposal.kind}`, "approve");
          if (!verdict.allowed) throw new AppError(verdict.reason ?? "Action denied by policy", 403);
        }
      }
    }
    const claimed = await this.db.claim<ActionProposal>(
      owner,
      id,
      decision === "deny" ? "denied" : "executing",
      new Date(this.now()).toISOString(),
    );
    if (!claimed) {
      const current = await this.db.get<ActionProposal>(owner, "actions", id);
      if (!current) throw new AppError("Action not found", 404);
      return current;
    }
    await this.record(
      owner,
      claimed,
      decision === "deny" ? "Declined; no changes made" : "Approved; execution started",
    );
    await this.audit(
      owner,
      claimed,
      decision,
      decision === "deny" ? "Declined by user" : "Approved by user",
    );
    if (decision === "deny") {
      await this.bus?.emit(owner, "action.denied", { kind: "action", id: claimed.id }, {
        actionId: claimed.id,
        title: claimed.title.slice(0, 300),
      });
      return claimed;
    }
    await this.bus?.emit(owner, "action.approved", { kind: "action", id: claimed.id }, {
      actionId: claimed.id,
      title: claimed.title.slice(0, 300),
    });
    // ACTIONS_DEFERRED_WIRE_V1 Ã¢â‚¬â€ si hay deferred, aprobar no ejecuta ya.
    // Se programa para dentro de `windowMs` y el usuario puede deshacer.
    // Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
    if (this.options.deferred && decision === "approve") {
      const deferredRecord = await this.options.deferred.decide(
        owner,
        claimed.id,
        userId ?? owner,
        typeof claimed.data === "object" && claimed.data !== null && "amount" in claimed.data
          ? Number((claimed.data as { amount?: unknown }).amount) || undefined
          : undefined,
      );
      if (deferredRecord.status === "scheduled") {
        // Guardamos el estado scheduled en la ActionProposal.
        await this.db.put(owner, "actions", {
          ...claimed,
          status: "scheduled",
          signers: deferredRecord.signers,
          needed: deferredRecord.needed,
          executeAt: deferredRecord.executeAt
            ? new Date(deferredRecord.executeAt).toISOString()
            : null,
        });
        return (await this.db.get<ActionProposal>(owner, "actions", claimed.id)) ?? claimed;
      }
      // Si aÃƒÂºn no se alcanzÃƒÂ³ el nÃƒÂºmero de firmas, la propuesta vuelve a
      // awaiting_review con los signers acumulados.
      if (deferredRecord.status === "collecting") {
        await this.db.put(owner, "actions", {
          ...claimed,
          status: "awaiting_review",
          signers: deferredRecord.signers,
          needed: deferredRecord.needed,
          executeAt: null,
        });
        return (await this.db.get<ActionProposal>(owner, "actions", claimed.id)) ?? claimed;
      }
    }
    let finished: ActionProposal;
    try {
      const input = proposalSchema.parse({ kind: claimed.kind, data: claimed.data });
      const result = await this.options.execute(
        owner,
        input,
        claimed.connectionId,
        claimed.targetVersion,
      );
      finished = { ...claimed, status: "succeeded", result };
    } catch (error) {
      const unknown =
        error instanceof Error &&
        (("outcomeUnknown" in error && error.outcomeUnknown === true) ||
          ("code" in error && error.code === "outcome_unknown"));
      // ERROR_KIND_V1 - distingue negocio de infra.
      const message = error instanceof Error ? error.message : "Execution failed";
      const status = (error as { status?: number })?.status;
      const errorKind = unknown
        ? "outcome_unknown"
        : typeof status === "number" && status >= 400 && status < 500
          ? "business"
          : "infra";
      finished = {
        ...claimed,
        status: unknown ? "outcome_unknown" : "failed",
        error: message,
        ...(errorKind !== "outcome_unknown" ? { errorKind } : {}),
      } as ActionProposal;
    }
    await this.db.put(owner, "actions", finished);
    // APPROVAL_SYNC_V2 - reflejar el estado final en approval-requests.
    const finalStatus =
      finished.status === "succeeded"
        ? "approved"
        : finished.status === "failed" || finished.status === "outcome_unknown"
          ? "rejected"
          : "pending";
    void this.db
      .put(owner, "approval-requests", {
        ...((await this.db.get<Record<string, unknown>>(owner, "approval-requests", finished.id)) ?? {}),
        id: finished.id,
        tenantId: owner,
        owner,
        status: finalStatus,
        decidedAt: new Date().toISOString(),
        decidedBy: owner,
        result: finished.result ?? finished.error ?? null,
      })
      .catch(() => {});
    const finishedTitle = finished.title.slice(0, 300);
    if (finished.status === "succeeded")
      await this.bus?.emit(owner, "action.executed", { kind: "action", id: finished.id }, {
        actionId: finished.id,
        title: finishedTitle,
        ...(finished.result ? { result: finished.result.slice(0, 2000) } : {}),
      });
    else if (finished.status === "outcome_unknown")
      await this.bus?.emit(owner, "action.outcome_unknown", { kind: "action", id: finished.id }, {
        actionId: finished.id,
        title: finishedTitle,
        ...(finished.error ? { error: finished.error.slice(0, 2000) } : {}),
      });
    else
      await this.bus?.emit(owner, "action.failed", { kind: "action", id: finished.id }, {
        actionId: finished.id,
        title: finishedTitle,
        ...(finished.error ? { error: finished.error.slice(0, 2000) } : {}),
      });
    await this.record(owner, finished, finished.result ?? finished.error ?? finished.status);
    return finished;
  }
  /**
   * ACTIONS_AUDIT_V1 Ã¢â‚¬â€ registra una entrada de auditorÃƒÂ­a estructurada
   * por cada transiciÃƒÂ³n de estado de la propuesta.
   * Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
   */
  private async audit(owner: string, action: ActionProposal, kind: string, detail: string) {
    await this.db.put(owner, "action-audit", {
      id: `audit-${action.id}-${Date.now()}`,
      actionId: action.id,
      taskId: action.taskId ?? null,
      kind,
      detail: detail.slice(0, 2000),
      status: action.status,
      hash: action.hash,
      createdAt: new Date().toISOString(),
    });
  }

  private async record(owner: string, action: ActionProposal, detail: string) {
    await this.db.put(owner, "activity", {
      id: randomUUID(),
      actionId: action.id,
      title: action.title,
      detail,
      date: new Date(this.now()).toISOString(),
      status: action.status,
    });
  }
}
```

## File: apps/server/src/engine/events/bus.ts
```typescript
import { createHash } from "node:crypto";
import type { Store } from "../../db.ts";
import type { TenantScopedStore } from "../../db-tenant.ts";
import { backgroundFailure } from "../../log.ts";
import { payloadSchemas } from "./schemas.ts";
// EVENTBUS_SCHEMA_REGISTRY_V1 - registry consultable.
import { SchemaRegistry } from "./schema-registry.ts";
export const globalSchemaRegistry = new SchemaRegistry();
for (const [t, s] of Object.entries(payloadSchemas)) {
  try { globalSchemaRegistry.register({ type: t as SystemEventType, version: "1.0", schema: s }); } catch { /* ya registrado */ }
}
import { StoreQuery, StoreSink } from "./sinks/store.ts";
import type {
  EventAggregate,
  EventFilter,
  EventQuery,
  EventSink,
  SystemEvent,
  SystemEventSource,
  SystemEventType,
} from "./types.ts";
import { ulid } from "./ulid.ts";
import { globalSubscribers } from "./subscriber.ts";

const KIND = "system-events";
const DEDUPE_KIND = "dedupe-state";
// EVENTBUS_DEDUPE_TTL_V1 - TTL configurable.
const DEDUPE_TTL_MS = Number(process.env.EVENTBUS_DEDUPE_TTL_MS ?? "60000") || 60_000;
// EVENTBUS_DEDUPE_LRU_V1 - LRU configurable.
const DEDUPE_MAX_ENTRIES = Number(process.env.EVENTBUS_DEDUPE_LRU ?? "64") || 64;

export interface EmitOptions {
  correlationId?: string;
  causationId?: string;
  /**
   * EVENTBUS_DEDUPE_KEY_V1 - clave de deduplicacion explicita.
   *
   * Si se pasa, el bus deduplica: dos emisiones con la misma clave en la
   * ventana de 60s solo escriben la primera. Los emisores de RUIDO
   * (reintentos, estados que cambian repetidamente) la pasan.
   *
   * Si NO se pasa, el bus NO deduplica. Los emisores FACTUALES
   * (entity.updated, entity.created, relation.created) no la pasan,
   * porque cada emision es un hecho nuevo y no debe descartarse.
   *
   * Antes de esto, el bus deduplicaba siempre con
   * `${owner}:${type}:${source.kind}:${source.id}`. Eso descartaba el
   * segundo entity.updated del mismo cliente en 60s, corrompiendo el
   * event log factual.
   */
  dedupeKey?: string;
  /** MULTI_TENANT_V1 - tenantId. Si no se pasa, se usa owner. */
  tenantId?: string;
  notify?: { title: string; body: string; key: string };
}

interface DedupeState {
  id: string;
  seen: { key: string; at: number }[];
}

export class EventBus {
  private readonly inMemory = new Map<string, number>();
  constructor(
    private readonly db: Store | TenantScopedStore,
    private readonly sink: EventSink = new StoreSink(db),
    private readonly query: EventQuery = new StoreQuery(db),
  ) {}

  async emit<T extends Record<string, unknown>>(
    owner: string,
    type: SystemEventType,
    source: SystemEventSource,
    payload: T,
    options: EmitOptions = {},
  ): Promise<void> {
    try {
      // EVENTS_BUS_EMIT_VALIDATES_TENANT_V1
      // EVENTBUS_METRIC_ERRORS_V1
      const schema = payloadSchemas[type];
      const parsed = schema.parse(payload) as T;
      // EVENTBUS_DEDUPE_KEY_V1 - solo deduplicamos si el emisor lo pide.
      // Sin dedupeKey explicita, cada emision es un hecho nuevo.
      // EVENTBUS_DEDUPE_OWNER_FIX_V1 - antes pasabamos `${owner}:${dedupeKey}`
      // como owner a isDuplicate, lo cual creaba una fila por cada dedupeKey
      // distinta y rompia el LRU compartido entre procesos. Ahora pasamos
      // el owner real y la key por separado.
      if (options.dedupeKey !== undefined) {
        // EVENTBUS_DEDUPE_METRIC_V1
        if (await this.isDuplicate(owner, options.dedupeKey)) return;
      }
      // EVENTBUS_CTX_FALLBACK_V1 - hereda correlationId/causationId si no vienen.
      const logCtx = (await import("../../log.ts")).logContext.getStore();
      const finalCorrelationId = options.correlationId ?? logCtx?.correlationId;
      const finalCausationId = options.causationId;
      const event: SystemEvent<T> = {
        id: ulid(),
        schemaVersion: "1.0",
        // EVENTS_BUS_TENANT_SCOPED_FALLBACK_V1
        tenantId: options.tenantId ?? owner,
        owner,
        type,
        emittedAt: new Date().toISOString(),
        source,
        ...(finalCorrelationId ? { correlationId: finalCorrelationId } : {}),
        ...(finalCausationId ? { causationId: finalCausationId } : {}),
        payload: parsed,
      };
      await this.sink.write(event);
      // EVENTS_BUS_PUBLISH_V1 Ã¢â‚¬â€ publicar a subscribers en vivo (SSE, mÃƒÂ©tricas).
      // Ver: docs/audits/08-bus-de-eventos/miniaudit.md ("Sin SSE").
      // EVENTBUS_PUBLISH_SUBSCRIBERS_V1
      globalSubscribers.publish(event);
      // EVENTBUS_DEDUPE_KEY_V1 - solo registramos la clave si se paso explicitamente.
      if (options.dedupeKey !== undefined) {
        // EVENTBUS_DEDUPE_OWNER_FIX_V1 - mismo fix: owner real, key separada.
        await this.recordDedupe(owner, options.dedupeKey);
      }
      if (options.notify) {
        // BUS_NOTIFY_PREFS_V1 - antes el bus escribia siempre en
        // notifications, ignorando las preferencias del usuario en
        // notification-prefs. Ahora consultamos prefs y, si el tipo esta
        // deshabilitado, no escribimos la notificacion. El evento sigue
        // emitiendose al bus por si otros consumidores lo quieren.
        const prefs = await this.db
          .get<{ disabled: string[] }>(owner, "notification-prefs", "default")
          .catch(() => null);
        // EVENTBUS_NOTIFY_PREF_FILTER_V1
        const disabled = prefs?.disabled ?? [];
        if (!disabled.includes(type)) {
          await this.db.insertIfAbsent(owner, "notifications", {
            id: createHash("sha256").update(options.notify.key).digest("hex"),
            taskId: source.kind === "task" ? source.id : undefined,
            title: options.notify.title.slice(0, 200),
            body: options.notify.body.slice(0, 2000),
            createdAt: event.emittedAt,
            read: false,
          });
        }
      }
    } catch (error) {
      // EVENTBUS_ERROR_METRIC_V1 - contador de errores.
      import("../../metrics/registry.ts")
        .then(({ globalMetrics }) => { globalMetrics.inc("event_bus_errors_total", { type }); })
        .catch(() => {});
      backgroundFailure(`event emit ${type}`, error);
    }
  }

  async list(owner: string, filter: EventFilter = {}): Promise<SystemEvent[]> {
    return this.query.recent(owner, filter);
  }

  async aggregate(owner: string, hours = 24): Promise<EventAggregate[]> {
    return this.query.aggregate(owner, hours);
  }

  async purge(days = 90): Promise<number> {
    return this.db.purgeOlderThan(KIND, days);
  }

  // EVENTBUS_DEDUPE_CACHE_V1 - cache negativa en memoria, TTL corto.
  private readonly negativeCache = new Map<string, number>();

  private async isDuplicate(owner: string, key: string): Promise<boolean> {
    const now = Date.now();
    const negKey = `${owner}:${key}`;
    const negAt = this.negativeCache.get(negKey);
    if (negAt && now - negAt < 5000) return false;
    // DEDUPE_DB_FIRST Ã¢â‚¬â€ consultamos la DB ANTES que el Map en memoria para que
    // multiples procesos compartan el dedupe. El Map es solo cache de lectura.
    const state = await this.db.get<DedupeState>(owner, DEDUPE_KIND, "lru");
    if (state) {
      const hit = state.seen.find((entry) => entry.key === key && now - entry.at < DEDUPE_TTL_MS);
      if (hit) {
        this.inMemory.set(key, now);
        return true;
      }
    }
    const cached = this.inMemory.get(key);
    return Boolean(cached && now - cached < DEDUPE_TTL_MS);
  }

  private async recordDedupe(owner: string, key: string): Promise<void> {
    const now = Date.now();
    this.inMemory.set(key, now);
    if (this.inMemory.size > DEDUPE_MAX_ENTRIES) {
      const oldest = [...this.inMemory.entries()].sort((a, b) => a[1] - b[1])[0];
      if (oldest) this.inMemory.delete(oldest[0]);
    }
    // EVENTBUS_DEDUPE_CAS_FIX_V1 - antes leiamos + modificabamos + escribiamos
    // sin CAS. Dos emisiones concurrentes con la misma key se pisaban. Ahora
    // reintentamos con CAS sobre el `seen` actual hasta 3 veces.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const state = await this.db.get<DedupeState>(owner, DEDUPE_KIND, "lru");
      const seen = state?.seen ?? [];
      const filtered = seen.filter((entry) => now - entry.at < DEDUPE_TTL_MS);
      if (filtered.some((entry) => entry.key === key)) return;
      filtered.push({ key, at: now });
      const trimmed = filtered.slice(-DEDUPE_MAX_ENTRIES);
      if (!state) {
        const inserted = await this.db.insertIfAbsent(owner, DEDUPE_KIND, {
          id: "lru",
          seen: trimmed,
        } as { id: string } & Record<string, unknown>);
        if (inserted) return;
        continue;
      }
      const updated = await this.db.compareAndSwap<DedupeState>(
        owner,
        DEDUPE_KIND,
        "lru",
        { id: "lru", seen: state.seen },
        { seen: trimmed },
      );
      if (updated) return;
    }
    backgroundFailure(
      `eventbus dedupe ${owner}/${key}`,
      new Error("No se pudo registrar la clave de deduplicacion tras 3 intentos"),
    );
  }
}
```
