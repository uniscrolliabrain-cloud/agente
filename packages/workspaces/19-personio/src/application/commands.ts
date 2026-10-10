// 19-personio - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const position_openPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function position_open(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  position_openPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `personio-${crypto.randomUUID()}`;
  const kind = "ws-personio-position.open";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "position.open", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "position.opened", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const onboarding_startPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function onboarding_start(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  onboarding_startPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `personio-${crypto.randomUUID()}`;
  const kind = "ws-personio-onboarding.start";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "onboarding.start", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "position.opened", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const onboarding_completePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function onboarding_complete(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  onboarding_completePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `personio-${crypto.randomUUID()}`;
  const kind = "ws-personio-onboarding.complete";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "onboarding.complete", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "position.opened", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const employment_closePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function employment_close(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  employment_closePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `personio-${crypto.randomUUID()}`;
  const kind = "ws-personio-employment.close";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "employment.close", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "position.opened", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "position.open": { commandId: "position.open", version: 1, handle: position_open },
  "onboarding.start": { commandId: "onboarding.start", version: 1, handle: onboarding_start },
  "onboarding.complete": { commandId: "onboarding.complete", version: 1, handle: onboarding_complete },
  "employment.close": { commandId: "employment.close", version: 1, handle: employment_close },
};
