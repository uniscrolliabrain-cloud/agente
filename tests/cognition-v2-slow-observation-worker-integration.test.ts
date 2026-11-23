import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { installCognitionV2, DurableEventSink } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { SlowCognitionQueue } from "../apps/server/src/engine/cognition/v2/slow.ts";
import { SlowObservationWorker } from "../apps/server/src/engine/cognition/v2/slow-observation-worker.ts";
import type { CognitionV2Runtime } from "../apps/server/src/engine/cognition/v2/runtime.ts";
import type { CognitiveRecord, CognitiveIdentity } from "../packages/domain/src/cognition-v2.ts";

async function fixture() {
  const db = await createStore();
  await installCognitionV2(db);
  const tenant = "observer-e2e", owner = "alice";
  const identity: CognitiveIdentity = { tenantId: tenant, actorId: owner, owner, purpose: "chat", policyRevision: "p1" };
  const record: CognitiveRecord = {
    schemaVersion: "2.0", id: "business-card-1", tenantId: tenant, revision: 1,
    kind: "card", title: "Venta", body: "Venta registrada", epistemic: "reported_fact",
    evidence: [{ tenantId: tenant, kind: "event", id: "business-receipt-1", revision: 1 }],
    sourceEventId: "business-receipt-1", sourceRevision: 1,
    visibility: { tenantId: tenant, ownerActorId: owner, scope: "private", allowedActorIds: [], policyRevision: "p1" },
    signals: { relevance: 0.5, confidence: 0.5, novelty: 0.5, urgency: 0, contradiction: 0 },
    lifecycle: "active", createdAt: "2026-11-23T10:00:00.000Z",
  };
  const base = { tenantId: tenant, owner, schemaVersion: "1.0", emittedAt: "2026-11-23T10:00:00.000Z" };
  const events = [
    { ...base, id: "business-receipt-1", type: "task.completed", source: { kind: "task", id: "task-1" }, payload: {} },
    { ...base, id: "card-proposal-1", type: "cognition.v2.record.proposed", source: { kind: "task", id: "task-1" }, payload: { record } },
  ];
  await db.rawQuery("INSERT INTO cognition_v2_sequences(tenant,sequence) VALUES($1,2)", [tenant]);
  for (const [index, event] of events.entries()) await db.rawQuery(
    "INSERT INTO cognition_v2_events(tenant,sequence,event_id,event) VALUES($1,$2,$3,$4::jsonb)",
    [tenant, index + 1, event.id, JSON.stringify(event)]);
  let attempts = 0;
  let fail = false;
  const jobs: { actor: string; key: string }[] = [];
  const runtime = {
    db, tenants: new Set([tenant]),
    identity: async () => identity,
    context: {
      assertAuthorized: async (received: CognitiveIdentity) => assert.deepEqual(received, identity),
      resolve: async (_: CognitiveIdentity, id: string, revision: number) =>
        id === record.id && revision === record.revision ? record : null,
    },
    slow: { enqueue: async (input: { identity: CognitiveIdentity }, key: string) => {
      attempts++;
      if (fail) throw Error("SIMULATED_SLOW_QUEUE_OUTAGE");
      jobs.push({ actor: input.identity.actorId, key });
      return { id: "queued-job", state: "queued" };
    } },
  } as unknown as CognitionV2Runtime;
  return { db, tenant, record, runtime, jobs, attempts: () => attempts, fail: (value: boolean) => { fail = value; } };
}

test("C06.P03b durable worker authentic receipt -> card -> scoped slow enqueue -> cursor, exactly once", async () => {
  const f = await fixture();
  try {
    const worker = new SlowObservationWorker(f.runtime, 3);
    assert.equal(await worker.tick(f.tenant, 10), 2);
    assert.equal(f.jobs.length, 1);
    assert.equal(f.jobs[0].actor, "alice");
    assert.equal(await worker.tick(f.tenant, 10), 0);
    assert.equal(f.jobs.length, 1);
    const [quota] = await f.db.rawQuery<{ calls: number }>(
      "SELECT calls FROM cognition_v2_observation_quotas WHERE tenant=$1", [f.tenant]);
    assert.equal(quota.calls, 1);
    const [cursor] = await f.db.rawQuery<{ sequence: string }>(
      "SELECT sequence FROM cognition_v2_cursors WHERE tenant=$1 AND consumer=$2",
      [f.tenant, "slow-observer-v2.1"]);
    assert.equal(Number(cursor.sequence), 2);
  } finally { await f.db.close(); }
});

