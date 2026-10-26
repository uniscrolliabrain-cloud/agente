// E2E-05 - accion protegida: authz deniega -> runner no ejecuta.
import { test } from "node:test";
import assert from "node:assert/strict";
import { CapabilityRunner } from "../../apps/server/src/engine/execution/capability-runner.ts";
import type { AgentRole } from "../../packages/domain/src/agent.ts";

test("E2E-05: governance deniega -> exec no se llama", async () => {
  const registry = { get: async () => ({ id: "cap-1", requiresApproval: false, idempotency: "idempotent", sideEffects: [] }) };
  let called = false;
  const executors = new Map([["cap-1", { run: async () => { called = true; return {}; } }]]);
  const governance = {
    canExecuteTool: async () => ({ allowed: false, reason: "denied" }),
    canExecuteAction: async () => ({ allowed: false, reason: "denied" }),
  };
  // Doble de AgentRole: el runner solo consulta allowedTools.
  const getAgentRole = async () =>
    ({ id: "r1", name: "r", allowedTools: [] }) as unknown as AgentRole;
  const runner = new CapabilityRunner(registry as never, executors as never, governance, getAgentRole);
  await assert.rejects(
    () => runner.run(
      { tenantId: "t1", owner: "o1", role: "agent", roleId: "r1", actorId: "a1", requestId: "req1" },
      { id: "s1", title: "s1", capabilityId: "cap-1", inputs: {}, dependsOn: [], status: "pending" },
    ),
    /authz denied/,
  );
  assert.equal(called, false, "exec no debe ejecutarse");
});