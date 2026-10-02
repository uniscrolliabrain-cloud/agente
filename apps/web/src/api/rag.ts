import { apiFetch } from "./client";

export interface RagStatus {
  configured: boolean;
  chunks: number;
  sources: number;
}

export interface RagHit {
  id: string;
  sourceId: string;
  sourceName: string;
  chunkIndex: number;
  text: string;
  score: number;
}

export interface RagIngestResult {
  chunks: number;
  embedded: number;
}

export async function ragStatus(): Promise<RagStatus> {
  return apiFetch<RagStatus>("/api/rag/status");
}

export async function ragSearch(query: string, limit = 5): Promise<RagHit[]> {
  const res = await apiFetch<{ hits: RagHit[] }>(
    `/api/rag/search?q=${encodeURIComponent(query)}&limit=${limit}`,
  );
  return res.hits;
}

export async function ragIngest(input: {
  sourceId: string;
  sourceName: string;
  text: string;
}): Promise<RagIngestResult> {
  return apiFetch<RagIngestResult>("/api/rag/ingest", { method: "POST", body: input });
}

// REINGEST_CLIENT_V1 - reingesta server-side, sin bajar el archivo al navegador.
export async function ragReingest(sourceId: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>(`/api/rag/reingest/${encodeURIComponent(sourceId)}`, {
    method: "POST",
  });
}

export async function ragDeleteSource(sourceId: string): Promise<void> {
  await apiFetch(`/api/rag/source/${encodeURIComponent(sourceId)}`, { method: "DELETE" });
}