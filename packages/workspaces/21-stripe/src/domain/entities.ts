// 21-stripe — entidades canonicas del workspace de pagos y analitica.
// Derivado del analisis de Stripe API (payments, refunds, disputes,
// customers, subscriptions, revenue snapshots).

import { z } from "zod";

export const paymentSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  customerId: z.string().max(200).optional(),
  invoiceId: z.string().max(200).optional(),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  status: z.enum(["pending","succeeded","failed","refunded","partially_refunded","disputed"]).default("pending"),
  method: z.enum(["card","transfer","direct_debit","wallet","other"]).default("card"),
  provider: z.string().max(100).default("stripe"),
  feeAmount: z.number().nonnegative().default(0),
  netAmount: z.number().nonnegative().default(0),
  failureReason: z.string().max(500).optional(),
  paidAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const refundSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  paymentId: z.string().min(1).max(200),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  reason: z.string().max(500).optional(),
  status: z.enum(["pending","succeeded","failed"]).default("pending"),
  issuedBy: z.string().max(200).optional(),
  issuedAt: z.string(),
});

export const disputeSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  paymentId: z.string().min(1).max(200),
  reason: z.enum(["fraudulent","product_not_received","duplicate","subscription_canceled","other"]).default("other"),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  status: z.enum(["needs_response","under_review","won","lost","closed"]).default("needs_response"),
  evidence: z.array(z.string().max(2000)).default([]),
  openedAt: z.string(),
  resolvedAt: z.string().optional(),
});

export const paymentCustomerSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  email: z.string().max(500).optional(),
  name: z.string().max(400).optional(),
  contactId: z.string().max(200).optional(),
  lifetimeValue: z.number().nonnegative().default(0),
  currency: z.string().max(10).default("EUR"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const subscriptionSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  customerId: z.string().min(1).max(200),
  planId: z.string().min(1).max(200),
  status: z.enum(["active","past_due","canceled","trialing","paused"]).default("active"),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  interval: z.enum(["day","week","month","year"]).default("month"),
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
  canceledAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const revenueSnapshotSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  period: z.string().max(50),
  currency: z.string().max(10).default("EUR"),
  grossRevenue: z.number().nonnegative().default(0),
  netRevenue: z.number().nonnegative().default(0),
  refunds: z.number().nonnegative().default(0),
  fees: z.number().nonnegative().default(0),
  paymentCount: z.number().int().nonnegative().default(0),
  computedAt: z.string(),
});

export type Payment = z.infer<typeof paymentSchema>;
export type Refund = z.infer<typeof refundSchema>;
export type Dispute = z.infer<typeof disputeSchema>;
export type PaymentCustomer = z.infer<typeof paymentCustomerSchema>;
export type Subscription = z.infer<typeof subscriptionSchema>;
export type RevenueSnapshot = z.infer<typeof revenueSnapshotSchema>;
