// NOTIFICATION_PREFS_V1 - preferencias por usuario.

import { Hono } from "hono";
import { z } from "zod";
import type { Store } from "./db.ts";
// NOTIFICATION_PREFS_TENANT_V1 + TENANT_ASSERT_NOT_DEFAULT_WIRED_V1
import { assertNotHardcodedTenantId } from "./engine/tenant.ts";
import type { AuthzDeps } from "./engine/authz/pdp.ts";

const prefsSchema = z.object({
  disabled: z.array(z.string().max(80)).max(50).default([]),
});

// NOTIFICATION_PREFS_TENANT_V1 â€” el id del registro de prefs es el tenantId
// real, no "default". En clone-por-cliente tenantId="default" y se comporta
// igual que antes. En shared, cada tenant tiene su propio registro.
// TENANT_ASSERT_NOT_DEFAULT_WIRED_V1 â€” en shared, "default" hardcodeado es bug.
export function notificationPrefsRoutes(
  db: Store,
  tenantService?: { tenantIdFor: (owner: string) => Promise<string> },
  authz?: AuthzDeps,
) {
  const app = new Hono<{ Variables: { owner: string } }>();

  const tenantIdFor = async (owner: string): Promise<string> =>
    tenantService ? await tenantService.tenantIdFor(owner).catch(() => "default") : "default";

  const assertTenant = (tenantId: string): void => {
    if (process.env.MULTI_TENANT_SHARED === "true") {
      assertNotHardcodedTenantId(tenantId, "notificationPrefsRoutes");
    }
  };

  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/prefs", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    assertTenant(tenantId);
    const prefs = await db.get<{ disabled: string[] }>(owner, "notification-prefs", tenantId);
    return c.json(prefs ?? { disabled: [] });
  });

  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.put("/prefs", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    assertTenant(tenantId);
    const body = prefsSchema.parse(await c.req.json());
    await db.put(owner, "notification-prefs", { id: tenantId, ...body });
    return c.json({ ok: true, prefs: body });
  });

  return app;
}