// 13-productive - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const project_allocatePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function project_allocate(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  project_allocatePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `productive-${crypto.randomUUID()}`;
  const kind = "ws-productive-project.allocate";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "project.allocate", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "resource.allocated", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const project_closePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function project_close(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  project_closePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `productive-${crypto.randomUUID()}`;
  const kind = "ws-productive-project.close";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "project.close", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "resource.allocated", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const time_logPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function time_log(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  time_logPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `productive-${crypto.randomUUID()}`;
  const kind = "ws-productive-time.log";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "time.log", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "resource.allocated", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const budget_adjustPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function budget_adjust(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  budget_adjustPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `productive-${crypto.randomUUID()}`;
  const kind = "ws-productive-budget.adjust";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "budget.adjust", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "resource.allocated", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "project.allocate": { commandId: "project.allocate", version: 1, handle: project_allocate },
  "project.close": { commandId: "project.close", version: 1, handle: project_close },
  "time.log": { commandId: "time.log", version: 1, handle: time_log },
  "budget.adjust": { commandId: "budget.adjust", version: 1, handle: budget_adjust },
};
