import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import type {
  AgentIdentity,
  AgentMemory,
  AgentNotification,
} from "../../../../packages/domain/src/agent.ts";
// AGENT_ROLE_V2_ROUTE — el schema vive en el dominio para que ruta y tipo no divergan.
import { agentRoleSchema } from "../../../../packages/domain/src/agent.ts";
import { AppError } from "../errors.ts";
import type { AgentService } from "./service.ts";

const text = z.string().trim().min(1).max(4000);
// MEMORY_FULL_SCHEMA — la UI edita category y tags; el route debe aceptarlos.
const memoryCategories = z.enum(["empresa","cliente","proceso","preferencia","rrhh","producto","otro"]);
const memorySchema = z.object({
  text,
  source: z.string().trim().min(1).max(200).optional(),
  category: memoryCategories.optional(),
  tags: z.array(z.string().max(60)).max(30).optional(),
});
const goalPatchSchema = z.object({
  status: z.enum(["active", "paused", "completed"]).optional(),
  milestones: z
    .array(
      z.object({
        id: z.string().min(1).max(200),
        title: z.string().trim().min(1).max(200),
        done: z.boolean(),
      }),
    )
    .max(100)
    .optional(),
});

/** Minimal RFC 4180-style CSV parser: quoted fields with "" escapes, commas, CR/LF. */
const parseCsv = (csv: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const source = csv.replace(/^\uFEFF/, "");
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\r") continue;
    else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
};

