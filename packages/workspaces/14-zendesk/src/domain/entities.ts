// 14-zendesk — entidades canonicas del workspace de atencion al cliente.
// Derivado del analisis de Zendesk Support API (tickets, comments,
// users, organizations, groups, SLA policies, macros, triggers).

import { z } from "zod";

export const supportTicketSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  subject: z.string().max(500),
  description: z.string().max(50000).default(""),
  requesterId: z.string().max(200).optional(),
  assigneeId: z.string().max(200).optional(),
  groupId: z.string().max(200).optional(),
  organizationId: z.string().max(200).optional(),
  priority: z.enum(["low","normal","high","urgent"]).default("normal"),
  status: z.enum(["new","open","pending","hold","solved","closed"]).default("new"),
  type: z.enum(["question","incident","problem","task"]).optional(),
  tags: z.array(z.string().max(100)).default([]),
  channel: z.enum(["email","web","chat","whatsapp","phone","api","other"]).default("web"),
  slaId: z.string().max(200).optional(),
  dueAt: z.string().optional(),
  firstResponseAt: z.string().optional(),
  solvedAt: z.string().optional(),
  closedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ticketCommentSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  ticketId: z.string().min(1).max(200),
  authorId: z.string().max(200),
  authorKind: z.enum(["customer","agent","bot","system"]).default("agent"),
  body: z.string().max(50000),
  isInternal: z.boolean().default(false),
  attachments: z.array(z.string().max(2000)).default([]),
  createdAt: z.string(),
});

export const slaSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  ticketId: z.string().min(1).max(200),
  policy: z.string().max(200),
  policyId: z.string().max(200).optional(),
  metric: z.enum(["first_response","next_response","periodic_update","resolution"]).default("resolution"),
  targetMinutes: z.number().int().nonnegative(),
  dueAt: z.string(),
  breached: z.boolean().default(false),
  breachedAt: z.string().optional(),
});

export const resolutionSchema = z.object({
  id: z.string().min(1).max(200),
  ticketId: z.string().min(1).max(200),
  summary: z.string().max(10000),
  rootCause: z.string().max(5000).optional(),
  actions: z.array(z.string().max(1000)).default([]),
  resolvedBy: z.string().max(200),
  resolvedAt: z.string(),
  satisfactionScore: z.number().min(0).max(5).optional(),
});

export const macroSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  title: z.string().max(200),
  actions: z.array(z.record(z.string(), z.unknown())).default([]),
  active: z.boolean().default(true),
});

export type SupportTicket = z.infer<typeof supportTicketSchema>;
export type TicketComment = z.infer<typeof ticketCommentSchema>;
export type SLA = z.infer<typeof slaSchema>;
export type Resolution = z.infer<typeof resolutionSchema>;
export type Macro = z.infer<typeof macroSchema>;