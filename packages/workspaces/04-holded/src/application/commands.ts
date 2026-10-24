// 04-holded - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const invoice_create_draftPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function invoice_create_draft(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  invoice_create_draftPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `holded-${crypto.randomUUID()}`;
  const kind = "ws-holded-invoice.create_draft";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "invoice.create_draft", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "invoice.drafted", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const invoice_issuePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function invoice_issue(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  invoice_issuePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `holded-${crypto.randomUUID()}`;
  const kind = "ws-holded-invoice.issue";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "invoice.issue", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "invoice.drafted", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const invoice_voidPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function invoice_void(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  invoice_voidPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `holded-${crypto.randomUUID()}`;
  const kind = "ws-holded-invoice.void";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "invoice.void", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "invoice.drafted", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const credit_note_createPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function credit_note_create(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  credit_note_createPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `holded-${crypto.randomUUID()}`;
  const kind = "ws-holded-credit_note.create";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "credit_note.create", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "invoice.drafted", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const payment_registerPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function payment_register(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  payment_registerPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `holded-${crypto.randomUUID()}`;
  const kind = "ws-holded-payment.register";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "payment.register", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "invoice.drafted", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const expense_recordPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function expense_record(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  expense_recordPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `holded-${crypto.randomUUID()}`;
  const kind = "ws-holded-expense.record";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "expense.record", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "invoice.drafted", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const counterparty_upsertPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function counterparty_upsert(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  counterparty_upsertPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `holded-${crypto.randomUUID()}`;
  const kind = "ws-holded-counterparty.upsert";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "counterparty.upsert", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "invoice.drafted", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "invoice.create_draft": { commandId: "invoice.create_draft", version: 1, handle: invoice_create_draft },
  "invoice.issue": { commandId: "invoice.issue", version: 1, handle: invoice_issue },
  "invoice.void": { commandId: "invoice.void", version: 1, handle: invoice_void },
  "credit_note.create": { commandId: "credit_note.create", version: 1, handle: credit_note_create },
  "payment.register": { commandId: "payment.register", version: 1, handle: payment_register },
  "expense.record": { commandId: "expense.record", version: 1, handle: expense_record },
  "counterparty.upsert": { commandId: "counterparty.upsert", version: 1, handle: counterparty_upsert },
};
