// 28-odoo-manufacturing - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const production_planPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function production_plan(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  production_planPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `odoo-manufacturing-${crypto.randomUUID()}`;
  const kind = "ws-odoo-manufacturing-production.plan";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "production.plan", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "production.planned", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const production_startPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function production_start(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  production_startPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `odoo-manufacturing-${crypto.randomUUID()}`;
  const kind = "ws-odoo-manufacturing-production.start";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "production.start", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "production.planned", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const production_consumePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function production_consume(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  production_consumePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `odoo-manufacturing-${crypto.randomUUID()}`;
  const kind = "ws-odoo-manufacturing-production.consume";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "production.consume", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "production.planned", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const production_record_outputPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function production_record_output(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  production_record_outputPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `odoo-manufacturing-${crypto.randomUUID()}`;
  const kind = "ws-odoo-manufacturing-production.record_output";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "production.record_output", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "production.planned", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const production_closePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function production_close(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  production_closePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `odoo-manufacturing-${crypto.randomUUID()}`;
  const kind = "ws-odoo-manufacturing-production.close";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "production.close", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "production.planned", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "production.plan": { commandId: "production.plan", version: 1, handle: production_plan },
  "production.start": { commandId: "production.start", version: 1, handle: production_start },
  "production.consume": { commandId: "production.consume", version: 1, handle: production_consume },
  "production.record_output": { commandId: "production.record_output", version: 1, handle: production_record_output },
  "production.close": { commandId: "production.close", version: 1, handle: production_close },
};
