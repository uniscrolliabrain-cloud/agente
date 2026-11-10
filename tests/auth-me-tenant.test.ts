// E18 - /api/auth/me devuelve el tenant con el que el middleware atendio la
// peticion, para que la UI etiquete la sesion sin mirar el token demo.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { UserService } from "../apps/server/src/users.ts";
import { testConfig } from "./helpers/config.ts";

const SECRET = "test-supabase-jwt-secret-e18-at-least-32-chars";
const ADMIN = { email: "ana@ejemplo.local", password: "contrasena-larga-1", name: "Ana" };

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function signJwt(sub: string, tenant: string): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: "https://project.supabase.co/auth/v1",
      aud: "authenticated",
      exp: Math.floor(Date.now() / 1000) + 600,
      iat: Math.floor(Date.now() / 1000),
      sub,
      app_metadata: { tenant_id: tenant },
    }),
  );
  return `${header}.${payload}.${b64url(createHmac("sha256", SECRET).update(`${header}.${payload}`).digest())}`;
}

let directory: string;
let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "agente-auth-tenant-"));
  db = await createStore({ dataDir: join(directory, "db") });
  server = await createApp(db, testConfig({ dataDir: directory }));
  await new UserService(db).create({ ...ADMIN, role: "admin" });
});

after(async () => {
  await server.agent.stop();
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("en modo sesion /api/auth/me dice el tenant resuelto, no el owner", async () => {
  const login = await server.app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN.email, password: ADMIN.password }),
  });
  const { token, user } = (await login.json()) as { token: string; user: { id: string } };
  const me = await server.app.request("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(me.status, 200);
  const body = (await me.json()) as { id: string; tenantId: string | null };
  assert.equal(body.tenantId, "default", "el tenant del fallback single-tenant");
  assert.equal(body.id, user.id);
  assert.notEqual(body.tenantId, body.id, "el tenant nunca es el uuid del usuario");
});

test("con JWT de supabase /api/auth/me devuelve el tenant de la membership", async () => {
  const dir = await mkdtemp(join(tmpdir(), "agente-auth-tenant-jwt-"));
  const store = await createStore({ dataDir: join(dir, "db") });
  const app = await createApp(
    store,
    testConfig({ dataDir: dir, authProvider: "supabase", supabaseJwtSecret: SECRET }),
  );
  try {
    const users = new UserService(store);
    const tenants = new TenantService(store, testConfig({ dataDir: dir }));
    const carlos = await users.create({
      email: "carlos@acme-obras.es",
      name: "Carlos",
      password: "contrasena-larga-2",
      role: "admin",
      authProviderId: "supa-e18-carlos",
    });
    await tenants.addMembership(carlos.id, "acme", "owner");

    const me = await app.app.request("/api/auth/me", {
      headers: { Authorization: `Bearer ${signJwt("supa-e18-carlos", "acme")}` },
    });
    assert.equal(me.status, 200);
    const body = (await me.json()) as { id: string; email: string; tenantId: string | null };
    assert.equal(body.email, "carlos@acme-obras.es");
    assert.equal(body.tenantId, "acme");
    assert.equal(me.headers.get("x-tenant-id"), "acme");
  } finally {
    await app.agent.stop();
    await store.close();
    await rm(dir, { recursive: true, force: true });
  }
});
