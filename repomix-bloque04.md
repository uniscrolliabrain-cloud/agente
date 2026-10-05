This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: apps/server/src/threads-routes.ts, apps/server/src/projects-routes.ts, apps/server/src/engine/presence.ts, apps/server/src/engine/edit-lock.ts, tests/edit-lock.test.ts, apps/web/src/hooks/useChat.ts, apps/web/src/hooks/useProjects.ts, apps/web/src/hooks/useThreads.ts, apps/server/src/notifications-stream.ts, apps/server/src/notification-prefs.ts
- Files matching these patterns are excluded: **/node_modules/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      engine/
        edit-lock.ts
        presence.ts
      notification-prefs.ts
      notifications-stream.ts
      projects-routes.ts
      threads-routes.ts
  web/
    src/
      hooks/
        useChat.ts
        useProjects.ts
        useThreads.ts
tests/
  edit-lock.test.ts
```

# Files

## File: apps/web/src/hooks/useThreads.ts
```typescript
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createThread as apiCreateThread,
  deleteThread as apiDeleteThread,
  listThreads,
  renameThread as apiRenameThread,
  type Thread,
} from "../api/threads";

const ACTIVE_KEY = "openmuse_active_thread";

export function useThreads(enabled: boolean) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_KEY);
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const list = await listThreads();
      if (!mountedRef.current) return;
      setThreads(list);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Error cargando conversaciones");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [enabled, refresh]);

  useEffect(() => {
    try {
      if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
      else localStorage.removeItem(ACTIVE_KEY);
    } catch {
      /* localStorage puede fallar en modo privado */
    }
  }, [activeId]);

  const createNew = useCallback(
    async (title?: string): Promise<Thread | null> => {
      try {
        const thread = await apiCreateThread(title);
        setThreads((current) => [thread, ...current]);
        setActiveId(thread.id);
        setError(null);
        return thread;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error creando conversación");
        return null;
      }
    },
    [],
  );

  const rename = useCallback(async (id: string, title: string) => {
    try {
      const updated = await apiRenameThread(id, title);
      setThreads((current) => current.map((t) => (t.id === id ? updated : t)));
      setError(null);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error renombrando");
      return null;
    }
  }, []);

  const remove = useCallback(
    async (id: string) => {
      try {
        await apiDeleteThread(id);
        setThreads((current) => {
          const next = current.filter((t) => t.id !== id);
          if (id === activeId) {
            setActiveId(next.length > 0 ? next[0].id : null);
          }
          return next;
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error borrando");
      }
    },
    [activeId],
  );

  const select = useCallback((id: string | null) => {
    setActiveId(id);
  }, []);

  const touch = useCallback((id: string, updatedAt?: string) => {
    setThreads((current) => {
      const idx = current.findIndex((t) => t.id === id);
      if (idx < 0) return current;
      const item = current[idx];
      const next = [...current];
      next[idx] = { ...item, updatedAt: updatedAt ?? new Date().toISOString() };
      next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      return next;
    });
  }, []);

  return {
    threads,
    activeId,
    error,
    loading,
    refresh,
    createNew,
    rename,
    remove,
    select,
    touch,
  };
}
```

## File: apps/server/src/engine/edit-lock.ts
```typescript
// EDIT_LOCK_V1 — lock optimista in-process por recurso.
//
// Complementa el CAS del store: si dos requests del MISMO usuario
// intentan editar el mismo proyecto a la vez (doble click, doble tab),
// el segundo falla rápido con 409 sin tocar la DB.
//
// Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md
// ("Sin locks de edición").

const LOCK_TTL_MS = 10_000;

interface Lock {
  userId: string;
  resourceId: string;
  acquiredAt: number;
}

export class EditLock {
  private readonly locks = new Map<string, Lock>();

  private key(resourceType: string, resourceId: string): string {
    return `${resourceType}:${resourceId}`;
  }

  /** Intenta adquirir. Devuelve null si otro ya lo tiene. */
  acquire(userId: string, resourceType: string, resourceId: string): Lock | null {
    this.gc();
    const k = this.key(resourceType, resourceId);
    const existing = this.locks.get(k);
    if (existing && existing.userId !== userId) {
      return null;
    }
    const lock: Lock = { userId, resourceId, acquiredAt: Date.now() };
    this.locks.set(k, lock);
    return lock;
  }

  /** Libera el lock si es del usuario. */
  release(userId: string, resourceType: string, resourceId: string): void {
    const k = this.key(resourceType, resourceId);
    const existing = this.locks.get(k);
    if (existing && existing.userId === userId) {
      this.locks.delete(k);
    }
  }

  private gc(): void {
    const now = Date.now();
    for (const [k, v] of this.locks) {
      if (now - v.acquiredAt > LOCK_TTL_MS) this.locks.delete(k);
    }
  }

  clear(): void {
    this.locks.clear();
  }
}

export const globalEditLock = new EditLock();
```

## File: apps/server/src/engine/presence.ts
```typescript
// PRESENCE_V1 — presencia efímera por recurso.
//
// In-memory. No persiste. Se pierde al reiniciar el proceso.
// Sirve para avisar "otro usuario está editando este thread/proyecto".
//
// Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md
// ("Sin presence service", "Sin avisos de otro usuario está editando").

const PRESENCE_TTL_MS = 30_000;

export interface PresenceEntry {
  userId: string;
  resourceId: string;
  resourceType: "thread" | "project";
  lastSeen: number;
}

export class PresenceService {
  private readonly entries = new Map<string, PresenceEntry>();

  private key(resourceType: string, resourceId: string): string {
    return `${resourceType}:${resourceId}`;
  }

  /** Marca presencia del usuario. Devuelve quién más está editando. */
  touch(
    userId: string,
    resourceType: "thread" | "project",
    resourceId: string,
  ): { others: Array<{ userId: string; lastSeen: number }> } {
    const k = this.key(resourceType, resourceId);
    this.gc();
    const existing = this.entries.get(k);
    this.entries.set(k, {
      userId,
      resourceId,
      resourceType,
      lastSeen: Date.now(),
    });
    // En una implementación multi-usuario real, la clave incluiría userId.
    // Aquí, para simplificar, guardamos el último que tocó y devolvemos
    // como "others" a los que la key anterior tenía.
    const others: Array<{ userId: string; lastSeen: number }> = [];
    if (existing && existing.userId !== userId && Date.now() - existing.lastSeen < PRESENCE_TTL_MS) {
      others.push({ userId: existing.userId, lastSeen: existing.lastSeen });
    }
    return { others };
  }

  /** Limpia entradas caducadas. */
  private gc(): void {
    const now = Date.now();
    for (const [k, v] of this.entries) {
      if (now - v.lastSeen > PRESENCE_TTL_MS) this.entries.delete(k);
    }
  }

  /** Consulta quién está editando sin tocar presencia. */
  query(
    resourceType: "thread" | "project",
    resourceId: string,
  ): Array<{ userId: string; lastSeen: number }> {
    this.gc();
    const k = this.key(resourceType, resourceId);
    const existing = this.entries.get(k);
    if (!existing) return [];
    if (Date.now() - existing.lastSeen > PRESENCE_TTL_MS) return [];
    return [{ userId: existing.userId, lastSeen: existing.lastSeen }];
  }

  clear(): void {
    this.entries.clear();
  }
}

export const globalPresence = new PresenceService();
```

## File: apps/server/src/notification-prefs.ts
```typescript
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
```

## File: apps/server/src/threads-routes.ts
```typescript
import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";
import { globalPresence } from "./engine/presence.ts";

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

  // PRESENCE_TOUCH_V1 — el cliente marca su presencia al editar un thread.
  // Devuelve quién más está editando. Ver miniaudit 04.
  app.post("/:id/presence", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const thread = await db.get(owner, "threads", id);
    if (!thread) throw new AppError("Thread not found", 404);
    const userId = c.req.header("x-user-id") ?? owner;
    const result = globalPresence.touch(userId, "thread", id);
    return c.json(result);
  });

  // RECONCILE_THREAD_V1 — el cliente pide el estado más reciente tras un 409.
  // Devuelve updatedAt + messages para comparar con lo que tenía.
  // Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md.
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
    // THREADS_CAS_V1 — optimismo de concurrencia. El cliente envía
    // `expectedUpdatedAt` con la versión que leyó. Si el thread cambió
    // desde entonces, devolvemos 409 y el cliente recarga.
    // Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md.
    const expected = z
      .object({ expectedUpdatedAt: z.iso.datetime({ offset: true }).optional() })
      .parse(body);
    if (expected.expectedUpdatedAt !== undefined) {
      const current = await db.get<Thread>(owner, "threads", id);
      if (!current || current.updatedAt !== expected.expectedUpdatedAt) {
        throw new AppError(
          "Otro usuario ha modificado esta conversación. Recarga y vuelve a intentarlo.",
          409,
        );
      }
    }
    // Escribir la conversación con CAS: expected = updatedAt leído, patch = messages.
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
```

## File: apps/web/src/hooks/useProjects.ts
```typescript
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createProject as apiCreateProject,
  deleteProject as apiDeleteProject,
  getProject,
  listProjects,
  saveProjectBlocks as apiSaveBlocks,
  updateProject as apiUpdateProject,
  type Project,
  type ProjectBlock,
  type ProjectDetail,
  type ProjectStatus,
} from "../api/projects";

