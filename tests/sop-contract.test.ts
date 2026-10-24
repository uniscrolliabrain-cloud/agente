import assert from "node:assert/strict";
import { test } from "node:test";
import { createTaskSchema } from "../packages/domain/src/agent.ts";
import { sopSchema } from "../packages/domain/src/sop.ts";

test("SOP contract accepts a first-class sop task and rejects duplicate step ids", () => {
  assert.equal(createTaskSchema.parse({ prompt: "run", kind: "sop", input: { sopId: "demo" } }).kind, "sop");
  assert.throws(() => sopSchema.parse({
    id: "dup", name: "Duplicate", steps: [
      { id: "1", title: "A", tool: "ask_user" },
      { id: "1", title: "B", tool: "ask_user" },
    ],
  }));
});
