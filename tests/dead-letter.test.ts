// TESTS_DEAD_LETTER_V1 — la cola de cartas muertas.
// Ver: docs/audits/03-resiliencia/roadmap.md §8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { DeadLetterQueue, resetForRequeue } from "../apps/server/src/engine/dead-letter.ts";
import type { AgentTask } from "../packages/domain/src/agent.ts";

function makeTask(id: string): AgentTask {
  return {
    id,
    tenantId: "default",
    title: `Task ${id}`,
    prompt: "test",
    kind: "agent",
    status: "failed",
    plan: [],
    evidence: [],
    input: {},
    state: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attempts: 4,
    leaseId: null,
    leaseUntil: null,
    artifactIds: [],
    error: "boom",
  };
}

test("enqueue mueve 10 tareas al dead-letter", async () => {
  const db = await createStore();
  try {
    const dlq = new DeadLetterQueue(db);
    for (let i = 0; i < 10; i++) {
      await dlq.enqueue(makeTask(`t-${i}`), `error ${i}`, "owner-a");
    }
    const list = await dlq.list("owner-a");
    assert.equal(list.length, 10);
    assert.equal(list[0].attempts, 4);
    assert.match(list[0].error, /error \d/);
  } finally {
    await db.close();
  }
});

test("enqueue es idempotente: misma task no duplica", async () => {
  const db = await createStore();
  try {
    const dlq = new DeadLetterQueue(db);
    const task = makeTask("t-dup");
    const first = await dlq.enqueue(task, "first", "owner-a");
    const second = await dlq.enqueue(task, "second", "owner-a");
    assert.equal(first.id, second.id);
    assert.equal((await dlq.list("owner-a")).length, 1);
  } finally {
    await db.close();
  }
});

test("resolve marca resolvedAt y resolvedBy", async () => {
  const db = await createStore();
  try {
    const dlq = new DeadLetterQueue(db);
    const entry = await dlq.enqueue(makeTask("t-r"), "boom", "owner-a");
    const resolved = await dlq.resolve("owner-a", entry.id, "operator-1");
    assert.ok(resolved);
    assert.ok(resolved.resolvedAt);
    assert.equal(resolved.resolvedBy, "operator-1");
  } finally {
    await db.close();
  }
});

test("remove borra del dead-letter", async () => {
  const db = await createStore();
  try {
    const dlq = new DeadLetterQueue(db);
    const entry = await dlq.enqueue(makeTask("t-d"), "boom", "owner-a");
    await dlq.remove("owner-a", entry.id);
    assert.equal((await dlq.list("owner-a")).length, 0);
  } finally {
    await db.close();
  }
});

test("resetForRequeue da nuevo id y limpia estado de error", () => {
  const task = makeTask("t-reset");
  const next = resetForRequeue(task);
  assert.notEqual(next.id, task.id);
  assert.equal(next.status, "queued");
  assert.equal(next.attempts, 0);
  assert.equal(next.error, null);
  assert.equal(next.leaseId, null);
});

test("owner isolation: el dead-letter de owner-a no ve el de owner-b", async () => {
  const db = await createStore();
  try {
    const dlq = new DeadLetterQueue(db);
    await dlq.enqueue(makeTask("t-a"), "boom", "owner-a");
    await dlq.enqueue(makeTask("t-b"), "boom", "owner-b");
    assert.equal((await dlq.list("owner-a")).length, 1);
    assert.equal((await dlq.list("owner-b")).length, 1);
  } finally {
    await db.close();
  }
});
