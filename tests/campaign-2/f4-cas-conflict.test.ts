// F4_CAS_CONFLICT_TEST_V1
import { describe, expect, it } from "vitest";
import { conflictDiffSchema, conflictVersionSchema } from "../../packages/domain/src/conflict.ts";

describe("F4 conflict schemas", () => {
  it("conflictDiffSchema valida diff por campo", () => {
    const d = conflictDiffSchema.parse({ name: { before: "a", after: "b" } });
    expect(d.name.before).toBe("a");
  });
  it("conflictVersionSchema valida current/expected", () => {
    const v = conflictVersionSchema.parse({ current: 2, expected: 1 });
    expect(v.current).toBe(2);
  });
});
