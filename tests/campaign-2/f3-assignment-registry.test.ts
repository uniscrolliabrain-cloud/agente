// F3_ASSIGNMENT_REGISTRY_TEST_V1
import { describe, expect, it } from "vitest";
import { defaultAssignmentRegistry } from "../../apps/server/src/engine/assignments/registry.ts";

describe("AssignmentRegistry", () => {
  it("resuelve los 5 kinds", () => {
    const r = defaultAssignmentRegistry();
    expect([...r.kinds()].sort()).toEqual(["approval", "goal", "monitor", "sop", "task"]);
    for (const k of r.kinds()) {
      expect(r.get(k).kind).toBe(k);
    }
  });
});
