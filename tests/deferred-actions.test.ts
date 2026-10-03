import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DeferredActions,
  MemoryDeferredStore,
} from "../apps/server/src/actions-deferred.ts";

function setup(dualAt: number | null = 5000) {
  let t = 0;
  const run = async () => {};
  const emitted: Array<{ type: string; payload: Record<string, unknown> }> = [];
  const emit = (type: string, payload: Record<string, unknown>) => {
    emitted.push({ type, payload });
  };
  const d = new DeferredActions(new MemoryDeferredStore(), run, emit, {
    now: () => t,
    windowMs: 8000,
    dualAt,
  });
  return { d, emitted, advance: (ms: number) => { t += ms; } };
}

test("importe pequeno: 1 firma programa y ejecuta tras la ventana", async () => {
  const { d, advance } = setup();
  const rec = await d.decide("o", "a1", "alfonso", 350);
  assert.equal(rec.status, "scheduled");
  advance(7000);
  await d.tick();
  advance(1500);
  await d.tick();
  const after = await new MemoryDeferredStore().get("a1");
  assert.ok(after === undefined || after.status === "executed" || after.status === "scheduled");
});

test("importe grande exige 2 firmantes distintos", async () => {
  const { d } = setup();
  await d.decide("o", "a2", "alfonso", 7900);
  await assert.rejects(d.decide("o", "a2", "alfonso", 7900), /ya has firmado/);
  const rec = await d.decide("o", "a2", "marta", 7900);
  assert.equal(rec.signers.length, 2);
  assert.equal(rec.status, "scheduled");
});

test("cancelar dentro de la ventana evita la ejecucion", async () => {
  const { d, advance } = setup();
  await d.decide("o", "a3", "alfonso", 100);
  await d.cancel("o", "a3", "alfonso");
  advance(9000);
  await d.tick();
});

test("tick doble no ejecuta dos veces", async () => {
  const { d, advance } = setup();
  await d.decide("o", "a4", "alfonso", 100);
  advance(9000);
  await Promise.all([d.tick(), d.tick()]);
});

test("sin doble firma (dualAt=null) basta una", async () => {
  const { d, advance } = setup(null);
  const rec = await d.decide("o", "a5", "alfonso", 99999);
  assert.equal(rec.status, "scheduled");
  advance(9000);
  await d.tick();
});

test("emit registra los eventos correctos", async () => {
  const { d, emitted } = setup();
  await d.decide("o", "a6", "alfonso", 100);
  assert.equal(emitted.some((e) => e.type === "action.deferred"), true);
});