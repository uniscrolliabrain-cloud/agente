import { apiFetch } from "./client";
import type { ChatMessage } from "../types/api";

interface MainThreadResponse {
  threadId: string;
  existing: boolean;
}

interface ConversationResponse {
  id: string;
  messages: unknown[];
}

export async function getOrCreateMainThread(): Promise<MainThreadResponse> {
  return apiFetch<MainThreadResponse>("/api/main-thread");
}

export async function getConversation(): Promise<{ id: string; messages: ChatMessage[] }> {
  const raw = await apiFetch<ConversationResponse>("/api/conversation");
  return { id: raw.id, messages: (raw.messages ?? []) as ChatMessage[] };
}

export async function saveConversation(messages: ChatMessage[]): Promise<void> {
  await apiFetch("/api/conversation", { method: "PUT", body: { messages } });
}