export function agentRoutes(service: AgentService): Hono<{ Variables: { owner: string } }> {
  const app = new Hono<{ Variables: { owner: string } }>();
  app.get("/", async (c) => c.json(await service.snapshot(c.get("owner"))));
  app.post("/tasks", async (c) =>
    c.json(await service.createTask(c.get("owner"), await c.req.json()), 201),
  );
  app.get("/tasks/:id", async (c) =>
    c.json(await service.detail(c.get("owner"), c.req.param("id"))),
  );
  app.post("/tasks/:id/control", async (c) => {
    const { action } = z
      .object({ action: z.enum(["pause", "resume", "cancel", "retry"]) })
      .parse(await c.req.json());
    return c.json(await service.control(c.get("owner"), c.req.param("id"), action));
  });
  app.post("/tasks/:id/escalate", async (c) => {
    const body = z
      .object({
        toUserId: z.string().min(1).max(200),
        reason: z.string().trim().min(1).max(2000),
      })
      .parse(await c.req.json());
    return c.json(
      await service.escalateTask(
        c.get("owner"),
        c.req.param("id"),
        body.toUserId,
        body.reason,
      ),
    );
  });
  app.post("/tasks/:id/input", async (c) => {
    const body = z
      .object({
        answer: z.string().trim().min(1).max(12000),
        fields: z
          .record(z.string().min(1).max(300), z.union([z.string().max(12000), z.boolean()]))
          .optional(),
      })
      .parse(await c.req.json());
    return c.json(
      await service.answer(c.get("owner"), c.req.param("id"), body.answer, body.fields),
    );
  });
  app.post("/goals", async (c) =>
    c.json(await service.createGoal(c.get("owner"), await c.req.json()), 201),
  );
  // GOAL_RUN_ENDPOINT_V1 - dispara el ciclo del orquestador.
  app.post("/goals/:id/run", async (c) => {
    const owner = c.get("owner");
    const goalId = c.req.param("id");
    const goal = await service.db.get<import("../../../../packages/domain/src/goal.ts").Goal>(owner, "goals", goalId);
    if (!goal) throw new AppError("Goal not found", 404);
    const tenantId = await service.tenantService?.tenantIdFor(owner) ?? owner;
    const result = await service.orchestrator.runGoal(
      { tenantId, owner, role: "user", requestId: "goal-run:" + goalId, goalId },
      goal,
    );
    return c.json(result);
  });
  app.post("/goals/:id", async (c) => {
    const body = goalPatchSchema.parse(await c.req.json());
    return c.json(await service.updateGoal(c.get("owner"), c.req.param("id"), body));
  });
  app.post("/monitors", async (c) =>
    c.json(await service.createMonitor(c.get("owner"), await c.req.json()), 201),
  );
  app.post("/monitors/:id/control", async (c) => {
    const { action } = z
      .object({ action: z.enum(["pause", "resume", "stop", "check"]) })
      .parse(await c.req.json());
    return c.json(await service.controlMonitor(c.get("owner"), c.req.param("id"), action));
  });
  app.post("/ideas/refresh", async (c) => c.json(await service.refreshIdeas(c.get("owner"))));
  app.post("/ideas/:id", async (c) => {
    const body = z
      .object({
        action: z.enum(["accept", "dismiss"]),
        prompt: z.string().trim().min(1).max(12000).optional(),
      })
      .parse(await c.req.json());
    return c.json(
      await service.decideIdea(c.get("owner"), c.req.param("id"), body.action, body.prompt),
    );
  });
  app.post("/memories", async (c) => {
    const body = memorySchema.parse(await c.req.json());
    const memory: AgentMemory = {
      id: randomUUID(),
      text: body.text,
      source: body.source ?? "You",
      createdAt: new Date().toISOString(),
    };
    return c.json(await service.db.put(c.get("owner"), "memories", memory), 201);
  });
  app.post("/memories/:id", async (c) => {
    const body = memorySchema.parse(await c.req.json());
    const memory = await service.db.compareAndSwap<AgentMemory>(
      c.get("owner"),
      "memories",
      c.req.param("id"),
      {},
      body,
    );
    if (!memory) throw new AppError("Memory not found", 404);
    return c.json(memory);
  });
  app.post("/memories/:id/forget", async (c) => {
    if (!(await service.db.take(c.get("owner"), "memories", c.req.param("id"))))
      throw new AppError("Memory not found", 404);
    return c.json({ ok: true });
  });
  app.get("/roles", async (c) => c.json(await service.listAgents(c.get("owner"))));

  app.post("/roles", async (c) => {
    // AGENT_ROLE_V2_ROUTE — se usa agentRoleSchema del dominio en vez de un z.object inline:
    // el inline solo aceptaba id/name/objetivo/sops/active, asi que un rol creado por aqui se
    // guardaba sin tone/avatar/memories mientras AgentRole los exige. Con el schema compartido,
    // la ruta y el tipo no pueden volver a divergir.
    const body = agentRoleSchema.parse(await c.req.json());
    const owner = c.get("owner");
    const existing = await service.db.get(owner, "agent-roles", body.id);
    if (existing) throw new AppError("Agent role ya existe", 409);
    await service.db.put(owner, "agent-roles", body);
    return c.json(body, 201);
  });

  app.post("/identity", async (c) => {
    const body = z
      .object({
        name: z.string().trim().min(1).max(80),
        tone: z.enum(["warm", "concise", "thoughtful"]),
        avatar: z.enum(["sky", "sand", "lilac"]).optional(),
        showChatUpdates: z.boolean().optional(),
      })
      .parse(await c.req.json());
    const owner = c.get("owner");
    await service.ensure(owner);
    const identity = await service.db.compareAndSwap<AgentIdentity>(
      owner,
      "agent-settings",
      "identity",
      {},
      body,
    );
    if (!identity) throw new AppError("Agent identity changed; refresh and try again", 409);
    return c.json(identity);
  });
  app.get("/notifications", async (c) =>
    c.json((await service.snapshot(c.get("owner"))).notifications),
  );
  app.post("/notifications/:id/read", async (c) => {
    const notification = await service.db.compareAndSwap<AgentNotification>(
      c.get("owner"),
      "notifications",
      c.req.param("id"),
      {},
      { read: true },
    );
    if (!notification) throw new AppError("Notification not found", 404);
    return c.json(notification);
  });
  /**
   * Panel maestro de clientes: lista los directorios en `clientes/` con un resumen de
   * lo que provisionaria (SOPs, skills, memorias, usuarios). Solo lectura: los clientes
   * viven en el repo, no en la DB. No ejecuta provisioning ni toca la API.
   */
  app.get("/admin/clients", async (c) => {
    const { readdir, readFile, stat } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const root = join(process.cwd(), "clientes");
    let entries: string[] = [];
    try {
      const dirents = await readdir(root, { withFileTypes: true });
      entries = dirents.filter((d) => d.isDirectory() && !d.name.startsWith("_")).map((d) => d.name);
    } catch {
      return c.json({ clients: [] });
    }
    const clients = [];
    for (const name of entries) {
      const dir = join(root, name);
      const summary: Record<string, unknown> = { name };
      try {
        const config = JSON.parse(await readFile(join(dir, "config.json"), "utf8"));
        summary.displayName = config.name ?? name;
        summary.adminEmail = config.adminEmail ?? null;
      } catch {
        summary.configMissing = true;
      }
      for (const [folder, kind] of [
        ["sops", "sops"],
        ["skills", "skills"],
        ["docs", "docs"],
      ] as const) {
        try {
          const files = await readdir(join(dir, folder));
          summary[kind] = files.length;
        } catch {
          summary[kind] = 0;
        }
      }
      for (const file of ["memorias.json", "agentes.json", "users.json"]) {
        try {
          const value = JSON.parse(await readFile(join(dir, file), "utf8"));
          const key = file.replace(".json", "");
          summary[key] = Array.isArray(value) ? value.length : 0;
        } catch {
          summary[file.replace(".json", "")] = 0;
        }
      }
      try {
        const s = await stat(dir);
        summary.updatedAt = s.mtime.toISOString();
      } catch {}
      clients.push(summary);
    }
    return c.json({ clients });
  });
  // PUBLIC_ROLES_ENDPOINT — canon publico de los personajes para el repo de redes.
  // Solo expone id, name, tone, avatar, objetivo, roi e identidad. Nada interno.
  app.get("/roles/public", async (c) => c.json(await service.publicRoles(c.get("owner"))));
  app.get("/usage", async (c) => c.json(await service.usageSummary(c.get("owner"))));
  app.get("/search", async (c) => {
    const q = z.string().min(2).max(200).parse(c.req.query("q"));
    const limit = Math.min(Number(c.req.query("limit") ?? "30") || 30, 100);
    return c.json(await service.globalSearch(c.get("owner"), q, limit));
  });
  // FEEDBACK_ROUTE_V1 - el usuario deja feedback sobre un outcome.
  app.post("/feedback", async (c) => {
    const owner = c.get("owner");
    const body = z.object({
      goalId: z.string().max(200).optional(),
      taskId: z.string().max(200).optional(),
      rating: z.enum(["useful", "not_useful", "neutral"]),
      comment: z.string().max(2000).optional(),
    }).parse(await c.req.json());
    const entry = {
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tenantId: owner,
      owner,
      ...body,
      createdAt: new Date().toISOString(),
    };
    await service.db.put(owner, "feedback", entry);
    return c.json(entry, 201);
  });

  app.post("/sample-page", async (c) => {
    if (service.config.mode !== "sample") throw new AppError("Not found", 404);
    const body = z.object({ text: z.string().max(100000) }).parse(await c.req.json());
    await service.db.put(c.get("owner"), "sample-pages", { id: "availability", text: body.text });
    return c.json({ ok: true });
  });
  app.post("/sample-business-records", async (c) => {
    if (service.config.mode !== "sample") throw new AppError("Not found", 404);
    const rows = z.array(z.record(z.string(), z.unknown())).max(500).parse(await c.req.json());
    for (const row of rows) await service.db.put(c.get("owner"), "business-records", { id: String(row.id ?? randomUUID()), ...row });
    return c.json({ ok: true, count: rows.length });
  });
  // Owner-scoped business records, available in sample AND live modes.
  const businessRecordSchema = z.looseObject({
    id: z.string().trim().min(1).max(200),
  });
  app.get("/business-records", async (c) =>
    c.json(await service.db.list(c.get("owner"), "business-records")),
  );
  app.post("/business-records", async (c) => {
    const body = z
      .union([businessRecordSchema, z.array(businessRecordSchema).max(500)])
      .parse(await c.req.json());
    const rows = Array.isArray(body) ? body : [body];
    for (const row of rows)
      await service.db.put(c.get("owner"), "business-records", { ...row, id: row.id });
    return c.json({ ok: true, count: rows.length }, 201);
  });
  app.delete("/business-records/:id", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    if (!(await service.db.get(owner, "business-records", id)))
      throw new AppError("Business record not found", 404);
    await service.db.remove(owner, "business-records", id);
    return c.json({ ok: true });
  });
  // CSV import: the first row is the header; every record gets a fresh uuid id and the body kind.
  app.post("/business-records/import", async (c) => {
    const body = z
      .object({
        csv: z.string().min(1).max(4_000_000),
        kind: z.string().trim().min(1).max(100),
      })
      .parse(await c.req.json());
    const [header, ...data] = parseCsv(body.csv);
    const columns = header?.map((name) => name.trim()).filter((name) => name.length > 0) ?? [];
    if (!columns.length)
      throw new AppError("CSV must start with a header row of column names", 422);
    if (data.length > 1000) throw new AppError("CSV import accepts at most 1000 rows", 422);
    const owner = c.get("owner");
    let count = 0;
    for (const cells of data) {
      if (!cells.some((value) => value.trim() !== "")) continue;
      const values: Record<string, unknown> = {};
      columns.forEach((name, index) => {
        values[name] = cells[index] ?? "";
      });
      const record = { ...values, id: randomUUID(), kind: body.kind };
      await service.db.put(owner, "business-records", record);
      count++;
    }
    return c.json({ ok: true, count, kind: body.kind }, 201);
  });
  return app;
}

