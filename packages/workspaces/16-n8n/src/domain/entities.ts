// 16-n8n — entidades canonicas del workspace de automatizaciones.
// Derivado del analisis de n8n API (workflows, executions, credentials,
// nodes, triggers, webhooks, tags).

import { z } from "zod";

export const workflowDefinitionSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  description: z.string().max(5000).optional(),
  enabled: z.boolean().default(false),
  tags: z.array(z.string().max(100)).default([]),
  nodes: z.array(z.record(z.string(), z.unknown())).default([]),
  connections: z.record(z.string(), z.unknown()).default({}),
  settings: z.record(z.string(), z.unknown()).default({}),
  version: z.number().int().positive().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const triggerSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  workflowId: z.string().min(1).max(200),
  kind: z.enum(["webhook","schedule","event","manual","form"]),
  config: z.record(z.string(), z.unknown()).default({}),
  enabled: z.boolean().default(true),
  lastFiredAt: z.string().optional(),
});

export const workflowStepSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  workflowId: z.string().min(1).max(200),
  nodeType: z.string().max(200),
  name: z.string().max(400),
  config: z.record(z.string(), z.unknown()).default({}),
  order: z.number().int().nonnegative(),
  continueOnFail: z.boolean().default(false),
});

export const executionSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  workflowId: z.string().min(1).max(200),
  externalId: z.string().max(200).optional(),
  mode: z.enum(["manual","trigger","webhook","retry","integrated"]).default("trigger"),
  status: z.enum(["running","completed","failed","cancelled","waiting"]).default("running"),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  result: z.record(z.string(), z.unknown()).optional(),
  error: z.string().max(10000).optional(),
  retries: z.number().int().nonnegative().default(0),
});

export const credentialSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  name: z.string().max(200),
  kind: z.string().max(100),
  createdAt: z.string(),
});

export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;
export type Trigger = z.infer<typeof triggerSchema>;
export type WorkflowStep = z.infer<typeof workflowStepSchema>;
export type Execution = z.infer<typeof executionSchema>;
export type Credential = z.infer<typeof credentialSchema>;