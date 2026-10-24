// 27-maintainx - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const asset_registerPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function asset_register(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  asset_registerPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `maintainx-${crypto.randomUUID()}`;
  const kind = "ws-maintainx-asset.register";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "asset.register", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "asset.registered", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const maintenance_openPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function maintenance_open(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  maintenance_openPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `maintainx-${crypto.randomUUID()}`;
  const kind = "ws-maintainx-maintenance.open";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "maintenance.open", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "asset.registered", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const maintenance_completePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function maintenance_complete(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  maintenance_completePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `maintainx-${crypto.randomUUID()}`;
  const kind = "ws-maintainx-maintenance.complete";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "maintenance.complete", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "asset.registered", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const maintenance_schedulePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function maintenance_schedule(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  maintenance_schedulePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `maintainx-${crypto.randomUUID()}`;
  const kind = "ws-maintainx-maintenance.schedule";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "maintenance.schedule", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "asset.registered", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const inspection_recordPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function inspection_record(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  inspection_recordPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `maintainx-${crypto.randomUUID()}`;
  const kind = "ws-maintainx-inspection.record";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "inspection.record", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "asset.registered", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "asset.register": { commandId: "asset.register", version: 1, handle: asset_register },
  "maintenance.open": { commandId: "maintenance.open", version: 1, handle: maintenance_open },
  "maintenance.complete": { commandId: "maintenance.complete", version: 1, handle: maintenance_complete },
  "maintenance.schedule": { commandId: "maintenance.schedule", version: 1, handle: maintenance_schedule },
  "inspection.record": { commandId: "inspection.record", version: 1, handle: inspection_record },
};
