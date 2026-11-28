import assert from "node:assert/strict";
import { test } from "node:test";
import { Hono } from "hono";
import { metricsRoutes } from "../apps/server/src/metrics-exporter.ts";
import { MetricsRegistry } from "../apps/server/src/metrics/registry.ts";

test("external metrics aggregate counters and histogram buckets without private labels or arbitrary gauges", () => {
  const metrics = new MetricsRegistry();
  metrics.counter("agente_http_requests_total", "fixture");
  metrics.inc("agente_http_requests_total", { tenant: "private-tenant-a", owner: "private-owner" }, 2);
  metrics.inc("agente_http_requests_total", { tenant: "private-tenant-b" }, 3);
  metrics.histogram("agente_http_request_duration_ms", "fixture", [5, 50]);
  metrics.observe("agente_http_request_duration_ms", 3, { tenant: "private-tenant-a" });
  metrics.observe("agente_http_request_duration_ms", 30, { tenant: "private-tenant-b" });
  metrics.gauge("unreviewed_private_gauge", "private-help");
  metrics.set("unreviewed_private_gauge", 123, { owner: "private-owner" });
  const output = metrics.renderAggregate();
  assert.match(output, /^agente_http_requests_total 5$/m);
  assert.match(output, /^agente_http_request_duration_ms_bucket\{le="5"\} 1$/m);
  assert.match(output, /^agente_http_request_duration_ms_bucket\{le="50"\} 2$/m);
  assert.match(output, /^agente_http_request_duration_ms_sum 33$/m);
  assert.doesNotMatch(output, /private-|tenant=|owner=|unreviewed/);
});

test("shared metrics require a dedicated token even for an admin and reject tenant query scope", async () => {
  const savedShared = process.env.MULTI_TENANT_SHARED,
    savedToken = process.env.METRICS_TOKEN;
  process.env.MULTI_TENANT_SHARED = "true";
  delete process.env.METRICS_TOKEN;
  try {
    const app = new Hono<{ Variables: { owner: string } }>();
    app.use("*", async (c, next) => {
      c.set("owner", "admin-a");
      await next();
    });
    app.route(
      "/metrics",
      metricsRoutes(
        { worker: { running: true } } as Parameters<typeof metricsRoutes>[0],
        { getById: async () => ({ role: "admin" }) } as unknown as Parameters<typeof metricsRoutes>[1],
      ),
    );
    app.onError((error, c) => c.json({ error: "denied" }, (error as { status?: 401 | 400 }).status ?? 500));
    assert.equal((await app.request("/metrics")).status, 401);
    process.env.METRICS_TOKEN = "synthetic-metrics-token";
    assert.equal((await app.request("/metrics", { headers: { "x-metrics-token": "wrong" } })).status, 401);
    assert.equal(
      (await app.request("/metrics?tenant=other", { headers: { "x-metrics-token": "synthetic-metrics-token" } }))
        .status,
      400,
    );
    assert.equal(
      (await app.request("/metrics", { headers: { "x-metrics-token": "synthetic-metrics-token" } })).status,
      200,
    );
  } finally {
    if (savedShared === undefined) delete process.env.MULTI_TENANT_SHARED;
    else process.env.MULTI_TENANT_SHARED = savedShared;
    if (savedToken === undefined) delete process.env.METRICS_TOKEN;
    else process.env.METRICS_TOKEN = savedToken;
  }
});

test("admin fallback requires an explicit local sample profile", async () => {
  const saved = {
    shared: process.env.MULTI_TENANT_SHARED,
    token: process.env.METRICS_TOKEN,
    local: process.env.METRICS_ALLOW_LOCAL_ADMIN,
  };
  delete process.env.MULTI_TENANT_SHARED;
  delete process.env.METRICS_TOKEN;
  delete process.env.METRICS_ALLOW_LOCAL_ADMIN;
  try {
    const service = { worker: { running: true }, config: { mode: "sample" } };
    const app = new Hono<{ Variables: { owner: string } }>();
    app.use("*", async (c, next) => {
      c.set("owner", "fixture-admin");
      await next();
    });
    app.route(
      "/metrics",
      metricsRoutes(
        service as Parameters<typeof metricsRoutes>[0],
        { getById: async () => ({ role: "admin" }) } as unknown as Parameters<typeof metricsRoutes>[1],
      ),
    );
    app.onError((_error, c) => c.text("denied", 401));
    assert.equal((await app.request("/metrics")).status, 401);
    process.env.METRICS_ALLOW_LOCAL_ADMIN = "true";
    assert.equal((await app.request("/metrics")).status, 200);
    service.config.mode = "live";
    assert.equal((await app.request("/metrics")).status, 401);
  } finally {
    for (const [key, value] of [
      ["MULTI_TENANT_SHARED", saved.shared],
      ["METRICS_TOKEN", saved.token],
      ["METRICS_ALLOW_LOCAL_ADMIN", saved.local],
    ]) {
      if (value === undefined) delete process.env[key!];
      else process.env[key!] = value;
    }
  }
});
