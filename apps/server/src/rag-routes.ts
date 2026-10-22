import { Hono } from "hono";
import { z } from "zod";
import type { RagService } from "./engine/rag.ts";
import type { Store } from "./db.ts";
import type { Files } from "./files.ts";
import { embeddingsConfigured } from "./engine/embeddings.ts";
import { AppError } from "./errors.ts";
import type { RateLimiter } from "./rate-limit.ts";

export function ragRoutes(rag: RagService, db: Store, files: Files, limiter: RateLimiter) {
  const app = new Hono<{ Variables: { owner: string } }>();

  // RAG_SOURCES_LIST_V1 - lista de fuentes con conteo de chunks.
  app.get("/sources", async (c) => {
    const owner = c.get("owner");
    // RAG_SOURCES_LIST_PAGED_V1
    const all = await db.list<{ id: string; sourceId: string; sourceName: string; createdAt: string }>(
      owner,
      "rag-chunks",
      { limit: 20000 },
    );
    const grouped = new Map<string, { sourceId: string; sourceName: string; chunks: number; firstAt: string }>();
    for (const chunk of all) {
      const existing = grouped.get(chunk.sourceId);
      if (existing) existing.chunks++;
      else grouped.set(chunk.sourceId, { sourceId: chunk.sourceId, sourceName: chunk.sourceName, chunks: 1, firstAt: chunk.createdAt });
    }
    return c.json({ sources: [...grouped.values()].sort((a, b) => b.chunks - a.chunks) });
  });

  app.get("/status", async (c) => {
    const stats = await rag.stats(c.get("owner"));
    return c.json({ configured: embeddingsConfigured(), ...stats });
  });

  // RAG_INGEST_RATE_LIMIT_V1
  app.post("/ingest", async (c) => {
    if (!embeddingsConfigured())
      throw new AppError("Embeddings no configurados. Falta GEMINI_API_KEY.", 503);
    const body = z
      .object({
        sourceId: z.string().min(1).max(200),
        sourceName: z.string().min(1).max(500),
        text: z.string().min(1).max(2_000_000),
      })
      .parse(await c.req.json());
    const result = await rag.ingestText(c.get("owner"), body.sourceId, body.sourceName, body.text);
    return c.json(result, 201);
  });

  // TAKE_FOR_TENANT_RAG_V1 - un intento por tenant+owner antes de buscar.
  // Deuda Fase 6: usar tenantService cuando este cableado aqui.
  app.get("/search", async (c) => {
    const owner = c.get("owner");
    const verdict = limiter.takeForTenant(owner, owner, "rag.search");
    if (!verdict.allowed) {
      const retrySec = Math.max(1, Math.ceil(verdict.retryAfterMs / 1000));
      c.header("Retry-After", String(retrySec));
      throw new AppError("Limite de busquedas alcanzado. Prueba en " + retrySec + "s.", 429);
    }
    const query = z.string().min(1).max(1000).parse(c.req.query("q"));
    const limit = Math.min(Number(c.req.query("limit") ?? "5") || 5, 20);
    const hits = await rag.search(owner, query, limit);
    return c.json({ hits });
  });

  // REINGEST_ENDPOINT â€” reingesta server-side sin round-trip al navegador.
  app.post("/reingest/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const file = await db.get<{ name: string }>(owner, "files", id);
    if (!file) throw new AppError("File not found", 404);
    const bytes = await files.bytes(owner, id);
    const text = new TextDecoder("utf-8").decode(bytes);
    if (!text.trim()) throw new AppError("El archivo no tiene texto indexable", 422);
    await rag.ingestText(owner, id, file.name, text);
    return c.json({ ok: true });
  });
  // REINGEST_ENDPOINT_V1 - reingesta server-side sin round-trip al navegador.
  app.post("/reingest/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const file = await db.get<{ name: string }>(owner, "files", id);
    if (!file) throw new AppError("File not found", 404);
    const bytes = await files.bytes(owner, id);
    const text = new TextDecoder("utf-8").decode(bytes);
    if (!text.trim()) throw new AppError("El archivo no tiene texto indexable", 422);
    await rag.ingestText(owner, id, file.name, text);
    return c.json({ ok: true });
  });

  app.delete("/source/:id", async (c) => {
    await rag.removeSource(c.get("owner"), c.req.param("id"));
    return c.json({ ok: true });
  });

  return app;
}
