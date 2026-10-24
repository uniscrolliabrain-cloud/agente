// 13-productive — entidades canonicas del workspace de proyectos y rentabilidad.
// Derivado del analisis de Productive API (projects, budgets, time entries,
// resource allocations, deals, people, cost rates).

import { z } from "zod";

export const resourceAllocationSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  personId: z.string().min(1).max(200),
  projectId: z.string().min(1).max(200),
  role: z.string().max(200).optional(),
  hoursPerWeek: z.number().nonnegative(),
  billableHoursPerWeek: z.number().nonnegative().optional(),
  from: z.string(),
  to: z.string().optional(),
  createdAt: z.string(),
});

export const timeEntrySchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  personId: z.string().min(1).max(200),
  projectId: z.string().max(200).optional(),
  taskId: z.string().max(200).optional(),
  serviceId: z.string().max(200).optional(),
  minutes: z.number().int().nonnegative(),
  billable: z.boolean().default(true),
  date: z.string(),
  note: z.string().max(2000).optional(),
  approved: z.boolean().default(false),
  approvedBy: z.string().max(200).optional(),
  approvedAt: z.string().optional(),
});

export const projectBudgetSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  projectId: z.string().min(1).max(200),
  kind: z.enum(["fixed","time_and_materials","retainer","internal"]).default("fixed"),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  spent: z.number().nonnegative().default(0),
  invoiced: z.number().nonnegative().default(0),
  margin: z.number().default(0),
  marginPercent: z.number().default(0),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

export const costRateSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  personId: z.string().min(1).max(200),
  hourlyCostRate: z.number().nonnegative(),
  hourlyBillableRate: z.number().nonnegative().optional(),
  currency: z.string().max(10).default("EUR"),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
});

export const profitabilitySnapshotSchema = z.object({
  id: z.string().min(1).max(200),
  projectId: z.string().min(1).max(200),
  period: z.string().max(50),
  revenue: z.number().nonnegative().default(0),
  cost: z.number().nonnegative().default(0),
  hoursLogged: z.number().nonnegative().default(0),
  hoursBillable: z.number().nonnegative().default(0),
  margin: z.number().default(0),
  marginPercent: z.number().default(0),
  computedAt: z.string(),
});

export type ResourceAllocation = z.infer<typeof resourceAllocationSchema>;
export type TimeEntry = z.infer<typeof timeEntrySchema>;
export type ProjectBudget = z.infer<typeof projectBudgetSchema>;
export type CostRate = z.infer<typeof costRateSchema>;
export type ProfitabilitySnapshot = z.infer<typeof profitabilitySnapshotSchema>;