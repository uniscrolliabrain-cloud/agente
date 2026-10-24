// 27-maintainx — entidades canonicas del workspace de activos y mantenimiento.
// Derivado del analisis de MaintainX API (assets, work orders, procedures,
// inspections, parts, locations, meters).

import { z } from "zod";

export const assetSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  kind: z.enum(["machine","vehicle","tool","equipment","facility","it_asset","other"]).default("equipment"),
  serialNumber: z.string().max(200).optional(),
  manufacturer: z.string().max(200).optional(),
  model: z.string().max(200).optional(),
  locationId: z.string().max(200).optional(),
  assignedTo: z.string().max(200).optional(),
  purchaseDate: z.string().optional(),
  warrantyUntil: z.string().optional(),
  status: z.enum(["active","maintenance","retired","broken"]).default("active"),
  criticality: z.enum(["low","medium","high","critical"]).default("medium"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const maintenanceWorkOrderSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  assetId: z.string().min(1).max(200),
  assigneeId: z.string().max(200).optional(),
  title: z.string().max(500),
  description: z.string().max(5000),
  kind: z.enum(["corrective","preventive","predictive","inspection","emergency"]).default("corrective"),
  priority: z.enum(["low","normal","high","urgent"]).default("normal"),
  status: z.enum(["open","in_progress","on_hold","completed","cancelled"]).default("open"),
  dueAt: z.string().optional(),
  openedAt: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  laborMinutes: z.number().int().nonnegative().default(0),
  partsUsed: z.array(z.object({
    productId: z.string().min(1).max(200),
    quantity: z.number().nonnegative(),
  })).default([]),
  cost: z.number().nonnegative().default(0),
});

export const inspectionSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  assetId: z.string().min(1).max(200),
  inspectedBy: z.string().max(200),
  result: z.enum(["pass","fail","needs_review"]),
  note: z.string().max(5000).optional(),
  findings: z.array(z.object({
    severity: z.enum(["info","warning","critical"]),
    description: z.string().max(2000),
  })).default([]),
  inspectedAt: z.string(),
});

export const maintenanceScheduleSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  assetId: z.string().min(1).max(200),
  kind: z.enum(["time_based","usage_based"]).default("time_based"),
  intervalDays: z.number().int().positive().optional(),
  intervalUsage: z.number().positive().optional(),
  lastPerformedAt: z.string().optional(),
  nextDueAt: z.string().optional(),
  active: z.boolean().default(true),
});

export const meterReadingSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  assetId: z.string().min(1).max(200),
  meterName: z.string().max(200),
  value: z.number(),
  unit: z.string().max(50).optional(),
  readAt: z.string(),
  readBy: z.string().max(200).optional(),
});

export type Asset = z.infer<typeof assetSchema>;
export type MaintenanceWorkOrder = z.infer<typeof maintenanceWorkOrderSchema>;
export type Inspection = z.infer<typeof inspectionSchema>;
export type MaintenanceSchedule = z.infer<typeof maintenanceScheduleSchema>;
export type MeterReading = z.infer<typeof meterReadingSchema>;