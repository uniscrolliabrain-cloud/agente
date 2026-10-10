// 05-google-drive - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

// QUERIES_AUTO_V1 - un handler por capacidad tipo query declarada en workspace.json.

const document_searchParams = z.object({}).passthrough();

async function document_search(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  document_searchParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-google-drive-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

const document_readParams = z.object({}).passthrough();

async function document_read(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  document_readParams.parse(env.parameters);
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-google-drive-all", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "document.search": { queryId: "document.search", version: 1, handle: document_search },
  "document.read": { queryId: "document.read", version: 1, handle: document_read },
};
