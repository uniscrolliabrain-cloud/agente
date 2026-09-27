import { Hono } from "hono";
import { z } from "zod";
import type { RagService } from "./engine/rag.ts";
import { embeddingsConfigured } from "./engine/embeddings.ts";
import { AppError } from "./errors.ts";

export function ragRoutes(rag: RagService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  app.get("/status", async (c) => {
    const stats = await rag.stats(c.get("owner"));
    return c.json({ configured: embeddingsConfigured(), ...stats });
  });

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

  app.get("/search", async (c) => {
    const query = z.string().min(1).max(1000).parse(c.req.query("q"));
    const limit = Math.min(Number(c.req.query("limit") ?? "5") || 5, 20);
    const hits = await rag.search(c.get("owner"), query, limit);
    return c.json({ hits });
  });

  app.delete("/source/:id", async (c) => {
    await rag.removeSource(c.get("owner"), c.req.param("id"));
    return c.json({ ok: true });
  });

  return app;
}
