// TESTS_TASK_PLANS_V1 — planes por kind.
// Ver: docs/audits/05-motor-tareas-durable/miniaudit.md.

import assert from "node:assert/strict";
import { test } from "node:test";
import { planForKind, DEFAULT_PLANS } from "../apps/server/src/engine/task-plans.ts";

test("document tiene 5 pasos", () => {
  const plan = planForKind("document");
  assert.equal(plan.length, 5);
  assert.equal(plan[0], "Find the source document");
});

test("monitor tiene 3 pasos", () => {
  assert.equal(planForKind("monitor").length, 3);
});

test("finance tiene 3 pasos", () => {
  assert.equal(planForKind("finance").length, 3);
});

test("agent tiene 4 pasos", () => {
  assert.equal(planForKind("agent").length, 4);
});

test("sop no tiene plan por defecto (lo genera el SOP)", () => {
  assert.equal(planForKind("sop").length, 0);
});

test("plan y agent comparten los mismos pasos", () => {
  assert.deepEqual(planForKind("plan"), planForKind("agent"));
});

test("DEFAULT_PLANS cubre los 6 kinds", () => {
  const kinds = ["agent", "document", "monitor", "finance", "plan", "sop"];
  for (const k of kinds) {
    assert.ok(k in DEFAULT_PLANS, `falta plan para ${k}`);
  }
});
