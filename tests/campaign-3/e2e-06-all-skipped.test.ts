// E2E_06_ALL_SKIPPED_V1 - plan con todos skipped -> no succeeded.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Executor } from "../../apps/server/src/engine/execution/executor.ts";

test("e2e-06: plan con todos skipped devuelve blocked", async () => {
  const executor = new Executor({ run: async () => {} });
  const plan = {
    id: "plan-1",
    tenantId: "t1",
    owner: "o1",
    goalId: "g1",
    version: 1,
    status: "draft" as const,
    steps: [
      { id: "s1", title: "step 1", capabilityId: "cap-1", inputs: {}, dependsOn: ["missing"], status: "pending" as const },
      { id: "s2", title: "step 2", capabilityId: "cap-2", inputs: {}, dependsOn: ["missing2"], status: "pending" as const },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const result = await executor.execute(
    { tenantId: "t1", owner: "o1", role: "user", requestId: "r1" },
    plan,
  );
  assert.equal(result.status, "blocked");
  assert.ok(result.steps.every((s) => s.status === "skipped"));
});