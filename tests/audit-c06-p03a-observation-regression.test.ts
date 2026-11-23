import assert from "node:assert/strict";
import { test } from "node:test";
import { SlowObservationBridge } from "../apps/server/src/engine/cognition/v2/slow-observation.ts";
import type { CognitiveIdentity, CognitiveRecord } from "../packages/domain/src/cognition-v2.ts";

const identity: CognitiveIdentity = { tenantId: "tenant-a", actorId: "alice", owner: "alice", purpose: "task", policyRevision: "p1" };
const source = { id: "card-1", tenantId: "tenant-a", kind: "card", revision: 3, epistemic: "reported_fact" } as CognitiveRecord;
type ContextPort = ConstructorParameters<typeof SlowObservationBridge>[0];
type QueuePort = ConstructorParameters<typeof SlowObservationBridge>[1];

test("audit: same logical key with different prompts is passed to durable queue as conflict candidate", async () => {
  const seen: Array<{ key: string; prompt: string }> = [];
  const context: ContextPort = {
    async assertAuthorized() {},
    async resolve() { return source; },
  };
  const queue: QueuePort = {
    async enqueue(input, key) {
      seen.push({ key, prompt: input.prompt });
      if (seen.length > 1 && seen[0]!.key === key && seen[0]!.prompt !== input.prompt) throw Error("IDEMPOTENCY_CONFLICT");
      return { id: key, state: "queued" };
    },
  };
  const bridge = new SlowObservationBridge(context, queue);
  const base = { identity, sourceId: source.id, sourceRevision: 3, operationId: "receipt-1", prompt: "Primer análisis" };
  await bridge.observe(base);
  await assert.rejects(bridge.observe({ ...base, prompt: "Otro análisis" }), /IDEMPOTENCY_CONFLICT/);
  assert.equal(seen[0]!.key, seen[1]!.key);
});

test("audit: policy revocation between resolve and enqueue must be rechecked by queue", async () => {
  let allowed = true;
  let queueCalls = 0;
  const context: ContextPort = {
    async assertAuthorized() { if (!allowed) throw Error("DENIED"); },
    async resolve() { allowed = false; return source; },
  };
  const queue: QueuePort = {
    async enqueue() {
      queueCalls++;
      await context.assertAuthorized(identity);
      return { id: "should-not-exist", state: "queued" };
    },
  };
  const bridge = new SlowObservationBridge(context, queue);
  await assert.rejects(bridge.observe({ identity, sourceId: source.id, sourceRevision: 3, operationId: "receipt-1", prompt: "Analiza" }), /DENIED/);
  assert.equal(queueCalls, 1);
});

test("audit: revision and actor change produce distinct keys", async () => {
  const keys: string[] = [];
  const context: ContextPort = {
    async assertAuthorized() {},
    async resolve(_identity, _id, revision) { return { ...source, revision: revision ?? 3 }; },
  };
  const queue: QueuePort = {
    async enqueue(_input, key) { keys.push(key); return { id: key, state: "queued" }; },
  };
  const bridge = new SlowObservationBridge(context, queue);
  const base = { identity, sourceId: source.id, sourceRevision: 3, operationId: "receipt-1", prompt: "Analiza" };
  await bridge.observe(base);
  await bridge.observe({ ...base, sourceRevision: 4 });
  await bridge.observe({ ...base, identity: { ...identity, actorId: "bob", owner: "bob" } });
  assert.equal(new Set(keys).size, 3);
});

test("audit: malformed inputs never reach enqueue", async () => {
  let calls = 0;
  const context: ContextPort = { async assertAuthorized() {}, async resolve() { return source; } };
  const queue: QueuePort = { async enqueue() { calls++; return { id: "x", state: "queued" }; } };
  const bridge = new SlowObservationBridge(context, queue);
  const base = { identity, sourceId: source.id, sourceRevision: 3, operationId: "receipt-1", prompt: "Analiza" };
  for (const input of [
    { ...base, prompt: " ".repeat(4) },
    { ...base, prompt: "x".repeat(4001) },
    { ...base, operationId: " ".repeat(3) },
    { ...base, operationId: "x".repeat(201) },
    { ...base, sourceRevision: Number.MAX_SAFE_INTEGER + 1 },
    { ...base, sourceRevision: 0 },
  ]) await assert.rejects(bridge.observe(input), /SLOW_OBSERVATION_INVALID/);
  assert.equal(calls, 0);
});
