// 33-langsmith — entidades canonicas del workspace de observabilidad de agentes.
// Derivado del analisis de LangSmith API (runs, traces, spans, feedback,
// datasets, examples, experiments, evaluations, prompts).

import { z } from "zod";

export const agentRunSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  agentId: z.string().max(200).optional(),
  taskId: z.string().max(200).optional(),
  conversationId: z.string().max(200).optional(),
  parentRunId: z.string().max(200).optional(),
  name: z.string().max(400),
  kind: z.enum(["chain","llm","tool","retriever","embedding","agent","other"]).default("chain"),
  status: z.enum(["running","completed","failed","cancelled"]).default("running"),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  inputs: z.record(z.string(), z.unknown()).default({}),
  outputs: z.record(z.string(), z.unknown()).default({}),
  error: z.string().max(10000).optional(),
  tags: z.array(z.string().max(100)).default([]),
});

export const spanSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  runId: z.string().min(1).max(200),
  parentSpanId: z.string().max(200).optional(),
  name: z.string().max(400),
  kind: z.enum(["llm","tool","retrieval","chain","custom"]).default("custom"),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  inputs: z.record(z.string(), z.unknown()).default({}),
  outputs: z.record(z.string(), z.unknown()).default({}),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const modelInvocationSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  runId: z.string().min(1).max(200),
  spanId: z.string().max(200).optional(),
  provider: z.string().max(100),
  model: z.string().max(200),
  inputTokens: z.number().int().nonnegative().default(0),
  outputTokens: z.number().int().nonnegative().default(0),
  totalTokens: z.number().int().nonnegative().default(0),
  costEur: z.number().nonnegative().default(0),
  latencyMs: z.number().int().nonnegative().optional(),
  invokedAt: z.string(),
});

export const evaluationSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  runId: z.string().min(1).max(200),
  criterion: z.string().max(200),
  evaluator: z.enum(["human","llm","heuristic","reference"]).default("heuristic"),
  score: z.number(),
  scale: z.string().max(50).default("0-1"),
  comment: z.string().max(5000).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  evaluatedAt: z.string(),
  evaluatedBy: z.string().max(200).optional(),
});

export const feedbackSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  runId: z.string().min(1).max(200),
  key: z.string().max(200),
  score: z.number().optional(),
  value: z.unknown().optional(),
  comment: z.string().max(5000).optional(),
  source: z.enum(["user","system","agent","admin"]).default("user"),
  createdAt: z.string(),
});

export const promptTemplateSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  name: z.string().max(400),
  version: z.number().int().positive().default(1),
  template: z.string().max(100000),
  variables: z.array(z.string().max(100)).default([]),
  tags: z.array(z.string().max(100)).default([]),
  createdAt: z.string(),
});

export type AgentRun = z.infer<typeof agentRunSchema>;
export type Span = z.infer<typeof spanSchema>;
export type ModelInvocation = z.infer<typeof modelInvocationSchema>;
export type Evaluation = z.infer<typeof evaluationSchema>;
export type Feedback = z.infer<typeof feedbackSchema>;
export type PromptTemplate = z.infer<typeof promptTemplateSchema>;