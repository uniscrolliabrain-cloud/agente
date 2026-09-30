// AGENTROLE_V2_WEB
import { apiFetch } from "./client";

/**
 * Roles de agente (POST/GET /api/agent/roles). El backend guarda uno por owner en el kind
 * "agent-roles" y ConversationAgent mete `objetivo` en el prompt del run cuando la UI
 * envia el roleId en state.
 */
export type AgentTone = "warm" | "concise" | "thoughtful";
export type AgentAvatar = "sky" | "sand" | "lilac";
export type AgentMemoryKind = "identidad" | "dominio" | "preferencias" | "historial";

export interface AgentRoleMemory {
  kind: AgentMemoryKind;
  text: string;
}

export interface AgentRole {
  id: string;
  name: string;
  tone: AgentTone;
  avatar: AgentAvatar;
  greeting?: string;
  roi?: string;
  objetivo: string;
  sops: string[];
  active: boolean;
  memories: AgentRoleMemory[];
  createdAt?: string;
}

export async function listAgents(): Promise<AgentRole[]> {
  return apiFetch<AgentRole[]>("/api/agent/roles");
}

export async function createAgent(input: {
  id: string;
  name: string;
  tone: AgentTone;
  avatar: AgentAvatar;
  greeting?: string;
  roi?: string;
  objetivo: string;
  sops: string[];
  active: boolean;
  memories: AgentRoleMemory[];
}): Promise<AgentRole> {
  return apiFetch<AgentRole>("/api/agent/roles", { method: "POST", body: input });
}
