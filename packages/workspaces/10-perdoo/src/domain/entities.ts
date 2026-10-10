// 10-perdoo — entidades canonicas del workspace de direccion y objetivos.
// Derivado del analisis de Perdoo API (objectives, key results, metrics,
// initiatives, check-ins, strategy links).

import { z } from "zod";

export const objectiveSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  title: z.string().max(500),
  description: z.string().max(5000).optional(),
  ownerId: z.string().max(200).optional(),
  parentId: z.string().max(200).optional(),
  period: z.string().max(50),
  kind: z.enum(["company","team","individual"]).default("company"),
  status: z.enum(["draft","active","at_risk","achieved","missed","cancelled"]).default("active"),
  progress: z.number().min(0).max(1).default(0),
  confidence: z.enum(["on_track","at_risk","off_track"]).default("on_track"),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const keyResultSchema = z.object({
  id: z.string().min(1).max(200),
  objectiveId: z.string().min(1).max(200),
  name: z.string().max(500),
  description: z.string().max(2000).optional(),
  ownerId: z.string().max(200).optional(),
  target: z.number(),
  current: z.number().default(0),
  startingValue: z.number().default(0),
  unit: z.string().max(50).optional(),
  direction: z.enum(["increase","decrease"]).default("increase"),
  progress: z.number().min(0).max(1).default(0),
  confidence: z.enum(["on_track","at_risk","off_track"]).default("on_track"),
  updatedAt: z.string(),
});

export const metricSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  keyResultId: z.string().max(200).optional(),
  name: z.string().max(200),
  value: z.number(),
  unit: z.string().max(50).optional(),
  source: z.string().max(200).optional(),
  measuredAt: z.string(),
});

export const initiativeSchema = z.object({
  id: z.string().min(1).max(200),
  objectiveId: z.string().min(1).max(200),
  title: z.string().max(500),
  ownerId: z.string().max(200).optional(),
  status: z.enum(["planned","in_progress","completed","cancelled"]).default("planned"),
  linkedWorkItemId: z.string().max(200).optional(),
  createdAt: z.string(),
});

export const checkInSchema = z.object({
  id: z.string().min(1).max(200),
  objectiveId: z.string().max(200).optional(),
  keyResultId: z.string().max(200).optional(),
  authorId: z.string().max(200).optional(),
  note: z.string().max(5000).optional(),
  progressSnapshot: z.number().min(0).max(1).default(0),
  confidenceSnapshot: z.enum(["on_track","at_risk","off_track"]).default("on_track"),
  createdAt: z.string(),
});

export const strategyLinkSchema = z.object({
  id: z.string().min(1).max(200),
  objectiveId: z.string().min(1).max(200),
  linkedType: z.enum(["workitem","project","invoice","opportunity","risk"]),
  linkedId: z.string().min(1).max(200),
  createdAt: z.string(),
});

export type Objective = z.infer<typeof objectiveSchema>;
export type KeyResult = z.infer<typeof keyResultSchema>;
export type Metric = z.infer<typeof metricSchema>;
export type Initiative = z.infer<typeof initiativeSchema>;
export type CheckIn = z.infer<typeof checkInSchema>;
export type StrategyLink = z.infer<typeof strategyLinkSchema>;