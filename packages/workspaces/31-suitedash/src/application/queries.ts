// 31-suitedash - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

// QUERIES_AUTO_V1 - un handler por capacidad tipo query declarada en workspace.json.

const case_timelineParams = z.object({}).passthrough();

async function case_timeline(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  case_timelineParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-suitedash-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "case.timeline": { queryId: "case.timeline", version: 1, handle: case_timeline },
};
