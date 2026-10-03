// ADMIN_CLIENTS_V1 - panel maestro de clientes. Solo admin.
// Lista los clientes del repo (clientes/<nombre>/) y su estado real
// en la DB del tenant correspondiente.

import { Hono } from "hono";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import type { AgentRole, AgentTask } from "../../../packages/domain/src/agent.ts";
import type { SOP } from "../../../packages/domain/src/sop.ts";
import type { AgentService } from "./engine/service.ts";
import { AppError } from "./errors.ts";
import type { UserService } from "./users.ts";

interface ClientSummary {
  name: string;
  displayName?: string;
  adminEmail?: string | null;
  sops?: number;
  skills?: number;
  docs?: number;
  agentes?: number;
  users?: number;
  memorias?: number;
  provisioned?: {
    roles: number;
    sops: number;
    tasks: number;
    files: number;
  };
  updatedAt?: string;
}

async function countFiles(dir: string): Promise<number> {
  try {
    const entries = await readdir(dir);
    return entries.filter((e) => !e.startsWith(".")).length;
  } catch {
    return 0;
  }
}

async function countJsonArray(path: string): Promise<number> {
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.length;
    if (parsed && typeof parsed === "object") {
      for (const key of Object.keys(parsed)) {
        const value = (parsed as Record<string, unknown>)[key];
        if (Array.isArray(value)) return value.length;
      }
    }
    return 0;
  } catch {
    return 0;
  }
}

export function adminClientsRoutes(service: AgentService, users: UserService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  const requireAdmin = async (owner: string) => {
    const user = await users.getById(owner);
    if (!user || user.role !== "admin") throw new AppError("Solo admin", 403);
  };

  app.get("/", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);

    const root = join(process.cwd(), "clientes");
    let entries: string[] = [];
    try {
      const dirents = await readdir(root, { withFileTypes: true });
      entries = dirents
        .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
        .map((d) => d.name);
    } catch {
      return c.json({ clients: [] });
    }

    const clients: ClientSummary[] = [];
    for (const name of entries) {
      const dir = join(root, name);
      const summary: ClientSummary = { name };

      try {
        const config = JSON.parse(await readFile(join(dir, "config.json"), "utf8")) as {
          name?: string;
          adminEmail?: string;
        };
        summary.displayName = config.name ?? name;
        summary.adminEmail = config.adminEmail ?? null;
      } catch {
        /* sin config */
      }

      summary.sops = await countFiles(join(dir, "sops"));
      summary.skills = await countFiles(join(dir, "skills"));
      summary.docs = await countFiles(join(dir, "docs"));
      summary.agentes = await countJsonArray(join(dir, "agentes.json"));
      summary.users = await countJsonArray(join(dir, "users.json"));
      summary.memorias = await countJsonArray(join(dir, "memorias.json"));

      // Estado real en la DB del tenant.
      try {
        const tenantId = name;
        const roles = await service.db.list<AgentRole>(tenantId, "agent-roles", { limit: 200 });
        const sops = await service.db.list<SOP>(tenantId, "sops", { limit: 500 });
        const tasks = await service.db.list<AgentTask>(tenantId, "tasks", { limit: 1000 });
        const files = await service.db.list<{ id: string }>(tenantId, "files", { limit: 5000 });
        summary.provisioned = {
          roles: roles.length,
          sops: sops.length,
          tasks: tasks.length,
          files: files.length,
        };
      } catch {
        /* tenant sin provisionar */
      }

      try {
        const s = await stat(dir);
        summary.updatedAt = s.mtime.toISOString();
      } catch {
        /* ignorar */
      }

      clients.push(summary);
    }

    return c.json({ clients });
  });

  app.get("/:name", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const name = c.req.param("name");
    const dir = join(process.cwd(), "clientes", name);
    try {
      const config = JSON.parse(await readFile(join(dir, "config.json"), "utf8"));
      return c.json({ name, config });
    } catch {
      throw new AppError("Cliente no encontrado", 404);
    }
  });

  return app;
}