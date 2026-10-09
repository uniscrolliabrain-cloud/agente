// AGENT_PERSONAS_API_V1 - cliente HTTP de personas.
import { apiFetch } from "./client";

export type PersonaStatus = "online" | "idle" | "working" | "standby" | "offline";

export interface AgentPersonaDTO {
  personaId: string;
  displayName: string;
  role: string;
  archetype: string;
  description?: string;
  capabilities?: string[];
  avatar: { kind: string; seed?: string; url?: string } | null;
  reportsTo: string | null;
  peers: string[];
  stats: {
    level: number;
    archetype: string;
    totalTasks: number;
    precision: number;
    avgTimeMs: number;
    uptime: number;
    status: PersonaStatus;
    currentTask?: string;
  };
}

export interface AgentPersonaListResponse {
  tenantId: string;
  total: number;
  personas: AgentPersonaDTO[];
}

export interface AttentionMatch { node: string; weight: number; reason: string }

export interface AgentThought {
  id: string;
  role: string;
  actor: { kind: string; id: string; personaId?: string };
  content: string | Record<string, unknown>;
  attention: {
    primary: string;
    matched: AttentionMatch[];
    ignored: Array<{ node: string; reason: string }>;
    confidence: number;
  };
  provenance: { source: string; timestamp: string };
}

export interface AgentNode {
  personaId: string;
  tenantId: string;
  owner: string;
  turns: Array<{
    id: string;
    personaId?: string;
    status: "open" | "closed" | "promoted";
    startedAt: string;
    closedAt?: string;
    triggers: string[];
    thoughtIds: string[];
  }>;
  thoughts: AgentThought[];
  memory: Array<{ id: string; text: string; category?: string; createdAt: string }>;
}

export interface AllNodesResponse { tenantId: string; total: number; nodes: AgentNode[] }

export interface AgentAttention {
  personaId: string;
  totalThoughts: number;
  topMatched: AttentionMatch[];
  ignored: Array<{ node: string; reason: string }>;
  totalAttention: number;
}

export interface AgentActivityEntry {
  kind: "success" | "working" | "failed" | "queued" | "scheduled" | "other";
  verb: string;
  subject: string;
  at: string;
  taskId?: string;
  detail?: string;
}

export interface AgentActivityResponse {
  personaId: string;
  total: number;
  activity: AgentActivityEntry[];
}

export const EMPTY_NODES: AllNodesResponse = { tenantId: "", total: 0, nodes: [] };

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException
    ? err.name === "AbortError"
    : typeof err === "object" && err !== null && (err as { name?: string }).name === "AbortError";
}

function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiFetch<T>(path, signal ? { signal } : undefined);
}

const enc = encodeURIComponent;

export const listAgentPersonas = (signal?: AbortSignal) =>
  get<AgentPersonaListResponse>("/api/agent-personas", signal);

export const listAllAgentNodes = (signal?: AbortSignal) =>
  get<AllNodesResponse>("/api/agent-personas/all/nodes", signal);

export const getAgentNode = (personaId: string, signal?: AbortSignal) =>
  get<AgentNode>(`/api/agent-personas/${enc(personaId)}/node`, signal);

export const getAgentAttention = (personaId: string, signal?: AbortSignal) =>
  get<AgentAttention>(`/api/agent-personas/${enc(personaId)}/attention`, signal);

// AGENTS_REFRESH_STATS_BUTTON_V1 - recalcula stats de todas las personas.
export const refreshAllStats = (): Promise<{ tenantId: string; refreshed: number; errors: string[] }> =>
  apiFetch("/api/agent-personas/refresh-stats", { method: "POST" });

export const getAgentActivity = (personaId: string, limit = 20, signal?: AbortSignal) =>
  get<AgentActivityResponse>(`/api/agent-personas/${enc(personaId)}/activity?limit=${limit}`, signal);