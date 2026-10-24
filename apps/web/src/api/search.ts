import { apiFetch } from "./client";

export interface SearchHit {
  kind: "task" | "memory" | "artifact" | "thread" | "project";
  id: string;
  title: string;
  excerpt: string;
  score: number;
  date: string;
}

export async function globalSearch(query: string, limit = 30): Promise<SearchHit[]> {
  const res = await apiFetch<{ hits: SearchHit[] }>(`/api/agent/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  return res.hits;
}
