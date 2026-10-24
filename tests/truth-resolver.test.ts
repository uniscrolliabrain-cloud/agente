// TRUTH_RESOLVER_TEST_V1
import assert from "node:assert/strict";
import { test } from "node:test";

test("resolver elige la fuente más fiable y detecta conflictos", async () => {
  const { TruthResolver } = await import("../apps/server/src/engine/business/truth-resolver.ts");
  const r = new TruthResolver();
  const result = r.resolve("status", [
    { field: "status", value: "active", source: "crm", observedAt: new Date().toISOString(), reliability: 0.9, confidence: 0.9, kind: "fact" },
    { field: "status", value: "overdue", source: "erp", observedAt: new Date().toISOString(), reliability: 0.7, confidence: 0.7, kind: "fact" },
  ]);
  assert.equal(result.value, "active");
  assert.equal(result.wasConflict, true);
  assert.equal(result.conflicts.length, 1);
});