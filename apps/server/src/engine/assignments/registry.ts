// ASSIGNMENT_REGISTRY_V1 - resuelve el adapter por kind.
import type { AssignmentAdapter, AssignmentKind } from "../../../../../../packages/domain/src/assignment.ts";
import { createTaskAdapter } from "./adapters/task-adapter.ts";
import { createGoalAdapter } from "./adapters/goal-adapter.ts";
import { createMonitorAdapter } from "./adapters/monitor-adapter.ts";
import { createApprovalAdapter } from "./adapters/approval-adapter.ts";
import { createSopAdapter } from "./adapters/sop-adapter.ts";

export class AssignmentRegistry {
  private readonly adapters = new Map<AssignmentKind, AssignmentAdapter>();
  register(adapter: AssignmentAdapter): void {
    this.adapters.set(adapter.kind, adapter);
  }
  get(kind: AssignmentKind): AssignmentAdapter {
    const a = this.adapters.get(kind);
    if (!a) throw new Error("No adapter registered for kind: " + kind);
    return a;
  }
  has(kind: AssignmentKind): boolean {
    return this.adapters.has(kind);
  }
  kinds(): AssignmentKind[] {
    return [...this.adapters.keys()];
  }
}

export function defaultAssignmentRegistry(): AssignmentRegistry {
  const r = new AssignmentRegistry();
  r.register(createTaskAdapter());
  r.register(createGoalAdapter());
  r.register(createMonitorAdapter());
  r.register(createApprovalAdapter());
  r.register(createSopAdapter());
  return r;
}
