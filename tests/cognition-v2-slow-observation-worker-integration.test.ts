import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { installCognitionV2 } from "../apps/server/src/engine/cognition/v2/storage.ts";
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
    const [quota] = await f.db.rawQuery<{ calls: number }>(
      "SELECT calls FROM cognition_v2_observation_quotas WHERE tenant=$1 AND day=$2", [f.tenant, day]);
    assert.equal(quota.calls, 3);
  } finally { await f.db.close(); }
});
