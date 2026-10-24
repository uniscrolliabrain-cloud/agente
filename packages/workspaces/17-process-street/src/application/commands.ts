// 17-process-street - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const sop_createPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function sop_create(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  sop_createPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `process-street-${crypto.randomUUID()}`;
  const kind = "ws-process-street-sop.create";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "sop.create", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "sop.started", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const sop_start_runPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function sop_start_run(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  sop_start_runPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `process-street-${crypto.randomUUID()}`;
  const kind = "ws-process-street-sop.start_run";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "sop.start_run", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "sop.started", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const sop_complete_stepPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function sop_complete_step(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  sop_complete_stepPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `process-street-${crypto.randomUUID()}`;
  const kind = "ws-process-street-sop.complete_step";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "sop.complete_step", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "sop.started", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const sop_abort_runPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function sop_abort_run(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  sop_abort_runPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `process-street-${crypto.randomUUID()}`;
  const kind = "ws-process-street-sop.abort_run";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "sop.abort_run", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "sop.started", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const sop_pending_stepsPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function sop_pending_steps(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  sop_pending_stepsPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `process-street-${crypto.randomUUID()}`;
  const kind = "ws-process-street-sop.pending_steps";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "sop.pending_steps", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "sop.started", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "sop.create": { commandId: "sop.create", version: 1, handle: sop_create },
  "sop.start_run": { commandId: "sop.start_run", version: 1, handle: sop_start_run },
  "sop.complete_step": { commandId: "sop.complete_step", version: 1, handle: sop_complete_step },
  "sop.abort_run": { commandId: "sop.abort_run", version: 1, handle: sop_abort_run },
  "sop.pending_steps": { commandId: "sop.pending_steps", version: 1, handle: sop_pending_steps },
};
