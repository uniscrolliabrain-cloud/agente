// METRICS_EXPORTER_V2 â€” Prometheus exporter sobre el registry acumulativo.
//
// V1 escaneaba la DB en cada GET /metrics. V2 solo serializa el registry
// que los servicios alimentan.
// Ver: docs/audits/02-observabilidad/miniaudit.md.

import { Hono } from "hono";
import type { AgentService } from "./engine/service.ts";
import type { UserService } from "./users.ts";
import { AppError } from "./errors.ts";
import { globalMetrics } from "./metrics/registry.ts";

export function metricsRoutes(service: AgentService, users: UserService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  app.get("/", async (c) => {
    const token = c.req.header("x-metrics-token");
    const expected = process.env.METRICS_TOKEN?.trim();
    const owner = c.get("owner");
    const user = owner ? await users.getById(owner).catch(() => null) : null;
    const authorized = expected ? token === expected : user?.role === "admin";
    if (!authorized) throw new AppError("Unauthorized", 401);

    // METRICS_WORKER_GAUGE_V1 â€” el worker no cambia en runtime, es un gauge
    // de estado que se setea al vuelo (no escanea DB).
    globalMetrics.set("openmuse_worker_running", service.worker.running ? 1 : 0);

    // METRICS_P99_EXPOSE_V1 - expone p99 HTTP derivado del histograma.
    const p99 = globalMetrics.quantile("openmuse_http_request_duration_ms", 0.99);
    if (p99 !== undefined) globalMetrics.set("openmuse_http_latency_p99_ms", p99);

    c.header("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    return c.body(globalMetrics.render());
  });

  return app;
}
