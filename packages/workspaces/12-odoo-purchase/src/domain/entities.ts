// 12-odoo-purchase — entidades canonicas del workspace de compras.
// Derivado del analisis de Odoo Purchase (purchase.order, purchase.order.line,
// res.partner supplier, stock.picking in).

import { z } from "zod";

export const purchaseRequestSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  requestedBy: z.string().max(200),
  reason: z.string().max(2000).optional(),
  lines: z.array(z.object({
    description: z.string().max(1000),
    quantity: z.number().nonnegative(),
    unitPrice: z.number().nonnegative().optional(),
    productId: z.string().max(200).optional(),
  })).default([]),
  budgetCategory: z.string().max(100).optional(),
  status: z.enum(["draft","submitted","approved","rejected","cancelled"]).default("draft"),
  approvedBy: z.string().max(200).optional(),
  approvedAt: z.string().optional(),
  createdAt: z.string(),
});

export const supplierQuoteSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  supplierId: z.string().min(1).max(200),
  requestId: z.string().max(200).optional(),
  quoteNumber: z.string().max(100).optional(),
  lines: z.array(z.object({
    description: z.string().max(1000),
    quantity: z.number().nonnegative(),
    unitPrice: z.number().nonnegative(),
  })).default([]),
  total: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  validUntil: z.string().optional(),
  deliveryDays: z.number().int().nonnegative().optional(),
  selected: z.boolean().default(false),
  receivedAt: z.string(),
});

export const purchaseLineSchema = z.object({
  id: z.string().min(1).max(200),
  orderId: z.string().min(1).max(200),
  productId: z.string().max(200).optional(),
  description: z.string().max(1000),
  quantity: z.number().nonnegative(),
  quantityReceived: z.number().nonnegative().default(0),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().nonnegative().default(0),
  subtotal: z.number().nonnegative().default(0),
  total: z.number().nonnegative().default(0),
});

export const purchaseOrderSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  supplierId: z.string().min(1).max(200),
  number: z.string().max(100),
  requestId: z.string().max(200).optional(),
  quoteId: z.string().max(200).optional(),
  lines: z.array(purchaseLineSchema).default([]),
  subtotal: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  status: z.enum(["draft","sent","confirmed","partially_received","received","cancelled"]).default("draft"),
  expectedAt: z.string().optional(),
  sentAt: z.string().optional(),
  receivedAt: z.string().optional(),
  notes: z.string().max(5000).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const purchaseReceptionSchema = z.object({
  id: z.string().min(1).max(200),
  orderId: z.string().min(1).max(200),
  receivedBy: z.string().max(200).optional(),
  lines: z.array(z.object({
    lineId: z.string().min(1).max(200),
    quantityReceived: z.number().nonnegative(),
  })).default([]),
  receivedAt: z.string(),
  notes: z.string().max(2000).optional(),
});

export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;
export type SupplierQuote = z.infer<typeof supplierQuoteSchema>;
export type PurchaseLine = z.infer<typeof purchaseLineSchema>;
export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>;
export type PurchaseReception = z.infer<typeof purchaseReceptionSchema>;