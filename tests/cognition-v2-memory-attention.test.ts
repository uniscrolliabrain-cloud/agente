import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../apps/server/src/db.ts";
import { installCognitionV2, CognitiveProjectionStore, DurableEventSink } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { ContextServingFacade } from "../apps/server/src/engine/cognition/v2/context.ts";
import { FiveMemories } from "../apps/server/src/engine/cognition/v2/memory.ts";
import { GlobalAttentionWorkspace } from "../apps/server/src/engine/cognition/v2/attention.ts";
import { CognitiveProjector } from "../apps/server/src/engine/cognition/v2/projector.ts";
import { ChromaticOntologyRegistry } from "../apps/server/src/engine/cognition/chromatic/ontology-registry.ts";
import { record } from "./fixtures/cognition-v2/record.ts";
const ctx = { tenantId: "A", actorId: "alice", owner: "alice", policyRevision: "1", purpose: "chat" as const };
test("C04 functional five-memory pipeline, TTL and C06 attention persistence/revocation", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db); const store = new CognitiveProjectionStore(db); await store.apply(record(), "1");
    let now = Date.now(); const context = new ContextServingFacade(store, { authorize: async () => true }, () => now);
    const sink = new DurableEventSink(db, db, new Set(["A"])); const projector = new CognitiveProjector(store);
    await sink.write({ id: "runtime-event", tenantId: "A", owner: "alice", type: "sop.step_completed", schemaVersion: "1.0",
      emittedAt: new Date(now).toISOString(), source: { kind: "sop", id: "approved-sop" }, payload: { sopId: "sop", stepId: "step" } });
    const memories = new FiveMemories(context, sink, () => now);
    const episode = await memories.fromEvent(ctx, "runtime-event", "episodic");
    await memories.fromEvent(ctx, "runtime-event", "procedural");
    await memories.semanticFromCard(ctx, "card-1");
    await memories.working(ctx, "Foco temporal", 1000);
    await projector.tick("A");
    await memories.autobiographical(ctx, [episode.id]); await projector.tick("A");
    for (const kind of ["episodic", "semantic", "procedural", "autobiographical", "working"] as const) {
      assert.equal((await memories.recall(ctx, kind)).hits.length, 1, kind);
      assert.equal((await memories.recall({ ...ctx, actorId: "bob" }, kind)).hits.length, 0);
    }
    const semantic = (await memories.recall(ctx, "semantic")).hits[0]; assert.equal(semantic.epistemic, "hypothesis");
    const attention = new GlobalAttentionWorkspace(context); const selection = await attention.select(ctx, "temporal", 8000);
    assert.ok(selection.selected.length); assert.ok(await new GlobalAttentionWorkspace(context).read(ctx, selection.id));
    now += 2000; assert.equal((await memories.recall(ctx, "working")).hits.length, 0);
    await store.revoke("A", "runtime-event");
    assert.equal((await memories.recall(ctx, "episodic")).hits.length, 0);
    assert.equal((await memories.recall(ctx, "autobiographical")).hits.length, 0);
    assert.equal(await attention.read(ctx, selection.id), null);
    const ontology = new ChromaticOntologyRegistry(db, { verify: async () => false });
    await assert.rejects(ontology.runtime("undefined", "1"), /CHROMATIC_BLOCKED_DECISION/);
    await assert.rejects(ontology.register({ schemaVersion: "2.0", ontologyId: "invented", version: "1", status: "approved", axes: [], dimensions: [], approvalReceiptId: "fake" }), /ONTOLOGY_APPROVAL_REQUIRED/);
  } finally { await db.close(); }
});
