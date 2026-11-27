import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { GlobalAttentionWorkspace } from "../apps/server/src/engine/cognition/v2/attention.ts";
import { ContextServingFacade } from "../apps/server/src/engine/cognition/v2/context.ts";
import {
  CognitiveProjectionStore,
  installCognitionV2,
  digest,
} from "../apps/server/src/engine/cognition/v2/storage.ts";
import { record } from "./fixtures/cognition-v2/record.ts";
const identity = { tenantId: "A", actorId: "alice", owner: "alice", purpose: "chat" as const, policyRevision: "1" };
async function fixture() {
  const db = await createStore();
  await installCognitionV2(db);
  const store = new CognitiveProjectionStore(db);
  await store.apply(record(), "1");
  const context = new ContextServingFacade(store, { authorize: async () => true });
  const attention = new GlobalAttentionWorkspace(context),
    selected = await attention.select(identity, "Dato", 4000);
  const [row] = await db.rawQuery<{
    data: Record<string, unknown> & {
      contextSnapshotId: string;
      algorithmVersion: string;
      selected: Record<string, unknown>[];
    };
  }>("SELECT data FROM cognition_v2_attention WHERE tenant='A' AND id=$1", [selected.id]);
  return { db, context, attention, selected, data: row.data };
}

test("an attention view cannot replace source epistemic state, scores or references", async () => {
  const f = await fixture();
  try {
    for (const patch of [{ epistemic: "verified_fact" }, { score: 999 }, { id: "invented-source" }]) {
      const data = { ...f.data, selected: [{ ...f.data.selected[0], ...patch }] };
      await f.db.rawQuery("UPDATE cognition_v2_attention SET data=$2::jsonb WHERE tenant='A' AND id=$1", [
        f.selected.id,
        JSON.stringify(data),
      ]);
      assert.equal(await f.attention.read(identity, f.selected.id), null);
    }
  } finally {
    await f.db.close();
  }
});

test("recomputing a view ID does not authorize fabricated selected data", async () => {
  const f = await fixture();
  try {
    const snapshot = await f.context.readSnapshot(identity, f.data.contextSnapshotId);
    assert.ok(snapshot);
    const selected = [{ ...f.data.selected[0], score: 999 }];
    const id = digest({
      identity,
      algorithmVersion: f.data.algorithmVersion,
      contextDigest: snapshot.digest,
      selected,
    });
    await f.db.rawQuery("INSERT INTO cognition_v2_attention(tenant,id,actor,data) VALUES('A',$1,'alice',$2::jsonb)", [
      id,
      JSON.stringify({ ...f.data, selected }),
    ]);
    assert.equal(await f.attention.read(identity, id), null);
  } finally {
    await f.db.close();
  }
});

test("valid attention is rederived without returning private query text; malformed metadata fails closed", async () => {
  const f = await fixture();
  try {
    const valid = await f.attention.read(identity, f.selected.id);
    assert.ok(valid);
    assert.deepEqual(valid.selected, f.selected.selected);
    assert.ok(!("query" in valid));
    for (const patch of [
      { selected: "malformed" },
      { sourceWatermark: "999" },
      { expiresAt: "2000-01-01T00:00:00Z" },
    ]) {
      await f.db.rawQuery("UPDATE cognition_v2_attention SET data=$2::jsonb WHERE tenant='A' AND id=$1", [
        f.selected.id,
        JSON.stringify({ ...f.data, ...patch }),
      ]);
      assert.equal(await f.attention.read(identity, f.selected.id), null);
    }
  } finally {
    await f.db.close();
  }
});
