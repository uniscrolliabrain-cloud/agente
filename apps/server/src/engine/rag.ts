
import { createHash, randomUUID } from "node:crypto";
import type { Store } from "../db.ts";
import { backgroundFailure } from "../log.ts";
import { embed } from "./embeddings.ts";

const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 120;
/** Dimension de text-embedding-004. Fija el cast a vector() de la ruta pgvector. */
const VECTOR_DIMENSIONS = 768;
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
    // Postgres con pgvector resuelve la busqueda en SQL; si no, el recorrido de abajo.
    if (await this.canUseVector()) {
      const hits = await this.searchVector(owner, queryVec, limit);
      if (hits) return hits;
    }
    // Antes esto hacia db.list() -> todos los chunks del owner en memoria y calculaba el
    // coseno de cada vector. Ahora se recorre por keyset (updated_at, id) pagina a pagina y
    // solo se conservan los mejores `limit`: la memoria no crece con el tamano del indice.
    const top: RagHit[] = [];
    let cursorUpdatedAt: string | undefined;
    let cursorId: string | undefined;
    for (;;) {
      const page = await this.db.listPaged<RagChunk>(owner, "rag-chunks", {
        limit: SEARCH_PAGE_SIZE,
        cursorUpdatedAt,
        cursorId,
      });
      if (page.length === 0) break;
      for (const { data: chunk, updatedAt } of page) {
        if (Array.isArray(chunk.embedding) && chunk.embedding.length === queryVec.length)
          keepTop(top, { ...chunk, score: cosine(queryVec, chunk.embedding) }, limit);
      }
      const last = page[page.length - 1];
      cursorUpdatedAt = last.updatedAt;
      cursorId = last.data.id;
      if (page.length < SEARCH_PAGE_SIZE) break;
    }
    return top;
  }

  async stats(owner: string) {
    const all = await this.db.list<RagChunk>(owner, "rag-chunks");
    const sources = new Set(all.map((c) => c.sourceId));
    return { chunks: all.length, sources: sources.size };
  }
}
