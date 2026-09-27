import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";

interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export function threadRoutes(db: Store) {
  const app = new Hono<{ Variables: { owner: string } }>();

  app.get("/", async (c) => {
    const owner = c.get("owner");
    const threads = await db.list<Thread>(owner, "threads");
    return c.json(threads.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  });

  app.post("/", async (c) => {
    const owner = c.get("owner");
    const body = z
      .object({ title: z.string().trim().max(200).optional() })
      .parse(await c.req.json().catch(() => ({})));
    const id = randomUUID();
    const now = new Date().toISOString();
    const thread: Thread = {
      id,
      title: body.title || "Nuevo chat",
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    };
    await db.put(owner, "threads", thread);
    await db.put(owner, "conversations", { id, messages: [] });
    return c.json(thread, 201);
  });

  app.get("/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const thread = await db.get<Thread>(owner, "threads", id);
    if (!thread) throw new AppError("Thread not found", 404);
    const conv = await db.get<{ messages: unknown[] }>(owner, "conversations", id);
    return c.json({ ...thread, messages: conv?.messages ?? [] });
  });

  app.put("/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const thread = await db.get<Thread>(owner, "threads", id);
    if (!thread) throw new AppError("Thread not found", 404);
    const body = await c.req.json();
    const messages = z.array(z.unknown()).max(1000).parse(body.messages);
    await db.put(owner, "conversations", { id, messages });
    let title = thread.title;
    if (title === "Nuevo chat" && messages.length > 0) {
      const first = messages.find(
        (m: unknown) =>
          typeof m === "object" &&
          m !== null &&
          (m as { role?: string; content?: string }).role === "user" &&
          typeof (m as { content?: string }).content === "string",
      );
      if (first) {
        const content = (first as { content: string }).content;
        title = content.slice(0, 60).trim() || "Nuevo chat";
      }
    }
    const updated: Thread = {
      ...thread,
      title,
      updatedAt: new Date().toISOString(),
      messageCount: messages.length,
    };
    await db.put(owner, "threads", updated);
    return c.json(updated);
  });

  app.patch("/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const thread = await db.get<Thread>(owner, "threads", id);
    if (!thread) throw new AppError("Thread not found", 404);
    const body = z.object({ title: z.string().trim().min(1).max(200) }).parse(await c.req.json());
    const updated: Thread = { ...thread, title: body.title, updatedAt: new Date().toISOString() };
    await db.put(owner, "threads", updated);
    return c.json(updated);
  });

  app.delete("/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    await db.remove(owner, "threads", id);
    await db.remove(owner, "conversations", id);
    return c.json({ ok: true });
  });

  return app;
}