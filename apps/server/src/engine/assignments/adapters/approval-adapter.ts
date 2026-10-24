// ASSIGNMENT_ADAPTER_V1 - ActionProposal como Assignment (kind approval).
import type { ActionProposal } from "../../../../../../packages/domain/src/index.ts";
import type { AssignmentAdapter, AssignmentStatus } from "../../../../../../packages/domain/src/assignment.ts";

const TO_CANONICAL: Record<string, AssignmentStatus> = {
  awaiting_review: "awaiting_review",
  scheduled: "scheduled",
  executing: "executing",
  succeeded: "succeeded",
  failed: "failed",
  outcome_unknown: "outcome_unknown",
  denied: "denied",
  cancelled: "cancelled",
  expired: "expired",
};

export function createApprovalAdapter(): AssignmentAdapter<ActionProposal> {
  return {
    kind: "approval",
    toAssignment(record, tenantId) {
      return {
        id: "approval:" + record.id,
        tenantId,
        kind: "approval",
        assignedTo: null,
        assignedBy: null,
        status: TO_CANONICAL[record.status] ?? "failed",
        nativeStatus: record.status,
        evidence: [],
        createdAt: record.createdAt,
        updatedAt: record.createdAt,
      };
    },
    applyAssignment(record) {
      return record;
    },
    applyStatus(record, status) {
      const native = Object.entries(TO_CANONICAL).find(([, v]) => v === status)?.[0];
      return { ...record, status: (native ?? record.status) as ActionProposal["status"] };
    },
    toCanonicalStatus(native) { return TO_CANONICAL[native] ?? "failed"; },
    toNativeStatus(canonical) { return Object.entries(TO_CANONICAL).find(([, v]) => v === canonical)?.[0] ?? "failed"; },
  };
}
