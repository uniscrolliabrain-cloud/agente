// 31-suitedash - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const portal_invitePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function portal_invite(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  portal_invitePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `suitedash-${crypto.randomUUID()}`;
  const kind = "ws-suitedash-portal.invite";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "portal.invite", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "portal.invited", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const portal_revokePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function portal_revoke(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  portal_revokePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `suitedash-${crypto.randomUUID()}`;
  const kind = "ws-suitedash-portal.revoke";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "portal.revoke", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "portal.invited", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const request_submitPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function request_submit(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  request_submitPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `suitedash-${crypto.randomUUID()}`;
  const kind = "ws-suitedash-request.submit";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "request.submit", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "portal.invited", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const case_updatePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function case_update(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  case_updatePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `suitedash-${crypto.randomUUID()}`;
  const kind = "ws-suitedash-case.update";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "case.update", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "portal.invited", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const document_sharePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function document_share(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  document_sharePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `suitedash-${crypto.randomUUID()}`;
  const kind = "ws-suitedash-document.share";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "document.share", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "portal.invited", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "portal.invite": { commandId: "portal.invite", version: 1, handle: portal_invite },
  "portal.revoke": { commandId: "portal.revoke", version: 1, handle: portal_revoke },
  "request.submit": { commandId: "request.submit", version: 1, handle: request_submit },
  "case.update": { commandId: "case.update", version: 1, handle: case_update },
  "document.share": { commandId: "document.share", version: 1, handle: document_share },
};
