// 30-microsoft-entra - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const principal_createPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function principal_create(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  principal_createPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `microsoft-entra-${crypto.randomUUID()}`;
  const kind = "ws-microsoft-entra-principal.create";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "principal.create", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "principal.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const role_assignPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function role_assign(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  role_assignPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `microsoft-entra-${crypto.randomUUID()}`;
  const kind = "ws-microsoft-entra-role.assign";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "role.assign", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "principal.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const access_revokePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function access_revoke(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  access_revokePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `microsoft-entra-${crypto.randomUUID()}`;
  const kind = "ws-microsoft-entra-access.revoke";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "access.revoke", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "principal.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const policy_definePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function policy_define(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  policy_definePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `microsoft-entra-${crypto.randomUUID()}`;
  const kind = "ws-microsoft-entra-policy.define";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "policy.define", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "principal.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const session_terminatePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function session_terminate(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  session_terminatePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `microsoft-entra-${crypto.randomUUID()}`;
  const kind = "ws-microsoft-entra-session.terminate";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "session.terminate", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "principal.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "principal.create": { commandId: "principal.create", version: 1, handle: principal_create },
  "role.assign": { commandId: "role.assign", version: 1, handle: role_assign },
  "access.revoke": { commandId: "access.revoke", version: 1, handle: access_revoke },
  "policy.define": { commandId: "policy.define", version: 1, handle: policy_define },
  "session.terminate": { commandId: "session.terminate", version: 1, handle: session_terminate },
};
