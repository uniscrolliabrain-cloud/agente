// 21-stripe - handlers reales de queries.
import { z } from "zod";
import type {
  WorkspaceServices,
  WorkspaceContext,
  WorkspaceQueryEnvelope,
  QueryResult,
} from "../../../src/contracts/index.ts";

const listPaymentsParams = z.object({
  status: z.string().max(50).optional(),
  customerId: z.string().max(200).optional(),
  from: z.string().max(50).optional(),
  to: z.string().max(50).optional(),
});

async function listPayments(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  const params = listPaymentsParams.parse(env.parameters);
  const all = await services.db.list<{ status?: string; customerId?: string; createdAt?: string }>(ctx.owner, "ws-stripe-payments", { limit: env.limit });
  const filtered = all.filter((p) => {
    if (params.status && p.status !== params.status) return false;
    if (params.customerId && p.customerId !== params.customerId) return false;
    if (params.from && (p.createdAt ?? "") < params.from) return false;
    if (params.to && (p.createdAt ?? "") > params.to) return false;
    return true;
  });
  return { status: filtered.length ? "ok" : "empty", items: filtered, total: filtered.length };
}

const revenueParams = z.object({
  period: z.string().max(50).optional(),
});

async function readRevenue(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope): Promise<QueryResult<unknown>> {
  const params = revenueParams.parse(env.parameters);
  const snapshots = await services.db.list<{ period?: string }>(ctx.owner, "ws-stripe-revenue", { limit: env.limit });
  const filtered = params.period ? snapshots.filter((s) => s.period === params.period) : snapshots;
  return { status: filtered.length ? "ok" : "empty", items: filtered, total: filtered.length };
}

export const QUERIES = {
  "payment.list": { queryId: "payment.list", version: 1, handle: listPayments },
  "revenue.read": { queryId: "revenue.read", version: 1, handle: readRevenue },
};
