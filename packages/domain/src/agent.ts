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
  // AGENT_ROLE_V2 â€” categorias que usan las memorias de rol al seedear.
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
// AGENT_ROLE_V2 â€” un rol es un personaje del equipo: nombre, tono, avatar y
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

// AGENT_ROLE_V3 â€” ampliacion del rol con campos tecnicos opcionales.
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
  /** AGENT_ROLE_V3 â€” allowlist adicional. Ausente = sin restriccion. */
  permissions?: AgentRolePermission[];
  /** AGENT_ROLE_V3 â€” politica de memoria. Ausente = defaults permisivos. */
  memoryPolicy?: AgentRoleMemoryPolicy;
  /** AGENT_ROLE_V3 â€” skills que puede usar este rol. */
  skills?: string[];
  /** AGENT_ROLE_V3 â€” tools permitidas. Ausente = las de sus sops. */
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
  // AGENT_ROLE_V3 â€” campos tecnicos opcionales.
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
