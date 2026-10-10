// 14-zendesk - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const ticket_createPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function ticket_create(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  ticket_createPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `zendesk-${crypto.randomUUID()}`;
  const kind = "ws-zendesk-ticket.create";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "ticket.create", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "ticket.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const ticket_assignPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function ticket_assign(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  ticket_assignPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `zendesk-${crypto.randomUUID()}`;
  const kind = "ws-zendesk-ticket.assign";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "ticket.assign", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "ticket.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const ticket_escalatePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function ticket_escalate(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  ticket_escalatePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `zendesk-${crypto.randomUUID()}`;
  const kind = "ws-zendesk-ticket.escalate";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "ticket.escalate", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "ticket.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const ticket_resolvePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function ticket_resolve(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  ticket_resolvePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `zendesk-${crypto.randomUUID()}`;
  const kind = "ws-zendesk-ticket.resolve";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "ticket.resolve", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "ticket.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const ticket_reopenPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function ticket_reopen(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  ticket_reopenPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `zendesk-${crypto.randomUUID()}`;
  const kind = "ws-zendesk-ticket.reopen";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "ticket.reopen", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "ticket.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "ticket.create": { commandId: "ticket.create", version: 1, handle: ticket_create },
  "ticket.assign": { commandId: "ticket.assign", version: 1, handle: ticket_assign },
  "ticket.escalate": { commandId: "ticket.escalate", version: 1, handle: ticket_escalate },
  "ticket.resolve": { commandId: "ticket.resolve", version: 1, handle: ticket_resolve },
  "ticket.reopen": { commandId: "ticket.reopen", version: 1, handle: ticket_reopen },
};
