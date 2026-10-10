// 05-google-drive - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const document_uploadPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function document_upload(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  document_uploadPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `google-drive-${crypto.randomUUID()}`;
  const kind = "ws-google-drive-document.upload";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "document.upload", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "document.uploaded", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const document_movePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function document_move(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  document_movePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `google-drive-${crypto.randomUUID()}`;
  const kind = "ws-google-drive-document.move";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "document.move", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "document.uploaded", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const document_classifyPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function document_classify(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  document_classifyPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `google-drive-${crypto.randomUUID()}`;
  const kind = "ws-google-drive-document.classify";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "document.classify", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "document.uploaded", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const document_linkPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function document_link(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  document_linkPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `google-drive-${crypto.randomUUID()}`;
  const kind = "ws-google-drive-document.link";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "document.link", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "document.uploaded", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const document_archivePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function document_archive(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  document_archivePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `google-drive-${crypto.randomUUID()}`;
  const kind = "ws-google-drive-document.archive";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "document.archive", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "document.uploaded", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "document.upload": { commandId: "document.upload", version: 1, handle: document_upload },
  "document.move": { commandId: "document.move", version: 1, handle: document_move },
  "document.classify": { commandId: "document.classify", version: 1, handle: document_classify },
  "document.link": { commandId: "document.link", version: 1, handle: document_link },
  "document.archive": { commandId: "document.archive", version: 1, handle: document_archive },
};
