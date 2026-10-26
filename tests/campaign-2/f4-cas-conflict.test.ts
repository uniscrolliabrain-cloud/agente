// F4_CAS_CONFLICT_TEST_V1
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { conflictDiffSchema, conflictVersionSchema } from "../../packages/domain/src/conflict.ts";

describe("F4 conflict schemas", () => {
  it("conflictDiffSchema valida diff por campo", () => {
    const d = conflictDiffSchema.parse({ name: { before: "a", after: "b" } });
    assert.equal(d.name.before, "a");
  });
  it("conflictVersionSchema valida current/expected", () => {
    const v = conflictVersionSchema.parse({ current: 2, expected: 1 });
    assert.equal(v.current, 2);
  });
});
