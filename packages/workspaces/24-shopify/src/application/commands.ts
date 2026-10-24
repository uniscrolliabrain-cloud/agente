// 24-shopify - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const order_createPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function order_create(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  order_createPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `shopify-${crypto.randomUUID()}`;
  const kind = "ws-shopify-order.create";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "order.create", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "order.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const order_fulfillPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function order_fulfill(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  order_fulfillPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `shopify-${crypto.randomUUID()}`;
  const kind = "ws-shopify-order.fulfill";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "order.fulfill", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "order.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const order_return_registerPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function order_return_register(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  order_return_registerPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `shopify-${crypto.randomUUID()}`;
  const kind = "ws-shopify-order.return_register";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "order.return_register", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "order.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const inventory_syncPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function inventory_sync(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  inventory_syncPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `shopify-${crypto.randomUUID()}`;
  const kind = "ws-shopify-inventory.sync";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "inventory.sync", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "order.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const refund_issuePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function refund_issue(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  refund_issuePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `shopify-${crypto.randomUUID()}`;
  const kind = "ws-shopify-refund.issue";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "refund.issue", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "order.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "order.create": { commandId: "order.create", version: 1, handle: order_create },
  "order.fulfill": { commandId: "order.fulfill", version: 1, handle: order_fulfill },
  "order.return_register": { commandId: "order.return_register", version: 1, handle: order_return_register },
  "inventory.sync": { commandId: "inventory.sync", version: 1, handle: inventory_sync },
  "refund.issue": { commandId: "refund.issue", version: 1, handle: refund_issue },
};