export function useProjects(enabled: boolean) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const list = await listProjects();
      if (!mountedRef.current) return;
      setProjects(list);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Error cargando proyectos");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [enabled, refresh]);

  const openDetail = useCallback(async (id: string) => {
    setActiveId(id);
    try {
      const d = await getProject(id);
      if (!mountedRef.current) return;
      setDetail(d);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Error cargando proyecto");
    }
  }, []);

  const closeDetail = useCallback(() => {
    setActiveId(null);
    setDetail(null);
  }, []);

  const create = useCallback(
    async (input: { name: string; clientId?: string; description?: string; tags?: string[] }) => {
      try {
        const project = await apiCreateProject(input);
        setProjects((current) => [project, ...current]);
        setActiveId(project.id);
        await openDetail(project.id);
        setError(null);
        return project;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error creando proyecto");
        return null;
      }
    },
    [openDetail],
  );

  const update = useCallback(
    async (
      id: string,
      patch: Partial<{
        name: string;
        clientId: string | null;
        description: string;
        status: ProjectStatus;
        tags: string[];
      }>,
    ) => {
      try {
        const updated = await apiUpdateProject(id, patch);
        setProjects((current) => current.map((p) => (p.id === id ? updated : p)));
        setDetail((current) => (current && current.id === id ? { ...current, ...updated } : current));
        setError(null);
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error actualizando");
        return null;
      }
    },
    [],
  );

  const saveBlocks = useCallback(async (id: string, blocks: ProjectBlock[]) => {
    try {
      const updated = await apiSaveBlocks(id, blocks);
      setProjects((current) => current.map((p) => (p.id === id ? updated : p)));
      setDetail((current) => (current && current.id === id ? { ...current, blocks: updated.blocks } : current));
      setError(null);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando bloques");
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await apiDeleteProject(id);
      setProjects((current) => current.filter((p) => p.id !== id));
      setActiveId((current) => {
        if (current === id) {
          setDetail(null);
          return null;
        }
        return current;
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error borrando");
    }
  }, []);

  const refreshDetail = useCallback(async () => {
    if (!activeId) return;
    await openDetail(activeId);
  }, [activeId, openDetail]);

  return {
    projects,
    activeId,
    detail,
    error,
    loading,
    refresh,
    openDetail,
    closeDetail,
    create,
    update,
    saveBlocks,
    remove,
    refreshDetail,
  };
}
```

## File: tests/edit-lock.test.ts
```typescript
// TESTS_EDIT_LOCK_V1 — lock optimista in-process.
// Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md.

import assert from "node:assert/strict";
import { test } from "node:test";
import { EditLock } from "../apps/server/src/engine/edit-lock.ts";

test("acquire: primer usuario obtiene el lock", () => {
  const lock = new EditLock();
  const acquired = lock.acquire("user-A", "project", "p1");
  assert.ok(acquired);
  assert.equal(acquired.userId, "user-A");
});

test("acquire: segundo usuario NO obtiene el lock", () => {
  const lock = new EditLock();
  lock.acquire("user-A", "project", "p1");
  const second = lock.acquire("user-B", "project", "p1");
  assert.equal(second, null);
});

test("acquire: mismo usuario puede re-adquirir", () => {
  const lock = new EditLock();
  lock.acquire("user-A", "project", "p1");
  const again = lock.acquire("user-A", "project", "p1");
  assert.ok(again);
});

test("release libera el lock si es del usuario", () => {
  const lock = new EditLock();
  lock.acquire("user-A", "project", "p1");
  lock.release("user-A", "project", "p1");
  const second = lock.acquire("user-B", "project", "p1");
  assert.ok(second);
});

test("release NO libera el lock si es de otro usuario", () => {
  const lock = new EditLock();
  lock.acquire("user-A", "project", "p1");
  lock.release("user-B", "project", "p1");
  const second = lock.acquire("user-B", "project", "p1");
  assert.equal(second, null);
});

test("locks de recursos distintos no se pisan", () => {
  const lock = new EditLock();
  lock.acquire("user-A", "project", "p1");
  const other = lock.acquire("user-A", "project", "p2");
  assert.ok(other);
});
```

## File: apps/server/src/notifications-stream.ts
```typescript
// NOTIFICATIONS_STREAM_V1 - SSE para notificaciones en vivo.

import { Hono } from "hono";
import type { AgentService } from "./engine/service.ts";
import { backgroundFailure } from "./log.ts";

export function notificationsStreamRoutes(service: AgentService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  app.get("/stream", async (c) => {
    const owner = c.get("owner");
    // NOTIF_USER_FILTER_V1 — filtrar por userId para no emitir notificaciones
    // dirigidas a otro usuario. Ver: docs/audits/04-.../miniaudit.md.
    const userId = c.req.header("x-user-id") ?? owner;
    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let lastSeen = new Set<string>();

        const push = (data: unknown, event = "notification") => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        push({ ok: true }, "ready");

        const tick = async () => {
          try {
            const items = await service.db
              .list<{ id: string; title: string; body: string; read: boolean; createdAt: string }>(
                owner,
                "notifications",
                { limit: 50 },
              );
            for (const item of items) {
              // NOTIF_USER_FILTER_V1 — solo si es del usuario o general.
              if (item.assignedTo && item.assignedTo !== userId) continue;
              if (lastSeen.has(item.id)) continue;
              lastSeen.add(item.id);
              push(item);
            }
            if (lastSeen.size > 200) lastSeen = new Set(Array.from(lastSeen).slice(-100));
          } catch (error) {
            backgroundFailure("notifications stream tick", error);
          }
        };

        void tick();
        const timer = setInterval(() => { void tick(); }, 3000);

        c.req.raw.signal.addEventListener("abort", () => {
          clearInterval(timer);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  });

  return app;
}
```

## File: apps/server/src/projects-routes.ts
```typescript
import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import type {
  AgentArtifact,
  AgentMemory,
  Project,
  ProjectBlock,
  ProjectStatus,
} from "../../../packages/domain/src/agent.ts";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";
import { globalPresence } from "./engine/presence.ts";

const blockSchema: z.ZodType<ProjectBlock> = z.object({
  id: z.string().min(1).max(100).default(() => randomUUID()),
  type: z.enum(["text", "heading", "checklist", "timeline", "note"]),
  text: z.string().max(10000),
  checked: z.boolean().optional(),
  date: z.string().max(40).optional(),
});

const statusSchema: z.ZodType<ProjectStatus> = z.enum([
  "active",
  "paused",
  "completed",
  "archived",
]);

export function projectRoutes(db: Store) {
  const app = new Hono<{ Variables: { owner: string } }>();

  app.get("/", async (c) => {
    const owner = c.get("owner");
    const projects = await db.list<Project>(owner, "projects");
    return c.json(projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  });

  app.post("/", async (c) => {
    const owner = c.get("owner");
    const body = z
      .object({
        name: z.string().trim().min(1).max(200),
        clientId: z.string().max(200).optional(),
        description: z.string().max(4000).default(""),
        tags: z.array(z.string().max(60)).max(30).default([]),
      })
      .parse(await c.req.json());
    const now = new Date().toISOString();
    const project: Project = {
      id: randomUUID(),
      name: body.name,
      ...(body.clientId ? { clientId: body.clientId } : {}),
      description: body.description,
      status: "active",
      tags: body.tags,
      blocks: [],
      linkedMemoryIds: [],
      linkedArtifactIds: [],
      createdAt: now,
      updatedAt: now,
    };
    await db.put(owner, "projects", project);
    // Vincula memorias existentes cuyo texto/tags contengan el name del proyecto.
    const memories = await db.list<AgentMemory>(owner, "memories");
    const needle = project.name.trim().toLowerCase();
    if (needle.length >= 3) {
      const matched = memories.filter((m) =>
        `${m.text} ${(m.tags ?? []).join(" ")}`.toLowerCase().includes(needle),
      );
      if (matched.length) {
        const linked: Project = {
          ...project,
          linkedMemoryIds: matched.map((m) => m.id),
          updatedAt: new Date().toISOString(),
        };
        await db.put(owner, "projects", linked);
        return c.json(linked, 201);
      }
    }
    return c.json(project, 201);
  });

  // PRESENCE_TOUCH_PROJECT_V1 — mismo patrón que threads.
  // Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md.
  app.post("/:id/presence", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const project = await db.get(owner, "projects", id);
    if (!project) throw new AppError("Project not found", 404);
    const userId = c.req.header("x-user-id") ?? owner;
    const result = globalPresence.touch(userId, "project", id);
    return c.json(result);
  });

  app.get("/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const project = await db.get<Project>(owner, "projects", id);
    if (!project) throw new AppError("Project not found", 404);
    const [memories, artifacts] = await Promise.all([
      Promise.all(
        project.linkedMemoryIds.map((mid) => db.get<AgentMemory>(owner, "memories", mid)),
      ),
      Promise.all(
        project.linkedArtifactIds.map((aid) =>
          db.get<AgentArtifact>(owner, "agent-artifacts", aid),
        ),
      ),
    ]);
    return c.json({
      ...project,
      memories: memories.filter((m): m is AgentMemory => m !== null),
      artifacts: artifacts.filter((a): a is AgentArtifact => a !== null),
    });
  });

  app.patch("/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const existing = await db.get<Project>(owner, "projects", id);
    if (!existing) throw new AppError("Project not found", 404);
    // PROJECTS_CAS_V1 — 409 si el proyecto cambió desde que el cliente lo leyó.
    // Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md.
    const rawBody = await c.req.json();
    const expected = z
      .object({ expectedUpdatedAt: z.iso.datetime({ offset: true }).optional() })
      .parse(rawBody);
    if (expected.expectedUpdatedAt !== undefined) {
      if (existing.updatedAt !== expected.expectedUpdatedAt) {
        throw new AppError(
          "Otro usuario ha modificado este proyecto. Recarga y vuelve a intentarlo.",
          409,
        );
      }
    }
    const patch = z
      .object({
        name: z.string().trim().min(1).max(200).optional(),
        clientId: z.string().max(200).nullable().optional(),
        description: z.string().max(4000).optional(),
        status: statusSchema.optional(),
        tags: z.array(z.string().max(60)).max(30).optional(),
      })
      .parse(await c.req.json());
    const updated: Project = {
      ...existing,
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
      updatedAt: new Date().toISOString(),
    };
    if (patch.clientId !== undefined) {
      if (patch.clientId === null) delete (updated as { clientId?: string }).clientId;
      else updated.clientId = patch.clientId;
    }
    await db.put(owner, "projects", updated);
    return c.json(updated);
  });

  app.put("/:id/blocks", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const existing = await db.get<Project>(owner, "projects", id);
    if (!existing) throw new AppError("Project not found", 404);
    const body = z
      .object({
        blocks: z.array(blockSchema).max(500),
        expectedUpdatedAt: z.iso.datetime({ offset: true }).optional(),
      })
      .parse(await c.req.json());
    // PROJECTS_BLOCKS_CAS_V1 — 409 si los bloques cambiaron.
    // Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md.
    if (body.expectedUpdatedAt !== undefined && existing.updatedAt !== body.expectedUpdatedAt) {
      throw new AppError(
        "Otro usuario ha modificado estos bloques. Recarga y vuelve a intentarlo.",
        409,
      );
    }
    const updated: Project = {
      ...existing,
      blocks: body.blocks,
      updatedAt: new Date().toISOString(),
    };
    await db.put(owner, "projects", updated);
    return c.json(updated);
  });

  app.post("/:id/link-memory", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const existing = await db.get<Project>(owner, "projects", id);
    if (!existing) throw new AppError("Project not found", 404);
    const body = z.object({ memoryId: z.string().min(1).max(200) }).parse(await c.req.json());
    const memory = await db.get<AgentMemory>(owner, "memories", body.memoryId);
    if (!memory) throw new AppError("Memory not found", 404);
    if (!existing.linkedMemoryIds.includes(body.memoryId)) {
      const updated: Project = {
        ...existing,
        linkedMemoryIds: [...existing.linkedMemoryIds, body.memoryId],
        updatedAt: new Date().toISOString(),
      };
      await db.put(owner, "projects", updated);
      return c.json(updated);
    }
    return c.json(existing);
  });

  app.post("/:id/unlink-memory", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const existing = await db.get<Project>(owner, "projects", id);
    if (!existing) throw new AppError("Project not found", 404);
    const body = z.object({ memoryId: z.string().min(1).max(200) }).parse(await c.req.json());
    const updated: Project = {
      ...existing,
      linkedMemoryIds: existing.linkedMemoryIds.filter((m) => m !== body.memoryId),
      updatedAt: new Date().toISOString(),
    };
    await db.put(owner, "projects", updated);
    return c.json(updated);
  });

  app.post("/:id/link-artifact", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const existing = await db.get<Project>(owner, "projects", id);
    if (!existing) throw new AppError("Project not found", 404);
    const body = z.object({ artifactId: z.string().min(1).max(200) }).parse(await c.req.json());
    const artifact = await db.get<AgentArtifact>(owner, "agent-artifacts", body.artifactId);
    if (!artifact) throw new AppError("Artifact not found", 404);
    if (!existing.linkedArtifactIds.includes(body.artifactId)) {
      const updated: Project = {
        ...existing,
        linkedArtifactIds: [...existing.linkedArtifactIds, body.artifactId],
        updatedAt: new Date().toISOString(),
      };
      await db.put(owner, "projects", updated);
      return c.json(updated);
    }
    return c.json(existing);
  });

  app.post("/:id/unlink-artifact", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const existing = await db.get<Project>(owner, "projects", id);
    if (!existing) throw new AppError("Project not found", 404);
    const body = z.object({ artifactId: z.string().min(1).max(200) }).parse(await c.req.json());
    const updated: Project = {
      ...existing,
      linkedArtifactIds: existing.linkedArtifactIds.filter((a) => a !== body.artifactId),
      updatedAt: new Date().toISOString(),
    };
    await db.put(owner, "projects", updated);
    return c.json(updated);
  });

  app.delete("/:id", async (c) => {
    const owner = c.get("owner");
    await db.remove(owner, "projects", c.req.param("id"));
    return c.json({ ok: true });
  });

  return app;
}
```

## File: apps/web/src/hooks/useChat.ts
```typescript
// BUG02_USECHAT_V2 - tools[] + typewriter en la API publica.
import { useCallback, useEffect, useRef, useState } from "react";
import { streamChat, type AgUiEvent } from "../api/chat";
import { getThread, saveThreadMessages } from "../api/threads";
import { toolsReducer, type ToolCall } from "../lib/toolsReducer";
import type { ChatAttachment, ChatMessage } from "../types/api";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function now(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function useChat(
  enabled: boolean,
  threadId: string | null,
  onSaved?: (id: string) => void,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamBuf, setStreamBuf] = useState("");
  const [tools, setTools] = useState<ToolCall[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadedThreadRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !threadId) {
      setMessages([]);
      loadedThreadRef.current = null;
      return;
    }
    if (loadedThreadRef.current === threadId) return;
    loadedThreadRef.current = threadId;
    let cancelled = false;
    void (async () => {
      try {
        const thread = await getThread(threadId);
        if (cancelled) return;
        setMessages(thread.messages ?? []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "No se pudo cargar la conversación");
      }
    })();
    return () => { cancelled = true; };
  }, [enabled, threadId]);

  const [roleId, setRoleId] = useState<string | undefined>(undefined);

  const send = useCallback(
    async (text: string, attachment?: ChatAttachment) => {
      if ((!text.trim() && !attachment) || streaming || !threadId) return;
      const trimmed = text.trim();
      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed || `Adjunto: ${attachment?.name ?? "archivo"}`,
        timestamp: now(),
        attachment,
      };
      const history = [...messages, userMsg];
      setMessages(history);
      setStreaming(true);
      setStreamBuf("");
      setTools([]);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      const llmContent = attachment
        ? `${trimmed || "(sin texto)"}\n\n[Adjunto: ${attachment.name}, id: ${attachment.id}]`
        : trimmed;

      let assistantText = "";
      let localTools: ToolCall[] = [];
      let runErrorMessage: string | null = null;

      try {
        await streamChat(
          {
            threadId,
            runId: uid(),
            ...(roleId ? { roleId } : {}),
            messages: history.map((m, i) =>
              i === history.length - 1
                ? { id: m.id, role: m.role, content: llmContent }
                : { id: m.id, role: m.role, content: m.content },
            ),
          },
          (event: AgUiEvent) => {
            const at = Date.now();
            if (
              (event.type === "TEXT_MESSAGE_CONTENT" || event.type === "TEXT_MESSAGE_CHUNK") &&
              typeof event.delta === "string"
            ) {
              assistantText += event.delta;
              setStreamBuf(assistantText);
            } else if (event.type === "RUN_STARTED") {
              localTools = toolsReducer(localTools, { type: "RUN_STARTED" });
              setTools([...localTools]);
            } else if (event.type === "TOOL_CALL_START" && typeof event.toolCallName === "string") {
              localTools = toolsReducer(localTools, {
                type: "TOOL_CALL_START",
                id: String(event.toolCallId ?? uid()),
                name: event.toolCallName,
                at,
              });
              setTools([...localTools]);
            } else if (event.type === "TOOL_CALL_END") {
              localTools = toolsReducer(localTools, {
                type: "TOOL_CALL_END",
                id: String(event.toolCallId ?? ""),
                at,
              });
              setTools([...localTools]);
            } else if (event.type === "RUN_ERROR") {
              runErrorMessage = String(event.message ?? "Error del modelo");
            }
          },
          controller.signal,
        );

        if (runErrorMessage && !assistantText.trim()) {
          setError(runErrorMessage);
          return;
        }

        const finalAssistant: ChatMessage = {
          id: uid(),
          role: "assistant",
          content: assistantText.trim() || "(sin respuesta)",
          timestamp: now(),
          tools: localTools.length > 0 ? localTools : undefined,
        };
        const finalHistory = [...history, finalAssistant];
        setMessages(finalHistory);
        setStreamBuf("");
        setTools([]);
        try {
          await saveThreadMessages(threadId, finalHistory);
          onSaved?.(threadId);
        } catch {
          /* se persiste en el próximo turno */
        }
      } catch (err) {
        if (controller.signal.aborted) setError("Cancelado por el usuario");
        else setError(err instanceof Error ? err.message : "Error en el stream");
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming, threadId, onSaved, roleId],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    messages,
    streaming,
    streamBuf,
    tools,
    error,
    send,
    cancel,
    threadId,
    roleId,
    setRoleId,
  };
}
```
