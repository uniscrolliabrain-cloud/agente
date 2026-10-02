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