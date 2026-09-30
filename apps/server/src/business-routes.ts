import { Hono } from "hono";
import { z } from "zod";
import { AppError } from "./errors.ts";
import type { BusinessGraph } from "./engine/business/graph.ts";
import type { BusinessTruth } from "./engine/business/truth.ts";
import type { WorkspaceRegistry } from "./engine/workspace/registry.ts";
import { businessEntitySchema } from "../../../packages/domain/src/business.ts";

// BUSINESS_ROUTES_V1 — HTTP para el Business Graph. Todo scoped por owner.

const createEntityBody = z.object({
  id: z.string().min(1).max(200).optional(),
  type: z.string().min(1).max(100),
  name: z.string().min(1).max(300),
  status: z.string().max(100).optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
  actor: z.string().min(1).max(200).default("user"),
  source: z.string().min(1).max(200).default("api"),
  confidence: z.number().min(0).max(1).optional(),
});

const updateEntityBody = z.object({
  name: z.string().min(1).max(300).optional(),
  status: z.string().max(100).optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
  actor: z.string().min(1).max(200).default("user"),
  source: z.string().min(1).max(200).default("api"),
  confidence: z.number().min(0).max(1).optional(),
});

const createRelationBody = z.object({
  id: z.string().min(1).max(200).optional(),
  fromEntityId: z.string().min(1).max(200),
  toEntityId: z.string().min(1).max(200),
  type: z.string().min(1).max(100),
  properties: z.record(z.string(), z.unknown()).optional(),
  actor: z.string().min(1).max(200).default("user"),
  source: z.string().min(1).max(200).default("api"),
});

export function businessRoutes(
  graph: BusinessGraph,
  truth: BusinessTruth,
  workspaceRegistry: WorkspaceRegistry,
) {
  const app = new Hono<{ Variables: { owner: string } }>();

  app.get("/entities", async (c) => {
    const type = c.req.query("type");
    return c.json({ entities: await graph.listEntities(c.get("owner"), type) });
  });

  app.get("/entities/:id", async (c) => {
    const entity = await graph.getEntity(c.get("owner"), c.req.param("id"));
    if (!entity) throw new AppError("Entity not found", 404);
    return c.json(entity);
  });

  app.get("/entities/:id/truth", async (c) => {
    const value = await truth.forEntity(c.get("owner"), c.req.param("id"));
    if (!value) throw new AppError("Entity not found", 404);
    return c.json(value);
  });

  app.get("/entities/:id/neighborhood", async (c) => {
    const depth = z.coerce.number().int().min(1).max(3).default(1).parse(c.req.query("depth") ?? "1");
    return c.json(await graph.neighborhood(c.get("owner"), c.req.param("id"), depth));
  });

  app.post("/entities", async (c) => {
    const body = createEntityBody.parse(await c.req.json());
    return c.json(await graph.createEntity(c.get("owner"), body), 201);
  });

  app.patch("/entities/:id", async (c) => {
    const body = updateEntityBody.parse(await c.req.json());
    return c.json(await graph.updateEntity(c.get("owner"), c.req.param("id"), body));
  });

  app.delete("/entities/:id", async (c) => {
    await graph.deleteEntity(c.get("owner"), c.req.param("id"), "user");
    return c.json({ ok: true });
  });

  app.get("/relations", async (c) => {
    return c.json({
      relations: await graph.listRelations(c.get("owner"), c.req.query("entityId")),
    });
  });

  app.post("/relations", async (c) => {
    const body = createRelationBody.parse(await c.req.json());
    return c.json(await graph.createRelation(c.get("owner"), body), 201);
  });

  app.get("/workspace-templates", async (c) => {
    void c;
    return c.json({ templates: workspaceRegistry.all() });
  });

  app.get("/workspace-templates/:roleId", async (c) => {
    return c.json(workspaceRegistry.forRole(c.req.param("roleId")));
  });

  // Validacion de entidad publica: util para el frontend antes de enviar.
  app.post("/validate-entity", async (c) => {
    const body = await c.req.json();
    const result = businessEntitySchema.safeParse(body);
    if (!result.success)
      return c.json({ valid: false, issues: result.error.issues }, 422);
    return c.json({ valid: true });
  });

  return app;
}
