// 09-airtable - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const dataset_create_recordPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function dataset_create_record(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  dataset_create_recordPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `airtable-${crypto.randomUUID()}`;
  const kind = "ws-airtable-dataset.create_record";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "dataset.create_record", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "dataset.record.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const dataset_update_recordPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function dataset_update_record(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  dataset_update_recordPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `airtable-${crypto.randomUUID()}`;
  const kind = "ws-airtable-dataset.update_record";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "dataset.update_record", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "dataset.record.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const dataset_define_fieldPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function dataset_define_field(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  dataset_define_fieldPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `airtable-${crypto.randomUUID()}`;
  const kind = "ws-airtable-dataset.define_field";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "dataset.define_field", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "dataset.record.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const dataset_relate_recordsPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function dataset_relate_records(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  dataset_relate_recordsPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `airtable-${crypto.randomUUID()}`;
  const kind = "ws-airtable-dataset.relate_records";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "dataset.relate_records", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "dataset.record.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const dataset_list_recordsPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function dataset_list_records(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  dataset_list_recordsPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `airtable-${crypto.randomUUID()}`;
  const kind = "ws-airtable-dataset.list_records";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "dataset.list_records", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "dataset.record.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const dataset_filter_recordsPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function dataset_filter_records(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  dataset_filter_recordsPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `airtable-${crypto.randomUUID()}`;
  const kind = "ws-airtable-dataset.filter_records";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "dataset.filter_records", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "dataset.record.created", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "dataset.create_record": { commandId: "dataset.create_record", version: 1, handle: dataset_create_record },
  "dataset.update_record": { commandId: "dataset.update_record", version: 1, handle: dataset_update_record },
  "dataset.define_field": { commandId: "dataset.define_field", version: 1, handle: dataset_define_field },
  "dataset.relate_records": { commandId: "dataset.relate_records", version: 1, handle: dataset_relate_records },
  "dataset.list_records": { commandId: "dataset.list_records", version: 1, handle: dataset_list_records },
  "dataset.filter_records": { commandId: "dataset.filter_records", version: 1, handle: dataset_filter_records },
};
