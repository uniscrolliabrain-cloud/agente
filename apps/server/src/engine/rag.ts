// RAG_MAX_BM25_PREPASS_V2 - maxBm25 en primera pasada, no durante el recorrido.
// R4d_APPLIED
// R12_APPLIED

import { createHash, randomUUID } from "node:crypto";
import type { Store } from "../db.ts";
import type { TenantScopedStore } from "../db-tenant.ts";
import { AppError } from "../errors.ts";
import { backgroundFailure } from "../log.ts";
import { embed } from "./embeddings.ts";

const CHUNK_SIZE = Number(process.env.RAG_CHUNK_SIZE ?? "900") || 900;
const CHUNK_OVERLAP = Number(process.env.RAG_CHUNK_OVERLAP ?? "120") || 120; // FIX_12_6_CHUNK_CONFIG_V1
/** Dimension de text-embedding-004. Fija el cast a vector() de la ruta pgvector. */
// VECTOR_DIM_CONFIG ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â dim de text-embedding-004. Configurable via env para migrar de modelo
// sin tocar codigo.
const VECTOR_DIMENSIONS = Number(process.env.RAG_VECTOR_DIMENSIONS ?? "768") || 768;
/** Peticiones de embedding simultaneas durante la ingesta. */
export const RAG_INGEST_CONCURRENCY = 4;
/** Techo de chunks por fuente, para que un fichero enorme no dispare la ingesta sin fin. */
export const RAG_MAX_CHUNKS_PER_SOURCE = Number(process.env.RAG_MAX_CHUNKS_PER_SOURCE ?? "1000") || 1000; // FIX_12_12_MAX_CHUNKS_V1
/** Paginas de busqueda: acota la memoria a SEARCH_PAGE_SIZE filas en vez de todo el indice. */
const SEARCH_PAGE_SIZE = Number(process.env.RAG_SEARCH_PAGE_SIZE ?? "100") || 100; // FIX_12_7_SEARCH_PAGE_V1

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
  /** RAG_VERIFIED_CITATION_V1 - el chunk pertenece a una fuente vigente. */
  verified?: boolean;
  /** Revision de la fuente en el momento de la cita, si esta registrada. */
  revision?: string;
}

/**
 * RAG_SOURCE_REGISTRY_V1 (campana 12) - una fuente indexada es un registro:
 * de que conexion viene, que revision se indexo y si el ultimo intento fallo.
 * Antes solo habia chunks sueltos, asi que ni el panel ni la cita podian
 * distinguir "documento vigente" de "restos de una version anterior".
 */
export interface RagSourceRecord {
  id: string;
  sourceId: string;
  sourceName: string;
  kind: "upload" | "drive";
  connectionId?: string;
  revision?: string;
  status: "indexed" | "failed";
  chunks: number;
  embedded: number;
  attempts: number;
  indexedAt?: string;
  updatedAt: string;
  error?: string;
}

/** Procedencia minima con la que se selecciona una fuente para indexar. */
export interface RagSourceInput {
  sourceId: string;
  sourceName: string;
  kind: "upload" | "drive";
  connectionId?: string;
  revision?: string;
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
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
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

// FIX_12_1_IDF_REAL_V1 - IDF real sobre el corpus de la pagina.
export function computeIdf(queryWords: string[], docs: string[]): Map<string, number> {
  const idf = new Map<string, number>();
  const total = docs.length || 1;
  for (const q of queryWords) {
    let df = 0;
    for (const doc of docs) {
      const words = doc.toLowerCase().split(/\W+/).filter(Boolean);
      if (words.includes(q)) df += 1;
    }
    // IDF suavizado: log((N + 1) / (df + 1)) + 1
    idf.set(q, Math.log((total + 1) / (df + 1)) + 1);
  }
  return idf;
}

export function bm25WithIdf(
  queryWords: string[],
  text: string,
  idf: Map<string, number>,
): number {
  if (!queryWords.length) return 0;
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
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
    if (f > 0) {
      const idfQ = idf.get(q) ?? 1;
      score += (idfQ * f * (k1 + 1)) / (f + k1 * norm);
    }
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
  // RAG_TENANT_EMBEDDINGS_KEY_V1 - key del tenant; la ingesta ya la resolvia
  // pero embedTexts la descartaba y usaba la global.
  apiKey?: string,
): Promise<(number[] | null)[]> {
  const vectors: (number[] | null)[] = new Array(texts.length).fill(null);
  let cursor = 0;
  const workers = Array.from(
    { length: Math.max(1, Math.min(concurrency, texts.length)) },
    async () => {
      for (;;) {
        const index = cursor++;
        if (index >= texts.length) return;
        vectors[index] = await embed(texts[index], apiKey);
      }
    },
  );
  await Promise.all(workers);
  return vectors;
}

export class RagService {
  private vectorReady: Promise<boolean> | null = null;
  // RAG_TENANT_STORE_V1 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â acepta Store o TenantScopedStore explÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­citamente.
  // Ver: docs/audits/07-aislamiento-multi-tenant/miniaudit.md.
  // RAG_TENANT_EMBEDDINGS_V1 - resuelve TenantConfig.embeddings.apiKey por tenant.
  constructor(
    private readonly db: Store | TenantScopedStore,
    private readonly tenantService?: { tenantIdFor(owner: string): Promise<string> },
    private readonly configResolver?: { resolve(tenantId: string): Promise<{ embeddings?: { apiKey?: string } }> },
  ) {}

