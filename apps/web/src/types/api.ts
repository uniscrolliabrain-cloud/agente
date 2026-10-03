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

export type TaskKind = "agent" | "document" | "monitor" | "finance" | "plan" | "sop";

export interface TaskStep {
  id: string;
  title: string;
  status: "pending" | "running" | "succeeded" | "failed" | "waiting";
  detail?: string;
  // FIX_02_TASKSTEP_DURATION_V1
  durationMs?: number;
}

export interface Evidence {
  id: string;
  kind: "mail" | "file" | "web" | "user";
  title: string;
  excerpt: string;
  url?: string;
}

export interface AgentTask {
  id: string;
  title: string;
  prompt: string;
  kind: TaskKind;
  status: TaskStatus;
  goalId?: string;
  /** Id del rol de agente al que se asigno la tarea (AgentRole.id). */
  assignedTo?: string;
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
}

export interface RunEvent {
  id: string;
  taskId: string;
  date: string;
  kind: "plan" | "step" | "observation" | "approval" | "result" | "error" | "status";
  title: string;
  detail: string;
}

export interface AgentArtifact {
  id: string;
  taskId: string;
  kind: "plan" | "comparison" | "finance" | "report";
  title: string;
  summary: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface AgentWorkspace {
  tasks: AgentTask[];
  goals: unknown[];
  monitors: unknown[];
  ideas: unknown[];
  memories: unknown[];
  artifacts: AgentArtifact[];
  notifications: unknown[];
  identity: { name: string; tone: string; avatar?: string };
  worker: { running: boolean; lastTickAt?: string };
}

export interface ActionProposal {
  id: string;
  taskId?: string;
  title: string;
  kind: string;
  data: Record<string, unknown>;
  account?: string;
  connectionId?: string;
  status:
    | "awaiting_review"
    | "executing"
    | "succeeded"
    | "failed"
    | "outcome_unknown"
    | "denied"
    | "cancelled"
    | "expired";
  hash: string;
  createdAt: string;
  expiresAt: string;
  result?: string;
  error?: string;
}

export interface TaskDetail {
  task: AgentTask;
  files: unknown[];
  browsers: unknown[];
  events: RunEvent[];
  artifacts: AgentArtifact[];
}

export interface WorkspaceSnapshot {
  mode: "sample" | "live";
  profile: { name: string; email: string };
  mail: unknown[];
  events: unknown[];
  files: unknown[];
  browsers: unknown[];
  actions: ActionProposal[];
  activity: unknown[];
  connections: unknown[];
  runtime: {
    provider: "sample" | "model" | "openbot";
    configured: boolean;
    openbotConfigured: boolean;
    richThreads?: boolean;
  };
}

export type MessageRole = "user" | "assistant" | "system";

export interface ChatAttachment {
  id: string;
  name: string;
  size?: number;
}

// B2_TOOLS_V1 - toolCall singular -> tools[].
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: string;
  tools?: { id: string; name: string; status: "running" | "done" | "error"; startedAt: number; endedAt?: number; args?: unknown }[];
  taskIdRef?: string;
  attachment?: ChatAttachment;
}
