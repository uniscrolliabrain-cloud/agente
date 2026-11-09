// ASSIGNMENT_ADAPTER_V1 - AgentTask como Assignment (kind task).
import type { AgentTask } from "../../../../../../packages/domain/src/agent.ts";
import type {
  Assignment,
  AssignmentAdapter,
  AssignmentEvidence,
  AssignmentOutcome,
  AssignmentPlan,
  AssignmentStatus,
} from "../../../../../../packages/domain/src/assignment.ts";
import type { AgentTaskAssignment } from "../../../../../../packages/domain/src/assignments/task.ts";

const TO_CANONICAL: Record<string, AssignmentStatus> = {
  queued: "queued",
  running: "running",
  waiting_input: "waiting_input",
  waiting_approval: "waiting_approval",
  scheduled: "scheduled",
  paused: "paused",
  succeeded: "succeeded",
  failed: "failed",
  cancelled: "cancelled",
};

export function createTaskAdapter(): AssignmentAdapter<AgentTask> {
  return {
    kind: "task",
    toAssignment(record, tenantId) {
      // ASSIGNMENT_PLAN_EVIDENCE_WIRE_V1 - el plan y la evidencia del task se
      // publican con el contrato del assignment, no con una forma paralela.
      const plan: AssignmentPlan | undefined = record.plan?.map((step) => ({
        id: step.id,
        title: step.title,
        status: step.status,
        ...(step.detail ? { detail: step.detail } : {}),
        ...(step.durationMs !== undefined ? { durationMs: step.durationMs } : {}),
      }));
      const evidence: AssignmentEvidence[] = (record.evidence ?? []).map((e) => ({
        id: e.id,
        kind: e.kind,
        title: e.title,
        excerpt: e.excerpt,
        ...(e.url ? { url: e.url } : {}),
      }));
      // ASSIGNMENT_OUTCOME_WIRE_V1 - el outcome del task se normaliza al
      // contrato AssignmentOutcome; la evidencia de ejecucion usa su propio
      // kind (fact/inference/...), asi que no se fuerza al de assignment.
      const outcome: AssignmentOutcome | undefined = record.outcome
        ? {
            status: record.outcome.status,
            summary: record.outcome.summary ?? "",
            evidence: [],
            metrics: record.outcome.metrics ?? [],
            completedAt: record.updatedAt,
          }
        : undefined;
      const taskOutcome = outcome
        ? {
            status: outcome.status,
            summary: outcome.summary,
            evidence: outcome.evidence,
            metrics: outcome.metrics,
            verified: record.outcome?.verified ?? false,
            ...(record.outcome?.verifiedAt ? { verifiedAt: record.outcome.verifiedAt } : {}),
            ...(record.outcome?.verificationNote
              ? { verificationNote: record.outcome.verificationNote }
              : {}),
          }
        : undefined;
      // El Assignment generico exige completedAt en el outcome; el variant del
      // task no lo declara. El adapter publica el contrato base completo.
      const assignment: Assignment = {
        id: "task:" + record.id,
        tenantId,
        kind: "task",
        assignedTo: record.assignedTo ?? null,
        assignedBy: record.assignedBy ?? null,
        status: TO_CANONICAL[record.status] ?? "failed",
        nativeStatus: record.status,
        evidence,
        ...(plan ? { plan } : {}),
        ...(outcome ? { outcome } : {}),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
      const variant: AgentTaskAssignment = {
        ...assignment,
        kind: "task",
        outcome: taskOutcome,
        attempts: record.attempts ?? 0,
        actionId: record.actionId ?? null,
        leaseId: record.leaseId ?? null,
        leaseUntil: record.leaseUntil ?? null,
      };
      void variant;
      return assignment;
    },
    applyAssignment(record, changes) {
      return {
        ...record,
        ...(changes.assignedTo !== undefined ? { assignedTo: changes.assignedTo ?? undefined } : {}),
        ...(changes.assignedBy !== undefined ? { assignedBy: changes.assignedBy ?? undefined } : {}),
      };
    },
    applyStatus(record, status) {
      const native = Object.entries(TO_CANONICAL).find(([, v]) => v === status)?.[0];
      return { ...record, status: (native ?? record.status) as AgentTask["status"] };
    },
    toCanonicalStatus(native) { return TO_CANONICAL[native] ?? "failed"; },
    toNativeStatus(canonical) { return Object.entries(TO_CANONICAL).find(([, v]) => v === canonical)?.[0] ?? "failed"; },
  };
}
