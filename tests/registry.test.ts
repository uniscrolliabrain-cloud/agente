import assert from "node:assert/strict";
import { test } from "node:test";
import { parseViewSpec } from "../packages/domain/src/views.ts";

test("registry: dashboard pasa el schema", () => {
  const spec = parseViewSpec({ kind: "dashboard", title: "x", kpis: [] });
  assert.ok(spec);
  assert.equal(spec.kind, "dashboard");
});

test("registry: queue pasa el schema", () => {
  const spec = parseViewSpec({ kind: "queue", title: "x", items: [] });
  assert.ok(spec);
  assert.equal(spec.kind, "queue");
});

test("registry: kind no soportado devuelve null", () => {
  const spec = parseViewSpec({ kind: "kanban", title: "x" });
  assert.equal(spec, null);
});