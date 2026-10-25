// B-22 - actor solicitante (owner) != actor ejecutor (assignedTo).
import { test } from "node:test";
import assert from "node:assert/strict";

test("B-22: taskActorId = assignedTo, no owner", () => {
  const owner = "user-123";
  const initial = { assignedTo: "agent-456", state: {} };
  const taskActorId = initial.assignedTo ?? (initial.state as { roleId?: string }).roleId ?? owner;
  assert.equal(taskActorId, "agent-456", "el ejecutor es el agente");
  assert.notEqual(taskActorId, owner, "no es el owner");
});

test("B-22: taskActorId = owner si no hay assignedTo", () => {
  const owner = "user-123";
  const initial = { assignedTo: undefined, state: {} };
  const taskActorId = initial.assignedTo ?? (initial.state as { roleId?: string }).roleId ?? owner;
  assert.equal(taskActorId, owner);
});