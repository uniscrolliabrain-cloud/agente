// F3_ADAPTERS_ROUNDTRIP_TEST_V1
import { describe, expect, it } from "vitest";
import { createTaskAdapter } from "../../apps/server/src/engine/assignments/adapters/task-adapter.ts";
import { createGoalAdapter } from "../../apps/server/src/engine/assignments/adapters/goal-adapter.ts";
import { createMonitorAdapter } from "../../apps/server/src/engine/assignments/adapters/monitor-adapter.ts";
import { createApprovalAdapter } from "../../apps/server/src/engine/assignments/adapters/approval-adapter.ts";
import { createSopAdapter } from "../../apps/server/src/engine/assignments/adapters/sop-adapter.ts";

describe("adapters roundtrip", () => {
  it("task adapter toAssignment no pierde id ni kind", () => {
    const a = createTaskAdapter();
    const record = { id: "t1", title: "x", prompt: "p", kind: "agent", status: "queued", plan: [], evidence: [], input: {}, state: {}, createdAt: "2026-01-01", updatedAt: "2026-01-01", attempts: 0, artifactIds: [], tenantId: "t" };
    const asg = a.toAssignment(record as never, "t");
    expect(asg.id).toBe("task:t1");
    expect(asg.kind).toBe("task");
    expect(asg.tenantId).toBe("t");
  });
  it("goal adapter toAssignment no pierde id ni kind", () => {
    const a = createGoalAdapter();
    const record = { id: "g1", title: "g", description: "", category: "", status: "active", milestones: [], createdAt: "2026-01-01" };
    const asg = a.toAssignment(record as never, "t");
    expect(asg.id).toBe("goal:g1");
    expect(asg.kind).toBe("goal");
  });
  it("monitor adapter toAssignment no pierde id ni kind", () => {
    const a = createMonitorAdapter();
    const record = { id: "m1", taskId: "t1", title: "m", url: "https://x", condition: "change", value: "", intervalMinutes: 5, status: "active", nextCheckAt: "2026-01-01", checks: 0 };
    const asg = a.toAssignment(record as never, "t");
    expect(asg.id).toBe("monitor:m1");
    expect(asg.kind).toBe("monitor");
  });
  it("approval adapter toAssignment no pierde id ni kind", () => {
    const a = createApprovalAdapter();
    const record = { id: "a1", title: "a", kind: "email.send", data: {}, status: "awaiting_review", hash: "h", createdAt: "2026-01-01", expiresAt: "2026-01-01" };
    const asg = a.toAssignment(record as never, "t");
    expect(asg.id).toBe("approval:a1");
    expect(asg.kind).toBe("approval");
  });
  it("sop adapter toAssignment no pierde id ni kind", () => {
    const a = createSopAdapter();
    const record = { id: "s1", name: "s", description: "", category: "General", trigger: { type: "manual", value: "" }, steps: [{ id: "st1", title: "x" }], allowedTools: ["ask_user"], active: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" };
    const asg = a.toAssignment(record as never, "t");
    expect(asg.id).toBe("sop:s1");
    expect(asg.kind).toBe("sop");
  });
});
