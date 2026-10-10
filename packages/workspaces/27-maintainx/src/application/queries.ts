// 27-maintainx - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

// QUERIES_AUTO_V1 - un handler por capacidad tipo query declarada en workspace.json.

const asset_registryParams = z.object({}).passthrough();

async function asset_registry(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  asset_registryParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-maintainx-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "asset.registry": { queryId: "asset.registry", version: 1, handle: asset_registry },
};
