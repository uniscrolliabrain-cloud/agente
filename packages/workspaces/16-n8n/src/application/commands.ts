// 16-n8n - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const workflow_createPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function workflow_create(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  workflow_createPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `n8n-${crypto.randomUUID()}`;
  const kind = "ws-n8n-workflow.create";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "workflow.create", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "workflow.executed", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const workflow_enablePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function workflow_enable(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  workflow_enablePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `n8n-${crypto.randomUUID()}`;
  const kind = "ws-n8n-workflow.enable";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "workflow.enable", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "workflow.executed", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const workflow_disablePayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function workflow_disable(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  workflow_disablePayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `n8n-${crypto.randomUUID()}`;
  const kind = "ws-n8n-workflow.disable";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "workflow.disable", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "workflow.executed", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const workflow_triggerPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function workflow_trigger(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  workflow_triggerPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `n8n-${crypto.randomUUID()}`;
  const kind = "ws-n8n-workflow.trigger";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "workflow.trigger", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "workflow.executed", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const workflow_list_executionsPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function workflow_list_executions(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  workflow_list_executionsPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `n8n-${crypto.randomUUID()}`;
  const kind = "ws-n8n-workflow.list_executions";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "workflow.list_executions", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "workflow.executed", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "workflow.create": { commandId: "workflow.create", version: 1, handle: workflow_create },
  "workflow.enable": { commandId: "workflow.enable", version: 1, handle: workflow_enable },
  "workflow.disable": { commandId: "workflow.disable", version: 1, handle: workflow_disable },
  "workflow.trigger": { commandId: "workflow.trigger", version: 1, handle: workflow_trigger },
  "workflow.list_executions": { commandId: "workflow.list_executions", version: 1, handle: workflow_list_executions },
};
