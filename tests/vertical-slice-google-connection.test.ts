// VERTICAL_SLICE_GOOGLE_CONNECTION_TEST_V1 - conexion operativa Google (campana 11).
//
// Cierre de campana:
//   - dos empresas registran conexiones distintas con tenant, cuenta, scopes y autorizante;
//   - el consentimiento pide minimo privilegio (sin escritura si no se pide);
//   - revocar la membership durante el callback o antes del refresco invalida la operacion;
//   - una credencial sin atribucion no se adopta como conexion de la empresa.

import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test, type TestContext } from "node:test";
import type { Config } from "../apps/server/src/config.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { GoogleAuth } from "../apps/server/src/google-auth.ts";
import { currentTenantScope, runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import { encryptSecret } from "../packages/integrations/src/vault.ts";
import { testConfig } from "./helpers/config.ts";

const A = { tenantId: "agencia-a", actorId: "fundador-a" };
const B = { tenantId: "agencia-b", actorId: "fundador-b" };

async function harness(t: TestContext, members: Set<string>) {
  const db: Store = await createStore();
  t.after(() => db.close());
  const config: Config = testConfig({
    mode: "live",
    agentBackend: "model",
    googleClientId: "synthetic-client",
    googleClientSecret: "synthetic-secret",
    encryptionKey: randomBytes(32).toString("base64"),
  });
  const tdb = new TenantScopedStore(db, async () => currentTenantScope()?.tenantId ?? "default");
  const auth = new GoogleAuth(tdb, config, db, {
    membership: async (actorId, tenantId) => members.has(`${tenantId}:${actorId}`),
  });
  return { db, config, tdb, auth };
}

function mockGoogleFetch(t: TestContext, options: { expiresIn?: number } = {}) {
  return t.mock.method(
    globalThis,
    "fetch",
    async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("oauth2.googleapis.com/token")) {
        const form = new URLSearchParams(String(init?.body ?? ""));
        const code = form.get("code") ?? "refresh";
        return Response.json({
          access_token: `access-${code}`,
          refresh_token: `refresh-${code}`,
          expires_in: options.expiresIn ?? 3600,
          scope: [
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/drive.readonly",
          ].join(" "),
        });
      }
      if (url.includes("/revoke")) return new Response(null, { status: 200 });
      const authorization = new Headers(init?.headers).get("authorization") ?? "";
      const code = authorization.replace(/^Bearer access-/, "");
      return Response.json({ emailAddress: `${code}@agencia.test` });
    },
  );
}

async function connectAndCallback(auth: GoogleAuth, scope: typeof A, code: string) {
  const { url } = await runInTenantScope(scope, () => auth.connect(scope.actorId, false));
  const state = new URL(url).searchParams.get("state");
  assert.ok(state);
  await auth.callback(state, code);
  return state;
}

test("dos empresas registran conexiones distintas con tenant, cuenta, scopes y autorizante", async (t) => {
  const { auth } = await harness(t, new Set(["agencia-a:fundador-a", "agencia-b:fundador-b"]));
  mockGoogleFetch(t);

  await connectAndCallback(auth, A, "code-a");
  await connectAndCallback(auth, B, "code-b");

  const connectionA = await runInTenantScope(A, () => auth.connection("fundador-a"));
  const connectionB = await runInTenantScope(B, () => auth.connection("fundador-b"));
  assert.ok(connectionA, "A debe tener su conexion");
  assert.ok(connectionB, "B debe tener su conexion");

  assert.equal(connectionA.tenantId, "agencia-a");
  assert.equal(connectionA.provider, "google");
  assert.equal(connectionA.account, "code-a@agencia.test");
  assert.equal(connectionA.authorizer, "fundador-a");
  assert.ok(connectionA.scopes.includes("https://www.googleapis.com/auth/gmail.readonly"));
  assert.equal(connectionA.write, false);
  assert.ok(connectionA.generation, "la generacion queda registrada");
  assert.ok(connectionA.connectedAt);

  assert.equal(connectionB.tenantId, "agencia-b");
  assert.equal(connectionB.account, "code-b@agencia.test");
  assert.equal(connectionB.authorizer, "fundador-b");
  // Dos conexiones distintas: ni el id de conexion ni la generacion se comparten.
  assert.notEqual(connectionA.id, connectionB.id);
  assert.notEqual(connectionA.generation, connectionB.generation);

  // Aunque el id del actor coincida, cada empresa lee solo su credencial.
  assert.equal(await runInTenantScope(B, () => auth.tokens("fundador-a")), null);
  assert.ok(await runInTenantScope(A, () => auth.tokens("fundador-a")));
});

