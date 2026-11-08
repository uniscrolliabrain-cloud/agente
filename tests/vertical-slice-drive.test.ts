// VERTICAL_SLICE_DRIVE_TEST_V1 - fuentes de Drive y ciclo de indexacion (campana 12).
//
// Cierre de campana:
//   - leer un documento no lo indexa; seleccionarlo si, y sobrevive al reinicio;
//   - la reingesta sustituye la revision anterior (ni chunks viejos ni citas viejas);
//   - revocar la conexion retira los chunks y B sigue con los suyos;
//   - un fallo de lectura queda observable y el reintento lo resuelve;
//   - "sin coincidencias" y "busqueda degradada" no son el mismo resultado.

import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import type { Auth } from "../apps/server/src/auth.ts";
import type { Config } from "../apps/server/src/config.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { RagService } from "../apps/server/src/engine/rag.ts";
import { Files } from "../apps/server/src/files.ts";
import { GoogleAuth } from "../apps/server/src/google-auth.ts";
import { currentTenantScope, runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import { WorkspaceService } from "../apps/server/src/workspace.ts";
import { encryptSecret } from "../packages/integrations/src/vault.ts";
import { testConfig } from "./helpers/config.ts";

const A = { tenantId: "agencia-a", actorId: "fundador-a" };
const B = { tenantId: "agencia-b", actorId: "fundador-b" };
const MIME_DOC = "application/vnd.google-apps.document";

interface DriveDoc {
  name: string;
  modifiedTime: string;
  text: string;
  fail?: boolean;
}

/** Stub de embeddings: solo el texto con la cifra nueva se alinea con la consulta "4800". */
function vectorFor(text: string) {
  return text.includes("4800") ? [1, 0] : [0, 1];
}

async function harness(t: TestContext, docs: Map<string, DriveDoc>) {
  const directory = await mkdtemp(join(tmpdir(), "openmuse-drive-"));
  const dataDir = join(directory, "db");
  const db: Store = await createStore({ dataDir });
  t.after(async () => {
    try {
      await db.close();
    } catch {
      // El test pudo cerrarla para simular un reinicio.
    }
    await rm(directory, { recursive: true, force: true });
  });
  const config: Config = testConfig({
    dataDir: directory,
    mode: "live",
    agentBackend: "model",
    googleClientId: "synthetic-client",
    googleClientSecret: "synthetic-secret",
    encryptionKey: randomBytes(32).toString("base64"),
  });
  const tdb = new TenantScopedStore(db, async () => currentTenantScope()?.tenantId ?? "default");
  const auth = new GoogleAuth(tdb, config, db);
  const rag = new RagService(tdb);
  const files = new Files(tdb, config, {
    sign: (_owner: string, path: string) => path,
  } as unknown as Auth);
  const workspace = new WorkspaceService(tdb, config, files, auth, rag);

  const previousKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";
  t.after(() => {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  });

  t.mock.method(
    globalThis,
    "fetch",
    async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(String(input));
      if (url.hostname === "generativelanguage.googleapis.com") {
        const body = JSON.parse(String(init?.body ?? "{}")) as {
          content?: { parts?: { text?: string }[] };
        };
        return Response.json({
          embedding: { values: vectorFor(body.content?.parts?.[0]?.text ?? "") },
        });
      }
      if (url.hostname === "oauth2.googleapis.com")
        return Response.json({ access_token: "refreshed", expires_in: 3600 });
      const exportMatch = url.pathname.match(/files\/([^/]+)\/export/);
      const id = decodeURIComponent(exportMatch?.[1] ?? url.pathname.split("/").pop() ?? "");
      const doc = docs.get(id);
      if (!doc) return new Response("not found", { status: 404 });
      if (exportMatch) {
        if (doc.fail) return new Response("drive unavailable", { status: 500 });
        return new Response(doc.text);
      }
      return Response.json({
        id,
        name: doc.name,
        mimeType: MIME_DOC,
        modifiedTime: doc.modifiedTime,
      });
    },
  );

  return { db, dataDir, config, tdb, auth, rag, workspace };
}

