import { Hono } from "hono";
import { z } from "zod";
import type { Store } from "../db.ts";
import { AppError } from "../errors.ts";

const skillSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(160),
  description: z.string().max(4000).default(""),
  version: z.string().default("1.0.0"),
  entrypoint: z.string().default("main.py"),
  requirements: z.array(z.string()).default([]),
  prompt: z.string().max(10000).default(""),
  category: z.string().default("General"),
  active: z.boolean().default(true),
});

export function skillsRoutes(db: Store) {
  const app = new Hono<{ Variables: { owner: string } }>();
  app.get("/", async (c) => c.json(await db.list(c.get("owner"), "skills")));
  app.get("/:id", async (c) => {
    const s = await db.get(c.get("owner"), "skills", c.req.param("id"));
    if (!s) throw new AppError("Skill not found", 404);
    return c.json(s);
  });
  app.post("/", async (c) => {
    const data = skillSchema.parse(await c.req.json());
    const skill = { ...data, createdAt: new Date().toISOString() };
    await db.put(c.get("owner"), "skills", skill);
    return c.json(skill, 201);
  });
  app.put("/:id", async (c) => {
    const ex = await db.get(c.get("owner"), "skills", c.req.param("id"));
    if (!ex) throw new AppError("Skill not found", 404);
    const up = { ...ex, ...(await c.req.json()), updatedAt: new Date().toISOString() };
    await db.put(c.get("owner"), "skills", up);
    return c.json(up);
  });
  app.delete("/:id", async (c) => {
    await db.remove(c.get("owner"), "skills", c.req.param("id"));
    return c.json({ ok: true });
  });
  app.post("/:id/install", async (c) => {
    const s = await db.get(c.get("owner"), "skills", c.req.param("id"));
    if (!s) throw new AppError("Skill not found", 404);
    return c.json({ ok: true, skillId: s.id, mode: "runtime-bootstrap", requirements: s.requirements, message: "The SOP runtime installs the built-in skill into the private workspace when the skill is first used." });
  });
  return app;
}
