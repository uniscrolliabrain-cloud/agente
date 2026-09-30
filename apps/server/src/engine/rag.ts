
import { createHash, randomUUID } from "node:crypto";
import type { Store } from "../db.ts";
import { backgroundFailure } from "../log.ts";
import { embed } from "./embeddings.ts";

const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 120;
/** Dimension de text-embedding-004. Fija el cast a vector() de la ruta pgvector. */
// VECTOR_DIM_CONFIG — dim de text-embedding-004. Configurable via env para migrar de modelo
// sin tocar codigo.
const VECTOR_DIMENSIONS = Number(process.env.RAG_VECTOR_DIMENSIONS ?? "768") || 768;
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
  private vectorReady: Promise<boolean> | null = null;
  constructor(private readonly db: Store) {}

  /**
   * Postgres real **y** extension pgvector instalada. PGlite nunca llega aqui: su motor no
   * tiene la extension, y tampoco un deployment con la extension puesta en otro esquema.
   * El resultado se cachea: la extension no aparece ni desaparece en caliente.
   */
  private async canUseVector(): Promise<boolean> {
    if (this.db.backend !== "postgres") return false;
    this.vectorReady ??= this.db
      .select<{ extversion: string }>("SELECT extversion FROM pg_extension WHERE extname = 'vector'")
      .then((rows) => rows.length > 0)
      .catch(() => false);
    return this.vectorReady;
  }

  /**
   * Busqueda en SQL con el operador de distancia de pgvector.
   *
   * Los embeddings no viven en una columna `embedding`: `records` es una tabla clave/valor
   * (`data jsonb`) que comparte motor, leases y CAS. Por eso el indice va por expresion y no
   * por columna, y por eso este bloque no migra el esquema:
   *
   *   CREATE EXTENSION IF NOT EXISTS vector;
   *   CREATE INDEX rag_chunks_embedding_ivf ON records
   *     USING ivfflat ((data->'embedding')::vector) WITH (lists = 100);
   *   ANALYZE records;
   *
   * Sin ese indice la consulta sigue siendo correcta (el planner cae a seq-scan) y sin la
   * extension `canUseVector()` devuelve false. Si la consulta falla por cualquier motivo
   * se registra y el llamante vuelve al recorrido en JS: la busqueda nunca se cae.
   */
  private async searchVector(
    owner: string,
    queryVec: number[],
    limit: number,
  ): Promise<RagHit[] | null> {
    // Cast a vector(768) fallaria con otra dimension: mejor caer al bucle que a un error.
    if (queryVec.length !== VECTOR_DIMENSIONS) return null;
    try {
      const rows = await this.db.select<{ data: RagChunk; distance: number }>(
        `SELECT data, (data->'embedding')::vector <=> $2::vector AS distance
           FROM records
          WHERE owner = $1
            AND kind = 'rag-chunks'
            AND jsonb_typeof(data->'embedding') = 'array'
            -- VECTOR_DIM_CHECK — el cast a vector(768) revienta si un chunk tiene otra
            -- dimension (p.ej. 512 de otro modelo). Filtramos por cardinalidad antes.
            AND jsonb_array_length(data->'embedding') = 768
          ORDER BY (data->'embedding')::vector <=> $2::vector
          LIMIT $3`,
        [owner, JSON.stringify(queryVec), limit],
      );
      // pgvector devuelve distancia coseno (0 = identico, 2 = opuesto).
      return rows.map((row) => ({ ...row.data, score: 1 - row.distance }));
    } catch (error) {
      backgroundFailure("rag vector search", error);
      return null;
    }
  }

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
    // Postgres con pgvector resuelve la busqueda en SQL; si no, el recorrido de abajo.
    if (queryVec && (await this.canUseVector())) {
      const hits = await this.searchVector(owner, queryVec, limit);
      if (hits) return hits;
    }
    // Fallback (PGlite o Postgres sin pgvector): coseno + BM25 recorriendo por keyset.
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
