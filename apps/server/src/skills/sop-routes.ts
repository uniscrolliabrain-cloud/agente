import { Hono } from "hono";
import type { Store } from "../db.ts";
import { AppError } from "../errors.ts";

export function sopRoutes(db: Store) {
  const app = new Hono<{ Variables: { owner: string } }>();
  app.get("/", async (c) => c.json(await db.list(c.get("owner"), "sops")));
  app.get("/:id", async (c) => {
    const s = await db.get(c.get("owner"), "sops", c.req.param("id"));
    if (!s) throw new AppError("SOP not found", 404);
    return c.json(s);
  });
  app.post("/", async (c) => {
    const data = (await c.req.json());
    const { sopSchema } = await import("../../../../packages/domain/src/sop.ts");
    const parsed = sopSchema.parse(data);
    const sop = { ...parsed, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await db.put(c.get("owner"), "sops", sop);
    return c.json(sop, 201);
  });
  app.put("/:id", async (c) => {
    const id = c.req.param("id");
    const ex = await db.get(c.get("owner"), "sops", id);
    if (!ex) throw new AppError("SOP not found", 404);
    const { sopSchema } = await import("../../../../packages/domain/src/sop.ts");
    // The record id is owned by the path: the patch schema omits it so an update can never
    // re-key a stored SOP nor overwrite its identity with a client-supplied value.
    const patch = sopSchema.partial().omit({ id: true }).parse(await c.req.json());
    const up = { ...ex, ...patch, id, updatedAt: new Date().toISOString() };
    await db.put(c.get("owner"), "sops", up);
    return c.json(up);
  });
  app.delete("/:id", async (c) => {
    await db.remove(c.get("owner"), "sops", c.req.param("id"));
    return c.json({ ok: true });
  });
  return app;
}
