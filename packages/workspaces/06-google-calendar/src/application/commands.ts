// 06-google-calendar - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const calendar_createPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function calendar_create(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  calendar_createPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `google-calendar-${crypto.randomUUID()}`;
  const kind = "ws-google-calendar-calendar.create";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "calendar.create", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "calendar.event.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const calendar_reschedulePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function calendar_reschedule(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  calendar_reschedulePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `google-calendar-${crypto.randomUUID()}`;
  const kind = "ws-google-calendar-calendar.reschedule";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "calendar.reschedule", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "calendar.event.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const calendar_cancelPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function calendar_cancel(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  calendar_cancelPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `google-calendar-${crypto.randomUUID()}`;
  const kind = "ws-google-calendar-calendar.cancel";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "calendar.cancel", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "calendar.event.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const calendar_add_participantPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function calendar_add_participant(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  calendar_add_participantPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `google-calendar-${crypto.randomUUID()}`;
  const kind = "ws-google-calendar-calendar.add_participant";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "calendar.add_participant", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "calendar.event.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const calendar_check_availabilityPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function calendar_check_availability(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  calendar_check_availabilityPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `google-calendar-${crypto.randomUUID()}`;
  const kind = "ws-google-calendar-calendar.check_availability";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "calendar.check_availability", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "calendar.event.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const calendar_block_timePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function calendar_block_time(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  calendar_block_timePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `google-calendar-${crypto.randomUUID()}`;
  const kind = "ws-google-calendar-calendar.block_time";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "calendar.block_time", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "calendar.event.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "calendar.create": { commandId: "calendar.create", version: 1, handle: calendar_create },
  "calendar.reschedule": { commandId: "calendar.reschedule", version: 1, handle: calendar_reschedule },
  "calendar.cancel": { commandId: "calendar.cancel", version: 1, handle: calendar_cancel },
  "calendar.add_participant": { commandId: "calendar.add_participant", version: 1, handle: calendar_add_participant },
  "calendar.check_availability": { commandId: "calendar.check_availability", version: 1, handle: calendar_check_availability },
  "calendar.block_time": { commandId: "calendar.block_time", version: 1, handle: calendar_block_time },
};
