// 02-whatsapp — entidades canonicas del workspace de mensajeria.
// Derivado del analisis de WhatsApp Business Cloud API (messages,
// media, contacts, conversations, message templates).

import { z } from "zod";

export const messageSchema = z.object({
  id: z.string().min(1).max(200),
  conversationId: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  from: z.string().max(200),
  to: z.string().max(200),
  body: z.string().max(200000),
  kind: z.enum(["text","image","audio","video","document","location","contact","template","interactive","sticker"]).default("text"),
  mediaUrl: z.string().max(2000).optional(),
  mediaType: z.string().max(100).optional(),
  mediaSize: z.number().int().nonnegative().optional(),
  caption: z.string().max(4000).optional(),
  templateName: z.string().max(200).optional(),
  status: z.enum(["pending","sent","delivered","read","failed"]).default("pending"),
  receivedAt: z.string(),
  sentAt: z.string().optional(),
});

export const conversationSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200),
  phoneNumber: z.string().max(50),
  contactId: z.string().max(200).optional(),
  displayName: z.string().max(400).optional(),
  lastMessageAt: z.string(),
  unreadCount: z.number().int().nonnegative().default(0),
  archived: z.boolean().default(false),
  muted: z.boolean().default(false),
});

export const mediaAssetSchema = z.object({
  id: z.string().min(1).max(200),
  messageId: z.string().min(1).max(200),
  url: z.string().max(2000),
  mimeType: z.string().max(200),
  size: z.number().int().nonnegative().optional(),
  sha256: z.string().max(100).optional(),
  transcription: z.string().max(50000).optional(),
});

export const externalIdentitySchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().min(1).max(200),
  channel: z.literal("whatsapp").default("whatsapp"),
  contactId: z.string().min(1).max(200).optional(),
  linkedAt: z.string(),
});

export const messageTemplateSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  name: z.string().max(200),
  language: z.string().max(10),
  category: z.enum(["marketing","utility","authentication","service"]).default("utility"),
  body: z.string().max(10000),
  variables: z.array(z.string().max(100)).default([]),
});

export type Message = z.infer<typeof messageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type ExternalIdentity = z.infer<typeof externalIdentitySchema>;
export type MessageTemplate = z.infer<typeof messageTemplateSchema>;