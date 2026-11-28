import assert from "node:assert/strict";
import { test } from "node:test";
import { Hono } from "hono";
import { metricsRoutes } from "../apps/server/src/metrics-exporter.ts";
import { globalMetrics } from "../apps/server/src/metrics/registry.ts";
import { requestLogger } from "../apps/server/src/middleware/request-logger.ts";

test("HTTP metrics use the registered template and a bounded unmatched label", async () => {
  const app = new Hono();
  app.use("*", requestLogger());
  app.get("/trans04-baseline/:id", (c) => c.text("ok"));

  for (const id of ["fixture-alpha", "fixture-beta"]) {
    assert.equal((await app.request("/trans04-baseline/" + id)).status, 200);
    assert.equal((await app.request("/unregistered/" + id)).status, 404);
  }

  const output = globalMetrics.render();
  assert.match(output, /agente_http_requests_total\{method="GET",path="\/trans04-baseline\/:id",status="200"\} 2/);
  assert.match(output, /http_errors_by_route_total\{method="GET",path="unmatched",status="404"\} 2/);
  assert.doesNotMatch(output, /fixture-alpha|fixture-beta|\/unregistered\//);
});

test("metrics export derives p99 from the requested scope without mutating the registry", async () => {
  const worker = { worker: { running: true } } as Parameters<typeof metricsRoutes>[0];
  const token = process.env.METRICS_TOKEN;
  process.env.METRICS_TOKEN = "fixture-metrics-token";
  try {
    const users = {} as Parameters<typeof metricsRoutes>[1];
    const app = metricsRoutes(worker, users);
    const histogram = "agente_http_request_duration_ms";
    globalMetrics.observe(histogram, 5, { tenant: "fixture-a" });
    globalMetrics.observe(histogram, 500, { tenant: "fixture-b" });
    const scrape = async (query: string) => (await app.request("/" + query, {
      headers: { "x-metrics-token": "fixture-metrics-token" },
    })).text();

    assert.match(await scrape("?tenant=fixture-a"), /^agente_http_latency_p99_ms 5$/m);
    assert.match(await scrape("?tenant=fixture-b"), /^agente_http_latency_p99_ms 500$/m);
    assert.doesNotMatch(await scrape("?tenant=fixture-missing"), /^agente_http_latency_p99_ms /m);
    assert.match(await scrape(""), /^agente_http_latency_p99_ms 500$/m);
    assert.doesNotMatch(globalMetrics.render(), /^agente_http_latency_p99_ms /m);
  } finally {
    if (token === undefined) delete process.env.METRICS_TOKEN;
    else process.env.METRICS_TOKEN = token;
  }
});


test("HTTP metrics use the tenant resolved by authentication after logger entry", async () => {
  const app = new Hono<{ Variables: { ctx: { tenantId: string } } }>();
  app.use("*", requestLogger());
  app.use("*", async (c, next) => {
    c.set("ctx", { tenantId: "verified-trans04" });
    await next();
  });
  app.get("/trans04-auth-scope", c => c.text("ok"));
  await app.request("/trans04-auth-scope", { headers: { "x-tenant-id": "forged-trans04" } });
  const output = globalMetrics.render();
  assert.match(output, /agente_http_requests_total\{method="GET",path="\/trans04-auth-scope",status="200",tenant="verified-trans04"\} 1/);
  assert.doesNotMatch(output, /forged-trans04/);
});
