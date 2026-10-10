// 03-hubspot - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const crm_upsert_leadPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function crm_upsert_lead(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  crm_upsert_leadPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `hubspot-${crypto.randomUUID()}`;
  const kind = "ws-hubspot-crm.upsert_lead";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "crm.upsert_lead", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "lead.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const crm_upsert_contactPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function crm_upsert_contact(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  crm_upsert_contactPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `hubspot-${crypto.randomUUID()}`;
  const kind = "ws-hubspot-crm.upsert_contact";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "crm.upsert_contact", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "lead.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const crm_upsert_companyPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function crm_upsert_company(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  crm_upsert_companyPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `hubspot-${crypto.randomUUID()}`;
  const kind = "ws-hubspot-crm.upsert_company";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "crm.upsert_company", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "lead.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const crm_qualifyPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function crm_qualify(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  crm_qualifyPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `hubspot-${crypto.randomUUID()}`;
  const kind = "ws-hubspot-crm.qualify";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "crm.qualify", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "lead.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const crm_create_opportunityPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function crm_create_opportunity(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  crm_create_opportunityPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `hubspot-${crypto.randomUUID()}`;
  const kind = "ws-hubspot-crm.create_opportunity";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "crm.create_opportunity", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "lead.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const crm_move_stagePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function crm_move_stage(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  crm_move_stagePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `hubspot-${crypto.randomUUID()}`;
  const kind = "ws-hubspot-crm.move_stage";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "crm.move_stage", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "lead.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const crm_log_activityPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function crm_log_activity(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  crm_log_activityPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `hubspot-${crypto.randomUUID()}`;
  const kind = "ws-hubspot-crm.log_activity";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "crm.log_activity", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "lead.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const crm_list_segmentsPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function crm_list_segments(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  crm_list_segmentsPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `hubspot-${crypto.randomUUID()}`;
  const kind = "ws-hubspot-crm.list_segments";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "crm.list_segments", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "lead.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "crm.upsert_lead": { commandId: "crm.upsert_lead", version: 1, handle: crm_upsert_lead },
  "crm.upsert_contact": { commandId: "crm.upsert_contact", version: 1, handle: crm_upsert_contact },
  "crm.upsert_company": { commandId: "crm.upsert_company", version: 1, handle: crm_upsert_company },
  "crm.qualify": { commandId: "crm.qualify", version: 1, handle: crm_qualify },
  "crm.create_opportunity": { commandId: "crm.create_opportunity", version: 1, handle: crm_create_opportunity },
  "crm.move_stage": { commandId: "crm.move_stage", version: 1, handle: crm_move_stage },
  "crm.log_activity": { commandId: "crm.log_activity", version: 1, handle: crm_log_activity },
  "crm.list_segments": { commandId: "crm.list_segments", version: 1, handle: crm_list_segments },
};
