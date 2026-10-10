// 04-holded — entidades canonicas del workspace de administracion.
// Derivado del analisis de Holded API v2 (invoices, contacts,
// products, taxes, payments, accounting).

import { z } from "zod";

export const counterpartySchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  kind: z.enum(["customer","supplier","both"]),
  taxId: z.string().max(50).optional(),
  email: z.string().max(500).optional(),
  phone: z.string().max(100).optional(),
  address: z.object({
    street: z.string().max(400).optional(),
    city: z.string().max(200).optional(),
    postalCode: z.string().max(20).optional(),
    country: z.string().max(100).optional(),
  }).optional(),
  iban: z.string().max(50).optional(),
  paymentTerms: z.number().int().nonnegative().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const invoiceLineSchema = z.object({
  id: z.string().min(1).max(200),
  invoiceId: z.string().min(1).max(200),
  description: z.string().max(1000),
  quantity: z.number().nonnegative(),
  unitPrice: z.number().nonnegative(),
  discount: z.number().min(0).max(100).default(0),
  taxRate: z.number().nonnegative(),
  taxAmount: z.number().nonnegative().default(0),
  subtotal: z.number().nonnegative().default(0),
  total: z.number().nonnegative().default(0),
});

export const invoiceSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  number: z.string().max(100),
  series: z.string().max(50).optional(),
  counterpartyId: z.string().min(1).max(200),
  lines: z.array(invoiceLineSchema).default([]),
  subtotal: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  status: z.enum(["draft","issued","sent","paid","partially_paid","overdue","void","credited"]).default("draft"),
  kind: z.enum(["standard","rectificative","simplified","proforma"]).default("standard"),
  issuedAt: z.string().optional(),
  dueAt: z.string().optional(),
  paidAt: z.string().optional(),
  notes: z.string().max(5000).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const taxSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  name: z.string().max(100),
  rate: z.number().nonnegative(),
  kind: z.enum(["vat","irpf","igic","other"]).default("vat"),
  default: z.boolean().default(false),
});

export const paymentSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  invoiceId: z.string().max(200).optional(),
  counterpartyId: z.string().max(200).optional(),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  paidAt: z.string(),
  method: z.enum(["cash","card","transfer","direct_debit","other"]).default("transfer"),
  reference: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export const creditNoteSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  originalInvoiceId: z.string().min(1).max(200),
  number: z.string().max(100),
  amount: z.number().nonnegative(),
  reason: z.string().max(1000),
  issuedAt: z.string(),
});

export const expenseSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  supplierId: z.string().max(200).optional(),
  amount: z.number().nonnegative(),
  tax: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  category: z.string().max(200).optional(),
  documentId: z.string().max(200).optional(),
  recordedAt: z.string(),
  notes: z.string().max(2000).optional(),
});

export type Counterparty = z.infer<typeof counterpartySchema>;
export type InvoiceLine = z.infer<typeof invoiceLineSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type Tax = z.infer<typeof taxSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type CreditNote = z.infer<typeof creditNoteSchema>;
export type Expense = z.infer<typeof expenseSchema>;