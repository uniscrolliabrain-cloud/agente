// B-20 - parseCron esta exportado. Test directo sin construir SOPTriggerEvaluator.
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCron } from "../../apps/server/src/engine/sop-triggers.ts";

const at = (iso: string) => new Date(iso);

test("B-20: parseCron every:Nm", () => {
  const m = parseCron("every:7m");
  assert.equal(m(at("2026-09-28T12:14:00Z")), true);
  assert.equal(m(at("2026-09-28T12:15:00Z")), false);
  assert.equal(m(at("2026-09-28T12:21:00Z")), true);
});

test("B-20: parseCron every:Nh", () => {
  const m = parseCron("every:2h");
  assert.equal(m(at("2026-09-28T10:00:00Z")), true);
  assert.equal(m(at("2026-09-28T10:01:00Z")), false);
  assert.equal(m(at("2026-09-28T11:00:00Z")), false);
});

test("B-20: parseCron daily y weekly", () => {
  const d = parseCron("daily:09:00");
  assert.equal(d(at("2026-09-28T09:00:00Z")), true);
  assert.equal(d(at("2026-09-28T09:01:00Z")), false);
  const w = parseCron("weekly:fri:18:00");
  assert.equal(w(at("2026-09-25T18:00:00Z")), true);
  assert.equal(w(at("2026-09-25T18:01:00Z")), false);
});

test("B-20: parseCron rechaza invalidos", () => {
  assert.throws(() => parseCron("every:99m"));
  assert.throws(() => parseCron("hourly"));
});