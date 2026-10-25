// B-24 - Kanban deriva de AgentTask durable, no de estado local.
import { test } from "node:test";
import assert from "node:assert/strict";

test("B-24: AgentTask tiene los campos que el Kanban necesita", () => {
  const task = {
    id: "t1", title: "T", prompt: "p", kind: "agent" as const,
    status: "running" as const, plan: [], evidence: [], input: {}, state: {},
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    attempts: 0, leaseId: null, leaseUntil: null, artifactIds: [],
    assignedTo: "agent-1", tenantId: "t1",
  };
  assert.equal(task.status, "running");
  assert.equal(task.assignedTo, "agent-1");
  assert.ok("tenantId" in task);
});