// TESTS_ALERTS_V1 Ã¢â‚¬â€ el motor de alertas respeta cooldown y dispara handlers.
// Ver: docs/audits/02-observabilidad/roadmap.md Ã‚Â§8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { AlertService, type AlertHandler } from "../apps/server/src/alerts/service.ts";

class CountingHandler implements AlertHandler {
  fired: string[] = [];
  async fire(alert: { id: string }): Promise<void> {
    this.fired.push(alert.id);
  }
}

test("alerta que cumple condiciÃƒÂ³n dispara", async () => {
  const handler = new CountingHandler();
  const svc = new AlertService([handler]);
  let triggered = true;
  svc.register({
    id: "test-alert",
    description: "test",
    severity: "warning",
    cooldownSec: 1,
    condition: () => triggered,
  });
  const fired = await svc.evaluate();
  assert.equal(fired.length, 1);
  assert.equal(handler.fired.length, 1);
});

test("cooldown evita disparos consecutivos", async () => {
  const handler = new CountingHandler();
  const svc = new AlertService([handler]);
  svc.register({
    id: "test-cooldown",
    description: "test",
    severity: "warning",
    cooldownSec: 3600,
    condition: () => true,
  });
  await svc.evaluate();
  await svc.evaluate();
  assert.equal(handler.fired.length, 1, "cooldown de 1h debe impedir el segundo");
});

test("condiciÃƒÂ³n que lanza no rompe el motor", async () => {
  const handler = new CountingHandler();
  const svc = new AlertService([handler]);
  svc.register({
    id: "test-throw",
    description: "test",
    severity: "warning",
    cooldownSec: 1,
    condition: () => {
      throw new Error("boom");
    },
  });
  const fired = await svc.evaluate();
  assert.equal(fired.length, 0);
});

test("buildAlertDefinitions devuelve las 5 alertas base", async () => {
  const { buildAlertDefinitions } = await import(
    "../apps/server/src/alerts/definitions.ts"
  );
  const defs = buildAlertDefinitions({
    metricsSnapshot: () => ({
      http5xx: 0,
      httpTotal: 100,
      taskFailuresLastHour: 0,
      tenantQuotaExceeded: 0,
      workerRunning: true,
      httpLatencyP99Ms: 0,
      circuitOpenCount: 0,
      deadLetterCount: 0,
      outcomeUnknownCount: 0,
    }),
  });
  assert.equal(defs.length, 8);
  const ids = defs.map((d) => d.id).sort();
  assert.deepEqual(ids, [
    "circuit_breaker_open",
    "dead_letter_growing",
    "http_5xx_high",
    "http_latency_p99",
    "outcome_unknown_accumulating",
    "tasks_failing_burst",
    "tenant_quota_repeated",
    "worker_down",
  ]); // ALERTS_TEST_8_IDS_V1
});
