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
- Only files matching these patterns are included: packages/domain/src/capability.ts, packages/domain/src/sop.ts, packages/domain/src/agent.ts, apps/server/src/engine/capabilities/registry.ts, apps/server/src/engine/capabilities/bootstrap.ts
- Files matching these patterns are excluded: **/node_modules/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      engine/
        capabilities/
          bootstrap.ts
          registry.ts
packages/
  domain/
    src/
      agent.ts
      capability.ts
      sop.ts
```

# Files

## File: apps/server/src/engine/capabilities/registry.ts
```typescript
// CAPABILITY_REGISTRY_V1 - registro de capacidades del sistema.

import type { CapabilityContract } from "../../../../../packages/domain/src/capability.ts";

export interface CapabilityProvider {
  list(tenantId: string): Promise<CapabilityContract[]>;
  get(tenantId: string, id: string): Promise<CapabilityContract | undefined>;
}

export class CapabilityRegistry {
  private readonly capabilities = new Map<string, CapabilityContract>();

  register(capability: CapabilityContract): void {
    this.capabilities.set(capability.id, capability);
  }

  async get(id: string): Promise<CapabilityContract | undefined> {
    return this.capabilities.get(id);
  }

  async list(filter?: { kind?: string; tag?: string; risk?: string }): Promise<CapabilityContract[]> {
    let all = [...this.capabilities.values()];
    if (filter?.kind) all = all.filter((c) => c.kind === filter.kind);
    if (filter?.tag) all = all.filter((c) => c.tags.includes(filter.tag!));
    if (filter?.risk) all = all.filter((c) => c.risk === filter.risk);
    return all;
  }
}
```

## File: packages/domain/src/capability.ts
```typescript
// CAPABILITY_V1 - capacidad ejecutable del sistema (tool, skill, SOP).

import { z } from "zod";

export const capabilityRiskSchema = z.enum(["low", "medium", "high", "critical"]);

export const capabilitySideEffectSchema = z.object({
  kind: z.enum(["read", "write", "external_write", "notification"]),
  target: z.string().min(1).max(200),
  reversible: z.boolean(),
  description: z.string().max(500).optional(),
});

export const capabilityCostSchema = z.object({
  timeMs: z.number().int().nonnegative().optional(),
  tokens: z.number().int().nonnegative().optional(),
  currencyEur: z.number().nonnegative().optional(),
});

export const capabilityContractSchema = z.object({
  id: z.string().min(1).max(200),
  version: z.string().min(1).max(50).default("1.0.0"),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).default(""),
  kind: z.enum(["tool", "skill", "sop", "composite"]),
  inputs: z.record(z.string(), z.unknown()).default({}),
  outputs: z.record(z.string(), z.unknown()).default({}),
  preconditions: z.array(z.string().max(500)).max(50).default([]),
  sideEffects: z.array(capabilitySideEffectSchema).max(50).default([]),
  permissions: z.array(z.string().max(200)).max(50).default([]),
  risk: capabilityRiskSchema.default("low"),
  cost: capabilityCostSchema.default({}),
  idempotency: z.enum(["idempotent", "at-most-once", "at-least-once"]).default("idempotent"),
  retryable: z.boolean().default(false),
  compensatable: z.boolean().default(false),
  compensationId: z.string().max(200).optional(),
  requiresApproval: z.boolean().default(false),
  tags: z.array(z.string().max(100)).max(50).default([]),
});

export type CapabilityRisk = z.infer<typeof capabilityRiskSchema>;
export type CapabilitySideEffect = z.infer<typeof capabilitySideEffectSchema>;
export type CapabilityCost = z.infer<typeof capabilityCostSchema>;
export type CapabilityContract = z.infer<typeof capabilityContractSchema>;
```

## File: apps/server/src/engine/capabilities/bootstrap.ts
```typescript
// CAPABILITIES_BOOTSTRAP_V1 - registra las capabilities del sistema al arrancar.

import { CapabilityRegistry } from "./registry.ts";

