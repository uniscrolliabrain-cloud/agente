// F4_RECONCILE_TEST_V1
import { describe, expect, it } from "vitest";
import { conflictResolutionSchema } from "../../packages/domain/src/conflict.ts";

describe("F4 reconcile", () => {
  it("acepta kind client-retry", () => {
    const r = conflictResolutionSchema.parse({ kind: "client-retry" });
    expect(r.kind).toBe("client-retry");
  });
  it("acepta kind human-review con note", () => {
    const r = conflictResolutionSchema.parse({ kind: "human-review", note: "revisado" });
    expect(r.note).toBe("revisado");
  });
});
