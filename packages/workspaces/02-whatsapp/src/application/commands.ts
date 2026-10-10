// 02-whatsapp - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const messaging_sendPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function messaging_send(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  messaging_sendPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `whatsapp-${crypto.randomUUID()}`;
  const kind = "ws-whatsapp-messaging.send";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "messaging.send", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "whatsapp.message.received", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const messaging_send_templatePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function messaging_send_template(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  messaging_send_templatePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `whatsapp-${crypto.randomUUID()}`;
  const kind = "ws-whatsapp-messaging.send_template";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "messaging.send_template", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "whatsapp.message.received", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const messaging_send_mediaPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function messaging_send_media(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  messaging_send_mediaPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `whatsapp-${crypto.randomUUID()}`;
  const kind = "ws-whatsapp-messaging.send_media";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "messaging.send_media", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "whatsapp.message.received", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const messaging_link_identityPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function messaging_link_identity(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  messaging_link_identityPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `whatsapp-${crypto.randomUUID()}`;
  const kind = "ws-whatsapp-messaging.link_identity";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "messaging.link_identity", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "whatsapp.message.received", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const messaging_mark_readPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function messaging_mark_read(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  messaging_mark_readPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `whatsapp-${crypto.randomUUID()}`;
  const kind = "ws-whatsapp-messaging.mark_read";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "messaging.mark_read", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "whatsapp.message.received", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "messaging.send": { commandId: "messaging.send", version: 1, handle: messaging_send },
  "messaging.send_template": { commandId: "messaging.send_template", version: 1, handle: messaging_send_template },
  "messaging.send_media": { commandId: "messaging.send_media", version: 1, handle: messaging_send_media },
  "messaging.link_identity": { commandId: "messaging.link_identity", version: 1, handle: messaging_link_identity },
  "messaging.mark_read": { commandId: "messaging.mark_read", version: 1, handle: messaging_mark_read },
};
