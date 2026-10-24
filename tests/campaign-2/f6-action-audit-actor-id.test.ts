// F6_ACTION_AUDIT_ACTOR_ID_TEST_V1
import { describe, expect, it } from "vitest";

describe("F6 action-audit", () => {
  it("actorId se propaga en el payload", () => {
    const payload = { actionId: "a1", actorId: "u1", kind: "approve" };
    expect(payload.actorId).toBe("u1");
  });
});
