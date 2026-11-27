import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { createAlertSnapshotReader, buildAlertDefinitions } from "../apps/server/src/alerts/definitions.ts";
import { MetricsRegistry } from "../apps/server/src/metrics/registry.ts";
import { CircuitRegistry } from "../apps/server/src/engine/circuit-breaker.ts";

test("alert snapshots read durable failures, unresolved DLQ and unknown actions", async () => {
  const db = await createStore();
  try {
    await db.put("fixture", "tasks", { id: "task", status: "failed" });
    await db.put("fixture", "dead-letter", { id: "unresolved" });
    await db.put("fixture", "dead-letter", { id: "resolved", resolvedAt: new Date().toISOString() });
    await db.put("fixture", "actions", { id: "unknown", status: "outcome_unknown" });
    const metrics = new MetricsRegistry();
    metrics.counter("agente_http_requests_total", "fixture");
    metrics.inc("agente_http_requests_total", { status: "503" }, 4);
    metrics.inc("agente_http_requests_total", { status: "200" }, 96);
    const snapshot = await createAlertSnapshotReader(db, metrics, new CircuitRegistry(), () => true)();
    assert.equal(snapshot.taskFailuresLastHour, 1);
    assert.equal(snapshot.deadLetterCount, 1);
    assert.equal(snapshot.outcomeUnknownCount, 1);
    assert.equal(snapshot.http5xx, 4);
    assert.equal(snapshot.httpTotal, 100);
    assert.equal(snapshot.tenantQuotaExceeded, undefined);
    assert.equal(snapshot.httpLatencyP99Ms, undefined);
  } finally {
    await db.close();
  }
});

test("storage failure and missing producers remain unavailable rather than measured zero", async () => {
  const db = {
    rawQuery: async () => {
      throw Error("synthetic unavailable");
    },
  } as unknown as Store;
  const read = createAlertSnapshotReader(db, new MetricsRegistry(), new CircuitRegistry(), () => undefined);
  const snapshot = await read();
  assert.equal(snapshot.taskFailuresLastHour, undefined);
  assert.equal(snapshot.deadLetterCount, undefined);
  assert.equal(snapshot.outcomeUnknownCount, undefined);
  assert.equal(snapshot.httpTotal, undefined);
  for (const definition of buildAlertDefinitions({ metricsSnapshot: read }))
    assert.equal(await definition.condition(), false);
});

test("concurrent alert readers share one in-flight storage query", async () => {
  let release!: () => void,
    reads = 0;
  const barrier = new Promise<void>((resolve) => {
    release = resolve;
  });
  const db = {
    rawQuery: async () => {
      reads++;
      await barrier;
      return [{ tasks: "0", dead: "0", unknown: "0" }];
    },
  } as unknown as Store;
  const read = createAlertSnapshotReader(db, new MetricsRegistry(), new CircuitRegistry(), () => true);
  const first = read(),
    second = read();
  assert.equal(reads, 1);
  release();
  assert.deepEqual(await first, await second);
});
