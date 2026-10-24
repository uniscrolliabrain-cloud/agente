// 15-docusign - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const envelope_preparePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function envelope_prepare(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  envelope_preparePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `docusign-${crypto.randomUUID()}`;
  const kind = "ws-docusign-envelope.prepare";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "envelope.prepare", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "envelope.prepared", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const envelope_sendPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function envelope_send(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  envelope_sendPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `docusign-${crypto.randomUUID()}`;
  const kind = "ws-docusign-envelope.send";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "envelope.send", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "envelope.prepared", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const envelope_record_signaturePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function envelope_record_signature(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  envelope_record_signaturePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `docusign-${crypto.randomUUID()}`;
  const kind = "ws-docusign-envelope.record_signature";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "envelope.record_signature", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "envelope.prepared", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const envelope_cancelPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function envelope_cancel(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  envelope_cancelPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `docusign-${crypto.randomUUID()}`;
  const kind = "ws-docusign-envelope.cancel";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "envelope.cancel", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "envelope.prepared", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const envelope_list_pendingPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function envelope_list_pending(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  envelope_list_pendingPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `docusign-${crypto.randomUUID()}`;
  const kind = "ws-docusign-envelope.list_pending";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "envelope.list_pending", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "envelope.prepared", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "envelope.prepare": { commandId: "envelope.prepare", version: 1, handle: envelope_prepare },
  "envelope.send": { commandId: "envelope.send", version: 1, handle: envelope_send },
  "envelope.record_signature": { commandId: "envelope.record_signature", version: 1, handle: envelope_record_signature },
  "envelope.cancel": { commandId: "envelope.cancel", version: 1, handle: envelope_cancel },
  "envelope.list_pending": { commandId: "envelope.list_pending", version: 1, handle: envelope_list_pending },
};
