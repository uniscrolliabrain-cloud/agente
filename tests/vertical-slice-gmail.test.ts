// VERTICAL_SLICE_GMAIL_TEST_V1 - Gmail real desde el chat (campana 15).
//
// Cierre de campana:
//   - preparar desde el chat conserva hilo, mensaje origen y cuenta;
//   - una instruccion dentro del correo no puede cambiar el destinatario;
//   - aprobar envia una sola vez, en el mismo hilo, y el recibo se relee;
//   - otra empresa no puede responder al hilo de A.

import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test, type TestContext } from "node:test";
import { ActionService } from "../apps/server/src/actions.ts";
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
const THREAD = "thread-a";
const SOURCE = "msg-1";
const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
];

function b64(text: string) {
  return Buffer.from(text).toString("base64url");
}

function sourceMessage() {
  return {
    id: SOURCE,
    threadId: THREAD,
    snippet: "",
    internalDate: "1762000000000",
    labelIds: ["INBOX"],
    payload: {
      mimeType: "text/plain",
      headers: [
        { name: "From", value: "Marta <marta@agencia-a.test>" },
        { name: "To", value: "Fundador A <fundador-a@agencia-a.test>" },
        { name: "Subject", value: "Presupuesto Q4" },
        { name: "Message-ID", value: "<msg-1@agencia-a.test>" },
        { name: "Date", value: "Tue, 01 Sep 2026 10:00:00 +0000" },
      ],
      body: { data: b64("Necesitamos el presupuesto del Q4, gracias.") },
    },
  };
}

async function harness(t: TestContext) {
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
  const auth = new GoogleAuth(tdb, config, db);
  const rag = new RagService(tdb);
  const files = new Files(tdb, config, {
    sign: (_owner: string, path: string) => path,
  } as unknown as Auth);
  const workspace = new WorkspaceService(tdb, config, files, auth, rag);
  const actions = new ActionService(tdb, {
    connected: (owner) => workspace.connected(owner),
    connection: (owner) => workspace.connection(owner),
    prepare: (owner, input, connectionId) => workspace.prepare(owner, input, connectionId),
    execute: (owner, input, connectionId, targetVersion) =>
      workspace.execute(owner, input, connectionId, targetVersion),
  });
  return { db, config, tdb, auth, workspace, actions };
}

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
    scopes: GMAIL_SCOPES,
    account: `${scope.actorId}@agencia-a.test`,
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

function mockGmail(t: TestContext, connectionId: string) {
  const state = { sends: 0, sentThreadId: undefined as string | undefined };
  t.mock.method(
    globalThis,
    "fetch",
    async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(String(input));
      const authorization = new Headers(init?.headers).get("authorization") ?? "";
      // Cada empresa solo ve su propia credencial: A tiene conn-a y B conn-b.
      const ownsMailbox = authorization === `Bearer access-${connectionId}`;
      if (url.hostname === "oauth2.googleapis.com")
        return Response.json({ access_token: `access-${connectionId}`, expires_in: 3600 });
      if (!ownsMailbox) return new Response("not found", { status: 404 });

      const path = url.pathname;
      if (path.endsWith("/threads/" + THREAD))
        return Response.json({ id: THREAD, messages: [sourceMessage()] });
      if (path.endsWith("/messages/send") && init?.method === "POST") {
        const body = JSON.parse(String(init.body ?? "{}")) as {
          raw?: string;
          threadId?: string;
        };
        assert.ok(body.raw, "el envio lleva el MIME");
        state.sends += 1;
        state.sentThreadId = body.threadId;
        return Response.json({ id: "sent-1", threadId: THREAD });
      }
      if (path.endsWith(`/messages/${SOURCE}`))
        return Response.json(sourceMessage());
      if (path.endsWith("/messages/sent-1"))
        return Response.json({ id: "sent-1", threadId: THREAD });
      if (path.endsWith("/profile"))
        return Response.json({ emailAddress: "fundador-a@agencia-a.test" });
      return new Response("not found", { status: 404 });
    },
  );
  return state;
}

