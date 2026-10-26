// F4_RECONCILE_TEST_V1
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { conflictResolutionSchema } from "../../packages/domain/src/conflict.ts";

describe("F4 reconcile", () => {
  it("acepta kind client-retry", () => {
    const r = conflictResolutionSchema.parse({ kind: "client-retry" });
    assert.equal(r.kind, "client-retry");
  });
  it("acepta kind human-review con note", () => {
    const r = conflictResolutionSchema.parse({ kind: "human-review", note: "revisado" });
    assert.equal(r.note, "revisado");
  });
});
