import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import type { Config } from "../apps/server/src/config.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";

let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;
let token: string;
let directory: string;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-tasks-"));
  db = await createStore({ dataDir: join(directory, "db") });
  const config: Config = {
    mode: "sample",
    port: 8787,
    host: "127.0.0.1",
    publicUrl: "http://localhost:8787",
    dataDir: directory,
    agentBackend: "sample",
    googleRedirectUri: "http://localhost:8787/api/google/callback",
    allowedOrigins: [],
  };
  server = await createApp(db, config);
  const session = await server.app.request("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  token = (await session.json()).token;
});

after(async () => {
  await server.agent.stop();
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

const headers = () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

test("reassign cambia assignedTo y state.roleId", async () => {
  const created = await server.agent.createTask("local-user", { prompt: "test reassign" });
  const res = await server.app.request(`/api/agent/tasks/${created.id}/reassign`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ roleId: "comercial" }),
  });
  assert.equal(res.status, 200);
  const updated = (await res.json()) as { assignedTo?: string; state?: { roleId?: string } };
  assert.equal(updated.assignedTo, "comercial");
  assert.equal(updated.state?.roleId, "comercial");
});

test("reassign sin roleId devuelve 422", async () => {
  const created = await server.agent.createTask("local-user", { prompt: "test reassign 2" });
  const res = await server.app.request(`/api/agent/tasks/${created.id}/reassign`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 422);
});