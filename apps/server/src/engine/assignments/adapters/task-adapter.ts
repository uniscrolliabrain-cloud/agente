// ASSIGNMENT_ADAPTER_V1 - AgentTask como Assignment (kind task).
import type { AgentTask } from "../../../../../../packages/domain/src/agent.ts";
import type { AssignmentAdapter, AssignmentStatus } from "../../../../../../packages/domain/src/assignment.ts";

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
      return {
        id: "task:" + record.id,
        tenantId,
        kind: "task",
        assignedTo: record.assignedTo ?? null,
        assignedBy: record.assignedBy ?? null,
        status: TO_CANONICAL[record.status] ?? "failed",
        nativeStatus: record.status,
        evidence: (record.evidence ?? []).map((e) => ({ id: e.id, kind: e.kind, title: e.title, excerpt: e.excerpt, url: e.url })),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
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
