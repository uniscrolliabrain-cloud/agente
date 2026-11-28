import assert from "node:assert/strict";
import { test } from "node:test";
import { MetricsRegistry } from "../apps/server/src/metrics/registry.ts";

test("series identities cannot collide through label text and rendering escapes reserved characters", () => {
  const metrics = new MetricsRegistry();
  metrics.counter("sample_total", "local");
  metrics.inc("sample_total", { a: 'x",b="y' });
  metrics.inc("sample_total", { a: "x", b: "y" });
  metrics.inc("sample_total", { a: 'line\nquote"slash\\' });
  const samples = metrics
    .render()
    .split("\n")
    .filter((line) => line.startsWith("sample_total{"));
  assert.equal(samples.length, 3);
  assert.ok(samples.every((line) => !line.includes("\n")));
  assert.ok(samples.some((line) => line.includes('\\nquote\\"slash\\\\')));
});

test("mutating caller labels never changes a previously registered series", () => {
  const metrics = new MetricsRegistry();
  metrics.counter("sample_total", "local");
  const labels = { scope: "original" };
  metrics.inc("sample_total", labels);
  labels.scope = "changed";
  assert.match(metrics.render(), /scope="original"/);
  assert.doesNotMatch(metrics.render(), /scope="changed"/);
});

test("series bounds preserve existing counters while rejecting new cardinality", () => {
  const metrics = new MetricsRegistry(2);
  metrics.counter("sample_total", "local");
  metrics.inc("sample_total", { scope: "one" });
  metrics.inc("sample_total", { scope: "two" });
  metrics.inc("sample_total", { scope: "three" });
  metrics.inc("sample_total", { scope: "one" });
  assert.match(metrics.render(), /sample_total\{scope="one"\} 2/);
  assert.doesNotMatch(metrics.render(), /scope="three"/);
  assert.match(metrics.render(), /agente_metrics_dropped_series_total 1/);
});

test("invalid observations, buckets and reserved histogram labels are rejected", () => {
  const metrics = new MetricsRegistry();
  assert.throws(() => metrics.counter("invalid\nname", "local"));
  assert.throws(() => metrics.histogram("invalid", "local", [1, Infinity]));
  assert.throws(() => metrics.histogram("duplicate", "local", [1, 1]));
  metrics.counter("sample_total", "local");
  metrics.histogram("latency", "local");
  assert.throws(() => metrics.inc("sample_total", {}, -1));
  assert.throws(() => metrics.observe("latency", Infinity));
  assert.throws(() => metrics.observe("latency", 1, { le: "1" }));
});
