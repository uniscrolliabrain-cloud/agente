// ADMIN_TENANTS_V1 - panel admin de tenants: health, uso, kill switch.

import { Hono } from "hono";
import { z } from "zod";
import type { AgentRole, AgentTask } from "../../../packages/domain/src/agent.ts";
import type { AgentService } from "./engine/service.ts";
import { AppError } from "./errors.ts";
import type { UserService } from "./users.ts";

interface TenantHealth {
  tenantId: string;
  roles: number;
  tasks: { total: number; running: number; failed: number; succeeded: number };
  sops: number;
  builds: number;
  costEur30d: number;
  tokens30d: number;
  lastActivityAt: string | null;
  suspended: boolean;
  suspendedReason?: string;
  suspendedAt?: string;
}

interface TenantListItem {
  tenantId: string;
  displayName: string;
  adminEmail: string | null;
  createdAt: string;
  health: TenantHealth;
}

const suspendBody = z.object({
  reason: z.string().min(3).max(500),
});

export function adminTenantsRoutes(service: AgentService, users: UserService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  const requireAdmin = async (owner: string) => {
    const user = await users.getById(owner);
    if (!user || user.role !== "admin") throw new AppError("Solo admin", 403);
  };

  // GET /api/admin/tenants -> lista con health agregada.
  app.get("/", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);

    // Lista de tenants conocidos: los que tienen membership.
    const memberships = await service.db.list<{ tenantId: string }>("system", "tenant-membership");
    const tenants = new Map<string, { adminEmail: string | null; createdAt: string }>();
    for (const m of memberships) {
      if (!tenants.has(m.tenantId)) {
        tenants.set(m.tenantId, { adminEmail: null, createdAt: new Date().toISOString() });
      }
    }

    const items: TenantListItem[] = [];
    for (const [tenantId, meta] of tenants) {
      const health = await buildHealth(service, tenantId);
      items.push({
        tenantId,
        displayName: tenantId,
        adminEmail: meta.adminEmail,
        createdAt: meta.createdAt,
        health,
      });
    }
    items.sort((a, b) => a.tenantId.localeCompare(b.tenantId));
    return c.json({ tenants: items, count: items.length });
  });

  // GET /api/admin/tenants/:tenantId -> detalle.
  app.get("/:tenantId", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const health = await buildHealth(service, tenantId);
    return c.json({ tenantId, health });
  });

  // POST /api/admin/tenants/:tenantId/suspend -> kill switch.
  app.post("/:tenantId/suspend", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const body = suspendBody.parse(await c.req.json());
    await service.db.put("system", "tenant-state", {
      id: tenantId,
      suspended: true,
      suspendedReason: body.reason,
      suspendedAt: new Date().toISOString(),
      suspendedBy: owner,
    });
    return c.json({ ok: true, tenantId, suspended: true });
  });

  // POST /api/admin/tenants/:tenantId/resume -> recuperar.
  app.post("/:tenantId/resume", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    await service.db.put("system", "tenant-state", {
      id: tenantId,
      suspended: false,
      resumedAt: new Date().toISOString(),
      resumedBy: owner,
    });
    return c.json({ ok: true, tenantId, suspended: false });
  });

  // POST /api/admin/tenants -> alta manual (para tests y demos).
  app.post("/", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const body = z
      .object({
        tenantId: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
        displayName: z.string().max(200).optional(),
      })
      .parse(await c.req.json());
    await service.db.put("system", "tenant-membership", {
      id: body.tenantId,
      tenantId: body.tenantId,
      displayName: body.displayName ?? body.tenantId,
      createdAt: new Date().toISOString(),
      createdBy: owner,
    });
    return c.json({ ok: true, tenantId: body.tenantId }, 201);
  });

  return app;
}

async function buildHealth(service: AgentService, tenantId: string): Promise<TenantHealth> {
  const roles = await service.db.list<AgentRole>(tenantId, "agent-roles", { limit: 200 }).catch(() => []);
  const tasks = await service.db.list<AgentTask>(tenantId, "tasks", { limit: 5000 }).catch(() => []);
  const sops = await service.db.list<unknown>(tenantId, "sops", { limit: 500 }).catch(() => []);
  const builds = await service.db.list<unknown>(tenantId, "build-specs", { limit: 500 }).catch(() => []);
  const usage = await service.db
    .list<{ costEur: number; inputTokens: number; outputTokens: number; date: string }>(tenantId, "llm-usage")
    .catch(() => []);
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const recent = usage.filter((u) => u.date >= since);
  const costEur30d = recent.reduce((acc, u) => acc + (u.costEur ?? 0), 0);
  const tokens30d = recent.reduce((acc, u) => acc + (u.inputTokens ?? 0) + (u.outputTokens ?? 0), 0);
  const lastTask = tasks.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const state = await service.db.get<{ suspended?: boolean; suspendedReason?: string; suspendedAt?: string }>(
    "system",
    "tenant-state",
    tenantId,
  ).catch(() => null);

  return {
    tenantId,
    roles: roles.length,
    tasks: {
      total: tasks.length,
      running: tasks.filter((t) => t.status === "running").length,
      failed: tasks.filter((t) => t.status === "failed").length,
      succeeded: tasks.filter((t) => t.status === "succeeded").length,
    },
    sops: sops.length,
    builds: builds.length,
    costEur30d: Math.round(costEur30d * 10000) / 10000,
    tokens30d,
    lastActivityAt: lastTask?.updatedAt ?? null,
    suspended: Boolean(state?.suspended),
    ...(state?.suspendedReason ? { suspendedReason: state.suspendedReason } : {}),
    ...(state?.suspendedAt ? { suspendedAt: state.suspendedAt } : {}),
  };
}