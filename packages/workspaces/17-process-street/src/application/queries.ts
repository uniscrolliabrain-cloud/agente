// 17-process-street - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

// QUERIES_AUTO_V1 - un handler por capacidad tipo query declarada en workspace.json.

const sop_readParams = z.object({}).passthrough();

async function sop_read(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  sop_readParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-process-street-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "sop.read": { queryId: "sop.read", version: 1, handle: sop_read },
};
