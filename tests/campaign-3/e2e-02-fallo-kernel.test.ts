// E2E-02 - fallo del kernel: degradacion explicita o bloqueo.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BusinessOSOrchestrator } from "../../apps/server/src/engine/orchestrator/orchestrator.ts";

test("E2E-02: orquestador sin deps devuelve blocked, no achieved", async () => {
  const orch = new BusinessOSOrchestrator();
  const result = await orch.runGoal(
    { tenantId: "t1", owner: "o1", role: "user", requestId: "r1" },
    { id: "g1", tenantId: "t1", owner: "o1", title: "T", description: "", desiredState: {}, successCriteria: [], constraints: [], priority: "medium", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  );
  assert.equal(result.status, "blocked");
});