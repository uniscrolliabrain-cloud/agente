// F3_ADAPTERS_ROUNDTRIP_TEST_V1
import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
    assert.equal(asg.id, "task:t1");
    assert.equal(asg.kind, "task");
    assert.equal(asg.tenantId, "t");
  });
  it("goal adapter toAssignment no pierde id ni kind", () => {
    const a = createGoalAdapter();
    const record = { id: "g1", title: "g", description: "", category: "", status: "active", milestones: [], createdAt: "2026-01-01" };
    const asg = a.toAssignment(record as never, "t");
    assert.equal(asg.id, "goal:g1");
    assert.equal(asg.kind, "goal");
  });
  it("monitor adapter toAssignment no pierde id ni kind", () => {
    const a = createMonitorAdapter();
    const record = { id: "m1", taskId: "t1", title: "m", url: "https://x", condition: "change", value: "", intervalMinutes: 5, status: "active", nextCheckAt: "2026-01-01", checks: 0 };
    const asg = a.toAssignment(record as never, "t");
    assert.equal(asg.id, "monitor:m1");
    assert.equal(asg.kind, "monitor");
  });
  it("approval adapter toAssignment no pierde id ni kind", () => {
    const a = createApprovalAdapter();
    const record = { id: "a1", title: "a", kind: "email.send", data: {}, status: "awaiting_review", hash: "h", createdAt: "2026-01-01", expiresAt: "2026-01-01" };
    const asg = a.toAssignment(record as never, "t");
    assert.equal(asg.id, "approval:a1");
    assert.equal(asg.kind, "approval");
  });
  it("sop adapter toAssignment no pierde id ni kind", () => {
    const a = createSopAdapter();
    const record = { id: "s1", name: "s", description: "", category: "General", trigger: { type: "manual", value: "" }, steps: [{ id: "st1", title: "x" }], allowedTools: ["ask_user"], active: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" };
    const asg = a.toAssignment(record as never, "t");
    assert.equal(asg.id, "sop:s1");
    assert.equal(asg.kind, "sop");
  });
});
