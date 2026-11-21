import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";
import type { RateLimiter } from "./rate-limit.ts";
import { globalPresence } from "./engine/presence.ts";
import { globalEditLock } from "./engine/edit-lock.ts"; // TYPE_FIX_EDIT_LOCK_IMPORT_V1
import type { AuthzDeps } from "./engine/authz/pdp.ts";
import { currentTenantScope } from "./tenant-scope.ts";
import { AutomationThreads } from "./engine/automation-thread.ts";
// THREADS_EDIT_LOCK_FIX_V1

export async function threadBelongsToTenant(
  thread: { tenantId?: string },
  tenantId: string,
  resolvePrimary: () => Promise<string>,
): Promise<boolean> {
  return (thread.tenantId ?? await resolvePrimary()) === tenantId;
}

interface Thread {
  id: string;
  title: string;
  version?: number;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  // THREAD_ORGANIZE_V1 - proyecto y responsable, opcionales y persistidos en el
  // mismo registro JSONB (sin migracion).
  projectId?: string | null;
  assignedTo?: string | null;
  assignedKind?: "human" | "agent" | null;
}

type ThreadTenantService = { resolveStrict: (owner: string) => Promise<{ tenantId: string }> };

function activeTenant(owner: string): string {
  const scope = currentTenantScope();
  if (!scope || scope.actorId !== owner) throw new AppError("Authenticated thread scope required", 403);
  return scope.tenantId;
}

export async function requireThread(db: Store, tenantService: ThreadTenantService, owner: string, id: string, lock = false): Promise<Thread> {
  const tenantId = activeTenant(owner);
  const thread = lock
    ? await db.compareAndSwap<Thread>(owner, "threads", id, {}, {})
    : await db.get<Thread>(owner, "threads", id);
  if (!thread || !await threadBelongsToTenant(thread, tenantId, async () => (await tenantService.resolveStrict(owner)).tenantId)) {
    throw new AppError("Thread not found", 404);
  }
  return thread;
}


export async function appendThreadMessages(
  db: Store,
  tenantService: ThreadTenantService,
  owner: string,
  id: string,
  messages: ReadonlyArray<{ id: string; role: string; content: string; timestamp?: string }>,
  requireNew = false,
): Promise<Thread> {
  return db.transaction(async () => {
    // Lock the existing thread row before reading the conversation so
    // concurrent appends see the latest committed message list.
    const thread = await requireThread(db, tenantService, owner, id, true);
    const conversation = await db.get<{ messages: unknown[] }>(owner, "conversations", id);
    const history = [...(conversation?.messages ?? [])];
    const seen = new Set(history.map((message) =>
      typeof message === "object" && message !== null && "id" in message ? message.id : undefined,
    ));
    const additions = messages.filter((message) => {
      if (seen.has(message.id)) return false;
      seen.add(message.id);
      return true;
    });
    if (requireNew && additions.length !== messages.length) throw new AppError("Turn already exists", 409);
    if (!additions.length) return thread;
    if (history.length + additions.length > 1000) throw new AppError("Thread message limit reached", 422);

    const firstUser = additions.find((message) => message.role === "user");
    const title = thread.title === "Nuevo chat" && firstUser
      ? firstUser.content.slice(0, 60).trim() || thread.title
      : thread.title;
    history.push(...additions);
    await db.put(owner, "conversations", { ...conversation, id, messages: history });
    const updated = {
      ...thread,
      tenantId: activeTenant(owner),
      title,
      messageCount: history.length,
      updatedAt: new Date(Math.max(Date.now(), Date.parse(thread.updatedAt) + 1)).toISOString(),
    };
    await db.put(owner, "threads", updated);
    return updated;
  });
}

