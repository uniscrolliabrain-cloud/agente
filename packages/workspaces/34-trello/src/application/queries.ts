// 34-trello - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

const listBoardsParams = z.object({});

async function listBoards(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  listBoardsParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-trello-boards", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

const boardViewParams = z.object({ boardId: z.string().min(1).max(200) });

async function boardView(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  const p = boardViewParams.parse(env.parameters);
  const columns = await services.db.list<{ boardId?: string }>(ctx.owner, "ws-trello-columns", { limit: env.limit });
  const cards = await services.db.list<{ boardId?: string }>(ctx.owner, "ws-trello-cards", { limit: env.limit });
  const cols = columns.filter((c) => c.boardId === p.boardId);
  const cds = cards.filter((c) => c.boardId === p.boardId);
  return { status: (cols.length + cds.length) ? "ok" : "empty", items: [{ columns: cols, cards: cds }], total: cols.length + cds.length };
}

const cardHistoryParams = z.object({ cardId: z.string().min(1).max(200) });

async function cardHistory(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  const p = cardHistoryParams.parse(env.parameters);
  const all = await services.db.list<{ cardId?: string }>(ctx.owner, "ws-trello-transitions", { limit: env.limit });
  const items = all.filter((t) => t.cardId === p.cardId);
  return { status: items.length ? "ok" : "empty", items, total: items.length };
}

export const QUERIES = {
  "board.list": { queryId: "board.list", version: 1, handle: listBoards },
  "board.view": { queryId: "board.view", version: 1, handle: boardView },
  "card.history": { queryId: "card.history", version: 1, handle: cardHistory },
};
