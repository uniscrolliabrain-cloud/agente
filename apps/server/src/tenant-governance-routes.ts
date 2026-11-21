import { Hono } from "hono";
import type { Actor } from "../../../packages/domain/src/actor.ts";
import { tenantAccess } from "./engine/authz/tenant-permissions.ts";
import type { TenantService } from "./engine/tenant.ts";

export function tenantGovernanceRoutes(tenants: Pick<TenantService, "findMembership" | "tenantState">) {
  const app = new Hono<{ Variables: { ctx: { tenantId: string; actor: Actor } } }>();
  app.get("/", async (c) => {
    const { tenantId, actor } = c.get("ctx");
    if (actor.kind !== "human" || !actor.active) return c.json({ error: "Acceso denegado" }, 403);

    const membership = await tenants.findMembership(actor.userId, tenantId);
    const decision = tenantAccess({
      membership,
      state: membership ? await tenants.tenantState(tenantId) : null,
      permission: "tenant.admin",
    });
    if (!decision.ok) return c.json({ error: decision.error.message }, 403);
    return c.json({
      tenantId,
      role: decision.role,
      policies: "draft" as const,
      dpa: "pending" as const,
      subprocessors: "pending" as const,
      retention: "pending" as const,
      companyExport: "unavailable" as const,
      incidents: "manual" as const,
    });
  });
  return app;
}
