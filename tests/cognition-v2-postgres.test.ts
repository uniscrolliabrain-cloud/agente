import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createStore } from "../apps/server/src/db.ts";
import { installCognitionV2, DurableEventSink, DurableProjector } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { persistentKernel } from "./fixtures/cognition-v2/kernel.ts";
const url = process.env.COGNITION_TEST_POSTGRES_URL;
test("C02 real Postgres: pinned connections, concurrent rollback, atomic event ordering and kernel capture", { skip: !url ? "Requires explicit local synthetic COGNITION_TEST_POSTGRES_URL" : false }, async () => {
  const db = await createStore({ databaseUrl: url }); const db2 = await createStore({ databaseUrl: url });
  const tenant = `test-${randomUUID()}`;
  try {
    assert.equal(db.backend, "postgres"); await installCognitionV2(db);
    const results = await Promise.allSettled([
      db.transaction(async () => { await db.put(tenant, "test", { id: "rollback" }); await new Promise((r) => setTimeout(r, 30)); throw Error("rollback"); }),
      db.transaction(async () => { await db.put(tenant, "test", { id: "commit" }); }),
    ]);
    assert.equal(results[0].status, "rejected"); assert.equal(results[1].status, "fulfilled");
    assert.equal(await db.get(tenant, "test", "rollback"), null); assert.ok(await db.get(tenant, "test", "commit"));
    const [pid1, pid2] = await Promise.all([db.transaction(async () => {
      const [start] = await db.rawQuery<{ pid: number }>("SELECT pg_backend_pid() AS pid"); await new Promise((r) => setTimeout(r, 25));
      const [end] = await db.rawQuery<{ pid: number }>("SELECT pg_backend_pid() AS pid"); assert.equal(start.pid, end.pid); return start.pid;
    }), db.transaction(async () => { const [r] = await db.rawQuery<{ pid: number }>("SELECT pg_backend_pid() AS pid"); return r.pid; })]);
    assert.notEqual(pid1, pid2);
    const sinks = [new DurableEventSink(db, db, new Set([tenant])), new DurableEventSink(db2, db2, new Set([tenant]))];
    await Promise.all(Array.from({ length: 20 }, (_, i) => sinks[i % 2].write({ id: `pg-${i}`, tenantId: tenant, owner: "alice", schemaVersion: "1.0", type: "system.maintenance", emittedAt: "2026-11-15T00:00:00Z", source: { kind: "system", id: "test" }, payload: { tasks: 0, monitors: 0 } })));
    const runner = new DurableProjector(db, "pg-test"), rival = new DurableProjector(db2, "pg-test");
    const leases = await Promise.all([runner.acquire(tenant), rival.acquire(tenant)]); assert.equal(leases.filter(Boolean).length, 1);
    const lease = leases.find(Boolean)!; const sequences: number[] = [];
    await runner.batch(lease, async (e, sequence) => { assert.equal(e.tenantId, tenant); sequences.push(Number(sequence)); });
    assert.deepEqual(sequences, Array.from({ length: 20 }, (_, i) => i + 1));
    const kernel = persistentKernel(db); const ctx = { tenantId: tenant, owner: "alice", actorId: "alice", role: "system" as const, requestId: "test" };
    const capture = { operationId: "same-output", content: "A hypothesis, not an action", createdAt: "2026-11-15T00:00:00Z", epistemic: "hypothesis" };
    const [first, second] = await Promise.all([kernel.captureAsyncResult(ctx, capture), kernel.captureAsyncResult(ctx, capture)]);
    assert.equal(first.id, second.id); assert.equal((await kernel.deps.store.listTurns(tenant, 100)).length, 1);
  } finally { await db.close(); await db2.close(); }
});
