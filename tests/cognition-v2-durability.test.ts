import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStore } from "../apps/server/src/db.ts";
import { DurableEventSink, DurableProjector, CognitiveProjectionStore, installCognitionV2 } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { ContextServingFacade, CardDeliveryLedger } from "../apps/server/src/engine/cognition/v2/context.ts";
import type { SystemEvent } from "../apps/server/src/engine/events/types.ts";
import type { CognitiveIdentity } from "../packages/domain/src/cognition-v2.ts";
import { record } from "./fixtures/cognition-v2/record.ts";
const identity: CognitiveIdentity = { tenantId: "A", actorId: "alice", owner: "alice", policyRevision: "1", purpose: "chat" };
function event(id: string, tenantId = "A"): SystemEvent {
  return { id, tenantId, owner: "alice", type: "system.maintenance", schemaVersion: "1.0", emittedAt: "2026-11-15T00:00:00Z", source: { kind: "system", id: "fixture" }, payload: {} };
}
test("C02 501 events replay through durable cursor; crash rolls back effects and fencing rejects stale worker", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const sink = new DurableEventSink(db, db, new Set(["A", "B"]));
    for (let i = 0; i < 501; i++) await sink.write(event(`event-${i}`));
    await sink.write(event("other", "B"));
    let now = Date.now(); const projector = new DurableProjector(db, "test", () => now);
    const lease = (await projector.acquire("A", "first", 10000))!;
    assert.equal(await projector.acquire("A", "second"), null);
    let crashed = false;
    assert.equal(await projector.batch(lease, async () => { await db.put("A", "projection-test", { id: "effect" }); crashed = true; throw Error("crash after effect"); }), 0);
    assert.equal(crashed, true); assert.equal(await db.get("A", "projection-test", "effect"), null);
    now += 11000;
    const takeover = (await projector.acquire("A", "second", 60000))!;
    await assert.rejects(projector.batch(lease, async () => {}), /STALE_FENCE/);
    const ids: string[] = [];
    while (await projector.batch(takeover, async (e) => { assert.equal(e.tenantId, "A"); ids.push(e.id); }, 200)) { /* paginated */ }
    assert.equal(ids.length, 501); assert.equal(new Set(ids).size, 501);
    assert.equal(await projector.batch(takeover, async () => assert.fail("duplicate")), 0);
    await sink.write(event("event-0"));
    const [count] = await db.rawQuery<{ count: string }>("SELECT count(*) AS count FROM cognition_v2_events WHERE tenant='A'");
    assert.equal(Number(count.count), 501);
  } finally { await db.close(); }
});
test("C03/C04/C09/C10 restart, five memories, private isolation, replay revocation and durable ACK", async () => {
  const path = await mkdtemp(join(tmpdir(), "cognition-v2-"));
  let db = await createStore({ dataDir: path });
  try {
    await installCognitionV2(db);
    let store = new CognitiveProjectionStore(db);
    const card = record();
    await store.apply(card, "1"); await store.apply(card, "1");
    for (const kind of ["episodic", "semantic", "procedural", "autobiographical", "working"] as const) {
      await store.apply({ ...record("A", "alice", kind), kind: "memory", memoryKind: kind, ...(kind === "working" ? { expiresAt: "2099-01-01T00:00:00Z" } : {}) }, "1");
    }
    let authorized = true;
    const policy = { authorize: async (ctx: CognitiveIdentity) => authorized && ctx.policyRevision === "1" };
    let context = new ContextServingFacade(store, policy);
    const snapshot = await context.getSnapshot(identity, { query: "Dato", maxTokens: 8000, maxRefs: 20 });
    assert.equal(snapshot.refs.length, 6);
    assert.equal((await context.getSnapshot({ ...identity, actorId: "bob" }, { query: "", maxTokens: 8000, maxRefs: 20 })).refs.length, 0);
    assert.equal(await context.resolve({ ...identity, tenantId: "B" }, card.id), null);
    let ledger = new CardDeliveryLedger(context);
    const [one, two] = await Promise.all([ledger.reserve(identity, snapshot.id, card.id), ledger.reserve(identity, snapshot.id, card.id)]);
    assert.equal(Number(Boolean(one)) + Number(Boolean(two)), 1);
    const lease = (one ?? two)!;
    assert.equal(await ledger.ack(identity, lease.id, lease.fence, "too-early"), false);
    assert.equal(await ledger.rendered(identity, lease.id, lease.fence), true);
    await db.close(); db = await createStore({ dataDir: path }); store = new CognitiveProjectionStore(db);
    context = new ContextServingFacade(store, policy); ledger = new CardDeliveryLedger(context);
    assert.equal(await ledger.ack(identity, lease.id, lease.fence, "receipt"), true);
    assert.equal(await ledger.ack(identity, lease.id, lease.fence, "receipt"), true);
    assert.equal(await ledger.ack(identity, lease.id, lease.fence + 1, "receipt"), false);
    assert.equal((await context.getSnapshot(identity, { query: "", maxTokens: 8000, maxRefs: 20 })).refs.length, 6, "ACK never consumes knowledge");
    await store.revoke("A", "source"); await store.apply(card, "1");
    assert.equal(await context.readSnapshot(identity, snapshot.id), null);
    assert.equal(await context.resolve(identity, card.id), null);
    assert.equal((await context.getSnapshot(identity, { query: "", maxTokens: 8000, maxRefs: 20 })).refs.length, 0);
    authorized = false;
    await assert.rejects(context.getSnapshot(identity, { query: "", maxTokens: 1000, maxRefs: 20 }), /DENIED/);
  } finally { await db.close(); await rm(path, { recursive: true, force: true }); }
});
