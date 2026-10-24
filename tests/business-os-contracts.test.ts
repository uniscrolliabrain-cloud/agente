// BUSINESS_OS_CONTRACTS_TEST_V1 - los tipos parsean.

import assert from "node:assert/strict";
import { test } from "node:test";

test("goalSchema parsea un Goal completo", async () => {
  const { goalSchema } = await import("../packages/domain/src/goal.ts");
  const parsed = goalSchema.parse({
    id: "g1",
    tenantId: "t1",
    owner: "o1",
    title: "Test",
    description: "",
    desiredState: {},
    successCriteria: [],
    constraints: [],
    priority: "medium",
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  assert.equal(parsed.id, "g1");
});

test("outcomeSchema parsea un Outcome completo", async () => {
  const { outcomeSchema } = await import("../packages/domain/src/outcome.ts");
  const parsed = outcomeSchema.parse({
    status: "achieved",
    summary: "OK",
    evidence: [],
    metrics: [],
    verified: false,
  });
  assert.equal(parsed.status, "achieved");
});

test("capabilityContractSchema parsea una capability", async () => {
  const { capabilityContractSchema } = await import("../packages/domain/src/capability.ts");
  const parsed = capabilityContractSchema.parse({
    id: "test",
    name: "Test",
    kind: "tool",
    inputs: {},
    outputs: {},
    preconditions: [],
    sideEffects: [],
    permissions: [],
    risk: "low",
    cost: {},
    idempotency: "idempotent",
    retryable: false,
    compensatable: false,
    requiresApproval: false,
    tags: [],
  });
  assert.equal(parsed.id, "test");
});

test("executionContextSchema parsea", async () => {
  const { executionContextSchema } = await import("../packages/domain/src/execution-context.ts");
  const parsed = executionContextSchema.parse({
    tenantId: "t1",
    owner: "o1",
    role: "user",
    requestId: "req-1",
  });
  assert.equal(parsed.tenantId, "t1");
});