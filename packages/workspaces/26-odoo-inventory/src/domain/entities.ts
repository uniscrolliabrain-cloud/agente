// 26-odoo-inventory — entidades canonicas del workspace de inventario.
// Derivado del analisis de Odoo Inventory (stock.quant, stock.move,
// stock.location, stock.warehouse, product.product, stock.picking).

import { z } from "zod";

export const productSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  sku: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  category: z.string().max(200).optional(),
  unit: z.enum(["unit","kg","g","l","ml","m","cm","box","pack"]).default("unit"),
  cost: z.number().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
  trackSerial: z.boolean().default(false),
  trackLot: z.boolean().default(false),
  active: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const stockLocationSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(200),
  kind: z.enum(["warehouse","shelf","bin","transit","virtual","supplier","customer"]).default("warehouse"),
  parentId: z.string().max(200).optional(),
  warehouseId: z.string().max(200).optional(),
  active: z.boolean().default(true),
});

export const stockMovementSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  productId: z.string().min(1).max(200),
  fromLocationId: z.string().max(200).optional(),
  toLocationId: z.string().max(200).optional(),
  quantity: z.number(),
  unitCost: z.number().nonnegative().optional(),
  kind: z.enum(["receipt","issue","transfer","adjustment","return","scrap","production_in","production_out"]).default("adjustment"),
  reason: z.string().max(500).optional(),
  referenceId: z.string().max(200).optional(),
  referenceType: z.string().max(100).optional(),
  lotId: z.string().max(200).optional(),
  serialNumber: z.string().max(200).optional(),
  occurredAt: z.string(),
  recordedBy: z.string().max(200).optional(),
});

export const stockBalanceSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  productId: z.string().min(1).max(200),
  locationId: z.string().min(1).max(200),
  quantity: z.number(),
  reservedQuantity: z.number().nonnegative().default(0),
  availableQuantity: z.number().default(0),
  lotId: z.string().max(200).optional(),
  asOf: z.string(),
});

export const stockLotSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  productId: z.string().min(1).max(200),
  lotNumber: z.string().max(200),
  serialNumber: z.string().max(200).optional(),
  quantity: z.number().nonnegative(),
  expiresAt: z.string().optional(),
  receivedAt: z.string(),
});

export const stockAlertSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  productId: z.string().min(1).max(200),
  locationId: z.string().max(200).optional(),
  threshold: z.number().nonnegative(),
  currentQuantity: z.number(),
  severity: z.enum(["low","medium","high","critical"]).default("medium"),
  detectedAt: z.string(),
  resolvedAt: z.string().optional(),
});

export type Product = z.infer<typeof productSchema>;
export type StockLocation = z.infer<typeof stockLocationSchema>;
export type StockMovement = z.infer<typeof stockMovementSchema>;
export type StockBalance = z.infer<typeof stockBalanceSchema>;
export type StockLot = z.infer<typeof stockLotSchema>;
export type StockAlert = z.infer<typeof stockAlertSchema>;