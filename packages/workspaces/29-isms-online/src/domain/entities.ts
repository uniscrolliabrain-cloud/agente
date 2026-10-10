// 29-isms-online — entidades canonicas del workspace de cumplimiento y riesgos.
// Derivado del analisis de ISMS.online API + frameworks ISO 27001,
// RGPD, SOC 2 (risks, controls, evidence, requirements, reviews, policies).

import { z } from "zod";

export const riskSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  title: z.string().max(500),
  description: z.string().max(5000).optional(),
  category: z.string().max(200).optional(),
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  score: z.number().int().min(1).max(25).default(1),
  status: z.enum(["open","mitigating","monitoring","closed","accepted"]).default("open"),
  owner: z.string().max(200).optional(),
  framework: z.string().max(100).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const controlSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  riskId: z.string().max(200).optional(),
  requirementId: z.string().max(200).optional(),
  name: z.string().max(400),
  description: z.string().max(5000).optional(),
  kind: z.enum(["preventive","detective","corrective","directive"]).default("preventive"),
  ownerId: z.string().max(200).optional(),
  status: z.enum(["planned","active","review","retired"]).default("planned"),
  frequency: z.enum(["continuous","daily","weekly","monthly","quarterly","yearly","ad_hoc"]).default("ad_hoc"),
  lastTestedAt: z.string().optional(),
  nextTestAt: z.string().optional(),
});

export const evidenceSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  controlId: z.string().min(1).max(200),
  documentId: z.string().max(200).optional(),
  kind: z.enum(["log","screenshot","report","policy","signed_doc","test_result","other"]).default("other"),
  note: z.string().max(2000).optional(),
  hash: z.string().max(200).optional(),
  attachedAt: z.string(),
  attachedBy: z.string().max(200).optional(),
});

export const complianceRequirementSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  framework: z.string().max(200),
  reference: z.string().max(200),
  title: z.string().max(500),
  status: z.enum(["applicable","not_applicable","compliant","non_compliant","in_progress"]).default("applicable"),
  dueAt: z.string().optional(),
  ownerId: z.string().max(200).optional(),
});

export const reviewSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  scope: z.string().max(200),
  kind: z.enum(["internal_audit","external_audit","management_review","control_test","incident_review"]).default("internal_audit"),
  scheduledFor: z.string(),
  completedAt: z.string().optional(),
  conductedBy: z.string().max(200).optional(),
  status: z.enum(["scheduled","in_progress","completed","missed"]).default("scheduled"),
  findings: z.array(z.object({
    severity: z.enum(["observation","minor","major","critical"]),
    description: z.string().max(2000),
  })).default([]),
});

export const incidentSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  title: z.string().max(500),
  description: z.string().max(10000),
  severity: z.enum(["low","medium","high","critical"]).default("medium"),
  category: z.enum(["security","availability","data_loss","privacy","compliance","other"]).default("security"),
  status: z.enum(["reported","investigating","mitigated","resolved","closed"]).default("reported"),
  reportedAt: z.string(),
  resolvedAt: z.string().optional(),
  correctiveActions: z.array(z.object({
    description: z.string().max(2000),
    owner: z.string().max(200).optional(),
    dueAt: z.string().optional(),
    completed: z.boolean().default(false),
  })).default([]),
});

export const policySchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  title: z.string().max(500),
  version: z.number().int().positive().default(1),
  documentId: z.string().max(200).optional(),
  approvedBy: z.string().max(200).optional(),
  approvedAt: z.string().optional(),
  reviewDueAt: z.string().optional(),
  status: z.enum(["draft","in_review","approved","superseded","retired"]).default("draft"),
});

export type Risk = z.infer<typeof riskSchema>;
export type Control = z.infer<typeof controlSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type ComplianceRequirement = z.infer<typeof complianceRequirementSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Incident = z.infer<typeof incidentSchema>;
export type Policy = z.infer<typeof policySchema>;