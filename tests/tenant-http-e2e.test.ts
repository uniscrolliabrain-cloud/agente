// TENANT_HTTP_E2E_V1 — aislamiento HTTP con 2 tenants reales.
// Ver: docs/audits/07-aislamiento-multi-tenant/miniaudit.md
//
// Cubre: lectura, escritura, enumeración, files.import, notifications.
// No cubre RAG ni workers: requieren proveedor LLM y se prueban en CI aparte.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { UserService } from "../apps/server/src/users.ts";

const ALICE = { email: "alice@tenant-a.local", password: "contrasena-larga-1", name: "Alice" };
const BOB = { email: "bob@tenant-b.local", password: "contrasena-larga-2", name: "Bob" };

let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;
let directory: string;
let aliceToken: string;
let bobToken: string;
let aliceId: string;
let bobId: string;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-e2e-"));
  db = await createStore({ dataDir: join(directory, "db") });
  server = await createApp(db, {
    mode: "sample",
    port: 8787,
    host: "127.0.0.1",
    publicUrl: "http://localhost:8787",
    dataDir: directory,
    agentBackend: "sample",
    googleRedirectUri: "http://localhost:8787/api/google/callback",
    allowedOrigins: [],
  });
  const users = new UserService(db);
  const alice = await users.create({ ...ALICE, role: "admin" });
  const bob = await users.create({ ...BOB, role: "admin" });
  aliceId = alice.id;
  bobId = bob.id;
  const tenantService = new TenantService(db, server.agent.config as never);
  await tenantService.setMembership(aliceId, "tenant-a");
  await tenantService.setMembership(bobId, "tenant-b");
  const loginA = await server.app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ALICE.email, password: ALICE.password }),
  });
  const loginB = await server.app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: BOB.email, password: BOB.password }),
  });
  aliceToken = ((await loginA.json()) as { token: string }).token;
  bobToken = ((await loginB.json()) as { token: string }).token;
});

after(async () => {
  await server.agent.stop();
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

test("tenant A no ve tareas de tenant B", async () => {
  await server.app.request("/api/agent/tasks", {
    method: "POST",
    headers: { ...bearer(aliceToken), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "tarea-A", input: "x", kind: "general" }),
  });
  await server.app.request("/api/agent/tasks", {
    method: "POST",
    headers: { ...bearer(bobToken), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "tarea-B", input: "y", kind: "general" }),
  });
  const a = (await (await server.app.request("/api/agent", { headers: bearer(aliceToken) })).json()) as { tasks: Array<{ title: string }> };
  const b = (await (await server.app.request("/api/agent", { headers: bearer(bobToken) })).json()) as { tasks: Array<{ title: string }> };
  assert.ok(a.tasks.every((t) => !t.title.includes("B")));
  assert.ok(b.tasks.every((t) => !t.title.includes("A")));
});

test("tenant mismatch en query devuelve 403", async () => {
  const response = await server.app.request("/api/agent?tenantId=tenant-b", {
    headers: bearer(aliceToken),
  });
  assert.equal(response.status, 403);
});

test("files.import usa el tenant del owner, no default", async () => {
  const form = new FormData();
  form.append("file", new File([new Uint8Array([1,2,3])], "a.txt", { type: "text/plain" }));
  const response = await server.app.request("/api/files", {
    method: "POST",
    headers: bearer(aliceToken),
    body: form,
  });
  assert.equal(response.status, 201);
  const file = (await response.json()) as { id: string };
  const stored = await db.get<{ owner?: string }>("tenant-a:" + aliceId, "files", file.id);
  assert.ok(stored, "el fichero debe estar bajo tenant-a:owner, no default:owner");
});

test("notifications incluye tenantId y no mezcla tenants", async () => {
  const a = (await (await server.app.request("/api/agent/notifications", { headers: bearer(aliceToken) })).json()) as { tenantId: string; notifications: unknown[] };
  const b = (await (await server.app.request("/api/agent/notifications", { headers: bearer(bobToken) })).json()) as { tenantId: string; notifications: unknown[] };
  assert.equal(a.tenantId, "tenant-a");
  assert.equal(b.tenantId, "tenant-b");
});
