// 22-canva — entidades canonicas del workspace de diseno y contenido.
// Derivado del analisis de Canva Connect API (designs, assets, folders,
// brands, exports, comments, brand templates).

import { z } from "zod";

export const creativeBriefSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  title: z.string().max(400),
  description: z.string().max(5000).optional(),
  requestedBy: z.string().max(200),
  assignedTo: z.string().max(200).optional(),
  channel: z.enum(["social","email","web","print","presentation","other"]).default("social"),
  format: z.string().max(100).optional(),
  dueAt: z.string().optional(),
  status: z.enum(["draft","in_progress","review","approved","published","cancelled"]).default("draft"),
  createdAt: z.string(),
});

export const brandAssetSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  kind: z.enum(["logo","palette","font","image","template","icon","pattern"]),
  url: z.string().max(2000),
  mimeType: z.string().max(200).optional(),
  tags: z.array(z.string().max(100)).default([]),
  uploadedBy: z.string().max(200).optional(),
  uploadedAt: z.string(),
});

export const designDocumentSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  briefId: z.string().max(200).optional(),
  title: z.string().max(400),
  kind: z.enum(["presentation","poster","social_post","story","document","video","other"]).default("social_post"),
  format: z.string().max(100).optional(),
  editorUrl: z.string().max(2000).optional(),
  thumbnailUrl: z.string().max(2000).optional(),
  owner: z.string().max(200).optional(),
  status: z.enum(["draft","in_review","approved","exported","archived"]).default("draft"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const exportedAssetSchema = z.object({
  id: z.string().min(1).max(200),
  designId: z.string().min(1).max(200),
  url: z.string().max(2000),
  format: z.enum(["png","jpg","pdf","svg","mp4","gif","pptx"]),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  size: z.number().int().nonnegative().optional(),
  exportedAt: z.string(),
});

export const designCommentSchema = z.object({
  id: z.string().min(1).max(200),
  designId: z.string().min(1).max(200),
  authorId: z.string().max(200),
  body: z.string().max(5000),
  resolved: z.boolean().default(false),
  createdAt: z.string(),
});

export type CreativeBrief = z.infer<typeof creativeBriefSchema>;
export type BrandAsset = z.infer<typeof brandAssetSchema>;
export type DesignDocument = z.infer<typeof designDocumentSchema>;
export type ExportedAsset = z.infer<typeof exportedAssetSchema>;
export type DesignComment = z.infer<typeof designCommentSchema>;