import { test } from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "../apps/server/src/engine/events/bus.ts";
import type { Store } from "../apps/server/src/db.ts";
test("C02 post-commit notification failure does not negate a committed event", async () => {
  let persisted = 0;
  const db = { get: async () => null, insertIfAbsent: async () => { throw Error("notification DB unavailable"); } } as unknown as Store;
  const bus = new EventBus(db, { write: async () => { persisted++; } });
  const receipt = await bus.emit("alice", "system.maintenance", { kind: "system", id: "test" }, { tasks: 0, monitors: 0 },
    { tenantId: "A", notify: { title: "x", body: "x", key: "x" } });
  assert.equal(persisted, 1); assert.equal(receipt.persisted, true); assert.ok(receipt.id);
  assert.equal(receipt.error, "POST_COMMIT_NOTIFICATION_FAILED");
});

test("C02 commit ACK loss remains unknown and reconciles by the preserved event ID", async () => {
  const { createStore, Store } = await import("../apps/server/src/db.ts");
  const db = await createStore();
  try {
    type Adapter = ConstructorParameters<typeof Store>[0];
    const adapter: Adapter = {
      query: async (sql, params) => ({ rows: await db.rawQuery<{ data: Record<string, unknown> }>(sql, params) }),
      close: async () => {},
      transaction: async (fn) => { await db.transaction(() => fn(adapter)); throw Error("Commit succeeded; acknowledgement lost"); },
    };
    const wrapper = new Store(adapter), bus = new EventBus(wrapper);
    let receipt: import("../apps/server/src/engine/events/bus.ts").EmitResult | undefined;
    await assert.rejects(wrapper.transaction(async () => {
      receipt = await bus.emit("uncertain", "system.maintenance", { kind: "system", id: "test" }, { tasks: 0, monitors: 0 }, { tenantId: "A" });
    }), /acknowledgement lost/);
    assert.equal(receipt!.persisted, false); assert.equal(receipt!.commitOutcome, "unknown");
    assert.equal(receipt!.error, "OUTER_TRANSACTION_OUTCOME_UNKNOWN"); assert.ok(receipt!.id);
    assert.ok(await db.get("uncertain", "system-events", receipt!.id));
  } finally { await db.close(); }
});
