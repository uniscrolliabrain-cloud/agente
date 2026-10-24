// 25-intercom - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

// QUERIES_AUTO_V1 - un handler por capacidad tipo query declarada en workspace.json.

const customer_timelineParams = z.object({}).passthrough();

async function customer_timeline(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  customer_timelineParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-intercom-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

const conversation_listParams = z.object({}).passthrough();

async function conversation_list(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  conversation_listParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-intercom-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "customer.timeline": { queryId: "customer.timeline", version: 1, handle: customer_timeline },
  "conversation.list": { queryId: "conversation.list", version: 1, handle: conversation_list },
};
