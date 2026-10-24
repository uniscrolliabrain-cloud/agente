// TESTS_EVENT_BUS_DEDUPE_V1 â€” dedupe con dedupeKey explÃ­cita.
// El miniaudit 08 lo pide: "Sin test de dedupe por tipo".

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { EventBus } from "../apps/server/src/engine/events/index.ts";

test("emit con dedupeKey no duplica; sin dedupeKey, siempre escribe", async () => {
  const db = await createStore();
  try {
    const bus = new EventBus(db);

    // Sin dedupeKey: cada emisiÃ³n es un evento nuevo.
    await bus.emit("owner", "system.maintenance", { kind: "system", id: "m" }, { tasks: 0, monitors: 0 });
    await bus.emit("owner", "system.maintenance", { kind: "system", id: "m" }, { tasks: 0, monitors: 0 });
    const noDedupe = await db.list("owner", "system-events");
    assert.equal(noDedupe.length, 2, "sin dedupeKey, dos eventos");

    // Con dedupeKey: la segunda emisiÃ³n se descarta.
    await db.remove("owner", "system-events", String(noDedupe[0].id));
    await db.remove("owner", "system-events", String(noDedupe[1].id));
    await bus.emit("owner", "system.maintenance", { kind: "system", id: "m" }, { tasks: 0, monitors: 0 }, { dedupeKey: "test-key-1" });
    await bus.emit("owner", "system.maintenance", { kind: "system", id: "m" }, { tasks: 0, monitors: 0 }, { dedupeKey: "test-key-1" });
    const withDedupe = await db.list("owner", "system-events");
    assert.equal(withDedupe.length, 1, "con dedupeKey, un evento");
  } finally {
    await db.close();
  }
});
