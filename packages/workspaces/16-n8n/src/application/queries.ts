// 16-n8n - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

// QUERIES_AUTO_V1 - un handler por capacidad tipo query declarada en workspace.json.

const workflow_readParams = z.object({}).passthrough();

async function workflow_read(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  workflow_readParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-n8n-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "workflow.read": { queryId: "workflow.read", version: 1, handle: workflow_read },
};
