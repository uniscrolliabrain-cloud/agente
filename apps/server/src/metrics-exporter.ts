// METRICS_EXPORTER_V2 Ã¢â‚¬â€ Prometheus exporter sobre el registry acumulativo.
//
// V1 escaneaba la DB en cada GET /metrics. V2 solo serializa el registry
// que los servicios alimentan.
// Ver: docs/audits/02-observabilidad/miniaudit.md.

import { Hono } from "hono";
import { createHash, timingSafeEqual } from "node:crypto";
import type { AgentService } from "./engine/service.ts";
import type { UserService } from "./users.ts";
import { AppError } from "./errors.ts";
import { globalMetrics } from "./metrics/registry.ts";

export function metricsRoutes(service: AgentService, users: UserService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  // METRICS_RATE_LIMIT_V1
  app.get("/", async (c) => {
    const token = c.req.header("x-metrics-token");
    const expected = process.env.METRICS_TOKEN?.trim();
    const owner = c.get("owner");
    const shared = process.env.MULTI_TENANT_SHARED === "true";
    let authorized = false;
    if (expected && token && token.length <= 1024 && expected.length <= 1024) {
      authorized = timingSafeEqual(createHash("sha256").update(token).digest(), createHash("sha256").update(expected).digest());
    } else if (!expected && !shared && process.env.METRICS_ALLOW_LOCAL_ADMIN === "true" && service.config?.mode === "sample") {
      const user = owner ? await users.getById(owner).catch(() => null) : null;
      authorized = user?.role === "admin";
    }
    if (!authorized) throw new AppError("Unauthorized", 401);
    if (shared && c.req.query("tenant") !== undefined) throw new AppError("Global scrape does not accept tenant filters", 400);

    // METRICS_WORKER_GAUGE_V1 Ã¢â‚¬â€ el worker no cambia en runtime, es un gauge
    // de estado que se setea al vuelo (no escanea DB).
    // WORKER_METRICS_GAUGE_V1
    globalMetrics.set("agente_worker_running", service.worker.running ? 1 : 0);

    // METRICS_EXPORTER_TENANT_V1 — apply the same filter to histograms and derived gauges.
    const tenant = c.req.query("tenant") || undefined;
    const filter = tenant ? { tenant } : undefined;
    // METRICS_P99_EXPOSE_V1
    // METRICS_HTTP_P99_GAUGE_V1
    const p99 = globalMetrics.quantile("agente_http_request_duration_ms", 0.99, filter);
    const latency = p99 === undefined ? "" : [
      "# HELP agente_http_latency_p99_ms HTTP latency p99 in milliseconds",
      "# TYPE agente_http_latency_p99_ms gauge",
      `agente_http_latency_p99_ms ${Number.isFinite(p99) ? p99 : "+Inf"}`,
      "",
    ].join("\n");
    c.header("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    return c.body((expected || shared ? globalMetrics.renderAggregate(filter) : globalMetrics.render(filter)) + latency);
  });

  return app;
}
