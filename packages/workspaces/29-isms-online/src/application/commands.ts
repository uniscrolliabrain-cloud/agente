// 29-isms-online - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const risk_registerPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function risk_register(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  risk_registerPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `isms-online-${crypto.randomUUID()}`;
  const kind = "ws-isms-online-risk.register";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "risk.register", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "risk.registered", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const control_assignPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function control_assign(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  control_assignPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `isms-online-${crypto.randomUUID()}`;
  const kind = "ws-isms-online-control.assign";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "control.assign", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "risk.registered", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const evidence_attachPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function evidence_attach(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  evidence_attachPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `isms-online-${crypto.randomUUID()}`;
  const kind = "ws-isms-online-evidence.attach";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "evidence.attach", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "risk.registered", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const review_schedulePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function review_schedule(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  review_schedulePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `isms-online-${crypto.randomUUID()}`;
  const kind = "ws-isms-online-review.schedule";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "review.schedule", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "risk.registered", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const risk_closePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function risk_close(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  risk_closePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `isms-online-${crypto.randomUUID()}`;
  const kind = "ws-isms-online-risk.close";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "risk.close", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "risk.registered", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const risk_register_viewPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function risk_register_view(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  risk_register_viewPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `isms-online-${crypto.randomUUID()}`;
  const kind = "ws-isms-online-risk.register_view";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "risk.register_view", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "risk.registered", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "risk.register": { commandId: "risk.register", version: 1, handle: risk_register },
  "control.assign": { commandId: "control.assign", version: 1, handle: control_assign },
  "evidence.attach": { commandId: "evidence.attach", version: 1, handle: evidence_attach },
  "review.schedule": { commandId: "review.schedule", version: 1, handle: review_schedule },
  "risk.close": { commandId: "risk.close", version: 1, handle: risk_close },
  "risk.register_view": { commandId: "risk.register_view", version: 1, handle: risk_register_view },
};
