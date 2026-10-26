// B-19 - compensacion en orden inverso con fallo parcial.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Executor } from "../../apps/server/src/engine/execution/executor.ts";

test("B-19: fallo parcial dispara compensacion en orden inverso", async () => {
  const calls: string[] = [];
  const runner = {
    run: async (_ctx: unknown, step: { id: string; capabilityId?: string }) => {
      calls.push(String(step.capabilityId ?? step.id));
      if (step.capabilityId === "write-2") throw new Error("fallo simulado");
    },
  };
  const executor = new Executor(runner);
  const plan = {
    id: "p1", tenantId: "t1", owner: "o1", goalId: "g1", version: 1,
    status: "draft" as const,
    steps: [
      { id: "s1", title: "s1", capabilityId: "write-1", inputs: {}, dependsOn: [], status: "pending" as const,
        compensation: { capabilityId: "undo-1", inputs: {} } },
      { id: "s2", title: "s2", capabilityId: "write-2", inputs: {}, dependsOn: [], status: "pending" as const },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const result = await executor.execute(
    { tenantId: "t1", owner: "o1", actorId: "o1", role: "user", requestId: "r1" },
    plan,
  );
  assert.equal(result.status, "failed");
  assert.ok(calls.includes("write-1"), "paso 1 ejecutado");
  assert.ok(calls.includes("write-2"), "paso 2 ejecutado y falla");
  assert.ok(calls.includes("undo-1"), "compensacion del paso 1 ejecutada");
  const undoIdx = calls.indexOf("undo-1");
  const write2Idx = calls.indexOf("write-2");
  assert.ok(undoIdx > write2Idx, "compensacion despues del fallo");
});