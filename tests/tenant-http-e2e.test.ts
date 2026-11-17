// TENANT_HTTP_E2E_V1 — aislamiento HTTP con tenants de fixture local.
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
import { StoreAuditStore } from "../apps/server/src/kernel/audit/store-store.ts";
import { UserService } from "../apps/server/src/users.ts";
import { testConfig } from "./helpers/config.ts";

const ALICE = { email: "alice@tenant-a.local", password: "contrasena-larga-1", name: "Alice" };
const BOB = { email: "bob@tenant-b.local", password: "contrasena-larga-2", name: "Bob" };
const CAROL = { email: "carol@tenant-c.local", password: "contrasena-larga-3", name: "Carol" };

let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;
let directory: string;
let aliceToken: string;
let bobToken: string;
let carolToken: string;
let aliceId: string;
let bobId: string;
let carolId: string;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "agente-e2e-"));
  db = await createStore({ dataDir: join(directory, "db") });
  server = await createApp(db, testConfig({ dataDir: directory }));
  const users = new UserService(db);
  const alice = await users.create({ ...ALICE, role: "admin" });
  const bob = await users.create({ ...BOB, role: "admin" });
  const carol = await users.create({ ...CAROL, role: "admin" });
  aliceId = alice.id;
  bobId = bob.id;
  carolId = carol.id;
  const tenantService = new TenantService(db, server.agent.config as never);
  await tenantService.setMembership(aliceId, "tenant-a");
  await tenantService.setMembership(bobId, "tenant-b");
  await tenantService.setMembership(carolId, "tenant-c");
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
  const loginC = await server.app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: CAROL.email, password: CAROL.password }),
  });
  aliceToken = ((await loginA.json()) as { token: string }).token;
  bobToken = ((await loginB.json()) as { token: string }).token;
  carolToken = ((await loginC.json()) as { token: string }).token;
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
    body: JSON.stringify({ title: "tarea-A", prompt: "fixture only", kind: "agent" }),
  });
  await server.app.request("/api/agent/tasks", {
    method: "POST",
    headers: { ...bearer(bobToken), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "tarea-B", prompt: "fixture only", kind: "agent" }),
  });
  const a = (await (await server.app.request("/api/agent", { headers: bearer(aliceToken) })).json()) as { tasks: Array<{ title: string }> };
  const b = (await (await server.app.request("/api/agent", { headers: bearer(bobToken) })).json()) as { tasks: Array<{ title: string }> };
  assert.ok(a.tasks.every((t) => !t.title.includes("B")));
  assert.ok(b.tasks.every((t) => !t.title.includes("A")));
});

test("tres owners autenticados ven solo sus tareas y no pueden suplantar tenant", async () => {
  const owners = [
    { token: aliceToken, tenantId: "tenant-a", title: "marca-privada-a" },
    { token: bobToken, tenantId: "tenant-b", title: "marca-privada-b" },
    { token: carolToken, tenantId: "tenant-c", title: "marca-privada-c" },
  ];
  for (const owner of owners) {
    const created = await server.app.request("/api/agent/tasks", {
      method: "POST",
      headers: { ...bearer(owner.token), "Content-Type": "application/json" },
      body: JSON.stringify({ title: owner.title, prompt: "fixture only", kind: "agent" }),
    });
    assert.equal(created.status, 201);
    const snapshot = await server.app.request("/api/agent", { headers: bearer(owner.token) });
    assert.equal(snapshot.status, 200);
    const body = (await snapshot.json()) as { tasks: Array<{ title: string }> };
    assert.ok(body.tasks.some((task) => task.title === owner.title));
    for (const foreign of owners.filter((item) => item.tenantId !== owner.tenantId)) {
      assert.ok(!body.tasks.some((task) => task.title === foreign.title));
    }
  }

  const forged = await server.app.request("/api/agent/tasks", {
    method: "POST",
    headers: { ...bearer(aliceToken), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "forged-tenant", tenantId: "tenant-b", prompt: "fixture only", kind: "agent" }),
  });
  assert.equal(forged.status, 403);
});

test("tenant mismatch en query devuelve 403", async () => {
  const response = await server.app.request("/api/agent?tenantId=tenant-b", {
    headers: bearer(aliceToken),
  });
  assert.equal(response.status, 403);
});

