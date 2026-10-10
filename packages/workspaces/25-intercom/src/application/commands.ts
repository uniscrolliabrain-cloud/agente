// 25-intercom - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const conversation_openPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function conversation_open(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  conversation_openPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `intercom-${crypto.randomUUID()}`;
  const kind = "ws-intercom-conversation.open";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "conversation.open", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "conversation.opened", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const conversation_sendPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function conversation_send(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  conversation_sendPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `intercom-${crypto.randomUUID()}`;
  const kind = "ws-intercom-conversation.send";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "conversation.send", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "conversation.opened", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const conversation_routePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function conversation_route(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  conversation_routePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `intercom-${crypto.randomUUID()}`;
  const kind = "ws-intercom-conversation.route";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "conversation.route", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "conversation.opened", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const conversation_closePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function conversation_close(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  conversation_closePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `intercom-${crypto.randomUUID()}`;
  const kind = "ws-intercom-conversation.close";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "conversation.close", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "conversation.opened", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "conversation.open": { commandId: "conversation.open", version: 1, handle: conversation_open },
  "conversation.send": { commandId: "conversation.send", version: 1, handle: conversation_send },
  "conversation.route": { commandId: "conversation.route", version: 1, handle: conversation_route },
  "conversation.close": { commandId: "conversation.close", version: 1, handle: conversation_close },
};
