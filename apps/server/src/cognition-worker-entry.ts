// C07_WORKER_ENTRY_V2: explicitly started worker, no import-time scheduler in domain modules.
import { createStore } from "./db.ts";
import { readConfig } from "./config.ts";
import { createApp } from "./app.ts";
import { runCognitionWorkers } from "./engine/cognition/v2/workers.ts";
const config = readConfig();
if (!config.databaseUrl) throw Error("Separate cognition worker requires DATABASE_URL; embedded PGlite belongs to the API process");
const db = await createStore({ databaseUrl: config.databaseUrl });
const { agent } = await createApp(db, config);
if (!agent.cognitionV2) throw Error("COGNITION_V2_TENANTS is required");
const controller = new AbortController();
process.on("SIGTERM", () => controller.abort());
process.on("SIGINT", () => controller.abort());
try { await runCognitionWorkers(agent.cognitionV2, controller.signal); }
finally { await db.close(); }
