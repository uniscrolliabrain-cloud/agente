// 20-ramp - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const expense_submitPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function expense_submit(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  expense_submitPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `ramp-${crypto.randomUUID()}`;
  const kind = "ws-ramp-expense.submit";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "expense.submit", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "expense.submitted", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const expense_approvePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function expense_approve(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  expense_approvePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `ramp-${crypto.randomUUID()}`;
  const kind = "ws-ramp-expense.approve";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "expense.approve", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "expense.submitted", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const expense_rejectPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function expense_reject(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  expense_rejectPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `ramp-${crypto.randomUUID()}`;
  const kind = "ws-ramp-expense.reject";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "expense.reject", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "expense.submitted", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const expense_receipt_attachPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function expense_receipt_attach(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  expense_receipt_attachPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `ramp-${crypto.randomUUID()}`;
  const kind = "ws-ramp-expense.receipt_attach";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "expense.receipt_attach", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "expense.submitted", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const spend_limit_setPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function spend_limit_set(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  spend_limit_setPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `ramp-${crypto.randomUUID()}`;
  const kind = "ws-ramp-spend_limit.set";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "spend_limit.set", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "expense.submitted", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "expense.submit": { commandId: "expense.submit", version: 1, handle: expense_submit },
  "expense.approve": { commandId: "expense.approve", version: 1, handle: expense_approve },
  "expense.reject": { commandId: "expense.reject", version: 1, handle: expense_reject },
  "expense.receipt_attach": { commandId: "expense.receipt_attach", version: 1, handle: expense_receipt_attach },
  "spend_limit.set": { commandId: "spend_limit.set", version: 1, handle: spend_limit_set },
};
