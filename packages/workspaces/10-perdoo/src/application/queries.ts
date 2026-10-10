// 10-perdoo - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

// QUERIES_AUTO_V1 - un handler por capacidad tipo query declarada en workspace.json.

const objective_listParams = z.object({}).passthrough();

async function objective_list(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  objective_listParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-perdoo-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

const objective_progressParams = z.object({}).passthrough();

async function objective_progress(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  objective_progressParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-perdoo-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "objective.list": { queryId: "objective.list", version: 1, handle: objective_list },
  "objective.progress": { queryId: "objective.progress", version: 1, handle: objective_progress },
};
