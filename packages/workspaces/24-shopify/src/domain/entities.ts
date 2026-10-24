// 24-shopify — entidades canonicas del workspace de comercio electronico.
// Derivado del analisis de Shopify Admin API (orders, products, variants,
// fulfillments, returns, refunds, customers, inventory levels).

import { z } from "zod";

export const salesOrderSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  number: z.string().max(100),
  customerId: z.string().max(200).optional(),
  customerEmail: z.string().max(500).optional(),
  lines: z.array(z.object({
    productId: z.string().max(200).optional(),
    variantId: z.string().max(200).optional(),
    sku: z.string().max(100).optional(),
    name: z.string().max(500),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
    total: z.number().nonnegative(),
  })).default([]),
  subtotal: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  shipping: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  status: z.enum(["pending","paid","fulfilled","partially_fulfilled","cancelled","refunded","returned"]).default("pending"),
  paymentStatus: z.enum(["pending","authorized","paid","partially_refunded","refunded","voided"]).default("pending"),
  channel: z.enum(["online","pos","marketplace","manual"]).default("online"),
  placedAt: z.string(),
  updatedAt: z.string(),
});

export const productVariantSchema = z.object({
  id: z.string().min(1).max(200),
  productId: z.string().min(1).max(200),
  sku: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  name: z.string().max(400).optional(),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  cost: z.number().nonnegative().optional(),
  stock: z.number().int().default(0),
  weightGrams: z.number().int().nonnegative().optional(),
  options: z.record(z.string(), z.string()).default({}),
});

export const fulfillmentSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  orderId: z.string().min(1).max(200),
  status: z.enum(["pending","in_transit","delivered","failed","returned"]).default("pending"),
  carrier: z.string().max(200).optional(),
  trackingNumber: z.string().max(200).optional(),
  trackingUrl: z.string().max(2000).optional(),
  shippedAt: z.string().optional(),
  deliveredAt: z.string().optional(),
  lineIds: z.array(z.string().min(1).max(200)).default([]),
});

export const returnSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  orderId: z.string().min(1).max(200),
  reason: z.enum(["size","damaged","not_as_described","wrong_item","no_longer_needed","other"]).default("other"),
  note: z.string().max(2000).optional(),
  lineIds: z.array(z.string().min(1).max(200)).default([]),
  status: z.enum(["requested","approved","received","refunded","rejected"]).default("requested"),
  requestedAt: z.string(),
  resolvedAt: z.string().optional(),
});

export const refundSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  orderId: z.string().min(1).max(200),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  reason: z.string().max(500).optional(),
  status: z.enum(["pending","succeeded","failed"]).default("pending"),
  issuedAt: z.string(),
});

export type SalesOrder = z.infer<typeof salesOrderSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type Fulfillment = z.infer<typeof fulfillmentSchema>;
export type Return = z.infer<typeof returnSchema>;
export type Refund = z.infer<typeof refundSchema>;