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
- Only files matching these patterns are included: apps/server/src/engine/views/**, apps/web/src/view/**, packages/domain/src/agent.ts, packages/domain/src/outcome.ts, packages/domain/src/views.ts, packages/domain/src/kernel.ts
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      engine/
        views/
          resolver.ts
  web/
    src/
      view/
        fallback.tsx
        resolver.ts
        spec.ts
        ViewRenderer.tsx
packages/
  domain/
    src/
      agent.ts
      kernel.ts
      outcome.ts
      views.ts
```

# Files

## File: apps/web/src/view/fallback.tsx
```typescript
// FALLBACK_V1 - que pintar si nada encaja
export function FallbackView({spec}:{spec:any}){return <div data-fallback>{spec?.title||"No template"} - fallback</div>}
```

## File: apps/web/src/view/resolver.ts
```typescript
// VIEW_RESOLVER_V1 - decide template segun intent+context (frontend resolver local)
import type { ViewSpec } from "./spec.ts";
import { findTemplate } from "../templates/registry.ts";
export function resolveView(spec:ViewSpec){return findTemplate(spec)}
export function resolveByIntent(intent:string):Partial<ViewSpec>{
 if(intent.includes("table"))return {kind:"collection",layout:"table"};
 if(intent.includes("kanban"))return {kind:"collection",layout:"kanban"};
 if(intent.includes("timeline"))return {kind:"timeline",layout:"timeline"};
 return {kind:"collection",layout:"list"};
}
```

## File: apps/web/src/view/spec.ts
```typescript
// VIEW_SPEC_V1 - tipos cerrados que rellena el backend
import { z } from "zod";
export const columnSpec=z.object({key:z.string(),label:z.string(),type:z.enum(["text","number","date","chip","action"]),sortable:z.boolean().optional()});
export const actionSpec=z.object({id:z.string(),label:z.string(),kind:z.enum(["primary","secondary","danger"]),intent:z.string()});
export const dataSourceSpec=z.object({kind:z.enum(["business-graph","memory","static"]),query:z.string(),tenantId:z.string(),bindings:z.record(z.string(),z.unknown()).default({})});
export const viewSpec=z.object({
 id:z.string(),kind:z.enum(["collection","timeline","detail","form","chart"]),layout:z.enum(["dashboard","table","kanban","list","timeline","form","graph"]).optional(),
 title:z.string(),columns:z.array(columnSpec).optional(),actions:z.array(actionSpec).optional(),
 dataSource:z.array(dataSourceSpec).optional(),provenance:z.record(z.string(),z.unknown()).optional(),
});
export type ViewSpec=z.infer<typeof viewSpec>;export type ColumnSpec=z.infer<typeof columnSpec>;export type ActionSpec=z.infer<typeof actionSpec>;export type DataSourceSpec=z.infer<typeof dataSourceSpec>;
```

## File: packages/domain/src/kernel.ts
```typescript
// DOMAIN_KERNEL_V1 - contrato del kernel para el dominio.
//
// Por que existe este fichero:
//   engine/ no puede importar de kernel/ sin acoplarse a la implementacion.
//   Este contrato permite que engine/ use el kernel sin saber si es
//   InMemoryTurnStore o StoreTurnStore.
//
// Nota: los tipos Thought, Turn, KernelContext reales viven en
// apps/server/src/kernel/. Aqui solo esta el contrato minimo que el engine
// necesita para no depender de la implementacion.

export type KernelRole = "admin" | "user" | "agent" | "system";

export interface KernelContext {
  tenantId: string;
  owner: string;
  role: KernelRole;
  requestId: string;
  /** KERNEL_THREAD_V1 - threadId de la conversacion. Opcional. */
  threadId?: string;
  /** KERNEL_PARENT_TURN_V1 - si este contexto abre un turno hijo. */
  parentTurnId?: string;
  /** KERNEL_CORRELATION_V1 - correlacion HTTP <-> task <-> turn. */
  correlationId?: string;
}

export interface KernelThought {
  id: string;
  role: string;
  actor: { kind: string; id: string };
  content: string | Record<string, unknown>;
  provenance: { source: string; timestamp: string; parentId?: string };
  edges: Array<{ toThoughtId: string; kind: string; weight: number; confidence: number }>;
  context: { entities: string[]; policies: string[]; skills: string[]; priorThoughts: string[] };
}

export interface KernelTurn {
  id: string;
  parentTurnId?: string;
  status: "open" | "closed" | "promoted";
  closeReason?: string;
  closedBy?: string;
  thoughtIds: string[];
}

