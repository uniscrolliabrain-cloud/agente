import assert from "node:assert/strict";
import { test } from "node:test";
import { parseRuntimeViewSpec } from "../packages/domain/src/views.ts"; // FIX_02_REGISTRY_TEST_V1

test("registry: dashboard pasa el schema", () => {
  const spec = parseRuntimeViewSpec({ kind: "dashboard", title: "x", kpis: [] });
  assert.ok(spec);
  assert.equal(spec.kind, "dashboard");
});

test("registry: queue pasa el schema", () => {
  const spec = parseRuntimeViewSpec({ kind: "queue", title: "x", items: [] });
  assert.ok(spec);
  assert.equal(spec.kind, "queue");
});

test("registry: kind no soportado devuelve null", () => {
  const spec = parseRuntimeViewSpec({ kind: "kanban", title: "x" });
  assert.equal(spec, null);
});