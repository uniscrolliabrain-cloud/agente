import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { GlobalAttentionWorkspace } from "../apps/server/src/engine/cognition/v2/attention.ts";
import { ContextServingFacade } from "../apps/server/src/engine/cognition/v2/context.ts";
import { CognitiveProjectionStore, installCognitionV2 } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { record } from "./fixtures/cognition-v2/record.ts";

test("attention orders the same authorized records as prepared context for the same query", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const store = new CognitiveProjectionStore(db);
    const relevant = record("A", "alice", "query-match");
    const other = record("A", "alice", "strong-signals");
    await store.apply({ ...relevant, title: "Conciliación", signals: { ...relevant.signals, relevance: 0 } }, "1");
    await store.apply({ ...other, signals: { ...other.signals, relevance: 1 } }, "2");
    await store.apply({ ...record("B", "alice", "foreign"), title: "Conciliación" }, "1");

    const identity = { tenantId: "A", actorId: "alice", owner: "alice", purpose: "chat" as const, policyRevision: "1" };
    const context = new ContextServingFacade(store, { authorize: async () => true });
    const attention = new GlobalAttentionWorkspace(context);
    const snapshot = await context.prepared(identity, "Conciliación");
    const selection = await attention.select(identity, "Conciliación", 4000);
    assert.deepEqual(snapshot.refs.map(ref => ref.id), ["query-match", "strong-signals"]);
    assert.deepEqual(selection.selected.map(item => item.id), snapshot.refs.map(ref => ref.id));

    await store.revoke("A", "query-match");
    assert.equal(await attention.read(identity, selection.id), null);
    assert.deepEqual((await context.prepared(identity, "Conciliación")).refs.map(ref => ref.id), ["strong-signals"]);
  } finally {
    await db.close();
  }
});
