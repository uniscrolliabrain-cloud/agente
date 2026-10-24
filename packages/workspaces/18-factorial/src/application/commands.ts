// 18-factorial - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const employee_createPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function employee_create(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  employee_createPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `factorial-${crypto.randomUUID()}`;
  const kind = "ws-factorial-employee.create";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "employee.create", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "employee.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const leave_approvePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function leave_approve(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  leave_approvePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `factorial-${crypto.randomUUID()}`;
  const kind = "ws-factorial-leave.approve";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "leave.approve", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "employee.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const leave_rejectPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function leave_reject(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  leave_rejectPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `factorial-${crypto.randomUUID()}`;
  const kind = "ws-factorial-leave.reject";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "leave.reject", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "employee.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const attendance_recordPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function attendance_record(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  attendance_recordPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `factorial-${crypto.randomUUID()}`;
  const kind = "ws-factorial-attendance.record";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "attendance.record", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "employee.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const schedule_updatePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function schedule_update(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  schedule_updatePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `factorial-${crypto.randomUUID()}`;
  const kind = "ws-factorial-schedule.update";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "schedule.update", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "employee.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "employee.create": { commandId: "employee.create", version: 1, handle: employee_create },
  "leave.approve": { commandId: "leave.approve", version: 1, handle: leave_approve },
  "leave.reject": { commandId: "leave.reject", version: 1, handle: leave_reject },
  "attendance.record": { commandId: "attendance.record", version: 1, handle: attendance_record },
  "schedule.update": { commandId: "schedule.update", version: 1, handle: schedule_update },
};
