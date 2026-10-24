// F6_AUDIT_TRAIL_DENIED_TEST_V1
import { describe, expect, it } from "vitest";
import { AuditTrail } from "../../apps/server/src/engine/audit-trail/service.ts";

function fakeAudit(recorded: unknown[]) {
  return { append: async (e: unknown) => { recorded.push(e); } } as never;
}

describe("AuditTrail", () => {
  it("registra denegacion de campo restricted", async () => {
    const recorded: unknown[] = [];
    const trail = new AuditTrail(fakeAudit(recorded));
    await trail.recordDenied({ actorId: "u1", action: "read", resource: "task", field: "outcome", classification: "restricted", allowed: false, timestamp: "2026-01-01" });
    expect(recorded.length).toBe(1);
    expect((recorded[0] as { action: string }).action).toBe("audit.read.denied");
  });
});