test("el consentimiento pide solo lectura salvo que la operacion pida escritura", async (t) => {
  const { auth } = await harness(t, new Set(["agencia-a:fundador-a"]));

  const read = new URL((await runInTenantScope(A, () => auth.connect("fundador-a", false))).url);
  const readScopes = (read.searchParams.get("scope") ?? "").split(" ");
  assert.ok(readScopes.includes("https://www.googleapis.com/auth/gmail.readonly"));
  assert.ok(readScopes.includes("https://www.googleapis.com/auth/drive.readonly"));
  assert.ok(!readScopes.includes("https://mail.google.com/"));
  assert.ok(!readScopes.includes("https://www.googleapis.com/auth/gmail.send"));
  assert.equal(read.searchParams.get("code_challenge_method"), "S256");
  assert.equal(read.searchParams.get("access_type"), "offline");
  assert.ok(read.searchParams.get("code_challenge"));

  const write = new URL((await runInTenantScope(A, () => auth.connect("fundador-a", true))).url);
  const writeScopes = (write.searchParams.get("scope") ?? "").split(" ");
  assert.ok(writeScopes.includes("https://mail.google.com/"));
  assert.ok(writeScopes.includes("https://www.googleapis.com/auth/gmail.send"));
});

test("revocar la membership durante el callback no escribe la credencial", async (t) => {
  const members = new Set(["agencia-a:fundador-a"]);
  const { auth } = await harness(t, members);
  const fetchMock = mockGoogleFetch(t);

  const { url } = await runInTenantScope(A, () => auth.connect("fundador-a", false));
  const state = new URL(url).searchParams.get("state");
  assert.ok(state);
  members.delete("agencia-a:fundador-a");

  await assert.rejects(auth.callback(state, "code-a"), /company|belong/i);
  assert.equal(fetchMock.mock.callCount(), 0, "no debe canjear el codigo en Google");
  assert.equal(await runInTenantScope(A, () => auth.tokens("fundador-a")), null);
});

test("revocar la membership corta el refresco de una conexion establecida", async (t) => {
  const members = new Set(["agencia-a:fundador-a"]);
  const { auth } = await harness(t, members);
  // expires_in 0 fuerza el camino de refresco en el siguiente acceso.
  const fetchMock = mockGoogleFetch(t, { expiresIn: 0 });

  await connectAndCallback(auth, A, "code-a");
  const callsAfterConnect = fetchMock.mock.callCount();
  members.delete("agencia-a:fundador-a");

  await assert.rejects(
    runInTenantScope(A, () => auth.accessToken("fundador-a")),
    /company|belong/i,
  );
  assert.equal(fetchMock.mock.callCount(), callsAfterConnect, "no debe pedir refresh a Google");

  // Desconectar siempre corta localmente, aunque la membership ya no exista.
  await runInTenantScope(A, () => auth.disconnect("fundador-a"));
  assert.equal(await runInTenantScope(A, () => auth.tokens("fundador-a")), null);
});

test("una credencial sin atribucion no se adopta como conexion de la empresa", async (t) => {
  const { auth, config, tdb } = await harness(t, new Set(["agencia-a:fundador-a"]));
  const key = config.encryptionKey;
  assert.ok(key);
  const legacy = {
    connectionId: "legacy-connection",
    accessToken: "legacy-access",
    refreshToken: "legacy-refresh",
    expiresAt: Date.now() + 3600_000,
    scopes: ["https://www.googleapis.com/auth/gmail.readonly"],
    account: "legacy@example.com",
  };
  await runInTenantScope(A, () =>
    tdb.put("fundador-a", "credentials", {
      id: "google",
      connectionId: legacy.connectionId,
      secret: encryptSecret(JSON.stringify(legacy), key),
    }),
  );

  const legacyConnection = await runInTenantScope(A, () => auth.connection("fundador-a"));
  assert.ok(legacyConnection);
  assert.equal(legacyConnection.tenantId, null, "sin atribucion no se inventa la empresa");
  assert.equal(legacyConnection.generation, null);
  assert.equal(legacyConnection.authorizer, "fundador-a");

  // Un consentimiento nuevo la atribuye a la empresa donde se pidio.
  mockGoogleFetch(t);
  await connectAndCallback(auth, A, "code-a");
  const attributed = await runInTenantScope(A, () => auth.connection("fundador-a"));
  assert.ok(attributed);
  assert.equal(attributed.tenantId, "agencia-a");
  assert.ok(attributed.generation);
  assert.equal(attributed.account, "code-a@agencia.test");
});
