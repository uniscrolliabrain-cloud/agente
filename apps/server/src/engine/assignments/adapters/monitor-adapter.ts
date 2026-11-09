// ASSIGNMENT_ADAPTER_V1 - Monitor como Assignment (kind monitor).
import type { Monitor } from "../../../../../../packages/domain/src/agent.ts";
import type { AssignmentAdapter, AssignmentStatus } from "../../../../../../packages/domain/src/assignment.ts";
import type { MonitorAssignment } from "../../../../../../packages/domain/src/assignments/monitor.ts";

const TO_CANONICAL: Record<string, AssignmentStatus> = {
  active: "active",
  paused: "paused",
  stopped: "stopped",
};

export function createMonitorAdapter(): AssignmentAdapter<Monitor> {
  return {
    kind: "monitor",
    toAssignment(record, tenantId) {
      const assignment: MonitorAssignment = {
        id: "monitor:" + record.id,
        tenantId,
        kind: "monitor",
        assignedTo: null,
        assignedBy: record.assignedBy ?? null,
        status: TO_CANONICAL[record.status] ?? "failed",
        nativeStatus: record.status,
        evidence: [],
        url: record.url,
        condition: record.condition,
        value: record.value,
        intervalMinutes: record.intervalMinutes,
        nextCheckAt: record.nextCheckAt,
        ...(record.lastCheckedAt ? { lastCheckedAt: record.lastCheckedAt } : {}),
        ...(record.lastValue ? { lastValue: record.lastValue } : {}),
        ...(record.lastHash ? { lastHash: record.lastHash } : {}),
        checks: record.checks ?? 0,
        createdAt: record.createdAt ?? record.nextCheckAt,
        updatedAt: record.updatedAt ?? record.lastCheckedAt ?? record.nextCheckAt,
      };
      return assignment;
    },
    applyAssignment(record, changes) {
      return {
        ...record,
        ...(changes.assignedBy !== undefined ? { assignedBy: changes.assignedBy ?? undefined } : {}),
      };
    },
    applyStatus(record, status) {
      const native = Object.entries(TO_CANONICAL).find(([, v]) => v === status)?.[0];
      return { ...record, status: (native ?? record.status) as Monitor["status"] };
    },
    toCanonicalStatus(native) { return TO_CANONICAL[native] ?? "failed"; },
    toNativeStatus(canonical) { return Object.entries(TO_CANONICAL).find(([, v]) => v === canonical)?.[0] ?? "failed"; },
  };
}
