import { Hono } from "hono";
import { sopSchema, type SOP } from "../../../../packages/domain/src/sop.ts";
import type { Store } from "../db.ts";
import type { AgentService } from "../engine/service.ts";
import { AppError } from "../errors.ts";

const TERMINAL = new Set(["succeeded", "failed", "cancelled"]);

export function sopRoutes(db: Store, agent: AgentService) {
  const app = new Hono<{ Variables: { owner: string } }>();
  app.get("/", async (c) => c.json(await db.list(c.get("owner"), "sops")));
  app.get("/:id", async (c) => {
    const s = await db.get<SOP>(c.get("owner"), "sops", c.req.param("id"));
    if (!s) throw new AppError("SOP not found", 404);
    return c.json(s);
  });
  app.post("/", async (c) => {
    const parsed = sopSchema.parse(await c.req.json());
    const sop = { ...parsed, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await db.put(c.get("owner"), "sops", sop);
    return c.json(sop, 201);
  });
  app.put("/:id", async (c) => {
    const id = c.req.param("id");
    const ex = await db.get<SOP>(c.get("owner"), "sops", id);
    if (!ex) throw new AppError("SOP not found", 404);
    const patch = sopSchema.partial().omit({ id: true }).parse(await c.req.json());
    const up = { ...ex, ...patch, id, updatedAt: new Date().toISOString() };
    await db.put(c.get("owner"), "sops", up);
    return c.json(up);
  });
  app.delete("/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const tasks = await db.list<{ id: string; status: string; state?: { sopId?: string } }>(owner, "tasks");
    const active = tasks.filter((t) => !TERMINAL.has(t.status) && t.state?.sopId === id);
    if (active.length > 0)
      throw new AppError(`Cannot delete SOP: ${active.length} active task(s) still reference it`, 409);
    await db.remove(owner, "sops", id);
    return c.json({ ok: true });
  });
  // Real "api" trigger: external callers start this SOP by POSTing here.
  app.post("/:id/run", async (c) => {
    const owner = c.get("owner");
    const sopId = c.req.param("id");
    const sop = await db.get<SOP>(owner, "sops", sopId);
    if (!sop) throw new AppError("SOP not found", 404);
    if (!sop.active) throw new AppError("SOP is inactive", 409);
    if (sop.trigger.type !== "api")
      throw new AppError(
        `SOP trigger is "${sop.trigger.type}"; only "api" SOPs can be started from this endpoint`,
        409,
      );
    const body = ((await c.req.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
    const userInput =
      body.input && typeof body.input === "object" ? (body.input as Record<string, unknown>) : {};
    const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : undefined;
    const task = await agent.createTask(
      owner,
      {
        kind: "sop",
        title: sop.name,
        prompt: `API trigger for ${sop.name}`,
        input: { sopId: sop.id, ...userInput, trigger: { type: "api" } },
      },
      idempotencyKey ? `sop-api:${sop.id}:${idempotencyKey}` : undefined,
    );
    return c.json(task, 201);
  });
  return app;
}