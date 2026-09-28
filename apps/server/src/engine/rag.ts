
import { createHash, randomUUID } from "node:crypto";
import type { Store } from "../db.ts";
import { embed } from "./embeddings.ts";

const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 120;
/** Peticiones de embedding simultaneas durante la ingesta. */
export const RAG_INGEST_CONCURRENCY = 4;
/** Techo de chunks por fuente, para que un fichero enorme no dispare la ingesta sin fin. */
export const RAG_MAX_CHUNKS_PER_SOURCE = 1000;
/** Paginas de busqueda: acota la memoria a SEARCH_PAGE_SIZE filas en vez de todo el indice. */
const SEARCH_PAGE_SIZE = 500;

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

/** Inserta un hit en una lista acotada y ordenada por score descendente. */
/**
 * BM25 simplificado: term frequency normalizada por longitud del documento. No usa IDF
 * (no mantenemos el corpus completo aqui). Suficiente como senal de keyword para
 * combinar con el coseno.
 */
function bm25Score(queryWords: string[], text: string): number {
  if (!queryWords.length) return 0;
  const words = text.toLowerCase().split(/\\W+/).filter(Boolean);
  if (!words.length) return 0;
  const tf = new Map<string, number>();
  for (const w of words) tf.set(w, (tf.get(w) ?? 0) + 1);
  const k1 = 1.2,
    b = 0.75,
    avgLen = 200;
  const norm = 1 - b + b * (words.length / avgLen);
  let score = 0;
  for (const q of queryWords) {
    const f = tf.get(q) ?? 0;
    if (f > 0) score += (f * (k1 + 1)) / (f + k1 * norm);
  }
  return score;
}
function keepTop(top: RagHit[], hit: RagHit, limit: number): void {
  if (top.length >= limit && hit.score <= top[top.length - 1].score) return;
  top.push(hit);
  top.sort((a, b) => b.score - a.score);
  if (top.length > limit) top.length = limit;
}

/**
 * Embebe varios textos con concurrencia acotada. La ingesta era un bucle serial: cada
 * chunk es una llamada HTTP a la API de embeddings, asi que un .txt de 500 KB (~600 chunks)
 * bloqueaba la subida durante minutos. El techo evita lanzar 600 peticiones a la vez.
 */
export async function embedTexts(
  texts: string[],
  concurrency = RAG_INGEST_CONCURRENCY,
): Promise<(number[] | null)[]> {
  const vectors: (number[] | null)[] = new Array(texts.length).fill(null);
  let cursor = 0;
  const workers = Array.from(
    { length: Math.max(1, Math.min(concurrency, texts.length)) },
    async () => {
      for (;;) {
        const index = cursor++;
        if (index >= texts.length) return;
        vectors[index] = await embed(texts[index]);
      }
    },
  );
  await Promise.all(workers);
  return vectors;
}

export class RagService {
  constructor(private readonly db: Store) {}

  async ingestText(
    owner: string,
    sourceId: string,
    sourceName: string,
    text: string,
    maxChunks = RAG_MAX_CHUNKS_PER_SOURCE,
  ) {
    const all = chunkText(text);
    if (all.length === 0) return { chunks: 0, embedded: 0 };
    const chunks = all.slice(0, maxChunks);
    const vectors = await embedTexts(chunks);
    let embedded = 0;
    const now = new Date().toISOString();
    for (let i = 0; i < chunks.length; i += 1) {
      const vec = vectors[i];
      if (vec) embedded += 1;
      const chunk: RagChunk = {
        id: `${sourceId}-${i}`,
        sourceId,
        sourceName,
        chunkIndex: i,
        text: chunks[i],
        embedding: vec,
        createdAt: now,
      };
      await this.db.put(owner, "rag-chunks", chunk);
      if (this.db.pgvectorReady && vec && vec.length === 768) {
        try {
          await this.db.rawQuery(
            "UPDATE records SET embedding = $1::vector WHERE owner = $2 AND kind = 'rag-chunks' AND id = $3",
            [`[${vec.join(",")}]`, owner, chunk.id],
          );
        } catch { /* si el update falla, el chunk queda sin embedding nativo */ }
      }
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
    const queryWords = query
      .toLowerCase()
      .split(/\\W+/)
      .filter((w) => w.length > 2);
    if (!queryVec && !queryWords.length) return [];
    const top: RagHit[] = [];
    let cursorUpdatedAt: string | undefined;
    let cursorId: string | undefined;
    let maxBm25 = 0;
    type Candidate = { hit: RagHit; cosineScore: number; bm25: number };
    const candidates: Candidate[] = [];
    for (;;) {
      const page = await this.db.listPaged<RagChunk>(owner, "rag-chunks", {
        limit: SEARCH_PAGE_SIZE,
        cursorUpdatedAt,
        cursorId,
      });
      if (page.length === 0) break;
      for (const { data: chunk, updatedAt } of page) {
        const cosineScore =
          queryVec && Array.isArray(chunk.embedding) && chunk.embedding.length === queryVec.length
            ? cosine(queryVec, chunk.embedding)
            : 0;
        const bm25 = queryWords.length ? bm25Score(queryWords, chunk.text) : 0;
        if (cosineScore <= 0 && bm25 <= 0) continue;
        if (bm25 > maxBm25) maxBm25 = bm25;
        candidates.push({ hit: { ...chunk, score: 0 }, cosineScore, bm25 });
      }
      const last = page[page.length - 1];
      cursorUpdatedAt = last.updatedAt;
      cursorId = last.data.id;
      if (page.length < SEARCH_PAGE_SIZE) break;
    }
    for (const c of candidates) {
      const bm25Norm = maxBm25 > 0 ? c.bm25 / maxBm25 : 0;
      const hybrid = 0.7 * c.cosineScore + 0.3 * bm25Norm;
      keepTop(top, { ...c.hit, score: hybrid }, limit);
    }
    return top;
  }
  async stats(owner: string) {
    const all = await this.db.list<RagChunk>(owner, "rag-chunks");
    const sources = new Set(all.map((c) => c.sourceId));
    return { chunks: all.length, sources: sources.size };
  }
}
