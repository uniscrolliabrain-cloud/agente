// 17-process-street — entidades canonicas del workspace de procedimientos.
// Derivado del analisis de Process Street API (workflows, checklists,
// tasks, form fields, runs, data sets, webhooks).

import { z } from "zod";

export const sopDefinitionSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  description: z.string().max(5000).optional(),
  version: z.number().int().positive().default(1),
  category: z.string().max(100).optional(),
  owner: z.string().max(200).optional(),
  active: z.boolean().default(true),
  estimatedMinutes: z.number().int().nonnegative().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const sopStepSchema = z.object({
  id: z.string().min(1).max(200),
  sopId: z.string().min(1).max(200),
  name: z.string().max(400),
  description: z.string().max(10000).optional(),
  order: z.number().int().nonnegative(),
  kind: z.enum(["task","form","approval","note","subprocess","webhook"]).default("task"),
  assigneeRole: z.string().max(100).optional(),
  requiresApproval: z.boolean().default(false),
  required: z.boolean().default(true),
  dueOffsetMinutes: z.number().int().optional(),
  formFields: z.array(z.object({
    key: z.string().min(1).max(100),
    label: z.string().min(1).max(400),
    type: z.enum(["text","number","date","select","textarea","checkbox","file"]),
    required: z.boolean().default(false),
    options: z.array(z.string().max(200)).default([]),
  })).default([]),
});

export const processRunSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  sopId: z.string().min(1).max(200),
  externalId: z.string().max(200).optional(),
  status: z.enum(["running","completed","aborted","failed","paused"]).default("running"),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  startedBy: z.string().max(200).optional(),
  linkedEntityId: z.string().max(200).optional(),
  linkedEntityType: z.string().max(100).optional(),
  currentStepId: z.string().max(200).optional(),
  progress: z.number().min(0).max(1).default(0),
});

export const stepResultSchema = z.object({
  id: z.string().min(1).max(200),
  processRunId: z.string().min(1).max(200),
  stepId: z.string().min(1).max(200),
  status: z.enum(["pending","in_progress","completed","skipped","failed","rejected"]).default("pending"),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  completedBy: z.string().max(200).optional(),
  note: z.string().max(5000).optional(),
  formValues: z.record(z.string(), z.unknown()).default({}),
  evidence: z.array(z.string().max(2000)).default([]),
});

export const approvalSchema = z.object({
  id: z.string().min(1).max(200),
  processRunId: z.string().min(1).max(200),
  stepId: z.string().min(1).max(200),
  requestedFrom: z.string().max(200).optional(),
  status: z.enum(["pending","approved","rejected"]).default("pending"),
  requestedAt: z.string(),
  decidedAt: z.string().optional(),
  decision: z.string().max(2000).optional(),
});

export type SOPDefinition = z.infer<typeof sopDefinitionSchema>;
export type SOPStep = z.infer<typeof sopStepSchema>;
export type ProcessRun = z.infer<typeof processRunSchema>;
export type StepResult = z.infer<typeof stepResultSchema>;
export type Approval = z.infer<typeof approvalSchema>;