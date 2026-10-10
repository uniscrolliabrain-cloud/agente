// 20-ramp - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

// QUERIES_AUTO_V1 - un handler por capacidad tipo query declarada en workspace.json.

const expense_listParams = z.object({}).passthrough();

async function expense_list(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  expense_listParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-ramp-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "expense.list": { queryId: "expense.list", version: 1, handle: expense_list },
};
