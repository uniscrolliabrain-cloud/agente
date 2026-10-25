// B-21 - worker reclama tarea queued y la ejecuta.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../../apps/server/src/db.ts";
import { TaskWorker } from "../../apps/server/src/engine/worker.ts";
import type { AgentTask } from "../../packages/domain/src/agent.ts";

function makeTask(id: string): AgentTask {
  return {
    id, tenantId: "default", title: `Task ${id}`, prompt: "test", kind: "agent",
    status: "queued", plan: [], evidence: [], input: {}, state: {},
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    attempts: 0, leaseId: null, leaseUntil: null, artifactIds: [],
  };
}

test("B-21: worker ejecuta tarea queued", { timeout: 10000 }, async () => {
  const db = await createStore();
  try {
    await db.put("recovery-owner", "tasks", makeTask("r-1"));
    let executed = 0;
    const worker = new TaskWorker(db, async () => {
      executed += 1;
      return { status: "succeeded" as const };
    }, { pollMs: 10_000 });
    await worker.tick();
    assert.ok(executed >= 1, "worker debe ejecutar al menos 1 tarea");
    const task = await db.get<AgentTask>("recovery-owner", "tasks", "r-1");
    assert.equal(task?.status, "succeeded");
  } finally {
    await db.close();
  }
});