// WS_API_V1 - cliente HTTP del catalogo de workspaces.
import { apiFetch } from "./client.ts";

export interface WorkspaceListEntry {
  id: string;
  slug: string;
  family: string;
  title: string;
  reference: string;
}

export async function listWorkspaces(): Promise<WorkspaceListEntry[]> {
  return apiFetch<WorkspaceListEntry[]>("/api/workspaces");
}

export async function getWorkspace(id: string): Promise<WorkspaceListEntry | null> {
  return apiFetch<WorkspaceListEntry | null>(/api/workspaces/);
}
