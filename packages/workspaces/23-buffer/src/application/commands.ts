// 23-buffer - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const post_composePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function post_compose(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  post_composePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `buffer-${crypto.randomUUID()}`;
  const kind = "ws-buffer-post.compose";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "post.compose", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "post.composed", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const post_schedulePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function post_schedule(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  post_schedulePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `buffer-${crypto.randomUUID()}`;
  const kind = "ws-buffer-post.schedule";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "post.schedule", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "post.composed", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const post_publishPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function post_publish(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  post_publishPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `buffer-${crypto.randomUUID()}`;
  const kind = "ws-buffer-post.publish";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "post.publish", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "post.composed", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const post_cancelPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function post_cancel(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  post_cancelPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `buffer-${crypto.randomUUID()}`;
  const kind = "ws-buffer-post.cancel";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "post.cancel", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "post.composed", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "post.compose": { commandId: "post.compose", version: 1, handle: post_compose },
  "post.schedule": { commandId: "post.schedule", version: 1, handle: post_schedule },
  "post.publish": { commandId: "post.publish", version: 1, handle: post_publish },
  "post.cancel": { commandId: "post.cancel", version: 1, handle: post_cancel },
};