/**
 * KERNEL_PORT_V1 - contrato minimo que engine/ usa.
 *
 * Notas:
 *   - openTurn no deduplica. El caller decide si reusar un turno abierto.
 *   - closeTurn cierra tambien los hijos abiertos (la implementacion lo decide).
 *   - listOpenTurnsForThread permite reusar turnos en el mismo thread.
 */
export interface KernelPort {
  openTurn(ctx: KernelContext, trigger: string): Promise<KernelTurn>;
  openChildTurn(ctx: KernelContext, parentTurnId: string, trigger: string): Promise<KernelTurn>;
  closeTurn(
    ctx: KernelContext,
    turnId: string,
    reason: string,
    closedBy: string,
  ): Promise<KernelTurn>;
  appendThought(ctx: KernelContext, input: unknown): Promise<KernelThought>;
  thoughtsOf(ctx: KernelContext, turnId: string): Promise<KernelThought[]>;
  listTurns(ctx: KernelContext, limit: number): Promise<KernelTurn[]>;
  listOpenTurnsForThread(ctx: KernelContext): Promise<KernelTurn[]>;
}

/**
 * KERNEL_WRITER_PORT_V1 - contrato de un autor (user, fast, slow).
 * El engine no necesita saber si es in-memory o persistente.
 */
export interface KernelWriterPort {
  write(ctx: KernelContext, input: unknown): Promise<KernelThought>;
}
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

## File: packages/domain/src/views.ts
```typescript
// FIX_02_VIEWS_RENAME_V1 - nombres distintos a workspace-spec.ts para no colisionar.
import { z } from "zod";

const kpi = z.object({
  label: z.string().min(1).max(120),
  value: z.union([z.string(), z.number()]),
  delta: z.string().max(60).optional(),
});

const queueItem = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).optional(),
  status: z.enum(["pending", "running", "done", "error"]),
  actions: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        label: z.string().min(1).max(80),
        kind: z.enum(["primary", "default", "danger"]).default("default"),
      }),
    )
    .max(3)
    .default([]),
});

// VIEWSPEC_EXTENDED_V1 - añadidos inbox, board, table, detail y form para
// cubrir los 7 templates que pide docs/TEMPLATES_V2.md. Cada uno con su
// forma especifica y un tope de items para no romper el renderer.
const inboxItem = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  actions: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        label: z.string().min(1).max(80),
        kind: z.enum(["approve", "deny", "open", "edit"]).default("open"),
      }),
    )
    .max(3)
    .default([]),
});

const boardColumn = z.object({
  id: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  status: z.string().min(1).max(100),
});

const boardCard = z.object({
  id: z.string().min(1).max(200),
  columnId: z.string().min(1).max(100),
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).optional(),
  updatedAt: z.string().max(80).optional(),
});

const tableColumn = z.object({
  key: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  type: z.enum(["text", "number", "date", "chip", "action"]).default("text"),
  align: z.enum(["left", "right", "center"]).default("left"),
});

const detailProperty = z.object({
  key: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  provenance: z.enum(["auto", "alta", "media", "sugerido", "tu", "missing"]).default("auto"),
});

const formField = z.object({
  key: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  type: z.enum(["text", "number", "date", "select", "textarea", "checkbox"]),
  required: z.boolean().default(false),
  options: z.array(z.string().max(200)).max(100).optional(),
  value: z.unknown().optional(),
  provenance: z.enum(["auto", "alta", "media", "sugerido", "tu", "missing"]).default("missing"),
});

export const runtimeViewSpecSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("dashboard"),
    title: z.string().min(1).max(300),
    kpis: z.array(kpi).max(6),
  }),
  z.object({
    kind: z.literal("queue"),
    title: z.string().min(1).max(300),
    items: z.array(queueItem).max(50),
  }),
  z.object({
    kind: z.literal("inbox"),
    title: z.string().min(1).max(300),
    items: z.array(inboxItem).max(50),
  }),
  z.object({
    kind: z.literal("board"),
    title: z.string().min(1).max(300),
    entityType: z.string().max(100).optional(),
    columns: z.array(boardColumn).max(10),
    cards: z.array(boardCard).max(200),
  }),
  z.object({
    kind: z.literal("table"),
    title: z.string().min(1).max(300),
    columns: z.array(tableColumn).max(20),
    rows: z.array(z.record(z.string(), z.unknown())).max(200),
  }),
  z.object({
    kind: z.literal("detail"),
    title: z.string().min(1).max(300),
    entityId: z.string().max(200).optional(),
    entityType: z.string().max(100).optional(),
    properties: z.array(detailProperty).max(50),
    relations: z
      .array(
        z.object({
          id: z.string().max(200),
          type: z.string().max(100),
          targetName: z.string().max(300),
        }),
      )
      .max(50)
      .default([]),
  }),
  z.object({
    kind: z.literal("form"),
    title: z.string().min(1).max(300),
    entityType: z.string().max(100),
    fields: z.array(formField).max(50),
    submitLabel: z.string().max(80).default("Guardar"),
  }),
]);

export type RuntimeViewSpec = z.infer<typeof runtimeViewSpecSchema>;
export type ViewKpi = z.infer<typeof kpi>;
export type ViewQueueItem = z.infer<typeof queueItem>;

export function parseRuntimeViewSpec(raw: unknown): RuntimeViewSpec | null {
  const r = runtimeViewSpecSchema.safeParse(raw);
  return r.success ? r.data : null;
}
```

