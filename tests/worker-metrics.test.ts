// TESTS_WORKER_METRICS_V1 — el worker emite métricas de duración.
// Ver: docs/audits/05-motor-tareas-durable/roadmap.md §8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { TaskWorker } from "../apps/server/src/engine/worker.ts";
import { globalMetrics } from "../apps/server/src/metrics/registry.ts";
import type { AgentTask } from "../packages/domain/src/agent.ts";

function makeTask(id: string): AgentTask {
  return {
    id,
    tenantId: "default",
    title: `Task ${id}`,
    prompt: "metrics test",
    kind: "agent",
    status: "queued",
    plan: [],
    evidence: [],
    input: {},
    state: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attempts: 0,
    leaseId: null,
    leaseUntil: null,
    artifactIds: [],
  };
}

test("ejecutar una tarea incrementa task_duration_seconds_count", { timeout: 10000 }, async () => {
  const db = await createStore();
  try {
    // Capturamos el registry antes y después.
    const before = globalMetrics.render();
    await db.put("metrics-owner", "tasks", makeTask("m-1"));

    const worker = new TaskWorker(
      db,
      async () => ({ status: "succeeded", result: "ok" }),
      { maxActive: 1, pollMs: 10_000 },
    );
    await worker.start();
    // Esperamos a que ejecute.
    await new Promise((r) => setTimeout(r, 200));
    await worker.stop();

    const after = globalMetrics.render();
    // El contador debe aparecer en el render.
    assert.match(after, /openmuse_task_duration_seconds_count/);
    assert.match(after, /openmuse_worker_active/);
    assert.match(after, /openmuse_worker_max_active/);
    void before;
  } finally {
    await db.close();
  }
});