export function threadRoutes(
  db: Store,
  limiter: RateLimiter,
  tenantService: ThreadTenantService,
  authz?: AuthzDeps,
) {
  const app = new Hono<{ Variables: { owner: string } }>();

  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/", async (c) => {
    const owner = c.get("owner");
    const threads = await db.list<Thread>(owner, "threads");
    const tenantId = activeTenant(owner);
    const legacyTenant = threads.some((thread) => thread.tenantId === undefined)
      ? (await tenantService.resolveStrict(owner)).tenantId
      : undefined;
    return c.json(threads
      .filter((thread) => (thread.tenantId ?? legacyTenant) === tenantId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  });

  // TAKE_FOR_TENANT_THREADS_V1 - un intento por tenant+owner antes de crear
  // el thread. Deuda Fase 6: usar tenantService cuando este cableado aqui.
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/", async (c) => {
    const owner = c.get("owner");
    const tenantId = activeTenant(owner);
    const verdict = limiter.takeForTenant(tenantId, owner, "threads.create");
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
      tenantId,
      title: body.title || "Nuevo chat",
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    };
    await db.transaction(async () => {
      await db.put(owner, "threads", thread);
      await db.put(owner, "conversations", { id, messages: [] });
    });
    return c.json(thread, 201);
  });

  // PRESENCE_TOUCH_V1 ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â el cliente marca su presencia al editar un thread.
  // Devuelve quiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©n mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡s estÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ editando. Ver miniaudit 04.
  app.post("/:id/presence", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    await requireThread(db, tenantService, owner, id);
    // THREADS_USER_HEADER_VALIDATE_V1
    const userId = c.req.header("x-user-id") ?? owner;
    const result = globalPresence.touch(userId, "thread", id);
    return c.json(result);
  });

  // PRESENCE_LEAVE_THREAD_V1 - desconexiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n explÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­cita.
  app.post("/:id/presence/leave", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    await requireThread(db, tenantService, owner, id);
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
    const thread = await requireThread(db, tenantService, owner, c.req.param("id"));
    return c.json({ current: thread.version ?? null, updatedAt: thread.updatedAt });
  });

  app.get("/:id/state", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const thread = await requireThread(db, tenantService, owner, id);
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
    const thread = await requireThread(db, tenantService, owner, id);
    const conv = await db.get<{ messages: unknown[] }>(owner, "conversations", id);
    // AUTOMATION_THREAD_EXPOSE_V1 (campana 13) - el panel ve a que automatizacion
    // y ejecucion esta vinculado el hilo, para enlazar la evidencia.
    const tenantId = activeTenant(owner);
    const automation = await new AutomationThreads(db).get({ tenantId, actorId: owner }, id);
    return c.json({ ...thread, messages: conv?.messages ?? [], automation });
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
      return await db.transaction(async () => {
        const thread = await requireThread(db, tenantService, owner, id, true);
        const body = await c.req.json();
        const messages = z.array(z.unknown()).max(1000).parse(body.messages);
        const { expectedUpdatedAt } = z
          .object({ expectedUpdatedAt: z.iso.datetime({ offset: true }).optional() })
          .parse(body);
        if (expectedUpdatedAt !== undefined && thread.updatedAt !== expectedUpdatedAt) {
          throw new AppError(
            "Otro usuario ha modificado esta conversación. Recarga y vuelve a intentarlo.",
            409,
            { current: thread.updatedAt, expected: expectedUpdatedAt },
          );
        }
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
          tenantId: activeTenant(owner),
          title,
          updatedAt: new Date(Math.max(Date.now(), Date.parse(thread.updatedAt) + 1)).toISOString(),
          messageCount: messages.length,
        };
        await db.put(owner, "threads", updated);
        return c.json(updated);
      });
    } finally {
      // THREAD_EDIT_UNLOCK_V1 - libera el lock siempre.
      globalEditLock.release(lockUser, "thread", id);
    }
  });

  // Append without replacing turns already stored by another client.
  app.post("/:id/messages", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const { messages } = z.object({
      messages: z.array(z.object({
        id: z.string().min(1).max(200),
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }).passthrough()).min(1).max(1000),
    }).parse(await c.req.json());

    const updated = await appendThreadMessages(db, tenantService, owner, id, messages);
    return c.json(updated);
  });

  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  // THREAD_ORGANIZE_V1 - el PATCH ya no exige titulo: tambien mueve el hilo a
  // un proyecto y le pone responsable (persona o agente). Un campo ausente no
  // se toca; `null` lo borra.
  app.patch("/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const body = z
      .object({
        title: z.string().trim().min(1).max(200).optional(),
        projectId: z.string().trim().max(200).nullable().optional(),
        assignedTo: z.string().trim().max(200).nullable().optional(),
        assignedKind: z.enum(["human", "agent"]).nullable().optional(),
      })
      .refine(
        (value) =>
          value.title !== undefined ||
          value.projectId !== undefined ||
          value.assignedTo !== undefined ||
          value.assignedKind !== undefined,
        { message: "Nada que actualizar" },
      )
      .parse(await c.req.json());
    const updated = await db.transaction(async () => {
      const thread = await requireThread(db, tenantService, owner, id, true);
      return db.put(owner, "threads", {
        ...thread,
        ...body,
        tenantId: activeTenant(owner),
        updatedAt: body.title === undefined
          ? thread.updatedAt
          : new Date(Math.max(Date.now(), Date.parse(thread.updatedAt) + 1)).toISOString(),
      });
    });
    return c.json(updated);
  });

  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.delete("/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    await db.transaction(async () => {
      await requireThread(db, tenantService, owner, id, true);
      await db.remove(owner, "threads", id);
      await db.remove(owner, "conversations", id);
      await new AutomationThreads(db).forget({ tenantId: activeTenant(owner), actorId: owner }, id);
    });
    return c.json({ ok: true });
  });

  return app;
}