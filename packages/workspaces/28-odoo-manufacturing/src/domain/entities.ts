// 28-odoo-manufacturing — entidades canonicas del workspace de produccion.
// Derivado del analisis de Odoo Manufacturing (mrp.production, mrp.bom,
// mrp.workorder, mrp.routing.workcenter, stock.move raw/finished).

import { z } from "zod";

export const billOfMaterialsSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  productId: z.string().min(1).max(200),
  name: z.string().max(400).optional(),
  quantity: z.number().positive().default(1),
  unit: z.string().max(50).default("unit"),
  components: z.array(z.object({
    componentId: z.string().min(1).max(200),
    quantity: z.number().nonnegative(),
    unit: z.string().max(50).optional(),
    waste: z.number().min(0).max(1).default(0),
  })).default([]),
  operations: z.array(z.object({
    name: z.string().max(200),
    durationMinutes: z.number().nonnegative(),
    workcenterId: z.string().max(200).optional(),
  })).default([]),
  active: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const productionOrderSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  number: z.string().max(100),
  productId: z.string().min(1).max(200),
  bomId: z.string().max(200).optional(),
  quantity: z.number().positive(),
  quantityProduced: z.number().nonnegative().default(0),
  quantityScrapped: z.number().nonnegative().default(0),
  status: z.enum(["draft","planned","confirmed","in_progress","to_close","done","cancelled"]).default("draft"),
  priority: z.enum(["low","normal","high","urgent"]).default("normal"),
  scheduledFor: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  dueAt: z.string().optional(),
  origin: z.string().max(200).optional(),
  saleOrderId: z.string().max(200).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const materialConsumptionSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  productionOrderId: z.string().min(1).max(200),
  componentId: z.string().min(1).max(200),
  quantityPlanned: z.number().nonnegative(),
  quantityConsumed: z.number().nonnegative(),
  lotId: z.string().max(200).optional(),
  consumedAt: z.string(),
  consumedBy: z.string().max(200).optional(),
});

export const productionOutputSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  productionOrderId: z.string().min(1).max(200),
  productId: z.string().min(1).max(200),
  quantity: z.number().positive(),
  kind: z.enum(["finished","semi_finished","scrap","byproduct"]).default("finished"),
  lotId: z.string().max(200).optional(),
  recordedAt: z.string(),
  recordedBy: z.string().max(200).optional(),
});

export const workcenterSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  name: z.string().max(400),
  capacity: z.number().positive().default(1),
  costPerHour: z.number().nonnegative().optional(),
  active: z.boolean().default(true),
});

export const productionOperationSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  productionOrderId: z.string().min(1).max(200),
  workcenterId: z.string().max(200).optional(),
  name: z.string().max(400),
  plannedMinutes: z.number().nonnegative(),
  actualMinutes: z.number().nonnegative().default(0),
  status: z.enum(["pending","in_progress","completed","cancelled"]).default("pending"),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  operatorId: z.string().max(200).optional(),
});

export type BillOfMaterials = z.infer<typeof billOfMaterialsSchema>;
export type ProductionOrder = z.infer<typeof productionOrderSchema>;
export type MaterialConsumption = z.infer<typeof materialConsumptionSchema>;
export type ProductionOutput = z.infer<typeof productionOutputSchema>;
export type Workcenter = z.infer<typeof workcenterSchema>;
export type ProductionOperation = z.infer<typeof productionOperationSchema>;