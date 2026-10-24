// 03-hubspot — entidades canonicas del workspace de CRM y ventas.
// Derivado del analisis de HubSpot CRM API (contacts, companies,
// deals, tickets, activities, pipelines, properties).

import { z } from "zod";

export const contactSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  firstName: z.string().max(200).optional(),
  lastName: z.string().max(200).optional(),
  email: z.string().max(500).optional(),
  phone: z.string().max(100).optional(),
  companyId: z.string().max(200).optional(),
  jobTitle: z.string().max(200).optional(),
  owner: z.string().max(200).optional(),
  tags: z.array(z.string().max(100)).default([]),
  lifecycleStage: z.enum(["subscriber","lead","mql","sql","opportunity","customer","evangelist","other"]).default("lead"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const companySchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  cif: z.string().max(50).optional(),
  industry: z.string().max(200).optional(),
  website: z.string().max(500).optional(),
  city: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  employeeCount: z.number().int().nonnegative().optional(),
  annualRevenue: z.number().nonnegative().optional(),
  owner: z.string().max(200).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const leadSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  source: z.string().max(200),
  contactId: z.string().max(200).optional(),
  companyId: z.string().max(200).optional(),
  status: z.enum(["new","qualified","disqualified","converted"]).default("new"),
  score: z.number().int().default(0),
  notes: z.string().max(10000).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const opportunitySchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  title: z.string().max(500),
  companyId: z.string().max(200).optional(),
  contactId: z.string().max(200).optional(),
  amount: z.number().nonnegative().default(0),
  currency: z.string().max(10).default("EUR"),
  stage: z.string().max(100),
  pipeline: z.string().max(100).optional(),
  probability: z.number().min(0).max(100).default(0),
  expectedCloseAt: z.string().optional(),
  closedAt: z.string().optional(),
  owner: z.string().max(200).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const salesActivitySchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  kind: z.enum(["call","email","meeting","note","task"]),
  subject: z.string().max(500),
  note: z.string().max(10000).default(""),
  opportunityId: z.string().max(200).optional(),
  contactId: z.string().max(200).optional(),
  companyId: z.string().max(200).optional(),
  owner: z.string().max(200).optional(),
  occurredAt: z.string(),
  duration: z.number().int().nonnegative().optional(),
});

export const pipelineSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  name: z.string().max(200),
  stages: z.array(z.object({
    id: z.string().min(1).max(100),
    name: z.string().min(1).max(200),
    order: z.number().int().nonnegative(),
    probability: z.number().min(0).max(100).default(0),
  })).default([]),
});

export type Contact = z.infer<typeof contactSchema>;
export type Company = z.infer<typeof companySchema>;
export type Lead = z.infer<typeof leadSchema>;
export type Opportunity = z.infer<typeof opportunitySchema>;
export type SalesActivity = z.infer<typeof salesActivitySchema>;
export type Pipeline = z.infer<typeof pipelineSchema>;