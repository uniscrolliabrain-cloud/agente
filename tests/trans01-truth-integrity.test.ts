import assert from "node:assert/strict";
import { test } from "node:test";
import { TruthResolver } from "../apps/server/src/engine/business/truth-resolver.ts";
const current = {
  field: "status",
  value: "current",
  source: "current",
  observedAt: new Date().toISOString(),
  reliability: 0.9,
  confidence: 0.9,
  kind: "fact" as const,
};

test("future observation cannot amplify reliability above the same current-date scale", () => {
  const future = {
    ...current,
    value: "future",
    source: "future",
    observedAt: "2099-01-01T00:00:00Z",
    reliability: 0.01,
  };
  assert.equal(new TruthResolver().resolve("status", [current, future]).value, "current");
});

test("resolving one field cannot relabel a candidate from another field", () => {
  assert.throws(
    () =>
      new TruthResolver().resolve("status", [
        current,
        { ...current, field: "another", value: "unrelated", reliability: 1, confidence: 1 },
      ]),
    /TRUTH_FIELD_MISMATCH/,
  );
});

test("malformed dates and nonfinite confidence cannot enter scoring", () => {
  for (const patch of [{ observedAt: "invalid" }, { confidence: NaN }, { reliability: Infinity }])
    assert.throws(() => new TruthResolver().resolve("status", [{ ...current, ...patch }, current]));
});

test("one captured clock determines freshness and resolvedAt without changing knowledge kind", () => {
  let calls = 0;
  const now = Date.parse("2026-11-27T00:00:00Z");
  const result = new TruthResolver(() => {
    calls++;
    return now;
  }).resolve("status", [{ ...current, kind: "inference" }]);
  assert.equal(calls, 1);
  assert.equal(result.resolvedAt, new Date(now).toISOString());
  assert.equal(result.kind, "inference");
  for (const invalid of [NaN, Infinity, 1e20])
    assert.throws(() => new TruthResolver(() => invalid).resolve("status", [current]), /TRUTH_CLOCK_INVALID/);
});
