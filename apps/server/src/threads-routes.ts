import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";
import type { RateLimiter } from "./rate-limit.ts";
import { globalPresence } from "./engine/presence.ts";
import { globalEditLock } from "./engine/edit-lock.ts"; // TYPE_FIX_EDIT_LOCK_IMPORT_V1
// THREADS_EDIT_LOCK_FIX_V1

interface Thread {
  id: string;
  title: string;
  version?: number;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export function threadRoutes(
  db: Store,
  limiter: RateLimiter,
  tenantService?: { tenantIdFor: (owner: string) => Promise<string> },
  authz?: { pdp: { can: (...args: unknown[]) => Promise<"allow" | "deny"> }; fieldFilter: { filter: (...args: unknown[]) => Promise<unknown> } },
) {
  const app = new Hono<{ Variables: { owner: string } }>();

  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/", async (c) => {
    const owner = c.get("owner");
    const threads = await db.list<Thread>(owner, "threads");
    return c.json(threads.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  });

  // TAKE_FOR_TENANT_THREADS_V1 - un intento por tenant+owner antes de crear
  // el thread. Deuda Fase 6: usar tenantService cuando este cableado aqui.
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/", async (c) => {
    const owner = c.get("owner");
    // TAKE_FOR_TENANT_TENANTID_V1 â€” tenantId real, no owner.
    const tenantIdForRate = tenantService
      ? await tenantService.tenantIdFor(owner).catch(() => "default")
      : "default";
    const verdict = limiter.takeForTenant(tenantIdForRate, owner, "threads.create");
    if (!verdict.allowed) {
      const retrySec = Math.max(1, Math.ceil(verdict.retryAfterMs / 1000));
      c.header("Retry-After", String(retrySec));
      throw new AppError("Limite de conversaciones alcanzado. Prueba en " + retrySec + "s.", 429);
    }
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

  // PRESENCE_TOUCH_V1 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â el cliente marca su presencia al editar un thread.
  // Devuelve quiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©n mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡s estÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ editando. Ver miniaudit 04.
  app.post("/:id/presence", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const thread = await db.get(owner, "threads", id);
    if (!thread) throw new AppError("Thread not found", 404);
    // THREADS_USER_HEADER_VALIDATE_V1
    const userId = c.req.header("x-user-id") ?? owner;
    const result = globalPresence.touch(userId, "thread", id);
    return c.json(result);
  });

  // PRESENCE_LEAVE_THREAD_V1 - desconexiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n explÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­cita.
  app.post("/:id/presence/leave", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const userId = c.req.header("x-user-id") ?? owner;
    globalPresence.leave(userId, "thread", id);
    return c.json({ ok: true });
  });

  // RECONCILE_THREAD_V1 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â el cliente pide el estado mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡s reciente tras un 409.
  // Devuelve updatedAt + messages para comparar con lo que tenÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a.
  // Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md.
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  // THREAD_CONFLICT_VERSION_V1 - GET /:id/conflict: version actual del otro.
  app.get("/:id/conflict", async (c) => {
    const owner = c.get("owner");
    const thread = await db.get<Thread>(owner, "threads", c.req.param("id"));
    if (!thread) throw new AppError("Thread not found", 404);
    return c.json({ current: thread.version ?? null, updatedAt: thread.updatedAt });
  });

  app.get("/:id/state", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const thread = await db.get<Thread>(owner, "threads", id);
    if (!thread) throw new AppError("Thread not found", 404);
    const conversation = await db.get<{ messages: unknown[] }>(owner, "conversations", id);
    return c.json({
      id,
      updatedAt: thread.updatedAt,
      messages: conversation?.messages ?? [],
    });
  });

  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const thread = await db.get<Thread>(owner, "threads", id);
    if (!thread) throw new AppError("Thread not found", 404);
    const conv = await db.get<{ messages: unknown[] }>(owner, "conversations", id);
    return c.json({ ...thread, messages: conv?.messages ?? [] });
  });

  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.put("/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    // THREAD_EDIT_LOCK_V1 - evita doble-tab del mismo usuario.
    const lockUser: string = c.req.header("x-user-id") ?? owner;
    const lock = globalEditLock.acquire(lockUser, "thread", id);
    if (!lock) throw new AppError("Ya estas editando este thread en otro tab.", 409);
    try {
    const thread = await db.get<Thread>(owner, "threads", id);
    if (!thread) throw new AppError("Thread not found", 404);
    const body = await c.req.json();
    const messages = z.array(z.unknown()).max(1000).parse(body.messages);
    // THREADS_CAS_V1 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â optimismo de concurrencia. El cliente envÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a
    // `expectedUpdatedAt` con la versiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n que leyÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³. Si el thread cambiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³
    // desde entonces, devolvemos 409 y el cliente recarga.
    // Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md.
    const expected = z
      .object({ expectedUpdatedAt: z.iso.datetime({ offset: true }).optional() })
      .parse(body);
    if (expected.expectedUpdatedAt !== undefined) {
      const current = await db.get<Thread>(owner, "threads", id);
      if (!current || current.updatedAt !== expected.expectedUpdatedAt) {
        // THREAD_CONFLICT_DIFF_V1 - incluye current/expected en el 409.
        throw new AppError(
          "Otro usuario ha modificado esta conversaciÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n. Recarga y vuelve a intentarlo.",
          409,
          { current: current?.updatedAt ?? "", expected: expected.expectedUpdatedAt },
        );
      }
    }
    // Escribir la conversaciÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n con CAS: expected = updatedAt leÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­do, patch = messages.
    const currentThread = await db.get<Thread>(owner, "threads", id);
    if (!currentThread) throw new AppError("Thread not found", 404);
    const swapped = await db.compareAndSwap<{ id: string; messages: unknown[] }>(
      owner,
      "conversations",
      id,
      {},
      { messages },
    );
    if (!swapped) throw new AppError("Thread changed; refresh and try again", 409);
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
    } finally {
      // THREAD_EDIT_UNLOCK_V1 - libera el lock siempre.
      globalEditLock.release(lockUser, "thread", id);
    }
  });

  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
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

  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.delete("/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    await db.remove(owner, "threads", id);
    await db.remove(owner, "conversations", id);
    return c.json({ ok: true });
  });

  return app;
}