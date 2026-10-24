// 12-odoo-purchase - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const purchase_requestPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function purchase_request(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  purchase_requestPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `odoo-purchase-${crypto.randomUUID()}`;
  const kind = "ws-odoo-purchase-purchase.request";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "purchase.request", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "purchase.requested", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const purchase_approvePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function purchase_approve(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  purchase_approvePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `odoo-purchase-${crypto.randomUUID()}`;
  const kind = "ws-odoo-purchase-purchase.approve";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "purchase.approve", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "purchase.requested", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const purchase_sendPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function purchase_send(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  purchase_sendPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `odoo-purchase-${crypto.randomUUID()}`;
  const kind = "ws-odoo-purchase-purchase.send";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "purchase.send", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "purchase.requested", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const purchase_receivePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function purchase_receive(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  purchase_receivePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `odoo-purchase-${crypto.randomUUID()}`;
  const kind = "ws-odoo-purchase-purchase.receive";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "purchase.receive", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "purchase.requested", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "purchase.request": { commandId: "purchase.request", version: 1, handle: purchase_request },
  "purchase.approve": { commandId: "purchase.approve", version: 1, handle: purchase_approve },
  "purchase.send": { commandId: "purchase.send", version: 1, handle: purchase_send },
  "purchase.receive": { commandId: "purchase.receive", version: 1, handle: purchase_receive },
};
