// 02-whatsapp - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

// QUERIES_AUTO_V1 - un handler por capacidad tipo query declarada en workspace.json.

const messaging_readParams = z.object({}).passthrough();

async function messaging_read(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  messaging_readParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-whatsapp-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "messaging.read": { queryId: "messaging.read", version: 1, handle: messaging_read },
};