/** Credencial ya consentida: el ciclo OAuth se acredita en la campana 11. */
async function seedConnection(
  tdb: TenantScopedStore,
  config: Config,
  scope: typeof A,
  connectionId: string,
) {
  const key = config.encryptionKey;
  assert.ok(key);
  const tokens = {
    connectionId,
    accessToken: `access-${connectionId}`,
    refreshToken: `refresh-${connectionId}`,
    expiresAt: Date.now() + 3600_000,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    account: `${scope.actorId}@agencia.test`,
    tenantId: scope.tenantId,
    authorizer: scope.actorId,
    provider: "google" as const,
    connectedAt: new Date().toISOString(),
  };
  await runInTenantScope(scope, () =>
    tdb.put(scope.actorId, "credentials", {
      id: "google",
      connectionId,
      generation: `generation-${connectionId}`,
      tenantId: scope.tenantId,
      provider: "google",
      secret: encryptSecret(JSON.stringify(tokens), key),
    }),
  );
}

test("leer no indexa; seleccionar indexa el documento corto y sobrevive al reinicio", async (t) => {
  const docs = new Map<string, DriveDoc>([
    [
      "doc-corto",
      {
        name: "Acta corta",
        modifiedTime: "2026-11-01T10:00:00Z",
        text: "Presupuesto anual aprobado: 1.200 EUR.",
      },
    ],
  ]);
  const { db, dataDir, tdb, config, rag, workspace } = await harness(t, docs);
  await seedConnection(tdb, config, A, "conn-a");

  await runInTenantScope(A, async () => {
    const read = await workspace.readDriveFile(A.actorId, "doc-corto");
    assert.equal(read.text, docs.get("doc-corto")!.text);
    assert.equal((await rag.stats(A.actorId)).chunks, 0, "leer no debe indexar");

    const indexed = await workspace.indexDriveFile(A.actorId, "doc-corto");
    assert.equal(indexed.status, "indexed");
    assert.equal(indexed.kind, "drive");
    assert.equal(indexed.chunks, 1, "el documento corto se guarda entero");
    assert.equal(indexed.connectionId, "conn-a");
    assert.equal(indexed.revision, "2026-11-01T10:00:00Z");

    const again = await workspace.indexDriveFile(A.actorId, "doc-corto");
    assert.equal(again.unchanged, true, "la misma revision no se reindexa");
    assert.equal(again.attempts, 1);

    const hits = await rag.search(A.actorId, "presupuesto anual", 5);
    assert.equal(hits.length, 1);
    assert.equal(hits[0].sourceId, "drive:doc-corto");
    assert.equal(hits[0].verified, true);
    assert.equal(hits[0].revision, "2026-11-01T10:00:00Z");
  });

  // Reinicio: procesos nuevos sobre el mismo almacenamiento.
  await db.close();
  const reopened = await createStore({ dataDir });
  try {
    const tdb2 = new TenantScopedStore(
      reopened,
      async () => currentTenantScope()?.tenantId ?? "default",
    );
    const rag2 = new RagService(tdb2);
    const hits = await runInTenantScope(A, () => rag2.search(A.actorId, "presupuesto anual", 5));
    assert.equal(hits.length, 1, "el indice persiste tras reiniciar");
    assert.equal(hits[0].text, docs.get("doc-corto")!.text);
  } finally {
    await reopened.close();
  }
});

test("actualizar el documento sustituye la revision y el resultado cambia", async (t) => {
  const docs = new Map<string, DriveDoc>([
    [
      "doc-largo",
      {
        name: "Informe",
        modifiedTime: "2026-11-01T10:00:00Z",
        text: `${"contexto antiguo del trimestre. ".repeat(60)}\n\n${"cifras antiguas 1.200. ".repeat(60)}`,
      },
    ],
  ]);
  const { tdb, config, rag, workspace } = await harness(t, docs);
  await seedConnection(tdb, config, A, "conn-a");

  await runInTenantScope(A, async () => {
    const first = await workspace.indexDriveFile(A.actorId, "doc-largo");
    assert.ok(first.chunks > 1, `esperaba varios chunks, hubo ${first.chunks}`);
    assert.equal((await rag.search(A.actorId, "antiguo", 5)).length > 0, true);

    docs.set("doc-largo", {
      name: "Informe",
      modifiedTime: "2026-11-02T09:00:00Z",
      text: "Resumen revisado: presupuesto 4800 EUR.",
    });
    const second = await workspace.indexDriveFile(A.actorId, "doc-largo");
    assert.equal(second.revision, "2026-11-02T09:00:00Z");
    assert.equal(second.chunks, 1);
    assert.equal(second.attempts, 2, "el reintento se cuenta");

    assert.equal((await rag.stats(A.actorId)).chunks, 1, "no quedan chunks de la revision vieja");
    assert.equal((await rag.search(A.actorId, "antiguo", 5)).length, 0);
    const hits = await rag.search(A.actorId, "4800", 5);
    assert.equal(hits.length, 1);
    assert.equal(hits[0].revision, "2026-11-02T09:00:00Z");
  });
});

