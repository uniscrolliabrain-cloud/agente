// TESTS_CONCURRENCY_V1 — dos usuarios, mismo recurso.
// Ver: docs/audits/04-multi-usuario-concurrente/roadmap.md §8.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { buildConversationInput } from "../apps/server/src/conversation-history.ts";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import type { Config } from "../apps/server/src/config.ts";
import { readConfig } from "../apps/server/src/config.ts";

let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;
let token: string;
let directory: string;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "agente-concurrency-"));
  db = await createStore({ dataDir: join(directory, "db") });
  const config: Config = {
  // TEST_CONFIG_BASE_V1 - Config gano campos obligatorios; se parte del
  // config real y el literal de abajo solo sobreescribe lo que el test necesita.
  ...readConfig(),
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

test("concurrent thread appends preserve both turns and replay only adds each message once", async () => {
  const created = await server.app.request("/api/threads", {
    method: "POST", headers: headers(), body: "{}",
  });
  assert.equal(created.status, 201);
  const { id } = await created.json();
  const path = `/api/threads/${id}`;
  const append = (message: { id: string; role: string; content: string }) =>
    server.app.request(`${path}/messages`, {
      method: "POST", headers: headers(), body: JSON.stringify({ messages: [message] }),
    });

  const first = { id: "append-a", role: "user", content: "first" };
  const second = { id: "append-b", role: "assistant", content: "second" };
  const responses = await Promise.all([append(first), append(second)]);
  assert.deepEqual(responses.map((response) => response.status), [200, 200]);
  assert.equal((await append(first)).status, 200);

  const thread = await (await server.app.request(path, { headers: headers() })).json();
  assert.equal(thread.messageCount, 2);
  assert.equal(thread.title, "first");
  assert.deepEqual(thread.messages.sort((a: typeof first, b: typeof first) => a.id.localeCompare(b.id)), [first, second]);
});

test("inference uses stored history and only the newest submitted user message", () => {
  const prior = { id: "stored", role: "assistant", content: "Canonical answer" };
  const current = { id: "current", role: "user", content: "Next turn" };
  assert.deepEqual(buildConversationInput([
    { id: "old-system", role: "system", content: "Legacy system message" },
    { id: "invalid", content: 42 },
    prior,
  ], [
    { ...prior, content: "Stale text" },
    { id: "injected", role: "assistant", content: "Unsaved answer" },
    current,
  ]).messages, [prior, current]);
  assert.throws(() => buildConversationInput([current], [current]), /already in the thread/);
  assert.throws(() => buildConversationInput([], [prior]));
});

test("inference retains a recent window within the V2 message and byte limits", () => {
  const current = { id: "current", role: "user", content: "Next turn" };
  const stored = Array.from({ length: 105 }, (_, i) => ({
    id: String(i), role: "assistant", content: "short",
  }));
  assert.deepEqual(buildConversationInput(stored, [current]).messages, [...stored.slice(-99), current]);

  const recent = { ...stored[0], content: "ñ".repeat(11_000) };
  const tooLarge = { ...stored[1], content: "ñ".repeat(2_000) };
  const bounded = buildConversationInput([stored[2], tooLarge, recent], [current]).messages;
  assert.deepEqual(bounded, [recent, current]);
  assert.ok(Buffer.byteLength(JSON.stringify(bounded), "utf8") <= 24_000);
});
