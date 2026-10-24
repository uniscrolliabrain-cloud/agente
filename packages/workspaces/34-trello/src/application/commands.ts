// 34-trello - handlers reales de comandos.
import { z } from "zod";
import { boardSchema, boardColumnSchema, workCardSchema, cardTransitionSchema } from "../domain/entities.ts";
import type { WorkspaceServices, WorkspaceContext, WorkspaceCommandEnvelope, CommandResult } from "../../../src/contracts/index.ts";

const createBoardPayload = z.object({
  name: z.string().min(1).max(400),
  description: z.string().max(5000).optional(),
});

const createCardPayload = z.object({
  boardId: z.string().min(1).max(200),
  columnId: z.string().min(1).max(200),
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
});

const moveCardPayload = z.object({
  cardId: z.string().min(1).max(200),
  fromColumnId: z.string().max(200).optional(),
  toColumnId: z.string().min(1).max(200),
});

const assignCardPayload = z.object({
  cardId: z.string().min(1).max(200),
  assigneeId: z.string().min(1).max(200),
});

const archiveCardPayload = z.object({
  cardId: z.string().min(1).max(200),
});

async function createBoard(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const p = createBoardPayload.parse(env.payload);
  const id = env.idempotencyKey ?? `brd-${crypto.randomUUID()}`;
  const existing = await services.db.get<{ id: string }>(ctx.owner, "ws-trello-boards", id);
  if (existing) return { status: "ok", entityId: id };
  const now = new Date().toISOString();
  const entity = boardSchema.parse({ id, tenantId: ctx.tenantId, name: p.name, description: p.description, createdAt: now, updatedAt: now });
  await services.db.insertIfAbsent(ctx.owner, "ws-trello-boards", entity);
  await services.bus?.emit(ctx.owner, "board.created", { kind: "system", id: ctx.workspaceId }, { entityId: id, name: p.name }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

async function createCard(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const p = createCardPayload.parse(env.payload);
  const id = env.idempotencyKey ?? `crd-${crypto.randomUUID()}`;
  const existing = await services.db.get<{ id: string }>(ctx.owner, "ws-trello-cards", id);
  if (existing) return { status: "ok", entityId: id };
  const now = new Date().toISOString();
  const entity = workCardSchema.parse({ id, tenantId: ctx.tenantId, boardId: p.boardId, columnId: p.columnId, title: p.title, description: p.description, createdAt: now, updatedAt: now });
  await services.db.insertIfAbsent(ctx.owner, "ws-trello-cards", entity);
  await services.bus?.emit(ctx.owner, "card.created", { kind: "system", id: ctx.workspaceId }, { entityId: id, boardId: p.boardId }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

async function moveCard(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const p = moveCardPayload.parse(env.payload);
  const c = await services.db.get<{ id: string }>(ctx.owner, "ws-trello-cards", p.cardId);
  if (!c) return { status: "rejected", reason: "card not found" };
  await services.db.put(ctx.owner, "ws-trello-cards", { ...c, columnId: p.toColumnId, updatedAt: new Date().toISOString() });
  const trans = cardTransitionSchema.parse({ id: `trn-${crypto.randomUUID()}`, tenantId: ctx.tenantId, cardId: p.cardId, fromColumnId: p.fromColumnId, toColumnId: p.toColumnId, movedBy: ctx.actorId, movedAt: new Date().toISOString() });
  await services.db.insertIfAbsent(ctx.owner, "ws-trello-transitions", trans);
  await services.bus?.emit(ctx.owner, "card.moved", { kind: "system", id: ctx.workspaceId }, { entityId: p.cardId, from: p.fromColumnId, to: p.toColumnId }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: p.cardId };
}

async function assignCard(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const p = assignCardPayload.parse(env.payload);
  const c = await services.db.get<{ id: string }>(ctx.owner, "ws-trello-cards", p.cardId);
  if (!c) return { status: "rejected", reason: "card not found" };
  await services.db.put(ctx.owner, "ws-trello-cards", { ...c, assigneeId: p.assigneeId, updatedAt: new Date().toISOString() });
  return { status: "ok", entityId: p.cardId };
}

async function archiveCard(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const p = archiveCardPayload.parse(env.payload);
  const c = await services.db.get<{ id: string }>(ctx.owner, "ws-trello-cards", p.cardId);
  if (!c) return { status: "rejected", reason: "card not found" };
  await services.db.put(ctx.owner, "ws-trello-cards", { ...c, archived: true, updatedAt: new Date().toISOString() });
  await services.bus?.emit(ctx.owner, "card.archived", { kind: "system", id: ctx.workspaceId }, { entityId: p.cardId }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: p.cardId };
}

export const COMMANDS = {
  "board.create": { commandId: "board.create", version: 1, handle: createBoard },
  "card.create": { commandId: "card.create", version: 1, handle: createCard },
  "card.move": { commandId: "card.move", version: 1, handle: moveCard },
  "card.assign": { commandId: "card.assign", version: 1, handle: assignCard },
  "card.archive": { commandId: "card.archive", version: 1, handle: archiveCard },
};
