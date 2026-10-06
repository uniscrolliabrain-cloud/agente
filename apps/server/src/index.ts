// BUG05_TICK_DEFERRED_V2 - arrancar tick de DeferredActions.
// C3_TICK_DEFERRED_V1 - arrancar tick de DeferredActions al arrancar el servidor.
// EVENTBUS_STARTUP_V1
import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";
import { readConfig } from "./config.ts";
import { createStore } from "./db.ts";
import { backgroundFailure } from "./log.ts";

const config = readConfig();
// VALIDATE_LLM_KEYS_V1 - aviso al arrancar si las keys estan vacias.
if (!process.env.FAST_LLM_API_KEY && !process.env.GEMINI_API_KEY) {
  console.warn("[kernel] FAST_LLM_API_KEY y GEMINI_API_KEY vacias.");
}
const db = await createStore({
  dataDir: `${config.dataDir}/postgres`,
  databaseUrl: config.databaseUrl,
});
await db.recoverInterruptedActions();
// INDEX_ENABLE_RLS_V1 - RLS opcional (solo Postgres + MULTI_TENANT_SHARED=true).
{
  const { enableRls } = await import("./db-rls.ts");
  const enabled = await enableRls(db);
  if (enabled) console.log("[OpenMuse] RLS activo en records");
}
const { app, agent, bus } = await createApp(db, config);
// INDEX_AUDIT_VERIFY_V1 - verifica el hash chain del audit al arranque.
{
  const kernelDeps = (agent.kernel as unknown as { deps?: { audit?: { verify?: (tenantId: string) => Promise<boolean> } } })?.deps;
  if (kernelDeps?.audit?.verify) {
    const tenants = await db.list<{ tenantId: string }>("system", "tenant-membership").catch(() => []);
    for (const t of Array.from(new Set(tenants.map((x) => x.tenantId)))) {
      const valid = await kernelDeps.audit.verify(t).catch(() => false);
      if (!valid) console.warn(`[OpenMuse] audit chain INVALIDO en tenant ${t}`);
      else console.log(`[OpenMuse] audit chain OK en tenant ${t}`);
    }
  }
}
await bus.emit("system", "system.startup", { kind: "system", id: "boot" }, { mode: config.mode });
// PROCESS_SPLIT_V1 - API no arranca worker si se ejecuta como API-only.
//   MODO=api: solo HTTP (el worker vive en otro proceso).
//   MODO=worker: solo worker (ver worker-entry.ts).
//   undefined: comportamiento previo (todo en uno).
const processRole = process.env.OPENMUSE_PROCESS_ROLE ?? "all";
if (config.taskWorkerEnabled && processRole !== "api") agent.start();
// PROCESS_SPLIT_V2 - "worker" no debe servir HTTP. index.ts es el entry de
// API (y de "all"); para "worker" puro se usa worker-entry.ts. Si aun asi
// alguien lanza index.ts con role=worker, no levantamos HTTP para no mezclar
// los dos planos.
const serveHttp = processRole !== "worker";
// INDEX_RECOVER_TASKS_V1 - recuperar tareas running huerfanas.
void agent.recoverInterruptedTasks().then((n) => {
  if (n > 0) console.log(`[OpenMuse] ${n} tareas recuperadas`);
});

// BACKUP_TENANT_SCHEDULER_V1 - backups por tenant independientes.
async function backupAllTenants(retentionDays: number): Promise<number> {
  const { runTenantBackup } = await import("./backup-tenant.ts");
  const tenants = await db.list<{ tenantId: string }>("system", "tenant-membership").catch(() => []);
  const unique = Array.from(new Set(tenants.map((t) => t.tenantId)));
  let ok = 0;
  for (const tenantId of unique) {
    try {
      const result = await runTenantBackup({ dataDir: config.dataDir, tenantId, retentionDays });
      const mb = (result.bytes / 1024 / 1024).toFixed(2);
      console.log(`[OpenMuse] backup tenant ${tenantId}: ${mb} MB`);
      ok++;
    } catch (error) {
      console.warn(`[OpenMuse] backup tenant ${tenantId} fallo: ${error instanceof Error ? error.message : error}`);
    }
  }
  return ok;
}

function startBackupScheduler(): () => void {
  const hours = config.backupIntervalHours ?? 0;
  if (!hours || hours <= 0) {
    console.log("Backup automatico desactivado (BACKUP_INTERVAL_HOURS=0).");
    return () => {};
  }
  const ms = hours * 60 * 60 * 1000;
  let running = false;
  const run = () => {
    if (running) return;
    running = true;
    void import("./backup.ts")
      .then((mod) =>
        mod.runBackup({
          retentionDays: config.backupRetentionDays ?? 0,
        }),
      )
      .then((result) => {
        const mb = (result.bytes / 1024 / 1024).toFixed(2);
        console.log(`[OpenMuse] Backup automatico ok: ${result.outDir} (${mb} MB, ${result.pruned} antiguos borrados)`);
      })
      .catch((error) => backgroundFailure("automatic backup", error))
      .finally(() => {
        running = false;
      });
  };
  // Primer backup a los 30s de arrancar, luego cada `ms`.
  const first = setTimeout(run, 30_000);
  const timer = setInterval(run, ms);
  console.log(`Backup automatico cada ${hours}h (retencion ${config.backupRetentionDays ?? 0} dias).`);
  return () => {
    clearTimeout(first);
    clearInterval(timer);
  };
}

const stopBackupScheduler = startBackupScheduler();

