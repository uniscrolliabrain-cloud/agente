// B-07 - Meta.evaluate produce hints que llegan al prompt.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Meta } from "../../apps/server/src/kernel/observers/meta.ts";

test("B-07: Meta produce hint slow_failed_urgent", () => {
  const meta = new Meta({ longNoOutputMs: 1000 });
  const thought = {
    id: "t1",
    attention: { metadata: { progress: { kind: "failed", message: "slow fallo", timestamp: new Date().toISOString(), step: 0, totalSteps: 0 } } },
  } as never;
  const hints = meta.evaluate({ thoughts: [thought], now: new Date().toISOString() });
  assert.ok(hints.some((h) => h.rule === "slow_failed_urgent"));
  assert.ok(hints.some((h) => h.urgency === "high"));
});

test("B-07: Meta produce nothing_to_report sin progress", () => {
  const meta = new Meta();
  const thought = { id: "t1", attention: { metadata: {} } } as never;
  const hints = meta.evaluate({ thoughts: [thought], now: new Date().toISOString() });
  assert.equal(hints[0].rule, "nothing_to_report");
});