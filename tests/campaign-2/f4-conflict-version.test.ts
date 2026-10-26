// F4_CONFLICT_VERSION_TEST_V1
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { conflictVersionSchema } from "../../packages/domain/src/conflict.ts";

describe("F4 conflict version", () => {
  it("acepta actorId y at opcionales", () => {
    const v = conflictVersionSchema.parse({ current: 3, expected: 2, actorId: "u1", at: "2026-01-01" });
    assert.equal(v.actorId, "u1");
  });
  it("rechaza current no positivo", () => {
    let threw = false;
    try { conflictVersionSchema.parse({ current: 0, expected: 1 }); } catch { threw = true; }
    assert.equal(threw, true);
  });
});
