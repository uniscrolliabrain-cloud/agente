// ADMIN_TENANTS_V1 - panel admin de tenants: health, uso, kill switch.

import { Hono } from "hono";
import { z } from "zod";
import type { AgentRole, AgentTask } from "../../../packages/domain/src/agent.ts";
import type { AgentService } from "./engine/service.ts";
import type { Store } from "./db.ts";
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

// ADMIN_TENANTS_GLOBAL_STORE_V1 - el registro de tenants y su estado son
// globales (`system/...`), no datos de un tenant. Con el store con scope, cada
// lectura se prefijaba con el tenant del admin y el panel listaba cero empresas
// aunque existieran en la base.
export function adminTenantsRoutes(service: AgentService, users: UserService, global: Store) {
  const app = new Hono<{ Variables: { owner: string } }>();

  const requireAdmin = async (owner: string) => {
    const user = await users.getById(owner);
    if (!user || user.role !== "admin") throw new AppError("Solo admin", 403);
  };

  // GET /api/admin/tenants -> lista con health agregada.
  app.get("/", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);

    // Lista de tenants conocidos: los del registro. Antes el nombre visible era
    // el propio id (`agntia`), ignorando el displayName guardado; y una fila sin
    // tenantId aparecia como un tenant fantasma.
    const registry = await global.list<{ tenantId?: string; displayName?: string; createdAt?: string }>(
      "system",
      "tenant-membership",
    );
    const tenants = new Map<string, { displayName: string; adminEmail: string | null; createdAt: string }>();
    for (const row of registry) {
      if (!row.tenantId) continue;
      tenants.set(row.tenantId, {
        displayName: row.displayName ?? row.tenantId,
        adminEmail: null,
        createdAt: row.createdAt ?? new Date().toISOString(),
      });
    }

    const items: TenantListItem[] = [];
    for (const [tenantId, meta] of tenants) {
      const health = await buildHealth(tenantId, global);
      items.push({
        tenantId,
        displayName: meta.displayName,
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
    // ADMIN_TENANTS_TENANT_ID_REGEX_V1
    if (!/^[a-z0-9-]{1,64}$/.test(tenantId)) throw new AppError("tenantId invalido", 422);
    const health = await buildHealth(tenantId, global);
    return c.json({ tenantId, health });
  });

  // POST /api/admin/tenants/:tenantId/suspend -> kill switch.
  app.post("/:tenantId/suspend", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    // ADMIN_TENANTS_SUSPEND_REGEX_V1
    if (!/^[a-z0-9-]{1,64}$/.test(tenantId)) throw new AppError("tenantId invalido", 422);
    const body = suspendBody.parse(await c.req.json());
    await global.put("system", "tenant-state", {
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
    // TENANT_BODY_VALIDATE_V1 - tenantId en path validado antes de tocar DB.
    if (!/^[a-z0-9-]{1,64}$/.test(tenantId)) throw new AppError("tenantId invalido", 422);
    await global.put("system", "tenant-state", {
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
    // TENANT_REGISTRY_ID_V1 - el registro de tenants usa id=tenantId. Antes
    // todas las filas se escribian con id="default" y se pisaban entre si: el
    // panel solo podia listar un tenant aunque hubiera varios, y DELETE/PATCH
    // (que buscan por tenantId) nunca encontraban la fila.
    // La membership del usuario sigue siendo otra cosa: id="default" bajo su
    // propio owner (ver TenantService.setMembership).
    const existing = await global.get<{ createdAt?: string }>(
      "system",
      "tenant-membership",
      body.tenantId,
    );
    await global.put("system", "tenant-membership", {
      id: body.tenantId,
      tenantId: body.tenantId,
      displayName: body.displayName ?? body.tenantId,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      createdBy: owner,
    });
    return c.json({ ok: true, tenantId: body.tenantId }, 201);
  });

  // TENANT_MEMBERSHIP_ROUTES_V1 - meter a un usuario en una empresa.
  //
  // Por que existe: POST /api/admin/tenants creaba el tenant, pero no habia
  // ninguna forma de darle miembros, y /api/auth/switch-tenant exige una fila en
  // `user-tenants`. Resultado: el tenant existia y era inaccesible (403 al
  // cambiar), que es el multi-tenant "a medias".
  app.get("/:tenantId/members", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    if (!/^[a-z0-9-]{1,64}$/.test(tenantId)) throw new AppError("tenantId invalido", 422);
    const tenantService = service.tenantService;
    if (!tenantService) throw new AppError("TenantService no disponible", 503);
    const all = await users.list();
    const members: Array<{ userId: string; email: string; role: string }> = [];
    for (const user of all) {
      const memberships = await tenantService.membershipsFor(user.id);
      const hit = memberships.find((m) => m.tenantId === tenantId);
      if (hit) members.push({ userId: user.id, email: user.email, role: hit.role });
    }
    return c.json({ tenantId, members, count: members.length });
  });

  app.post("/:tenantId/members", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    if (!/^[a-z0-9-]{1,64}$/.test(tenantId)) throw new AppError("tenantId invalido", 422);
    const body = z
      .object({
        email: z.email().optional(),
        userId: z.string().min(1).max(100).optional(),
        role: z.enum(["owner", "admin", "member"]).optional(),
      })
      .parse(await c.req.json());
    if (!body.email && !body.userId) throw new AppError("Falta email o userId", 422);
    const tenantService = service.tenantService;
    if (!tenantService) throw new AppError("TenantService no disponible", 503);

    const user = body.userId ? await users.getById(body.userId) : await users.getByEmail(body.email ?? "");
    if (!user) throw new AppError("Usuario no encontrado", 404);
    // El tenant debe existir en el registro: si no, se crearia una membership
    // hacia una empresa fantasma que luego no aparece en el panel.
    const registry = await global.get<{ tenantId?: string }>("system", "tenant-membership", tenantId);
    if (!registry) throw new AppError("Tenant no encontrado", 404);

    const membership = await tenantService.addMembership(user.id, tenantId, body.role ?? "member");
    return c.json({ ok: true, tenantId, userId: user.id, role: membership.role }, 201);
  });

  app.delete("/:tenantId/members/:userId", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const userId = c.req.param("userId");
    if (!/^[a-z0-9-]{1,64}$/.test(tenantId)) throw new AppError("tenantId invalido", 422);
    const tenantService = service.tenantService;
    if (!tenantService) throw new AppError("TenantService no disponible", 503);
    const existing = await global.get("system", "users", userId).catch(() => null);
    if (!existing) throw new AppError("Usuario no encontrado", 404);
    await global.remove(userId, "user-tenants", tenantId);
    tenantService.invalidate(userId);
    return c.json({ ok: true, tenantId, userId, removed: true });
  });

  // ADMIN_TENANTS_CRUD_V1 — borra un tenant. Elimina membership y state.
  // No borra los records del tenant (tasks, files, etc.): esos los borra
  // un operador con un script dedicado (Fase 9 si hace falta).
  app.delete("/:tenantId", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    if (!/^[a-z0-9-]{1,64}$/.test(tenantId)) throw new AppError("tenantId invalido", 422);
    await global.remove("system", "tenant-membership", tenantId);
    await global.remove("system", "tenant-state", tenantId);
    // ADMIN_TENANTS_CRUD_V1 — invalidar caché de TenantService.
    const ts = (service as unknown as { tenantService?: { invalidateAll?: () => void } }).tenantService;
    ts?.invalidateAll?.();
    return c.json({ ok: true, tenantId, deleted: true });
  });

  // ADMIN_TENANTS_CRUD_V1 — actualiza displayName.
  app.patch("/:tenantId", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    if (!/^[a-z0-9-]{1,64}$/.test(tenantId)) throw new AppError("tenantId invalido", 422);
    const body = z.object({ displayName: z.string().min(1).max(200).optional() }).parse(await c.req.json());
    if (body.displayName === undefined) {
      throw new AppError("Nada que actualizar (displayName)", 422);
    }
    const existing = await global.get<{ id: string; tenantId: string; displayName?: string; createdAt: string; createdBy: string }>(
      "system",
      "tenant-membership",
      tenantId,
    );
    if (!existing) throw new AppError("Tenant no encontrado", 404);
    await global.put("system", "tenant-membership", {
      ...existing,
      displayName: body.displayName,
      updatedAt: new Date().toISOString(),
    });
    return c.json({ ok: true, tenantId, displayName: body.displayName });
  });

  return app;
}

