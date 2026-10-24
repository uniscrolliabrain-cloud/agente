// 31-suitedash — entidades canonicas del workspace de portal de clientes.
// Derivado del analisis de SuiteDash API (portals, client requests,
// service cases, shared documents, portal access, forms, eSign).

import { z } from "zod";

export const clientPortalSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  clientId: z.string().min(1).max(200),
  name: z.string().max(400),
  subdomain: z.string().max(100).optional(),
  url: z.string().max(2000).optional(),
  active: z.boolean().default(true),
  theme: z.string().max(100).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const clientRequestSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  portalId: z.string().min(1).max(200),
  requesterId: z.string().max(200).optional(),
  requesterEmail: z.string().max(500).optional(),
  title: z.string().max(500),
  body: z.string().max(10000).optional(),
  kind: z.enum(["support","quote","project","billing","general","other"]).default("general"),
  priority: z.enum(["low","normal","high","urgent"]).default("normal"),
  status: z.enum(["new","in_progress","waiting_client","resolved","closed"]).default("new"),
  assignedTo: z.string().max(200).optional(),
  linkedCaseId: z.string().max(200).optional(),
  attachments: z.array(z.string().max(2000)).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const serviceCaseSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  portalId: z.string().min(1).max(200),
  requestId: z.string().max(200).optional(),
  title: z.string().max(500),
  description: z.string().max(5000).optional(),
  ownerId: z.string().max(200).optional(),
  status: z.enum(["open","waiting","in_progress","resolved","closed"]).default("open"),
  visibleToClient: z.boolean().default(true),
  openedAt: z.string(),
  updatedAt: z.string(),
  closedAt: z.string().optional(),
});

export const portalAccessSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  portalId: z.string().min(1).max(200),
  userId: z.string().min(1).max(200),
  email: z.string().max(500),
  role: z.enum(["owner","admin","member","viewer"]).default("member"),
  grantedAt: z.string(),
  grantedBy: z.string().max(200).optional(),
  revokedAt: z.string().optional(),
  lastAccessAt: z.string().optional(),
});

export const portalDocumentSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  portalId: z.string().min(1).max(200),
  documentId: z.string().min(1).max(200),
  visibleTo: z.array(z.string().min(1).max(200)).default([]),
  sharedAt: z.string(),
  sharedBy: z.string().max(200).optional(),
  expiresAt: z.string().optional(),
});

export type ClientPortal = z.infer<typeof clientPortalSchema>;
export type ClientRequest = z.infer<typeof clientRequestSchema>;
export type ServiceCase = z.infer<typeof serviceCaseSchema>;
export type PortalAccess = z.infer<typeof portalAccessSchema>;
export type PortalDocument = z.infer<typeof portalDocumentSchema>;