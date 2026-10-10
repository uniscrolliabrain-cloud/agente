// 11-holded-tesoreria - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

// QUERIES_AUTO_V1 - un handler por capacidad tipo query declarada en workspace.json.

async function emptyQuery(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  return { status: "empty", items: [], total: 0 };
}

export const QUERIES = {
  "holded-tesoreria.empty": { queryId: "holded-tesoreria.empty", version: 1, handle: emptyQuery },
};
