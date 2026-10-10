// 32-notion - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const page_createPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function page_create(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  page_createPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `notion-${crypto.randomUUID()}`;
  const kind = "ws-notion-page.create";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "page.create", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "page.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const page_updatePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function page_update(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  page_updatePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `notion-${crypto.randomUUID()}`;
  const kind = "ws-notion-page.update";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "page.update", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "page.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const page_relatePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function page_relate(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  page_relatePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `notion-${crypto.randomUUID()}`;
  const kind = "ws-notion-page.relate";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "page.relate", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "page.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const page_archivePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function page_archive(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  page_archivePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `notion-${crypto.randomUUID()}`;
  const kind = "ws-notion-page.archive";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "page.archive", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "page.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const search_knowledgePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function search_knowledge(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  search_knowledgePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `notion-${crypto.randomUUID()}`;
  const kind = "ws-notion-search.knowledge";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "search.knowledge", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "page.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "page.create": { commandId: "page.create", version: 1, handle: page_create },
  "page.update": { commandId: "page.update", version: 1, handle: page_update },
  "page.relate": { commandId: "page.relate", version: 1, handle: page_relate },
  "page.archive": { commandId: "page.archive", version: 1, handle: page_archive },
  "search.knowledge": { commandId: "search.knowledge", version: 1, handle: search_knowledge },
};
