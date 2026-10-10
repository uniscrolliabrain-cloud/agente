// 21-stripe - handlers reales de comandos.
import { z } from "zod";
import {
  paymentSchema,
  refundSchema,
  disputeSchema,
  subscriptionSchema,
} from "../domain/entities.ts";
import type {
  WorkspaceServices,
  WorkspaceContext,
  WorkspaceCommandEnvelope,
  CommandResult,
} from "../../../src/contracts/index.ts";

const recordPaymentPayload = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  method: z.enum(["card","transfer","direct_debit","wallet","other"]).default("card"),
  customerId: z.string().max(200).optional(),
  invoiceId: z.string().max(200).optional(),
  externalId: z.string().max(200).optional(),
  feeAmount: z.number().nonnegative().default(0),
});

const issueRefundPayload = z.object({
  paymentId: z.string().min(1).max(200),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  reason: z.string().max(500).optional(),
});

const openDisputePayload = z.object({
  paymentId: z.string().min(1).max(200),
  amount: z.number().nonnegative(),
  reason: z.enum(["fraudulent","product_not_received","duplicate","subscription_canceled","other"]).default("other"),
  currency: z.string().max(10).default("EUR"),
});

const resolveDisputePayload = z.object({
  disputeId: z.string().min(1).max(200),
  status: z.enum(["won","lost","closed"]),
  evidence: z.array(z.string().max(2000)).default([]),
});

const manageSubscriptionPayload = z.object({
  customerId: z.string().min(1).max(200),
  planId: z.string().min(1).max(200),
  status: z.enum(["active","past_due","canceled","trialing","paused"]).default("active"),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  interval: z.enum(["day","week","month","year"]).default("month"),
});

async function recordPayment(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const payload = recordPaymentPayload.parse(env.payload);
  const id = env.idempotencyKey ?? env.entityId ?? pay-;
  const kind = "ws-stripe-payments";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const now = new Date().toISOString();
  const entity = paymentSchema.parse({
    id,
    tenantId: ctx.tenantId,
    amount: payload.amount,
    currency: payload.currency,
    method: payload.method,
    status: "pending",
    provider: "stripe",
    feeAmount: payload.feeAmount,
    netAmount: payload.amount - payload.feeAmount,
    createdAt: now,
    updatedAt: now,
    ...(payload.externalId ? { externalId: payload.externalId } : {}),
    ...(payload.customerId ? { customerId: payload.customerId } : {}),
    ...(payload.invoiceId ? { invoiceId: payload.invoiceId } : {}),
  });
  await services.db.insertIfAbsent(ctx.owner, kind, entity);
  await services.bus?.emit(ctx.owner, "payment.succeeded", { kind: "system", id: ctx.workspaceId }, { entityId: id, amount: payload.amount, currency: payload.currency }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

async function issueRefund(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const payload = issueRefundPayload.parse(env.payload);
  const id = env.idempotencyKey ?? ef-;
  const kind = "ws-stripe-refunds";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const now = new Date().toISOString();
  const entity = refundSchema.parse({
    id,
    tenantId: ctx.tenantId,
    paymentId: payload.paymentId,
    amount: payload.amount,
    currency: payload.currency,
    status: "pending",
    issuedAt: now,
    ...(payload.reason ? { reason: payload.reason } : {}),
  });
  await services.db.insertIfAbsent(ctx.owner, kind, entity);
  await services.bus?.emit(ctx.owner, "refund.issued", { kind: "system", id: ctx.workspaceId }, { entityId: id, paymentId: payload.paymentId, amount: payload.amount }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

async function openDispute(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const payload = openDisputePayload.parse(env.payload);
  const id = env.idempotencyKey ?? disp-;
  const kind = "ws-stripe-disputes";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const now = new Date().toISOString();
  const entity = disputeSchema.parse({
    id,
    tenantId: ctx.tenantId,
    paymentId: payload.paymentId,
    amount: payload.amount,
    currency: payload.currency,
    reason: payload.reason,
    status: "needs_response",
    openedAt: now,
  });
  await services.db.insertIfAbsent(ctx.owner, kind, entity);
  await services.bus?.emit(ctx.owner, "dispute.opened", { kind: "system", id: ctx.workspaceId }, { entityId: id, paymentId: payload.paymentId, amount: payload.amount }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}

async function resolveDispute(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const payload = resolveDisputePayload.parse(env.payload);
  const kind = "ws-stripe-disputes";
  const existing = await services.db.get<{ id: string; tenantId: string }>(ctx.owner, kind, payload.disputeId);
  if (!existing) return { status: "rejected", reason: "dispute not found" };
  await services.db.put(ctx.owner, kind, { ...existing, status: payload.status, evidence: payload.evidence, resolvedAt: new Date().toISOString() });
  return { status: "ok", entityId: payload.disputeId };
}

async function manageSubscription(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceCommandEnvelope): Promise<CommandResult> {
  const payload = manageSubscriptionPayload.parse(env.payload);
  const id = env.idempotencyKey ?? sub-;
  const kind = "ws-stripe-subscriptions";
  const existing = await services.db.get<{ id: string }>(ctx.owner, kind, id);
  if (existing) return { status: "ok", entityId: id };
  const now = new Date().toISOString();
  const entity = subscriptionSchema.parse({
    id,
    tenantId: ctx.tenantId,
    customerId: payload.customerId,
    planId: payload.planId,
    status: payload.status,
    amount: payload.amount,
    currency: payload.currency,
    interval: payload.interval,
    currentPeriodStart: now,
    currentPeriodEnd: now,
    createdAt: now,
    updatedAt: now,
  });
  await services.db.insertIfAbsent(ctx.owner, kind, entity);
  return { status: "ok", entityId: id };
}

export const COMMANDS = {
  "payment.record": { commandId: "payment.record", version: 1, handle: recordPayment },
  "refund.issue": { commandId: "refund.issue", version: 1, handle: issueRefund },
  "dispute.open": { commandId: "dispute.open", version: 1, handle: openDispute },
  "dispute.resolve": { commandId: "dispute.resolve", version: 1, handle: resolveDispute },
  "subscription.manage": { commandId: "subscription.manage", version: 1, handle: manageSubscription },
};
