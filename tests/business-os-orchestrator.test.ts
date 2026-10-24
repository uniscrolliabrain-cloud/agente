// BUSINESS_OS_ORCHESTRATOR_TEST_V1 - ciclo completo con deps mockeadas.

import assert from "node:assert/strict";
import { test } from "node:test";
import { BusinessOSOrchestrator } from "../apps/server/src/engine/orchestrator/orchestrator.ts";

test("orchestrator devuelve achieved si verifier verifica", async () => {
  const orch = new BusinessOSOrchestrator({
    context: { assemble: async () => ({}) },
    capabilities: { list: async () => [] },
    planner: {
      plan: async (input) => ({
        id: "plan-1",
        tenantId: input.goal.tenantId,
        owner: input.goal.owner,
        goalId: input.goal.id,
        version: 1,
        status: "draft",
        steps: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    },
    executor: { execute: async () => ({ status: "succeeded", steps: [] }) },
    verifier: {
      verify: async () => ({
        verified: true,
        reason: "todo bien",
        missing: [],
        satisfiedCriteria: [],
        failedCriteria: [],
        confidence: 1,
        method: "deterministic",
        verifiedAt: new Date().toISOString(),
      }),
    },
    replanner: { replan: async () => null },
  });

  const result = await orch.runGoal(
    { tenantId: "t1", owner: "o1", role: "user", requestId: "r1" },
    {
      id: "g1",
      tenantId: "t1",
      owner: "o1",
      title: "Test",
      description: "",
      desiredState: {},
      successCriteria: [],
      constraints: [],
      priority: "medium",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  );
  assert.equal(result.status, "achieved");
});

test("orchestrator devuelve blocked si no hay deps", async () => {
  const orch = new BusinessOSOrchestrator();
  const result = await orch.runGoal(
    { tenantId: "t1", owner: "o1", role: "user", requestId: "r1" },
    {
      id: "g1",
      tenantId: "t1",
      owner: "o1",
      title: "Test",
      description: "",
      desiredState: {},
      successCriteria: [],
      constraints: [],
      priority: "medium",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  );
  assert.equal(result.status, "blocked");
});