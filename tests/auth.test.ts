import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { UserService } from "../apps/server/src/users.ts";
import type { Workspace } from "../packages/domain/src/index.ts";

const ADMIN = { email: "admin@ejemplo.local", password: "contrasena-larga-1", name: "Ana" };

let db: Store,
  server: Awaited<ReturnType<typeof createApp>>,
  directory: string;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-auth-"));
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
  await new UserService(db).create({ ...ADMIN, role: "admin" });
});
after(async () => {
  await server.agent.stop();
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

const login = (email: string, password: string) =>
  server.app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

test("a wrong password is a 401 and never leaks whether the user exists", async () => {
  const wrong = await login(ADMIN.email, "no-es-la-clave");
  assert.equal(wrong.status, 401);
  const missing = await login("nadie@ejemplo.local", "lo-que-sea");
  assert.equal(missing.status, 401);
  assert.deepEqual(await missing.json(), await wrong.json());
});

test("login returns a token, the user and the real server mode", async () => {
  const response = await login(ADMIN.email, ADMIN.password);
  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    token: string;
    mode: string;
    user: { id: string; email: string; role: string };
  };
  // El modo lo decide el servidor: antes el front lo forzaba a "live" y el badge mentia.
  assert.equal(body.mode, "sample");
  assert.equal(body.user.email, ADMIN.email);
  assert.equal(body.user.role, "admin");
  const me = await server.app.request("/api/auth/me", { headers: bearer(body.token) });
  assert.equal(me.status, 200);
  assert.equal(((await me.json()) as { email: string }).email, ADMIN.email);
});

test("the authenticated owner gets its own sample workspace seeded", async () => {
  const { token, user } = (await (
    await login(ADMIN.email, ADMIN.password)
  ).json()) as { token: string; user: { id: string } };
  const workspace: Workspace = await (
    await server.app.request("/api/workspace", { headers: bearer(token) })
  ).json();
  // El sembrado vivia solo en /api/session con el owner "local-user": quien entraba por
  // /api/auth/login veia el workspace vacio.
  assert.equal(workspace.mail.length, 4);
  assert.equal(workspace.events.length, 3);
  assert.ok(workspace.files.length >= 1);
  assert.ok(workspace.actions.length >= 1);
  // ...y los datos son de ESE owner, no del owner generico.
  assert.equal(await db.list(user.id, "mail").then((rows) => rows.length), 4);
  assert.equal(await db.list("local-user", "mail").then((rows) => rows.length), 0);
});

test("google status is readable so the UI can show the connect button", async () => {
  const { token } = (await (await login(ADMIN.email, ADMIN.password)).json()) as { token: string };
  const status = (await (
    await server.app.request("/api/google/status", { headers: bearer(token) })
  ).json()) as { connected: boolean; account: string | null; sample: boolean };
  assert.equal(status.sample, true);
  assert.equal(status.connected, true);
  assert.equal(status.account, "alex@example.com");
});

test("the login rate limit answers 429 with Retry-After", async () => {
  const email = "fuerza-bruta@ejemplo.local";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await login(email, "lo-que-sea");
    assert.equal(response.status, 401, `intento ${attempt + 1}`);
  }
  const blocked = await login(email, "lo-que-sea");
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get("retry-after")) >= 1);
  // Un login correcto limpia la ventana de esa clave.
  const ok = await login(ADMIN.email, ADMIN.password);
  assert.equal(ok.status, 200);
});
