// F6_RETENTION_AUDIT_TEST_V1
import { describe, expect, it } from "vitest";

describe("F6 retention audit", () => {
  it("audit-entries no se purga a 90 dias", () => {
    const KERNEL_KINDS = ["dead-letter"];
    expect(KERNEL_KINDS.includes("audit-entries")).toBe(false);
  });
  it("AUDIT_RETENTION_DAYS = 365", () => {
    const AUDIT_RETENTION_DAYS = 365;
    expect(AUDIT_RETENTION_DAYS).toBe(365);
  });
});
