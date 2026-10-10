// 08-chatgpt - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const assistant_send_messagePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function assistant_send_message(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  assistant_send_messagePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `chatgpt-${crypto.randomUUID()}`;
  const kind = "ws-chatgpt-assistant.send_message";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "assistant.send_message", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "assistant.run.started", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const assistant_trigger_toolPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function assistant_trigger_tool(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  assistant_trigger_toolPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `chatgpt-${crypto.randomUUID()}`;
  const kind = "ws-chatgpt-assistant.trigger_tool";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "assistant.trigger_tool", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "assistant.run.started", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const assistant_approve_actionPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function assistant_approve_action(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  assistant_approve_actionPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `chatgpt-${crypto.randomUUID()}`;
  const kind = "ws-chatgpt-assistant.approve_action";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "assistant.approve_action", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "assistant.run.started", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const assistant_list_conversationsPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function assistant_list_conversations(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  assistant_list_conversationsPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `chatgpt-${crypto.randomUUID()}`;
  const kind = "ws-chatgpt-assistant.list_conversations";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "assistant.list_conversations", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "assistant.run.started", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "assistant.send_message": { commandId: "assistant.send_message", version: 1, handle: assistant_send_message },
  "assistant.trigger_tool": { commandId: "assistant.trigger_tool", version: 1, handle: assistant_trigger_tool },
  "assistant.approve_action": { commandId: "assistant.approve_action", version: 1, handle: assistant_approve_action },
  "assistant.list_conversations": { commandId: "assistant.list_conversations", version: 1, handle: assistant_list_conversations },
};
