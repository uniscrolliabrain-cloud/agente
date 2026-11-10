// WS_API_V2 - catalogo, detalle y ejecucion de vistas de workspace.
import type { ViewEnvelope } from "@agente/domain/view-envelope";
import { apiFetch } from "./client.ts";

export interface WorkspaceListEntry {
  id: string;
  slug: string;
  family: string;
  title: string;
  reference: string;
}

export interface WorkspaceViewDefinition {
  id: string;
  intent: string;
  kind: string;
  title: string;
  query: string;
  actions: string[];
}

export interface WorkspaceDetail {
  manifest: {
    id: string;
    slug: string;
    family: string;
    title: string;
    reference: string;
    status?: string;
    version?: number;
    [key: string]: unknown;
  };
  capabilities: string[];
  views: string[];
  viewDefinitions: WorkspaceViewDefinition[];
  commands: string[];
  queries: string[];
}

export async function listWorkspaces(): Promise<WorkspaceListEntry[]> {
  return apiFetch<WorkspaceListEntry[]>("/api/workspaces");
}

export async function getWorkspaceDetail(id: string): Promise<WorkspaceDetail> {
  return apiFetch<WorkspaceDetail>(`/api/workspaces/${encodeURIComponent(id)}`);
}

export async function getWorkspace(id: string): Promise<WorkspaceDetail | null> {
  return apiFetch<WorkspaceDetail | null>(`/api/workspaces/${encodeURIComponent(id)}`);
}

export async function getWorkspaceView(id: string, viewId: string): Promise<ViewEnvelope> {
  const result = await apiFetch<{ view: ViewEnvelope }>(
    `/api/workspaces/${encodeURIComponent(id)}/view`,
    { method: "POST", body: { viewId } },
  );
  return result.view;
}
