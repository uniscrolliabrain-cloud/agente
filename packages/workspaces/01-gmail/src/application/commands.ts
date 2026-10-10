// 01-gmail - handlers reales de comandos.
import { z } from "zod";
import { emailMessageSchema, emailThreadSchema, emailLabelSchema } from "../domain/entities.ts";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

const importMessagePayload = z.object({
  from: z.string().max(500),
  to: z.array(z.string().max(500)).default([]),
  cc: z.array(z.string().max(500)).default([]),
  subject: z.string().max(998),
  body: z.string().max(200000),
  threadId: z.string().max(200).optional(),
  receivedAt: z.string(),
  labels: z.array(z.string().max(100)).default([]),
});

const sendMessagePayload = z.object({
  to: z.array(z.string().max(500)).min(1),
  cc: z.array(z.string().max(500)).default([]),
  bcc: z.array(z.string().max(500)).default([]),
  subject: z.string().max(998),
  body: z.string().max(200000),
  threadId: z.string().max(200).optional(),
});

const labelMessagePayload = z.object({
  messageId: z.string().min(1).max(200),
  label: z.string().min(1).max(100),
});

const archiveThreadPayload = z.object({
  threadId: z.string().min(1).max(200),
});

async function importMessage(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const p = importMessagePayload.parse(env.payload);
  const id = env.idempotencyKey ?? msg-;
  const threadId = p.threadId ?? 	hr-;
  const existing = await services.db.get<{ id: string }>(ctx.owner, "ws-gmail-messages", id);
  if (existing) return { status: "ok", entityId: id };
  const entity = emailMessageSchema.parse({ id, threadId, tenantId: ctx.tenantId, from: p.from, to: p.to, cc: p.cc, bcc: [], subject: p.subject, body: p.body, receivedAt: p.receivedAt, labels: p.labels });
  await services.db.insertIfAbsent(ctx.owner, "ws-gmail-messages", entity);
  const thr = await services.db.get<{ id: string; messageIds: string[] }>(ctx.owner, "ws-gmail-threads", threadId);
  if (thr) { await services.db.put(ctx.owner, "ws-gmail-threads", { ...thr, messageIds: [...thr.messageIds, id] }); }
  else { const t = emailThreadSchema.parse({ id: threadId, tenantId: ctx.tenantId, subject: p.subject, messageIds: [id], participants: [p.from], lastMessageAt: p.receivedAt }); await services.db.insertIfAbsent(ctx.owner, "ws-gmail-threads", t); }
  await services.bus?.emit(ctx.owner, "email.received", { kind: "system", id: ctx.workspaceId }, { entityId: id, threadId, from: p.from }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

async function sendMessage(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const p = sendMessagePayload.parse(env.payload);
  const id = env.idempotencyKey ?? msg-;
  const threadId = p.threadId ?? 	hr-;
  const now = new Date().toISOString();
  const entity = emailMessageSchema.parse({ id, threadId, tenantId: ctx.tenantId, from: ctx.owner, to: p.to, cc: p.cc, bcc: p.bcc, subject: p.subject, body: p.body, receivedAt: now, sentAt: now });
  await services.db.insertIfAbsent(ctx.owner, "ws-gmail-messages", entity);
  await services.bus?.emit(ctx.owner, "email.sent", { kind: "system", id: ctx.workspaceId }, { entityId: id, threadId }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

async function labelMessage(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const p = labelMessagePayload.parse(env.payload);
  const m = await services.db.get<{ id: string; labels?: string[] }>(ctx.owner, "ws-gmail-messages", p.messageId);
  if (!m) return { status: "rejected", reason: "message not found" };
  const labels = Array.from(new Set([...(m.labels ?? []), p.label]));
  await services.db.put(ctx.owner, "ws-gmail-messages", { ...m, labels });
  await services.bus?.emit(ctx.owner, "email.label.applied", { kind: "system", id: ctx.workspaceId }, { entityId: p.messageId, label: p.label }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: p.messageId };
}

async function archiveThread(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const p = archiveThreadPayload.parse(env.payload);
  const t = await services.db.get<{ id: string; archived?: boolean }>(ctx.owner, "ws-gmail-threads", p.threadId);
  if (!t) return { status: "rejected", reason: "thread not found" };
  await services.db.put(ctx.owner, "ws-gmail-threads", { ...t, archived: true });
  return { status: "ok", entityId: p.threadId };
}

export const COMMANDS = {
  "email.import_message": { commandId: "email.import_message", version: 1, handle: importMessage },
  "email.send": { commandId: "email.send", version: 1, handle: sendMessage },
  "email.label": { commandId: "email.label", version: 1, handle: labelMessage },
  "email.archive": { commandId: "email.archive", version: 1, handle: archiveThread },
};
