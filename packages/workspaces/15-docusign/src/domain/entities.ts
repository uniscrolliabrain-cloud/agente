// 15-docusign — entidades canonicas del workspace de contratos y firma.
// Derivado del analisis de DocuSign eSignature REST API v2.1
// (envelopes, recipients, documents, tabs, audit events, templates).

import { z } from "zod";

export const signerSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  envelopeId: z.string().min(1).max(200),
  contactId: z.string().max(200).optional(),
  email: z.string().max(500),
  name: z.string().max(400),
  order: z.number().int().nonnegative().default(0),
  routingOrder: z.number().int().nonnegative().default(1),
  status: z.enum(["created","sent","delivered","signed","declined","completed"]).default("created"),
  signedAt: z.string().optional(),
  declinedAt: z.string().optional(),
  declineReason: z.string().max(2000).optional(),
  ipAddress: z.string().max(100).optional(),
});

export const signatureRequestSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  envelopeId: z.string().min(1).max(200),
  signerId: z.string().min(1).max(200),
  requestedAt: z.string(),
  remindedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  status: z.enum(["pending","sent","delivered","signed","declined","expired"]).default("pending"),
});

export const signatureEvidenceSchema = z.object({
  id: z.string().min(1).max(200),
  envelopeId: z.string().min(1).max(200),
  kind: z.enum(["certificate","audit_trail","signature_image","timestamp","consent"]),
  url: z.string().max(2000),
  hash: z.string().max(200).optional(),
  createdAt: z.string(),
});

export const signatureEnvelopeSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  documentIds: z.array(z.string().min(1).max(200)).default([]),
  title: z.string().max(500),
  subject: z.string().max(500).optional(),
  message: z.string().max(5000).optional(),
  status: z.enum(["draft","sent","delivered","completed","declined","voided","expired"]).default("draft"),
  senderId: z.string().max(200).optional(),
  linkedEntityId: z.string().max(200).optional(),
  linkedEntityType: z.string().max(100).optional(),
  sentAt: z.string().optional(),
  completedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const signatureFieldSchema = z.object({
  id: z.string().min(1).max(200),
  envelopeId: z.string().min(1).max(200),
  signerId: z.string().min(1).max(200),
  documentId: z.string().min(1).max(200),
  pageNumber: z.number().int().positive(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  kind: z.enum(["signature","initials","dateSigned","text","checkbox","company","title"]),
  value: z.string().max(2000).optional(),
});

export type Signer = z.infer<typeof signerSchema>;
export type SignatureRequest = z.infer<typeof signatureRequestSchema>;
export type SignatureEvidence = z.infer<typeof signatureEvidenceSchema>;
export type SignatureEnvelope = z.infer<typeof signatureEnvelopeSchema>;
export type SignatureField = z.infer<typeof signatureFieldSchema>;