// BUSINESS_OS_SLICE_TEST_V1 - verifica el ciclo completo Goal -> Verify -> Replan.

import assert from "node:assert/strict";
import { test } from "node:test";

test("Goal con criterio de exito se verifica correctamente", async () => {
  const { DeterministicVerifier } = await import(
    "../apps/server/src/engine/verification/verifier.ts"
  );
  const verifier = new DeterministicVerifier();

  const goal = {
    id: "goal-1",
    tenantId: "t1",
    owner: "o1",
    title: "Recuperar clientes morosos",
    description: "",
    desiredState: {},
    successCriteria: [
      { id: "c1", kind: "metric" as const, key: "recovered", operator: ">=" as const, value: 5000 },
    ],
    constraints: [],
    priority: "high" as const,
    status: "active" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const achieved = await verifier.verify(goal, {
    status: "achieved",
    summary: "5000 recuperados",
    evidence: [],
    metrics: [{ key: "recovered", value: 5000 }],
    verified: false,
  });
  assert.equal(achieved.verified, true);

  const partial = await verifier.verify(goal, {
    status: "partial",
    summary: "3000 recuperados",
    evidence: [],
    metrics: [{ key: "recovered", value: 3000 }],
    verified: false,
  });
  assert.equal(partial.verified, false);
  assert.equal(partial.failedCriteria.length, 1);
});

test("CapabilityRegistry registra y lista capabilities", async () => {
  const { CapabilityRegistry } = await import(
    "../apps/server/src/engine/capabilities/registry.ts"
  );
  const registry = new CapabilityRegistry();
  registry.register({
    id: "send_email",
    version: "1.0.0",
    name: "Send email",
    description: "Envia un email",
    kind: "tool",
    inputs: {},
    outputs: {},
    preconditions: [],
    sideEffects: [
      { kind: "external_write", target: "email", reversible: false },
    ],
    permissions: ["email.send"],
    risk: "medium",
    cost: {},
    idempotency: "at-most-once",
    retryable: false,
    compensatable: false,
    requiresApproval: true,
    tags: ["email", "external"],
  });

  const all = await registry.list();
  assert.equal(all.length, 1);
  const email = await registry.list({ tag: "email" });
  assert.equal(email.length, 1);
  const sms = await registry.list({ tag: "sms" });
  assert.equal(sms.length, 0);
});