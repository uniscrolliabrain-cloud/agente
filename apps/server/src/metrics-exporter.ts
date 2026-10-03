// METRICS_TENANT_LABEL_V2 - metricas con label tenant.
// METRICS_EXPORTER_V1 - endpoint /metrics compatible con Prometheus.
// Sin dependencias: genera el texto del formato de exposicion a mano.

import { Hono } from "hono";
import type { AgentTask, AgentRole } from "../../../packages/domain/src/agent.ts";
import type { AgentService } from "./engine/service.ts";
import type { UserService } from "./users.ts";
import { AppError } from "./errors.ts";

interface Metric {
  name: string;
  help: string;
  type: "counter" | "gauge";
  samples: Array<{ labels: Record<string, string>; value: number }>;
}

function formatLabels(labels: Record<string, string>): string {
  const pairs = Object.entries(labels)
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '\\"')}"`)
    .join(",");
  return pairs ? `{${pairs}}` : "";
}

function renderMetrics(metrics: Metric[]): string {
  const lines: string[] = [];
  for (const m of metrics) {
    lines.push(`# HELP ${m.name} ${m.help}`);
    lines.push(`# TYPE ${m.name} ${m.type}`);
    for (const s of m.samples) {
      lines.push(`${m.name}${formatLabels(s.labels)} ${s.value}`);
    }
  }
  return lines.join("\n") + "\n";
}

export function metricsRoutes(service: AgentService, users: UserService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  app.get("/", async (c) => {
    // El endpoint puede estar protegido por admin o por token.
    const token = c.req.header("x-metrics-token");
    const expected = process.env.METRICS_TOKEN?.trim();
    const owner = c.get("owner");
    const user = owner ? await users.getById(owner).catch(() => null) : null;
    const authorized = expected ? token === expected : user?.role === "admin";
    if (!authorized) throw new AppError("Unauthorized", 401);

    const metrics: Metric[] = [];

    // Globales
    const workerRunning = service.worker.running ? 1 : 0;
    metrics.push({
      name: "openmuse_worker_running",
      help: "1 si el worker esta corriendo",
      type: "gauge",
      samples: [{ labels: {}, value: workerRunning }],
    });

    // Por tenant: leemos de records los tenants activos.
    const tenants = await service.db.scan<{ id: string }>("agent-settings", 5000).catch(() => []);
    const tenantIds = Array.from(new Set(tenants.map((t) => t.owner))).slice(0, 200);

    const tasksByStatus: Array<{ labels: Record<string, string>; value: number }> = [];
    const rolesByTenant: Array<{ labels: Record<string, string>; value: number }> = [];
    const tasksRunning: Array<{ labels: Record<string, string>; value: number }> = [];
    const tasksFailed: Array<{ labels: Record<string, string>; value: number }> = [];
    const buildsTotal: Array<{ labels: Record<string, string>; value: number }> = [];

    for (const tenant of tenantIds) {
      const tasks = await service.db.list<AgentTask>(tenant, "tasks", { limit: 5000 }).catch(() => []);
      const roles = await service.db.list<AgentRole>(tenant, "agent-roles", { limit: 200 }).catch(() => []);
      const builds = await service.db.list<{ status: string }>(tenant, "build-specs", { limit: 500 }).catch(() => []);

      rolesByTenant.push({ labels: { tenant }, value: roles.length });

      const counts = new Map<string, number>();
      for (const t of tasks) counts.set(t.status, (counts.get(t.status) ?? 0) + 1);
      for (const [status, count] of counts) {
        tasksByStatus.push({ labels: { tenant, status }, value: count });
      }
      tasksRunning.push({ labels: { tenant }, value: counts.get("running") ?? 0 });
      tasksFailed.push({ labels: { tenant }, value: counts.get("failed") ?? 0 });
      buildsTotal.push({ labels: { tenant }, value: builds.length });
    }

    if (tasksByStatus.length > 0) {
      metrics.push({
        name: "openmuse_tasks_total",
        help: "Numero de tareas por tenant y estado",
        type: "gauge",
        samples: tasksByStatus,
      });
    }
    if (rolesByTenant.length > 0) {
      metrics.push({
        name: "openmuse_roles_total",
        help: "Numero de roles por tenant",
        type: "gauge",
        samples: rolesByTenant,
      });
    }
    if (tasksRunning.length > 0) {
      metrics.push({
        name: "openmuse_tasks_running",
        help: "Tareas en estado running por tenant",
        type: "gauge",
        samples: tasksRunning,
      });
    }
    if (tasksFailed.length > 0) {
      metrics.push({
        name: "openmuse_tasks_failed",
        help: "Tareas fallidas por tenant",
        type: "gauge",
        samples: tasksFailed,
      });
    }
    if (buildsTotal.length > 0) {
      metrics.push({
        name: "openmuse_builds_total",
        help: "Builds del Arquitecto por tenant",
        type: "gauge",
        samples: buildsTotal,
      });
    }

    c.header("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    return c.body(renderMetrics(metrics));
  });

  return app;
}