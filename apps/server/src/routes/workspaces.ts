// WS_ROUTES_V1 - endpoints del catalogo de workspaces.
import { Hono } from "hono";
import { z } from "zod";
import type { WorkspaceModuleRegistry } from "../engine/workspaces/registry.ts";
import type { WorkspaceDispatcher } from "../engine/workspaces/dispatcher.ts";
import { workspaceCommandEnvelopeSchema, workspaceQueryEnvelopeSchema } from "../../../../packages/workspaces/src/contracts/index.ts";

export function workspacesRoutes(registry: WorkspaceModuleRegistry, dispatcher: WorkspaceDispatcher) {
  const app = new Hono<{ Variables: { owner: string; tenantId: string } }>();

  app.get("/", async (c) => {
    return c.json(registry.list().map((m) => ({
      id: m.manifest.id,
      slug: m.manifest.slug,
      family: m.manifest.family,
      title: m.manifest.title,
      reference: m.manifest.reference,
    })));
  });

  app.get("/:id", async (c) => {
    const m = registry.get(c.req.param("id"));
    if (!m) return c.json({ error: "workspace not found" }, 404);
    return c.json({
      manifest: m.manifest,
      capabilities: m.capabilities.map((x) => x.id),
      views: m.views.map((x) => x.id),
      commands: Object.keys(m.commands),
      queries: Object.keys(m.queries),
    });
  });

  app.post("/:id/command", async (c) => {
    const owner = c.get("owner");
    const tenantId = c.get("tenantId") ?? owner;
    const m = registry.get(c.req.param("id"));
    if (!m) return c.json({ error: "workspace not found" }, 404);
    const body = await c.req.json();
    const envelope = workspaceCommandEnvelopeSchema.parse({
      ...body,
      workspaceId: m.manifest.id,
    });
    const ctx = {
      workspaceId: m.manifest.id,
      tenantId,
      owner,
      actorId: owner,
      actorKind: "user" as const,
      permissions: [],
      correlationId: envelope.id,
    };
    const result = await dispatcher.dispatchCommand(m, ctx, envelope);
    return c.json(result);
  });

  app.post("/:id/query", async (c) => {
    const owner = c.get("owner");
    const tenantId = c.get("tenantId") ?? owner;
    const m = registry.get(c.req.param("id"));
    if (!m) return c.json({ error: "workspace not found" }, 404);
    const body = await c.req.json();
    const envelope = workspaceQueryEnvelopeSchema.parse({
      ...body,
      workspaceId: m.manifest.id,
    });
    const ctx = {
      workspaceId: m.manifest.id,
      tenantId,
      owner,
      actorId: owner,
      actorKind: "user" as const,
      permissions: [],
      correlationId: envelope.id,
    };
    const result = await dispatcher.dispatchQuery(m, ctx, envelope);
    return c.json(result);
  });

  app.get("/:id/capabilities", async (c) => {
    const m = registry.get(c.req.param("id"));
    if (!m) return c.json({ error: "workspace not found" }, 404);
    return c.json(m.capabilities);
  });

  app.get("/:id/views", async (c) => {
    const m = registry.get(c.req.param("id"));
    if (!m) return c.json({ error: "workspace not found" }, 404);
    return c.json(m.views);
  });

  app.get("/:id/events", async (c) => {
    const m = registry.get(c.req.param("id"));
    if (!m) return c.json({ error: "workspace not found" }, 404);
    return c.json({ publishes: m.publishes, consumes: m.consumes });
  });

  return app;
}
