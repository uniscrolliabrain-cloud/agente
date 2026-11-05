import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";

test("list and listPaged do not skip tied timestamps or cross owner boundaries", async () => {
  const db = await createStore();
  try {
    for (const owner of ["tenant-a:user", "tenant-b:user"]) for (const id of ["a", "b", "c", "d", "e"]) await db.put(owner, "cursor-fixture", { id });
    // Fixture-only clock control: exercise the exact mixed-direction tie boundary.
    await db.rawQuery("UPDATE records SET updated_at = $1::timestamptz WHERE kind = $2", ["2026-10-31T00:00:00.000123Z", "cursor-fixture"]);
    const ids: string[] = [];
    let cursor: { cursorUpdatedAt: string; cursorId: string } | undefined;
    for (;;) {
      const page = await db.listPaged<{ id: string }>("tenant-a:user", "cursor-fixture", { limit: 2, ...cursor });
      const plain = await db.list<{ id: string }>("tenant-a:user", "cursor-fixture", { limit: 2, ...cursor });
      assert.deepEqual(plain.map((row) => row.id), page.map((row) => row.data.id));
      if (!page.length) break;
      assert.equal(page[0].updatedAt, "2026-10-31T00:00:00.000123Z");
      ids.push(...page.map((row) => row.data.id));
      const last = page.at(-1)!; cursor = { cursorUpdatedAt: last.updatedAt, cursorId: last.data.id };
      assert.ok(ids.length <= 5, "cursor must advance");
    }
    assert.deepEqual(ids, ["a", "b", "c", "d", "e"]);
    assert.deepEqual(await db.list("missing:user", "cursor-fixture", { limit: 2 }), []);
  } finally { await db.close(); }
});

test("descending timestamp pages include older records after the last tied id", async () => {
  const db = await createStore();
  try {
    for (const id of ["a", "b", "old"]) await db.put("owner", "cursor-fixture", { id });
    await db.rawQuery("UPDATE records SET updated_at = $1::timestamptz WHERE kind = $2", ["2026-10-31T00:00:00Z", "cursor-fixture"]);
    await db.rawQuery("UPDATE records SET updated_at = $1::timestamptz WHERE kind = $2 AND id = $3", ["2026-10-30T00:00:00Z", "cursor-fixture", "old"]);
    const [first] = await db.listPaged<{ id: string }>("owner", "cursor-fixture", { limit: 1 });
    assert.equal(first.data.id, "a");
    const rest = await db.list<{ id: string }>("owner", "cursor-fixture", { cursorUpdatedAt: first.updatedAt, cursorId: first.data.id });
    assert.deepEqual(rest.map((row) => row.id), ["b", "old"]);
  } finally { await db.close(); }
});
