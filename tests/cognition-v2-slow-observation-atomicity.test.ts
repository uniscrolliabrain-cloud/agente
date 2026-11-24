import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { installCognitionV2, DurableProjector } from "../apps/server/src/engine/cognition/v2/storage.ts";

test("C06 observer quota and cursor rollback together when enqueue fails", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const tenant = "observer-rollback";
    const event = { id: "receipt-1", tenantId: tenant, owner: "alice",
      type: "task.completed", schemaVersion: "1.0", emittedAt: new Date().toISOString(),
      source: { kind: "task", id: "task-1" }, payload: {} };
    await db.rawQuery("INSERT INTO cognition_v2_sequences(tenant,sequence) VALUES($1,1)", [tenant]);
    await db.rawQuery("INSERT INTO cognition_v2_events(tenant,sequence,event_id,event) VALUES($1,1,$2,$3::jsonb)",
      [tenant, event.id, JSON.stringify(event)]);
    const projector = new DurableProjector(db, "slow-observer-v2.1");
    const lease = await projector.acquire(tenant);
    assert.ok(lease);
    try {
      assert.equal(await projector.batch(lease, async () => {
        await db.rawQuery("INSERT INTO cognition_v2_observation_quotas(tenant,day,calls) VALUES($1,$2,1)", [tenant, "2026-11-23"]);
        throw Error("SIMULATED_ENQUEUE_FAILURE");
      }), 0);
      const quota = await db.rawQuery("SELECT calls FROM cognition_v2_observation_quotas WHERE tenant=$1", [tenant]);
      assert.equal(quota.length, 0);
      const cursor = await db.rawQuery<{ sequence: string }>(
        "SELECT sequence FROM cognition_v2_cursors WHERE tenant=$1 AND consumer=$2", [tenant, "slow-observer-v2.1"]);
      assert.equal(Number(cursor[0].sequence), 0);
      const inbox = await db.rawQuery<{ status: string }>(
        "SELECT status FROM cognition_v2_inbox WHERE tenant=$1 AND consumer=$2", [tenant, "slow-observer-v2.1"]);
      assert.equal(inbox[0].status, "retry");
    } finally { await projector.release(lease); }
  } finally { await db.close(); }
});

test("C06 observer daily quota is bounded under concurrent reservations", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const tenant = "observer-quota-concurrency";
    const day = "2026-11-23";
    const attempts = await Promise.all(Array.from({ length: 12 }, async () => db.transaction(async () => {
      const rows = await db.rawQuery<{ calls: number }>(
        `INSERT INTO cognition_v2_observation_quotas(tenant,day,calls)
          VALUES($1,$2,1) ON CONFLICT(tenant,day) DO UPDATE
          SET calls=cognition_v2_observation_quotas.calls+1
          WHERE cognition_v2_observation_quotas.calls < $3 RETURNING calls`,
        [tenant, day, 3]);
      return rows.length === 1;
    })));
    assert.equal(attempts.filter(Boolean).length, 3);
    const [row] = await db.rawQuery<{ calls: number }>(
      "SELECT calls FROM cognition_v2_observation_quotas WHERE tenant=$1 AND day=$2", [tenant, day]);
    assert.equal(row.calls, 3);
  } finally { await db.close(); }
});

test("C06 revoked business receipt is visible to observer revocation guard", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    await db.rawQuery(
      "INSERT INTO cognition_v2_revocations(tenant,source) VALUES($1,$2)",
      ["tenant-a", "business-receipt-1"]);
    const check = (tenant: string) => db.rawQuery<{ source: string }>(
      "SELECT source FROM cognition_v2_revocations WHERE tenant=$1 AND source=ANY($2::text[]) LIMIT 1",
      [tenant, ["business-receipt-1", "card-1"]]);
    assert.equal((await check("tenant-a"))[0]?.source, "business-receipt-1");
    assert.equal((await check("tenant-b")).length, 0);
  } finally { await db.close(); }
});