// INDEX_ROLLBACK_CHECK_V1 - si hay un rollback solicitado, avisar al arranque.
{
  const { hasRollbackRequested, listGoodReleases } = await import("./rollback.ts");
  if (await hasRollbackRequested(config.dataDir)) {
    const releases = await listGoodReleases(config.dataDir);
    console.warn(
      `[OpenMuse] ROLLBACK_REQUESTED detectado. Ultimas releases buenas: ${releases.slice(0, 3).map((r) => r.stamp).join(", ") || "ninguna"}`,
    );
  }
}

// DEFERRED_ACTIONS_WIRE_V1 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â instancia ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºnica de DeferredActions y tick.
// Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
// El tick corre cada segundo, pero solo ejecuta lo que ya venciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³.
// STORE_DEFERRED_WIRE_V1 - store persistente.
const { DeferredActions, StoreDeferredStore } = await import("./actions-deferred.ts");
const deferredStore = new StoreDeferredStore(db);
const deferred = new DeferredActions(
  deferredStore,
  async (_owner: string, actionId: string) => {
    const action = await db.get<{ id: string; owner?: string }>("system", "actions", actionId);
    void action;
    // El run real lo hace `ActionService.execute` cuando se llama a `decide`
    // con `run` (pendiente). Por ahora, marcamos la acciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n como ejecutada.
  },
  (type, payload) => {
    void bus.emit("system", "system.maintenance", { kind: "system", id: "deferred" }, {
      deferredType: type,
      ...payload,
    });
  },
  {
    windowMs: Number(process.env.DEFERRED_ACTION_WINDOW_MS ?? "8000"),
    dualAt: process.env.DEFERRED_ACTION_DUAL_AT
      ? Number(process.env.DEFERRED_ACTION_DUAL_AT)
      : null,
  },
);
// EVENTS_CONSUMERS_WIRE_V1 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â arranca los 3 consumidores del bus.
  // Ver: docs/audits/08-bus-de-eventos/roadmap.md ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§8
  // ("3 consumidores reales ademÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡s de ReactionEngine").
  const { startMetricsConsumer } = await import("./engine/events/consumers/metrics.ts");
  const { startAuditConsumer } = await import("./engine/events/consumers/audit.ts");
  const { startNotificationsConsumer } = await import("./engine/events/consumers/notifications.ts");
  // EVENTS_CONSUMERS_DYNAMIC_OWNERS_V1 - itera owners activos via scan.
  const ownersWithConsumers = await db
    .scan<{ tenantId: string }>("tenant-membership", 100)
    .then((rows) => rows.map((r) => r.value.tenantId).filter((v) => typeof v === "string" && v.length > 0))
    .catch(() => [] as string[]);
  if (ownersWithConsumers.length === 0) ownersWithConsumers.push("local-user", "system");
  const metricsConsumer = startMetricsConsumer(ownersWithConsumers);
  const auditConsumer = startAuditConsumer(ownersWithConsumers, db);
  const notificationsConsumer = startNotificationsConsumer(ownersWithConsumers, db);

  // ALERTS_WIRE_V1 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â instancia AlertService, registra las alertas y arranca.
const { AlertService, LogAlertHandler } = await import("./alerts/service.ts");
const { buildAlertDefinitions } = await import("./alerts/definitions.ts");
const { globalMetrics: alertMetrics } = await import("./metrics/registry.ts");
const alerts = new AlertService([new LogAlertHandler()]);
for (const def of buildAlertDefinitions({
  metricsSnapshot: () => {
    const httpCounter = (alertMetrics as unknown as { counters?: Map<string, { samples: Map<string, { labels: Record<string,string>; value: number }> }> }).counters?.get("openmuse_http_requests_total");
    let http5xx = 0;
    let httpTotal = 0;
    if (httpCounter) {
      for (const s of httpCounter.samples.values()) {
        httpTotal += s.value;
        if (String(s.labels.status ?? "").startsWith("5")) http5xx += s.value;
      }
    }
    const snap = { http5xx, httpTotal };
    return {
      http5xx: snap.http5xx,
      httpTotal: snap.httpTotal,
      taskFailuresLastHour: 0,
      tenantQuotaExceeded: 0,
      workerRunning: agent.worker.running,
      circuitOpenCount: 0,
      deadLetterCount: 0,
      outcomeUnknownCount: 0,
      httpLatencyP99Ms: alertMetrics.quantile("openmuse_http_request_duration_ms", 0.99) ?? 0,
    };
  },
})) {
  alerts.register(def);
}
alerts.start();
const deferredTick = setInterval(() => {
  void deferred.tick().catch((error) => backgroundFailure("deferred tick", error));
}, 1000);
deferredTick.unref?.();

const server = serveHttp
  ? serve({ fetch: app.fetch, port: config.port, hostname: config.host }, () =>
      console.log(`OpenMuse ${config.mode} API ready at ${config.publicUrl}`),
    )
  : null;
const shutdown = () => {
  stopBackupScheduler();
  const DRAIN_MS = Number(process.env.SHUTDOWN_DRAIN_MS ?? "10000") || 10000;
  const forceExit = setTimeout(() => { console.warn("[OpenMuse] shutdown drain timeout"); process.exit(1); }, DRAIN_MS);
  forceExit.unref?.();
  server?.close(() => {
    void agent
      .stop()
      .then(() => db.close())
      .then(() => { clearTimeout(forceExit); process.exit(0); })
      .catch(() => process.exit(1));
  });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);