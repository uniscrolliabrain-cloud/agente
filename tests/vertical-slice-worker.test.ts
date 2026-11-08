// VERTICAL_SLICE_WORKER_TEST_V1 - campaña 06.
// Ver: docs/vertical-slice-actual/06-worker/CAMPAIGN.md
//
// Aserción de cierre (parte diferida): jamás hay recibo de éxito por callback
// vacío. Antes `tick()` marcaba `executed` y emitía `action.executed` aunque el
// callback no hiciera nada; este test lo fija al contrario.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DeferredActions,
  MemoryDeferredStore,
  type DeferredEmit,
} from "../apps/server/src/actions-deferred.ts";

async function scheduled(store: MemoryDeferredStore, now = 1000) {
  const deferred = new DeferredActions(store, async () => {}, () => {}, {
    now: () => now,
    windowMs: 0,
    dualAt: null,
  });
  await deferred.decide("owner-a", "action-1", "user-1");
  return deferred;
}

test("un callback vacío no produce recibo de éxito", async () => {
  const store = new MemoryDeferredStore();
  const emitted: Array<{ type: string; payload: Record<string, unknown> }> = [];
  const emit: DeferredEmit = (type, payload) => {
    emitted.push({ type, payload });
  };
  const deferred = new DeferredActions(
    store,
    async () => {
      // callback vacío: no hace nada y no devuelve recibo
    },
    emit,
    { now: () => 1000, windowMs: 0, dualAt: null },
  );
  await deferred.decide("owner-a", "action-1", "user-1");
  await deferred.tick();

  const record = await store.get("action-1");
  assert.equal(record?.status, "failed");
  assert.equal(record?.failureReason, "sin_recibo");
  assert.equal(emitted.some((e) => e.type === "action.executed"), false);
  const failed = emitted.find((e) => e.type === "action.failed");
  assert.ok(failed);
  assert.equal(failed?.payload.error, "sin_recibo");
});

test("un recibo negativo explícito tampoco cuenta como éxito", async () => {
  const store = new MemoryDeferredStore();
  const emitted: Array<{ type: string; payload: Record<string, unknown> }> = [];
  const deferred = new DeferredActions(
    store,
    async () => ({ executed: false, reason: "deferred_dispatch_unwired" }),
    (type, payload) => {
      emitted.push({ type, payload });
    },
    { now: () => 1000, windowMs: 0, dualAt: null },
  );
  await deferred.decide("owner-a", "action-1", "user-1");
  await deferred.tick();

  const record = await store.get("action-1");
  assert.equal(record?.status, "failed");
  assert.equal(record?.failureReason, "deferred_dispatch_unwired");
  assert.equal(emitted.some((e) => e.type === "action.executed"), false);
});

test("un recibo afirmativo sí marca executed", async () => {
  const store = new MemoryDeferredStore();
  const emitted: string[] = [];
  const deferred = new DeferredActions(
    store,
    async () => ({ executed: true }),
    (type) => {
      emitted.push(type);
    },
    { now: () => 1000, windowMs: 0, dualAt: null },
  );
  await deferred.decide("owner-a", "action-1", "user-1");
  await deferred.tick();

  const record = await store.get("action-1");
  assert.equal(record?.status, "executed");
  assert.equal(record?.failureReason, undefined);
  assert.ok(emitted.includes("action.executed"));
});

test("un throw se registra como failed con su causa", async () => {
  const store = new MemoryDeferredStore();
  const deferred = new DeferredActions(
    store,
    async () => {
      throw new Error("proveedor caído");
    },
    () => {},
    { now: () => 1000, windowMs: 0, dualAt: null },
  );
  await deferred.decide("owner-a", "action-1", "user-1");
  await deferred.tick();

  const record = await store.get("action-1");
  assert.equal(record?.status, "failed");
  assert.equal(record?.failureReason, "Error: proveedor caído");
});

test("el tick no reejecuta una acción ya reclamada", async () => {
  const store = new MemoryDeferredStore();
  await scheduled(store);
  let calls = 0;
  const deferred = new DeferredActions(
    store,
    async () => {
      calls += 1;
      return { executed: true };
    },
    () => {},
    { now: () => 1000, windowMs: 0, dualAt: null },
  );
  await deferred.tick();
  await deferred.tick();
  assert.equal(calls, 1);
});
