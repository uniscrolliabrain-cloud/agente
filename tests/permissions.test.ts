import assert from "node:assert/strict";
import { test } from "node:test";
import { agentRoleSchema } from "../packages/domain/src/agent.ts";

test("agentRoleSchema acepta rol con permissions", () => {
  const role = agentRoleSchema.parse({
    id: "rrhh",
    name: "Elena",
    tone: "thoughtful",
    avatar: "lilac",
    objetivo: "Onboarding",
    sops: [],
    active: true,
    memories: [],
    permissions: [{ resource: "entity:candidate", actions: ["read", "create"] }],
  });
  assert.equal(role.permissions?.[0].resource, "entity:candidate");
  assert.deepEqual(role.permissions?.[0].actions, ["read", "create"]);
});

test("agentRoleSchema rechaza actions invalidas", () => {
  const res = agentRoleSchema.safeParse({
    id: "x",
    name: "X",
    tone: "warm",
    avatar: "sky",
    objetivo: "",
    sops: [],
    active: true,
    memories: [],
    permissions: [{ resource: "r", actions: ["invalid"] }],
  });
  assert.equal(res.success, false);
});

test("agentRoleSchema permite rol sin permissions", () => {
  const role = agentRoleSchema.parse({
    id: "legal",
    name: "Martin",
    tone: "thoughtful",
    avatar: "sand",
    objetivo: "Contratos",
    sops: [],
    active: true,
    memories: [],
  });
  assert.equal(role.permissions, undefined);
});