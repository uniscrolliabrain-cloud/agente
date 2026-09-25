import { Hono } from "hono";
import type { Store } from "../db.ts";
import { AppError } from "../errors.ts";

const TERMINAL = new Set(["succeeded", "failed", "cancelled"]);
const SUPPORTED_TRIGGERS = new Set(["manual", "api"]);

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
    // `trigger` was dead metadata. Manual is the default. API is reserved for a future endpoint.
    // Any other value is rejected so the schema doesn't silently accept a trigger that no code reads.
    if (!SUPPORTED_TRIGGERS.has(parsed.trigger.type))
      throw new AppError(
        `SOP trigger "${parsed.trigger.type}" is reserved and not yet implemented`,
        422,
      );
    const sop = { ...parsed, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await db.put(c.get("owner"), "sops", sop);
    return c.json(sop, 201);
  });
  app.put("/:id", async (c) => {
    const id = c.req.param("id");
    const ex = await db.get(c.get("owner"), "sops", id);
    if (!ex) throw new AppError("SOP not found", 404);
    const { sopSchema } = await import("../../../../packages/domain/src/sop.ts");
    const patch = sopSchema.partial().omit({ id: true }).parse(await c.req.json());
    if (patch.trigger && !SUPPORTED_TRIGGERS.has(patch.trigger.type))
      throw new AppError(
        `SOP trigger "${patch.trigger.type}" is reserved and not yet implemented`,
        422,
      );
    const up = { ...ex, ...patch, id, updatedAt: new Date().toISOString() };
    await db.put(c.get("owner"), "sops", up);
    return c.json(up);
  });
  app.delete("/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const tasks = await db.list<{ id: string; status: string; state?: { sopId?: string } }>(
      owner,
      "tasks",
    );
    const active = tasks.filter(
      (t) => !TERMINAL.has(t.status) && t.state?.sopId === id,
    );
    if (active.length > 0)
      throw new AppError(
        `Cannot delete SOP: ${active.length} active task(s) still reference it`,
        409,
      );
    await db.remove(owner, "sops", id);
    return c.json({ ok: true });
  });
  return app;
}