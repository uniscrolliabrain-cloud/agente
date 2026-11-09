// TENANT_PERMISSIONS_TEST_V1 - campaña 03.
// Ver: docs/vertical-slice-actual/03-permisos/CAMPAIGN.md
//
// Cubre la aserción de cierre por los dos lados:
//   - revocación en caliente corta el acceso (membership fresca + switch),
//   - una cuenta de empresa no administra otras empresas (rol de plataforma),
// y añade los bordes que el plan pide: suspensión y permiso de aprobación.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import {
  assertPermission,
  assertTenantActive,
  can,
  permissionsFor,
  tenantAccess,
} from "../apps/server/src/engine/authz/tenant-permissions.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { UserService } from "../apps/server/src/users.ts";
import { testConfig } from "./helpers/config.ts";

const ALICE = { email: "alice@perms-a.local", password: "contrasena-larga-1", name: "Alice" };
const ROOT = { email: "root@perms-admin.local", password: "contrasena-larga-2", name: "Root" };

test("matriz: owner administra, admin aprueba, member no aprueba", () => {
  assert.ok(can("owner", "tenant.admin"));
  assert.ok(can("owner", "members.manage"));
  assert.ok(can("owner", "actions.approve"));
  assert.ok(can("admin", "actions.approve"));
  assert.equal(can("admin", "tenant.admin"), false);
  assert.equal(can("admin", "members.manage"), false);
  assert.ok(can("member", "actions.prepare"));
  assert.equal(can("member", "actions.approve"), false);
  assert.deepEqual(permissionsFor("member"), ["records.read", "actions.prepare"]);
});

test("assertPermission deniega con 403 y permiso explícito", () => {
  assert.throws(
    () => assertPermission("member", "actions.approve"),
    (error: unknown) => {
      const err = error as { status?: number; fields?: Record<string, string> };
      assert.equal(err.status, 403);
      assert.equal(err.fields?.code, "PERMISSION_DENIED");
      assert.equal(err.fields?.permission, "actions.approve");
      return true;
    },
  );
});

test("assertTenantActive corta una empresa suspendida", () => {
  assert.doesNotThrow(() => assertTenantActive({ suspended: false }));
  assert.throws(
    () => assertTenantActive({ suspended: true, reason: "impago" }),
    (error: unknown) => {
      const err = error as { status?: number; fields?: Record<string, string> };
      assert.equal(err.status, 403);
      assert.equal(err.fields?.code, "TENANT_SUSPENDED");
      return true;
    },
  );
});

test("tenantAccess: sin membership, suspendida y sin permiso son fallos distintos", () => {
  const membership = {
    id: "tenant-a",
    tenantId: "tenant-a",
    userId: "u1",
    role: "member" as const,
    createdAt: new Date().toISOString(),
  };
  const none = tenantAccess({ membership: null, state: { suspended: false } });
  assert.equal(none.ok, false);
  assert.equal(none.ok === false && none.error.status, 403);

  const suspended = tenantAccess({ membership, state: { suspended: true, reason: "baja" } });
  assert.equal(suspended.ok, false);
  assert.equal(suspended.ok === false && suspended.error.status, 403);

  const denied = tenantAccess({
    membership,
    state: { suspended: false },
    permission: "actions.approve",
  });
  assert.equal(denied.ok, false);
  assert.equal(denied.ok === false && denied.error.status, 403);

  const allowed = tenantAccess({
    membership,
    state: { suspended: false },
    permission: "actions.prepare",
  });
  assert.equal(allowed.ok, true);
  assert.equal(allowed.ok && allowed.role, "member");
});

