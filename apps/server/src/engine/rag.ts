
import { createHash, randomUUID } from "node:crypto";
import type { Store } from "../db.ts";
import { embed } from "./embeddings.ts";

const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 120;

export interface RagChunk {
  id: string;
  sourceId: string;
  sourceName: string;
  chunkIndex: number;
  text: string;
  embedding: number[] | null;
  createdAt: string;
}

export interface RagHit extends RagChunk {
  score: number;
}

export function chunkText(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return [];
  const chunks: string[] = [];
  const paragraphs = normalized.split(/\n{2,}/);
  let buffer = "";
  const flush = () => {
    if (buffer.trim()) chunks.push(buffer.trim());
    buffer = "";
  };
  for (const para of paragraphs) {
    const candidate = buffer ? buffer + "\n\n" + para : para;
    if (candidate.length <= CHUNK_SIZE) { buffer = candidate; continue; }
    if (buffer) flush();
    if (para.length <= CHUNK_SIZE) { buffer = para; continue; }
    // Parrafo muy largo: cortamos por tamano con solapamiento.
    let start = 0;
    while (start < para.length) {
      const end = Math.min(start + CHUNK_SIZE, para.length);
      chunks.push(para.slice(start, end).trim());
      if (end >= para.length) break;
      start = end - CHUNK_OVERLAP;
    }
  }
  flush();
  return chunks.filter((c) => c.length > 30);
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export class RagService {
  constructor(private readonly db: Store) {}

  async ingestText(owner: string, sourceId: string, sourceName: string, text: string) {
    const chunks = chunkText(text);
    if (chunks.length === 0) return { chunks: 0, embedded: 0 };
    let embedded = 0;
    for (let i = 0; i < chunks.length; i += 1) {
      const vec = await embed(chunks[i]);
      if (vec) embedded += 1;
      const chunk: RagChunk = {
        id: `${sourceId}-${i}`,
        sourceId,
        sourceName,
        chunkIndex: i,
        text: chunks[i],
        embedding: vec,
        createdAt: new Date().toISOString(),
      };
      await this.db.put(owner, "rag-chunks", chunk);
    }
    return { chunks: chunks.length, embedded };
  }

  async removeSource(owner: string, sourceId: string) {
    const all = await this.db.list<RagChunk>(owner, "rag-chunks");
    for (const chunk of all) {
      if (chunk.sourceId === sourceId) {
        await this.db.remove(owner, "rag-chunks", chunk.id);
      }
    }
  }

  async search(owner: string, query: string, limit = 5): Promise<RagHit[]> {
    const queryVec = await embed(query);
    if (!queryVec) return [];
    const all = await this.db.list<RagChunk>(owner, "rag-chunks");
    const hits: RagHit[] = [];
    for (const chunk of all) {
      if (!Array.isArray(chunk.embedding) || chunk.embedding.length !== queryVec.length) continue;
      hits.push({ ...chunk, score: cosine(queryVec, chunk.embedding) });
    }
    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, limit);
  }

  async stats(owner: string) {
    const all = await this.db.list<RagChunk>(owner, "rag-chunks");
    const sources = new Set(all.map((c) => c.sourceId));
    return { chunks: all.length, sources: sources.size };
  }
}
