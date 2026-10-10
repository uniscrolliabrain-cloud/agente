// 26-odoo-inventory - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const stock_receivePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function stock_receive(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  stock_receivePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `odoo-inventory-${crypto.randomUUID()}`;
  const kind = "ws-odoo-inventory-stock.receive";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "stock.receive", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "stock.received", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const stock_issuePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function stock_issue(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  stock_issuePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `odoo-inventory-${crypto.randomUUID()}`;
  const kind = "ws-odoo-inventory-stock.issue";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "stock.issue", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "stock.received", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const stock_transferPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function stock_transfer(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  stock_transferPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `odoo-inventory-${crypto.randomUUID()}`;
  const kind = "ws-odoo-inventory-stock.transfer";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "stock.transfer", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "stock.received", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const stock_adjustPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function stock_adjust(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  stock_adjustPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `odoo-inventory-${crypto.randomUUID()}`;
  const kind = "ws-odoo-inventory-stock.adjust";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "stock.adjust", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "stock.received", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const stock_reservePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function stock_reserve(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  stock_reservePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `odoo-inventory-${crypto.randomUUID()}`;
  const kind = "ws-odoo-inventory-stock.reserve";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "stock.reserve", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "stock.received", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const stock_low_alertsPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function stock_low_alerts(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  stock_low_alertsPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `odoo-inventory-${crypto.randomUUID()}`;
  const kind = "ws-odoo-inventory-stock.low_alerts";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "stock.low_alerts", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "stock.received", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "stock.receive": { commandId: "stock.receive", version: 1, handle: stock_receive },
  "stock.issue": { commandId: "stock.issue", version: 1, handle: stock_issue },
  "stock.transfer": { commandId: "stock.transfer", version: 1, handle: stock_transfer },
  "stock.adjust": { commandId: "stock.adjust", version: 1, handle: stock_adjust },
  "stock.reserve": { commandId: "stock.reserve", version: 1, handle: stock_reserve },
  "stock.low_alerts": { commandId: "stock.low_alerts", version: 1, handle: stock_low_alerts },
};
