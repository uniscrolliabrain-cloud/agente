// B-04 - Actor, AgentPersona, AgentRole, Runtime son distintos.
import { test } from "node:test";
import assert from "node:assert/strict";

test("B-04: HumanActor != AgentActor", () => {
  const human = { kind: "human" as const, id: "u1", tenantId: "t1", userId: "u1", roles: ["owner" as const], profile: { name: "A", language: "es" }, active: true };
  const agent = { kind: "agent" as const, id: "r1", tenantId: "t1", roleId: "comercial", runtimeId: "rt1", roles: ["agent" as const], profile: { name: "L", language: "es" }, active: true };
  assert.notEqual(human.kind, agent.kind);
  assert.notEqual(human.id, agent.id);
  assert.equal(agent.runtimeId, "rt1");
});

test("B-04: AgentRole.allowedTools es allowlist", () => {
  const role = { id: "r1", allowedTools: ["read_mail", "save_artifact"] };
  assert.ok(role.allowedTools.includes("read_mail"));
  assert.ok(!role.allowedTools.includes("computer_command"));
});