import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { StoreTurnStore, type StorePort } from "../apps/server/src/kernel/graph/store-store.ts";
import { InMemoryTurnStore } from "../apps/server/src/kernel/graph/in-memory-store.ts";
import { thoughtSchema } from "../apps/server/src/kernel/graph/thought.ts";

for (const backend of ["memory", "pglite"]) {
  test(`${backend} preserves thought identity across retries and conflicting content`, async () => {
    const db = await createStore();
    const port: StorePort = {
      put: async (tenant, kind, id, data) => { await db.put(tenant, kind, { ...data as object, id }); },
      get: (tenant, kind, id) => db.get(tenant, kind, id),
      list: async (tenant, kind, limit) => (await db.list<{id:string}>(tenant, kind, {limit})).map(data => ({id:data.id,data})),
      transaction: (fn) => db.transaction(() => fn(port)),
    };
    const store = backend === "memory" ? new InMemoryTurnStore() : new StoreTurnStore(port);
    try {
      const turn = await store.openTurn("T", "alice", "test");
      const timestamp = new Date().toISOString();
      const thought = thoughtSchema.parse({id:"same",tenantId:"T",owner:"alice",turnId:turn.id,role:"observation",actor:{kind:"system",id:"fixture"},content:"original",attention:{id:"attention",author:"system",primary:"x",query:"x",intent:"observe",confidence:1,scope:"turn",timestamp},provenance:{source:"test",timestamp}});
      await store.append(thought);
      await store.append(thought);
      assert.equal((await store.getTurn("T", turn.id))?.thoughtIds.length, 1);
      await assert.rejects(() => store.append({...thought,content:"different"}), /conflict/);
      assert.equal((await store.thoughtsOf("T", turn.id))[0].content, "original");
      await store.closeTurn("T", turn.id, "user", "user");
      assert.deepEqual(await store.append(thought), thought);
    } finally { await db.close(); }
  });
}
