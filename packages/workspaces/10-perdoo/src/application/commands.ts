// 10-perdoo - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const objective_createPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function objective_create(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  objective_createPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `perdoo-${crypto.randomUUID()}`;
  const kind = "ws-perdoo-objective.create";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "objective.create", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "objective.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const objective_update_krPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function objective_update_kr(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  objective_update_krPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `perdoo-${crypto.randomUUID()}`;
  const kind = "ws-perdoo-objective.update_kr";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "objective.update_kr", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "objective.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const objective_link_strategyPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function objective_link_strategy(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  objective_link_strategyPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `perdoo-${crypto.randomUUID()}`;
  const kind = "ws-perdoo-objective.link_strategy";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "objective.link_strategy", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "objective.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const objective_closePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function objective_close(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  objective_closePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `perdoo-${crypto.randomUUID()}`;
  const kind = "ws-perdoo-objective.close";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "objective.close", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "objective.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "objective.create": { commandId: "objective.create", version: 1, handle: objective_create },
  "objective.update_kr": { commandId: "objective.update_kr", version: 1, handle: objective_update_kr },
  "objective.link_strategy": { commandId: "objective.link_strategy", version: 1, handle: objective_link_strategy },
  "objective.close": { commandId: "objective.close", version: 1, handle: objective_close },
};
