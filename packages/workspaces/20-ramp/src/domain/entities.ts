// 20-ramp — entidades canonicas del workspace de gastos.
// Derivado del analisis de Ramp API (expenses, receipts, cards,
// spend limits, approvals, transactions, reimbursements).

import { z } from "zod";

export const expenseSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  submittedBy: z.string().min(1).max(200),
  merchantName: z.string().max(400).optional(),
  description: z.string().max(2000).optional(),
  amount: z.number().nonnegative(),
  tax: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  category: z.string().max(200).optional(),
  subcategory: z.string().max(200).optional(),
  projectId: z.string().max(200).optional(),
  costCenter: z.string().max(200).optional(),
  occurredAt: z.string(),
  status: z.enum(["draft","submitted","approved","rejected","reimbursed","reconciled"]).default("draft"),
  paidBy: z.enum(["company_card","personal","cash","bank_transfer","other"]).default("company_card"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const receiptSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  expenseId: z.string().min(1).max(200),
  documentId: z.string().max(200).optional(),
  url: z.string().max(2000),
  mimeType: z.string().max(200),
  ocrText: z.string().max(50000).optional(),
  ocrConfidence: z.number().min(0).max(1).optional(),
  uploadedAt: z.string(),
});

export const spendLimitSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  personId: z.string().max(200).optional(),
  teamId: z.string().max(200).optional(),
  category: z.string().max(200).optional(),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  period: z.enum(["daily","weekly","monthly","quarterly","yearly"]).default("monthly"),
  enforce: z.boolean().default(true),
});

export const expenseApprovalSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  expenseId: z.string().min(1).max(200),
  approverId: z.string().min(1).max(200),
  decision: z.enum(["pending","approved","rejected","changes_requested"]).default("pending"),
  requestedAt: z.string(),
  decidedAt: z.string().optional(),
  comment: z.string().max(2000).optional(),
});

export const cardSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  holderId: z.string().min(1).max(200),
  last4: z.string().max(4),
  network: z.enum(["visa","mastercard","amex","other"]).default("visa"),
  active: z.boolean().default(true),
  spentThisPeriod: z.number().nonnegative().default(0),
  createdAt: z.string(),
});

export const reimbursementSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  personId: z.string().min(1).max(200),
  expenseIds: z.array(z.string().min(1).max(200)).default([]),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  status: z.enum(["pending","processing","paid","failed"]).default("pending"),
  paidAt: z.string().optional(),
});

export type Expense = z.infer<typeof expenseSchema>;
export type Receipt = z.infer<typeof receiptSchema>;
export type SpendLimit = z.infer<typeof spendLimitSchema>;
export type ExpenseApproval = z.infer<typeof expenseApprovalSchema>;
export type Card = z.infer<typeof cardSchema>;
export type Reimbursement = z.infer<typeof reimbursementSchema>;