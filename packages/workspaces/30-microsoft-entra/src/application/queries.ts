// 30-microsoft-entra - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

// QUERIES_AUTO_V1 - un handler por capacidad tipo query declarada en workspace.json.

const principal_listParams = z.object({}).passthrough();

async function principal_list(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  principal_listParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-microsoft-entra-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

const access_matrixParams = z.object({}).passthrough();

async function access_matrix(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  access_matrixParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-microsoft-entra-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "principal.list": { queryId: "principal.list", version: 1, handle: principal_list },
  "access.matrix": { queryId: "access.matrix", version: 1, handle: access_matrix },
};
