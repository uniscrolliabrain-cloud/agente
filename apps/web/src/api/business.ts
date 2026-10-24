import { apiFetch } from "./client";

// BUSINESS_WEB_V1 — cliente del Business Graph.

export interface Provenance {
  source: string;
  actor: string;
  updatedAt: string;
  confidence?: number;
}

export interface BusinessEntity {
  id: string;
  type: string;
  name: string;
  status?: string;
  properties: Record<string, unknown>;
  schemaVersion: string;
  provenance: Provenance;
}

export interface BusinessRelation {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: string;
  properties: Record<string, unknown>;
  provenance: Provenance;
}

export interface Neighborhood {
  entities: BusinessEntity[];
  relations: BusinessRelation[];
}

export interface WorkspaceTemplate {
  roleId: string;
  defaultView: string;
  label: string;
  accent?: string;
}

export async function listEntities(type?: string): Promise<BusinessEntity[]> {
  const q = type ? `?type=${encodeURIComponent(type)}` : "";
  const res = await apiFetch<{ entities: BusinessEntity[] }>(`/api/business/entities${q}`);
  return res.entities;
}

export async function getEntity(id: string): Promise<BusinessEntity> {
  return apiFetch<BusinessEntity>(`/api/business/entities/${encodeURIComponent(id)}`);
}

export async function getNeighborhood(id: string, depth = 1): Promise<Neighborhood> {
  return apiFetch<Neighborhood>(
    `/api/business/entities/${encodeURIComponent(id)}/neighborhood?depth=${depth}`,
  );
}

export async function createEntity(input: {
  id?: string;
  type: string;
  name: string;
  status?: string;
  properties?: Record<string, unknown>;
}): Promise<BusinessEntity> {
  return apiFetch<BusinessEntity>("/api/business/entities", { method: "POST", body: input });
}

export async function updateEntity(
  id: string,
  patch: { name?: string; status?: string; properties?: Record<string, unknown> },
): Promise<BusinessEntity> {
  return apiFetch<BusinessEntity>(`/api/business/entities/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
  });
}

export async function deleteEntity(id: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>(`/api/business/entities/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function listWorkspaceTemplates(): Promise<WorkspaceTemplate[]> {
  const res = await apiFetch<{ templates: WorkspaceTemplate[] }>(
    "/api/business/workspace-templates",
  );
  return res.templates;
}

export async function getWorkspaceTemplate(roleId: string): Promise<WorkspaceTemplate> {
  return apiFetch<WorkspaceTemplate>(
    `/api/business/workspace-templates/${encodeURIComponent(roleId)}`,
  );
}
