// 19-personio — entidades canonicas del workspace de seleccion y candidatos.
// Derivado del analisis de Personio API (positions, candidates, applications,
// onboarding, offboarding, documents, employees lifecycle).

import { z } from "zod";

export const positionSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  title: z.string().max(400),
  description: z.string().max(20000).optional(),
  department: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  employmentType: z.enum(["full_time","part_time","contract","internship","temporary"]).default("full_time"),
  seniority: z.enum(["intern","junior","mid","senior","lead","director"]).optional(),
  salaryRange: z.object({
    min: z.number().nonnegative().optional(),
    max: z.number().nonnegative().optional(),
    currency: z.string().max(10).default("EUR"),
  }).optional(),
  status: z.enum(["open","paused","filled","closed","cancelled"]).default("open"),
  openedAt: z.string(),
  closedAt: z.string().optional(),
  hiringManagerId: z.string().max(200).optional(),
});

export const candidateSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  positionId: z.string().max(200).optional(),
  name: z.string().max(400),
  email: z.string().max(500).optional(),
  phone: z.string().max(100).optional(),
  source: z.string().max(200).optional(),
  resumeUrl: z.string().max(2000).optional(),
  stage: z.enum(["applied","screening","interview","offer","hired","rejected","withdrawn"]).default("applied"),
  rating: z.number().min(0).max(5).optional(),
  tags: z.array(z.string().max(100)).default([]),
  appliedAt: z.string(),
  updatedAt: z.string(),
});

export const interviewSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  candidateId: z.string().min(1).max(200),
  positionId: z.string().min(1).max(200),
  scheduledAt: z.string(),
  durationMinutes: z.number().int().nonnegative().optional(),
  interviewerIds: z.array(z.string().min(1).max(200)).default([]),
  kind: z.enum(["phone","video","onsite","technical","culture","final"]).default("video"),
  status: z.enum(["scheduled","completed","cancelled","no_show"]).default("scheduled"),
  feedback: z.string().max(10000).optional(),
  score: z.number().min(0).max(5).optional(),
});

export const onboardingCaseSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  employeeId: z.string().min(1).max(200),
  positionId: z.string().max(200).optional(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  status: z.enum(["not_started","in_progress","completed","cancelled"]).default("not_started"),
  tasks: z.array(z.object({
    id: z.string().min(1).max(200),
    name: z.string().max(400),
    owner: z.string().max(200).optional(),
    completed: z.boolean().default(false),
    dueAt: z.string().optional(),
  })).default([]),
  progress: z.number().min(0).max(1).default(0),
});

export const employeeLifecycleSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  employeeId: z.string().min(1).max(200),
  stage: z.enum(["candidate","offer","hired","active","offboarding","terminated"]).default("candidate"),
  changedAt: z.string(),
  changedBy: z.string().max(200).optional(),
  note: z.string().max(2000).optional(),
});

export const hrDocumentSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  employeeId: z.string().max(200).optional(),
  candidateId: z.string().max(200).optional(),
  name: z.string().max(400),
  kind: z.enum(["contract","offer","id","certificate","policy","other"]).default("other"),
  url: z.string().max(2000),
  signedAt: z.string().optional(),
  uploadedAt: z.string(),
});

export type Position = z.infer<typeof positionSchema>;
export type Candidate = z.infer<typeof candidateSchema>;
export type Interview = z.infer<typeof interviewSchema>;
export type OnboardingCase = z.infer<typeof onboardingCaseSchema>;
export type EmployeeLifecycle = z.infer<typeof employeeLifecycleSchema>;
export type HRDocument = z.infer<typeof hrDocumentSchema>;