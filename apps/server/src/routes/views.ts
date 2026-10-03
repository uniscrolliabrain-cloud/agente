// FIX_02_ROUTES_VIEWS_V3 - endpoint resolve real.
import { Hono } from "hono";
import { z } from "zod";
import { resolveView } from "../engine/views/resolver.ts";

export function viewsRoutes() {
  const app = new Hono<{ Variables: { owner: string } }>();
  app.post("/resolve", async (c) => {
    const body = z.object({ intent: z.string().min(1).max(1000) }).parse(await c.req.json());
    const spec = await resolveView(c.get("owner"), body.intent);
    return c.json({ spec });
  });
  return app;
}