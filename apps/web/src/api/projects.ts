import { apiFetch } from "./client";

export type ProjectStatus = "active" | "paused" | "completed" | "archived";

export type ProjectBlockType = "text" | "heading" | "checklist" | "timeline" | "note";

export interface ProjectBlock {
  id: string;
  type: ProjectBlockType;
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

export interface ProjectMemory {
  id: string;
  text: string;
  source: string;
  category?: string;
  tags?: string[];
  createdAt: string;
}

export interface ProjectArtifact {
  id: string;
  taskId: string;
  kind: "plan" | "comparison" | "finance" | "report";
  title: string;
  summary: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface ProjectDetail extends Project {
  memories: ProjectMemory[];
  artifacts: ProjectArtifact[];
}

export async function listProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/api/projects");
}

export async function createProject(input: {
  name: string;
  clientId?: string;
  description?: string;
  tags?: string[];
}): Promise<Project> {
  return apiFetch<Project>("/api/projects", { method: "POST", body: input });
}

export async function getProject(id: string): Promise<ProjectDetail> {
  return apiFetch<ProjectDetail>(`/api/projects/${encodeURIComponent(id)}`);
}

// PROJECT_EXPECTED_V1 - updateProject acepta expectedUpdatedAt.
export async function updateProject(
  id: string,
  patch: Partial<{
    name: string;
    clientId: string | null;
    description: string;
    status: ProjectStatus;
    tags: string[];
  }>,
  expectedUpdatedAt?: string,
): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { ...patch, ...(expectedUpdatedAt ? { expectedUpdatedAt } : {}) },
  });
}

// PROJECT_BLOCKS_EXPECTED_V1 - acepta expectedUpdatedAt para CAS.
export async function saveProjectBlocks(
  id: string,
  blocks: ProjectBlock[],
  expectedUpdatedAt?: string,
): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${encodeURIComponent(id)}/blocks`, {
    method: "PUT",
    body: { blocks, ...(expectedUpdatedAt ? { expectedUpdatedAt } : {}) },
  });
}

export async function linkMemory(id: string, memoryId: string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${encodeURIComponent(id)}/link-memory`, {
    method: "POST",
    body: { memoryId },
  });
}

export async function unlinkMemory(id: string, memoryId: string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${encodeURIComponent(id)}/unlink-memory`, {
    method: "POST",
    body: { memoryId },
  });
}

export async function linkArtifact(id: string, artifactId: string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${encodeURIComponent(id)}/link-artifact`, {
    method: "POST",
    body: { artifactId },
  });
}

export async function unlinkArtifact(id: string, artifactId: string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${encodeURIComponent(id)}/unlink-artifact`, {
    method: "POST",
    body: { artifactId },
  });
}

export async function deleteProject(id: string): Promise<void> {
  await apiFetch(`/api/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
}