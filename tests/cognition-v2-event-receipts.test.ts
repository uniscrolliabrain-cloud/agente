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
