import assert from "node:assert/strict";
import { test } from "node:test";
import { MetricsRegistry } from "../apps/server/src/metrics/registry.ts";
import { observeKernel, startKernelMetricsSink } from "../apps/server/src/engine/observability/hooks.ts";

test("kernel metrics enqueue a bounded allowlisted observation and deregister", () => {
  const metrics = new MetricsRegistry();
  const sink = startKernelMetricsSink(metrics, 1);
  try {
    const event = {
      stage: "runtime.result" as const,
      status: "unknown" as const,
      durationMs: 15,
      correlationId: "synthetic-private-id",
      capabilityId: "synthetic-private-capability",
      errorClass: "synthetic-private-error",
    };
    observeKernel(event);
    assert.equal(metrics.counterTotal("agente_kernel_observations_total"), 0);
    observeKernel(event);
    sink.flush();
    assert.equal(metrics.counterTotal("agente_kernel_observations_total"), 1);
    assert.equal(metrics.counterTotal("agente_kernel_telemetry_dropped_total"), 1);
    assert.doesNotMatch(metrics.render(), /synthetic-private/);
    sink.stop();
    observeKernel(event);
    sink.flush();
    assert.equal(metrics.counterTotal("agente_kernel_observations_total"), 1);
  } finally {
    sink.stop();
  }
});
