import { apiFetch } from "./client";
import type { ChatMessage } from "../types/api";

export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ThreadWithMessages extends Thread {
  messages: ChatMessage[];
}

export async function listThreads(): Promise<Thread[]> {
  return apiFetch<Thread[]>("/api/threads");
}

export async function createThread(title?: string): Promise<Thread> {
  return apiFetch<Thread>("/api/threads", {
    method: "POST",
    body: title ? { title } : {},
  });
}

export async function getThread(id: string): Promise<ThreadWithMessages> {
  return apiFetch<ThreadWithMessages>(`/api/threads/${encodeURIComponent(id)}`);
}

// SAVE_THREAD_EXPECTED_V1 - acepta expectedUpdatedAt para activar el CAS del server.
export async function saveThreadMessages(
  id: string,
  messages: ChatMessage[],
  expectedUpdatedAt?: string,
): Promise<Thread> {
  return apiFetch<Thread>(`/api/threads/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: { messages, ...(expectedUpdatedAt ? { expectedUpdatedAt } : {}) },
  });
}

export async function renameThread(id: string, title: string): Promise<Thread> {
  return apiFetch<Thread>(`/api/threads/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { title },
  });
}

export async function deleteThread(id: string): Promise<void> {
  await apiFetch(`/api/threads/${encodeURIComponent(id)}`, { method: "DELETE" });
}