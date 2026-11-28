import assert from "node:assert/strict";
import { test } from "node:test";
import { findSecretPaths, parseVerticalSliceBundle } from "../scripts/lib/vertical-slice-bundle.ts";

test("unscannable deep and cyclic bundles fail closed", () => {
  const deep: Record<string, unknown> = {};
  let node = deep;
  for (let i = 0; i < 12; i++) {
    const child = {};
    node.child = child;
    node = child;
  }
  node.token = "synthetic-private-value";
  assert.ok(findSecretPaths(deep).length);
  assert.equal(parseVerticalSliceBundle(deep).ok, false);
  const cycle: Record<string, unknown> = {};
  cycle.child = cycle;
  assert.ok(findSecretPaths(cycle).length);
  assert.equal(parseVerticalSliceBundle(cycle).ok, false);
});

test("wide bundles and oversized fields fail closed without printing values", () => {
  const wide = Array.from({ length: 10_100 }, () => "safe");
  assert.ok(findSecretPaths(wide).length);
  const privateValue = "synthetic-private-value".repeat(4000);
  const result = parseVerticalSliceBundle({ field: privateValue });
  assert.equal(result.ok, false);
  assert.ok(!JSON.stringify(result).includes(privateValue));
});
