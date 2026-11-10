// WS_ROUTES_V2 - catalogo y ejecucion de vistas de workspace.
import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import type {
  WorkspaceContext,
  WorkspaceQueryEnvelope,
  WorkspaceViewDeclaration,
} from "../../../../packages/workspaces/src/contracts/index.ts";
import type { WorkspaceModuleRegistry } from "../engine/workspaces/registry.ts";
import type { WorkspaceDispatcher } from "../engine/workspaces/dispatcher.ts";
import { workspaceCommandEnvelopeSchema, workspaceQueryEnvelopeSchema } from "../../../../packages/workspaces/src/contracts/index.ts";
import { adaptWorkspaceView } from "../engine/views/workspace-adapter.ts";

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function findView(
  views: readonly WorkspaceViewDeclaration[],
  intent: string | undefined,
): WorkspaceViewDeclaration | undefined {
  if (!intent) return views[0];
  const needle = normalize(intent);
  return (
    views.find((view) => {
      const haystack = normalize(`${view.id} ${view.title} ${view.intent}`);
      return haystack.includes(needle) || needle.includes(normalize(view.title));
    }) ?? views[0]
  );
}

export function workspacesRoutes(registry: WorkspaceModuleRegistry, dispatcher: WorkspaceDispatcher) {
  // WS_TENANT_FROM_CTX_V1 (E17) - `ctx` es lo que deja el middleware de auth
  // en app.ts para toda petición /api/*. `tenantId` solo lo ponen las rutas
  // que resuelven su propio scope (leads, voz).
  const app = new Hono<{
    Variables: { owner: string; tenantId?: string; ctx?: { tenantId?: string } };
  }>();

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
      viewDefinitions: m.views,
      commands: Object.keys(m.commands),
      queries: Object.keys(m.queries),
    });
  });

  // WS_VIEW_EXEC_V1 - ejecuta una declaracion real y devuelve ViewEnvelope.
  app.post("/:id/view", async (c) => {
    const owner = c.get("owner");
    const tenantId = c.get("tenantId") ?? c.get("ctx")?.tenantId;
    // Caer a `owner` producía un envelope con tenantId = uuid del usuario (H11).
    if (!tenantId) return c.json({ error: "Sesion sin empresa resuelta", code: "TENANT_REQUIRED" }, 403);
    const m = registry.get(c.req.param("id"));
    if (!m) return c.json({ error: "workspace not found" }, 404);
    const body = z
      .object({
        viewId: z.string().min(1).max(200).optional(),
        intent: z.string().max(500).optional(),
        entityId: z.string().max(200).optional(),
      })
      .parse(await c.req.json().catch(() => ({})));
    const declaration = body.viewId
      ? m.views.find((view) => view.id === body.viewId)
      : findView(m.views, body.intent);
    if (!declaration) return c.json({ error: "view not found" }, 404);

    const context: WorkspaceContext = {
      workspaceId: m.manifest.id,
      tenantId,
      owner,
      actorId: owner,
      actorKind: "user",
      permissions: [],
      correlationId: randomUUID(),
    };
    const envelope: WorkspaceQueryEnvelope = {
      id: randomUUID(),
      workspaceId: m.manifest.id,
      query: declaration.query,
      version: 1,
      parameters: body.entityId ? { entityId: body.entityId } : {},
      limit: 50,
    };
    const result = await dispatcher.dispatchQuery(m, context, envelope);
    if (result.status === "forbidden") {
      return c.json({ error: "No tienes permiso para ver esta vista" }, 403);
    }
    const view = adaptWorkspaceView({
      tenantId,
      workspaceId: m.manifest.id,
      declaration,
      result,
      ...(body.entityId ? { entityId: body.entityId } : {}),
    });
    if (!view) return c.json({ error: "La vista no se pudo normalizar" }, 422);
    return c.json({ view });
  });

  app.post("/:id/command", async (c) => {
    const owner = c.get("owner");
    const tenantId = c.get("tenantId") ?? c.get("ctx")?.tenantId;
    // Caer a `owner` producía un envelope con tenantId = uuid del usuario (H11).
    if (!tenantId) return c.json({ error: "Sesion sin empresa resuelta", code: "TENANT_REQUIRED" }, 403);
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
    const tenantId = c.get("tenantId") ?? c.get("ctx")?.tenantId;
    // Caer a `owner` producía un envelope con tenantId = uuid del usuario (H11).
    if (!tenantId) return c.json({ error: "Sesion sin empresa resuelta", code: "TENANT_REQUIRED" }, 403);
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