## File: apps/server/src/engine/views/resolver.ts
```typescript
// FIX_02_RESOLVER_V3 - usa RuntimeViewSpec para no colisionar con workspace-spec.
// VIEW_RESOLVER_CLASS_V1 - antes INTENTS era un array global mutable. Dos
// requests concurrentes que llamaran a clearIntents() rompian el resolver
// para todos. Ahora es una clase instanciable; el array vive por instancia.
// La funcion `resolveView` de modulo sigue existiendo por compatibilidad
// con los sitios que ya la importaban, y delega en una instancia singleton.
import { parseRuntimeViewSpec, type RuntimeViewSpec } from "@openmuse/domain/views";

export type ViewBuilder = (owner: string) => Promise<unknown>;

interface Intent {
  re: RegExp;
  build: ViewBuilder;
}

export class ViewResolver {
  private readonly intents: Intent[] = [];

  register(re: RegExp, build: ViewBuilder): void {
    this.intents.push({ re, build });
  }

  clear(): void {
    this.intents.length = 0;
  }

  async resolve(owner: string, text: string): Promise<RuntimeViewSpec | null> {
    const t = normalize(text);
    for (const { re, build } of this.intents) {
      if (re.test(t)) {
        return parseRuntimeViewSpec(await build(owner));
      }
    }
    return null;
  }
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Compatibilidad: instancia unica por proceso para el resolver global legacy.
const legacy = new ViewResolver();

export function registerIntent(re: RegExp, build: ViewBuilder): void {
  legacy.register(re, build);
}

export async function resolveView(owner: string, text: string): Promise<RuntimeViewSpec | null> {
  return legacy.resolve(owner, text);
}

export function clearIntents(): void {
  legacy.clear();
}
```

## File: apps/web/src/view/ViewRenderer.tsx
```typescript
// D3_VIEWRENDERER_V2 - discriminated union + assertNever.
import { parseRuntimeViewSpec, type RuntimeViewSpec } from "@openmuse/domain/views"; // FIX_02_D
import DashboardTemplate from "../templates/dashboard/DashboardTemplate";
import QueueTemplate from "../templates/queue/QueueTemplate";

interface Props {
  spec: unknown;
  onAction?: (itemId: string, actionId: string) => void;
}

function assertNever(x: never): never {
  throw new Error(`kind sin renderer: ${JSON.stringify(x)}`);
}

export default function ViewRenderer({ spec: raw, onAction }: Props) {
  const spec = parseRuntimeViewSpec(raw);
  if (!spec) {
    return (
      <div className="card" role="alert">
        No he podido mostrar esta vista.
      </div>
    );
  }
  return <Render spec={spec} onAction={onAction} />;
}

// VIEWRENDERER_SEVEN_KINDS_V1 - el renderer acepta los 7 kinds del schema
// ampliado. Los que no tienen componente propio muestran un fallback honesto
// en vez de reventar con assertNever.
function Render({ spec, onAction }: { spec: RuntimeViewSpec; onAction?: (id: string, a: string) => void }) {
  switch (spec.kind) {
    case "dashboard":
      return <DashboardTemplate spec={spec} />;
    case "queue":
      return <QueueTemplate spec={spec} onAction={onAction} />;
    case "inbox":
    case "board":
    case "table":
    case "detail":
    case "form":
      // Pendiente de componente propio. Mostramos un placeholder honesto.
      return (
        <div className="card" role="region" aria-label={spec.title}>
          <b>{spec.title}</b>
          <p>Este tipo de vista ({spec.kind}) se sirve pero aun no tiene template dedicado.</p>
        </div>
      );
    default:
      return assertNever(spec);
  }
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
