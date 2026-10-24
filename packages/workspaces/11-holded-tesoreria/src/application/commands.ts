// 11-holded-tesoreria - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const bank_import_statementPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function bank_import_statement(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  bank_import_statementPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `holded-tesoreria-${crypto.randomUUID()}`;
  const kind = "ws-holded-tesoreria-bank.import_statement";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "bank.import_statement", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "bank.transaction.imported", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const bank_reconcilePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function bank_reconcile(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  bank_reconcilePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `holded-tesoreria-${crypto.randomUUID()}`;
  const kind = "ws-holded-tesoreria-bank.reconcile";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "bank.reconcile", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "bank.transaction.imported", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const bank_flag_discrepancyPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function bank_flag_discrepancy(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  bank_flag_discrepancyPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `holded-tesoreria-${crypto.randomUUID()}`;
  const kind = "ws-holded-tesoreria-bank.flag_discrepancy";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "bank.flag_discrepancy", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "bank.transaction.imported", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const treasury_close_periodPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function treasury_close_period(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  treasury_close_periodPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `holded-tesoreria-${crypto.randomUUID()}`;
  const kind = "ws-holded-tesoreria-treasury.close_period";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "treasury.close_period", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "bank.transaction.imported", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const treasury_cash_positionPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function treasury_cash_position(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  treasury_cash_positionPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `holded-tesoreria-${crypto.randomUUID()}`;
  const kind = "ws-holded-tesoreria-treasury.cash_position";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "treasury.cash_position", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "bank.transaction.imported", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const treasury_list_transactionsPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function treasury_list_transactions(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  treasury_list_transactionsPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `holded-tesoreria-${crypto.randomUUID()}`;
  const kind = "ws-holded-tesoreria-treasury.list_transactions";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "treasury.list_transactions", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "bank.transaction.imported", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "bank.import_statement": { commandId: "bank.import_statement", version: 1, handle: bank_import_statement },
  "bank.reconcile": { commandId: "bank.reconcile", version: 1, handle: bank_reconcile },
  "bank.flag_discrepancy": { commandId: "bank.flag_discrepancy", version: 1, handle: bank_flag_discrepancy },
  "treasury.close_period": { commandId: "treasury.close_period", version: 1, handle: treasury_close_period },
  "treasury.cash_position": { commandId: "treasury.cash_position", version: 1, handle: treasury_cash_position },
  "treasury.list_transactions": { commandId: "treasury.list_transactions", version: 1, handle: treasury_list_transactions },
};