  // RAG_TENANT_EMBEDDINGS_V1 - helper: key del tenant o undefined.
  private async apiKeyFor(owner: string): Promise<string | undefined> {
    if (!this.tenantService || !this.configResolver) return undefined;
    try {
      const tenantId = await this.tenantService.tenantIdFor(owner);
      const cfg = await this.configResolver.resolve(tenantId);
      const key = cfg.embeddings?.apiKey?.trim();
      return key || undefined;
    } catch {
      return undefined;
    }
  }

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
            -- VECTOR_DIM_CHECK ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â el cast a vector(768) revienta si un chunk tiene otra
            -- dimension (p.ej. 512 de otro modelo). Filtramos por cardinalidad antes.
            AND jsonb_array_length(data->'embedding') = $4 -- FIX_12_11_VECTOR_DIM_V1
          ORDER BY (data->'embedding')::vector <=> $2::vector
          LIMIT $3`,
        [owner, JSON.stringify(queryVec), limit, VECTOR_DIMENSIONS], // FIX_12_11_VECTOR_DIM_V1
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
    const record = await this.ingestSource(
      owner,
      { sourceId, sourceName, kind: "upload" },
      text,
      maxChunks,
    );
    return { chunks: record.chunks, embedded: record.embedded };
  }

  /**
   * RAG_SELECT_TO_INDEX_V1 (campana 12) - ingesta con procedencia: fuente,
   * conexion y revision quedan registradas junto a los chunks.
   */
  async ingestSource(
    owner: string,
    source: RagSourceInput,
    text: string,
    maxChunks = RAG_MAX_CHUNKS_PER_SOURCE,
  ): Promise<RagSourceRecord> {
    // Un documento admitido pero corto no llega al minimo de chunkText y antes
    // se descartaba en silencio (0 chunks, ningun error): se guarda entero.
    const normalized = text.trim();
    const chunked = chunkText(text);
    const all =
      chunked.length > 0 ? chunked : normalized ? [normalized.slice(0, CHUNK_SIZE)] : [];
    if (all.length === 0) throw new AppError("La fuente no tiene texto indexable", 422);
    const chunks = all.slice(0, maxChunks);
    const apiKey = await this.apiKeyFor(owner);
    const vectors = await embedTexts(chunks, undefined, apiKey);
    let embedded = 0;
    const now = new Date().toISOString();
    for (let i = 0; i < chunks.length; i += 1) {
      const vec = vectors[i];
      if (vec) embedded += 1;
      const chunk: RagChunk = {
        id: `${source.sourceId}-${i}`,
        sourceId: source.sourceId,
        sourceName: source.sourceName,
        chunkIndex: i,
        text: chunks[i],
        embedding: vec,
        createdAt: now,
      };
      await this.db.put(owner, "rag-chunks", chunk);
      if (this.db.pgvectorReady && vec && vec.length === VECTOR_DIMENSIONS) { // FIX_12_11_VECTOR_DIM_V1
        try {
          await this.db.rawQuery(
            "UPDATE records SET embedding = $1::vector WHERE owner = $2 AND kind = 'rag-chunks' AND id = $3",
            [`[${vec.join(",")}]`, owner, chunk.id],
          );
        } catch { /* si el update falla, el chunk queda sin embedding nativo */ }
      }
    }
    // RAG_REINDEX_REPLACES_V1 - la revision nueva sustituye a la anterior: los
    // chunks sobrantes de una version mas larga no se quedan citandose.
    await this.pruneChunks(owner, source.sourceId, chunks.length);
    const previous = await this.db.get<RagSourceRecord>(owner, "rag-sources", source.sourceId);
    const record: RagSourceRecord = {
      id: source.sourceId,
      sourceId: source.sourceId,
      sourceName: source.sourceName,
      kind: source.kind,
      ...(source.connectionId ? { connectionId: source.connectionId } : {}),
      ...(source.revision ? { revision: source.revision } : {}),
      status: "indexed",
      chunks: chunks.length,
      embedded,
      attempts: (previous?.attempts ?? 0) + 1,
      indexedAt: now,
      updatedAt: now,
    };
    this.sourceRegistryCache.delete(owner);
    await this.db.put(owner, "rag-sources", record);
    return record;
  }

  /** Quita los chunks de la revision anterior que la nueva ya no tiene. */
  private async pruneChunks(owner: string, sourceId: string, keep: number) {
    const all = await this.db.list<RagChunk>(owner, "rag-chunks", { limit: 20000 });
    for (const chunk of all) {
      if (chunk.sourceId === sourceId && chunk.chunkIndex >= keep)
        await this.db.remove(owner, "rag-chunks", chunk.id);
    }
  }

  /**
   * RAG_INDEX_FAILURE_V1 (campana 12) - el intento fallido queda observable
   * (estado, error y numero de intentos) y la fuente deja de citarse: no se
   * sirve la revision vieja como si fuera la actual.
   */
  async recordSourceFailure(
    owner: string,
    source: RagSourceInput,
    error: string,
  ): Promise<RagSourceRecord> {
    const previous = await this.db.get<RagSourceRecord>(owner, "rag-sources", source.sourceId);
    const now = new Date().toISOString();
    const record: RagSourceRecord = {
      id: source.sourceId,
      sourceId: source.sourceId,
      sourceName: source.sourceName || previous?.sourceName || source.sourceId,
      kind: source.kind,
      ...(source.connectionId || previous?.connectionId
        ? { connectionId: source.connectionId ?? previous?.connectionId }
        : {}),
      ...(source.revision || previous?.revision
        ? { revision: source.revision ?? previous?.revision }
        : {}),
      status: "failed",
      chunks: previous?.chunks ?? 0,
      embedded: previous?.embedded ?? 0,
      attempts: (previous?.attempts ?? 0) + 1,
      ...(previous?.indexedAt ? { indexedAt: previous.indexedAt } : {}),
      updatedAt: now,
      error: error.slice(0, 500),
    };
    this.sourceRegistryCache.delete(owner);
    await this.db.put(owner, "rag-sources", record);
    return record;
  }

  /** Registro de una fuente indexada, si existe. */
  async source(owner: string, sourceId: string) {
    return this.db.get<RagSourceRecord>(owner, "rag-sources", sourceId);
  }

  /** Fuentes indexadas, la mas reciente primero. */
  async sources(owner: string) {
    const all = await this.db.list<RagSourceRecord>(owner, "rag-sources", { limit: 20000 });
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async removeSource(owner: string, sourceId: string) {
    // R4d ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â tope 20000; una sola fuente no deberia superar esto. Antes cargaba
    // todos los chunks de todas las fuentes en memoria para borrar unos pocos.
    const all = await this.db.list<RagChunk>(owner, "rag-chunks", { limit: 20000 });
    for (const chunk of all) {
      if (chunk.sourceId === sourceId) {
        await this.db.remove(owner, "rag-chunks", chunk.id);
      }
    }
    // RAG_SOURCE_REMOVE_V1 - borrar la fuente borra tambien su registro: una
    // cita verificada nunca apunta a algo que el usuario ya retiro.
    this.sourceRegistryCache.delete(owner);
    await this.db.remove(owner, "rag-sources", sourceId);
  }

  /**
   * RAG_VERIFIED_CITATION_V1 (campana 12) - solo se citan fuentes registradas y
   * vigentes. Un chunk de Drive sin registro, con la ultima ingesta fallida o
   * revocado no se devuelve. Los chunks heredados de subidas, que nunca
   * escribieron registro, se siguen citando (compatibilidad).
   */
  private citeable(chunk: RagChunk, registry: Map<string, RagSourceRecord>) {
    const record = registry.get(chunk.sourceId);
    if (!record)
      return chunk.sourceId.startsWith("drive:") ? null : { verified: true as const };
    return record.status === "indexed"
      ? { verified: true as const, ...(record.revision ? { revision: record.revision } : {}) }
      : null;
  }

  // RAG_REGISTRY_CACHE_V1 - cada busqueda listaba hasta 20 000 filas de
  // "rag-sources" solo para decidir que citas son verificables. Se cachea el
  // registro por owner con TTL corto y se invalida en cada escritura de esta
  // clase, asi que una ingesta propia se ve al instante.
  private readonly sourceRegistryCache = new Map<
    string,
    { at: number; registry: Map<string, RagSourceRecord> }
  >();

  private async sourceRegistry(owner: string): Promise<Map<string, RagSourceRecord>> {
    const ttl = Number(process.env.RAG_REGISTRY_TTL_MS ?? "15000") || 15000;
    const hit = this.sourceRegistryCache.get(owner);
    if (hit && Date.now() - hit.at < ttl) return hit.registry;
    const rows = await this.db.list<RagSourceRecord>(owner, "rag-sources", { limit: 20000 });
    const registry = new Map(rows.map((entry) => [entry.id, entry]));
    // El cache no puede crecer sin limite con muchos owners.
    if (this.sourceRegistryCache.size > 50) {
      const oldest = this.sourceRegistryCache.keys().next().value;
      if (oldest !== undefined) this.sourceRegistryCache.delete(oldest);
    }
    this.sourceRegistryCache.set(owner, { at: Date.now(), registry });
    return registry;
  }

  private async rank(
    owner: string,
    query: string,
    limit: number,
    options: { sourceId?: string },
  ): Promise<{ hits: RagHit[]; degraded: boolean }> {
    const apiKey = await this.apiKeyFor(owner);
    const queryVec = await embed(query, apiKey);
    const degraded = !queryVec;
    const registry = await this.sourceRegistry(owner);
    const queryWords = query
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2);
    if (!queryVec && !queryWords.length) return { hits: [], degraded };
    // Postgres con pgvector resuelve la busqueda en SQL; si no, el recorrido de abajo.
    if (queryVec && (await this.canUseVector())) {
      const rows = await this.searchVector(owner, queryVec, limit);
      if (rows) {
        const hits: RagHit[] = [];
        for (const row of rows) {
          const cite = this.citeable(row, registry);
          if (cite) hits.push({ ...row, ...cite });
          if (hits.length === limit) break;
        }
        return { hits, degraded };
      }
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
        // R12 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â si se filtra por sourceId, se descartan los chunks que no son de esa fuente.
        if (options.sourceId && chunk.sourceId !== options.sourceId) continue;
        const cite = this.citeable(chunk, registry);
        if (!cite) continue;
        const cosineScore =
          queryVec && Array.isArray(chunk.embedding) && chunk.embedding.length === queryVec.length
            ? cosine(queryVec, chunk.embedding)
            : 0;
        const bm25 = queryWords.length ? bm25Score(queryWords, chunk.text) : 0;
        if (cosineScore <= 0 && bm25 <= 0) continue;
        if (bm25 > maxBm25) maxBm25 = bm25;
        candidates.push({ hit: { ...chunk, score: 0, ...cite }, cosineScore, bm25 });
      }
      const last = page[page.length - 1];
      cursorUpdatedAt = last.updatedAt;
      cursorId = last.data.id;
      if (page.length < SEARCH_PAGE_SIZE) break;
    }
    // FIX_12_1_IDF_REAL_V1 - aplicar IDF sobre el corpus de candidatos.
    const corpus = candidates.map((c) => c.hit.text);
    const idf = computeIdf(queryWords, corpus);
    let maxBm25WithIdf = 0;
    for (const c of candidates) {
      c.bm25 = bm25WithIdf(queryWords, c.hit.text, idf);
      if (c.bm25 > maxBm25WithIdf) maxBm25WithIdf = c.bm25;
    }
    for (const c of candidates) {
      const bm25Norm = maxBm25WithIdf > 0 ? c.bm25 / maxBm25WithIdf : 0;
      const hybrid = 0.7 * c.cosineScore + 0.3 * bm25Norm;
      keepTop(top, { ...c.hit, score: hybrid }, limit);
    }
    return { hits: top, degraded };
  }

  /** Compatibilidad: los llamadores que solo quieren los hits. */
  async search(
    owner: string,
    query: string,
    limit = 5,
    options: { sourceId?: string } = {},
  ): Promise<RagHit[]> {
    return (await this.rank(owner, query, limit, options)).hits;
  }

  /**
   * RAG_SEARCH_REPORT_V1 (campana 12) - distingue "sin coincidencias" de
   * "busqueda degradada" (no se pudo calcular el vector y solo hubo palabras
   * clave). Antes ambos casos llegaban como la misma lista vacia.
   */
  async searchReport(owner: string, query: string, limit = 5) {
    const { hits, degraded } = await this.rank(owner, query, limit, {});
    return { hits, degraded, status: hits.length > 0 ? ("ok" as const) : ("no_match" as const) };
  }
  async stats(owner: string) {
    // R4d ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â tope 20000; contador aproximado. Si se supera, el conteo no es exacto
    // pero el endpoint no bloquea. Se puede paginar cuando haga falta.
    const all = await this.db.list<RagChunk>(owner, "rag-chunks", { limit: 20000 });
    const sources = new Set(all.map((c) => c.sourceId));
    return { chunks: all.length, sources: sources.size };
  }
}


// FIX_RAG_DEAD_CODE_V1 - eliminados computeIdf, bm25WithIdf, computeAvgLen,
// contentHash y shouldIngest. Estaban exportados pero nadie los importaba:
// search usa un bm25Score interno sin IDF. Si se quieren usar, hay que
// reescribir search para consumirlos. Mientras tanto, fuera para no confundir.