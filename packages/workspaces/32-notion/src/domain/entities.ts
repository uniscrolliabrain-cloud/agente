// 32-notion — entidades canonicas del workspace de conocimiento.
// Derivado del analisis de Notion API (pages, blocks, databases,
// data sources, users, comments, search).

import { z } from "zod";

export const knowledgePageSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  title: z.string().max(500),
  icon: z.string().max(50).optional(),
  cover: z.string().max(2000).optional(),
  parentId: z.string().max(200).optional(),
  parentKind: z.enum(["workspace","page","database","data_source"]).optional(),
  url: z.string().max(2000).optional(),
  archived: z.boolean().default(false),
  createdBy: z.string().max(200).optional(),
  lastEditedBy: z.string().max(200).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const knowledgeBlockSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  pageId: z.string().min(1).max(200),
  parentBlockId: z.string().max(200).optional(),
  kind: z.enum([
    "paragraph","heading_1","heading_2","heading_3","bulleted_list",
    "numbered_list","to_do","toggle","code","quote","callout","divider",
    "image","video","file","bookmark","embed","table","column_list","child_page","child_database"
  ]),
  content: z.string().max(100000).default(""),
  properties: z.record(z.string(), z.unknown()).default({}),
  order: z.number().int().nonnegative().default(0),
  hasChildren: z.boolean().default(false),
  archived: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const knowledgeRelationSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  fromPageId: z.string().min(1).max(200),
  toPageId: z.string().min(1).max(200),
  kind: z.enum(["parent","related","reference","mention","embed"]).default("related"),
  createdAt: z.string(),
});

export const knowledgeDataSourceSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  parentPageId: z.string().max(200).optional(),
  properties: z.array(z.object({
    name: z.string().max(200),
    type: z.string().max(100),
    options: z.array(z.string().max(200)).default([]),
  })).default([]),
  createdAt: z.string(),
});

export const knowledgeCommentSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  pageId: z.string().min(1).max(200),
  blockId: z.string().max(200).optional(),
  authorId: z.string().max(200),
  body: z.string().max(5000),
  resolved: z.boolean().default(false),
  createdAt: z.string(),
});

export type KnowledgePage = z.infer<typeof knowledgePageSchema>;
export type KnowledgeBlock = z.infer<typeof knowledgeBlockSchema>;
export type KnowledgeRelation = z.infer<typeof knowledgeRelationSchema>;
export type KnowledgeDataSource = z.infer<typeof knowledgeDataSourceSchema>;
export type KnowledgeComment = z.infer<typeof knowledgeCommentSchema>;