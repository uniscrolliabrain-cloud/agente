import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import type { Config } from "../apps/server/src/config.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import type { AgentMemory } from "../packages/domain/src/agent.ts";

let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;
let token: string;
let directory: string;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-memory-"));
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

test("crear memoria con category y tags", async () => {
  const res = await server.app.request("/api/agent/memories", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ text: "Cliente prefiere morning", source: "You", category: "cliente", tags: ["Tono", "PREFERENCIA"] }),
  });
  assert.equal(res.status, 201);
  const memory = (await res.json()) as AgentMemory;
  assert.equal(memory.category, "cliente");
  assert.deepEqual(memory.tags, ["tono", "preferencia"]);
});

test("editar solo text (patch parcial)", async () => {
  const created = (await (await server.app.request("/api/agent/memories", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ text: "viejo", source: "You", category: "empresa" }),
  })).json()) as AgentMemory;
  const res = await server.app.request(`/api/agent/memories/${created.id}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ text: "nuevo" }),
  });
  assert.equal(res.status, 200);
  const updated = (await res.json()) as AgentMemory;
  assert.equal(updated.text, "nuevo");
  assert.equal(updated.category, "empresa");
});

test("editar category a otro valor", async () => {
  const created = (await (await server.app.request("/api/agent/memories", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ text: "cambiar cat", source: "You", category: "empresa" }),
  })).json()) as AgentMemory;
  const res = await server.app.request(`/api/agent/memories/${created.id}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ category: "cliente" }),
  });
  assert.equal(res.status, 200);
  const updated = (await res.json()) as AgentMemory;
  assert.equal(updated.category, "cliente");
});

test("editar category a null borra la categoria", async () => {
  const created = (await (await server.app.request("/api/agent/memories", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ text: "borrar cat", source: "You", category: "empresa", tags: ["x"] }),
  })).json()) as AgentMemory;
  const res = await server.app.request(`/api/agent/memories/${created.id}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ category: null, tags: null }),
  });
  assert.equal(res.status, 200);
  const updated = (await res.json()) as AgentMemory;
  assert.equal(updated.category ?? null, null);
  assert.equal(updated.tags ?? null, null);
});

test("patch vacio devuelve 422", async () => {
  const created = (await (await server.app.request("/api/agent/memories", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ text: "patch vacio", source: "You" }),
  })).json()) as AgentMemory;
  const res = await server.app.request(`/api/agent/memories/${created.id}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 422);
});
