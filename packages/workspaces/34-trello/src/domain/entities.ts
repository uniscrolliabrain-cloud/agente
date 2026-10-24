// 34-trello — entidades canonicas del workspace de tableros Kanban.
// Derivado del analisis de Trello REST API (boards, lists, cards,
// labels, members, checklists, actions, attachments).

import { z } from "zod";

export const boardSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  description: z.string().max(5000).optional(),
  kind: z.enum(["board","template","personal"]).default("board"),
  visibility: z.enum(["private","workspace","public"]).default("private"),
  closed: z.boolean().default(false),
  ownerId: z.string().max(200).optional(),
  memberIds: z.array(z.string().min(1).max(200)).default([]),
  url: z.string().max(2000).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const boardColumnSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  boardId: z.string().min(1).max(200),
  externalId: z.string().max(200).optional(),
  name: z.string().max(200),
  order: z.number().int().nonnegative(),
  wipLimit: z.number().int().nonnegative().optional(),
  closed: z.boolean().default(false),
});

export const workCardSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  boardId: z.string().min(1).max(200),
  columnId: z.string().min(1).max(200),
  title: z.string().max(500),
  description: z.string().max(10000).optional(),
  position: z.number().nonnegative().default(0),
  assigneeIds: z.array(z.string().min(1).max(200)).default([]),
  labels: z.array(z.string().max(100)).default([]),
  dueAt: z.string().optional(),
  dueComplete: z.boolean().default(false),
  startAt: z.string().optional(),
  closed: z.boolean().default(false),
  archived: z.boolean().default(false),
  checklist: z.array(z.object({
    name: z.string().max(400),
    completed: z.boolean().default(false),
  })).default([]),
  attachments: z.array(z.string().max(2000)).default([]),
  linkedEntityId: z.string().max(200).optional(),
  linkedEntityType: z.string().max(100).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const cardTransitionSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  cardId: z.string().min(1).max(200),
  fromColumnId: z.string().max(200).optional(),
  toColumnId: z.string().min(1).max(200),
  movedBy: z.string().max(200),
  movedAt: z.string(),
  note: z.string().max(2000).optional(),
});

export const cardCommentSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  cardId: z.string().min(1).max(200),
  authorId: z.string().max(200),
  body: z.string().max(5000),
  createdAt: z.string(),
  editedAt: z.string().optional(),
});

export const boardLabelSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  boardId: z.string().min(1).max(200),
  name: z.string().max(100).optional(),
  color: z.string().max(50),
});

export type Board = z.infer<typeof boardSchema>;
export type BoardColumn = z.infer<typeof boardColumnSchema>;
export type WorkCard = z.infer<typeof workCardSchema>;
export type CardTransition = z.infer<typeof cardTransitionSchema>;
export type CardComment = z.infer<typeof cardCommentSchema>;
export type BoardLabel = z.infer<typeof boardLabelSchema>;