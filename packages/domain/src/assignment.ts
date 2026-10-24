// ASSIGNMENT_MODEL_V1 - interfaz de lectura unificada de asignación.
// AgentTask (task), Goal (goal), Monitor (monitor), ActionProposal (approval),
// SOP (sop) son implementaciones. NO se persiste como entidad propia.
// Se computa on-the-fly desde el record original usando el adapter.
//
// B-N1: Assignment.id = `${kind}:${recordId}`. Estable entre llamadas,
//       único entre kinds, reconstruible desde el record.
// B-N2: assignmentStatusSchema es la unión de los estados reales de los
//       5 kinds. Cada Assignment lleva nativeStatus con el estado nativo
//       del record original.
// B-N3: assignmentOutcomeSchema reusa outcomeStatusSchema de outcome.ts.
// 2.3:  assignedTo es opcional; null representa bandeja de pendientes.
// 2.2:  metadata está declarado y validado; no es un cajón de sastre.
import { z } from "zod";
import { outcomeStatusSchema } from "./outcome.ts";

export const assignmentKindSchema = z.enum(["task", "goal", "monitor", "approval", "sop"]);

// Unión de estados reales de los 5 kinds:
// - task: queued, running, waiting_input, waiting_approval, scheduled, paused, succeeded, failed, cancelled
// - goal: active, paused, completed
// - monitor: active, paused, stopped
// - approval: awaiting_review, scheduled, executing, succeeded, failed, outcome_unknown, denied, cancelled, expired
// - sop: active, inactive
export const assignmentStatusSchema = z.enum([
  "queued", "running", "waiting_input", "waiting_approval", "scheduled", "paused",
  "succeeded", "failed", "cancelled",
  "active", "completed",
  "stopped",
  "awaiting_review", "executing", "outcome_unknown", "denied", "expired",
  "inactive",
]);

export const assignmentPlanStepSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  status: z.enum(["pending", "running", "succeeded", "failed", "waiting"]).default("pending"),
  detail: z.string().max(2000).optional(),
  durationMs: z.number().int().nonnegative().optional(),
});

export const assignmentPlanSchema = z.array(assignmentPlanStepSchema).max(200);

export const assignmentEvidenceSchema = z.object({
  id: z.string().min(1).max(200),
  kind: z.enum(["mail", "file", "web", "user"]),
  title: z.string().min(1).max(300),
  excerpt: z.string().max(4000),
  url: z.string().max(4096).optional(),
});

// B-N3: reusa outcomeStatusSchema de outcome.ts. No lo redefine.
export const assignmentOutcomeSchema = z.object({
  status: outcomeStatusSchema,
  summary: z.string().max(8000),
  evidence: z.array(assignmentEvidenceSchema).max(50).default([]),
  metrics: z.array(z.object({
    key: z.string().min(1).max(200),
    value: z.number(),
    unit: z.string().max(50).optional(),
  })).max(200).default([]),
  completedAt: z.string(),
});

// 2.2: metadata declarado y validado. Solo claves string, valores JSON.
export const assignmentMetadataSchema = z.record(z.string().max(200), z.unknown());

export const assignmentSchema = z.object({
  // B-N1: id = `${kind}:${recordId}`.
  id: z.string().min(1).max(400).regex(/^(task|goal|monitor|approval|sop):[^:]+$/),
  tenantId: z.string().min(1).max(100),
  kind: assignmentKindSchema,
  // 2.3: assignedTo opcional. null = bandeja de pendientes.
  assignedTo: z.string().min(1).max(200).nullable(),
  assignedBy: z.string().min(1).max(200).nullable(),
  // B-N2: status es la vista normalizada; nativeStatus es el estado del record.
  status: assignmentStatusSchema,
  nativeStatus: z.string().min(1).max(100),
  plan: assignmentPlanSchema.optional(),
  evidence: z.array(assignmentEvidenceSchema).max(50).default([]),
  outcome: assignmentOutcomeSchema.optional(),
  // 2.2: metadata declarado. Solo si el adapter lo necesita.
  metadata: assignmentMetadataSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AssignmentKind = z.infer<typeof assignmentKindSchema>;
export type AssignmentStatus = z.infer<typeof assignmentStatusSchema>;
export type AssignmentPlan = z.infer<typeof assignmentPlanSchema>;
export type AssignmentEvidence = z.infer<typeof assignmentEvidenceSchema>;
export type AssignmentOutcome = z.infer<typeof assignmentOutcomeSchema>;
export type Assignment = z.infer<typeof assignmentSchema>;

// ASSIGNMENT_ADAPTER_TYPE_V1 - contrato de adapter por kind (F3.4).
export interface AssignmentAdapter<R = unknown> {
  readonly kind: AssignmentKind;
  toAssignment(record: R, tenantId: string): Assignment;
  applyAssignment(record: R, changes: Partial<Assignment>): R;
  applyStatus(record: R, status: AssignmentStatus): R;
  toCanonicalStatus(native: string): AssignmentStatus;
  toNativeStatus(canonical: AssignmentStatus): string;
}
