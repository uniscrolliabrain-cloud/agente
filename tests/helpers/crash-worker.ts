// CRASH_WORKER_V1 — subproceso que simula un worker real.
// Arranca, toma la tarea queued, la pone running con lease, y duerme.
// El test padre lo mata con SIGKILL.
//
// CRASH_WORKER_HANG_HANDLER_V1 - usa el TaskWorker real (claim + lease) con un
// handler que nunca resuelve. Antes arrancaba el AgentService completo, cuyo
// backend de ejemplo termina la tarea en milisegundos: la tarea pasaba a
// waiting_input y el test moria esperando verla en running con lease.
//
// CRASH_WORKER_CLAIMED_MARKER_V1 - PGlite es un unico proceso sobre dataDir:
// mientras este subproceso la tiene abierta, el padre no puede leerla. Por eso
// anunciamos por stdout cuando la tarea ya esta running con lease.

import { existsSync } from "node:fs";
import { createStore } from "../../apps/server/src/db.ts";
import { TenantScopedStore } from "../../apps/server/src/db-tenant.ts";
import { TenantService } from "../../apps/server/src/engine/tenant.ts";
import { TaskWorker } from "../../apps/server/src/engine/worker.ts";
import type { AgentTask } from "../../packages/domain/src/agent.ts";
import { testConfig } from "./config.ts";

if (existsSync(".env")) process.loadEnvFile(".env");

const dataDir = process.env.DATA_DIR;
if (!dataDir) throw new Error("DATA_DIR requerido");
const taskId = process.env.CRASH_TASK_ID ?? "crash-test-task";
const taskOwner = process.env.CRASH_TASK_OWNER ?? "crash-owner";

const config = testConfig({ dataDir });
const db = await createStore({ dataDir });
// El worker real lee a traves de TenantScopedStore (clave `${tenant}:${owner}`).
const tenants = new TenantService(db, config);
const tdb = new TenantScopedStore(db, (owner) => tenants.tenantIdFor(owner));

// Nunca resuelve: mantiene la tarea en running con lease hasta el SIGKILL.
const worker = new TaskWorker(tdb, () => new Promise<never>(() => {}));

worker.start();

let announced = false;
setInterval(async () => {
  if (announced) return;
  const task = await tdb.get<AgentTask>(taskOwner, "tasks", taskId).catch(() => null);
  if (task?.status === "running" && task.leaseId) {
    announced = true;
    process.stdout.write("CRASH_WORKER_CLAIMED\n");
  }
}, 100);

// Mantener vivo el proceso.
setInterval(() => {}, 1000);
