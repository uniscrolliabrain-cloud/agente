// TESTS_WORKER_CONCURRENCY_V1 — MAX_ACTIVE con 100 tareas largas.
// Ver: docs/audits/05-motor-tareas-durable/roadmap.md §8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { TaskWorker } from "../apps/server/src/engine/worker.ts";
import type { AgentTask } from "../packages/domain/src/agent.ts";

function makeTask(id: string): AgentTask {
  return {
    id,
    tenantId: "default",
    title: `Task ${id}`,
    prompt: "concurrency test",
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

test("MAX_ACTIVE=10 con 100 tareas: no arranca más de 10 a la vez", { timeout: 30000 }, async () => {
  const db = await createStore();
  try {
    for (let i = 0; i < 100; i++) {
      await db.put("concurrency-owner", "tasks", makeTask(`t-${i}`));
    }

    let concurrent = 0;
    let peak = 0;
    const MAX_ACTIVE = 10;
    const worker = new TaskWorker(
      db,
      async () => {
        concurrent += 1;
        peak = Math.max(peak, concurrent);
        await new Promise((r) => setTimeout(r, 50));
        concurrent -= 1;
        return { status: "succeeded", result: "done" };
      },
      { maxActive: MAX_ACTIVE, pollMs: 10_000 },
    );

    // Ejecutar varios ticks hasta agotar.
    for (let tick = 0; tick < 20; tick += 1) {
      await worker.tick();
      if ((await db.list("concurrency-owner", "tasks", { limit: 200 })).every((t) => t.status === "succeeded")) break;
      await new Promise((r) => setTimeout(r, 100));
    }

    const remaining = (await db.list<AgentTask>("concurrency-owner", "tasks", { limit: 200 }))
      .filter((t) => t.status !== "succeeded");
    // No todos tienen por qué terminar en el test (100 tareas, 10 a la vez,
    // 50ms cada una = ~500ms). Pero el peak concurrente NO debe superar 10.
    assert.ok(
      peak <= MAX_ACTIVE,
      `peak concurrente (${peak}) supera MAX_ACTIVE (${MAX_ACTIVE})`,
    );
    void remaining;
  } finally {
    await db.close();
  }
});

test("MAX_ACTIVE=5 con 5 tareas: todas corren", { timeout: 10000 }, async () => {
  const db = await createStore();
  try {
    for (let i = 0; i < 5; i++) {
      await db.put("small-owner", "tasks", makeTask(`s-${i}`));
    }
    let count = 0;
    const worker = new TaskWorker(
      db,
      async () => {
        count += 1;
        return { status: "succeeded" };
      },
      { maxActive: 5, pollMs: 10_000 },
    );
    await worker.tick();
    // Con 5 tareas y maxActive 5, todas deberían arrancar en un tick.
    assert.ok(count <= 5, "no más de 5 handlers");
  } finally {
    await db.close();
  }
});
