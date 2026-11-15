import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../apps/server/src/db.ts";
test("C02 concurrent transaction rollback cannot commit another call chain", async () => {
  const db = await createStore();
  try {
    const outcomes = await Promise.allSettled([
      db.transaction(async () => { await db.put("A", "test", { id: "rollback" }); throw Error("crash"); }),
      db.transaction(async () => { await db.put("B", "test", { id: "commit" }); }),
    ]);
    assert.equal(outcomes[0].status, "rejected"); assert.equal(outcomes[1].status, "fulfilled");
    assert.equal(await db.get("A", "test", "rollback"), null);
    assert.ok(await db.get("B", "test", "commit"));
    await db.transaction(async () => db.transaction(async () => db.put("A", "test", { id: "nested" })));
    assert.ok(await db.get("A", "test", "nested"));
  } finally { await db.close(); }
});
