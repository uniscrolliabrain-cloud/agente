import { apiFetch } from "./client";

/**
 * Roles de agente (POST/GET /api/agent/roles). El backend guarda uno por owner en el kind
 * "agent-roles" y ConversationAgent mete `objetivo` en el prompt del run cuando la UI
 * envia el roleId en state.
 */
export interface AgentRole {
  id: string;
  name: string;
  objetivo: string;
  sops: string[];
  active: boolean;
}

export async function listAgents(): Promise<AgentRole[]> {
  return apiFetch<AgentRole[]>("/api/agent/roles");
}

export async function createAgent(input: {
  id: string;
  name: string;
  objetivo: string;
  sops: string[];
  active: boolean;
}): Promise<AgentRole> {
  return apiFetch<AgentRole>("/api/agent/roles", { method: "POST", body: input });
}
