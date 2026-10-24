// 19-personio - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

// QUERIES_AUTO_V1 - un handler por capacidad tipo query declarada en workspace.json.

const lifecycle_readParams = z.object({}).passthrough();

async function lifecycle_read(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  lifecycle_readParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-personio-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

const onboarding_progressParams = z.object({}).passthrough();

async function onboarding_progress(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  onboarding_progressParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-personio-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "lifecycle.read": { queryId: "lifecycle.read", version: 1, handle: lifecycle_read },
  "onboarding.progress": { queryId: "onboarding.progress", version: 1, handle: onboarding_progress },
};
