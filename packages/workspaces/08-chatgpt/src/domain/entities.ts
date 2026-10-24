// 08-chatgpt — entidades canonicas del workspace de chat con IA.
// Derivado del analisis de OpenAI Chat Completions / Responses API
// (conversations, messages, tool calls, runs, context references).

import { z } from "zod";

export const chatMessageSchema = z.object({
  id: z.string().min(1).max(200),
  conversationId: z.string().min(1).max(200),
  role: z.enum(["user","assistant","system","tool"]),
  content: z.string().max(200000),
  name: z.string().max(200).optional(),
  toolCallId: z.string().max(200).optional(),
  toolCalls: z.array(z.object({
    id: z.string().min(1).max(200),
    name: z.string().max(200),
    arguments: z.string().max(50000).optional(),
  })).default([]),
  tokens: z.object({
    input: z.number().int().nonnegative().default(0),
    output: z.number().int().nonnegative().default(0),
  }).optional(),
  createdAt: z.string(),
});

export const chatConversationSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  ownerId: z.string().min(1).max(200),
  title: z.string().max(400).optional(),
  model: z.string().max(200).optional(),
  systemPrompt: z.string().max(20000).optional(),
  status: z.enum(["active","archived","deleted"]).default("active"),
  messageCount: z.number().int().nonnegative().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const contextReferenceSchema = z.object({
  id: z.string().min(1).max(200),
  conversationId: z.string().min(1).max(200),
  kind: z.enum(["entity","document","task","memory","event","workspace"]),
  refId: z.string().min(1).max(200),
  label: z.string().max(400).optional(),
  addedAt: z.string(),
});

export const toolCallSchema = z.object({
  id: z.string().min(1).max(200),
  conversationId: z.string().min(1).max(200),
  messageId: z.string().max(200).optional(),
  toolName: z.string().max(200),
  input: z.record(z.string(), z.unknown()).default({}),
  output: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["pending","ok","error","rejected"]).default("pending"),
  error: z.string().max(5000).optional(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
});

export const assistantRunSchema = z.object({
  id: z.string().min(1).max(200),
  conversationId: z.string().min(1).max(200),
  model: z.string().max(200).optional(),
  status: z.enum(["running","completed","failed","cancelled"]).default("running"),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  tokensInput: z.number().int().nonnegative().default(0),
  tokensOutput: z.number().int().nonnegative().default(0),
  costEur: z.number().nonnegative().default(0),
  error: z.string().max(5000).optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatConversation = z.infer<typeof chatConversationSchema>;
export type ContextReference = z.infer<typeof contextReferenceSchema>;
export type ToolCall = z.infer<typeof toolCallSchema>;
export type AssistantRun = z.infer<typeof assistantRunSchema>;