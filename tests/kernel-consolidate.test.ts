// TESTS_KERNEL_CONSOLIDATE_V1 — consolidate detecta duplicados y negaciones.
// Ver: docs/audits/09-kernel-cognitivo/miniaudit.md.

import assert from "node:assert/strict";
import { test } from "node:test";
import { consolidate } from "../apps/server/src/kernel/graph/consolidate.ts";
import { thoughtSchema } from "../apps/server/src/kernel/graph/thought.ts";

function makeThought(id: string, content: string, role = "response" as const) {
  return thoughtSchema.parse({
    id, tenantId: "default", turnId: "turn1", owner: "owner",
    actor: { kind: "fast-llm", id: "fast" }, role, content,
    attention: {
      id: `att-${id}`, author: "fast", primary: "x", secondary: [], query: "x",
      matched: [], ignored: [], intent: "respond", confidence: 0.9,
      scope: "turn", timestamp: new Date().toISOString(), metadata: {},
    },
    provenance: { source: "test", timestamp: new Date().toISOString() },
  });
}

test("consolidate detecta duplicados por contenido", () => {
  const thoughts = [
    makeThought("a", "mismo contenido"),
    makeThought("b", "mismo contenido"),
  ];
  const result = consolidate(thoughts);
  assert.equal(result.duplicateGroups.length, 1);
  assert.equal(result.duplicateGroups[0].thoughtIds.length, 2);
});

test("consolidate detecta negación textual 'no X'", () => {
  const thoughts = [
    makeThought("a", "cliente activo"),
    makeThought("b", "no cliente activo"),
  ];
  const result = consolidate(thoughts);
  assert.equal(result.textualNegations.length, 1);
});

test("consolidate agrupa por tenant", () => {
  const thoughts = [
    { ...makeThought("a", "contenido"), tenantId: "tenant-1" },
    { ...makeThought("b", "contenido"), tenantId: "tenant-2" },
  ];
  const result = consolidate(thoughts);
  // Mismo contenido pero distinto tenant = no duplicado.
  assert.equal(result.duplicateGroups.length, 0);
  assert.equal(result.tenants.length, 2);
});

test("consolidate sin contenido no rompe", () => {
  const result = consolidate([]);
  assert.equal(result.duplicateGroups.length, 0);
  assert.equal(result.textualNegations.length, 0);
});