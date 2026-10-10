// 07-linear - handlers reales de comandos.
import { z } from "zod";
import { workItemSchema, projectSchema } from "../domain/entities.ts";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

const createWorkItemPayload = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(50000).optional(),
  status: z.enum(["backlog","todo","in_progress","blocked","in_review","done","cancelled"]).default("todo"),
  priority: z.enum(["no_priority","low","medium","high","urgent"]).default("medium"),
  projectId: z.string().max(200).optional(),
});

const assignWorkItemPayload = z.object({
  workItemId: z.string().min(1).max(200),
  assigneeId: z.string().min(1).max(200),
});

const changeStatusPayload = z.object({
  workItemId: z.string().min(1).max(200),
  status: z.enum(["backlog","todo","in_progress","blocked","in_review","done","cancelled"]),
});

const closeWorkItemPayload = z.object({
  workItemId: z.string().min(1).max(200),
});

async function createWorkItem(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const p = createWorkItemPayload.parse(env.payload);
  const id = env.idempotencyKey ?? wi-;
  const existing = await services.db.get<{ id: string }>(ctx.owner, "ws-linear-workitems", id);
  if (existing) return { status: "ok", entityId: id };
  const now = new Date().toISOString();
  const entity = workItemSchema.parse({ id, tenantId: ctx.tenantId, title: p.title, description: p.description, status: p.status, priority: p.priority, projectId: p.projectId, createdAt: now, updatedAt: now });
  await services.db.insertIfAbsent(ctx.owner, "ws-linear-workitems", entity);
  await services.bus?.emit(ctx.owner, "workitem.created", { kind: "system", id: ctx.workspaceId }, { entityId: id, title: p.title }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

async function assignWorkItem(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const p = assignWorkItemPayload.parse(env.payload);
  const w = await services.db.get<{ id: string }>(ctx.owner, "ws-linear-workitems", p.workItemId);
  if (!w) return { status: "rejected", reason: "workitem not found" };
  await services.db.put(ctx.owner, "ws-linear-workitems", { ...w, assigneeId: p.assigneeId, updatedAt: new Date().toISOString() });
  await services.bus?.emit(ctx.owner, "workitem.assigned", { kind: "system", id: ctx.workspaceId }, { entityId: p.workItemId, assigneeId: p.assigneeId }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: p.workItemId };
}

async function changeStatus(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const p = changeStatusPayload.parse(env.payload);
  const w = await services.db.get<{ id: string }>(ctx.owner, "ws-linear-workitems", p.workItemId);
  if (!w) return { status: "rejected", reason: "workitem not found" };
  await services.db.put(ctx.owner, "ws-linear-workitems", { ...w, status: p.status, updatedAt: new Date().toISOString() });
  return { status: "ok", entityId: p.workItemId };
}

async function closeWorkItem(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const p = closeWorkItemPayload.parse(env.payload);
  const w = await services.db.get<{ id: string }>(ctx.owner, "ws-linear-workitems", p.workItemId);
  if (!w) return { status: "rejected", reason: "workitem not found" };
  const now = new Date().toISOString();
  await services.db.put(ctx.owner, "ws-linear-workitems", { ...w, status: "done", completedAt: now, updatedAt: now });
  await services.bus?.emit(ctx.owner, "workitem.completed", { kind: "system", id: ctx.workspaceId }, { entityId: p.workItemId }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: p.workItemId };
}

export const COMMANDS = {
  "work.create": { commandId: "work.create", version: 1, handle: createWorkItem },
  "work.assign": { commandId: "work.assign", version: 1, handle: assignWorkItem },
  "work.change_status": { commandId: "work.change_status", version: 1, handle: changeStatus },
  "work.close": { commandId: "work.close", version: 1, handle: closeWorkItem },
};
