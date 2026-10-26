// JWT_AUTHZ_TEST_V1 - gate de la campana authz-tenant.
//
// Cubre lo que antes no existia:
//   1. La firma se verifica (HS256 y RS256/JWKS). Un token fabricado es 401.
//   2. El claim de tenant es obligatorio: sin el, 401.
//   3. El usuario solo puede actuar en tenants de los que es miembro: 403.
//   4. Un mismo usuario con dos empresas escribe en la que declara el token.
import assert from "node:assert/strict";
import { generateKeyPairSync, createSign, createHmac } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { UserService } from "../apps/server/src/users.ts";
import { clearJwksCache } from "../apps/server/src/engine/auth/jwt-verify.ts";
import { testConfig } from "./helpers/config.ts";

const SECRET = "test-supabase-jwt-secret-at-least-32-chars";

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

interface Claims {
  sub: string;
  tenant?: string;
  audience?: string;
  expOffsetSeconds?: number;
}

function signHs256(claims: Claims, secret = SECRET): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: "https://project.supabase.co/auth/v1",
      aud: claims.audience ?? "authenticated",
      exp: Math.floor(Date.now() / 1000) + (claims.expOffsetSeconds ?? 600),
      iat: Math.floor(Date.now() / 1000),
      sub: claims.sub,
      ...(claims.tenant ? { app_metadata: { tenant_id: claims.tenant } } : {}),
    }),
  );
  const signature = b64url(createHmac("sha256", secret).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${signature}`;
}

let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;
let directory: string;
let userId: string;
let tenants: TenantService;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-jwt-"));
  db = await createStore({ dataDir: join(directory, "db") });
  const config = testConfig({
    dataDir: directory,
    authProvider: "supabase",
    supabaseJwtSecret: SECRET,
  });
  server = await createApp(db, config);
  tenants = new TenantService(db, config);
  const user = await new UserService(db).create({
    email: "duena@agntia.local",
    name: "Duena",
    password: "contrasena-larga-1",
    role: "admin",
    authProviderId: "supa-user-1",
  });
  userId = user.id;
});

after(async () => {
  await server.agent.stop();
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

test("un JWT firmado con el secreto del proyecto entra y crea su membership", async () => {
  const response = await server.app.request("/api/agent", {
    headers: auth(signHs256({ sub: "supa-user-1", tenant: "agntia" })),
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-tenant-id"), "agntia");
  const memberships = await tenants.membershipsFor(userId);
  assert.deepEqual(
    memberships.map((m) => m.tenantId),
    ["agntia"],
  );
});

test("un JWT con firma invalida es 401 aunque los claims sean perfectos", async () => {
  const valid = signHs256({ sub: "supa-user-1", tenant: "agntia" });
  const [header, payload] = valid.split(".");
  const forged = `${header}.${payload}.${b64url("firma-inventada")}`;
  const response = await server.app.request("/api/agent", { headers: auth(forged) });
  assert.equal(response.status, 401);
});

test("un JWT firmado con otro secreto es 401", async () => {
  const response = await server.app.request("/api/agent", {
    headers: auth(signHs256({ sub: "supa-user-1", tenant: "agntia" }, "otro-secreto-distinto")),
  });
  assert.equal(response.status, 401);
});

test("un JWT sin claim de tenant es 401", async () => {
  const response = await server.app.request("/api/agent", {
    headers: auth(signHs256({ sub: "supa-user-1" })),
  });
  assert.equal(response.status, 401);
});

test("un JWT caducado es 401", async () => {
  const response = await server.app.request("/api/agent", {
    headers: auth(signHs256({ sub: "supa-user-1", tenant: "agntia", expOffsetSeconds: -600 })),
  });
  assert.equal(response.status, 401);
});

test("un JWT para otra audiencia es 401", async () => {
  const response = await server.app.request("/api/agent", {
    headers: auth(signHs256({ sub: "supa-user-1", tenant: "agntia", audience: "anon" })),
  });
  assert.equal(response.status, 401);
});

test("el mismo usuario escribe en el tenant que declara el token", async () => {
  await tenants.addMembership(userId, "otra-empresa");
  const tokenA = signHs256({ sub: "supa-user-1", tenant: "agntia" });
  const tokenB = signHs256({ sub: "supa-user-1", tenant: "otra-empresa" });

  const created = await server.app.request("/api/agent/tasks", {
    method: "POST",
    headers: { ...auth(tokenB), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "tarea-B", prompt: "x", kind: "agent" }),
  });
  assert.equal(created.status, 201);
  const task = (await created.json()) as { id: string };

  // La escritura cae bajo el tenant del token, no bajo el de la membership previa.
  assert.ok(await db.get(`otra-empresa:${userId}`, "tasks", task.id));
  assert.equal(await db.get(`agntia:${userId}`, "tasks", task.id), null);

  const listB = (await (
    await server.app.request("/api/agent", { headers: auth(tokenB) })
  ).json()) as { tasks: Array<{ id: string }> };
  const listA = (await (
    await server.app.request("/api/agent", { headers: auth(tokenA) })
  ).json()) as { tasks: Array<{ id: string }> };
  assert.ok(listB.tasks.some((t) => t.id === task.id));
  assert.ok(!listA.tasks.some((t) => t.id === task.id));
});

test("un tenant que no es del usuario es 403, no un tenant vacio", async () => {
  const response = await server.app.request("/api/agent", {
    headers: auth(signHs256({ sub: "supa-user-1", tenant: "empresa-ajena" })),
  });
  assert.equal(response.status, 403);
});

test("pedir otro tenant en la query sigue siendo 403", async () => {
  const response = await server.app.request("/api/agent?tenantId=otra-empresa", {
    headers: auth(signHs256({ sub: "supa-user-1", tenant: "agntia" })),
  });
  assert.equal(response.status, 403);
});

test("RS256 con JWKS: entra si el kid coincide y rechaza con otra clave", async () => {
  clearJwksCache();
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwk = { ...publicKey.export({ format: "jwk" }), kid: "key-1", alg: "RS256" };
  const jwks = { keys: [jwk] };
  const jwksUrl = "https://project.supabase.co/auth/v1/.well-known/jwks.json";
  const fetchImpl = (async () =>
    new Response(JSON.stringify(jwks), {
      status: 200,
      headers: { "content-type": "application/json" },
    })) as unknown as typeof fetch;

  const config = testConfig({
    dataDir: directory,
    authProvider: "supabase",
    supabaseUrl: "https://project.supabase.co",
  });
  const rs = await createApp(db, config);
  // El middleware lee la config del proceso; para el test se inyecta el fetch
  // montando el mismo middleware en una app Hono con opciones explicitas.
  const { verifyJwtMiddleware } = await import("../apps/server/src/engine/auth/jwt.ts");
  const { ActorService } = await import("../apps/server/src/engine/actors/service.ts");
  const { Hono } = await import("hono");
  const users = new UserService(db);
  const app = new Hono();
  // El app real mapea AppError a su status; el Hono desnudo del test necesita lo
  // mismo o un 401 se convierte en 500.
  app.onError((error, c) =>
    c.json(
      { error: error.message },
      (error as { status?: number }).status === undefined
        ? 500
        : ((error as { status?: number }).status as 400),
    ),
  );
  app.use(
    "/api/*",
    verifyJwtMiddleware({
      actorService: new ActorService({ users, tenants }),
      jwksUrl,
      audience: "authenticated",
      fetchImpl,
    }),
  );
  // Hono generico: sin declarar Variables, c.get exige una clave tipada.
  app.get("/api/whoami", (c) =>
    c.json({ actor: (c as unknown as { get: (k: string) => unknown }).get("actor") }),
  );

  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT", kid: "key-1" }));
  const payload = b64url(
    JSON.stringify({
      iss: "https://project.supabase.co/auth/v1",
      aud: "authenticated",
      exp: Math.floor(Date.now() / 1000) + 600,
      sub: "supa-user-1",
      app_metadata: { tenant_id: "agntia" },
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  const signed = `${header}.${payload}.${b64url(signer.sign(privateKey))}`;

  const ok = await app.request("/api/whoami", { headers: auth(signed) });
  assert.equal(ok.status, 200);
  assert.equal(((await ok.json()) as { actor: { tenantId: string } }).actor.tenantId, "agntia");

  const other = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const badSigner = createSign("RSA-SHA256");
  badSigner.update(`${header}.${payload}`);
  const bad = `${header}.${payload}.${b64url(badSigner.sign(other.privateKey))}`;
  assert.equal((await app.request("/api/whoami", { headers: auth(bad) })).status, 401);

  // JWKS inalcanzable: 503, nunca "pasa sin verificar".
  const broken = new Hono();
  broken.onError((error, c) =>
    c.json(
      { error: error.message },
      (error as { status?: number }).status === undefined
        ? 500
        : ((error as { status?: number }).status as 400),
    ),
  );
  broken.use(
    "/api/*",
    verifyJwtMiddleware({
      actorService: new ActorService({ users, tenants }),
      jwksUrl: "https://project.supabase.co/auth/v1/.well-known/jwks.json",
      audience: "authenticated",
      fetchImpl: (async () => new Response("nope", { status: 500 })) as unknown as typeof fetch,
    }),
  );
  broken.get("/api/whoami", (c) => c.json({ ok: true }));
  clearJwksCache();
  assert.equal((await broken.request("/api/whoami", { headers: auth(signed) })).status, 503);
  await rs.agent.stop();
});
