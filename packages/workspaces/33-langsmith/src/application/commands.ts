// 33-langsmith - handlers reales de comandos.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

// COMMANDS_AUTO_V1 - un handler por capacidad declarada en workspace.json.
// Cada handler valida el payload con Zod y persiste en el store del workspace.

const run_recordPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function run_record(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  run_recordPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `langsmith-${crypto.randomUUID()}`;
  const kind = "ws-langsmith-run.record";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "run.record", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "run.recorded", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const span_recordPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function span_record(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  span_recordPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `langsmith-${crypto.randomUUID()}`;
  const kind = "ws-langsmith-span.record";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "span.record", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "run.recorded", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const evaluation_submitPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function evaluation_submit(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  evaluation_submitPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `langsmith-${crypto.randomUUID()}`;
  const kind = "ws-langsmith-evaluation.submit";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "evaluation.submit", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "run.recorded", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const run_flagPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function run_flag(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  run_flagPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `langsmith-${crypto.randomUUID()}`;
  const kind = "ws-langsmith-run.flag";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "run.flag", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "run.recorded", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

const cost_by_agentPayload = z.object({ payload: z.record(z.string(), z.unknown()).optional() });

async function cost_by_agent(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  cost_by_agentPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? `langsmith-${crypto.randomUUID()}`;
  const kind = "ws-langsmith-cost.by_agent";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const entity = { id, tenantId: ctx.tenantId, workspaceId: ctx.workspaceId, action: "cost.by_agent", payload: env.payload, createdAt: new Date().toISOString() };
  await services.db.insertIfAbsent(ctx.owner, kind, entity as { id: string });
  await services.bus?.emit(ctx.owner, "run.recorded", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "run.record": { commandId: "run.record", version: 1, handle: run_record },
  "span.record": { commandId: "span.record", version: 1, handle: span_record },
  "evaluation.submit": { commandId: "evaluation.submit", version: 1, handle: evaluation_submit },
  "run.flag": { commandId: "run.flag", version: 1, handle: run_flag },
  "cost.by_agent": { commandId: "cost.by_agent", version: 1, handle: cost_by_agent },
};
