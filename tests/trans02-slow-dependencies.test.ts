import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import {
  CognitiveProjectionStore,
  DurableEventSink,
  installCognitionV2,
} from "../apps/server/src/engine/cognition/v2/storage.ts";
import { ContextServingFacade } from "../apps/server/src/engine/cognition/v2/context.ts";
import { SlowCognitionQueue, RulesClassifier } from "../apps/server/src/engine/cognition/v2/slow.ts";
import { record } from "./fixtures/cognition-v2/record.ts";
const identity = { tenantId: "A", owner: "alice", actorId: "alice", purpose: "chat" as const, policyRevision: "1" };

test("an invalid Slow output becomes terminal without saving an invalid reusable output", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const store = new CognitiveProjectionStore(db),
      context = new ContextServingFacade(store, { authorize: async () => true });
    await store.apply(record(), "1");
    let calls = 0;
    const queue = new SlowCognitionQueue(db, new DurableEventSink(db, db, new Set(["A"])), context, {
      infer: async () => {
        calls++;
        return { title: "invalid" };
      },
    });
    const accepted = await queue.enqueue(
      { identity, prompt: "local", evidence: [{ tenantId: "A", kind: "card", id: "card-1", revision: 1 }] },
      "invalid",
    );
    await queue.tick("A");
    const [job] = await db.rawQuery<{ state: string; output: unknown; failure_code: string }>(
      "SELECT state,output,failure_code FROM cognition_v2_slow_jobs WHERE tenant='A' AND id=$1",
      [accepted.id],
    );
    assert.equal(job.state, "failed");
    assert.equal(job.failure_code, "SLOW_INVALID_OUTPUT");
    assert.equal(job.output, null);
    assert.equal(await queue.tick("A"), false);
    assert.equal(calls, 1);
  } finally {
    await db.close();
  }
});

test("a revoked input omitted from citations prevents Slow publication", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const store = new CognitiveProjectionStore(db),
      context = new ContextServingFacade(store, { authorize: async () => true });
    await store.apply(record("A", "alice", "cited"), "1");
    await store.apply(record("A", "alice", "input-only"), "2");
    const cited = { tenantId: "A", kind: "card" as const, id: "cited", revision: 1 };
    const dependencies = [cited, { ...cited, id: "input-only" }];
    const queue = new SlowCognitionQueue(
      db,
      new DurableEventSink(db, db, new Set(["A"])),
      context,
      { infer: async () => ({ title: "Proposal", body: "Hypothesis", epistemic: "hypothesis", evidence: [cited] }) },
      {
        classify: async (body) => {
          await store.revoke("A", "input-only");
          return new RulesClassifier().classify(body);
        },
      },
    );
    let captures = 0;
    queue.capture = async () => {
      captures++;
      return { id: "unexpected" };
    };
    const accepted = await queue.enqueue({ identity, prompt: "local", evidence: dependencies }, "revoke");
    await queue.tick("A");
    const [job] = await db.rawQuery<{ state: string }>(
      "SELECT state FROM cognition_v2_slow_jobs WHERE tenant='A' AND id=$1",
      [accepted.id],
    );
    assert.equal(job.state, "failed");
    assert.equal(captures, 0);
    const events = await db.rawQuery(
      "SELECT event_id FROM cognition_v2_events WHERE tenant='A' AND event->>'type'='cognition.v2.record.proposed'",
    );
    assert.equal(events.length, 0);
  } finally {
    await db.close();
  }
});

test("revocation propagates through inference dependencies independently of citations", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const store = new CognitiveProjectionStore(db),
      context = new ContextServingFacade(store, { authorize: async () => true });
    await store.apply(record("A", "alice", "input-only"), "1");
    await store.apply(
      {
        ...record("A", "alice", "derived"),
        inferenceDependencies: [{ tenantId: "A", kind: "card", id: "input-only", revision: 1 }],
      },
      "2",
    );
    assert.ok(await context.resolve(identity, "derived"));
    await store.revoke("A", "input-only");
    assert.equal(await store.revoked("A", "derived"), true);
    assert.equal(await context.resolve(identity, "derived"), null);
  } finally {
    await db.close();
  }
});
