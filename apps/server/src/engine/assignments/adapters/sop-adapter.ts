// ASSIGNMENT_ADAPTER_V1 - SOP como Assignment (kind sop).
import type { SOP } from "../../../../../../packages/domain/src/sop.ts";
import type { AssignmentAdapter, AssignmentStatus } from "../../../../../../packages/domain/src/assignment.ts";
import type { SopAssignment } from "../../../../../../packages/domain/src/assignments/sop.ts";

const TO_CANONICAL: Record<string, AssignmentStatus> = {
  active: "active",
  inactive: "inactive",
};

export function createSopAdapter(): AssignmentAdapter<SOP> {
  return {
    kind: "sop",
    toAssignment(record, tenantId) {
      const allowedTools: string[] = [...record.allowedTools];
      const assignment: SopAssignment = {
        id: "sop:" + record.id,
        tenantId,
        kind: "sop",
        assignedTo: record.assignedTo ?? null,
        assignedBy: record.assignedBy ?? null,
        status: record.active ? "active" : "inactive",
        nativeStatus: record.active ? "active" : "inactive",
        evidence: [],
        steps: record.steps.map((step) => ({
          id: step.id,
          title: step.title,
          ...(step.prompt ? { prompt: step.prompt } : {}),
          allowedTools,
        })),
        allowedTools,
        ...(record.trigger.value ? { trigger: record.trigger.value } : {}),
        ...(record.skillId ? { skillId: record.skillId } : {}),
        active: record.active,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
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
      return { ...record, active: status === "active" };
    },
    toCanonicalStatus(native) { return native === "inactive" ? "inactive" : "active"; },
    toNativeStatus(canonical) { return canonical === "inactive" ? "inactive" : "active"; },
  };
}
