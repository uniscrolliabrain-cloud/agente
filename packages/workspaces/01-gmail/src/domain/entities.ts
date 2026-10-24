// 01-gmail — entidades canonicas del workspace de correo electronico.
// Derivado del analisis de Gmail API (users.messages, users.threads,
// users.labels, users.drafts, users.attachments).

import { z } from "zod";

export const emailAttachmentSchema = z.object({
  id: z.string().min(1).max(200),
  messageId: z.string().min(1).max(200),
  name: z.string().min(1).max(400),
  mimeType: z.string().max(200),
  size: z.number().int().nonnegative(),
  url: z.string().max(2000).optional(),
  inline: z.boolean().default(false),
});

export const emailMessageSchema = z.object({
  id: z.string().min(1).max(200),
  threadId: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  from: z.string().max(500),
  to: z.array(z.string().max(500)).default([]),
  cc: z.array(z.string().max(500)).default([]),
  bcc: z.array(z.string().max(500)).default([]),
  replyTo: z.string().max(500).optional(),
  subject: z.string().max(998),
  snippet: z.string().max(2000).optional(),
  body: z.string().max(200000),
  bodyHtml: z.string().max(500000).optional(),
  receivedAt: z.string(),
  sentAt: z.string().optional(),
  labels: z.array(z.string().max(100)).default([]),
  attachments: z.array(emailAttachmentSchema).default([]),
  read: z.boolean().default(false),
  starred: z.boolean().default(false),
  important: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export const emailThreadSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  subject: z.string().max(998),
  messageIds: z.array(z.string().min(1).max(200)).default([]),
  participants: z.array(z.string().max(500)).default([]),
  lastMessageAt: z.string(),
  unreadCount: z.number().int().nonnegative().default(0),
  linkedEntityId: z.string().max(200).optional(),
  linkedEntityType: z.string().max(100).optional(),
});

export const emailLabelSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  color: z.string().max(50).optional(),
  visible: z.boolean().default(true),
  systemLabel: z.boolean().default(false),
});

export const emailDraftSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  to: z.array(z.string().max(500)).default([]),
  cc: z.array(z.string().max(500)).default([]),
  bcc: z.array(z.string().max(500)).default([]),
  subject: z.string().max(998),
  body: z.string().max(200000),
  threadId: z.string().max(200).optional(),
  attachmentIds: z.array(z.string().min(1).max(200)).default([]),
  updatedAt: z.string(),
});

export type EmailAttachment = z.infer<typeof emailAttachmentSchema>;
export type EmailMessage = z.infer<typeof emailMessageSchema>;
export type EmailThread = z.infer<typeof emailThreadSchema>;
export type EmailLabel = z.infer<typeof emailLabelSchema>;
export type EmailDraft = z.infer<typeof emailDraftSchema>;