export function bootstrapCapabilities(registry: CapabilityRegistry): void {
  // Tools de SOP
  const tools: Array<{ id: string; risk: string; sideEffects: Array<{ kind: string; target: string; reversible: boolean }>; requiresApproval: boolean }> = [
    { id: "read_mail_thread", risk: "low", sideEffects: [{ kind: "read", target: "email", reversible: true }], requiresApproval: false },
    { id: "read_workspace", risk: "low", sideEffects: [{ kind: "read", target: "workspace", reversible: true }], requiresApproval: false },
    { id: "import_pdf", risk: "low", sideEffects: [{ kind: "read", target: "files", reversible: true }], requiresApproval: false },
    { id: "inspect_pdf", risk: "low", sideEffects: [{ kind: "read", target: "files", reversible: true }], requiresApproval: false },
    { id: "fill_pdf", risk: "low", sideEffects: [{ kind: "write", target: "files", reversible: true }], requiresApproval: false },
    { id: "prepare_email", risk: "medium", sideEffects: [{ kind: "external_write", target: "email", reversible: false }], requiresApproval: true },
    { id: "prepare_event", risk: "medium", sideEffects: [{ kind: "external_write", target: "calendar", reversible: false }], requiresApproval: true },
    { id: "read_web", risk: "low", sideEffects: [{ kind: "read", target: "web", reversible: true }], requiresApproval: false },
    { id: "save_artifact", risk: "low", sideEffects: [{ kind: "write", target: "artifacts", reversible: true }], requiresApproval: false },
    { id: "ask_user", risk: "low", sideEffects: [], requiresApproval: false },
    { id: "computer_command", risk: "medium", sideEffects: [{ kind: "write", target: "sandbox", reversible: false }], requiresApproval: false },
    { id: "query_business", risk: "low", sideEffects: [{ kind: "read", target: "business", reversible: true }], requiresApproval: false },
    { id: "recall_memory", risk: "low", sideEffects: [{ kind: "read", target: "memory", reversible: true }], requiresApproval: false },
    { id: "llm_generate", risk: "low", sideEffects: [], requiresApproval: false },
    { id: "transition_entity", risk: "medium", sideEffects: [{ kind: "write", target: "entity", reversible: false }], requiresApproval: false },
  ];

  for (const t of tools) {
    registry.register({
      id: t.id,
      version: "1.0.0",
      name: t.id,
      description: t.id,
      kind: "tool",
      inputs: {},
      outputs: {},
      preconditions: [],
      sideEffects: t.sideEffects.map((s) => ({
        kind: s.kind as "read" | "write" | "external_write" | "notification",
        target: s.target,
        reversible: s.reversible,
      })),
      permissions: [],
      risk: t.risk as "low" | "medium" | "high" | "critical",
      cost: {},
      idempotency: "idempotent",
      retryable: false,
      compensatable: false,
      requiresApproval: t.requiresApproval,
      tags: ["tool"],
    });
  }

  // CAPABILITIES_EXTENDED_V1 - capabilities de alto nivel (no tools).
  const composites: Array<{
    id: string;
    kind: "sop" | "composite" | "skill";
    description: string;
    risk: "low" | "medium" | "high" | "critical";
    sideEffects: Array<{ kind: string; target: string; reversible: boolean }>;
    requiresApproval: boolean;
  }> = [
    { id: "run_sop", kind: "composite", description: "Ejecuta un SOP registrado", risk: "low", sideEffects: [], requiresApproval: false },
    { id: "send_email", kind: "composite", description: "Envía email (preparado + aprobado)", risk: "medium", sideEffects: [{ kind: "external_write", target: "email", reversible: false }], requiresApproval: true },
    { id: "send_whatsapp", kind: "composite", description: "Envía WhatsApp (preparado + aprobado)", risk: "medium", sideEffects: [{ kind: "external_write", target: "whatsapp", reversible: false }], requiresApproval: true },
    { id: "create_calendar_event", kind: "composite", description: "Crea evento (preparado + aprobado)", risk: "medium", sideEffects: [{ kind: "external_write", target: "calendar", reversible: false }], requiresApproval: true },
  ];
  for (const c of composites) {
    registry.register({
      id: c.id,
      version: "1.0.0",
      name: c.id,
      description: c.description,
      kind: c.kind,
      inputs: {},
      outputs: {},
      preconditions: [],
      sideEffects: c.sideEffects.map((s) => ({
        kind: s.kind as "read" | "write" | "external_write" | "notification",
        target: s.target,
        reversible: s.reversible,
      })),
      permissions: [],
      risk: c.risk,
      cost: {},
      idempotency: "idempotent",
      retryable: false,
      compensatable: false,
      requiresApproval: c.requiresApproval,
      tags: ["composite"],
    });
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
  /** STATE_MACHINE_STEP_V1 — id de la maquina en el kind "state-machines". Solo si tool = transition_entity. */
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
  // AGENT_ROLE_V2 — categorias que usan las memorias de rol al seedear.
  | "rol-identidad"
  | "rol-dominio"
  | "rol-preferencias"
  | "rol-historial";

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
// AGENT_ROLE_V2 — un rol es un personaje del equipo: nombre, tono, avatar y
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

// AGENT_ROLE_V3 — ampliacion del rol con campos tecnicos opcionales.
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
  /** AGENT_ROLE_V3 — allowlist adicional. Ausente = sin restriccion. */
  permissions?: AgentRolePermission[];
  /** AGENT_ROLE_V3 — politica de memoria. Ausente = defaults permisivos. */
  memoryPolicy?: AgentRoleMemoryPolicy;
  /** AGENT_ROLE_V3 — skills que puede usar este rol. */
  skills?: string[];
  /** AGENT_ROLE_V3 — tools permitidas. Ausente = las de sus sops. */
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
  // AGENT_ROLE_V3 — campos tecnicos opcionales.
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