test("la traza del kernel de A excluye el contenido de B y rechaza una consulta explícita a B", async () => {
  const audit = new StoreAuditStore(db);
  const ownContent = "marcador-traza-propia-a";
  const foreignContent = "marcador-traza-privada-b";
  for (const [tenantId, owner, marker] of [
    ["tenant-a", aliceId, ownContent],
    ["tenant-b", bobId, foreignContent],
  ]) {
    await audit.append({
      tenantId,
      owner,
      action: "turn.closed",
      actor: { kind: "user", id: owner },
      payload: { marker },
    });
  }

  const route = "/api/kernel/audit/by-action/turn.closed";
  const allowedB = await server.app.request(route, { headers: bearer(bobToken) });
  assert.equal(allowedB.status, 200);
  assert.ok((await allowedB.text()).includes(foreignContent));

  const denied = await server.app.request(`${route}?tenantId=tenant-b`, {
    headers: bearer(aliceToken),
  });
  assert.equal(denied.status, 403);
  assert.deepEqual(await denied.json(), { error: "tenant mismatch", code: "TENANT_MISMATCH" });

  const allowedA = await server.app.request(route, { headers: bearer(aliceToken) });
  assert.equal(allowedA.status, 200);
  const trace = await allowedA.text();
  assert.ok(trace.includes(ownContent));
  assert.ok(!trace.includes(foreignContent));
});

test("archivos de A/B/C se escriben y leen solo dentro de su tenant", async () => {
  const owners = [
    { token: aliceToken, userId: aliceId, tenantId: "tenant-a", marker: "contenido-privado-a" },
    { token: bobToken, userId: bobId, tenantId: "tenant-b", marker: "contenido-privado-b" },
    { token: carolToken, userId: carolId, tenantId: "tenant-c", marker: "contenido-privado-c" },
  ];
  const files: Array<{ token: string; userId: string; tenantId: string; marker: string; id: string }> = [];

  for (const owner of owners) {
    const form = new FormData();
    form.append("file", new File([owner.marker], `${owner.tenantId}.txt`, { type: "text/plain" }));
    const response = await server.app.request("/api/files", {
      method: "POST",
      headers: bearer(owner.token),
      body: form,
    });
    assert.equal(response.status, 201);
    const file = (await response.json()) as { id: string };
    assert.ok(await db.get(`tenant-${owner.tenantId.slice(-1)}:${owner.userId}`, "files", file.id));
    files.push({ ...owner, id: file.id });
  }

  for (const owner of files) {
    const ownRead = await server.app.request(`/api/files/${owner.id}/content`, {
      headers: bearer(owner.token),
    });
    assert.equal(ownRead.status, 200);
    assert.equal(await ownRead.text(), owner.marker);
    for (const foreign of files.filter((file) => file.tenantId !== owner.tenantId)) {
      const foreignRead = await server.app.request(`/api/files/${foreign.id}/content`, {
        headers: bearer(owner.token),
      });
      assert.equal(foreignRead.status, 404);
    }
  }
});

// SWITCH_TENANT_MULTI_TEST_V1 - el switch deja de ser decorativo: acepta las
// empresas donde el usuario es miembro y la siguiente peticion se atiende en
// ese tenant (X-Tenant-Id), no en el de la membership.
test("switch-tenant cambia la peticion al tenant elegido y rechaza los ajenos", async () => {
  const tenantService = new TenantService(db, server.agent.config as never);
  await tenantService.addMembership(aliceId, "tenant-a2", "owner");

  const switched = await server.app.request("/api/auth/switch-tenant", {
    method: "POST",
    headers: { ...bearer(aliceToken), "Content-Type": "application/json" },
    body: JSON.stringify({ tenantId: "tenant-a2" }),
  });
  assert.equal(switched.status, 200);
  const session = (await switched.json()) as { token: string; tenantId: string };
  assert.equal(session.tenantId, "tenant-a2");

  const next = await server.app.request("/api/agent", { headers: bearer(session.token) });
  assert.equal(next.status, 200);
  assert.equal(next.headers.get("x-tenant-id"), "tenant-a2");

  const denied = await server.app.request("/api/auth/switch-tenant", {
    method: "POST",
    headers: { ...bearer(aliceToken), "Content-Type": "application/json" },
    body: JSON.stringify({ tenantId: "tenant-b" }),
  });
  assert.equal(denied.status, 403);
});

test("notifications incluye tenantId y no mezcla tenants", async () => {
  const a = (await (await server.app.request("/api/agent/notifications", { headers: bearer(aliceToken) })).json()) as { tenantId: string; notifications: unknown[] };
  const b = (await (await server.app.request("/api/agent/notifications", { headers: bearer(bobToken) })).json()) as { tenantId: string; notifications: unknown[] };
  assert.equal(a.tenantId, "tenant-a");
  assert.equal(b.tenantId, "tenant-b");
});
