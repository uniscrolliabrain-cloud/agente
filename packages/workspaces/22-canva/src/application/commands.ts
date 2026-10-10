// 22-canva - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const brief_createPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function brief_create(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  brief_createPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `canva-${crypto.randomUUID()}`;
  const kind = "ws-canva-brief.create";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "brief.create", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "brief.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const design_generatePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function design_generate(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  design_generatePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `canva-${crypto.randomUUID()}`;
  const kind = "ws-canva-design.generate";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "design.generate", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "brief.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const asset_exportPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function asset_export(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  asset_exportPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `canva-${crypto.randomUUID()}`;
  const kind = "ws-canva-asset.export";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "asset.export", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "brief.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const asset_publishPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function asset_publish(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  asset_publishPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `canva-${crypto.randomUUID()}`;
  const kind = "ws-canva-asset.publish";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "asset.publish", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "brief.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const brand_uploadPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function brand_upload(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  brand_uploadPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `canva-${crypto.randomUUID()}`;
  const kind = "ws-canva-brand.upload";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "brand.upload", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "brief.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "brief.create": { commandId: "brief.create", version: 1, handle: brief_create },
  "design.generate": { commandId: "design.generate", version: 1, handle: design_generate },
  "asset.export": { commandId: "asset.export", version: 1, handle: asset_export },
  "asset.publish": { commandId: "asset.publish", version: 1, handle: asset_publish },
  "brand.upload": { commandId: "brand.upload", version: 1, handle: brand_upload },
};
