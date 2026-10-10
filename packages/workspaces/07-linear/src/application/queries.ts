// 07-linear - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

const listWorkItemsParams = z.object({
  status: z.string().max(50).optional(),
  assigneeId: z.string().max(200).optional(),
  projectId: z.string().max(200).optional(),
});

async function listWorkItems(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  const p = listWorkItemsParams.parse(env.parameters);
  const all = await services.db.list<{ status?: string; assigneeId?: string; projectId?: string }>(ctx.owner, "ws-linear-workitems", { limit: env.limit });
  const items = all.filter((w) => { if (p.status && w.status !== p.status) return false; if (p.assigneeId && w.assigneeId !== p.assigneeId) return false; if (p.projectId && w.projectId !== p.projectId) return false; return true; });
  return { status: items.length ? "ok" : "empty", items, total: items.length };
}

const getWorkItemParams = z.object({ workItemId: z.string().min(1).max(200) });

async function getWorkItem(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  const p = getWorkItemParams.parse(env.parameters);
  const w = await services.db.get<{ id: string }>(ctx.owner, "ws-linear-workitems", p.workItemId);
  return { status: w ? "ok" : "empty", items: w ? [w] : [], total: w ? 1 : 0 };
}

async function listProjects(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-linear-projects", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "work.list": { queryId: "work.list", version: 1, handle: listWorkItems },
  "work.read": { queryId: "work.read", version: 1, handle: getWorkItem },
  "project.list": { queryId: "project.list", version: 1, handle: listProjects },
};