let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;
let directory: string;
let tenants: TenantService;
let aliceToken: string;
let rootToken: string;
let aliceId: string;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "agente-perms-"));
  db = await createStore({ dataDir: join(directory, "db") });
  server = await createApp(db, testConfig({ dataDir: directory }));
  const users = new UserService(db);
  const alice = await users.create({ ...ALICE, role: "user" });
  const root = await users.create({ ...ROOT, role: "admin" });
  aliceId = alice.id;
  tenants = new TenantService(db, server.agent.config as never);
  // Alice es owner de su empresa; root es admin de PLATAFORMA en otra, para
  // poder suspender la de Alice sin quedarse fuera de la suya.
  // El registro global de empresas es lo que valida el alta de miembros.
  for (const tenantId of ["tenant-a", "tenant-z"]) {
    await db.put("system", "tenant-membership", {
      id: tenantId,
      tenantId,
      displayName: tenantId,
      createdAt: new Date().toISOString(),
    });
  }
  await tenants.setMembership(aliceId, "tenant-a");
  await tenants.addMembership(aliceId, "tenant-a", "owner");
  await tenants.setMembership(root.id, "tenant-z");
  await tenants.addMembership(root.id, "tenant-z", "owner");
  const login = async (email: string, password: string) => {
    const response = await server.app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    assert.equal(response.status, 200);
    return ((await response.json()) as { token: string }).token;
  };
  aliceToken = await login(ALICE.email, ALICE.password);
  rootToken = await login(ROOT.email, ROOT.password);
});

after(async () => {
  await server.agent.stop();
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
const jsonHeaders = (token: string) => ({ ...bearer(token), "Content-Type": "application/json" });

test("una cuenta de empresa no administra otras empresas", async () => {
  const list = await server.app.request("/api/admin/tenants", { headers: bearer(aliceToken) });
  assert.equal(list.status, 403);
  const suspend = await server.app.request("/api/admin/tenants/tenant-z/suspend", {
    method: "POST",
    headers: jsonHeaders(aliceToken),
    body: JSON.stringify({ reason: "intento ajeno" }),
  });
  assert.equal(suspend.status, 403);
});

test("suspender la empresa corta el acceso y reanudarla lo devuelve", async () => {
  const before = await server.app.request("/api/agent", { headers: bearer(aliceToken) });
  assert.equal(before.status, 200);

  const suspend = await server.app.request("/api/admin/tenants/tenant-a/suspend", {
    method: "POST",
    headers: jsonHeaders(rootToken),
    body: JSON.stringify({ reason: "prueba de kill switch" }),
  });
  assert.equal(suspend.status, 200);

  const blocked = await server.app.request("/api/agent", { headers: bearer(aliceToken) });
  assert.equal(blocked.status, 403);
  assert.deepEqual(await blocked.json(), { error: "Empresa suspendida", code: "TENANT_SUSPENDED" });

  const resume = await server.app.request("/api/admin/tenants/tenant-a/resume", {
    method: "POST",
    headers: jsonHeaders(rootToken),
    body: JSON.stringify({}),
  });
  assert.equal(resume.status, 200);

  const restored = await server.app.request("/api/agent", { headers: bearer(aliceToken) });
  assert.equal(restored.status, 200);
});

test("revocar la membership corta el cambio de empresa en caliente", async () => {
  const userId = aliceId;
  const added = await server.app.request("/api/admin/tenants/tenant-z/members", {
    method: "POST",
    headers: jsonHeaders(rootToken),
    body: JSON.stringify({ userId, role: "member" }),
  });
  assert.equal(added.status, 201);

  const switched = await server.app.request("/api/auth/switch-tenant", {
    method: "POST",
    headers: jsonHeaders(aliceToken),
    body: JSON.stringify({ tenantId: "tenant-z" }),
  });
  assert.equal(switched.status, 200);

  // La membership fresca es la que decide: el caché no debe sobrevivir.
  const fresh = await tenants.findMembership(userId, "tenant-z");
  assert.equal(fresh?.role, "member");
  const removed = await tenants.removeMembership(userId, "tenant-z");
  assert.equal(removed, true);
  assert.equal(await tenants.findMembership(userId, "tenant-z"), null);

  const denied = await server.app.request("/api/auth/switch-tenant", {
    method: "POST",
    headers: jsonHeaders(aliceToken),
    body: JSON.stringify({ tenantId: "tenant-z" }),
  });
  assert.equal(denied.status, 403);

  // Y el tenant revocado ya no se puede pedir ni por cabecera.
  const header = await server.app.request("/api/agent", {
    headers: { ...bearer(aliceToken), "x-tenant-id": "tenant-z" },
  });
  assert.equal(header.status, 403);
});
