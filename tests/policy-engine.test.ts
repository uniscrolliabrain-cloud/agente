import assert from "node:assert/strict";
import { test } from "node:test";
import { PolicyEngine } from "../apps/server/src/engine/policy/engine.ts";
import { AgentGovernance } from "../apps/server/src/engine/agents/governance.ts";
import { agentActor } from "../packages/domain/src/actor.ts";

test("rol sin permissions declarados: allowlist no activa", async () => {
  const policy = new PolicyEngine();
  const decision = await policy.can("owner", { id: "comercial" }, "entity:customer", "read");
  assert.equal(decision.allowed, true);
});

test("rol con permissions: solo permite lo declarado", async () => {
  const policy = new PolicyEngine();
  const role = {
    id: "rrhh",
    permissions: [{ resource: "entity:candidate", actions: ["read" as const, "create" as const] }],
  };
  assert.equal((await policy.can("owner", role, "entity:candidate", "read")).allowed, true);
  assert.equal((await policy.can("owner", role, "entity:candidate", "create")).allowed, true);
  assert.equal((await policy.can("owner", role, "entity:candidate", "delete")).allowed, false);
  assert.equal((await policy.can("owner", role, "entity:invoice", "read")).allowed, false);
});

test("denegacion devuelve reason legible", async () => {
  const policy = new PolicyEngine();
  const role = { id: "legal", permissions: [{ resource: "contract", actions: ["read" as const] }] };
  const decision = await policy.can("owner", role, "contract", "approve");
  assert.equal(decision.allowed, false);
  assert.match(decision.reason ?? "", /legal.*approve.*contract/i);
});

test("AgentGovernance: rol con allowedTools rechaza tool no declarada", async () => {
  const policy = new PolicyEngine();
  const gov = new AgentGovernance(policy);
  // AGENT_GOVERNANCE_ACTOR_V1 - canExecuteTool recibe el actor, no solo el owner.
  const actor = agentActor({ tenantId: "t1", actorId: "owner", roleId: "contenido" });
  const role = {
    id: "contenido",
    allowedTools: ["run_computer_command", "save_artifact"],
  } as unknown as import("../packages/domain/src/agent.ts").AgentRole;
  assert.equal((await gov.canExecuteTool(actor, "owner", role, "run_computer_command")).allowed, true);
  assert.equal((await gov.canExecuteTool(actor, "owner", role, "save_artifact")).allowed, true);
  assert.equal((await gov.canExecuteTool(actor, "owner", role, "send_email")).allowed, false);
});

test("AgentGovernance: rol sin allowedTools deja pasar al PolicyEngine", async () => {
  const policy = new PolicyEngine();
  const gov = new AgentGovernance(policy);
  const actor = agentActor({ tenantId: "t1", actorId: "owner", roleId: "comercial" });
  const role = { id: "comercial" } as unknown as import("../packages/domain/src/agent.ts").AgentRole;
  assert.equal((await gov.canExecuteTool(actor, "owner", role, "cualquier_tool")).allowed, true);
});
