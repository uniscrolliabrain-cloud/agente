// 25-intercom — entidades canonicas del workspace de posventa.
// Derivado del analisis de Intercom API (contacts, conversations,
// messages, admins, teams, tags, notes, events, articles).

import { z } from "zod";

export const customerProfileSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  contactId: z.string().max(200).optional(),
  email: z.string().max(500).optional(),
  name: z.string().max(400).optional(),
  companyId: z.string().max(200).optional(),
  tags: z.array(z.string().max(100)).default([]),
  attributes: z.record(z.string(), z.unknown()).default({}),
  lifetimeValue: z.number().nonnegative().default(0),
  firstSeenAt: z.string().optional(),
  lastSeenAt: z.string().optional(),
  createdAt: z.string(),
});

export const customerConversationSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  contactId: z.string().min(1).max(200),
  assigneeId: z.string().max(200).optional(),
  teamId: z.string().max(200).optional(),
  subject: z.string().max(500).optional(),
  status: z.enum(["open","pending","closed","snoozed"]).default("open"),
  priority: z.enum(["low","normal","high","urgent"]).default("normal"),
  source: z.enum(["email","chat","whatsapp","phone","api","other"]).default("chat"),
  tags: z.array(z.string().max(100)).default([]),
  openedAt: z.string(),
  lastMessageAt: z.string(),
  closedAt: z.string().optional(),
  satisfactionScore: z.number().min(0).max(5).optional(),
});

export const conversationMessageSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  conversationId: z.string().min(1).max(200),
  authorId: z.string().max(200).optional(),
  authorKind: z.enum(["customer","agent","bot","system"]).default("customer"),
  body: z.string().max(50000),
  bodyHtml: z.string().max(200000).optional(),
  attachments: z.array(z.string().max(2000)).default([]),
  isInternal: z.boolean().default(false),
  createdAt: z.string(),
});

export const customerEventSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  contactId: z.string().min(1).max(200),
  name: z.string().max(200),
  metadata: z.record(z.string(), z.unknown()).default({}),
  occurredAt: z.string(),
});

export const customerNoteSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  contactId: z.string().min(1).max(200),
  authorId: z.string().max(200).optional(),
  body: z.string().max(5000),
  createdAt: z.string(),
});

export type CustomerProfile = z.infer<typeof customerProfileSchema>;
export type CustomerConversation = z.infer<typeof customerConversationSchema>;
export type ConversationMessage = z.infer<typeof conversationMessageSchema>;
export type CustomerEvent = z.infer<typeof customerEventSchema>;
export type CustomerNote = z.infer<typeof customerNoteSchema>;