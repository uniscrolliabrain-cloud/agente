// TESTS_KERNEL_RULES_ATTENTION_V1 — Rules.classify usa isFocusedOn.
// Ver: docs/audits/09-kernel-cognitivo/roadmap.md §8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { RULES, classify } from "../apps/server/src/kernel/graph/rules.ts";
import { thoughtSchema } from "../apps/server/src/kernel/graph/thought.ts";

function makeThought(overrides: Record<string, unknown> = {}) {
  return thoughtSchema.parse({
    id: "t1",
    tenantId: "default",
    turnId: "turn1",
    owner: "owner",
    actor: { kind: "fast-llm", id: "fast" },
    role: "response",
    content: "respuesta con foco",
    attention: {
      id: "att-1",
      author: "fast",
      primary: "cliente acme",
      secondary: [],
      query: "acme",
      matched: [{ node: "cliente acme", weight: 0.85, reason: "mentioned" }],
      ignored: [],
      intent: "respond",
      confidence: 0.9,
      scope: "turn",
      timestamp: new Date().toISOString(),
      metadata: {},
    },
    provenance: { source: "test", timestamp: new Date().toISOString() },
    ...overrides,
  });
}

test("existe la regla survive_high_attention_focus", () => {
  const rule = RULES.find((r) => r.id === "survive_high_attention_focus");
  assert.ok(rule, "la regla de atención debe existir");
});

test("regla de atención matchea thought con isFocusedOn >= 0.7", () => {
  const thought = makeThought();
  const rule = RULES.find((r) => r.id === "survive_high_attention_focus")!;
  assert.equal(rule.matches(thought), true);
});

test("regla de atención NO matchea con foco bajo", () => {
  const thought = makeThought({
    attention: {
      id: "att-2", author: "fast", primary: "otro",
      secondary: [], query: "otro",
      matched: [{ node: "otro", weight: 0.4, reason: "mentioned" }],
      ignored: [], intent: "respond", confidence: 0.9, scope: "turn",
      timestamp: new Date().toISOString(), metadata: {},
    },
  });
  const rule = RULES.find((r) => r.id === "survive_high_attention_focus")!;
  assert.equal(rule.matches(thought), false);
});

test("classify devuelve survive_high_attention_focus para foco alto", () => {
  const thought = makeThought();
  const outcome = classify(thought);
  assert.ok(outcome);
  assert.equal(outcome.survives, true);
  assert.match(outcome.rule.id, /attention|actionable/);
});