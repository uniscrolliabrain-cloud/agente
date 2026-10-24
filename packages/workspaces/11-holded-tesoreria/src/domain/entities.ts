// 11-holded-tesoreria — entidades canonicas del workspace de tesoreria.
// Derivado del analisis de Holded tesoreria + banca online (PSD2)
// (bank accounts, transactions, reconciliations, balances, statements).

import { z } from "zod";

export const bankAccountSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  iban: z.string().max(50).optional(),
  bic: z.string().max(20).optional(),
  bankName: z.string().max(200).optional(),
  currency: z.string().max(10).default("EUR"),
  kind: z.enum(["checking","savings","credit","cash"]).default("checking"),
  active: z.boolean().default(true),
  createdAt: z.string(),
});

export const bankTransactionSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  accountId: z.string().min(1).max(200),
  externalId: z.string().max(200).optional(),
  amount: z.number(),
  currency: z.string().max(10).default("EUR"),
  balanceAfter: z.number().optional(),
  occurredAt: z.string(),
  valueDate: z.string().optional(),
  description: z.string().max(1000).optional(),
  counterpartyName: z.string().max(400).optional(),
  counterpartyIban: z.string().max(50).optional(),
  reference: z.string().max(200).optional(),
  kind: z.enum(["credit","debit","fee","interest","transfer"]).default("transfer"),
  status: z.enum(["pending","reconciled","flagged","ignored"]).default("pending"),
});

export const reconciliationSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  transactionId: z.string().min(1).max(200),
  invoiceId: z.string().max(200).optional(),
  paymentId: z.string().max(200).optional(),
  expenseId: z.string().max(200).optional(),
  matchedAmount: z.number(),
  difference: z.number().default(0),
  confidence: z.number().min(0).max(1).default(1),
  reconciledAt: z.string(),
  reconciledBy: z.string().max(200).optional(),
});

export const balanceSchema = z.object({
  id: z.string().min(1).max(200),
  accountId: z.string().min(1).max(200),
  amount: z.number(),
  currency: z.string().max(10).default("EUR"),
  available: z.number().optional(),
  asOf: z.string(),
});

export const statementSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  accountId: z.string().min(1).max(200),
  periodFrom: z.string(),
  periodTo: z.string(),
  openingBalance: z.number(),
  closingBalance: z.number(),
  transactionCount: z.number().int().nonnegative().default(0),
  importedAt: z.string(),
});

export type BankAccount = z.infer<typeof bankAccountSchema>;
export type BankTransaction = z.infer<typeof bankTransactionSchema>;
export type Reconciliation = z.infer<typeof reconciliationSchema>;
export type Balance = z.infer<typeof balanceSchema>;
export type Statement = z.infer<typeof statementSchema>;