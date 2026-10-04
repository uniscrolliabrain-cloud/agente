// TESTS_EVENTS_SSE_V1 — suscriptores del bus, dedupe y retención.
// Ver: docs/audits/08-bus-de-eventos/roadmap.md §8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { EventBus } from "../apps/server/src/engine/events/index.ts";
import { globalSubscribers } from "../apps/server/src/engine/events/subscriber.ts";
import { retentionDaysFor, groupTypesByRetention } from "../apps/server/src/engine/events/retention.ts";
import type { SystemEvent } from "../apps/server/src/engine/events/types.ts";

test("subscriber recibe los eventos emitidos del owner", async () => {
  const db = await createStore();
  try {
    const bus = new EventBus(db);
    const received: SystemEvent[] = [];
    const handle = globalSubscribers.subscribe("owner-sub", (e) => received.push(e));
    await bus.emit("owner-sub", "system.startup", { kind: "system", id: "boot" }, { mode: "sample" });
    await bus.emit("owner-sub", "system.error", { kind: "system", id: "err" }, { message: "test" });
    handle.unsubscribe();
    assert.equal(received.length, 2);
    assert.equal(received[0].type, "system.startup");
  } finally {
    await db.close();
  }
});

test("subscriber con filtro de tipo solo recibe los suyos", async () => {
  const db = await createStore();
  try {
    const bus = new EventBus(db);
    const received: SystemEvent[] = [];
    const handle = globalSubscribers.subscribe(
      "owner-filter",
      (e) => received.push(e),
      { types: ["system.error"] },
    );
    await bus.emit("owner-filter", "system.startup", { kind: "system", id: "boot" }, { mode: "sample" });
    await bus.emit("owner-filter", "system.error", { kind: "system", id: "err" }, { message: "test" });
    handle.unsubscribe();
    assert.equal(received.length, 1);
    assert.equal(received[0].type, "system.error");
  } finally {
    await db.close();
  }
});

test("unsubscribe deja de recibir eventos", async () => {
  const db = await createStore();
  try {
    const bus = new EventBus(db);
    const received: SystemEvent[] = [];
    const handle = globalSubscribers.subscribe("owner-unsub", (e) => received.push(e));
    await bus.emit("owner-unsub", "system.startup", { kind: "system", id: "boot" }, { mode: "sample" });
    handle.unsubscribe();
    await bus.emit("owner-unsub", "system.error", { kind: "system", id: "err" }, { message: "after" });
    assert.equal(received.length, 1);
  } finally {
    await db.close();
  }
});

test("retención por tipo devuelve valores coherentes", () => {
  assert.equal(retentionDaysFor("auth.login"), 365);
  assert.equal(retentionDaysFor("task.created"), 90);
  assert.equal(retentionDaysFor("monitor.check"), 30);
  assert.equal(retentionDaysFor("system.maintenance"), 7);
  assert.equal(retentionDaysFor("unknown.type"), 90);
});

test("groupTypesByRetention agrupa por días", () => {
  const types = ["auth.login", "task.created", "monitor.check"] as const;
  const grouped = groupTypesByRetention(types);
  assert.equal(grouped.get(365)?.length, 1);
  assert.equal(grouped.get(90)?.length, 1);
  assert.equal(grouped.get(30)?.length, 1);
});