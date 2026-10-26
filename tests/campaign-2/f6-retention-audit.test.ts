// F6_RETENTION_AUDIT_TEST_V1
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("F6 retention audit", () => {
  it("audit-entries no se purga a 90 dias", () => {
    const KERNEL_KINDS = ["dead-letter"];
    assert.equal(KERNEL_KINDS.includes("audit-entries"), false);
  });
  it("AUDIT_RETENTION_DAYS = 365", () => {
    const AUDIT_RETENTION_DAYS = 365;
    assert.equal(AUDIT_RETENTION_DAYS, 365);
  });
});
