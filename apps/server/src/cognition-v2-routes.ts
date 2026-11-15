import { Hono, type Context } from "hono";
import { z } from "zod";
import { contextRequestV2Schema, memoryKindSchema } from "../../../packages/domain/src/cognition-v2.ts";
import type { CognitionV2Runtime } from "./engine/cognition/v2/runtime.ts";
import { AppError } from "./errors.ts";
type Vars = { owner: string; ctx?: { tenantId: string; actorId: string } };
export function cognitionV2Routes(runtime: CognitionV2Runtime) {
  const app = new Hono<{ Variables: Vars }>();
  const identity = async (c: Context<{ Variables: Vars }>) => {
    const ctx = c.get("ctx");
    if (!ctx) throw new AppError("Sesion requerida", 401);
    try { return await runtime.identity(ctx.tenantId, ctx.actorId, c.get("owner"), "chat"); }
    catch { throw new AppError("Acceso denegado", 403); }
  };
  app.post("/rag/prepare", async (c) => {
    const actor = await identity(c);
    const input = z.strictObject({ query: z.string().min(1).max(4000) }).parse(await c.req.json());
    if (!runtime.preparedRag) return c.json({ error: "Fuente no configurada" }, 503);
    return c.json(await runtime.preparedRag.prepare(actor, input.query));
  });
  app.post("/working", async (c) => {
    const actor = await identity(c);
    const input = z.strictObject({ body: z.string().min(1).max(4000) }).parse(await c.req.json());
    return c.json(await runtime.memories.working(actor, input.body, 300000), 202);
  });
  app.get("/memories", async (c) => c.json(await runtime.memories.recall(await identity(c), memoryKindSchema.parse(c.req.query("kind")))));
  app.post("/attention", async (c) => {
    const input = contextRequestV2Schema.parse(await c.req.json());
    return c.json(await runtime.attention.select(await identity(c), input.query, input.maxTokens));
  });
  app.get("/graph/:id", async (c) => {
    const { CognitiveGraphQuery } = await import("./engine/cognition/v2/graph.ts");
    const result = await new CognitiveGraphQuery(runtime.context).neighbors(await identity(c), c.req.param("id"), 2);
    return result ? c.json(result) : c.json({ error: "No disponible" }, 404);
  });
  app.delete("/references/:id", async (c) => {
    const actor = await identity(c);
    const source = await runtime.context.resolve(actor, c.req.param("id"));
    if (!source) return c.json({ error: "No disponible" }, 404);
    const event = { id: `revoke:${source.id}:${source.revision}`, tenantId: actor.tenantId, owner: actor.actorId,
      schemaVersion: "1.0" as const, type: "cognition.v2.source.revoked" as const,
      source: { kind: "system" as const, id: "authorized-revocation" }, emittedAt: new Date().toISOString(), payload: { sourceId: source.id } };
    await runtime.db.transaction(async () => {
      await runtime.context.assertAuthorized(actor, source);
      await runtime.context.projections.revoke(actor.tenantId, source.id);
      await runtime.sink.write(event);
    });
    return c.json({ revoked: true });
  });
  app.post("/snapshots", async (c) => c.json(await runtime.context.getSnapshot(await identity(c), contextRequestV2Schema.parse(await c.req.json()))));
  app.get("/snapshots/:id", async (c) => {
    const result = await runtime.context.readSnapshot(await identity(c), c.req.param("id"));
    return result ? c.json(result) : c.json({ error: "No disponible" }, 404);
  });
  app.get("/references/:id", async (c) => {
    const result = await runtime.context.resolve(await identity(c), c.req.param("id"));
    return result ? c.json(result) : c.json({ error: "No disponible" }, 404);
  });
  app.post("/slow", async (c) => {
    const actor = await identity(c);
    const input = z.strictObject({ prompt: z.string().min(1).max(4000), snapshotId: z.string().min(1).max(200), key: z.string().min(1).max(200) }).parse(await c.req.json());
    const snapshot = await runtime.context.readSnapshot(actor, input.snapshotId);
    if (!snapshot?.refs.length) return c.json({ error: "Contexto autorizado requerido" }, 409);
    const evidence = [];
    for (const ref of snapshot.refs) {
      const record = await runtime.context.resolve(actor, ref.id, ref.revision);
      if (record?.kind === "card" || record?.kind === "memory") evidence.push({ tenantId: actor.tenantId, kind: record.kind, id: ref.id, revision: ref.revision });
    }
    const job = await runtime.slow.enqueue({ identity: actor, prompt: input.prompt, evidence }, input.key);
    return c.json(job, 202);
  });
  app.post("/slow/:id/cancel", async (c) => c.json({ cancelled: await runtime.slow.cancel(await identity(c), c.req.param("id")) }));
  app.get("/journey", async (c) => {
    const { presentCognitiveJourney } = await import("./engine/cognition/v2/presenter.ts");
    return c.json(await presentCognitiveJourney(runtime.context, await identity(c), c.req.query("after") ?? "0"));
  });
  // Delivery ACK is deliberately internal to the verified consumer boundary.
  return app;
}
