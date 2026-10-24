import { apiFetch } from "./client";
import type { AgentTask, AgentWorkspace, TaskDetail } from "../types/api";

export async function listTasks(): Promise<AgentWorkspace> {
  return apiFetch<AgentWorkspace>("/api/agent");
}

export async function getTaskDetail(id: string): Promise<TaskDetail> {
  return apiFetch<TaskDetail>(`/api/agent/tasks/${encodeURIComponent(id)}`);
}

export async function controlTask(
  id: string,
  action: "pause" | "resume" | "cancel" | "retry",
): Promise<AgentTask> {
  return apiFetch<AgentTask>(`/api/agent/tasks/${encodeURIComponent(id)}/control`, {
    method: "POST",
    body: { action },
  });
}

export async function answerTask(
  id: string,
  answer: string,
  fields?: Record<string, string | boolean>,
): Promise<AgentTask> {
  return apiFetch<AgentTask>(`/api/agent/tasks/${encodeURIComponent(id)}/input`, {
    method: "POST",
    body: { answer, ...(fields ? { fields } : {}) },
  });
}