test("revocar la conexion de A retira sus chunks y B conserva los suyos", async (t) => {
  const docs = new Map<string, DriveDoc>([
    ["doc-a", { name: "Acta A", modifiedTime: "2026-11-01T10:00:00Z", text: "Acta de A: 4800." }],
    ["doc-b", { name: "Acta B", modifiedTime: "2026-11-01T10:00:00Z", text: "Acta de B: 4800." }],
  ]);
  const { tdb, config, auth, rag, workspace } = await harness(t, docs);
  await seedConnection(tdb, config, A, "conn-a");
  await seedConnection(tdb, config, B, "conn-b");

  await runInTenantScope(A, () => workspace.indexDriveFile(A.actorId, "doc-a"));
  await runInTenantScope(B, () => workspace.indexDriveFile(B.actorId, "doc-b"));

  await runInTenantScope(A, () => auth.disconnect(A.actorId));

  await runInTenantScope(A, async () => {
    assert.deepEqual(await workspace.driveSources(A.actorId), [], "sin conexion no hay fuentes");
    assert.equal((await rag.search(A.actorId, "4800", 5)).length, 0, "A ya no cita el documento");
    assert.equal((await rag.stats(A.actorId)).chunks, 0);
  });
  await runInTenantScope(B, async () => {
    const sources = await workspace.driveSources(B.actorId);
    assert.equal(sources.length, 1);
    assert.equal(sources[0].connectionId, "conn-b");
    assert.equal((await rag.search(B.actorId, "4800", 5)).length, 1);
  });
});

test("un fallo de indexacion queda observable y el reintento lo resuelve", async (t) => {
  const docs = new Map<string, DriveDoc>([
    [
      "doc-fallo",
      { name: "Propuesta", modifiedTime: "2026-11-01T10:00:00Z", text: "Propuesta 4800.", fail: true },
    ],
  ]);
  const { tdb, config, rag, workspace } = await harness(t, docs);
  await seedConnection(tdb, config, A, "conn-a");

  await runInTenantScope(A, async () => {
    await assert.rejects(workspace.indexDriveFile(A.actorId, "doc-fallo"));
    const [failed] = await workspace.driveSources(A.actorId);
    assert.ok(failed, "el intento fallido queda registrado");
    assert.equal(failed.status, "failed");
    assert.equal(failed.attempts, 1);
    assert.ok(failed.error);
    assert.equal((await rag.search(A.actorId, "4800", 5)).length, 0, "no se cita lo no verificado");

    docs.set("doc-fallo", {
      name: "Propuesta",
      modifiedTime: "2026-11-01T10:00:00Z",
      text: "Propuesta 4800.",
    });
    const retried = await workspace.indexDriveFile(A.actorId, "doc-fallo");
    assert.equal(retried.status, "indexed");
    assert.equal(retried.attempts, 2);
    assert.equal((await rag.search(A.actorId, "4800", 5)).length, 1);

    // Retirar el documento del indice tambien deja de citarlo.
    await workspace.forgetDriveSource(A.actorId, "doc-fallo");
    assert.deepEqual(await workspace.driveSources(A.actorId), []);
    const report = await rag.searchReport(A.actorId, "4800", 5);
    assert.equal(report.status, "no_match");
    assert.equal(report.degraded, false);
  });

  // Sin vector la busqueda queda degradada, y eso no es "sin coincidencias".
  await runInTenantScope(A, async () => {
    await workspace.indexDriveFile(A.actorId, "doc-fallo");
    delete process.env.GEMINI_API_KEY;
    const degraded = await rag.searchReport(A.actorId, "4800", 5);
    assert.equal(degraded.degraded, true, "sin embeddings el vector no se calcula");
    assert.equal(degraded.status, "ok", "la palabra clave sigue encontrando la fuente");
  });
});
