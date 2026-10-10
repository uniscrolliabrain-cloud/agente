// 26-odoo-inventory - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

// QUERIES_AUTO_V1 - un handler por capacidad tipo query declarada en workspace.json.

const stock_listParams = z.object({}).passthrough();

async function stock_list(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  stock_listParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-odoo-inventory-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "stock.list": { queryId: "stock.list", version: 1, handle: stock_list },
};
