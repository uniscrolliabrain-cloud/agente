// F3_ASSIGNMENT_REGISTRY_TEST_V1
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultAssignmentRegistry } from "../../apps/server/src/engine/assignments/registry.ts";

describe("AssignmentRegistry", () => {
  it("resuelve los 5 kinds", () => {
    const r = defaultAssignmentRegistry();
    assert.deepEqual([...r.kinds()].sort(), ["approval", "goal", "monitor", "sop", "task"]);
    for (const k of r.kinds()) {
      assert.equal(r.get(k).kind, k);
    }
  });
});