// TENANT_HEALTH_SCAN_V1 - los datos del tenant viven bajo `tenantId:owner` y
// aqui no se conoce el owner concreto. Listar con owner=tenantId devolvia cero
// para todo, asi que el panel mostraba un tenant "sano" y vacio a la vez. El
// scan por prefijo lee la zona entera del tenant sin inventarse un owner.
async function buildHealth(tenantId: string, global: Store): Promise<TenantHealth> {
  const prefix = `${tenantId}:`;
  const scan = async <T>(kind: string, limit = 1000): Promise<T[]> =>
    (await global.scanByOwnerPrefix<T>(kind, prefix, limit).catch(() => [])).map((row) => row.value);

  const roles = await scan<AgentRole>("agent-roles", 500);
  const tasks = await scan<AgentTask>("tasks", 5000);
  const sops = await scan<unknown>("sops", 500);
  const builds = await scan<unknown>("build-specs", 500);
  const usage = await scan<{ costEur: number; inputTokens: number; outputTokens: number; date: string }>("llm-usage", 5000);
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const recent = usage.filter((u) => u.date >= since);
  const costEur30d = recent.reduce((acc, u) => acc + (u.costEur ?? 0), 0);
  const tokens30d = recent.reduce((acc, u) => acc + (u.inputTokens ?? 0) + (u.outputTokens ?? 0), 0);
  const lastTask = tasks.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const state = await global.get<{ suspended?: boolean; suspendedReason?: string; suspendedAt?: string }>(
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