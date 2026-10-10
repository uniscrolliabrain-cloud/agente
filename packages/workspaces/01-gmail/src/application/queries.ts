// 01-gmail - handlers reales de queries.
import { z } from "zod";
import type { WorkspaceServices, WorkspaceContext, WorkspaceQueryEnvelope, QueryResult } from "../../../src/contracts/index.ts";

const listInboxParams = z.object({
  label: z.string().max(100).optional(),
  unreadOnly: z.boolean().optional(),
});

async function listInbox(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  const p = listInboxParams.parse(env.parameters);
  const all = await services.db.list<{ labels?: string[]; read?: boolean }>(ctx.owner, "ws-gmail-messages", { limit: env.limit });
  const items = all.filter((m) => { if (p.label && !(m.labels ?? []).includes(p.label)) return false; if (p.unreadOnly && m.read) return false; return true; });
  return { status: items.length ? "ok" : "empty", items, total: items.length };
}

const getThreadParams = z.object({ threadId: z.string().min(1).max(200) });

async function getThread(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  const p = getThreadParams.parse(env.parameters);
  const t = await services.db.get<{ id: string }>(ctx.owner, "ws-gmail-threads", p.threadId);
  return { status: t ? "ok" : "empty", items: t ? [t] : [], total: t ? 1 : 0 };
}

const searchParams = z.object({ q: z.string().min(1).max(500) });

async function searchMessages(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  const p = searchParams.parse(env.parameters);
  const q = p.q.toLowerCase();
  const all = await services.db.list<{ subject?: string; body?: string; from?: string }>(ctx.owner, "ws-gmail-messages", { limit: env.limit });
  const items = all.filter((m) => (m.subject ?? "").toLowerCase().includes(q) || (m.body ?? "").toLowerCase().includes(q) || (m.from ?? "").toLowerCase().includes(q));
  return { status: items.length ? "ok" : "empty", items, total: items.length };
}

async function listLabels(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  const all = await services.db.list<{ id: string }>(ctx.owner, "ws-gmail-labels", { limit: env.limit });
  return { status: all.length ? "ok" : "empty", items: all, total: all.length };
}

export const QUERIES = {
  "email.list_inbox": { queryId: "email.list_inbox", version: 1, handle: listInbox },
  "email.get_thread": { queryId: "email.get_thread", version: 1, handle: getThread },
  "email.search": { queryId: "email.search", version: 1, handle: searchMessages },
  "email.list_labels": { queryId: "email.list_labels", version: 1, handle: listLabels },
};
