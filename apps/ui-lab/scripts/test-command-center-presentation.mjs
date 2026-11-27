// Node 22: node --experimental-strip-types --test apps/ui-lab/scripts/test-command-center-presentation.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { presentationSnapshot, changedPresentationKeys } from "../src/command-center-editorial/presentation-diff.ts";
const overview = () => ({
  tenant: {id: "a", name: "Agntia Demo"}, role: "owner", canManageMembers: true,
  agents: [{id: "x", name: "LAIA", active: true, owner: "u"}],
  members: [{userId: "u", name: "Owner", email: "demo@example.test", role: "owner", active: true}],
  tasks: {total: 1, running: 1, waiting: 0, succeeded: 0, failed: 0,
    recent: [{id: "t", title: "Propuesta", kind: "sop", status: "running", owner: "u", updatedAt: "2026-11-26T10:00:00Z"}]}
});
const keys = (a,b) => [...changedPresentationKeys(a && presentationSnapshot(a), b && presentationSnapshot(b))].sort();
test("first load, tenant change, absent snapshot and repeated polling are quiet", () => {
  const a = overview(), b = overview();
  assert.deepEqual(keys(null,a), []);
  assert.deepEqual(keys(a,null), []);
  assert.deepEqual(keys(a,b), []);
  b.tenant.id = "b"; b.tasks.running = 0;
  assert.deepEqual(keys(a,b), []);
});
test("timestamps and recent-window membership do not imply new work", () => {
  const a = overview(), b = overview();
  b.tasks.recent[0].updatedAt = "2026-11-26T11:00:00Z";
  assert.deepEqual(keys(a,b), []);
  b.tasks.recent[0].id = "other";
  assert.deepEqual(keys(a,b), []);
});
test("status change touches only affected task and aggregate presentations", () => {
  const a = overview(), b = overview();
  b.tasks.running = 0; b.tasks.waiting = 1;
  b.tasks.recent[0].status = "waiting_approval";
  assert.deepEqual(keys(a,b), ["block:actividad","block:aprobaciones","block:en-marcha","kpi:aprobaciones","kpi:en-marcha","task:t"]);
});
test("same combined priority count still detects composition change", () => {
  const a = overview(), b = overview();
  a.tasks.waiting = 1; b.tasks.failed = 1;
  assert.ok(keys(a,b).includes("kpi:aprobaciones"));
});
test("agent pause touches agent and its two counters, nothing unrelated", () => {
  const a = overview(), b = overview();
  b.agents[0].active = false;
  assert.deepEqual(keys(a,b), ["agent:x","block:agentes","kpi:agentes"]);
});
