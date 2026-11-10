// TENANT_ACME_ISOLATION_V1 - E05 de la campaña ACME.
//
// Cubre los cinco casos del plan. El quinto se escribe ya contra la ruta real
// y queda marcado `todo` hasta E15, que es cuando existe el módulo de workspace
// `acme-obras`; mientras tanto el cuerpo comprueba el envelope por el mismo
// adapter que usará la ruta, así que el contrato no espera a la UI.
//
// Diferencia deliberada con el texto del plan: `NO_MEMBERSHIP` es el código del
// camino de sesión (single-tenant); en el camino JWT el mismo hecho ("claim de
// un tenant del que no es miembro") lo corta antes ActorService con 403, y lo
// que aquí se exige es que ese 403 no cree la membership de `acme` por la
// espalda. El alta canónica es E06, no un efecto colateral del token.

import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { adaptWorkspaceView } from "../apps/server/src/engine/views/workspace-adapter.ts";
import { currentTenantScope, runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import { UserService } from "../apps/server/src/users.ts";
import type { WorkspaceViewDeclaration } from "../packages/workspaces/src/contracts/index.ts";
import { testConfig } from "./helpers/config.ts";

const SECRET = "test-supabase-jwt-secret-acme-at-least-32-chars";
const ACME = "acme";
const OTRO = "acme-otro";

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
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
  const signature = b64url(createHmac("sha256", SECRET).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${signature}`;
}

let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;
let tenants: TenantService;
let directory: string;
let forasteroId: string;
let acmeUserId: string;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "agente-acme-"));
  db = await createStore({ dataDir: join(directory, "db") });
  const config = testConfig({
    dataDir: directory,
    mode: "live",
    authProvider: "supabase",
    supabaseJwtSecret: SECRET,
  });
  server = await createApp(db, config);
  tenants = new TenantService(db, config);
  const users = new UserService(db);
  // Usuario que ya pertenece a otra empresa: su claim a `acme` debe cortarse.
  const forastero = await users.create({
    email: "marta@acme-otro.local",
    name: "Marta",
    password: "contrasena-larga-1",
    role: "admin",
    authProviderId: "supa-acme-forastero",
  });
  forasteroId = forastero.id;
  await tenants.addMembership(forasteroId, OTRO, "admin");
  // Usuario con membership real en acme, para el caso 5 (hasta E15 en `todo`).
  const acmeUser = await users.create({
    email: "carlos@acme-obras.es",
    name: "Carlos",
    password: "contrasena-larga-2",
    role: "admin",
    authProviderId: "supa-acme-carlos",
  });
  acmeUserId = acmeUser.id;
  await tenants.addMembership(acmeUserId, ACME, "owner");
});

after(async () => {
  await server.agent.stop();
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

test("caso 1: un claim a acme sin membership se corta con 403 y no crea la membership", async () => {
  const response = await server.app.request("/api/agent", {
    headers: bearer(signJwt("supa-acme-forastero", ACME)),
  });
  assert.equal(response.status, 403);
  const memberships = await tenants.membershipsFor(forasteroId);
  assert.deepEqual(
    memberships.map((m) => m.tenantId),
    [OTRO],
    "el token no puede dar de alta acme: eso es E06",
  );
});

test("caso 2: pedir X-Tenant-Id: acme con sesión de otra empresa es 403 TENANT_MISMATCH", async () => {
  const response = await server.app.request("/api/agent", {
    headers: { ...bearer(signJwt("supa-acme-forastero", OTRO)), "X-Tenant-Id": ACME },
  });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "tenant mismatch", code: "TENANT_MISMATCH" });
});

test("caso 3: una fila escrita en acme no aparece al listar default del mismo owner", async () => {
  const scoped = new TenantScopedStore(db, async () => currentTenantScope()!.tenantId);
  const owner = "acme-admin";
  await runInTenantScope({ tenantId: ACME, actorId: owner }, () =>
    scoped.put(owner, "tasks", { id: "t1", title: "Presupuesto Calle Colón" }),
  );
  await runInTenantScope({ tenantId: "default", actorId: owner }, () =>
    scoped.put(owner, "tasks", { id: "t1", title: "Otra cosa" }),
  );

  const enAcme = await runInTenantScope({ tenantId: ACME, actorId: owner }, () =>
    scoped.list<{ title: string }>(owner, "tasks"),
  );
  const enDefault = await runInTenantScope({ tenantId: "default", actorId: owner }, () =>
    scoped.list<{ title: string }>(owner, "tasks"),
  );
  assert.deepEqual(enAcme.map((r) => r.title), ["Presupuesto Calle Colón"]);
  assert.deepEqual(enDefault.map((r) => r.title), ["Otra cosa"]);

  // La clave física de acme existe y la de default no la ve.
  const rawAcme = await db.get<{ title: string }>(`${ACME}:${owner}`, "tasks", "t1");
  const rawDefault = await db.get<{ title: string }>(`default:${owner}`, "tasks", "t1");
  assert.equal(rawAcme?.title, "Presupuesto Calle Colón");
  assert.equal(rawDefault?.title, "Otra cosa");
});

test("caso 4: scanByPrefix de acme no devuelve filas de default", async () => {
  const scoped = new TenantScopedStore(db, async () => currentTenantScope()!.tenantId);
  await runInTenantScope({ tenantId: ACME, actorId: "acme-marta" }, () =>
    scoped.put("acme-marta", "tasks", { id: "t2", title: "Revisar pliego" }),
  );
  await runInTenantScope({ tenantId: "default", actorId: "acme-marta" }, () =>
    scoped.put("acme-marta", "tasks", { id: "t2", title: "Ruido de default" }),
  );

  const filas = await scoped.scanByPrefix<{ title: string }>("tasks", ACME);
  const titulos = filas.map((fila) => fila.value.title);
  assert.ok(titulos.includes("Presupuesto Calle Colón"));
  assert.ok(titulos.includes("Revisar pliego"));
  assert.ok(!titulos.includes("Ruido de default"));
  assert.ok(filas.every((fila) => fila.owner === "acme-admin" || fila.owner === "acme-marta"));
});

const vistaAcme: WorkspaceViewDeclaration = {
  id: "obras",
  intent: "obras en curso",
  kind: "board",
  title: "Obras en curso",
  query: "obras.list",
  actions: [],
};

test("caso 5: el envelope de una vista ACME lleva tenantId y provenance de acme", async () => {
  const view = adaptWorkspaceView({
    tenantId: ACME,
    workspaceId: "acme-obras",
    declaration: vistaAcme,
    result: {
      status: "ok",
      items: [{ id: "obra-014", name: "Reforma Calle Colón 14", status: "active" }],
      total: 1,
    },
    now: new Date("2026-11-10T10:00:00.000Z"),
  });
  assert.ok(view, "el adapter debe normalizar la vista");
  assert.equal(view.tenantId, ACME);
  assert.equal(view.id, "acme-obras:obras");
  assert.equal(view.source.provider, "workspace");
  assert.equal(view.source.workspaceId, "acme-obras");
  assert.equal(view.provenance[0]?.ref, "acme-obras/obras.list");
  assert.equal(view.provenance[0]?.asOf, "2026-11-10T10:00:00.000Z");
});

test("caso 5b: POST /api/workspaces/acme-obras/view devuelve el envelope de acme", async () => {
    const response = await server.app.request("/api/workspaces/acme-obras/view", {
      method: "POST",
      headers: { ...bearer(signJwt("supa-acme-carlos", ACME)), "Content-Type": "application/json" },
      body: JSON.stringify({ viewId: "tablero" }),
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-tenant-id"), ACME);
    const { view } = (await response.json()) as { view: { tenantId: string; id: string } };
    assert.equal(view.tenantId, ACME);
    assert.equal(view.id, "acme-obras:tablero");
  },
);
