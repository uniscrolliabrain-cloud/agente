// 23-buffer - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

// QUERIES_AUTO_V1 - un handler por capacidad tipo query declarada en workspace.json.

const post_metrics_collectParams = z.object({}).passthrough();

async function post_metrics_collect(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  post_metrics_collectParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-buffer-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

const post_readParams = z.object({}).passthrough();

async function post_read(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  post_readParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-buffer-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "post.metrics.collect": { queryId: "post.metrics.collect", version: 1, handle: post_metrics_collect },
  "post.read": { queryId: "post.read", version: 1, handle: post_read },
};
