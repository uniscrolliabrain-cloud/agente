import assert from "node:assert/strict";
import { test } from "node:test";
import { attentionOverlap, matchScore } from "../apps/server/src/kernel/graph/attention.ts";
import { consolidate } from "../apps/server/src/kernel/graph/consolidate.ts";
import { thoughtSchema, type Thought } from "../apps/server/src/kernel/graph/thought.ts";
import { Meta } from "../apps/server/src/kernel/observers/meta.ts";
import { readyResult } from "../apps/server/src/kernel/graph/progress.ts";
import { Promoter } from "../apps/server/src/kernel/graph/promote.ts";
import type { Kernel } from "../apps/server/src/kernel/kernel.ts";

function thought(id: string, content = "same", actor = "fast"): Thought {
  return thoughtSchema.parse({
    id,
    tenantId: "a",
    owner: "owner",
    turnId: "turn",
    role: "observation",
    actor: { kind: "fast-llm", id: actor },
    content,
    attention: {
      id: "att-" + id,
      author: "fast",
      primary: "entity:acme",
      secondary: [],
      query: "acme",
      matched: [{ node: "entity:acme", weight: 0.9, reason: "mentioned" }],
      ignored: [],
      intent: "respond",
      confidence: 0.9,
      scope: "turn",
      timestamp: "2026-11-26T00:00:00Z",
      metadata: {},
    },
    provenance: { source: "test", timestamp: "2026-11-26T00:00:00Z" },
  });
}

test("attention overlap aggregates duplicate aliases and is invariant under permutations", () => {
  const a = thought("a").attention,
    b = thought("b").attention;
  a.matched = [
    { ...a.matched[0], node: "ACME", weight: 0.2 },
    { ...a.matched[0], weight: 0.8 },
  ];
  b.matched = [{ ...b.matched[0], weight: 1 }];
  assert.equal(attentionOverlap(a, b), 1);
  assert.equal(attentionOverlap({ ...a, matched: [...a.matched].reverse() }, b), 1);
  assert.equal(matchScore(a, "entity:acme"), 1);
});

test("ambiguous untyped alias cannot bridge different node kinds", () => {
  const a = thought("a").attention,
    b = thought("b").attention;
  a.matched = [{ ...a.matched[0], node: "acme", weight: 1 }];
  b.matched = [
    { ...b.matched[0], node: "entity:acme", weight: 0.5 },
    { ...b.matched[0], node: "task:acme", weight: 0.5 },
  ];
  assert.equal(attentionOverlap(a, b), 0);
});

test("consolidation preserves separate actor, owner and turn identities", () => {
  const a = thought("a"),
    b = thought("b", "same", "other");
  assert.equal(consolidate([a, b]).duplicateGroups.length, 0);
  assert.equal(consolidate([a, { ...thought("c"), owner: "other" }]).duplicateGroups.length, 0);
  assert.equal(consolidate([a, { ...thought("d"), turnId: "other" }]).duplicateGroups.length, 0);
  assert.equal(consolidate([a, thought("e")]).duplicateGroups.length, 1);
});

test("Meta respects configured fast idle duration, consumed hints and malformed progress", () => {
  const now = "2026-11-26T00:01:00Z";
  const meta = new Meta({ fastIdleMs: 10_000 });
  const progress = readyResult("ready");
  progress.timestamp = "2026-11-26T00:00:50Z";
  assert.equal(
    meta.evaluateWithProgress({ progress: [progress], now, lastFastActivityAt: "2026-11-26T00:00:55Z" })[0].rule,
    "nothing_to_report",
  );
  const input = { progress: [progress], now, thoughtIdByProgressIndex: { 0: "thought-ready" } };
  assert.equal(meta.evaluateWithProgress(input)[0].rule, "slow_ready_fast_idle");
  meta.consumeHint("thought-ready");
  assert.equal(meta.evaluateWithProgress(input)[0].rule, "nothing_to_report");
  const malformed = thought("bad");
  malformed.attention.metadata.progress = { kind: "ready", message: 42 };
  assert.doesNotThrow(() => meta.evaluate({ thoughts: [malformed], now }));
});

test("Promoter dedupe controls actual destinations and writes without truncating identity", async () => {
  const thoughts = [
    thought("a"),
    thought("b"),
    thought("c", "x".repeat(501) + "one"),
    thought("d", "x".repeat(501) + "two"),
  ];
  const writes: string[] = [];
  const kernel = { thoughtsOf: async () => thoughts, deps: { audit: { append: async () => {} } } } as unknown as Kernel;
  const result = await new Promoter({
    kernel,
    memory: {
      remember: async (_owner, text) => {
        writes.push(text);
      },
    },
  }).promote({ tenantId: "a", owner: "owner", actorId: "user", role: "user", requestId: "synthetic-request" }, "turn");
  assert.ok(result);
  assert.deepEqual(result.survivors, ["a", "c", "d"]);
  assert.deepEqual(result.destinations.memory, ["a", "c", "d"]);
  assert.ok(result.discarded.includes("b"));
  assert.equal(writes.length, 3);
});

test("Meta does not treat empty attention or different turns as a focus conflict", () => {
  const meta = new Meta();
  const empty = thought("empty");
  empty.attention.matched = [];
  assert.equal(meta.detectAttentionConflict([empty, thought("focused")]), false);
  const other = thought("other");
  other.turnId = "another-turn";
  other.attention.matched = [{ ...other.attention.matched[0], node: "entity:different" }];
  assert.equal(meta.detectAttentionConflict([thought("first"), other]), false);
});
