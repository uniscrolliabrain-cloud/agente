// CRASH_WORKER_V1 — subproceso que simula un worker real.
// Arranca, toma la tarea queued, la pone running con lease, y duerme.
// El test padre lo mata con SIGKILL.

import { existsSync } from "node:fs";
import { createStore } from "../../apps/server/src/db.ts";
import { createApp } from "../../apps/server/src/app.ts";

if (existsSync(".env")) process.loadEnvFile(".env");

const dataDir = process.env.DATA_DIR;
if (!dataDir) throw new Error("DATA_DIR requerido");

const db = await createStore({ dataDir });
const config = {
  mode: "sample" as const,
  port: 8787,
  host: "127.0.0.1",
  publicUrl: "http://localhost:8787",
  dataDir,
  agentBackend: "sample" as const,
  googleRedirectUri: "http://localhost:8787/api/google/callback",
  allowedOrigins: [],
};
const app = await createApp(db, config);

// Handler que pone la tarea running y duerme para siempre.
app.agent.worker.start();

// Mantener vivo el proceso.
setInterval(() => {}, 1000);
