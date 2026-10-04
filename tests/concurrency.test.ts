// TESTS_CONCURRENCY_V1 — dos usuarios, mismo recurso.
// Ver: docs/audits/04-multi-usuario-concurrente/roadmap.md §8.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import type { Config } from "../apps/server/src/config.ts";

let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;
let token: string;
let directory: string;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-concurrency-"));
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

test("dos usuarios concurrentes en el mismo thread: uno guarda, el otro recibe 409", async () => {
  // 1. Crear thread.
  const created = await server.app.request("/api/threads", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ title: "Concurrency test" }),
  });
  const thread = await created.json();
  const id = thread.id;

  // 2. Usuario A lee el estado.
  const stateA = await server.app.request(`/api/threads/${id}/state`, { headers: headers() });
  const snapshotA = await stateA.json();

  // 3. Usuario A guarda con expectedUpdatedAt.
  const saveA = await server.app.request(`/api/threads/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      messages: [{ id: "m1", role: "user", content: "from A" }],
      expectedUpdatedAt: snapshotA.updatedAt,
    }),
  });
  assert.equal(saveA.status, 200, "usuario A guarda sin conflicto");

  // 4. Usuario B intenta guardar con el MISMO expectedUpdatedAt.
  const saveB = await server.app.request(`/api/threads/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      messages: [{ id: "m2", role: "user", content: "from B" }],
      expectedUpdatedAt: snapshotA.updatedAt,
    }),
  });
  assert.equal(saveB.status, 409, "usuario B recibe 409");
  const conflict = await saveB.json();
  assert.match(conflict.error, /Recarga|modificado/i);
});

test("notificaciones dirigidas por userId no llegan a otros", async () => {
  // Crear notificación directa para user-A.
  const created = await server.app.request("/api/agent/notifications/direct", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      userId: "user-A",
      title: "Solo para A",
      body: "Contenido privado",
    }),
  });
  assert.equal(created.status, 201);
  const notif = await created.json();
  assert.equal(notif.assignedTo, "user-A");
});

test("presence: dos usuarios tocando el mismo thread se detectan", async () => {
  const created = await server.app.request("/api/threads", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ title: "Presence test" }),
  });
  const thread = await created.json();

  await server.app.request(`/api/threads/${thread.id}/presence`, {
    method: "POST",
    headers: { ...headers(), "x-user-id": "user-A" },
    body: "{}",
  });

  const touch = await server.app.request(`/api/threads/${thread.id}/presence`, {
    method: "POST",
    headers: { ...headers(), "x-user-id": "user-B" },
    body: "{}",
  });
  const result = await touch.json();
  assert.equal(result.others.length, 1);
  assert.equal(result.others[0].userId, "user-A");
});
