// EVENTBUS_STARTUP_V1
import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";
import { readConfig } from "./config.ts";
import { createStore } from "./db.ts";
import { backgroundFailure } from "./log.ts";

const config = readConfig();
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

const server = serve({ fetch: app.fetch, port: config.port, hostname: config.host }, () =>
  console.log(`OpenMuse ${config.mode} API ready at ${config.publicUrl}`),
);
const shutdown = () => {
  stopBackupScheduler();
  server.close(() => {
    void agent
      .stop()
      .then(() => db.close())
      .then(() => process.exit(0));
  });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);