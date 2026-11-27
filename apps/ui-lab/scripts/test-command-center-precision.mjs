import test from "node:test";
import assert from "node:assert/strict";
import { presentationDeadlines } from "../src/command-center-editorial/presentation-diff.ts";

const snap = (tenantId, ...entries) => ({tenantId, values: new Map(entries)});
const original = snap("a", ["kpi", "1"], ["task", "running"]);
const changed = snap("a", ["kpi", "2"], ["task", "running"]);
test("identical refresh preserves original deadline without extending it", () => {
  const first = presentationDeadlines(original, changed, new Map(), 100, 6000);
  assert.deepEqual([...first], [["kpi", 6100]]);
  assert.deepEqual([...presentationDeadlines(changed, changed, first, 400, 6000)], [["kpi", 6100]]);
});
test("independent changes keep independent deadlines", () => {
  const first = presentationDeadlines(original, changed, new Map(), 100, 6000);
  const next = snap("a", ["kpi", "2"], ["task", "succeeded"]);
  assert.deepEqual([...presentationDeadlines(changed, next, first, 500, 6000)], [["kpi",6100],["task",6500]]);
});
test("expiration, removed keys, tenant and error clear stale marks", () => {
  const first = presentationDeadlines(original, changed, new Map(), 100, 6000);
  assert.equal(presentationDeadlines(changed,changed,first,6100,6000).size,0);
  assert.equal(presentationDeadlines(changed,snap("a",["task","running"]),first,200,6000).size,0);
  assert.equal(presentationDeadlines(changed,snap("b",["kpi","2"]),first,200,6000).size,0);
  assert.equal(presentationDeadlines(changed,null,first,200,6000).size,0);
});
