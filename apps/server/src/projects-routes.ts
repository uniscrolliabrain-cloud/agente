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
      .object({ blocks: z.array(blockSchema).max(500) })
      .parse(await c.req.json());
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