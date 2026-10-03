// ADMIN_ROUTES_V1 - endpoints de admin para observabilidad.

import { Hono } from "hono";
import { z } from "zod";
import { AppError } from "./errors.ts";
import type { AgentService } from "./engine/service.ts";
import { UserService } from "./users.ts";

export function adminRoutes(service: AgentService, users: UserService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  const requireAdmin = async (owner: string) => {
    const user = await users.getById(owner);
    if (!user || user.role !== "admin") throw new AppError("Solo admin", 403);
  };

  app.get("/tenants/:tenantId/usage", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const usage = await service.usageSummary(tenantId);
    return c.json(usage);
  });

  app.get("/tenants/:tenantId/feedback", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const feedback = await service.db.list(tenantId, "feedback");
    return c.json({ feedback });
  });

  // ADMIN_FEEDBACK_POST_V1 - registrar feedback desde el admin.
  app.post("/tenants/:tenantId/feedback", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const body = z.object({
      goalId: z.string().max(200).optional(),
      taskId: z.string().max(200).optional(),
      rating: z.enum(["useful", "not_useful", "neutral"]),
      comment: z.string().max(2000).optional(),
    }).parse(await c.req.json());
    const entry = {
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tenantId,
      owner,
      ...body,
      createdAt: new Date().toISOString(),
    };
    await service.db.put(tenantId, "feedback", entry);
    return c.json(entry, 201);
  });

  // ADMIN_FEEDBACK_AGG_V1 - resumen agregado.
  app.get("/tenants/:tenantId/feedback/aggregate", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const all = await service.db.list<{ rating: string }>(tenantId, "feedback");
    return c.json({
      tenantId,
      total: all.length,
      useful: all.filter((f) => f.rating === "useful").length,
      notUseful: all.filter((f) => f.rating === "not_useful").length,
      neutral: all.filter((f) => f.rating === "neutral").length,
    });
  });

  // ADMIN_CAPS_V1 - lista de capabilities del sistema.
  app.get("/system/capabilities", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const list = await service.capabilities.list();
    return c.json({ capabilities: list });
  });

  // ADMIN_APPROVALS_V1 - lista de aprobaciones pendientes por tenant.
  app.get("/tenants/:tenantId/approvals", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const approvals = await service.db.list(tenantId, "approval-requests");
    return c.json({ approvals });
  });

  // ADMIN_BUSINESS_SCHEMA_V1 - guarda el schema de negocio por tenant.
  app.put("/tenants/:tenantId/business-schema", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const body = z.object({
      entities: z.array(z.unknown()).max(200).default([]),
      relations: z.array(z.unknown()).max(200).default([]),
    }).parse(await c.req.json());
    await service.db.put(tenantId, "business-schemas", {
      id: "default",
      tenantId,
      entities: body.entities,
      relations: body.relations,
      updatedAt: new Date().toISOString(),
    });
    return c.json({ ok: true, tenantId });
  });

  app.get("/tenants/:tenantId/business-schema", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const schema = await service.db.get(tenantId, "business-schemas", "default");
    return c.json({ schema });
  });

  // ADMIN_WORKSPACE_GEN_V1 - genera workspace desde el schema del tenant.
  app.get("/tenants/:tenantId/workspace", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const { WorkspaceGenerator } = await import("./engine/workspace/generator.ts");
    const gen = new WorkspaceGenerator(service.db as never);
    const spec = await gen.generateForTenant(tenantId);
    return c.json({ workspace: spec });
  });

  // ADMIN_VIEWS_RESOLVE_V1 - resuelve un intent a ViewSpec.
  app.post("/views/resolve", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const body = z.object({ intent: z.string().min(1).max(1000) }).parse(await c.req.json());
    const { ViewResolver } = await import("./engine/views/resolver.ts");
    const resolver = new ViewResolver(service);
    const spec = await resolver.resolve(owner, body.intent);
    return c.json({ spec });
  });

  // ADMIN_ONBOARDING_V1 - estado de onboarding por tenant.
  app.get("/tenants/:tenantId/onboarding", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const identity = await service.db.get<{ name?: string }>(tenantId, "agent-settings", "identity");
    const hasFiles = (await service.db.list(tenantId, "files", { limit: 1 })).length > 0;
    const hasTasks = (await service.db.list(tenantId, "tasks", { limit: 1 })).length > 0;
    const hasMemory = (await service.db.list(tenantId, "memories", { limit: 1 })).length > 0;
    return c.json({
      tenantId,
      hasIdentity: Boolean(identity),
      hasFiles,
      hasTasks,
      hasMemory,
      ok: Boolean(identity) && hasFiles && hasTasks,
    });
  });

  app.get("/system/status", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const status = {
      worker: service.worker.running,
      kernel: Boolean(service.kernel),
      graph: Boolean(service.graph),
      marketplace: Boolean(service.marketplace),
      time: new Date().toISOString(),
    };
    return c.json(status);
  });

  app.post("/guardrails/:tenantId/quota", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const body = z.object({
      tokensPerDay: z.number().int().positive(),
      tasksActive: z.number().int().positive(),
      tasksPerHour: z.number().int().positive(),
      eventsPerDay: z.number().int().positive(),
      turnsActive: z.number().int().positive(),
      costEurPerDay: z.number().positive(),
    }).parse(await c.req.json());
    await service.db.put(tenantId, "guardrail-quotas", { id: "default", quota: body });
    return c.json({ ok: true, tenantId, quota: body });
  });

  return app;
}