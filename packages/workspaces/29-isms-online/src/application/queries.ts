// 29-isms-online - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

// QUERIES_AUTO_V1 - un handler por capacidad tipo query declarada en workspace.json.

const compliance_overviewParams = z.object({}).passthrough();

async function compliance_overview(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  compliance_overviewParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-isms-online-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "compliance.overview": { queryId: "compliance.overview", version: 1, handle: compliance_overview },
};
