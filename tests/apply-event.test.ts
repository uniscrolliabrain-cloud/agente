import assert from "node:assert/strict";
import { test } from "node:test";
import { applyEvent, type BusEvent } from "../apps/web/src/lib/applyEvent.ts";

const empty = () => new Map();

test("sop.step_started anade progress", () => {
  const ev: BusEvent = {
    id: "1", type: "sop.step_started", at: 1000,
    payload: { taskId: "t1", title: "Paso 1", index: 0, total: 5 },
  };
  const next = applyEvent(empty(), ev);
  const list = next.get("t1") ?? [];
  assert.equal(list.length, 1);
  assert.equal(list[0].kind, "progress");
});

test("task.status_changed running anade timer", () => {
  const ev: BusEvent = {
    id: "2", type: "task.status_changed", at: 2000,
    payload: { taskId: "t1", to: "running" },
  };
  const next = applyEvent(empty(), ev);
  assert.equal(next.get("t1")?.[0].kind, "timer");
});

test("task.completed anade done", () => {
  const ev: BusEvent = {
    id: "3", type: "task.completed", at: 3000,
    payload: { taskId: "t1" },
  };
  const next = applyEvent(empty(), ev);
  assert.equal(next.get("t1")?.[0].kind, "done");
});

test("action.deferred sin executeAt anade alerta", () => {
  const ev: BusEvent = {
    id: "4", type: "action.deferred", at: 4000,
    payload: { actionId: "a1", signers: ["x"], needed: 2, executeAt: null },
  };
  const next = applyEvent(empty(), ev);
  assert.equal(next.get("a1")?.[0].kind, "alert");
});

test("action.deferred con executeAt elimina el item", () => {
  const seed = applyEvent(empty(), {
    id: "4a", type: "action.deferred", at: 4000,
    payload: { actionId: "a1", signers: ["x"], needed: 1, executeAt: null },
  });
  const next = applyEvent(seed, {
    id: "4b", type: "action.deferred", at: 5000,
    payload: { actionId: "a1", signers: ["x"], needed: 1, executeAt: 9000 },
  });
  assert.equal(next.has("a1"), false);
});

test("action.executed elimina el item", () => {
  const seed = applyEvent(empty(), {
    id: "5a", type: "action.deferred", at: 4000,
    payload: { actionId: "a1", signers: ["x"], needed: 1, executeAt: null },
  });
  const next = applyEvent(seed, {
    id: "5b", type: "action.executed", at: 6000, payload: { actionId: "a1" },
  });
  assert.equal(next.has("a1"), false);
});

test("evento desconocido no cambia el estado", () => {
  const next = applyEvent(empty(), {
    id: "6", type: "unknown.event", at: 1000, payload: {},
  });
  assert.equal(next.size, 0);
});

test("upsert del mismo kind reemplaza, no duplica", () => {
  const seed = applyEvent(empty(), {
    id: "7a", type: "sop.step_started", at: 1000,
    payload: { taskId: "t1", title: "Paso 1", index: 0, total: 5 },
  });
  const next = applyEvent(seed, {
    id: "7b", type: "sop.step_started", at: 2000,
    payload: { taskId: "t1", title: "Paso 2", index: 1, total: 5 },
  });
  assert.equal(next.get("t1")?.length, 1);
});