test("C06.P03b queue outage rolls back quota and cursor and marks inbox retry", async () => {
  const f = await fixture();
  try {
    const worker = new SlowObservationWorker(f.runtime, 3);
    f.fail(true);
    assert.equal(await worker.tick(f.tenant, 10), 1);
    assert.equal(f.jobs.length, 0);
    const quotas = await f.db.rawQuery(
      "SELECT calls FROM cognition_v2_observation_quotas WHERE tenant=$1", [f.tenant]);
    assert.equal(quotas.length, 0);
    const [cursor] = await f.db.rawQuery<{ sequence: string }>(
      "SELECT sequence FROM cognition_v2_cursors WHERE tenant=$1 AND consumer=$2",
      [f.tenant, "slow-observer-v2.1"]);
    assert.equal(Number(cursor.sequence), 1);
    const [retry] = await f.db.rawQuery<{ status: string }>(
      "SELECT status FROM cognition_v2_inbox WHERE tenant=$1 AND consumer=$2 AND event_id=$3",
      [f.tenant, "slow-observer-v2.1", "card-proposal-1"]);
    assert.equal(retry.status, "retry");
  } finally { await f.db.close(); }
});

test("C06.P03b revoked original receipt prevents slow queue and quota charge", async () => {
  const f = await fixture();
  try {
    await f.db.rawQuery("INSERT INTO cognition_v2_revocations(tenant,source) VALUES($1,$2)",
      [f.tenant, "business-receipt-1"]);
    const worker = new SlowObservationWorker(f.runtime, 3);
    assert.equal(await worker.tick(f.tenant, 10), 2);
    assert.equal(f.attempts(), 0);
    const quotas = await f.db.rawQuery(
      "SELECT calls FROM cognition_v2_observation_quotas WHERE tenant=$1", [f.tenant]);
    assert.equal(quotas.length, 0);
  } finally { await f.db.close(); }
});

test("C06.P03b exhausted quota never acknowledges a card without enqueuing it", async () => {
  const f = await fixture();
  try {
    const day = new Date().toISOString().slice(0, 10);
    await f.db.rawQuery(
      "INSERT INTO cognition_v2_observation_quotas(tenant,day,calls) VALUES($1,$2,$3)",
      [f.tenant, day, 3]);
    const worker = new SlowObservationWorker(f.runtime, 3);
    assert.equal(await worker.tick(f.tenant, 10), 1);
    assert.equal(f.attempts(), 0);
    const [cursor] = await f.db.rawQuery<{ sequence: string }>(
      "SELECT sequence FROM cognition_v2_cursors WHERE tenant=$1 AND consumer=$2",
      [f.tenant, "slow-observer-v2.1"]);
    assert.equal(Number(cursor.sequence), 1);
    const [inbox] = await f.db.rawQuery<{ status: string }>(
      "SELECT status FROM cognition_v2_inbox WHERE tenant=$1 AND consumer=$2 AND event_id=$3",
      [f.tenant, "slow-observer-v2.1", "card-proposal-1"]);
    assert.equal(inbox.status, "retry");
    const [deferred] = await f.db.rawQuery<{ attempts: number; next_at: string }>(
      "SELECT attempts,next_at FROM cognition_v2_inbox WHERE tenant=$1 AND consumer=$2 AND event_id=$3",
      [f.tenant, "slow-observer-v2.1", "card-proposal-1"]);
    assert.equal(deferred.attempts, 0, "capacity pause must not exhaust dead-letter retries");
    const next = new Date(deferred.next_at);
    assert.equal(next.getUTCHours(), 0);
    assert.equal(next.getUTCMinutes(), 0);
    assert.ok(next.getTime() > Date.now());
    assert.equal(await worker.tick(f.tenant, 10), 0, "do not spin on deferred quota");
    const [quota] = await f.db.rawQuery<{ calls: number }>(
      "SELECT calls FROM cognition_v2_observation_quotas WHERE tenant=$1 AND day=$2", [f.tenant, day]);
    assert.equal(quota.calls, 3);
  } finally { await f.db.close(); }
});

