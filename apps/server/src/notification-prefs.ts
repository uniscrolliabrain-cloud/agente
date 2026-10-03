// NOTIFICATION_PREFS_V1 - preferencias por usuario.

import { Hono } from "hono";
import { z } from "zod";
import type { Store } from "./db.ts";

const prefsSchema = z.object({
  disabled: z.array(z.string().max(80)).max(50).default([]),
});

export function notificationPrefsRoutes(db: Store) {
  const app = new Hono<{ Variables: { owner: string } }>();

  app.get("/prefs", async (c) => {
    const owner = c.get("owner");
    const prefs = await db.get<{ disabled: string[] }>(owner, "notification-prefs", "default");
    return c.json(prefs ?? { disabled: [] });
  });

  app.put("/prefs", async (c) => {
    const owner = c.get("owner");
    const body = prefsSchema.parse(await c.req.json());
    await db.put(owner, "notification-prefs", { id: "default", ...body });
    return c.json({ ok: true, prefs: body });
  });

  return app;
}