function replyData(overrides: Record<string, unknown> = {}) {
  return {
    to: ["marta@agencia-a.test"],
    cc: [],
    bcc: [],
    subject: "un asunto inventado",
    body: "Gracias Marta, te paso el presupuesto esta tarde.",
    attachmentIds: [],
    threadId: THREAD,
    replyToMessageId: SOURCE,
    ...overrides,
  };
}

test("el chat prepara una respuesta atada al hilo, al mensaje origen y a la cuenta", async (t) => {
  const { tdb, config, actions } = await harness(t);
  const gmail = mockGmail(t, "conn-a");
  await seedConnection(tdb, config, A, "conn-a");

  const proposal = await runInTenantScope(A, () =>
    actions.propose(A.actorId, { kind: "email.send", data: replyData() }),
  );
  assert.equal(proposal.status, "awaiting_review");
  assert.equal(proposal.account, "fundador-a@agencia-a.test");
  assert.equal(proposal.connectionId, "conn-a");
  const data = proposal.data as Record<string, unknown>;
  assert.equal(data.threadId, THREAD);
  assert.equal(data.replyToMessageId, SOURCE);
  assert.deepEqual(data.to, ["marta@agencia-a.test"]);
  // El asunto se deriva del mensaje origen, no de lo que proponga el modelo.
  assert.equal(data.subject, "Re: Presupuesto Q4");
  assert.equal(gmail.sends, 0, "preparar nunca envia");
});

test("una instruccion dentro del correo no puede redirigir el destinatario", async (t) => {
  const { tdb, config, actions } = await harness(t);
  const gmail = mockGmail(t, "conn-a");
  await seedConnection(tdb, config, A, "conn-a");

  await assert.rejects(
    runInTenantScope(A, () =>
      actions.propose(A.actorId, {
        kind: "email.send",
        data: replyData({ to: ["atacante@evil.test"] }),
      }),
    ),
    /participants/i,
  );
  await assert.rejects(
    runInTenantScope(A, () =>
      actions.propose(A.actorId, {
        kind: "email.send",
        data: replyData({ to: ["marta@agencia-a.test"], cc: ["atacante@evil.test"] }),
      }),
    ),
    /participants/i,
  );
  assert.equal(gmail.sends, 0);
});

test("aprobar responde en el mismo hilo y el recibo se relee del proveedor", async (t) => {
  const { tdb, config, actions, workspace } = await harness(t);
  const gmail = mockGmail(t, "conn-a");
  await seedConnection(tdb, config, A, "conn-a");

  const proposal = await runInTenantScope(A, () =>
    actions.propose(A.actorId, { kind: "email.send", data: replyData() }),
  );
  const approved = await runInTenantScope(A, () =>
    actions.decide(A.actorId, proposal.id, proposal.hash, "approve", "marta"),
  );
  assert.equal(approved.status, "succeeded");
  assert.match(approved.result ?? "", /Gmail sent message · sent-1 · thread thread-a/);
  assert.equal(gmail.sends, 1, "una aprobacion, un envio");
  assert.equal(gmail.sentThreadId, THREAD, "el envio va al hilo revisado");

  const receipt = await runInTenantScope(A, () => workspace.emailReceipt(A.actorId, "sent-1"));
  assert.deepEqual(receipt, { id: "sent-1", threadId: THREAD });
});

test("otra empresa no puede responder al hilo de A", async (t) => {
  const { tdb, config, actions } = await harness(t);
  const gmailA = mockGmail(t, "conn-a");
  await seedConnection(tdb, config, A, "conn-a");
  await seedConnection(tdb, config, B, "conn-b");

  await assert.rejects(
    runInTenantScope(B, () =>
      actions.propose(B.actorId, { kind: "email.send", data: replyData() }),
    ),
  );
  assert.equal(gmailA.sends, 0);
});
