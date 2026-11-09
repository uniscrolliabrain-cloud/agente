// ASSIGNMENT_ADAPTER_V1 - Goal legacy (agent.ts) como Assignment (kind goal).
import type { Goal } from "../../../../../../packages/domain/src/agent.ts";
import type { AssignmentAdapter, AssignmentStatus } from "../../../../../../packages/domain/src/assignment.ts";
import type { GoalAssignment } from "../../../../../../packages/domain/src/assignments/goal.ts";

const TO_CANONICAL: Record<string, AssignmentStatus> = {
  active: "active",
  paused: "paused",
  completed: "completed",
};

export function createGoalAdapter(): AssignmentAdapter<Goal> {
  return {
    kind: "goal",
    toAssignment(record, tenantId) {
      // ASSIGNMENT_VARIANT_V1 - el adapter de goal publica GoalAssignment, no
      // el Assignment generico: el kind queda estrechado en el productor.
      const assignment: GoalAssignment = {
        id: "goal:" + record.id,
        tenantId,
        kind: "goal",
        assignedTo: record.assignedTo ?? null,
        assignedBy: record.assignedBy ?? null,
        status: TO_CANONICAL[record.status] ?? "failed",
        nativeStatus: record.status,
        evidence: [],
        milestones: record.milestones ?? [],
        createdAt: record.createdAt,
        updatedAt: record.updatedAt ?? record.createdAt,
      };
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
      return { ...record, status: (native ?? record.status) as Goal["status"] };
    },
    toCanonicalStatus(native) { return TO_CANONICAL[native] ?? "failed"; },
    toNativeStatus(canonical) { return Object.entries(TO_CANONICAL).find(([, v]) => v === canonical)?.[0] ?? "failed"; },
  };
}
