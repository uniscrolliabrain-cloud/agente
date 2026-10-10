// 07-linear — entidades canonicas del workspace de tareas y proyectos.
// Derivado del analisis de Linear GraphQL API (issues, projects,
// cycles, milestones, teams, workflowStates, labels).

import { z } from "zod";

export const workItemSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  identifier: z.string().max(50).optional(),
  title: z.string().max(500),
  description: z.string().max(50000).optional(),
  status: z.enum(["backlog","todo","in_progress","blocked","in_review","done","cancelled"]).default("todo"),
  priority: z.enum(["no_priority","low","medium","high","urgent"]).default("medium"),
  assigneeId: z.string().max(200).optional(),
  creatorId: z.string().max(200).optional(),
  projectId: z.string().max(200).optional(),
  cycleId: z.string().max(200).optional(),
  parentId: z.string().max(200).optional(),
  teamId: z.string().max(200).optional(),
  labels: z.array(z.string().max(100)).default([]),
  estimate: z.number().nonnegative().optional(),
  dueDate: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const projectSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  description: z.string().max(10000).optional(),
  status: z.enum(["planned","active","paused","completed","cancelled","archived"]).default("active"),
  ownerId: z.string().max(200).optional(),
  leadId: z.string().max(200).optional(),
  teamIds: z.array(z.string().min(1).max(200)).default([]),
  targetDate: z.string().optional(),
  startDate: z.string().optional(),
  progress: z.number().min(0).max(1).default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const milestoneSchema = z.object({
  id: z.string().min(1).max(200),
  projectId: z.string().min(1).max(200),
  name: z.string().max(400),
  description: z.string().max(5000).optional(),
  dueDate: z.string().optional(),
  reached: z.boolean().default(false),
  reachedAt: z.string().optional(),
});

export const cycleSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  name: z.string().max(400),
  number: z.number().int().nonnegative().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  completed: z.boolean().default(false),
});

export const dependencySchema = z.object({
  id: z.string().min(1).max(200),
  fromItemId: z.string().min(1).max(200),
  toItemId: z.string().min(1).max(200),
  kind: z.enum(["blocks","blocked_by","relates_to","duplicate_of"]).default("relates_to"),
  createdAt: z.string(),
});

export const teamSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  name: z.string().max(200),
  key: z.string().max(20).optional(),
  memberIds: z.array(z.string().min(1).max(200)).default([]),
});

export type WorkItem = z.infer<typeof workItemSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Milestone = z.infer<typeof milestoneSchema>;
export type Cycle = z.infer<typeof cycleSchema>;
export type Dependency = z.infer<typeof dependencySchema>;
export type Team = z.infer<typeof teamSchema>;