test("C06.P03b persists a real slow job and queued receipt atomically", async () => {
  const f = await fixture();
  try {
    const context = f.runtime.context;
    const sink = new DurableEventSink(f.db, f.db, new Set([f.tenant]));
    const queue = new SlowCognitionQueue(f.db, sink, context, {
      infer: async () => { throw Error("PROVIDER_NOT_USED_BY_OBSERVER"); },
    });
    const runtime = { ...f.runtime, slow: queue } as CognitionV2Runtime;
    const worker = new SlowObservationWorker(runtime, 3);
    // The queued status receipt is appended in the same transaction and may
    // be consumed by this batch; it must never trigger a second slow job.
    assert.equal(await worker.tick(f.tenant, 10), 3);
    const jobs = await f.db.rawQuery<{ id: string; state: string; actor: string }>(
      "SELECT id,state,actor FROM cognition_v2_slow_jobs WHERE tenant=$1", [f.tenant]);
    assert.equal(jobs.length, 1);
    assert.equal(jobs[0].state, "queued");
    assert.equal(jobs[0].actor, "alice");
    const events = await f.db.rawQuery<{ event: { type: string } }>(
      "SELECT event FROM cognition_v2_events WHERE tenant=$1", [f.tenant]);
    assert.equal(events.filter(({ event }) => event.type === "cognition.v2.slow.status").length, 1);
    assert.equal(await worker.tick(f.tenant, 10), 0); // status already consumed, no self-loop
    const after = await f.db.rawQuery("SELECT id FROM cognition_v2_slow_jobs WHERE tenant=$1", [f.tenant]);
    assert.equal(after.length, 1);
  } finally { await f.db.close(); }
});

test("C06.P03b resumes deferred observation after UTC rollover, once only", async () => {
  const f = await fixture();
  try {
    let now = Date.parse("2026-11-23T23:59:00.000Z");
    const clock = () => now;
    await f.db.rawQuery(
      "INSERT INTO cognition_v2_observation_quotas(tenant,day,calls) VALUES($1,$2,$3)",
      [f.tenant, "2026-11-23", 3]);
    const worker = new SlowObservationWorker(f.runtime, 3, f.db, clock);
    assert.equal(await worker.tick(f.tenant, 10), 1);
    assert.equal(f.attempts(), 0);
    const [deferred] = await f.db.rawQuery<{ next_at: string; attempts: number }>(
      "SELECT next_at,attempts FROM cognition_v2_inbox WHERE tenant=$1 AND consumer=$2 AND event_id=$3",
      [f.tenant, "slow-observer-v2.1", "card-proposal-1"]);
    assert.equal(new Date(deferred.next_at).toISOString(), "2026-11-24T00:00:00.000Z");
    assert.equal(deferred.attempts, 0);
    now = Date.parse("2026-11-23T23:59:59.000Z");
    assert.equal(await worker.tick(f.tenant, 10), 0);
    now = Date.parse("2026-11-24T00:00:01.000Z");
    assert.equal(await worker.tick(f.tenant, 10), 1);
    assert.equal(f.attempts(), 1);
    assert.equal(f.jobs.length, 1);
    assert.equal(await worker.tick(f.tenant, 10), 0);
    assert.equal(f.attempts(), 1);
    const [quota] = await f.db.rawQuery<{ calls: number }>(
      "SELECT calls FROM cognition_v2_observation_quotas WHERE tenant=$1 AND day=$2",
      [f.tenant, "2026-11-24"]);
    assert.equal(quota.calls, 1);
    const [cursor] = await f.db.rawQuery<{ sequence: string }>(
      "SELECT sequence FROM cognition_v2_cursors WHERE tenant=$1 AND consumer=$2",
      [f.tenant, "slow-observer-v2.1"]);
    assert.equal(Number(cursor.sequence), 2);
  } finally { await f.db.close(); }
});

test("C06.P03b competing workers cannot double-enqueue the same card", async () => {
  const f = await fixture();
  try {
    const first = new SlowObservationWorker(f.runtime, 3);
    const second = new SlowObservationWorker(f.runtime, 3);
    const results = await Promise.all([first.tick(f.tenant, 10), second.tick(f.tenant, 10)]);
    assert.equal(results.reduce((sum, value) => sum + value, 0), 2);
    assert.equal(f.jobs.length, 1);
    assert.equal(f.attempts(), 1);
    const [quota] = await f.db.rawQuery<{ calls: number }>(
      "SELECT calls FROM cognition_v2_observation_quotas WHERE tenant=$1", [f.tenant]);
    assert.equal(quota.calls, 1);
  } finally { await f.db.close(); }
});
