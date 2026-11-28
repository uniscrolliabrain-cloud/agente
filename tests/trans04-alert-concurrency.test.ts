import assert from "node:assert/strict";
import { test } from "node:test";
import { AlertService } from "../apps/server/src/alerts/service.ts";
import { createStore } from "../apps/server/src/db.ts";

const definition = { id: "local-alert", description: "synthetic", severity: "warning" as const, cooldownSec: 300 };

test("overlapping evaluations send one notification", async () => {
  let release!: () => void,
    calls = 0;
  const barrier = new Promise<void>((resolve) => {
    release = resolve;
  });
  const alerts = new AlertService([
    {
      fire: async () => {
        calls++;
      },
    },
  ]);
  alerts.register({
    ...definition,
    condition: async () => {
      await barrier;
      return true;
    },
  });
  const first = alerts.evaluate(),
    second = alerts.evaluate();
  release();
  await Promise.all([first, second]);
  assert.equal(calls, 1);
});

test("the durable cooldown survives a new service instance", async () => {
  const db = await createStore();
  try {
    let calls = 0;
    const handler = {
      fire: async () => {
        calls++;
      },
    };
    const first = new AlertService([handler], 30000, db);
    first.register({ ...definition, condition: () => true });
    await first.evaluate();
    const restarted = new AlertService([handler], 30000, db);
    restarted.register({ ...definition, condition: () => true });
    await restarted.evaluate();
    assert.equal(calls, 1);
  } finally {
    await db.close();
  }
});

test("a synchronous notification failure is contained", async () => {
  const alerts = new AlertService([
    {
      fire: () => {
        throw Error("private-provider-detail");
      },
    },
  ]);
  alerts.register({ ...definition, condition: () => true });
  assert.equal((await alerts.evaluate()).length, 1);
});
