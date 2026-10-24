// TESTS_EVENT_BUS_STRESS_V1 - 500 eventos en ráfaga.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { EventBus } from "../apps/server/src/engine/events/index.ts";

test("500 emisiones rápidas sin pérdida", { timeout: 60000 }, async () => {
  const db = await createStore();
  try {
    const bus = new EventBus(db);
    const promises = [];
    for (let i = 0; i < 500; i += 1) {
      promises.push(
        bus.emit(
          "stress-owner",
          "system.maintenance",
          { kind: "system", id: "stress" },
          { tasks: i, monitors: 0 },
          { dedupeKey: `stress:${i}` },
        ),
      );
    }
    await Promise.all(promises);
    const stored = await db.list("stress-owner", "system-events");
    assert.equal(stored.length, 500, "500 eventos escritos");
  } finally {
    await db.close();
  }
});