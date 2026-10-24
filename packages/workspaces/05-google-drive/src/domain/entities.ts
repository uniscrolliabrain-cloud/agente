// 05-google-drive — entidades canonicas del workspace de documentos.
// Derivado del analisis de Google Drive API v3 (files, permissions,
// revisions, comments, drives).

import { z } from "zod";

export const folderSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  parentId: z.string().max(200).optional(),
  path: z.string().max(2000).optional(),
  owner: z.string().max(200).optional(),
  shared: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const documentSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  mimeType: z.string().max(200),
  url: z.string().max(2000),
  downloadUrl: z.string().max(2000).optional(),
  thumbnailUrl: z.string().max(2000).optional(),
  folderId: z.string().max(200).optional(),
  size: z.number().int().nonnegative().optional(),
  checksum: z.string().max(100).optional(),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string().max(100)).default([]),
  linkedTo: z.array(z.object({
    entityId: z.string().min(1).max(200),
    entityType: z.string().max(100),
    relation: z.string().max(100),
  })).default([]),
  classified: z.boolean().default(false),
  classification: z.string().max(100).optional(),
  confidence: z.number().min(0).max(1).optional(),
  owner: z.string().max(200).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const fileVersionSchema = z.object({
  id: z.string().min(1).max(200),
  documentId: z.string().min(1).max(200),
  externalId: z.string().max(200).optional(),
  version: z.number().int().positive(),
  url: z.string().max(2000),
  size: z.number().int().nonnegative().optional(),
  modifiedBy: z.string().max(200).optional(),
  createdAt: z.string(),
});

export const documentRelationSchema = z.object({
  id: z.string().min(1).max(200),
  documentId: z.string().min(1).max(200),
  targetId: z.string().min(1).max(200),
  targetType: z.string().max(100),
  kind: z.enum(["references","attached_to","evidence_for","duplicate_of","version_of"]).default("references"),
  createdAt: z.string(),
});

export const permissionSchema = z.object({
  id: z.string().min(1).max(200),
  documentId: z.string().min(1).max(200),
  grantee: z.string().max(500),
  role: z.enum(["reader","commenter","writer","owner"]),
  grantedAt: z.string(),
  expiresAt: z.string().optional(),
});

export type Folder = z.infer<typeof folderSchema>;
export type Document = z.infer<typeof documentSchema>;
export type FileVersion = z.infer<typeof fileVersionSchema>;
export type DocumentRelation = z.infer<typeof documentRelationSchema>;
export type Permission = z.infer<typeof permissionSchema>;