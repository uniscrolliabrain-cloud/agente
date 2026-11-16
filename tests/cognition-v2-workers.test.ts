import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { createStore } from "../apps/server/src/db.ts";
import { createApp } from "../apps/server/src/app.ts";
import { testConfig } from "./helpers/config.ts";
import { runCognitionWorkers, cognitionWorkerReady } from "../apps/server/src/engine/cognition/v2/workers.ts";
import { DurableEventSink, installCognitionV2 } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { KernelReceiptProjector } from "../apps/server/src/engine/cognition/v2/kernel-receipts.ts";
import type { CognitionV2Runtime } from "../apps/server/src/engine/cognition/v2/runtime.ts";
import type { SystemEvent } from "../apps/server/src/engine/events/types.ts";

async function eventually(check: () => Promise<boolean>, timeout = 8000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail("condition did not become true");
}

test("V2 worker retries failures per tenant, reports readiness and recovers durable receipts after restart", async () => {
  const db = await createStore();
  const tenants = new Set(["worker-a", "worker-b"]);
  try {
    await installCognitionV2(db);
    assert.equal(await cognitionWorkerReady(db, tenants), false);
    const sink = new DurableEventSink(db, db, tenants);
    const receipts = new KernelReceiptProjector(db, db, tenants);
    let failures = 0;
    const runtime = {
      db, tenants,
      projector: { tick: async (tenant: string) => { if (tenant === "worker-a" && failures++ === 0) throw Error("synthetic failure"); } },
      slow: { tick: async () => false },
      deliveryRecovery: { tick: async () => 0 },
      kernelReceipts: receipts,
    } as unknown as CognitionV2Runtime;
    const first = new AbortController();
    const running = runCognitionWorkers(runtime, first.signal);
    try {
      await eventually(() => cognitionWorkerReady(db, tenants));
      assert.ok(failures >= 2, "a failed tenant is retried");
      await db.rawQuery("INSERT INTO cognition_v2_inbox(tenant,consumer,event_id,status) VALUES($1,'kernel-receipts-v2.1','poison','retry')", ["worker-a"]);
      assert.equal(await cognitionWorkerReady(db, tenants), false, "durable retry is not a healthy tick");
      await db.rawQuery("UPDATE cognition_v2_inbox SET status='dead_letter' WHERE tenant=$1 AND event_id='poison'", ["worker-a"]);
      assert.equal(await cognitionWorkerReady(db, tenants), false, "dead letters require intervention");
      await db.rawQuery("UPDATE cognition_v2_inbox SET status='committed' WHERE tenant=$1 AND event_id='poison'", ["worker-a"]);
      assert.equal(await cognitionWorkerReady(db, tenants), true);
      assert.equal(await cognitionWorkerReady(db, tenants, Date.now() + 100_000), false, "stale heartbeats fail closed");
    } finally { first.abort(); await running; }
    assert.equal(await cognitionWorkerReady(db, tenants), false, "clean shutdown removes this instance's heartbeats");
    const event: SystemEvent = { id: "worker-restart-event", tenantId: "worker-a", owner: "alice", type: "policy.denied", schemaVersion: "1.0", emittedAt: new Date().toISOString(), source: { kind: "system", id: "test" }, payload: { reason: "synthetic denial" } };
    await sink.write(event);
    assert.equal(await db.get("worker-a:alice", "notifications", "kn-worker-restart-event"), null);
    const second = new AbortController();
    const restarted = runCognitionWorkers(runtime, second.signal);
    try {
      await eventually(async () => Boolean(await db.get("worker-a:alice", "notifications", "kn-worker-restart-event")));
      assert.ok(await db.get("worker-a:worker-a", "kernel-audit-index", "ka-worker-restart-event"));
    } finally { second.abort(); await restarted; }
  } finally { await db.close(); }
});

const postgres = process.env.COGNITION_TEST_POSTGRES_URL;
test("separate Postgres worker publishes readiness and recovers events written while stopped", { skip: !postgres }, async () => {
  const apiDb = await createStore({ databaseUrl: postgres });
  const workerDb = await createStore({ databaseUrl: postgres });
  const tenant = `worker-${randomUUID()}`;
  const tenants = new Set([tenant]);
  try {
    await installCognitionV2(apiDb);
    const sink = new DurableEventSink(apiDb, apiDb, tenants);
    const runtime = { db: workerDb, tenants, projector: { tick: async () => 0 }, slow: { tick: async () => false },
      deliveryRecovery: { tick: async () => 0 }, kernelReceipts: new KernelReceiptProjector(workerDb, workerDb, tenants) } as unknown as CognitionV2Runtime;
    const event: SystemEvent = { id: "pg-recovery", tenantId: tenant, owner: "alice", type: "policy.denied", schemaVersion: "1.0", emittedAt: new Date().toISOString(), source: { kind: "system", id: "test" }, payload: { reason: "synthetic denial" } };
    await sink.write(event);
    assert.equal(await cognitionWorkerReady(apiDb, tenants), false);
    const controller = new AbortController();
    const running = runCognitionWorkers(runtime, controller.signal);
    try {
      await eventually(() => cognitionWorkerReady(apiDb, tenants));
      await eventually(async () => Boolean(await apiDb.get(`${tenant}:alice`, "notifications", "kn-pg-recovery")));
    } finally { controller.abort(); await running; }
    assert.equal(await cognitionWorkerReady(apiDb, tenants), false);
  } finally { await workerDb.close(); await apiDb.close(); }
});

test("API health fails closed when opted-in V2 has no live worker", async () => {
  const old = process.env.COGNITION_V2_TENANTS;
  process.env.COGNITION_V2_TENANTS = "worker-health-tenant";
  const db = await createStore();
  const directory = await mkdtemp(join(process.cwd(), "artifacts", "worker-test-"));
  let server: Awaited<ReturnType<typeof createApp>> | undefined;
  try {
    server = await createApp(db, testConfig({ dataDir: directory }));
    const response = await server.app.request("/api/health");
    assert.equal(response.status, 503);
    assert.equal((await response.json() as { checks: { cognitionV2Worker: boolean } }).checks.cognitionV2Worker, false);
    const controller = new AbortController();
    const running = runCognitionWorkers(server.agent.cognitionV2!, controller.signal);
    try {
      await eventually(() => cognitionWorkerReady(db, server!.agent.cognitionV2!.tenants));
      const ready = await server.app.request("/api/health");
      assert.equal(ready.status, 200);
      assert.equal((await ready.json() as { checks: { cognitionV2Worker: boolean } }).checks.cognitionV2Worker, true);
    } finally { controller.abort(); await running; }
  } finally {
    if (old === undefined) delete process.env.COGNITION_V2_TENANTS; else process.env.COGNITION_V2_TENANTS = old;
    await server?.agent.stop();
    await db.close();
    await rm(directory, { recursive: true, force: true });
  }
});
